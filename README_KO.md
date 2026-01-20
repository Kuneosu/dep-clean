# dep-clean

[English](./README.md) | 한국어

`node_modules`, `venv`, `__pycache__` 등 의존성/캐시 디렉토리를 찾아 일괄 삭제하는 CLI 도구입니다.

[![npm version](https://img.shields.io/npm/v/@kuneosu/dep-clean.svg)](https://www.npmjs.com/package/@kuneosu/dep-clean)

## 설치

```bash
npm install -g @kuneosu/dep-clean
```

## 사용법

```bash
# 현재 디렉토리 스캔 (확인 후 삭제)
dep-clean

# 특정 디렉토리 스캔
dep-clean ./projects

# 목록만 확인 (삭제 안함)
dep-clean --dry-run

# 확인 없이 바로 삭제
dep-clean -y

# 특정 타입만 삭제
dep-clean --only node_modules
dep-clean --only node_modules,venv

# 특정 타입 제외
dep-clean --exclude vendor,Pods

# 도움말
dep-clean --help
```

## 옵션

| 옵션 | 설명 |
|------|------|
| `-y, --yes` | 확인 없이 바로 삭제 |
| `--dry-run` | 목록만 확인 (삭제 안함) |
| `--only <items>` | 특정 타입만 삭제 (쉼표 구분) |
| `--exclude <items>` | 특정 타입 제외 (쉼표 구분) |
| `-h, --help` | 도움말 |
| `-V, --version` | 버전 정보 |

## 삭제 대상 디렉토리

| 언어/프레임워크 | 디렉토리 |
|----------------|----------|
| JavaScript/Node.js | `node_modules`, `.next`, `dist`, `build`, `.parcel-cache`, `.turbo` |
| Python | `venv`, `.venv`, `env`, `__pycache__`, `.pytest_cache`, `.mypy_cache`, `.egg-info` |
| Java/Kotlin | `target`, `.gradle` |
| Rust | `target` |
| Go | `vendor` |
| Ruby | `vendor/bundle` |
| PHP | `vendor` |
| .NET | `bin`, `obj`, `packages` |
| iOS/macOS | `Pods`, `DerivedData` |

## 실행 예시

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

## 라이선스

MIT
