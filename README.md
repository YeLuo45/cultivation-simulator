# cultivation-simulator

修仙模拟器游戏，支持角色养成和境界突破 + DAG任务链编辑器(V99)

## 基本信息

- **项目ID**: cultivation-simulator
- **本地路径**: `/home/hermes/projects/cultivation-simulator`
- **Windows 访问路径**: `\\wsl$\Ubuntu\home\hermes\projects\cultivation-simulator`（仅用于浏览文件，**不要**在此路径下执行 `npm`）
- **Git仓库**: https://github.com/YeLuo45/cultivation-simulator
- **创建时间**: 2026-06-01

## 环境要求

- **Node.js** >= 18（Vite 5 要求；推荐 20+）
- **包管理器**: 推荐 [pnpm](https://pnpm.io/)（项目含 `pnpm-lock.yaml` 与 `package-lock.json`）
- **WSL2**（Windows 用户推荐）: 项目位于 WSL 文件系统时，必须在 **WSL 内** 或通过 `scripts/dev.ps1` 启动，不能在 `\\wsl$\...` 目录下直接运行 `npm`

## 首次安装

在 **WSL 终端**（Ubuntu）中执行：

```bash
cd /home/hermes/projects/cultivation-simulator

# 安装依赖（推荐 pnpm）
pnpm install
# 或
npm install
```

WSL 默认 Node 版本过低时，可用 `n` 安装 Node 20：

```bash
N_PREFIX=$HOME/.n n 20
export PATH=$HOME/.n/bin:$PATH
```

---

## 本地运行

### Windows 用户必读

项目在 WSL 中时，**请勿**在 PowerShell 里这样做：

```powershell
cd \\wsl$\Ubuntu\home\hermes\projects\cultivation-simulator
npm run dev   # ❌ 会失败
```

典型报错：

```text
用作为当前目录的以上路径启动了 CMD.EXE。
UNC 路径不受支持。默认值设为 Windows 目录。
'vite' 不是内部或外部命令，也不是可运行的程序或批处理文件。
```

原因简述：

| 问题 | 说明 |
|------|------|
| UNC 路径 | `\\wsl$\...` 不能作为 CMD/npm 的当前工作目录 |
| vite 找不到 | 依赖安装在 WSL 的 `node_modules` 中，Windows 侧 CMD 无法使用 |

**正确做法**：使用下方「方式一」的 `dev.ps1`，或在 WSL 终端里执行 `npm run dev`。

---

### 方式一：一键脚本（推荐）

**Windows PowerShell**（项目在 WSL 文件系统时首选）

在资源管理器或 Cursor 打开项目后，于 PowerShell 中执行（当前目录可以是 `\\wsl$\...`，脚本会通过 WSL 启动）：

```powershell
.\scripts\dev.ps1
```

指定端口（例如 5173 已被 pixel-pal-web 等占用）：

```powershell
.\scripts\dev.ps1 -Port 5174
```

可选参数：

```powershell
.\scripts\dev.ps1 -Distro Ubuntu -ProjectPath /home/hermes/projects/cultivation-simulator -WslUser hermes -Port 5174
```

启动成功后浏览器访问：**http://127.0.0.1:5173/**（若改了端口则对应修改）。

**WSL / Linux / macOS**

```bash
cd /home/hermes/projects/cultivation-simulator
bash scripts/dev.sh
```

指定端口：

```bash
PORT=5174 bash scripts/dev.sh
```

---

### 方式二：在 WSL 内手动启动

打开 **Ubuntu (WSL)** 终端：

```bash
cd /home/hermes/projects/cultivation-simulator
npm install          # 首次需要
npm run dev
# 或
pnpm run dev
```

- 默认地址: http://127.0.0.1:5173/
- 指定端口: `npm run dev -- --host 127.0.0.1 --port 5174`

入口页面为 `index.html`，加载：

- `game.js` — 主逻辑
- `game-boot.js` — 启动补丁（保证「开始新游戏」可正常进入）

---

### 方式三：PowerShell 单行调用 WSL（不依赖 dev.ps1）

```powershell
wsl -d Ubuntu -- bash -lc "cd /home/hermes/projects/cultivation-simulator && npm run dev"
```

带 Node 路径（若使用 `n` 安装的 Node）：

```powershell
wsl -d Ubuntu -- env PATH=/home/hermes/.n/bin:/home/hermes/.npm-global/bin:/usr/bin:/bin HOME=/home/hermes bash --noprofile --norc -c "cd /home/hermes/projects/cultivation-simulator && bash scripts/dev.sh"
```

---

### 方式四：仅修改 `src/` 模块化代码时

根目录 `game.js` 为 Vite 开发入口；若只改 `src/` 下的 DDD 模块，需先打包再启动：

```bash
cd /home/hermes/projects/cultivation-simulator
npm run build              # esbuild: src/main.js → dist/game.js
cp dist/game.js game.js    # 同步到 Vite 使用的入口
npm run dev
```

---

### 生产构建预览

```bash
npm run build
npm run preview
```

---

## 常用脚本

| 命令 | 说明 | 运行环境 |
|------|------|----------|
| `.\scripts\dev.ps1` | Windows 下一键启动（走 WSL） | PowerShell |
| `bash scripts/dev.sh` | Linux/WSL 下一键启动 | WSL / Linux |
| `npm run dev` | Vite 开发服务器 | **仅 WSL/Linux** |
| `npm run build` | 从 `src/main.js` 打包到 `dist/game.js` | WSL / Linux |
| `npm run build:legacy` | CI/旧版：`node build_ci.js` | WSL / Linux |
| `npm run preview` | 预览生产构建 | WSL / Linux |
| `npm test` | Vitest 单元测试 | WSL / Linux |
| `node tests/start-new-game.playwright.cjs` | Playwright 验证「开始新游戏」 | WSL / Linux |

---

## 验证「开始新游戏」

在 WSL 中执行：

```bash
cd /home/hermes/projects/cultivation-simulator
# 需已安装 playwright（亦可: npm install --no-save playwright）
node tests/start-new-game.playwright.cjs
```

预期输出：

```text
PASS: 开始新游戏按钮可用，游戏界面已显示
```

---

## 项目结构

```
cultivation-simulator/
├── index.html              # 游戏页面入口
├── game.js                 # 运行时脚本（Vite dev 直接加载）
├── game-boot.js            # 启动补丁（修复「开始新游戏」无响应）
├── src/                    # DDD 模块化源码（main.js 入口）
├── dist/                   # 构建产物
├── domains/                # 领域常量与模块
├── scripts/
│   ├── dev.sh              # WSL/Linux 一键开发启动
│   ├── dev.ps1             # Windows → WSL 启动封装
│   └── run-start-button-test.sh
├── tests/
│   └── start-new-game.playwright.cjs
├── vite.config.js
├── build_src.js            # src → dist/game.js
└── package.json
```

---

## 部署

部署请参考各项目具体的 GitHub Pages 或其他部署文档。生产构建：

```bash
npm run build
# 或 GitHub Pages: npm run build:legacy
```

在线演示（若已部署）：https://yeluo45.github.io/cultivation-simulator/

---

## 故障排查

| 现象 | 处理 |
|------|------|
| `UNC 路径不受支持` + `'vite' 不是内部或外部命令` | **不要**在 `\\wsl$\...` 下执行 `npm`；改用 `.\scripts\dev.ps1` 或进入 WSL 后 `npm run dev` |
| PowerShell 中 `npm` / `vite` 找不到 | 依赖在 WSL 内，使用 `.\scripts\dev.ps1` 或 `wsl -d Ubuntu -- bash -lc "cd ... && npm run dev"` |
| 端口 5173 已被占用 | `.\scripts\dev.ps1 -Port 5174` 或 `PORT=5174 bash scripts/dev.sh` |
| 点击「开始新游戏」无反应 | 确认 `index.html` 已加载 `game-boot.js`；用 Playwright 脚本验证 |
| 页面空白 / `game.js` 404 | 确认根目录存在 `game.js`；缺失时 `npm run build && cp dist/game.js game.js` |
| `Vite` / `node` 命令找不到（WSL 内） | `export PATH=$HOME/.n/bin:$PATH` 或重新 `npm install` |
| Node 版本过低 | `N_PREFIX=$HOME/.n n 20 && export PATH=$HOME/.n/bin:$PATH` |
| 控制台 `gameState before initialization` | 来自 `game.js` 历史自测代码，一般**不阻断**开局；已由 `game-boot.js` 兜底 |

---

## 快速对照：我该用哪条命令？

| 你的环境 | 推荐命令 |
|----------|----------|
| Windows + 项目在 WSL | `.\scripts\dev.ps1` |
| Windows + 想指定端口 | `.\scripts\dev.ps1 -Port 5174` |
| WSL / Ubuntu 终端 | `bash scripts/dev.sh` 或 `npm run dev` |
| 已在 `\\wsl$\...` 的 PowerShell | **仅** `.\scripts\dev.ps1`，不要 `npm run dev` |
