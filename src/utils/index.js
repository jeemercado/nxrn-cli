import { execSync, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import ora from 'ora';
import dependenciesJson from './dependencies.json';
import devDependenciesJson from './devDependencies.json';

export function getDirName() {
  return __dirname;
}

export const executeCommand = (dir, command) => {
  execSync(`cd ${dir} && ${command}`, { stdio: 'inherit' });
};

export const executeCommandAsync = (dir, command) => {
  return new Promise((resolve, reject) => {
    exec(`cd ${dir} && ${command}`, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
};

export const copyFile = (destinationPath, fileName, version, defaultVersion) => {
  let sourcePath = path.join(getDirName(), `../templates/${version}/${fileName}`);
  if (!fs.existsSync(sourcePath) && defaultVersion) {
    sourcePath = path.join(getDirName(), `../templates/${defaultVersion}/${fileName}`);
  }

  fs.copyFile(sourcePath, destinationPath, (err) => {
    if (err) {
      console.error(`Error copying file: ${err.message}`);
      return;
    }
  });
};

export const copyDir = (destinationPath, fileName, version, defaultVersion) => {
  let sourcePath = path.join(getDirName(), `../templates/${version}/${fileName}`);
  if (!fs.existsSync(sourcePath) && defaultVersion) {
    sourcePath = path.join(getDirName(), `../templates/${defaultVersion}/${fileName}`);
  }

  fs.cpSync(sourcePath, destinationPath, { recursive: true }, (err) => {
    if (err) {
      console.error(`Error copying file: ${err.message}`);
      return;
    }
  });
};

export const removeDir = (dir) => {
  fs.rmSync(dir, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error(`Error removing directory: ${err.message}`);
      return;
    }
  });
};

export const removeFile = (filePath) => {
  fs.rmSync(filePath, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error(`Error removing file: ${err.message}`);
      return;
    }
  });
};

export const addDevDepsToPackageJson = (rootDir, deps) => {
  const packageJsonPath = path.join(rootDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.devDependencies = { ...packageJson.devDependencies, ...deps };
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
};

export const addScriptsInRootPackageJson = (rootDir) => {
  const scripts = {
    "postinstall": "patch-package",
    "doctor": "cd apps/mobile && npx @react-native-community/cli doctor",
    "android": "bash ./run-android.sh",
    "android:connect": "adb reverse tcp:8081 tcp:8081",
    "check-env:mobile": "bash ./check-env.sh apps/mobile/.env apps/mobile/.env.template",
    "ios": "npx nx run-ios mobile",
    "clean": "bash ./clean-generated-outputs.sh",
    "lint:all": "npx nx run-many -t lint -p mobile --parallel=1 --skip-nx-cache",
    "lint:mobile": "npx nx run mobile:lint --skip-nx-cache",
    "prepare": "husky install",
    "serve:mobile": "npx nx start mobile --skip-nx-cache",
    "serve:all": "npx nx run-many -t serve -p mobile --parallel=1 --skip-nx-cache",
    "xcode": "bash apps/mobile/ios-only.sh 'xed -b ios'",
    "touch-xcode": "bash apps/mobile/ios-only.sh 'touch ios/.xcode.env'",
    "setup-fastlane": "cd apps/mobile && rbenv local && bundle install && bundle update",
    "deploy:mobile": "bash apps/mobile/deploy.sh",
    "ios-certificates": "bash apps/mobile/ios-only.sh 'rbenv local && bundle install && bundle update && bundle exec fastlane ios certificates --env development'",
    "pod-install": "npx nx pod-install mobile",
    "pod-install:force": "npx nx pod-install:force mobile",
    "list:ios-configurations": "bash apps/mobile/ios-only.sh 'cd ios && xcodebuild -list'",
    "list:ios-devices": "bash apps/mobile/ios-only.sh 'xcrun xctrace list devices'",
    "react-native-asset": "cd apps/mobile && npx react-native-asset"
  };
  const packageJsonPath = path.join(rootDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.dependencies = { ...packageJson.dependencies, ...dependenciesJson.dependencies };
  packageJson.devDependencies = { ...packageJson.devDependencies, ...devDependenciesJson.devDependencies };
  packageJson.scripts = { ...packageJson.scripts, ...scripts };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
};

export const disableNxTui = (workspaceDirectory) => {
  const nxJsonPath = path.join(workspaceDirectory, 'nx.json');
  if (!fs.existsSync(nxJsonPath)) {
    return;
  }

  const nxJson = JSON.parse(fs.readFileSync(nxJsonPath, 'utf-8'));
  nxJson.tui = {
    ...(nxJson.tui || {}),
    enabled: false
  };

  fs.writeFileSync(nxJsonPath, JSON.stringify(nxJson, null, 2));
};

export const setupIosDevSchemeAndConfigurations = (mobileDirectory, styles) => {
  const spinner = ora({
    text: 'Configuring iOS Dev scheme and build configurations...',
    color: 'cyan'
  }).start();

  try {
    executeCommand(mobileDirectory, 'bundle check || bundle install');
    executeCommand(mobileDirectory, 'bundle exec ruby ./scripts/setup-ios-dev-scheme.rb');
    spinner.succeed(styles.success('iOS Dev scheme and build configurations configured successfully'));
  } catch (error) {
    spinner.fail(styles.error('Failed to configure iOS Dev scheme and build configurations'));
    throw error;
  }
};
