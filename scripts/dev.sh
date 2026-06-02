#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-5173}"
HOST="${HOST:-127.0.0.1}"

ensure_node() {
  if [ -x "${N_PREFIX:-$HOME/.n}/bin/node" ]; then
    export PATH="${N_PREFIX:-$HOME/.n}/bin:$PATH"
  fi

  local major
  major="$(node -p "Number(process.versions.node.split('.')[0])")"
  if [ "$major" -lt 18 ]; then
    echo "需要 Node.js 18+（Vite 5 要求），当前: $(node -v)" >&2
    echo "安装示例: N_PREFIX=\$HOME/.n n 20 && export PATH=\$HOME/.n/bin:\$PATH" >&2
    exit 1
  fi
}

ensure_game_js() {
  if [ ! -f "$ROOT/game.js" ]; then
    echo "警告: 根目录缺少 game.js，尝试从 dist 复制..." >&2
    if [ -f "$ROOT/dist/game.js" ]; then
      cp "$ROOT/dist/game.js" "$ROOT/game.js"
    else
      echo "请先执行: npm run build（从 src/ 打包）或确保 game.js 存在" >&2
      exit 1
    fi
  fi
}

ensure_node
ensure_game_js

if command -v pnpm >/dev/null 2>&1 && [ -f pnpm-lock.yaml ]; then
  pnpm install
  exec pnpm run dev -- --host "$HOST" --port "$PORT"
fi

npm install
exec npm run dev -- --host "$HOST" --port "$PORT"
