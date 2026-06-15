#!/usr/bin/env node

import chalk from 'chalk';
import { execSync } from 'child_process';
import { program } from 'commander';
import { existsSync } from 'fs';
import inquirer from 'inquirer';
import ora from 'ora';
import { join } from 'path';
import { writeFileSync } from 'fs';
import {
  addDevDepsToPackageJson,
  addScriptsInRootPackageJson,
  configurePnpm,
  copyDir,
  copyFile,
  disableNxTui,
  executeCommand,
  executeCommandAsync,
  removeDir,
  removeFile,
} from './utils/index.js';

const version = '3.0.11';
const defaultNxVersion = '21.2.2';

const pmCommands = {
  npm: { install: 'npm install', run: 'npm run', noLockfile: '--no-package-lock' },
  yarn: { install: 'yarn install', run: 'yarn', noLockfile: '--no-lockfile' },
  pnpm: { install: 'pnpm install', run: 'pnpm', noLockfile: '--no-lockfile' },
  bun: { install: 'bun install', run: 'bun run', noLockfile: '--no-save' },
};

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
    code: '💻',
  },
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

// --- Shared helpers ---

const promptForName = async (value, message) => {
  if (value) return value;
  const result = await inquirer.prompt([
    { type: 'input', name: 'value', message: styles.info(message) },
  ]);
  return result.value;
};

const generateDevKeystore = (workspaceDirectory, mobileDirectory) => {
  const keystorePath = `${mobileDirectory}/android/app/dev.keystore`;
  if (existsSync(keystorePath)) {
    console.log(styles.warning('dev.keystore already exists, skipping keytool'));
    return;
  }
  executeCommand(
    workspaceDirectory,
    `keytool -genkey -keystore ${keystorePath} -keyalg RSA -keysize 2048 -validity 10000 -alias dev -dname "cn=Unknown, ou=Unknown, o=Unknown, c=Unknown" -storepass development -keypass development`,
    { stdio: 'inherit' },
  );
};

const runFinalizationSteps = async (workspaceDirectory, mobileDirectory, appName, bundleId, pm, { skipPostinstall = false } = {}) => {
  const spinner = ora({
    text: 'Running finalization steps...',
    color: 'cyan',
  }).start();

  // Start bundle install early — it only installs gems, doesn't touch the project
  const bundleReady = executeCommandAsync(mobileDirectory, 'bundle check || bundle install');

  const results = await Promise.allSettled([
    // Chain A: iOS-project steps must be sequential (they all modify Xcode project/plist)
    (async () => {
      await executeCommandAsync(
        mobileDirectory,
        `npx nx-react-native-rename@latest "${appName}" -b "${bundleId}" --skipGitStatusCheck --exclude "package.json"`,
      );
      await executeCommandAsync(mobileDirectory, 'npx react-native-asset');
      await executeCommandAsync(
        mobileDirectory,
        'npx react-native-bootsplash generate src/assets/images/logo.png --platforms=android,ios --background=ffffff --logo-width=100 --assets-output=src/assets/images/bootsplash --flavor=main',
      );
      // iOS setup needs both bundle install AND the above steps done
      await bundleReady;
      await executeCommandAsync(mobileDirectory, 'bundle exec ruby ./scripts/setup-ios-dev-scheme.rb');
    })(),
    // Chain B: postinstall only touches node_modules — safe to run in parallel
    ...(skipPostinstall ? [] : [executeCommandAsync(workspaceDirectory, `${pm.run} postinstall`)]),
  ]);

  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length > 0) {
    spinner.fail(styles.error('Some finalization steps failed'));
    for (const f of failed) {
      console.error(styles.error(f.reason?.message || f.reason));
    }
    process.exit(1);
  }
  spinner.succeed(styles.success('All finalization steps completed successfully'));
};

const installDeps = (workspaceDirectory, setupPm, pm, noLockfile, skipInstall) => {
  if (setupPm === 'pnpm') {
    configurePnpm(workspaceDirectory);
  }

  if (!skipInstall) {
    const installCommand = noLockfile ? `${pm.install} ${pm.noLockfile}` : pm.install;
    executeCommand(workspaceDirectory, installCommand);
  } else {
    console.log(styles.warning(`Skipping ${setupPm} install (--skip-install flag set)`));
  }
};

