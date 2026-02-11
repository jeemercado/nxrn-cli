import { execSync } from 'child_process';
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

export const addScriptsInRootPackageJson = (rootDir) => {
  const scripts = {
    "doctor": "npx nx react-native doctor",
    "android": "cd apps/mobile && npm run run-android",
    "android:connect": "cd apps/mobile && npm run android:connect",
    "check-env:mobile": "./check-env.sh apps/mobile/.env apps/mobile/.env.template",
    "ios": "cd apps/mobile && npm run run-ios",
    "clean": "./clean-generated-outputs.sh",
    "create-env": "printenv > ",
    "lint:all": "npx nx run-many -t lint -p mobile --parallel=1 --skip-nx-cache",
    "lint:mobile": "npx nx run mobile:lint --skip-nx-cache",
    "mobile-android": "cd apps/mobile && npm run run-android",
    "mobile-ios": "cd apps/mobile && npm run run-ios",
    "prepare": "husky install",
    "serve:mobile": "cd apps/mobile && npm start",
    "serve:all": "npx nx run-many -t serve -p mobile --parallel=1 --skip-nx-cache",
    "xcode": "cd apps/mobile && npm run xcode",
    "touch-xcode": "cd apps/mobile && npm run touch-xcode",
    "setup-fastlane": "cd apps/mobile && npm run setup-fastlane",
    "deploy-android:dev": "cd apps/mobile && npm run deploy-android:dev",
    "deploy-ios:dev": "cd apps/mobile && npm run deploy-ios:dev",
    "ios-certificates": "cd apps/mobile && npm run ios-certificates",
    "pod-install": "cd apps/mobile && npm run pod-install-conditional",
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
