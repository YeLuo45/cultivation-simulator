# V35 NPC宗门互动增强系统 — PRD

## 需求概述
基于现有V29 NPC AI系统，增强弟子成长、职务分配、宗门任务链，实现宗主与弟子深度互动。

## 功能清单

### G1. 弟子成长系统
- disciple新增字段：`experience`(经验)、`level`(等级1-100)、`cultivationProgress`(修炼进度)
- 弟子通过完成任务/修炼获得经验，经验达标自动升级
- 升级后境界有概率提升（需渡劫）
- 宗门产出与弟子等级挂钩

### G2. 职务分配系统
- 职位类型：训练(修炼加速)、采集(灵石+)、执事(商店折扣)、传功(功法领悟)、护卫(战斗加成)
- 宗主可分配弟子职务，每人一个职务
- 职务影响宗门产出和弟子成长速度

### G3. 宗门任务链
- sect新增字段：`missions`=[{id, type, target, progress, reward, assignedUid, status}]
- 每日自动生成3个宗门任务（采集/修炼/战斗）
- 宗主可发布特殊任务（需消耗灵石）
- 任务完成后弟子获得经验和贡献

### G4. 弟子互动
- 赠送礼物：提升弟子好感度，好感度影响任务奖励
- 弟子状态：开心/普通/不满（由好感度和任务完成度决定）
- 弟子离开：长期不满会离开宗门

## 数据结构

```javascript
// disciple 增强字段
{
  uid, name, realm, talent, contribution,
  experience: 0,      // G1 经验值
  level: 1,           // G1 等级 1-100
  position: null,     // G2 职务 null|'train'|'collect'|'steward'|'elder'|'guard'
  assignment: null,   // G2 当前分配的任务
  affection: 50,      // G4 好感度 0-100
  mood: 'normal',     // G4 心情 'happy'|'normal'|'upset'
  cultivationProgress: 0  // G1 修炼进度
}

// sect 增强字段
missions: [],        // G3 宗门任务列表
missionCooldown: 0   // G3 任务冷却
```

## 触发时机
- 每日`days++`后：`processDailySectMissions()` 处理任务进度
- 宗门界面打开时：`renderDisciplesTab()` 显示成长和状态
- 弟子对话框：显示好感度和心情

## 借鉴设计
- **ChatDev多角色协作**：角色间有依赖关系和任务传递
- **generic-agent状态机**：弟子状态机（mood影响行为）
- **Thunderbolt双路径同步**：宗门产出路径+弟子成长路径同步