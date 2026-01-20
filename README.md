# dep-clean

English | [한국어](./README_KO.md)

[![npm version](https://img.shields.io/npm/v/@kuneosu/dep-clean.svg)](https://www.npmjs.com/package/@kuneosu/dep-clean)
[![npm downloads](https://img.shields.io/npm/dm/@kuneosu/dep-clean.svg)](https://www.npmjs.com/package/@kuneosu/dep-clean)

CLI tool to find and delete dependency/cache directories like `node_modules`, `venv`, `__pycache__`, and more.

## Installation

```bash
npm install -g @kuneosu/dep-clean
```

## Usage

```bash
# Scan current directory (with confirmation)
dep-clean

# Scan specific directory
dep-clean ./projects

# Preview only (no deletion)
dep-clean --dry-run

# Delete without confirmation
dep-clean -y

# Delete only specific types
dep-clean --only node_modules
dep-clean --only node_modules,venv

# Exclude specific types
dep-clean --exclude vendor,Pods

# Show help
dep-clean --help
```

## Options

| Option | Description |
|--------|-------------|
| `-y, --yes` | Skip confirmation prompt |
| `--dry-run` | List directories without deleting |
| `--only <items>` | Only delete specified types (comma-separated) |
| `--exclude <items>` | Exclude specified types (comma-separated) |
| `-h, --help` | Display help |
| `-V, --version` | Display version |

## Target Directories

| Language/Framework | Directories |
|--------------------|-------------|
| JavaScript/Node.js | `node_modules`, `.next`, `dist`, `build`, `.parcel-cache`, `.turbo` |
| Python | `venv`, `.venv`, `env`, `__pycache__`, `.pytest_cache`, `.mypy_cache`, `.egg-info` |
| Java/Kotlin | `target`, `.gradle` |
| Rust | `target` |
| Go | `vendor` |
| Ruby | `vendor/bundle` |
| PHP | `vendor` |
| .NET | `bin`, `obj`, `packages` |
| iOS/macOS | `Pods`, `DerivedData` |

## Example Output

```
🔍 Scanning /Users/k/projects...

Found 5 directories to clean:

  📁 ./project-a/node_modules     (245 MB)
  📁 ./project-b/node_modules     (312 MB)
  📁 ./python-app/venv            (89 MB)
  📁 ./python-app/__pycache__     (2 MB)
  📁 ./rust-app/target            (1.2 GB)

Total: 1.85 GB

? Delete all directories? Yes

✅ Deleted 5 directories, freed 1.85 GB
```

## License

MIT
