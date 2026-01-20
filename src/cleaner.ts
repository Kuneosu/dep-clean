import * as fs from 'node:fs';
import type { FoundDirectory } from './types.js';

export interface DeleteResult {
  success: boolean;
  path: string;
  error?: string;
}

export async function deleteDirectory(dir: FoundDirectory): Promise<DeleteResult> {
  try {
    await fs.promises.rm(dir.path, { recursive: true, force: true });
    return { success: true, path: dir.path };
  } catch (err) {
    return {
      success: false,
      path: dir.path,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function deleteDirectories(
  directories: FoundDirectory[],
  onProgress?: (current: number, total: number, dir: FoundDirectory) => void
): Promise<DeleteResult[]> {
  const results: DeleteResult[] = [];

  for (let i = 0; i < directories.length; i++) {
    const dir = directories[i];

    if (onProgress) {
      onProgress(i + 1, directories.length, dir);
    }

    const result = await deleteDirectory(dir);
    results.push(result);
  }

  return results;
}
