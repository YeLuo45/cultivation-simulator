# V33 战斗系统 AI 对手进化

## 需求概述
为 cultivation-simulator 实现 V33 战斗系统 AI 对手进化 —— 借鉴 ruflo hooks 工具注册模式，让 AI 对手能够学习玩家战斗风格并做出针对性反应。当前 AI 只是简单的随机选择，未来将实现基于玩家历史的"读招"能力。

## 核心设计
借鉴：
- **ruflo hooks 工具注册**：对手 AI 动态注册"工具"（技能/策略），根据战场情况选择最优工具
- **generic-agent 状态机**：观察 → 决策 → 执行 → 学习 的闭环
- **Thunderbolt 双路径同步**：主路径（攻击）+ 次路径（防守/技能切换）

**AI 对手学习流程**：
1. **观察阶段**：记录玩家常用的攻击模式、技能组合
2. **决策阶段**：根据观察结果选择针对性策略
3. **执行阶段**：调用注册的战术工具
4. **学习阶段**：战后更新玩家画像

## 功能拆解

### 1. 对手 AI 画像系统
```javascript
gameState.combatProfile = {
    playerPatterns: [],     // [{type, count, lastUsed}]
    preferredDistance: null, // 'close' | 'mid' | 'far'
    spellUsageRate: 0,      // 技能使用率
    attackTiming: [],       // 攻击时机偏好
    defenseFrequency: 0,    // 防御频率
    counterStyle: null      // 'aggressive' | 'defensive' | 'balanced'
}
```

### 2. AI 工具注册表
```javascript
COMBAT_AI_TOOLS = {
    // 攻击工具
    heavyAttack: { weight: 1.0, trigger: 'player_defending' },
    quickAttack: { weight: 1.0, trigger: 'player_low_hp' },
    spellAttack: { weight: 1.0, trigger: 'player_spell_cooldown' },
    // 防守工具
    heal: { weight: 1.0, trigger: 'hp_below_50' },
    defend: { weight: 1.0, trigger: 'player_high_ aggression' },
    counter: { weight: 1.0, trigger: 'player_attack_pattern' },
    // 特殊工具
    techniqueBreak: { weight: 1.0, trigger: 'player_technique_active' },
    ultimateSkill: { weight: 0.5, trigger: 'energy_full' }
}
```

### 3. 动态权重调整
```javascript
// 根据玩家画像动态调整工具权重
adjustToolWeights(playerProfile) {
    if (playerProfile.defenseFrequency > 0.6) {
        // 玩家爱防御 → 提高破防工具权重
        COMBAT_AI_TOOLS.heavyAttack.weight *= 1.5;
        COMBAT_AI_TOOLS.techniqueBreak.weight *= 1.3;
    }
    if (playerProfile.attackTiming.includes('ultimate')) {
        // 玩家爱用大招 → 提高打断工具权重
        COMBAT_AI_TOOLS.interrupt.weight *= 1.4;
    }
}
```

### 4. 战况分析器
```javascript
analyzeBattleState() {
    return {
        isAggressive: player.attackRate > 0.7,
        isDefensive: player.defenseFrequency > 0.5,
        isSpellHeavy: player.spellUsageRate > 0.6,
        weakness: detectWeakness(playerProfile),
        recommendedTool: selectBestTool()
    }
}
```

### 5. 学习闭环
**战斗中**：观察玩家行动并记录
**战斗后**：分析胜负，更新玩家画像
**下次战斗**：根据更新后的画像调整策略

### 6. UI增强
- 战斗中显示 AI "思考"状态（"分析玩家弱点中..."）
- 对手血条下方显示当前 AI 状态（学习阶段）
- 战后显示 AI 学习报告（"观察到玩家偏好速攻"）

### 7. 数据结构变更
```javascript
// state.js 新增字段
combatProfile: {
    playerPatterns: [],     // 玩家战斗模式历史
    totalBattles: 0,         // 总战斗次数
    winsAgainst: 0,         // 战胜次数
    currentEnemy: null,      // 当前敌人ID
    learningData: {}         // 各敌人的学习数据
}

// combat.js 新增字段
opponent: {
    // ...existing fields...
    aiTools: {},            // 可用的AI工具
    learnedProfile: null,   // 从玩家画像学到的策略
    adaptationLevel: 0       // 适应等级（0-3）
}
```

## 验收标准
1. AI 对手在战斗中显示"思考"状态
2. 多次战斗后 AI 策略有明显变化（针对玩家风格）
3. 玩家使用不同风格时 AI 反应不同（爱用技能→AI更常打断/爱防御→AI更多破防）
4. 战后有学习报告显示 AI 观察到了什么
5. AI 适应等级影响战斗难度（高等级 AI 更难对付）
6. 新游戏开始时玩家画像重置（保持公平）