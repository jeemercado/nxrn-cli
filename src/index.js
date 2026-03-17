#!/usr/bin/env node

import chalk from 'chalk';
import { execSync } from 'child_process';
import { program } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import {
  addDevDepsToPackageJson,
  addScriptsInRootPackageJson,
  copyDir,
  copyFile,
  disableNxTui,
  executeCommand,
  executeCommandAsync,
  removeDir,
  removeFile,
} from './utils/index.js';

const version = '3.0.7';
const defaultNxVersion = '21.2.2';
const styles = {
  title: chalk.bold.cyan,
  subtitle: chalk.cyan,
  success: chalk.bold.green,
  info: chalk.bold.blue,
  warning: chalk.hex('#FFA500').bold,
  error: chalk.bold.red,
  highlight: chalk.bold.magenta,
  command: chalk.yellow.italic,
  path: chalk.green.underline,
  step: (num) => chalk.bgCyan.black(` STEP ${num} `),
  emoji: {
    rocket: '🚀',
    check: '✅',
    warning: '⚠️',
    star: '⭐',
    sparkles: '✨',
    tools: '🛠️',
    mobile: '📱',
    folder: '📁',
    code: '💻'
  }
};

const displayBanner = () => {
  console.log('\n');
  console.log(styles.title('╔════════════════════════════════════════════════════════╗'));
  console.log(styles.title('║                                                        ║'));
  console.log(styles.title('║  ') + styles.highlight('NX REACT NATIVE CLI') + styles.title('                                   ║'));
  console.log(styles.title('║  ') + styles.subtitle('A powerful starter for React Native with NX') + styles.title('           ║'));
  console.log(styles.title('║                                                        ║'));
  console.log(styles.title('╚════════════════════════════════════════════════════════╝'));
  console.log('\n');
};

program
  .name('React Native Starter with NX')
  .description('A starter script to create a new React Native project with NX')
  .version(version);

