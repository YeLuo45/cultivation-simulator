# V95 迭代方向：多智能体编排任务系统 + 事件驱动插件架构

> 基于 6 个设计框架的架构融合：claude-code / nanobot / chatdev / thunderbolt / generic-agent / ruflo

---

## 1. 核心主题：多智能体协作式仙界任务系统 (Multi-Agent Orchestrated Quest System)

### 1.1 设计动机

- **V94**: AI Budget Control (ai_budget工具，Token Budget)
- **V93**: MCP Agent Bridge Phase 1
- **V92**: 仙界秘境探索系统

V95 需要在现有"AI Budget"和"MCP Agent Bridge"基础上，构建**真正意义的NPC多智能体协作系统**。

### 1.2 六大框架融合矩阵

| 设计框架 | 核心思想 | 应用于 V95 |
|---------|---------|------------|
| **claude-code** | Token Budget 模式、工具注册与调度 | AI Budget-aware 任务执行，工具注册表 |
| **nanobot** | Cost tracking、任务计量、预算感知执行 | Quest 成本追踪，资源预算调度 |
| **chatdev** | DAG执行、环路检测、递归任务执行 | Quest 依赖图，并行任务触发 |
| **thunderbolt** | 并发执行、双向同步、速率限制 | NPC 并发交互，跨服同步 |
| **generic-agent** | 五层记忆系统 (L0-L4) + 多智能体协作 | NPC 持久记忆，技能结晶 |
| **ruflo** | Hook 系统、事件驱动插件架构 | Quest 钩子，事件总线 |

---

## 2. 核心功能设计

### 2.1 DAG-based 任务编排系统

```
┌─────────────────────────────────────────────────────────────┐
│                    Quest Graph Engine                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │ Quest A  │───▶│ Quest B  │───▶│ Quest C  │             │
│  └──────────┘    └─────┬────┘    └──────────┘             │
│       │                │                                   │
│       ▼                ▼                                   │
│  ┌──────────┐    ┌──────────┐                             │
│  │ Quest D  │◀───│ Quest E  │  (环路检测)                   │
│  └──────────┘    └──────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

**核心特性**：
- 基于 ChatDev 的 DAG 执行引擎
- 支持并行任务分支（如：同时探索多个秘境）
- **环路检测**：防止任务循环依赖
- **递归任务执行**：子 Quest 自动展开

### 2.2 NPC 多智能体协作系统

基于 GenericAgent 五层记忆 (L0-L4)：

| 层级 | 名称 | 内容 |
|-----|------|-----|
| L0 | Meta Rules | NPC 核心约束（如：不会主动攻击玩家） |
| L1 | Insight Index | NPC 记忆索引，快速检索 |
| L2 | Global Facts | NPC 持久知识（门派关系、地理认知） |
| L3 | Task Skills/SOPs | NPC 任务执行流程（可结晶） |
| L4 | Session Archive | NPC 历史任务记录 |

**NPC 技能结晶机制**：
- NPC 完成复杂任务 → 路径结晶为 SOP
- SOP 可被其他 NPC 复用
- 随着游戏进行，NPC 群体能力持续提升

### 2.3 Hook 驱动的 Quest 事件系统

基于 Ruflo Hook 系统设计：

```javascript
// Quest 钩子示例
hooks.register("quest_start", async (ctx) => {
  // 任务开始前：检查前置条件、分配资源
  await checkBudget(ctx.questId);
  await allocateNPCs(ctx.requiredAgents);
});

