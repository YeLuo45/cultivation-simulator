/**
 * TreasureService.js - 仙缘探宝系统
 * 秘境探索、宝藏发现与获取
 * 
 * MCP工具:
 * - treasure.explore(realmId) - 探索秘境
 * - treasure.open(chestId) - 开启宝箱
 * - treasure.query() - 查询宝藏状态
 * - treasure.upgrade() - 升级探索等级
 */

const TREASURE_STATES = {
  IDLE: 'IDLE',
  EXPLORING: 'EXPLORING',
  CHEST_FOUND: 'CHEST_FOUND',
  CHEST_OPENED: 'CHEST_OPENED'
};

const TREASURE_QUALITIES = {
  COMMON: 'COMMON',       // 普通
  FINE: 'FINE',           // 精良
  RARE: 'RARE',           // 稀有
  LEGENDARY: 'LEGENDARY', // 传说
  MYTHIC: 'MYTHIC'        // 神话
};

const TREASURE_DB_KEY = '_treasure_db';
const TREASURE_COUNTER_KEY = '_treasure_counter';

// 宝藏数据库
let _treasureDB = null;
let _chestCounter = 1;

// 初始化
function _initTreasureDatabase() {
  const existing = GameGlobal.getDB ? GameGlobal.getDB(TREASURE_DB_KEY) : null;
  if (existing) {
    _treasureDB = existing;
  } else {
    _treasureDB = {
      playerTreasures: [],
      discoveredChests: [],
      exploreLevel: 1,
      totalExplores: 0,
      totalTreasures: 0,
      currentRealm: null,
      state: TREASURE_STATES.IDLE
    };
    if (GameGlobal.setDB) GameGlobal.setDB(TREASURE_DB_KEY, _treasureDB);
  }
}

function _saveTreasureDB() {
  if (GameGlobal.setDB) GameGlobal.setDB(TREASURE_DB_KEY, _treasureDB);
}

// 宝藏品质配置
const QUALITY_CONFIG = {
  [TREASURE_QUALITIES.COMMON]: { chance: 0.45, minValue: 10, maxValue: 50, name: '普通' },
  [TREASURE_QUALITIES.FINE]: { chance: 0.28, minValue: 50, maxValue: 200, name: '精良' },
  [TREASURE_QUALITIES.RARE]: { chance: 0.17, minValue: 200, maxValue: 1000, name: '稀有' },
  [TREASURE_QUALITIES.LEGENDARY]: { chance: 0.08, minValue: 1000, maxValue: 5000, name: '传说' },
  [TREASURE_QUALITIES.MYTHIC]: { chance: 0.02, minValue: 5000, maxValue: 50000, name: '神话' }
};

// 宝藏类型
const TREASURE_TYPES = [
  'SPIRIT_STONE',   // 灵石
  'ELIXIR',         // 丹药
  'MANUAL',         // 功法
  'WEAPON',         // 法宝
  'MATERIAL',       // 材料
  'BEAST_CORE'      // 兽核
];

// 秘境配置
const REALM_CONFIG = {
  'mortal_realm': { name: '凡界秘境', difficulty: 1, exploreCost: 10, minLevel: 1 },
  'immortal_realm': { name: '灵界秘境', difficulty: 3, exploreCost: 50, minLevel: 10 },
  'celestial_realm': { name: '仙界秘境', difficulty: 5, exploreCost: 200, minLevel: 30 },
  'divine_realm': { name: '神界秘境', difficulty: 8, exploreCost: 1000, minLevel: 60 },
  'transcendent_realm': { name: '超脱秘境', difficulty: 10, exploreCost: 5000, minLevel: 100 }
};

// 开启宝箱
function _generateChest(reward) {
  return {
    id: _chestCounter++,
    reward,
    quality: reward.quality,
    type: reward.type,
    value: reward.value,
    discoveredAt: Date.now()
  };
}

// 随机获取宝藏
function _generateRandomTreasure(exploreLevel) {
  // 根据探索等级调整概率
  const roll = Math.random();
  let cumulative = 0;
  let quality = TREASURE_QUALITIES.COMMON;
  
  for (const [q, config] of Object.entries(QUALITY_CONFIG)) {
    cumulative += config.chance;
    if (roll < cumulative) {
      quality = q;
      break;
    }
  }
  
  const config = QUALITY_CONFIG[quality];
  const levelBonus = exploreLevel * 10;
  const value = Math.floor(config.minValue + Math.random() * (config.maxValue - config.minValue)) + levelBonus;
  const type = TREASURE_TYPES[Math.floor(Math.random() * TREASURE_TYPES.length)];
  
  return {
    quality,
    type,
    value,
    name: `${config.name}${_getTreasureTypeName(type)}`
  };
}

function _getTreasureTypeName(type) {
  const names = {
    'SPIRIT_STONE': '灵石',
    'ELIXIR': '丹药',
    'MANUAL': '功法秘籍',
    'WEAPON': '法宝',
    'MATERIAL': '灵材',
    'BEAST_CORE': '兽核'
  };
  return names[type] || '宝物';
}

