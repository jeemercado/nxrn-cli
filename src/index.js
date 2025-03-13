#!/usr/bin/env node

import chalk from 'chalk';
import { execSync } from 'child_process';
import { program } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import {
  addScriptsInRootPackageJson,
  copyDir,
  copyFile,
  executeCommand,
  removeDir,
  removeFile
} from './utils/index.js';

const version = '2.0.2';
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
  .command('create [workspace_name]')
  .description('create nx workspace with react-native')
  .option('--fresh', 'Create a fresh project without copying template files')
  .action(async (workspace_name, options) => {
    displayBanner();
    
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
    const isFresh = options.fresh || false;

    const currentPwd = process.cwd();
    const workspaceDirectory = `${currentPwd}/${workspace_name}`;
    const mobileDirectory = `${workspaceDirectory}/apps/mobile`;

    console.log(`\n${styles.step(1)} ${styles.emoji.folder} ${styles.success(`Creating Nx workspace in ${styles.path(`./${workspace_name}`)}`)}`);
    const spinner1 = ora({
      text: 'Setting up Nx workspace...',
      color: 'cyan'
    }).start();
    
    execSync(
      `cd ${currentPwd} && npx create-nx-workspace@19.7.0 --preset apps --workspaceType integrated --name ${workspace_name}  --package-manager=yarn --nxCloud skip`,
      {
        stdio: 'inherit',
      },
    );
    spinner1.succeed(styles.success('Nx workspace created successfully'));

    console.log(`\n${styles.step(2)} ${styles.emoji.mobile} ${styles.success('Adding React Native to your workspace')}`);
    const spinner2 = ora({
      text: 'Installing React Native dependencies...',
      color: 'cyan'
    }).start();

    executeCommand(workspaceDirectory, `yarn add -D @nx/react-native@19.7.0 --ignore-scripts`, {
      stdio: 'inherit',
    });
    executeCommand(
      workspaceDirectory,
      `npx nx g @nx/react-native:app apps/mobile --bundler vite --install false --skip-nx-cache`,
      {
        stdio: 'inherit',
      },
    );

    addScriptsInRootPackageJson(workspaceDirectory);
    executeCommand(
      workspaceDirectory,
      `yarn install`,
      { stdio: 'inherit' },
    );

    spinner2.succeed(styles.success('React Native dependencies installed successfully'));

    console.log(`\n${styles.step(3)} ${styles.emoji.tools} ${styles.success('Setting up project configuration')}`);
    const spinner3 = ora({
      text: 'Configuring project files...',
      color: 'cyan'
    }).start();
    
    copyDir(`${workspaceDirectory}/.vscode`, `.vscode`);
    copyDir(`${workspaceDirectory}/.husky`, `.husky`);
    copyFile(`${workspaceDirectory}/.prettierrc`, '.prettierrc');
    copyFile(`${workspaceDirectory}/.prettierignore`, '.prettierignore');
    copyFile(`${workspaceDirectory}/.eslintrc.json`, '.eslintrc.json');
    copyFile(`${workspaceDirectory}/.eslintrc.json`, '.eslintrc.json');
    copyFile(`${workspaceDirectory}/.gitignore`, '.ignorefile');
    copyFile(`${workspaceDirectory}/.ruby-version`, '.ruby-version');
    copyFile(`${workspaceDirectory}/.nvmrc`, '.nvmrc');
    copyFile(`${workspaceDirectory}/check-env.sh`, `check-env.sh`);
    copyFile(`${workspaceDirectory}/clean-generated-outputs.sh`, `clean-generated-outputs.sh`);
    
    if (!isFresh) {
      removeDir(`${workspaceDirectory}/apps/mobile/src`);
      removeFile(`${workspaceDirectory}/apps/mobile/.vite.config.ts`);
      removeFile(`${workspaceDirectory}/apps/mobile/.babelrc.js`);
      copyDir(`${workspaceDirectory}/apps`, `apps`);
    }

    copyFile(`${workspaceDirectory}/apps/mobile/.gitignore`, `.ignorefile`);
    executeCommand(
      workspaceDirectory,
      `keytool -genkey -keystore ${workspaceDirectory}/apps/mobile/android/app/dev.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias dev -dname "cn=Unknown, ou=Unknown, o=Unknown, c=Unknown" -storepass development -keypass development`,
      {
        stdio: 'inherit',
      },
    );

    spinner3.succeed(styles.success('Project configuration completed'));
    
    console.log(`\n${styles.step(4)} ${styles.emoji.code} ${styles.success('Finalizing setup')}`);
    const spinner4 = ora({
      text: 'Linking assets...',
      color: 'cyan'
    }).start();
    
    executeCommand(
      mobileDirectory,
      `npx react-native-asset`,
      {
        stdio: 'inherit',
      },
    );
    
    spinner4.succeed(styles.success('Assets linked successfully'));

    console.log('\n');
    console.log(styles.title('╔════════════════════════════════════════════════════════╗'));
    console.log(styles.title('║  ') + styles.emoji.rocket + ' ' + styles.success('PROJECT CREATED SUCCESSFULLY') + styles.title('                       ║'));
    console.log(styles.title('╚════════════════════════════════════════════════════════╝'));
    console.log('\n');
    
    console.log(styles.subtitle('📋 NEXT STEPS:'));
    console.log(`${styles.emoji.check} ${styles.info('Rename your app:')} ${styles.command('npx nx-react-native-rename "<newName>" -b "<newBundleId>" ')}`);
    console.log(`${styles.emoji.warning} ${styles.warning("Don't forget to search for 'AppsMobile' and replace it with your app name")}`);
    console.log(`${styles.emoji.star} ${styles.info('Start your project:')} ${styles.command('npm run serve:mobile')}`);
    console.log('\n');
    console.log(styles.highlight(`${styles.emoji.sparkles} Happy coding! ${styles.emoji.sparkles}`));
    console.log('\n');
  });

program.parse(process.argv);