hooks.register("quest_complete", async (ctx) => {
  // 任务完成后：结算奖励、更新NPC记忆
  await distributeRewards(ctx.questId);
  await updateNPCMemory(ctx.participants);
});
```

**内置 Hooks**：

| Hook | 触发时机 | 用途 |
|------|---------|------|
| `pre_quest` | 任务开始前 | 预算检查、资源分配 |
| `post_quest` | 任务完成后 | 奖励结算、记忆更新 |
| `npc_spawn` | NPC 生成 | 初始化 NPC 五层记忆 |
| `npc_despawn` | NPC 销毁 | 持久化记忆到 L4 |
| `loop_detected` | 环路检测到 | 防止死循环 |
| `budget_exceeded` | 预算超限 | 任务降级或中断 |

### 2.4 预算感知的任务执行

基于 Claude-Code Budget Mode + Nanobot Cost Tracking：

```javascript
// Quest 执行预算
const questBudget = {
  totalTokens: 100000,
  perStepBudget: 5000,
  npcCostPerTick: 200,
  concurrentLimit: 5
};
```

**特性**：
- 任务执行前检查 Token Budget
- 支持任务暂停/恢复（Budget 恢复后继续）
- 并发任务数量限制（防止资源耗尽）

---

## 3. 具体玩法机制

### 3.1 玩家任务编辑器 (Quest Authoring)

玩家可通过 YAML/JSON 定义自定义 Quest：

```yaml
# 玩家创建的 Quest 示例
quest: 宗门任务_巡逻
type: dag
budget: 50000
nodes:
  - id: start
    type: patrol
    target: sect_territory
  - id: discover
    type: encounter
    requires: [start]
    npc_pool: [guard_1, guard_2]
  - id: combat
    type: battle
    requires: [discover]
    difficulty: dynamic  # 根据玩家等级动态调整
  - id: report
    type: report_back
    requires: [combat]
    reward:
      spirit_stones: dynamic
      sect_reputation: +10
```

### 3.2 NPC 协作模式

NPC 之间通过 MCP 协议通信：

```
玩家
  │
  ▼
┌─────────────────────────────────────────────┐
│  Quest Manager (MCP Bridge)                 │
│  ├── DAG Executor                          │
│  ├── Budget Controller                      │
│  └── Hook Engine                           │
└─────────────────────────────────────────────┘
  │              │              │
  ▼              ▼              ▼
NPC-A          NPC-B          NPC-C
(守卫)        (探查者)       (战斗型)
```

**NPC 职责分工**：
- **守卫型**：巡逻、警戒、触发事件
- **探查型**：探索、发现、资源标记
- **战斗型**：执行战斗、护送

### 3.3 动态难度与预算联动

```javascript
// 预算驱动的动态难度
function calculateQuestDifficulty(quest, playerLevel, availableBudget) {
  if (availableBudget < quest.minBudget) {
    return "simplified";  // 降级模式
  }
  if (availableBudget > quest.maxBudget * 1.5) {
    return "challenge";   // 挑战模式
  }
  return "standard";
}
```

---

## 4. MCP 工具清单 (6个)

### Tool 1: `quest_create`

```javascript
{
  name: "quest_create",
  description: "创建一个基于 DAG 的任务",
  input: {
    questId: "string",
    dagDefinition: "object",  // DAG 结构
    budget: "number",
    hookConfig: "object[]"
  },
  output: {
    questId: "string",
    status: "created|pending"
  }
}
```

### Tool 2: `quest_execute`

```javascript
{
  name: "quest_execute",
  description: "执行任务图，支持并行节点",
  input: {
    questId: "string",
    context: "object",
    maxConcurrent: "number"  // 限流
  },
  output: {
    status: "running|completed|paused|budget_exceeded",
    completedNodes: "string[]",
    remainingNodes: "string[]",
    budgetUsed: "number"
  }
}
```

### Tool 3: `npc_spawn`

```javascript
{
  name: "npc_spawn",
  description: "生成具有五层记忆的 NPC",
  input: {
    npcId: "string",
    template: "string",  // NPC 模板
    mission: "object"    // 初始任务
  },
  output: {
    npcId: "string",
    memoryLayers: "object"  // L0-L4 状态
  }
}
```

### Tool 4: `npc_memory_update`

```javascript
{
  name: "npc_memory_update",
  description: "更新 NPC 的五层记忆系统",
  input: {
    npcId: "string",
    layer: "L0|L1|L2|L3|L4",
    content: "string",
    crystallize: "boolean"  // 是否结晶为 SOP
  },
  output: {
    layer: "string",
    memorySize: "number",
    newSkillAvailable: "boolean"
  }
}
```

### Tool 5: `hook_register`

```javascript
{
  name: "hook_register",
  description: "注册 Quest 事件钩子",
  input: {
    hookName: "string",
    callback: "function",
    async: "boolean"
  },
  output: {
    hookId: "string",
    active: "boolean"
  }
}
```

### Tool 6: `budget_query`

```javascript
{
  name: "budget_query",
  description: "查询任务执行预算状态",
  input: {
    scope: "quest|npc|global",
    entityId: "string"
  },
  output: {
    totalBudget: "number",
    used: "number",
    available: "number",
    rateLimited: "boolean"
  }
}
```

---

## 5. 技术实现要点

### 5.1 DAG 执行引擎

```javascript
// 基于 ChatDev 的 DAG 执行
class DAGExecutor {
  constructor() {
    this.graph = new Map();
    this.completedNodes = new Set();
    this.pendingNodes = new Set();
  }