program
  .command('create [workspace_name] [bundle_id]')
  .description('create nx workspace with react-native')
  .option('--fresh', 'Create a fresh project without copying template files')
  .option('--nx-version <version>', 'Specify Nx version to use', defaultNxVersion)
  .option('--package-manager <pm>', 'Package manager to use (yarn or npm)', 'yarn')
  .option('--skip-install', 'Skip package install after adding dependencies')
  .option('--skip-configs', 'Skip copying prettier, eslint, and husky configs')
  .action(async (workspace_name, bundle_id, options) => {
    displayBanner();
    const startTime = Date.now();

    if (!workspace_name) {
      const result = await inquirer.prompt([
        {
          type: 'input',
          name: 'workspace_name',
          message: styles.info('Enter the workspace name:'),
        },
      ]);

      workspace_name = result.workspace_name;
    }

    if (!bundle_id) {
      const result = await inquirer.prompt([
        {
          type: 'input',
          name: 'bundle_id',
          message: styles.info('Enter the bundle ID: ex. org.reactjsnative.example'),
        }
      ]);

      bundle_id = result.bundle_id;
    }

    const isFresh = options.fresh || false;
    const nxVersion = options.nxVersion || defaultNxVersion;
    const packageManager = options.packageManager || 'yarn';
    const skipInstall = options.skipInstall || false;
    const skipConfigs = options.skipConfigs || false;

    const currentPwd = process.cwd();
    const workspaceDirectory = `${currentPwd}/${workspace_name}`;
    const mobileDirectory = `${workspaceDirectory}/apps/mobile`;

    console.log(`\n${styles.step(1)} ${styles.emoji.folder} ${styles.success(`Creating Nx workspace in ${styles.path(`./${workspace_name}`)}`)}`);
    const spinner1 = ora({
      text: 'Setting up Nx workspace...',
      color: 'cyan'
    }).start();
    
    execSync(
      `cd ${currentPwd} && npx create-nx-workspace@${nxVersion} --preset apps --workspaceType integrated --name ${workspace_name}  --package-manager=${packageManager} --interactive false --nxCloud skip`,
      {
        stdio: 'inherit',
      },
    );
    disableNxTui(workspaceDirectory);
    spinner1.succeed(styles.success('Nx workspace created successfully'));

    console.log(`\n${styles.step(2)} ${styles.emoji.mobile} ${styles.success('Adding React Native to your workspace')}`);
    const spinner2 = ora({
      text: 'Installing React Native dependencies...',
      color: 'cyan'
    }).start();

    // Merge all deps into package.json before installing to avoid multiple install cycles
    const nxDevDeps = packageManager === 'npm'
      ? { [`@nx/react-native`]: nxVersion }
      : { [`@nx/react-native`]: nxVersion, [`@nx/eslint-plugin`]: nxVersion, 'eslint-plugin-jsx-a11y': 'latest' };
    addDevDepsToPackageJson(workspaceDirectory, nxDevDeps);
    addScriptsInRootPackageJson(workspaceDirectory);

    // Single install for all dependencies (workspace + RN + template deps)
    if (!skipInstall) {
      const installCommand = packageManager === 'npm' ? 'npm install' : 'yarn install';
      executeCommand(workspaceDirectory, installCommand);
    } else {
      console.log(styles.warning(`Skipping ${packageManager} install (--skip-install flag set)`));
    }

    executeCommand(
      workspaceDirectory,
      `npx nx g @nx/react-native:app apps/mobile --bundler vite --install false --skip-nx-cache`,
    );

    spinner2.succeed(styles.success('React Native dependencies installed successfully'));

    console.log(`\n${styles.step(3)} ${styles.emoji.tools} ${styles.success('Setting up project configuration')}`);
    const spinner3 = ora({
      text: 'Configuring project files...',
      color: 'cyan'
    }).start();
    
    copyFile(`${workspaceDirectory}/.gitignore`, '.ignorefile', 'shared');
    copyFile(`${workspaceDirectory}/.nvmrc`, '.nvmrc', 'shared');
    copyFile(`${workspaceDirectory}/check-env.sh`, `check-env.sh`, 'shared');
    copyFile(`${workspaceDirectory}/clean-generated-outputs.sh`, `clean-generated-outputs.sh`, 'shared');
    copyFile(`${workspaceDirectory}/run-android.sh`, `run-android.sh`, 'shared');
    copyFile(`${workspaceDirectory}/.ruby-version`, '.ruby-version', nxVersion, defaultNxVersion);
    copyDir(`${workspaceDirectory}/apps/mobile/scripts`, `apps/mobile/scripts`, 'shared');
    copyDir(`${workspaceDirectory}/patches`, `patches`, 'shared');

    if (!isFresh) {
      copyDir(`${workspaceDirectory}/.vscode`, `.vscode`, 'shared');
      
      if (!skipConfigs) {
        copyDir(`${workspaceDirectory}/.husky`, `.husky`, 'shared');
        copyFile(`${workspaceDirectory}/.prettierrc`, '.prettierrc', nxVersion, defaultNxVersion);
        copyFile(`${workspaceDirectory}/.prettierignore`, '.prettierignore', nxVersion, defaultNxVersion);
        copyFile(`${workspaceDirectory}/.eslintrc.json`, '.eslintrc.json', nxVersion, defaultNxVersion);
      } else {
        console.log(styles.info('Skipping prettier, eslint, and husky configs (--skip-configs flag set)'));
      }
      
      removeDir(`${workspaceDirectory}/apps/mobile/src`);
      removeFile(`${workspaceDirectory}/apps/mobile/.vite.config.ts`);
      removeFile(`${workspaceDirectory}/apps/mobile/.babelrc.js`);
      copyDir(`${workspaceDirectory}/apps`, `apps`, 'shared');
      copyDir(`${workspaceDirectory}/apps`, `apps`, nxVersion, defaultNxVersion);
    }

    copyFile(`${workspaceDirectory}/apps/mobile/.gitignore`, `apps/mobile/.ignorefile`, nxVersion, defaultNxVersion);
    
    executeCommand(
      workspaceDirectory,
      `keytool -genkey -keystore ${workspaceDirectory}/apps/mobile/android/app/dev.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias dev -dname "cn=Unknown, ou=Unknown, o=Unknown, c=Unknown" -storepass development -keypass development`,
      {
        stdio: 'inherit',
      },
    );

    spinner3.succeed(styles.success('Project configuration completed'));

    console.log(`\n${styles.step(4)} ${styles.emoji.code} ${styles.success('Finalizing setup')}`);
    const spinnerParallel = ora({
      text: 'Running finalization steps...',
      color: 'cyan'
    }).start();

    // Start bundle install early — it only installs gems, doesn't touch the project
    const bundleReady = executeCommandAsync(mobileDirectory, 'bundle check || bundle install');

    const results = await Promise.allSettled([
      // Chain A: iOS-project steps must be sequential (they all modify Xcode project/plist)
      (async () => {
        await executeCommandAsync(
          mobileDirectory,
          `npx nx-react-native-rename@latest "${workspace_name}" -b "${bundle_id}" --skipGitStatusCheck --exclude "package.json"`,
        );
        await executeCommandAsync(mobileDirectory, `npx react-native-asset`);
        await executeCommandAsync(
          mobileDirectory,
          `npx react-native-bootsplash generate src/assets/images/logo.png --platforms=android,ios --background=ffffff --logo-width=100 --assets-output=src/assets/images/bootsplash --flavor=main`,
        );
        // iOS setup needs both bundle install AND the above steps done
        await bundleReady;
        await executeCommandAsync(mobileDirectory, 'bundle exec ruby ./scripts/setup-ios-dev-scheme.rb');
      })(),
      // Chain B: postinstall only touches node_modules — safe to run in parallel
      executeCommandAsync(workspaceDirectory, `yarn postinstall`),
    ]);

    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length > 0) {
      spinnerParallel.fail(styles.error('Some finalization steps failed'));
      for (const f of failed) {
        console.error(styles.error(f.reason?.message || f.reason));
      }
      process.exit(1);
    }
    spinnerParallel.succeed(styles.success('All finalization steps completed successfully'));

    const elapsedMs = Date.now() - startTime;
    const elapsedMin = Math.floor(elapsedMs / 60000);
    const elapsedSec = Math.floor((elapsedMs % 60000) / 1000);
    const elapsedStr = elapsedMin > 0 ? `${elapsedMin}m ${elapsedSec}s` : `${elapsedSec}s`;

    console.log('\n');
    console.log(styles.title('╔════════════════════════════════════════════════════════╗'));
    console.log(styles.title('║  ') + styles.emoji.rocket + ' ' + styles.success('PROJECT CREATED SUCCESSFULLY') + styles.title('                       ║'));
    console.log(styles.title('╚════════════════════════════════════════════════════════╝'));
    console.log('\n');

    console.log(`${styles.emoji.check} ${styles.info(`Done in ${styles.highlight(elapsedStr)}`)}`);
    console.log(styles.subtitle('📋 NEXT STEPS:'));
    const serveCommand = packageManager === 'npm' ? 'npm run serve:mobile' : 'yarn serve:mobile';
    console.log(`${styles.emoji.star} ${styles.info('Start your project:')} ${styles.command(serveCommand)}`);
    console.log('\n');
    console.log(styles.highlight(`${styles.emoji.sparkles} Happy coding! ${styles.emoji.sparkles}`));
    console.log('\n');
  });