// ========== MCP工具实现 ==========

/**
 * 探索秘境
 * @param {string} realmId - 秘境ID
 * @returns {object} 探索结果
 */
function exploreRealm(realmId) {
  _initTreasureDatabase();
  
  const realm = REALM_CONFIG[realmId];
  if (!realm) {
    return { success: false, error: `秘境 ${realmId} 不存在` };
  }
  
  // 检查玩家等级
  const playerLevel = GameGlobal.getPlayerAttribute ? GameGlobal.getPlayerAttribute('level') : 1;
  if (playerLevel < realm.minLevel) {
    return { success: false, error: `需要达到 ${realm.minLevel} 级才能探索此秘境，当前等级 ${playerLevel}` };
  }
  
  // 检查资源
  const playerResources = GameGlobal.getPlayerAttribute ? GameGlobal.getPlayerAttribute('spiritStones') : 1000;
  if (playerResources < realm.exploreCost) {
    return { success: false, error: `探索需要 ${realm.exploreCost} 灵石，当前只有 ${playerResources}` };
  }
  
  // 扣除资源
  if (GameGlobal.modifyPlayerAttribute) {
    GameGlobal.modifyPlayerAttribute('spiritStones', -realm.exploreCost);
  }
  
  // 更新状态
  _treasureDB.state = TREASURE_STATES.EXPLORING;
  _treasureDB.currentRealm = realmId;
  _treasureDB.totalExplores++;
  _treasureDB.exploreLevel = Math.max(_treasureDB.exploreLevel, realm.difficulty);
  
  // 随机发现宝箱概率（60%基础 + 等级加成）
  const chestChance = 0.6 + (_treasureDB.exploreLevel * 0.02);
  
  if (Math.random() < chestChance) {
    // 发现宝箱
    const treasure = _generateRandomTreasure(_treasureDB.exploreLevel);
    const chest = _generateChest(treasure);
    _treasureDB.discoveredChests.push(chest);
    _treasureDB.state = TREASURE_STATES.CHEST_FOUND;
    _saveTreasureDB();
    
    return {
      success: true,
      message: `在 ${realm.name} 发现了一个 ${treasure.name}！`,
      chestId: chest.id,
      treasure: {
        quality: treasure.quality,
        qualityName: QUALITY_CONFIG[treasure.quality].name,
        type: treasure.type,
        typeName: _getTreasureTypeName(treasure.type),
        value: treasure.value,
        name: treasure.name
      },
      state: TREASURE_STATES.CHEST_FOUND,
      cost: realm.exploreCost,
      nextStep: '请使用 treasure.open(' + chest.id + ') 开启宝箱'
    };
  } else {
    // 未发现
    _treasureDB.state = TREASURE_STATES.IDLE;
    _treasureDB.currentRealm = null;
    _saveTreasureDB();
    
    return {
      success: true,
      message: `探索了 ${realm.name}，未发现宝藏`,
      state: TREASURE_STATES.IDLE,
      cost: realm.exploreCost,
      nextStep: '请使用 treasure.explore() 继续探索'
    };
  }
}

/**
 * 开启宝箱
 * @param {number} chestId - 宝箱ID
 * @returns {object} 开启结果
 */
function openChest(chestId) {
  _initTreasureDatabase();
  
  if (_treasureDB.state !== TREASURE_STATES.CHEST_FOUND) {
    return { success: false, error: '当前没有可开启的宝箱，请先探索秘境' };
  }
  
  const chestIndex = _treasureDB.discoveredChests.findIndex(c => c.id === chestId);
  if (chestIndex === -1) {
    return { success: false, error: `宝箱 ${chestId} 不存在或已开启` };
  }
  
  const chest = _treasureDB.discoveredChests[chestIndex];
  
  // 添加到玩家宝藏
  _treasureDB.playerTreasures.push({
    ...chest.reward,
    acquiredAt: Date.now()
  });
  _treasureDB.totalTreasures++;
  
  // 扣除宝箱
  _treasureDB.discoveredChests.splice(chestIndex, 1);
  _treasureDB.state = TREASURE_STATES.CHEST_OPENED;
  _saveTreasureDB();
  
  // 添加资源到玩家
  if (GameGlobal.modifyPlayerAttribute) {
    GameGlobal.modifyPlayerAttribute('spiritStones', chest.reward.value);
  }
  
  return {
    success: true,
    message: `开启了 ${chest.reward.name}，获得 ${chest.reward.value} 灵石！`,
    reward: {
      quality: chest.reward.quality,
      qualityName: QUALITY_CONFIG[chest.reward.quality].name,
      type: chest.reward.type,
      typeName: _getTreasureTypeName(chest.reward.type),
      value: chest.reward.value,
      name: chest.reward.name
    },
    state: TREASURE_STATES.CHEST_OPENED
  };
}

/**
 * 查询宝藏状态
 * @returns {object} 宝藏状态
 */