  addNode(nodeId, dependencies) {
    this.graph.set(nodeId, {
      dependencies: dependencies || [],
      status: 'pending'
    });
  }

  // 环路检测 (DFS)
  detectCycle(nodeId, visited, recStack) {
    visited.add(nodeId);
    recStack.add(nodeId);

    for (const dep of this.graph.get(nodeId)?.dependencies || []) {
      if (!visited.has(dep)) {
        if (this.detectCycle(dep, visited, recStack)) return true;
      } else if (recStack.has(dep)) {
        return true;  // 发现环路
      }
    }

    recStack.delete(nodeId);
    return false;
  }

  // 获取可执行的节点（所有依赖都已完成）
  getExecutableNodes() {
    return Array.from(this.graph.keys())
      .filter(nodeId => {
        if (this.completedNodes.has(nodeId)) return false;
        const deps = this.graph.get(nodeId).dependencies;
        return deps.every(dep => this.completedNodes.has(dep));
      });
  }
}
```

### 5.2 NPC 五层记忆实现

```javascript
// 基于 GenericAgent 的五层记忆
class NPCMemorySystem {
  constructor(npcId) {
    this.npcId = npcId;
    this.layers = {
      L0: { type: 'meta', content: [], persistent: true },
      L1: { type: 'index', content: [], persistent: true },
      L2: { type: 'facts', content: [], persistent: true },
      L3: { type: 'skills', content: [], persistent: true },
      L4: { type: 'archive', content: [], persistent: true }
    };
  }

  // 记忆结晶：将执行路径转为 SOP
  crystallize(executionPath) {
    const skill = {
      id: `skill_${Date.now()}`,
      path: executionPath,
      created: Date.now(),
      usageCount: 0
    };
    this.layers.L3.content.push(skill);
    this.updateL1Index(skill);  // 更新 L1 索引
    return skill;
  }

  // 检索相关技能
  retrieveRelevantSkills(task) {
    const index = this.layers.L1.content;
    const relevant = index.filter(i => i.tags.includes(task.type));
    return relevant.map(i => this.layers.L3.content.find(s => s.id === i.skillId));
  }
}
```

### 5.3 Hook 引擎实现

```javascript
// 基于 Ruflo 的 Hook 系统
class HookEngine {
  constructor() {
    this.hooks = new Map();
    this.workers = [];
  }

