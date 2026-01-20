export const DEFAULT_TARGETS: string[] = [
  // JavaScript/Node.js
  'node_modules',
  '.next',
  'dist',
  'build',
  '.parcel-cache',
  '.turbo',

  // Python
  'venv',
  '.venv',
  'env',
  '__pycache__',
  '.pytest_cache',
  '.mypy_cache',
  '.egg-info',

  // Java/Kotlin
  'target',
  '.gradle',

  // Rust (target already included above)

  // Go
  'vendor',

  // Ruby
  'vendor/bundle',

  // PHP (vendor already included above)

  // .NET
  'bin',
  'obj',
  'packages',

  // iOS/macOS
  'Pods',
  'DerivedData',
];

export const SKIP_DIRECTORIES: string[] = [
  '.git',
  '.svn',
  '.hg',
];