function queryTreasureStatus() {
  _initTreasureDatabase();
  
  // 获取玩家资源
  const playerResources = GameGlobal.getPlayerAttribute ? GameGlobal.getPlayerAttribute('spiritStones') : 0;
  
  return {
    success: true,
    status: {
      state: _treasureDB.state,
      exploreLevel: _treasureDB.exploreLevel,
      totalExplores: _treasureDB.totalExplores,
      totalTreasures: _treasureDB.totalTreasures,
      pendingChests: _treasureDB.discoveredChests.length,
      playerTreasures: _treasureDB.playerTreasures.length
    },
    playerResources,
    availableRealms: Object.entries(REALM_CONFIG).map(([id, config]) => ({
      id,
      name: config.name,
      difficulty: config.difficulty,
      exploreCost: config.exploreCost,
      minLevel: config.minLevel
    })),
    pendingChests: _treasureDB.discoveredChests.map(c => ({
      id: c.id,
      name: c.reward.name,
      quality: c.reward.quality,
      qualityName: QUALITY_CONFIG[c.reward.quality].name,
      value: c.reward.value
    })),
    recentTreasures: _treasureDB.playerTreasures.slice(-5).reverse().map(t => ({
      name: t.name,
      quality: t.quality,
      qualityName: QUALITY_CONFIG[t.quality].name,
      value: t.value,
      acquiredAt: new Date(t.acquiredAt).toISOString()
    }))
  };
}

/**
 * 升级探索等级
 * @returns {object} 升级结果
 */
function upgradeExploreLevel() {
  _initTreasureDatabase();
  
  // 升级费用
  const upgradeCost = _treasureDB.exploreLevel * 500;
  const playerResources = GameGlobal.getPlayerAttribute ? GameGlobal.getPlayerAttribute('spiritStones') : 0;
  
  if (playerResources < upgradeCost) {
    return { success: false, error: `升级需要 ${upgradeCost} 灵石，当前只有 ${playerResources}` };
  }
  
  if (_treasureDB.exploreLevel >= 10) {
    return { success: false, error: '探索等级已达到满级（10级）' };
  }
  
  // 扣除资源并升级
  if (GameGlobal.modifyPlayerAttribute) {
    GameGlobal.modifyPlayerAttribute('spiritStones', -upgradeCost);
  }
  
  _treasureDB.exploreLevel++;
  _saveTreasureDB();
  
  return {
    success: true,
    message: `探索等级提升到 ${_treasureDB.exploreLevel} 级！`,
    newLevel: _treasureDB.exploreLevel,
    cost: upgradeCost,
    benefits: {
      chestChanceBonus: (_treasureDB.exploreLevel * 2) + '%',
      treasureValueBonus: (_treasureDB.exploreLevel * 10) + '%'
    }
  };
}

/**
 * 快速探索（自动发现并开启）
 * @param {string} realmId - 秘境ID
 * @returns {object} 探索结果
 */
function quickExplore(realmId) {
  _initTreasureDatabase();
  
  const realm = REALM_CONFIG[realmId];
  if (!realm) {
    return { success: false, error: `秘境 ${realmId} 不存在` };
  }
  
  // 检查玩家等级
  const playerLevel = GameGlobal.getPlayerAttribute ? GameGlobal.getPlayerAttribute('level') : 1;
  if (playerLevel < realm.minLevel) {
    return { success: false, error: `需要达到 ${realm.minLevel} 级` };
  }
  
  // 探索
  const exploreResult = exploreRealm(realmId);
  if (!exploreResult.success) {
    return exploreResult;
  }
  
  // 如果发现了宝箱，自动开启
  if (exploreResult.chestId) {
    return openChest(exploreResult.chestId);
  }
  
  return exploreResult;
}

// ========== MCP工具定义 ==========
const TREASURE_MCP_TOOLS = [
  {
    name: 'treasure.explore',
    description: '探索秘境，有概率发现宝箱（消耗灵石）',
    params: { realmId: 'string' }
  },
  {
    name: 'treasure.open',
    description: '开启已发现的宝箱，获得宝藏',
    params: { chestId: 'number' }
  },
  {
    name: 'treasure.query',
    description: '查询当前宝藏状态、探索等级、待开启宝箱',
    params: {}
  },
  {
    name: 'treasure.upgrade',
    description: '升级探索等级，提升宝箱发现率和宝藏价值',
    params: {}
  },
  {
    name: 'treasure.quick',
    description: '快速探索（探索+自动开启），效率更高',
    params: { realmId: 'string' }
  }
];

// ========== 导出 ==========
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TreasureService: {
      exploreRealm,
      openChest,
      queryTreasureStatus,
      upgradeExploreLevel,
      quickExplore,
      TREASURE_STATES,
      TREASURE_QUALITIES,
      QUALITY_CONFIG,
      REALM_CONFIG,
      TREASURE_MCP_TOOLS
    }
  };
} else if (typeof GameGlobal !== 'undefined') {
  GameGlobal.TreasureService = {
    exploreRealm,
    openChest,
    queryTreasureStatus,
    upgradeExploreLevel,
    quickExplore,
    TREASURE_STATES,
    TREASURE_QUALITIES,
    QUALITY_CONFIG,
    REALM_CONFIG,
    TREASURE_MCP_TOOLS
  };
}