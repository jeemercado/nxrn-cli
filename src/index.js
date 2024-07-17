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
} from './utils/index.js';

program
  .name('React Native Starter with NX')
  .description('A starter script to create a new React Native project with NX')
  .version('1.0.0');

program
  .command('create')
  .description('create nx workspace with react-native')
  .action((options) => {
    const currentPwd = process.cwd();

    inquirer
      .prompt([
        {
          type: 'input',
          name: 'directory',
          message: 'Enter the directory name to create the project',
        },
      ])
      .then((answers) => {
        const { directory } = answers;
        const workspaceDirectory = `${currentPwd}/${directory}`;

        console.log(chalk.green(`Creating Nx workspace in ./${directory}!`));
        const spinner1 = ora().start('Creating Nx workspace');
        execSync(`cd ${currentPwd} && npx create-nx-workspace@latest --name ${directory}`, {
          stdio: 'inherit',
        });
        spinner1.succeed('Nx workspace created');

        const spinner2 = ora().start('Adding React Native');
        executeCommand(workspaceDirectory, `npx nx reset`, {
          stdio: 'inherit',
        });
        executeCommand(workspaceDirectory, `npm i -D @nx/react-native@17.3.0`, {
          stdio: 'inherit',
        });
        executeCommand(workspaceDirectory, `npx nx g @nx/react-native:app apps/mobile --skip-nx-cache`, {
          stdio: 'inherit',
        });
        executeCommand(
          workspaceDirectory,
          `npm install --save-dev react-native-dotenv husky prettier@3.3.2 @typescript-eslint/parser@6.21.0 eslint-config-airbnb-typescript@17.1.0 eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-perf eslint-plugin-sonarjs@0.25.1 @tanstack/eslint-plugin-query eslint-plugin-tailwindcss eslint-config-prettier @typescript-eslint/eslint-plugin@6.13.2 eslint-plugin-import eslint-plugin-sort-destructure-keys eslint-plugin-sort-keys-fix eslint-plugin-prettier prettier-plugin-tailwindcss eslint-import-resolver-typescript @swc-node/register@~1.8.0`,
          { stdio: 'inherit' },
        );
        executeCommand(
          workspaceDirectory,
          `npm install tailwindcss twrnc react-native-keyboard-aware-scroll-view react-native-safe-area-context @react-navigation/core @react-navigation/native @react-navigation/native-stack @react-navigation/routers @react-navigation/stack react-native-gesture-handler react-native-screens react-native-reanimated dayjs zustand jotai @tanstack/query-core @tanstack/query-sync-storage-persister @tanstack/react-query @tanstack/react-query-persist-client axios jotai-optics lodash react-hook-form react-native-fast-image react-native-get-random-values react-native-simple-toast react-native-url-polyfill zod zod-validation-error @react-native-async-storage/async-storage @react-native-community/hooks @gorhom/bottom-sheet @hookform/resolvers @react-native-community/datetimepicker @react-navigation/material-top-tabs @tanstack/query-async-storage-persister babel-plugin-module-resolver react-native-dotenv react-native-mmkv react-native-modal-datetime-picker react-native-pager-view react-native-modal react-native-svg-transformer react-native-url-polyfill uuid`,
          { stdio: 'inherit' },
        );
        spinner2.succeed('React Native added');

        const spinner3 = ora().start('Adding files');
        copyDir(`${workspaceDirectory}/.vscode`, `.vscode`);
        copyDir(`${workspaceDirectory}/.husky`, `.husky`);
        copyFile(`${workspaceDirectory}/.prettierrc`, '.prettierrc');
        copyFile(`${workspaceDirectory}/.prettierignore`, '.prettierignore');
        copyFile(`${workspaceDirectory}/.eslintrc.json`, '.eslintrc.json');
        copyFile(`${workspaceDirectory}/.eslintrc.json`, '.eslintrc.json');
        copyFile(`${workspaceDirectory}/.gitignore`, '.gitignore');
        copyFile(`${workspaceDirectory}/.ruby-version`, '.ruby-version');
        copyFile(`${workspaceDirectory}/.nvmrc`, '.nvmrc');
        copyFile(`${workspaceDirectory}/check-env.sh`, `check-env.sh`);
        copyFile(`${workspaceDirectory}/clean-generated-outputs.sh`, `clean-generated-outputs.sh`);
        removeDir(`${workspaceDirectory}/apps/mobile/src`);
        copyDir(`${workspaceDirectory}/apps`, `apps`);
        executeCommand(workspaceDirectory, `keytool -genkey -keystore ${workspaceDirectory}/apps/mobile/android/app/dev.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias dev -dname "cn=Unknown, ou=Unknown, o=Unknown, c=Unknown" -storepass development -keypass development`, {
          stdio: 'inherit',
        });
        addScriptsInRootPackageJson(workspaceDirectory);
        spinner3.succeed('Files added');

        console.log(chalk.green('Project created successfully!'));
        console.log(
          chalk.blue(
            'Next Steps? Rename your app using https://www.npmjs.com/package/react-native-rename',
          ),
        );
        console.log(
          chalk.blue(
            "Don't forget to wide search for 'AppsMobile' and replace it with your app name",
          ),
        );
        console.log(chalk.blue('Run `npm run serve:mobile` to start the project! Happy coding!'));
      });
  });

program.parse(process.argv);