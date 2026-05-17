# V31 仙界天道轮回自动机制

## 需求概述
为 cultivation-simulator 实现 V31 仙界天道轮回自动机制 —— 借鉴 Thunderbolt 双路径同步触发器模式，在仙界实现自动化的境界修炼循环。飞升后玩家不再需要每日手动操作，天道轮回自动驱动修炼进度结算、资源分配、气运波动。

## 核心设计
借鉴：
- **Thunderbolt 双路径同步**：主路径（自动修炼）+ 次路径（主动干预）并行
- **generic-agent 状态机**：触发器 → 条件判断 → 状态转换 → 奖励/惩罚结算

**天道轮回流程**（每 N 天自动触发）：
1. **修炼自动结算**（主路径）→ 境界进度自动积累（基于灵根加成）
2. **资源分配**（次路径）→ 仙气/灵石自动平衡（每周期根据区域危险度分配）
3. **气运波动**（触发器）→ 好/坏随机事件触发（如：顿悟/心魔入侵）
4. **玩家干预窗口** → 可消耗资源主动触发额外事件（加速修炼/更换区域）

## 功能拆解

### 1. 天道轮回定时器
```javascript
gameState.immortal.celestialCycleDay    // 距离下次轮回的天数
gameState.immortal.celestialCycleCompleted  // 本周期是否已完成
gameState.immortal.fateTaskRefreshDay   // 气运任务刷新日
```

**触发间隔**：每 3 天触发一次天道轮回（可配置）

### 2. 自动修炼结算（主路径）
每逢天道轮回日：
- 基础修炼进度：+IMMORTAL_REALMS[realm].cultivationBase
- 灵根加成：getSpiritRootCultivationBonus()
- 区域加成：IMMORTAL_REGIONS[currentRegion].bonus
- 仙界特殊buff：activeEffects.immortal_cultivation_speed

### 3. 资源自动分配（次路径）
- 仙气收入：每天 base + region.bonus
- 灵石收入：每周期（3天）根据区域危险度分配
- 自动消耗：飞行冷却、装备耐久等

### 4. 气运波动触发器
**正面事件**（40%概率）：
- 顿悟：修炼进度 +50%
- 天赐：随机获得仙草/灵石
- 祥瑞：心态 +10

**负面事件**（30%概率）：
- 心魔入侵：心态 -20，触发战斗
- 天道压制：当日修炼无效
- 灵气紊乱：随机损失灵石

**中性事件**（30%概率）：
- 仙人指路：获得修炼提示
- 奇遇发现：新区域解锁线索

### 5. 玩家主动干预接口
```javascript
// 主动请求天道轮回（消耗 100 灵石）
function requestExtraCycle()

// 区域传送（消耗灵石，触发冷却）
function requestRegionTransfer(targetRegion)

// 气运祈福（消耗灵石，提升下个周期正面事件概率）
function requestFortuneBlessing()
```

### 6. UI集成
- 仙界主界面显示：距离下次天道轮回 X 天
- 顶部状态栏：当前仙界境界 / 修炼进度条 / 灵石数量
- 天道轮回结算弹窗（自动弹出，展示本周期结果）
- 新增"仙界控制台"按钮（主动干预菜单）

## 数据结构变更
```javascript
// state.js 新增字段
immortal: {
  // ...existing fields...
  celestialCycleDay: 0,        // 距离下次轮回的天数
  celestialCycleCompleted: false,  // 本周期是否完成
  fateTaskRefreshDay: 0,       // 气运任务刷新日
  fortuneBlessingActive: false, // 祈福是否激活
  lastCycleResult: null        // 上次轮回结果（用于显示）
}
```

## 验收标准
1. 飞升后自动初始化天道轮回定时器
2. 每 3 天自动触发一次轮回结算
3. 正面/负面/中性事件按概率分布触发
4. 玩家可主动干预（请求额外轮回/区域传送/气运祈福）
5. 天道轮回结算结果清晰显示在弹窗中
6. 不影响凡界每日操作的独立性