const copyTemplateFiles = (workspaceDirectory, nxVersion, { isFresh, skipConfigs }) => {
  copyFile(`${workspaceDirectory}/.gitignore`, '.ignorefile', 'shared');
  copyFile(`${workspaceDirectory}/.nvmrc`, '.nvmrc', 'shared');
  copyFile(`${workspaceDirectory}/.npmrc`, '.npmrc', 'shared');
  copyFile(`${workspaceDirectory}/check-env.sh`, 'check-env.sh', 'shared');
  copyFile(`${workspaceDirectory}/clean-generated-outputs.sh`, 'clean-generated-outputs.sh', 'shared');
  copyFile(`${workspaceDirectory}/run-android.sh`, 'run-android.sh', 'shared');
  copyFile(`${workspaceDirectory}/.ruby-version`, '.ruby-version', nxVersion, defaultNxVersion);
  copyDir(`${workspaceDirectory}/apps/mobile/scripts`, 'apps/mobile/scripts', 'shared');
  copyDir(`${workspaceDirectory}/patches`, 'patches', 'shared');

  if (!isFresh) {
    copyDir(`${workspaceDirectory}/.vscode`, '.vscode', 'shared');

    if (!skipConfigs) {
      copyDir(`${workspaceDirectory}/.husky`, '.husky', 'shared');
      copyFile(`${workspaceDirectory}/.prettierrc`, '.prettierrc', nxVersion, defaultNxVersion);
      copyFile(`${workspaceDirectory}/.prettierignore`, '.prettierignore', nxVersion, defaultNxVersion);
      copyFile(`${workspaceDirectory}/.eslintrc.json`, '.eslintrc.json', nxVersion, defaultNxVersion);
    } else {
      console.log(styles.info('Skipping prettier, eslint, and husky configs (--skip-configs flag set)'));
    }

    removeDir(`${workspaceDirectory}/apps/mobile/src`);
    removeFile(`${workspaceDirectory}/apps/mobile/.vite.config.ts`);
    removeFile(`${workspaceDirectory}/apps/mobile/.babelrc.js`);
    copyDir(`${workspaceDirectory}/apps`, 'apps', 'shared');
    copyDir(`${workspaceDirectory}/apps`, 'apps', nxVersion, defaultNxVersion);
  }

  copyFile(
    `${workspaceDirectory}/apps/mobile/.gitignore`,
    'apps/mobile/.ignorefile',
    nxVersion,
    defaultNxVersion,
  );
};

const displayCompletion = (startTime, pm, title) => {
  const elapsedMs = Date.now() - startTime;
  const elapsedMin = Math.floor(elapsedMs / 60000);
  const elapsedSec = Math.floor((elapsedMs % 60000) / 1000);
  const elapsedStr = elapsedMin > 0 ? `${elapsedMin}m ${elapsedSec}s` : `${elapsedSec}s`;

  console.log('\n');
  console.log(styles.title('╔════════════════════════════════════════════════════════╗'));
  console.log(styles.title('║  ') + styles.emoji.rocket + ' ' + styles.success(title) + styles.title(''.padEnd(Math.max(0, 55 - title.length - 4)) + '║'));
  console.log(styles.title('╚════════════════════════════════════════════════════════╝'));
  console.log('\n');

  console.log(`${styles.emoji.check} ${styles.info(`Done in ${styles.highlight(elapsedStr)}`)}`);
  console.log(styles.subtitle('📋 NEXT STEPS:'));
  console.log(`${styles.emoji.star} ${styles.info('Start your project:')} ${styles.command(`${pm.run} serve:mobile`)}`);
  console.log('\n');
  console.log(styles.highlight(`${styles.emoji.sparkles} Happy coding! ${styles.emoji.sparkles}`));
  console.log('\n');
};

const validateNxWorkspace = (dir) => {
  if (!existsSync(join(dir, 'nx.json'))) {
    console.log(styles.error('Error: Not in an NX workspace directory!'));
    console.log(styles.info('Please run this command from the root of your NX workspace.'));
    process.exit(1);
  }
};

const validateMobileApp = (mobileDirectory) => {
  if (!existsSync(mobileDirectory)) {
    console.log(styles.error('Error: apps/mobile does not exist!'));
    console.log(styles.info('Run "create" or "add" first to set up the mobile app.'));
    process.exit(1);
  }

  if (!existsSync(join(mobileDirectory, 'android', 'app'))) {
    console.log(styles.error('Error: apps/mobile/android/app does not exist!'));
    console.log(styles.info('The mobile app does not appear to have been generated correctly.'));
    process.exit(1);
  }
};

