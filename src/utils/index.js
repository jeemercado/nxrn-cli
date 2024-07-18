import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export function getDirName() {
  return __dirname;
}

export const executeCommand = (dir, command) => {
  execSync(`cd ${dir} && ${command}`, { stdio: 'inherit' });
};

export const copyFile = (destinationPath, fileName) => {
  const sourcePath = path.join(getDirName(), `../templates/${fileName}`);

  fs.copyFile(sourcePath, destinationPath, (err) => {
    if (err) {
      console.error(`Error copying file: ${err.message}`);
      return;
    }
  });
};

export const copyDir = (destinationPath, fileName) => {
  const sourcePath = path.join(getDirName(), `../templates/${fileName}`);

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

export const addScriptsInRootPackageJson = (dir) => {
  const scripts = {
    'android:connect': 'cd apps/mobile && npm run android:connect',
    'check-env:mobile': './check-env.sh apps/mobile/.env apps/mobile/.env.template',
    clean: './clean-generated-outputs.sh',
    'create-env': 'printenv > ',
    'lint:all': 'npx nx run-many -t lint -p mobile --parallel=1 --skip-nx-cache',
    'lint:mobile': 'npx nx run mobile:lint --skip-nx-cache',
    'mobile-android': 'cd apps/mobile && npm run run-android',
    'mobile-ios': 'cd apps/mobile && npm run run-ios',
    prepare: 'husky install',
    'serve:mobile': 'cd apps/mobile && npm start',
    'serve:all': 'npx nx run-many -t serve -p mobile --parallel=1 --skip-nx-cache',
    xcode: 'cd apps/mobile && npm run xcode',
    'setup-fastlane': 'cd apps/mobile && npm run setup-fastlane',
    'deploy-android:dev': 'cd apps/mobile && npm run deploy-android:dev',
    'deploy-ios:dev': 'cd apps/mobile && npm run deploy-ios:dev',
    'ios-certificates': 'cd apps/mobile && npm run ios-certificates',
  };

  const packageJsonPath = path.join(dir, 'package.json');

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  packageJson.scripts = { ...packageJson.scripts, ...scripts };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
};
