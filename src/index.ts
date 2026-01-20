import * as path from 'node:path';
import * as readline from 'node:readline';
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

async function selectDirectoriesToDelete(directories: FoundDirectory[]): Promise<FoundDirectory[] | null> {
  const maxPathLength = Math.max(...directories.map((d) => d.relativePath.length));

  const choices = directories.map((dir) => ({
    name: `${dir.relativePath.padEnd(maxPathLength + 2)} (${formatSize(dir.size)})`,
    value: dir,
    checked: true,
  }));

  console.log(chalk.cyan('? ') + chalk.bold('Select directories to delete:'));
  console.log(chalk.dim('  (Space: toggle, a: toggle all, Enter: confirm, n: cancel)'));
  console.log();

  let cancelled = false;

  const promptPromise = inquirer.prompt<{ selected: FoundDirectory[] }>([
    {
      type: 'checkbox',
      name: 'selected',
      message: '',
      choices,
      pageSize: 15,
    },
  ]);

  readline.emitKeypressEvents(process.stdin);
  const keypressHandler = (_: string, key: { name: string; ctrl?: boolean }) => {
    if (key && key.name === 'n' && !key.ctrl) {
      cancelled = true;
      (promptPromise.ui as unknown as { close: () => void }).close();
    }
  };
  process.stdin.on('keypress', keypressHandler);

  try {
    const { selected } = await promptPromise;
    return cancelled ? null : selected;
  } catch {
    return null;
  } finally {
    process.stdin.removeListener('keypress', keypressHandler);
  }
}

async function performDelete(directories: FoundDirectory[]): Promise<void> {
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

  // -y 플래그: 전체 삭제
  if (options.yes) {
    await performDelete(directories);
    return;
  }

  // 기본 모드: 체크박스 UI
  const selectedDirs = await selectDirectoriesToDelete(directories);

  if (selectedDirs === null) {
    console.log(chalk.yellow('Cancelled.'));
    return;
  }

  if (selectedDirs.length === 0) {
    console.log(chalk.yellow('No directories selected.'));
    return;
  }

  await performDelete(selectedDirs);
}
