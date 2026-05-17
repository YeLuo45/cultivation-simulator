# PRD-V29: 宗门系统 AI 化

## 1. 概述

将宗门 NPC 改造为有记忆、分工、协作的智能角色。借鉴 ChatDev 角色协作模式，每个 NPC 有专属职责、对话记忆、任务队列、自动行为。

## 2. 现有数据结构（已验证）

### gameState.sect
```javascript
{
    name: null,           // 宗门名
    level: 0,             // 宗门等级 1-10
    spiritStones: 0,      // 宗门灵石
    disciples: [],        // 弟子数组
    elders: [],           // 长老 UID 数组
    buildings: { library: false, alchemy: false, forge: false, archive: false },
    techniques: [],      // 功法阁
    contributionShop: [],
    lastShopRefresh: 0,
    lastResourceCollection: 0
}
```

### disciple 对象
```javascript
{
    uid: 'xxx',           // 唯一 ID
    name: '弟子名称',
    talent: '中品',       // 下品/中品/上品/极品
    realm: 3,             // 境界 0-12
    status: 'idle',      // idle/training/collecting/meditating
    techniques: [],
    cultivationProgress: 0,
    taskEndDay: 0
}
```

### NPC 角色定义（新增）
```javascript
const SECT_NPC_ROLES = {
    'leader': { title: '掌门', icon: '👑', taskType: 'lead', taskDesc: '领导宗门', color: '#FFD700' },
    'elder':  { title: '长老', icon: '👴', taskType: 'train', taskDesc: '指导修炼', color: '#9c27b0' },
    'disciple': { title: '弟子', icon: '🧑‍🎓', taskType: 'collect', taskDesc: '采集/修炼', color: '#4CAF50' }
};
```

## 3. 功能列表

### 3.1 NPC 角色分配（自动）
- 创建宗门时，宗主自动成为「掌门」
- 招募的前 3 名弟子中，境界最高者自动晋升为「长老」（达到金丹期）
- 其他弟子为普通「弟子」

### 3.2 NPC 对话记忆（借鉴 nanobot）
- 每个 NPC 有独立对话历史：`npcDialogueHistory: [{day, speaker, text}]`
- 对话后记录到历史（最多 50 条）
- 与 NPC 对话时，可看到「历史对话」按钮
- 不同角色对话风格不同：
  - 掌门：发布任务、考核弟子、宗门战略
  - 长老：指导修炼、传授功法、评价天赋
  - 弟子：汇报任务、请求指点、闲聊

### 3.3 NPC 任务系统（借鉴 ChatDev 阶段链式协作）
- NPC 可被分配任务（自动执行）：
  - **修炼**：在指定日期前达到某境界
  - **采集**：每日自动采集灵石
  - **炼丹**：使用宗门丹房炼制丹药
  - **炼器**：使用宗门炼器坊炼制装备
- 任务进度在弟子面板显示
- 任务完成后自动结算奖励

### 3.4 NPC 自动行为
- 每天结算时，未分配任务的 NPC 自动「闭关修炼」
- 境界提升时自动触发 NPC 庆祝消息
- 宗门灵石不足时，掌门会发布「紧急任务」

### 3.5 NPC 互动界面（新增）
- 点击弟子卡片 → 查看详情 + 对话按钮
- 对话按钮 → 弹出 NPC 对话框（带历史记录）
- 任务分配按钮 → 选择任务类型和目标

## 4. UI 变更

### 4.1 弟子卡片新增
- 角色图标：👑 掌门 / 👴 长老 / 🧑‍🎓 弟子
- 任务状态标签：修炼中 / 采集中 / 闭关 / 空闲
- 对话按钮（聊天气泡图标）

### 4.2 NPC 对话框
- 标题栏：NPC 名称 + 角色图标 + 境界
- 消息区域：历史对话列表（滚动）
- 输入框：玩家输入文字
- 快捷按钮：请教/任务/闲聊

### 4.3 宗门面板 Tab 调整
- 新增「 NPC 」Tab（替代部分「管理」功能）
- 显示所有 NPC 角色卡片 + 快速对话入口

## 5. 实现步骤

### 步骤 1：数据结构扩展
- `gameState.sect` 新增 `npcDialogueHistory`（全局 NPC 对话总览）
- 每个 disciple 新增 `npcRole` 字段
- `gameState.sect` 新增 `npcTasks` 任务队列

### 步骤 2：NPC 角色分配逻辑
- 修改 `createSect()` 分配初始角色
- 修改 `recruitDisciple()` 自动晋升长老
- 新增 `assignNpcRole()` 函数

### 步骤 3：对话系统
- 新增 `openNpcDialogue(discipleUid)` 函数
- 新增 `sendNpcMessage(uid, message)` 函数
- 新增 `generateNpcResponse(uid, message)` 函数（根据角色生成回复）
- 对话历史存储和渲染

### 步骤 4：任务系统
- 新增 `assignNpcTask(uid, taskType, target)` 函数
- 新增 `processNpcTasks()` 每日结算
- 任务进度显示

### 步骤 5：UI 更新
- 修改 `renderDisciplesTab()` 显示角色图标和状态
- 新增 `renderNpcDialogueModal()` 对话框 UI
- 修改宗门 Tab 增加 NPC 标签页

### 步骤 6：自动行为
- 修改每日结算 `processDayEnd()` 调用 `processNpcTasks()`
- 新增 `npcAutoBehavior()` 自动闭关/发布任务

## 6. 约束
- 所有现有功能不变
- NPC 对话基于规则生成（无需 LLM API）
- 语法通过 `node --check` 验证
- commit 信息：`feat: V29 宗门AI化 - NPC分工/对话记忆/任务协作`

## 7. 验证方法
```bash
cd /home/hermes/cultivation-simulator
# 1. 语法验证
python3 -c "
import re
content = open('index.html','r',encoding='utf-8').read()
js = re.sub(r'<style.*?</style>','',content,flags=re.DOTALL)
js = re.sub(r'<[^>]+>','',js)
open('/tmp/v.js','w').write(js)
" && node --check /tmp/v.js && echo "SYNTAX OK"

# 2. 确认 NPC 函数存在
grep -c 'openNpcDialogue\|sendNpcMessage\|generateNpcResponse\|assignNpcTask\|processNpcTasks' index.html

# 3. 本地构建
node build_ci.js && echo "BUILD OK"
```