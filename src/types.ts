export interface FoundDirectory {
  path: string;
  name: string;
  size: number;
  relativePath: string;
}

export interface ScanOptions {
  targetDir: string;
  only?: string[];
  exclude?: string[];
}

export interface CleanOptions {
  dryRun: boolean;
  yes: boolean;
}

export interface CliOptions {
  yes: boolean;
  only?: string;
  exclude?: string;
  dryRun: boolean;
}

export interface ScanResult {
  directories: FoundDirectory[];
  totalSize: number;
}
