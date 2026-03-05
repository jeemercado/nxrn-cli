#!/usr/bin/env ruby

require 'fileutils'
require 'pathname'
require 'rexml/document'
require 'rexml/formatters/pretty'
require 'rexml/xpath'
require 'xcodeproj'

def ensure_build_configuration(container, config_name, base_config_name)
  existing = container.build_configurations.find { |config| config.name == config_name }
  return :existing if existing

  base = container.build_configurations.find { |config| config.name == base_config_name }
  raise "Base configuration '#{base_config_name}' was not found." unless base

  duplicated = container.add_build_configuration(config_name, base.type)
  duplicated.base_configuration_reference = base.base_configuration_reference
  duplicated.build_settings = base.build_settings.dup
  :created
end

def upsert_scheme_user_defined_setting(container)
  updated = []
  scheme_by_config = {
    'Dev.Debug' => 'Dev',
    'Dev.Release' => 'Dev',
    'Debug' => 'Prod',
    'Release' => 'Prod'
  }
  bundle_id_suffix_by_config = {
    'Dev.Debug' => '.dev',
    'Dev.Release' => '.dev',
    'Debug' => '',
    'Release' => ''
  }

  container.build_configurations.each do |config|
    desired_scheme = scheme_by_config[config.name]
    desired_suffix = bundle_id_suffix_by_config[config.name]
    next unless desired_scheme

    if config.build_settings['SCHEME'] != desired_scheme
      config.build_settings['SCHEME'] = desired_scheme
      updated << "#{container.respond_to?(:name) ? container.name : 'Project'} #{config.name} SCHEME=#{desired_scheme}"
    end

    current_suffix = config.build_settings['BUNDLE_ID_SUFFIX'].to_s
    if current_suffix != desired_suffix
      if desired_suffix.empty?
        config.build_settings.delete('BUNDLE_ID_SUFFIX')
        updated << "#{container.respond_to?(:name) ? container.name : 'Project'} #{config.name} BUNDLE_ID_SUFFIX=<removed>"
      else
        config.build_settings['BUNDLE_ID_SUFFIX'] = desired_suffix
        updated << "#{container.respond_to?(:name) ? container.name : 'Project'} #{config.name} BUNDLE_ID_SUFFIX=#{desired_suffix}"
      end
    end
  end

  updated
end

def extract_base_bundle_identifier(app_target)
  candidate = app_target.build_configurations.map { |config| config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'].to_s.strip }
    .find { |value| !value.empty? && !value.include?('$(PRODUCT_NAME') }

  return nil if candidate.nil? || candidate.empty?

  candidate
    .gsub('$(BUNDLE_ID_SUFFIX)', '')
    .gsub(/\.dev\z/, '')
    .strip
end

def upsert_product_bundle_identifier(app_target, base_bundle_identifier)
  updated = []
  desired_by_config = {
    'Dev.Debug' => "#{base_bundle_identifier}$(BUNDLE_ID_SUFFIX)",
    'Dev.Release' => "#{base_bundle_identifier}$(BUNDLE_ID_SUFFIX)",
    'Debug' => "#{base_bundle_identifier}$(BUNDLE_ID_SUFFIX)",
    'Release' => "#{base_bundle_identifier}$(BUNDLE_ID_SUFFIX)"
  }

  app_target.build_configurations.each do |config|
    desired = desired_by_config[config.name]
    next unless desired
    next if config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] == desired

    config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = desired
    updated << "#{app_target.name} #{config.name} PRODUCT_BUNDLE_IDENTIFIER=#{desired}"
  end

  updated
end

def extract_base_product_name(app_target)
  candidate = app_target.build_configurations
    .map { |config| config.build_settings['PRODUCT_NAME'].to_s.strip }
    .find { |value| !value.empty? && value != '$(TARGET_NAME)' }

  return app_target.name if candidate.nil? || candidate.empty?

  candidate.gsub(/\s*-\s*Dev\z/, '').strip
end