program
  .command('add [app_name] [bundle_id]')
  .description('Add React Native to existing Nx workspace')
  .option('--fresh', 'Add without copying template files')
  .option('--package-manager <pm>', 'Package manager to use (yarn or npm)', 'yarn')
  .option('--skip-install', 'Skip package install after adding dependencies')
  .option('--skip-configs', 'Skip copying prettier, eslint, and husky configs')
  .action(async (app_name, bundle_id, options) => {
    displayBanner();
    const startTime = Date.now();

    const currentPwd = process.cwd();
    
    // Check if we're in an NX workspace
    const fs = await import('fs');
    const path = await import('path');
    const workspaceDirectory = currentPwd;
    const mobileDirectory = `${workspaceDirectory}/apps/mobile`;
    
    if (!fs.existsSync(path.join(currentPwd, 'nx.json'))) {
      console.log(styles.error('❌ Error: Not in an NX workspace directory!'));
      console.log(styles.info('Please run this command from the root of your NX workspace.'));
      process.exit(1);
    }

    // Check if apps/mobile already exists
    if (fs.existsSync(mobileDirectory)) {
      console.log(styles.error('❌ Error: apps/mobile folder already exists!'));
      console.log(styles.info('Please remove or rename the existing apps/mobile folder before proceeding.'));
      process.exit(1);
    }

    // Read package.json to get NX version and workspace name
    let nxVersion = defaultNxVersion;
    
    try {
      const packageJsonPath = path.join(currentPwd, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // Extract NX version from dependencies or devDependencies
      const nxWorkspaceVersion = 
        packageJson.dependencies?.['@nx/workspace'] || 
        packageJson.devDependencies?.['@nx/workspace'] ||
        packageJson.dependencies?.['@nrwl/workspace'] || 
        packageJson.devDependencies?.['@nrwl/workspace'];
      
      if (nxWorkspaceVersion) {
        // Remove ^ or ~ from version string
        nxVersion = nxWorkspaceVersion.replace(/^[\^~]/, '');
        console.log(styles.info(`📦 Detected NX version: ${styles.highlight(nxVersion)}`));
      } else {
        console.log(styles.warning(`⚠️  Could not detect NX version, using default: ${nxVersion}`));
      }
    } catch (error) {
      console.log(styles.warning('⚠️  Could not read package.json, using default NX version'));
    }

    if (!app_name) {
      const result = await inquirer.prompt([
        {
          type: 'input',
          name: 'app_name',
          message: styles.info('Enter the app name (for renaming):'),
        },
      ]);

      app_name = result.app_name;
    }

    if (!bundle_id) {
      const result = await inquirer.prompt([
        {
          type: 'input',
          name: 'bundle_id',
          message: styles.info('Enter the bundle ID: ex. org.reactjsnative.example'),
        }
      ]);

      bundle_id = result.bundle_id;
    }

    const isFresh = options.fresh || false;
    const packageManager = options.packageManager || 'yarn';
    const skipInstall = options.skipInstall || false;
    const skipConfigs = options.skipConfigs || false;


    console.log(`\n${styles.step(1)} ${styles.emoji.mobile} ${styles.success('Adding React Native to your workspace')}`);
    const spinner1 = ora({
      text: 'Installing React Native dependencies...',
      color: 'cyan'
    }).start();

    // Merge all deps into package.json before installing to avoid multiple install cycles
    const nxDevDepsForAdd = { [`@nx/react-native`]: nxVersion };
    addDevDepsToPackageJson(workspaceDirectory, nxDevDepsForAdd);
    addScriptsInRootPackageJson(workspaceDirectory);

    // Single install for all dependencies
    if (!skipInstall) {
      const installCommandForAdd = packageManager === 'npm' ? 'npm install' : 'yarn install';
      executeCommand(workspaceDirectory, installCommandForAdd);
    } else {
      console.log(styles.warning(`Skipping ${packageManager} install (--skip-install flag set)`));
    }

    executeCommand(
      workspaceDirectory,
      `npx nx g @nx/react-native:app apps/mobile --bundler vite --install false --skip-nx-cache`,
    );

    spinner1.succeed(styles.success('React Native dependencies installed successfully'));

    console.log(`\n${styles.step(2)} ${styles.emoji.tools} ${styles.success('Setting up project configuration')}`);
    const spinner2 = ora({
      text: 'Configuring project files...',
      color: 'cyan'
    }).start();
    
    copyFile(`${workspaceDirectory}/.gitignore`, '.ignorefile', 'shared');
    copyFile(`${workspaceDirectory}/.nvmrc`, '.nvmrc', 'shared');
    copyFile(`${workspaceDirectory}/check-env.sh`, `check-env.sh`, 'shared');
    copyFile(`${workspaceDirectory}/clean-generated-outputs.sh`, `clean-generated-outputs.sh`, 'shared');
    copyFile(`${workspaceDirectory}/run-android.sh`, `run-android.sh`, 'shared');
    copyFile(`${workspaceDirectory}/.ruby-version`, '.ruby-version', nxVersion, defaultNxVersion);
    copyDir(`${workspaceDirectory}/apps/mobile/scripts`, `apps/mobile/scripts`, 'shared');
    copyDir(`${workspaceDirectory}/patches`, `patches`, 'shared');

    if (!isFresh) {
      copyDir(`${workspaceDirectory}/.vscode`, `.vscode`, 'shared');
      
      if (!skipConfigs) {
        copyDir(`${workspaceDirectory}/.husky`, `.husky`, 'shared');
        copyFile(`${workspaceDirectory}/.prettierrc`, '.prettierrc', nxVersion, defaultNxVersion);
        copyFile(`${workspaceDirectory}/.prettierignore`, '.prettierignore', nxVersion, defaultNxVersion);
        copyFile(`${workspaceDirectory}/.eslintrc.json`, '.eslintrc.json', nxVersion, defaultNxVersion);
      } else {
        console.log(styles.info('Skipping prettier, eslint, and husky configs (--skip-configs flag set)'));
      }
      
      removeDir(`${workspaceDirectory}/apps/mobile/src`);
      removeFile(`${workspaceDirectory}/apps/mobile/.vite.config.ts`);
      removeFile(`${workspaceDirectory}/apps/mobile/.babelrc.js`);
      copyDir(`${workspaceDirectory}/apps`, `apps`, 'shared');
      copyDir(`${workspaceDirectory}/apps`, `apps`, nxVersion, defaultNxVersion);
    }

    copyFile(`${workspaceDirectory}/apps/mobile/.gitignore`, `apps/mobile/.ignorefile`, nxVersion, defaultNxVersion);
    
    executeCommand(
      workspaceDirectory,
      `keytool -genkey -keystore ${workspaceDirectory}/apps/mobile/android/app/dev.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias dev -dname "cn=Unknown, ou=Unknown, o=Unknown, c=Unknown" -storepass development -keypass development`,
      {
        stdio: 'inherit',
      },
    );

    spinner2.succeed(styles.success('Project configuration completed'));

    console.log(`\n${styles.step(3)} ${styles.emoji.code} ${styles.success('Finalizing setup')}`);
    const spinnerParallel2 = ora({
      text: 'Running finalization steps...',
      color: 'cyan'
    }).start();

    // Start bundle install early — it only installs gems, doesn't touch the project
    const bundleReady2 = executeCommandAsync(mobileDirectory, 'bundle check || bundle install');

    const results2 = await Promise.allSettled([
      // Chain A: iOS-project steps must be sequential (they all modify Xcode project/plist)
      (async () => {
        await executeCommandAsync(
          mobileDirectory,
          `npx nx-react-native-rename@latest "${app_name}" -b "${bundle_id}" --skipGitStatusCheck --exclude "package.json"`,
        );
        await executeCommandAsync(mobileDirectory, `npx react-native-asset`);
        await executeCommandAsync(
          mobileDirectory,
          `npx react-native-bootsplash generate src/assets/images/logo.png --platforms=android,ios --background=ffffff --logo-width=100 --assets-output=src/assets/images/bootsplash --flavor=main`,
        );
        // iOS setup needs both bundle install AND the above steps done
        await bundleReady2;
        await executeCommandAsync(mobileDirectory, 'bundle exec ruby ./scripts/setup-ios-dev-scheme.rb');
      })(),
      // Chain B: postinstall only touches node_modules — safe to run in parallel
      executeCommandAsync(workspaceDirectory, `yarn postinstall`),
    ]);

    const failed2 = results2.filter((r) => r.status === 'rejected');
    if (failed2.length > 0) {
      spinnerParallel2.fail(styles.error('Some finalization steps failed'));
      for (const f of failed2) {
        console.error(styles.error(f.reason?.message || f.reason));
      }
      process.exit(1);
    }
    spinnerParallel2.succeed(styles.success('All finalization steps completed successfully'));

    const elapsedMs = Date.now() - startTime;
    const elapsedMin = Math.floor(elapsedMs / 60000);
    const elapsedSec = Math.floor((elapsedMs % 60000) / 1000);
    const elapsedStr = elapsedMin > 0 ? `${elapsedMin}m ${elapsedSec}s` : `${elapsedSec}s`;

    console.log('\n');
    console.log(styles.title('╔════════════════════════════════════════════════════════╗'));
    console.log(styles.title('║  ') + styles.emoji.rocket + ' ' + styles.success('REACT NATIVE ADDED SUCCESSFULLY') + styles.title('                 ║'));
    console.log(styles.title('╚════════════════════════════════════════════════════════╝'));
    console.log('\n');

    console.log(`${styles.emoji.check} ${styles.info(`Done in ${styles.highlight(elapsedStr)}`)}`);
    console.log(styles.subtitle('📋 NEXT STEPS:'));
    const serveCommandForAdd = packageManager === 'npm' ? 'npm run serve:mobile' : 'yarn serve:mobile';
    console.log(`${styles.emoji.star} ${styles.info('Start your project:')} ${styles.command(serveCommandForAdd)}`);
    console.log('\n');
    console.log(styles.highlight(`${styles.emoji.sparkles} Happy coding! ${styles.emoji.sparkles}`));
    console.log('\n');
  });

program.parse(process.argv);
