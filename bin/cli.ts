#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Command } from 'commander';
import { run } from '../src/index.js';
import type { CliOptions } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf-8'));

const program = new Command();

program
  .name('dep-clean')
  .description('Find and delete dependency/cache directories like node_modules, venv, __pycache__')
  .version(pkg.version)
  .argument('[directory]', 'Target directory to scan', '.')
  .option('-y, --yes', 'Skip confirmation prompt', false)
  .option('--only <items>', 'Only delete specified types (comma-separated)')
  .option('--exclude <items>', 'Exclude specified types (comma-separated)')
  .option('--dry-run', 'List directories without deleting', false)
  .action(async (directory: string, options: CliOptions) => {
    try {
      await run(directory, options);
    } catch (err) {
      console.error('Error:', err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program.parse();