def upsert_product_name(app_target, base_product_name)
  updated = []
  desired_by_config = {
    'Dev.Debug' => "#{base_product_name} - Dev",
    'Dev.Release' => "#{base_product_name} - Dev",
    'Debug' => base_product_name,
    'Release' => base_product_name
  }

  app_target.build_configurations.each do |config|
    desired = desired_by_config[config.name]
    next unless desired
    next if config.build_settings['PRODUCT_NAME'] == desired

    config.build_settings['PRODUCT_NAME'] = desired
    updated << "#{app_target.name} #{config.name} PRODUCT_NAME=#{desired}"
  end

  updated
end

def resolve_info_plist_paths(app_target, ios_dir, project_name)
  app_target.build_configurations.map { |config| config.build_settings['INFOPLIST_FILE'].to_s.strip }
    .reject(&:empty?)
    .map do |value|
      normalized = value.gsub('$(SRCROOT)', ios_dir).gsub('${SRCROOT}', ios_dir)
      normalized = normalized.gsub('$(PROJECT_NAME)', project_name).gsub('${PROJECT_NAME}', project_name)
      if Pathname.new(normalized).absolute?
        normalized
      else
        File.expand_path(normalized, ios_dir)
      end
    end
    .uniq
end

def upsert_info_plist_display_name(app_target, ios_dir, project_name)
  paths = resolve_info_plist_paths(app_target, ios_dir, project_name)
  updated = []

  paths.each do |path|
    next unless File.exist?(path)

    plist = Xcodeproj::Plist.read_from_path(path) || {}
    next if plist['CFBundleDisplayName'] == '$(PRODUCT_NAME)'

    plist['CFBundleDisplayName'] = '$(PRODUCT_NAME)'
    Xcodeproj::Plist.write_to_path(plist, path)
    updated << "Info.plist CFBundleDisplayName=$(PRODUCT_NAME) at #{path}"
  end

  updated
end

def upsert_info_plist_encryption_flag(app_target, ios_dir, project_name)
  paths = resolve_info_plist_paths(app_target, ios_dir, project_name)
  updated = []

  paths.each do |path|
    next unless File.exist?(path)

    plist = Xcodeproj::Plist.read_from_path(path) || {}
    next if plist['ITSAppUsesNonExemptEncryption'] == false

    plist['ITSAppUsesNonExemptEncryption'] = false
    Xcodeproj::Plist.write_to_path(plist, path)
    updated << "Info.plist ITSAppUsesNonExemptEncryption=false at #{path}"
  end

  updated
end

def update_scheme_configuration(doc, action_name, build_configuration)
  action = REXML::XPath.first(doc, "//#{action_name}")
  raise "Missing #{action_name} in source scheme." unless action

  action.attributes['buildConfiguration'] = build_configuration
end

def upsert_podfile_project_mapping(podfile_path, project_name)
  return :missing unless File.exist?(podfile_path)

  desired_block = <<~RUBY.chomp
    project '#{project_name}',
      'Dev.Debug' => :debug,
      'Dev.Release' => :release,
      'Debug' => :debug,
      'Release' => :release
  RUBY

  content = File.read(podfile_path)
  return :unchanged if content.include?(desired_block)

  updated = content.dup
  project_block_pattern = /project\s+'[^']+'\s*,\s*(?:\n\s*'[^']+'\s*=>\s*:\w+\s*,?)+/m

  if updated.match?(project_block_pattern)
    updated.sub!(project_block_pattern, desired_block)
  elsif updated.include?('prepare_react_native_project!')
    updated.sub!(/prepare_react_native_project!\s*\n+/) do
      "prepare_react_native_project!\n\n#{desired_block}\n\n"
    end
  else
    updated = "#{desired_block}\n\n#{updated}"
  end

  return :unchanged if updated == content

  File.write(podfile_path, updated)
  :updated
end

