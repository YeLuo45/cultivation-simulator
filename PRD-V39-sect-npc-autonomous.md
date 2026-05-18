# V39 宗门NPC自主行动系统 — PRD

## 需求概述
基于V35宗门互动系统和V29 NPC AI框架，实现宗门NPC的自主行动系统。借鉴ChatDev多角色协作 + generic-agent自主探索模式，让NPC在玩家不干预时也能自主运转。

## 核心设计原则
- **NPC自主循环**：修炼/采集/战斗自动执行，无需玩家分配
- **状态驱动**：NPC根据状态机自主选择行为
- **协作涌现**：多个NPC并行活动，产生"宗门生态"感
- **规则生成**：对话和决策基于规则，无需LLM API

## 功能清单

### F1. NPC角色体系扩展
- 三种角色：掌门(leader)/长老(elder)/弟子(disciple)
- 掌门：发布任务、考核弟子、宗门战略
- 长老：指导修炼、传授功法
- 弟子：执行任务、自动修炼
- 宗门创建时宗主自动成为掌门

### F2. NPC自主行动循环
- 每日结算时触发：`processNpcAutonomousLoop()`
- 未被玩家分配任务的NPC自动选择行为：修炼/采集/闭关
- 行为结果影响NPC境界、产出、心情
- 境界提升时自动触发系统通知

### F3. NPC对话系统
- 点击弟子卡片 → 打开NPC对话框
- 基于角色类型生成不同风格回复
- 对话历史记录（每NPC最多50条）
- 快捷按钮：请教/任务/闲聊

### F4. NPC任务自动分配
- 掌门每日自动发布1个宗门任务
- 未分配任务的弟子自动接取
- 任务完成后结算奖励（经验+贡献+灵石）

## 数据结构

```javascript
// disciple 扩展字段
{
  uid, name, realm, talent, contribution,
  npcRole: 'leader'|'elder'|'disciple',   // F1
  npcDialogueHistory: [],                   // F3
  npcMood: 'happy'|'normal'|'upset',       // F2
  npcAffection: 50,                        // F2
  npcTask: null|{type, progress, target},  // F4
  npcTaskDays: 0                           // F4
}

// sect 扩展字段
{
  // ... existing fields ...
  npcTasks: [],         // F4: active NPC tasks
  npcLeaderId: null,   // F1: UID of the leader
  npcLastActionDay: 0   // F2: last autonomous action day
}
```

## 触发时机
- `doMorningExercise()` 末尾调用 `processNpcAutonomousLoop()`
- 宗门界面打开时渲染NPC状态标签
- 对话按钮触发 `openNpcDialogue(discipleUid)`

## 验收标准
- node --check 语法验证通过
- build_ci.js 构建成功
- git commit + push 成功
- 线上 https://yeluo45.github.io/cultivation-simulator/ NPC按钮响应正常
