import * as fs from 'node:fs';
import * as path from 'node:path';
import { DEFAULT_TARGETS, SKIP_DIRECTORIES } from './config.js';
import type { FoundDirectory, ScanOptions, ScanResult } from './types.js';

async function getDirectorySize(dirPath: string): Promise<number> {
  let totalSize = 0;

  async function calculateSize(currentPath: string): Promise<void> {
    try {
      const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          await calculateSize(fullPath);
        } else if (entry.isFile()) {
          try {
            const stat = await fs.promises.stat(fullPath);
            totalSize += stat.size;
          } catch {
            // Skip files we can't access
          }
        }
      }
    } catch {
      // Skip directories we can't access
    }
  }

  await calculateSize(dirPath);
  return totalSize;
}

function shouldTarget(name: string, targets: string[]): boolean {
  // Exact match
  if (targets.includes(name)) {
    return true;
  }

  // Pattern match for *.egg-info
  if (name.endsWith('.egg-info') && targets.includes('.egg-info')) {
    return true;
  }

  return false;
}

export async function scanDirectories(options: ScanOptions): Promise<ScanResult> {
  const { targetDir, only, exclude } = options;

  let targets = only && only.length > 0 ? only : DEFAULT_TARGETS;

  if (exclude && exclude.length > 0) {
    targets = targets.filter((t) => !exclude.includes(t));
  }

  const foundDirectories: FoundDirectory[] = [];

  async function scan(currentDir: string): Promise<void> {
    try {
      const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const fullPath = path.join(currentDir, entry.name);

        // Skip version control directories
        if (SKIP_DIRECTORIES.includes(entry.name)) {
          continue;
        }

        // Check if this directory is a target
        if (shouldTarget(entry.name, targets)) {
          const size = await getDirectorySize(fullPath);
          const relativePath = path.relative(targetDir, fullPath);

          foundDirectories.push({
            path: fullPath,
            name: entry.name,
            size,
            relativePath: './' + relativePath,
          });

          // Don't scan inside target directories
          continue;
        }

        // Recursively scan subdirectories
        await scan(fullPath);
      }
    } catch {
      // Skip directories we can't access
    }
  }

  await scan(targetDir);

  // Sort by size descending
  foundDirectories.sort((a, b) => b.size - a.size);

  const totalSize = foundDirectories.reduce((sum, dir) => sum + dir.size, 0);

  return {
    directories: foundDirectories,
    totalSize,
  };
}
