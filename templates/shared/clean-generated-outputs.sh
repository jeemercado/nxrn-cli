#!/bin/bash

# Clean generated outputs
echo "Cleaning generated outputs..."

root_node_modules_path="node_modules"
app_rn_name="mobile"
app_rn_android_gradle_path="apps/$app_rn_name/android/.gradle"
app_rn_android_build_path="apps/$app_rn_name/android/build"
app_rn_android_cxx_path="apps/$app_rn_name/android/app/.cxx"
app_rn_android_cxx_build_path="apps/$app_rn_name/android/app/build"
app_rn_node_modules_path="node_modules"
app_rn_ios_pods_path="apps/$app_rn_name/ios/Pods"
app_rn_ios_build_path="apps/$app_rn_name/ios/build"

echo "Deleting root $root_build_path..."
rm -rf "$root_build_path"

echo "Deleting root $root_node_modules_path..."
rm -rf "$root_node_modules_path"

echo "Deleting $app_rn_android_build_path..."
rm -rf "$app_rn_android_build_path"

echo "Deleting $app_rn_android_cxx_path..."
rm -rf "$app_rn_android_cxx_path"

echo "Deleting $app_rn_android_cxx_build_path..."
rm -rf "$app_rn_android_cxx_build_path"

echo "Deleting $app_rn_node_modules_path..."
rm -rf "$app_rn_node_modules_path"

echo "Deleting $app_rn_ios_pods_path..."
rm -rf "$app_rn_ios_pods_path"

app_rn_ios_pods_checksum="apps/$app_rn_name/ios/.pods-checksum"
echo "Deleting $app_rn_ios_pods_checksum..."
rm -f "$app_rn_ios_pods_checksum"

echo "Deleting $app_rn_ios_build_path..."
rm -rf "$app_rn_ios_build_path"

echo "Deleting $app_rn_android_gradle_path..."
rm -rf "$app_rn_android_gradle_path"

echo "Installing dependencies..."
yarn install

# Only install pods on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "macOS detected - Installing pods..."
  yarn run pod-install
else
  echo "Non-macOS platform - Skipping pod install (iOS-only)"
fi

echo "Done!"
