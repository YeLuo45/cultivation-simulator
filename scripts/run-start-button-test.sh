#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v node >/dev/null; then
  echo "需要 Node.js" >&2
  exit 1
fi

# 安装 playwright（若未安装）
if ! node -e "require('playwright')" 2>/dev/null; then
  npm install --no-save playwright@1.49.0
  npx playwright install chromium
fi

node tests/start-new-game.playwright.cjs
