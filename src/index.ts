import * as path from 'node:path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { deleteDirectories } from './cleaner.js';
import { scanDirectories } from './scanner.js';
import type { CliOptions, FoundDirectory, ScanResult } from './types.js';

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
}

function printDirectoryList(directories: FoundDirectory[]): void {
  console.log();
  console.log(chalk.bold(`Found ${directories.length} directories to clean:`));
  console.log();

  for (const dir of directories) {
    const sizeStr = chalk.yellow(`(${formatSize(dir.size)})`);
    console.log(`  ${chalk.cyan('\u{1F4C1}')} ${dir.relativePath.padEnd(50)} ${sizeStr}`);
  }

  console.log();
}

async function confirmDelete(): Promise<boolean> {
  const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Delete all directories?',
      default: false,
    },
  ]);

  return confirm;
}

export async function run(targetPath: string, options: CliOptions): Promise<void> {
  const absolutePath = path.resolve(targetPath);

  console.log();
  console.log(chalk.blue('\u{1F50D}') + ` Scanning ${chalk.bold(absolutePath)}...`);

  const spinner = ora({ text: 'Scanning directories...', isSilent: !process.stdout.isTTY }).start();

  const only = options.only ? options.only.split(',').map((s) => s.trim()) : undefined;
  const exclude = options.exclude ? options.exclude.split(',').map((s) => s.trim()) : undefined;

  let scanResult: ScanResult;

  try {
    scanResult = await scanDirectories({
      targetDir: absolutePath,
      only,
      exclude,
    });
  } catch (err) {
    spinner.fail('Failed to scan directories');
    console.error(chalk.red(err instanceof Error ? err.message : String(err)));
    process.exit(1);
  }

  spinner.stop();
  spinner.clear();

  const { directories, totalSize } = scanResult;

  if (directories.length === 0) {
    console.log();
    console.log(chalk.green('\u2705') + ' No directories found to clean.');
    return;
  }

  printDirectoryList(directories);
  console.log(chalk.bold(`Total: ${chalk.yellow(formatSize(totalSize))}`));
  console.log();

  if (options.dryRun) {
    console.log(chalk.blue('\u2139\uFE0F') + '  Dry run mode - no files deleted.');
    return;
  }

  let shouldDelete = options.yes;

  if (!shouldDelete) {
    shouldDelete = await confirmDelete();
  }

  if (!shouldDelete) {
    console.log(chalk.yellow('Cancelled.'));
    return;
  }

  console.log();
  const deleteSpinner = ora({ text: 'Deleting directories...', isSilent: !process.stdout.isTTY }).start();

  let deletedCount = 0;
  let freedSize = 0;

  const results = await deleteDirectories(directories, (current, total, dir) => {
    deleteSpinner.text = `Deleting ${current}/${total}: ${dir.relativePath}`;
  });

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.success) {
      deletedCount++;
      freedSize += directories[i].size;
    }
  }

  deleteSpinner.text = '';
  deleteSpinner.stopAndPersist({ symbol: '' });

  const failedResults = results.filter((r) => !r.success);

  if (failedResults.length > 0) {
    console.log();
    console.log(chalk.yellow('\u26A0\uFE0F') + ` Some directories could not be deleted:`);
    for (const result of failedResults) {
      console.log(chalk.red(`  - ${result.path}: ${result.error}`));
    }
  }

  console.log();
  console.log(
    chalk.green('\u2705') +
      ` Deleted ${deletedCount} directories, freed ${chalk.bold(formatSize(freedSize))}`
  );
}
