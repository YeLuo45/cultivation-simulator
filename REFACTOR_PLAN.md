# 修仙模拟器重构方案

## 现状问题

1. `js/` 30个模块是历史遗迹（refactor 分支产物），从未参与构建
2. `npm run build` 只是 `cp game.js dist/game.js`，无任何验证
3. 无语法检查（node --check 不在 CI 里）
4. Playwright 测试存在但从未在 CI 中运行
5. game.js 17,717 行单文件，366 个 `// =====` 分节标记

## 重构目标

用 **Vite** 替代 `build_ci.js`，实现：
- 构建时 `node --check` 验证语法
- Playwright 冒烟测试验证运行时
- 构建产物可控、可重复

## 新构建流程

```
game.js (源码)
  ↓ Vite 打包
dist/game.js (哈希命名)
dist/index.html (引用哈希 JS)
  ↓ GitHub Actions CI
  ↓ Playwright 测试
  ↓ 部署到 gh-pages
```

## 实施步骤

### Step 1: 新建打包入口 `vite.config.js`

```javascript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, 'entry.js'),
      name: 'CultivationSimulator',
      fileName: 'game',
      format: 'iife',
    },
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'game-[hash].js',
      },
    },
    minify: false,
    sourcemap: false,
  },
});
```

### Step 2: 新建 `entry.js` (游戏入口)

由于 game.js 是"意外全局"风格（无 export，函数直接赋给 window），
用 IIFE 包装 + shim，让 Vite 能打包：

```javascript
// Shim CONFIG 和 gameState 前置依赖
import './shim.js';
// 加载主游戏（impure 全局风格）
import './game.js';
// 初始化
window.init && window.init();
```

### Step 3: 新建 `shim.js` (前置依赖填充)

game.js 依赖的全局变量（CONFIG, gameState 等）在 Vite 打包前必须存在。
shim.js 定义这些"假"全局，让打包时无 ReferenceError。

### Step 4: 修改 `package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "node build_vite.js",
    "test": "playwright test",
    "build:ci": "npm run build && npm run test"
  }
}
```

### Step 5: 重写 `.github/workflows/deploy.yml`

```yaml
- run: npm ci
- run: npm run build
- run: npm test          # Playwright 冒烟测试
- uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
    publish_branch: gh-pages
```

### Step 6: 更新 `build_ci.js` 兼容旧构建

保留 `build_ci.js` 作为 fallback（当 Vite 不可用时）。

## 游戏文件依赖分析

game.js 依赖的全局变量（需要在 shim.js 中定义）：

| 全局变量 | 定义位置 | 说明 |
|----------|----------|------|
| CONFIG | game.js 开头 | 游戏配置常量 |
| gameState | game.js | 游戏状态对象 |
| miniMaxConfig | game.js | AI 配置 |
| DEFAULT_MINIMAX_CONFIG | game.js | AI 默认配置 |

## 实施顺序

1. 新建 `vite.config.js` + `entry.js` + `shim.js`
2. `npm run build` 验证能生成 `dist/game-xxx.js`
3. 验证 `dist/index.html` 引用正确的哈希 JS
4. 修改 `deploy.yml` 加入 test step
5. 本地验证 Playwright 测试通过
6. Commit + push 触发 CI
7. CI 通过后删除 js/ 目录（或保留不删）

## 风险

- game.js 是 impure 全局风格，Vite IIFE 打包可能有变量作用域问题
- 解决：shim.js 提前定义所有顶层依赖

## 验证标准

```bash
npm run build
# 生成 dist/game-[hash].js + dist/index.html

node --check dist/game-[hash].js
# 无 SyntaxError

curl -s https://yeluo45.github.io/cultivation-simulator/
# HTTP 200
```
