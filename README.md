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
# Scan and select directories to delete (interactive)
dep-clean

# Scan specific directory
dep-clean ./projects

# Preview only (no deletion)
dep-clean --dry-run

# Delete all without selection UI
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
| `-y, --yes` | Delete all without selection UI |
| `--dry-run` | List directories without deleting |
| `--only <items>` | Only delete specified types (comma-separated) |
| `--exclude <items>` | Exclude specified types (comma-separated) |
| `-h, --help` | Display help |
| `-V, --version` | Display version |

## Interactive Selection

In default mode, you can select individual directories to delete using a checkbox UI.

| Key | Action |
|-----|--------|
| `↑` / `↓` | Move cursor |
| `Space` | Toggle selection |
| `a` | Toggle all |
| `Enter` | Confirm and delete |
| `n` | Cancel |

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

? Select directories to delete:
  (Space: toggle, a: toggle all, Enter: confirm, n: cancel)

❯ [x] ./project-a/node_modules     (245 MB)
  [x] ./project-b/node_modules     (312 MB)
  [ ] ./python-app/venv            (89 MB)
  [x] ./python-app/__pycache__     (2 MB)
  [x] ./rust-app/target            (1.2 GB)

✅ Deleted 4 directories, freed 1.76 GB
```

## License

MIT
