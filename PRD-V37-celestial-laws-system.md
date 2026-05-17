# PRD-V37-Celestial-Laws-System

## 版本: V37
## 方向: I - 天道法则系统
## 日期: 2026-05-18

---

## 1. 概念与愿景

修士在飞升后，不仅要提升境界，更要领悟天地法则之力。本系统引入悟道大陆的核心机制——**天道法则**：时间、空间、五行、阴阳、因果、命运、毁灭、创造、轮回、混沌十大法则体系。法则间存在相生相克关系，玩家需巧妙搭配才能发挥最大威力。

---

## 2. 核心机制

### 2.1 法则类型（10种）

| 法 则 | 图标 | 主属性 | 悟道要求 |
|--------|------|--------|----------|
| 时间法则 | ⏳ | 修炼速度+15% | 境界≥大乘 |
| 空间法则 | 🌀 | 躲避率+20% | 境界≥大乘 |
| 五行法则 | 🌈 | 全属性+10% | 境界≥大乘 |
| 阴阳法则 | ☯️ | 攻防均衡+12% | 境界≥大乘 |
| 因果法则 | 🔮 | 暴击率+18% | 境界≥地仙 |
| 命运法则 | ⭐ | 奇遇概率+25% | 境界≥地仙 |
| 毁灭法则 | 💥 | 伤害+20% | 境界≥地仙 |
| 创造法则 | ✨ | 治疗效果+25% | 境界≥地仙 |
| 轮回法则 | 🔄 | 冷却缩减-20% | 境界≥太乙 |
| 混沌法则 | 🌌 | 全属性+15%，受伤+10% | 境界≥太乙 |

### 2.2 法则相克关系（冲突）

当两个相克法则同时激活时，两者效果均降低30%：

- 时间法则 ⚔️ 空间法则
- 五行法则 ⚔️ 混沌法则
- 阴阳法则 ⚔️ 命运法则
- 毁灭法则 ⚔️ 创造法则
- 因果法则 ⚔️ 轮回法则

### 2.3 法则相助关系（协同）

当两个相助法则同时激活时，效果叠加+15%额外加成：

- 时间法则 + 空间法则 → 时空共振
- 五行法则 + 阴阳法则 → 阴阳五行
- 因果法则 + 命运法则 → 命数注定
- 毁灭法则 + 创造法则 → 生死轮回
- 轮回法则 + 混沌法则 → 混沌归一

### 2.4 法则领悟

- **领悟条件**：境界≥大乘时自动解锁悟道界面
- **领悟消耗**：每领悟一条法则需 5000 灵石 + 30天闭关
- **领悟进度**：可同时进行1条法则领悟，悟道完成后法则激活
- **领悟上限**：玩家最多同时激活3条法则（可通过成就提升至5条）

---

## 3. UI 界面

### 3.1 悟道台界面（showLawComprehension）

- 左侧：10个法则卡片（未领悟/领悟中/已激活 三个状态）
- 中间：法则详情（属性加成/相克相助关系）
- 右侧：当前激活的法则（最多3个）
- 底部：悟道按钮/领悟进度条

### 3.2 法则图标

- 未激活：灰色，图标暗淡
- 领悟中：金色边框+进度条动画
- 已激活：彩色高亮+微光特效

---

## 4. 数据结构

### 4.1 state.js 字段

```javascript
celestialLaws: {
    comprehended: [],        // 已领悟的法则列表 ['time', 'space', ...]
    active: [],             // 当前激活的法则（最多3个）
    comprehending: null,    // 当前领悟中的法则 null | 'time' | 'space' | ...
    comprehendingProgress: 0, // 领悟进度 0-100
    comprehendDays: 0,       // 领悟已进行的天数
    maxActiveLaws: 3,        // 最大激活数量（可通过成就提升）
    lawBonus: {}             // 当前激活法则计算后的加成 {attack: x, defense: y, ...}
}
```

### 4.2 常量定义

```javascript
const CELESTIAL_LAWS = {
    time:      { name: '时间法则', icon: '⏳', attr: 'cultivate_speed', value: 0.15, realm: '大乘', synergy: 'space', conflict: 'space' },
    space:     { name: '空间法则', icon: '🌀', attr: 'escape', value: 0.20, realm: '大乘', synergy: 'time', conflict: 'time' },
    wuxing:    { name: '五行法则', icon: '🌈', attr: 'all_stats', value: 0.10, realm: '大乘', synergy: 'yinyang', conflict: 'chaos' },
    yinyang:   { name: '阴阳法则', icon: '☯️', attr: 'attack_defense_balance', value: 0.12, realm: '大乘', synergy: 'wuxing', conflict: 'destiny' },
    cause:     { name: '因果法则', icon: '🔮', attr: 'crit', value: 0.18, realm: '地仙', synergy: 'destiny', conflict: 'reincarnation' },
    destiny:   { name: '命运法则', icon: '⭐', attr: 'serendipity', value: 0.25, realm: '地仙', synergy: 'cause', conflict: 'yinyang' },
    destruction:{ name: '毁灭法则', icon: '💥', attr: 'attack', value: 0.20, realm: '地仙', synergy: 'creation', conflict: 'creation' },
    creation:  { name: '创造法则', icon: '✨', attr: 'heal', value: 0.25, realm: '地仙', synergy: 'destruction', conflict: 'destruction' },
    reincarnation:{ name: '轮回法则', icon: '🔄', attr: 'cooldown_reduce', value: 0.20, realm: '太乙', synergy: 'chaos', conflict: 'cause' },
    chaos:     { name: '混沌法则', icon: '🌌', attr: 'all_stats', value: 0.15, realm: '太乙', synergy: 'reincarnation', conflict: 'wuxing', debuff: 'damage_taken', debuffValue: 0.10 }
};
```

---

## 5. 触发逻辑

### 5.1 领悟触发

- 玩家境界≥大乘时，显示"悟道"按钮
- 点击后打开法则选择界面
- 选中法则后消耗灵石，进入领悟状态

### 5.2 领悟完成

- 当 `comprehendingProgress >= 100` 时，法则领悟完成
- 自动添加到 `comprehended` 列表
- 如 `active.length < maxActiveLaws`，自动激活

### 5.3 法则加成计算

- 每次 `days++` 时调用 `calculateLawBonus()`
- 遍历 `active` 数组，计算各属性加成
- 若存在相克关系，降低30%效果
- 若存在相助关系，额外+15%加成

### 5.4 渡劫加成

- 激活法则的玩家渡劫成功率额外+5%（每条）
- 相克法则同时激活时，渡劫加成取消

---

## 6. 实现文件

- js/state.js - celestialLaws 字段
- js/init.js - 字段初始化和存档恢复
- js/data.js - days++ 时调用领悟进度更新和加成计算
- js/laws.js - 新文件，法则系统核心逻辑（~250行）
- dist/game.js - Python3合并所有模块

---

## 7. 验收标准

1. 境界≥大乘后显示"悟道"按钮
2. 可查看10个法则的详细信息和状态
3. 领悟消耗灵石和天数，进度正确累计
4. 领悟完成后法则自动激活
5. 相克法则同时激活时效果降低30%
6. 相助法则同时激活时额外+15%加成
7. UI正确显示三个状态（未激活/领悟中/已激活）