def upsert_firebase_environment_script_phase(app_target)
  phase_name = 'Setup Firebase Environment GoogleService-Info.plist'
  script_body = <<~'SCRIPT'.strip
    # Name of the resource we're selectively copying
    GOOGLESERVICE_INFO_PLIST=GoogleService-Info.plist
    # Get references to dev and prod versions of the GoogleService-Info.plist
    # NOTE: These should only live on the file system and should NOT be part of the target (since we'll be adding them to the target manually)
    GOOGLESERVICE_INFO_DEV=${PROJECT_DIR}/Firebase/Dev/${GOOGLESERVICE_INFO_PLIST}
    #GOOGLESERVICE_INFO_STAGING=${PROJECT_DIR}/Firebase/Staging/${GOOGLESERVICE_INFO_PLIST}
    GOOGLESERVICE_INFO_PROD=${PROJECT_DIR}/Firebase/Prod/${GOOGLESERVICE_INFO_PLIST}
    HAS_DEV_PLIST=false
    HAS_PROD_PLIST=false

    echo "Looking for ${GOOGLESERVICE_INFO_PLIST} in ${GOOGLESERVICE_INFO_DEV}"
    if [ -f "${GOOGLESERVICE_INFO_DEV}" ]
    then
    HAS_DEV_PLIST=true
    fi
    # Make sure the staging version of GoogleService-Info.plist exists
    # echo "Looking for ${GOOGLESERVICE_INFO_PLIST} in ${GOOGLESERVICE_INFO_STAGING}"
    # if [ ! -f $GOOGLESERVICE_INFO_STAGING ]
    # then
    # echo "No Staging GoogleService-Info.plist found. Please ensure it's in the proper directory."
    # exit 1
    # fi
    echo "Looking for ${GOOGLESERVICE_INFO_PLIST} in ${GOOGLESERVICE_INFO_PROD}"
    if [ -f "${GOOGLESERVICE_INFO_PROD}" ]
    then
    HAS_PROD_PLIST=true
    fi

    if [ "${HAS_DEV_PLIST}" != "true" ] && [ "${HAS_PROD_PLIST}" != "true" ]
    then
    echo "No Dev/Prod GoogleService-Info.plist found. Skipping Firebase plist setup."
    exit 0
    fi

    # Log current user-defined configurations
    #echo "CURRENT CONFIGURATION: ${CONFIGURATION}"
    #echo "CURRENT SCHEME: ${SCHEME}"
    #echo "CURRENT PRODUCT_BUNDLE_IDENTIFIER: ${PRODUCT_BUNDLE_IDENTIFIER}"
    #echo "CURRENT BUNDLE_ID_SUFFIX: ${BUNDLE_ID_SUFFIX}"
    #echo "CURRENT FACEBOOK_APP_ID: ${FACEBOOK_APP_ID}"
    #echo "CURRENT FACEBOOK_CLIENT_TOKEN: ${FACEBOOK_CLIENT_TOKEN}"

    # Get a reference to the destination location for the GoogleService-Info.plist
    PLIST_DESTINATION=${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app
    echo "Will copy ${GOOGLESERVICE_INFO_PLIST} to final destination: ${PLIST_DESTINATION}"

    if [ "${SCHEME}" == "Dev" ]
    then
    if [ "${HAS_DEV_PLIST}" != "true" ]
    then
    echo "Dev scheme detected but no Dev GoogleService-Info.plist found. Skipping Firebase plist setup."
    exit 0
    fi
    echo "Using DEV ${GOOGLESERVICE_INFO_DEV}"
    cp "${GOOGLESERVICE_INFO_DEV}" "${PLIST_DESTINATION}"
    # elif [ "${SCHEME}" == "Staging" ]
    # then
    # echo "Using STAGING ${GOOGLESERVICE_INFO_STAGING}"
    # cp "${GOOGLESERVICE_INFO_STAGING}" "${PLIST_DESTINATION}"
    else
    if [ "${HAS_PROD_PLIST}" != "true" ]
    then
    echo "Prod scheme detected but no Prod GoogleService-Info.plist found. Skipping Firebase plist setup."
    exit 0
    fi
    echo "Using PROD ${GOOGLESERVICE_INFO_PROD}"
    cp "${GOOGLESERVICE_INFO_PROD}" "${PLIST_DESTINATION}"
    fi
  SCRIPT

  existing_phase = app_target.build_phases.find do |phase|
    phase.isa == 'PBXShellScriptBuildPhase' && phase.name == phase_name
  end
  phase_status = 'existing'
  if existing_phase.nil?
    existing_phase = app_target.new_shell_script_build_phase(phase_name)
    phase_status = 'created'
  end

  if existing_phase.shell_script != script_body
    existing_phase.shell_script = script_body
    phase_status = phase_status == 'created' ? 'created' : 'updated'
  end
  existing_phase.shell_path = '/bin/bash'

  resources_phase = app_target.build_phases.find do |phase|
    phase.isa == 'PBXResourcesBuildPhase' ||
      (phase.respond_to?(:display_name) && phase.display_name == 'Copy Bundle Resources') ||
      (phase.respond_to?(:name) && phase.name == 'Copy Bundle Resources')
  end

  if resources_phase
    app_target.build_phases.delete(existing_phase)
    insert_index = app_target.build_phases.index(resources_phase) || app_target.build_phases.length
    app_target.build_phases.insert(insert_index, existing_phase)
    phase_status = phase_status == 'existing' ? 'reordered' : phase_status
  end

  phase_status
end

def upsert_podfile_node_require_and_permissions(podfile_path)
  return :missing unless File.exist?(podfile_path)

  content = File.read(podfile_path)
  updated = content.dup
  changes = []

  # Step 1: Replace old inline require with node_require function if needed
  unless updated.include?('def node_require(script)')
    old_require_pattern = /# Resolve react_native_pods\.rb with node to allow for hoisting\nrequire Pod::Executable\.execute_command\('node', \['-p',\n\s*'require\.resolve\(\n\s*"react-native\/scripts\/react_native_pods\.rb",\n\s*\{paths: \[process\.argv\[1\]\]\},\n\s*\)', __dir__\]\)\.strip/m

    node_require_block = <<~RUBY.chomp
      def node_require(script)
        # Resolve script with node to allow for hoisting
        require Pod::Executable.execute_command('node', ['-p',
          "require.resolve(
            '\#{script}',
            {paths: [process.argv[1]]},
          )", __dir__]).strip
      end

      # Use it to require both react-native's and this package's scripts:
      node_require('react-native/scripts/react_native_pods.rb')
      node_require('react-native-permissions/scripts/setup.rb')
    RUBY

    if updated.match?(old_require_pattern)
      updated.sub!(old_require_pattern, node_require_block)
      changes << 'node_require function (replaced inline require)'
    end
  end

  # Step 2: Add setup_permissions after prepare_react_native_project! if not present
  unless updated.include?('setup_permissions')
    permissions_block = <<~RUBY

      # Uncomment the permissions you need
      setup_permissions([
        # 'AppTrackingTransparency',
        # 'Bluetooth',
        # 'Calendars',
        # 'CalendarsWriteOnly',
        # 'Camera',
        # 'Contacts',
        # 'FaceID',
        # 'LocationAccuracy',
        # 'LocationAlways',
        # 'LocationWhenInUse',
        # 'MediaLibrary',
        # 'Microphone',
        # 'Motion',
        'Notifications',
        # 'PhotoLibrary',
        # 'PhotoLibraryAddOnly',
        # 'Reminders',
        # 'Siri',
        # 'SpeechRecognition',
        # 'StoreKit',
      ])
    RUBY

    if updated.include?('prepare_react_native_project!')
      updated.sub!(/prepare_react_native_project!\s*\n/) do |match|
        "#{match}#{permissions_block}"
      end
      changes << 'setup_permissions block'
    end
  end

  return :unchanged if updated == content

  File.write(podfile_path, updated)
  changes
end

ios_dir = File.join(Dir.pwd, 'ios')
project_path = Dir.glob(File.join(ios_dir, '*.xcodeproj')).first
raise 'Could not find an .xcodeproj under ios/.' unless project_path

project = Xcodeproj::Project.open(project_path)
project_name = File.basename(project_path, '.xcodeproj')
app_target = project.targets.find do |target|
  target.respond_to?(:product_type) && target.product_type == 'com.apple.product-type.application'
end
raise 'Could not find an iOS application target in the project.' unless app_target

changes = []

changes << 'project Dev.Debug' if ensure_build_configuration(project, 'Dev.Debug', 'Debug') == :created
changes << 'project Dev.Release' if ensure_build_configuration(project, 'Dev.Release', 'Release') == :created
changes.concat(upsert_scheme_user_defined_setting(project))

project.targets.each do |target|
  changes << "#{target.name} Dev.Debug" if ensure_build_configuration(target, 'Dev.Debug', 'Debug') == :created
  changes << "#{target.name} Dev.Release" if ensure_build_configuration(target, 'Dev.Release', 'Release') == :created
  changes.concat(upsert_scheme_user_defined_setting(target))
end

base_bundle_identifier = extract_base_bundle_identifier(app_target)
raise 'Could not infer base PRODUCT_BUNDLE_IDENTIFIER from app target.' if base_bundle_identifier.nil? || base_bundle_identifier.empty?
changes.concat(upsert_product_bundle_identifier(app_target, base_bundle_identifier))
base_product_name = extract_base_product_name(app_target)
changes.concat(upsert_product_name(app_target, base_product_name))
changes.concat(upsert_info_plist_display_name(app_target, ios_dir, project_name))
changes.concat(upsert_info_plist_encryption_flag(app_target, ios_dir, project_name))
firebase_phase_status = upsert_firebase_environment_script_phase(app_target)
changes << "Firebase plist run script #{firebase_phase_status}" unless firebase_phase_status == 'existing'

project.save

xcschemes_dir = File.join(project_path, 'xcshareddata', 'xcschemes')
FileUtils.mkdir_p(xcschemes_dir)

source_scheme_path = Dir.glob(File.join(xcschemes_dir, '*.xcscheme'))
  .reject { |path| File.basename(path) == 'Dev.xcscheme' }
  .first
raise 'Could not find a shared scheme to clone in ios/*.xcodeproj/xcshareddata/xcschemes.' unless source_scheme_path

scheme_doc = REXML::Document.new(File.read(source_scheme_path))
update_scheme_configuration(scheme_doc, 'LaunchAction', 'Dev.Debug')
update_scheme_configuration(scheme_doc, 'TestAction', 'Dev.Debug')
update_scheme_configuration(scheme_doc, 'AnalyzeAction', 'Dev.Debug')
update_scheme_configuration(scheme_doc, 'ProfileAction', 'Dev.Release')
update_scheme_configuration(scheme_doc, 'ArchiveAction', 'Dev.Release')

dev_scheme_path = File.join(xcschemes_dir, 'Dev.xcscheme')
output = +''
output << %(<?xml version="1.0" encoding="UTF-8"?>\n)
formatter = REXML::Formatters::Pretty.new(2)
formatter.compact = true
formatter.write(scheme_doc.root, output)
output << "\n"
File.write(dev_scheme_path, output)

podfile_path = File.join(ios_dir, 'Podfile')
podfile_status = upsert_podfile_project_mapping(podfile_path, project_name)
changes << 'Podfile project mapping' if podfile_status == :updated

node_require_status = upsert_podfile_node_require_and_permissions(podfile_path)
if node_require_status.is_a?(Array)
  node_require_status.each { |change| changes << "Podfile #{change}" }
end

puts 'Configured iOS build configurations and Dev scheme.'
if changes.empty?
  puts 'No new build configurations were created (already configured).'
else
  puts "Created: #{changes.join(', ')}"
end
