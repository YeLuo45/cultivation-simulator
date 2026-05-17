# V34 仙界秘境探索系统

## 需求概述
为 cultivation-simulator 实现 V34 仙界秘境探索系统 — 飞升后玩家可探索仙界秘境（类似凡界秘境的升级版），获得稀有仙界资源、仙法、仙宠、特殊装备。

## 核心设计
借鉴：
- **Thunderbolt 双路径同步**：主路径（秘境探索）+ 次路径（资源获取）
- **generic-agent 状态机**：秘境状态机（空闲→进入→探索→战斗→结算）
- **ChatDev 多角色协作**：秘境中遇到NPC（仙友/商人/守护者）

**秘境类型**：
1. **遗迹秘境**：上古仙人洞府，有守护者，奖励仙法/功法
2. **资源秘境**：仙草丰盛，奖励仙草/炼丹材料
3. **战斗秘境**：高危险区，挑战强敌获稀有装备
4. **奇遇秘境**：随机触发特殊事件（顿悟/传承/遗迹）

## 功能拆解

### 1. 秘境状态机
```javascript
immortalRealm.secretRealmState = {
    inSecretRealm: false,
    currentRealm: null,       // 当前秘境ID
    currentType: null,         // 'ruins'|'resource'|'combat'|'serendipity'
    wave: 0,
    totalWaves: 3,
    enemies: [],
    rewards: [],
    npc: null,                 // 秘境中的NPC
    explored: []               // 已探索的秘境记录
}
```

### 2. 秘境配置
```javascript
SECRET_REALMS_IMMORTAL = {
    '太虚遗迹': {
        type: 'ruins',
        realmRequired: 1,
        dangerLevel: 2,
        waves: 3,
        rewards: ['太虚仙法', '上古丹药', '仙灵泉水'],
        npc: { type: 'guardian', name: '太虚守护者', hp: 5000 }
    },
    '九天瑶池': {
        type: 'resource',
        realmRequired: 2,
        dangerLevel: 1,
        waves: 2,
        rewards: ['九天仙草', '瑶池圣水', '万年灵芝'],
        npc: { type: 'merchant', name: '瑶池仙子' }
    },
    '混沌战场': {
        type: 'combat',
        realmRequired: 3,
        dangerLevel: 5,
        waves: 5,
        rewards: ['混沌至宝', '神魔精血', '混沌丹'],
        boss: { name: '混沌魔神', hp: 20000 }
    },
    '星辰海洋': {
        type: 'serendipity',
        realmRequired: 2,
        dangerLevel: 3,
        waves: 1,
        rewards: ['星辰精华', '星君传承'],
        special: true  // 奇遇秘境
    }
}
```

### 3. 进入秘境流程
- 玩家在仙界界面选择「秘境探索」
- 显示可进入的秘境列表（根据境界过滤）
- 选择秘境后消耗「秘境令牌」进入
- 秘境令牌：每日仙界任务奖励 或 商城购买

### 4. 秘境探索UI
- 独立秘境界面，类似凡界秘境但风格仙界化
- 显示当前秘境名称、类型、波数
- 战斗/资源/奇遇随机事件

### 5. 秘境奖励
- 仙界货币：仙玉（替代灵石）
- 仙草/炼丹材料
- 仙法/功法残卷
- 特殊仙宠/坐骑

### 6. 数据结构变更
```javascript
// state.js - gameState.immortal 新增字段
secretRealm: {
    inSecretRealm: false,
    currentRealm: null,
    wave: 0,
    rewards: [],
    jade: 0  // 仙玉
}

// init.js 新增字段初始化和存档恢复
```

## 验收标准
1. 仙界界面显示「秘境探索」入口
2. 可用秘境根据玩家境界解锁
3. 秘境内进行多波战斗/资源收集
4. 秘境完成后获得对应奖励
5. 秘境令牌消耗与每日重置
6. 仙玉作为仙界新货币