// --- Commands ---

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
  .option('--setup-pm <pm>', 'Package manager for one-time install/setup commands (npm, yarn, pnpm, or bun)', 'yarn')
  .option('--no-lockfile', 'Skip generating a lockfile during install')
  .option('--bare', 'Skip keytool, finalization steps (rename, assets, bootsplash, iOS setup, postinstall)')
  .option('--skip-install', 'Skip package install after adding dependencies')
  .option('--skip-postinstall', 'Skip running postinstall script during finalization')
  .option('--skip-configs', 'Skip copying prettier, eslint, and husky configs')
  .action(async (workspace_name, bundle_id, options) => {
    displayBanner();
    const startTime = Date.now();

    workspace_name = await promptForName(workspace_name, 'Enter the workspace name:');
    bundle_id = await promptForName(bundle_id, 'Enter the bundle ID: ex. org.reactjsnative.example');

    const isFresh = options.fresh || false;
    const nxVersion = options.nxVersion || defaultNxVersion;
    const packageManager = options.packageManager || 'yarn';
    const setupPm = options.setupPm || 'yarn';
    const noLockfile = options.noLockfile || false;
    const bare = options.bare || false;
    const pm = pmCommands[setupPm] || pmCommands.yarn;
    const skipInstall = options.skipInstall || false;
    const skipPostinstall = options.skipPostinstall || false;
    const skipConfigs = options.skipConfigs || false;

    const currentPwd = process.cwd();
    const workspaceDirectory = `${currentPwd}/${workspace_name}`;
    const mobileDirectory = `${workspaceDirectory}/apps/mobile`;

    console.log(`\n${styles.step(1)} ${styles.emoji.folder} ${styles.success(`Creating Nx workspace in ${styles.path(`./${workspace_name}`)}`)}`);
    const spinner1 = ora({
      text: 'Setting up Nx workspace...',
      color: 'cyan',
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
      color: 'cyan',
    }).start();

    // Merge all deps into package.json before installing to avoid multiple install cycles
    const nxDevDeps =
      setupPm === 'npm'
        ? { [`@nx/react-native`]: nxVersion }
        : {
            [`@nx/react-native`]: nxVersion,
            [`@nx/eslint-plugin`]: nxVersion,
            'eslint-plugin-jsx-a11y': 'latest',
          };
    addDevDepsToPackageJson(workspaceDirectory, nxDevDeps);
    addScriptsInRootPackageJson(workspaceDirectory);

    installDeps(workspaceDirectory, setupPm, pm, noLockfile, skipInstall);

    executeCommand(
      workspaceDirectory,
      'npx nx g @nx/react-native:app apps/mobile --bundler vite --install false --skip-nx-cache',
    );

    spinner2.succeed(styles.success('React Native dependencies installed successfully'));

    console.log(`\n${styles.step(3)} ${styles.emoji.tools} ${styles.success('Setting up project configuration')}`);
    const spinner3 = ora({
      text: 'Configuring project files...',
      color: 'cyan',
    }).start();

    copyTemplateFiles(workspaceDirectory, nxVersion, { isFresh, skipConfigs });

    if (!bare) {
      generateDevKeystore(workspaceDirectory, mobileDirectory);

      spinner3.succeed(styles.success('Project configuration completed'));

      console.log(`\n${styles.step(4)} ${styles.emoji.code} ${styles.success('Finalizing setup')}`);
      await runFinalizationSteps(workspaceDirectory, mobileDirectory, workspace_name, bundle_id, pm, { skipPostinstall });
    } else {
      spinner3.succeed(
        styles.success('Project configuration completed (bare mode — skipped keytool and finalization)'),
      );
    }

    writeFileSync(`${workspaceDirectory}/.nxrnclirc`, JSON.stringify({ version }, null, 2) + '\n');

    displayCompletion(startTime, pm, 'PROJECT CREATED SUCCESSFULLY');
  });