  register(hookName, callback) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    this.hooks.get(hookName).push(callback);
  }

  async emit(hookName, context) {
    const callbacks = this.hooks.get(hookName) || [];
    const results = [];
    for (const cb of callbacks) {
      try {
        results.push(await cb(context));
      } catch (e) {
        console.error(`Hook ${hookName} error:`, e);
      }
    }
    return results;
  }

  // 注册后台 Worker
  worker(name, callback) {
    this.workers.push({ name, callback, interval: 5000 });
  }

  startWorkers() {
    this.workers.forEach(w => {
      setInterval(() => w.callback(), w.interval);
    });
  }
}
```

### 5.4 预算控制实现

```javascript
// 基于 Claude-Code Budget Mode
class BudgetController {
  constructor(globalBudget) {
    this.globalBudget = globalBudget;
    this.usedBudget = 0;
    this.rateLimits = new Map();
  }

  checkBudget(questId, required) {
    const available = this.globalBudget - this.usedBudget;
    return available >= required;
  }

  allocate(questId, amount) {
    if (!this.checkBudget(questId, amount)) {
      return { success: false, reason: 'budget_exceeded' };
    }
    this.usedBudget += amount;
    return { success: true, remaining: this.globalBudget - this.usedBudget };
  }

  release(questId, amount) {
    this.usedBudget = Math.max(0, this.usedBudget - amount);
  }

  // 速率限制
  checkRateLimit(entityId, maxPerSecond) {
    const key = `rate_${entityId}`;
    const now = Date.now();
    const last = this.rateLimits.get(key) || 0;
    if (now - last < 1000 / maxPerSecond) {
      return false;
    }
    this.rateLimits.set(key, now);
    return true;
  }
}
```

---

## 6. 数据模型

### 6.1 Quest 结构

```javascript
const questSchema = {
  questId: "string",
  name: "string",
  type: "dag|linear|event",
  budget: {
    total: "number",
    used: "number",
    limitPerNode: "number"
  },
  dag: {
    nodes: [{
      id: "string",
      type: "string",
      requires: "string[]",
      npcAssignment: "string[]",
      hook: "string"
    }],
    edges: "Array<[from, to]>"
  },
  hooks: {
    pre_quest: "function",
    post_quest: "function"
  },
  status: "pending|running|completed|paused"
};
```

### 6.2 NPC 记忆结构

```javascript
const npcMemorySchema = {
  npcId: "string",
  layers: {
    L0: { rules: "string[]" },
    L1: { index: "Array<{tag, skillId, confidence}>" },
    L2: { facts: "Array<{fact, timestamp}>" },
    L3: { skills: "Array<{id, path, usageCount}>" },
    L4: { archives: "Array<{sessionId, summary, timestamp}>" }
  },
  crystallizationQueue: "Array<executionPath>"
};
```

---

## 7. 迭代里程碑

| 阶段 | 内容 |
|------|------|
| **Phase 1** | DAG 执行引擎 + 环路检测 |
| **Phase 2** | NPC 五层记忆系统 + 技能结晶 |
| **Phase 3** | Hook 引擎 + 事件驱动 |
| **Phase 4** | Budget 控制器 + 速率限制 |
| **Phase 5** | MCP Bridge 集成 + UI 界面 |

---

## 8. 与现有系统的整合

| 现有系统 | 整合点 |
|---------|--------|
| V94 AI Budget | BudgetController 作为全局资源管理器 |
| V93 MCP Agent Bridge | NPC 通过 MCP 协议通信 |
| V92 仙界秘境 | 秘境探索转化为 DAG Quest |
| 宗门系统 | 宗门任务 = 玩家定义的 Quest |
| NPC 系统 | NPC 具备五层记忆，成为自治智能体 |

---

## 9. 预期收益

1. **NPC 智能化**：NPC 从静态脚本 → 具备记忆和技能进化的自治智能体
2. **任务系统丰富化**：玩家可创建自定义 Quest，DAG 执行支持复杂场景
3. **资源可控**：Budget 模式确保资源消耗可预测，防止系统过载
4. **事件驱动扩展性**：Hook 系统让新功能易于接入
5. **多智能体协作**：NPC 之间通过 MCP 协议协作，执行复杂任务链