program
  .command('add [app_name] [bundle_id]')
  .description('Add React Native to existing Nx workspace')
  .option('--fresh', 'Add without copying template files')
  .option('--setup-pm <pm>', 'Package manager for one-time install/setup commands (npm, yarn, pnpm, or bun)', 'yarn')
  .option('--no-lockfile', 'Skip generating a lockfile during install')
  .option('--skip-install', 'Skip package install after adding dependencies')
  .option('--skip-postinstall', 'Skip running postinstall script during finalization')
  .option('--skip-configs', 'Skip copying prettier, eslint, and husky configs')
  .action(async (app_name, bundle_id, options) => {
    displayBanner();
    const startTime = Date.now();

    const workspaceDirectory = process.cwd();
    const mobileDirectory = `${workspaceDirectory}/apps/mobile`;

    validateNxWorkspace(workspaceDirectory);

    // Check if apps/mobile already exists
    if (existsSync(mobileDirectory)) {
      console.log(styles.error('Error: apps/mobile folder already exists!'));
      console.log(styles.info('Please remove or rename the existing apps/mobile folder before proceeding.'));
      process.exit(1);
    }

    // Read package.json to get NX version
    let nxVersion = defaultNxVersion;

    try {
      const fs = await import('fs');
      const packageJsonPath = join(workspaceDirectory, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      const nxWorkspaceVersion =
        packageJson.dependencies?.['@nx/workspace'] ||
        packageJson.devDependencies?.['@nx/workspace'] ||
        packageJson.dependencies?.['@nrwl/workspace'] ||
        packageJson.devDependencies?.['@nrwl/workspace'];

      if (nxWorkspaceVersion) {
        nxVersion = nxWorkspaceVersion.replace(/^[\^~]/, '');
        console.log(styles.info(`📦 Detected NX version: ${styles.highlight(nxVersion)}`));
      } else {
        console.log(styles.warning(`⚠️  Could not detect NX version, using default: ${nxVersion}`));
      }
    } catch (error) {
      console.log(styles.warning('⚠️  Could not read package.json, using default NX version'));
    }

    app_name = await promptForName(app_name, 'Enter the app name (for renaming):');
    bundle_id = await promptForName(bundle_id, 'Enter the bundle ID: ex. org.reactjsnative.example');

    const isFresh = options.fresh || false;
    const setupPm = options.setupPm || 'yarn';
    const noLockfile = options.noLockfile || false;
    const pm = pmCommands[setupPm] || pmCommands.yarn;
    const skipInstall = options.skipInstall || false;
    const skipPostinstall = options.skipPostinstall || false;
    const skipConfigs = options.skipConfigs || false;

    console.log(`\n${styles.step(1)} ${styles.emoji.mobile} ${styles.success('Adding React Native to your workspace')}`);
    const spinner1 = ora({
      text: 'Installing React Native dependencies...',
      color: 'cyan',
    }).start();

    // Merge all deps into package.json before installing to avoid multiple install cycles
    const nxDevDepsForAdd = { [`@nx/react-native`]: nxVersion };
    addDevDepsToPackageJson(workspaceDirectory, nxDevDepsForAdd);
    addScriptsInRootPackageJson(workspaceDirectory);

    installDeps(workspaceDirectory, setupPm, pm, noLockfile, skipInstall);

    executeCommand(
      workspaceDirectory,
      'npx nx g @nx/react-native:app apps/mobile --bundler vite --install false --skip-nx-cache',
    );

    spinner1.succeed(styles.success('React Native dependencies installed successfully'));

    console.log(`\n${styles.step(2)} ${styles.emoji.tools} ${styles.success('Setting up project configuration')}`);
    const spinner2 = ora({
      text: 'Configuring project files...',
      color: 'cyan',
    }).start();

    copyTemplateFiles(workspaceDirectory, nxVersion, { isFresh, skipConfigs });

    generateDevKeystore(workspaceDirectory, mobileDirectory);

    spinner2.succeed(styles.success('Project configuration completed'));

    console.log(`\n${styles.step(3)} ${styles.emoji.code} ${styles.success('Finalizing setup')}`);
    await runFinalizationSteps(workspaceDirectory, mobileDirectory, app_name, bundle_id, pm, { skipPostinstall });

    writeFileSync(`${workspaceDirectory}/.nxrnclirc`, JSON.stringify({ version }, null, 2) + '\n');

    displayCompletion(startTime, pm, 'REACT NATIVE ADDED SUCCESSFULLY');
  });

program
  .command('init [app_name] [bundle_id]')
  .description('Run setup steps skipped by --bare (keytool, rename, assets, bootsplash, iOS setup, postinstall)')
  .option('--setup-pm <pm>', 'Package manager for running commands (npm, yarn, pnpm, or bun)', 'yarn')
  .option('--skip-postinstall', 'Skip running postinstall script during finalization')
  .action(async (app_name, bundle_id, options) => {
    displayBanner();
    const startTime = Date.now();

    const workspaceDirectory = process.cwd();
    const mobileDirectory = `${workspaceDirectory}/apps/mobile`;
    const setupPm = options.setupPm || 'yarn';
    const skipPostinstall = options.skipPostinstall || false;
    const pm = pmCommands[setupPm] || pmCommands.yarn;

    validateNxWorkspace(workspaceDirectory);
    validateMobileApp(mobileDirectory);

    app_name = await promptForName(app_name, 'Enter the app name (for renaming):');
    bundle_id = await promptForName(bundle_id, 'Enter the bundle ID: ex. org.reactjsnative.example');

    console.log(`\n${styles.step(1)} ${styles.emoji.tools} ${styles.success('Generating dev keystore')}`);
    generateDevKeystore(workspaceDirectory, mobileDirectory);

    console.log(`\n${styles.step(2)} ${styles.emoji.code} ${styles.success('Running finalization steps')}`);
    await runFinalizationSteps(workspaceDirectory, mobileDirectory, app_name, bundle_id, pm, { skipPostinstall });

    displayCompletion(startTime, pm, 'INITIALIZATION COMPLETED');
  });

program.parse(process.argv);
