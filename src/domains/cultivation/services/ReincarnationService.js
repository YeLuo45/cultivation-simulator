/**
 * ReincarnationService.js - 天道轮回系统
 * 轮回转世、记忆继承、因果累积
 * 
 * MCP工具:
 * - reincarnate.perform() - 执行轮回转世
 * - reincarnate.query() - 查询轮回状态
 * - reincarnate.bless() - 轮回祝福发放
 * - reincarnate.karma() - 查询因果值
 */

const REINC_STATES = {
  ALIVE: 'ALIVE',
  DYING: 'DYING',
  REINCARNATING: 'REINCARNATING',
  REBORN: 'REBORN'
};

const KARMA_STATES = {
  HEAVY_SIN: 'HEAVY_SIN',     // 重罪
  SIN: 'SIN',                 // 有罪
  NEUTRAL: 'NEUTRAL',         // 中立
  VIRTUE: 'VIRTUE',           // 有德
  HIGH_VIRTUE: 'HIGH_VIRTUE'  // 大德
};

const REINC_DB_KEY = '_reinc_db';
const REINC_COUNTER_KEY = '_reinc_counter';

let _reincDB = null;
let _reincCounter = 1;

function _initDB() {
  const existing = GameGlobal.getDB ? GameGlobal.getDB(REINC_DB_KEY) : null;
  if (existing) {
    _reincDB = existing;
  } else {
    _reincDB = {
      state: REINC_STATES.ALIVE,
      reincarnationCount: 0,
      totalLifetimes: 1,
      karmaPoints: 0,
      karmaState: KARMA_STATES.NEUTRAL,
      memories: [],
      blessings: [],
      currentLifetimeStart: Date.now(),
      previousLife: null
    };
    if (GameGlobal.setDB) GameGlobal.setDB(REINC_DB_KEY, _reincDB);
  }
  const counter = GameGlobal.getDB ? GameGlobal.getDB(REINC_COUNTER_KEY) : null;
  _reincCounter = counter || 1;
}

function _saveDB() {
  if (GameGlobal.setDB) GameGlobal.setDB(REINC_DB_KEY, _reincDB);
  if (GameGlobal.setDB) GameGlobal.setDB(REINC_COUNTER_KEY, _reincCounter);
}

function _calculateKarmaState(karma) {
  if (karma <= -1000) return KARMA_STATES.HEAVY_SIN;
  if (karma <= -100) return KARMA_STATES.SIN;
  if (karma >= 1000) return KARMA_STATES.HIGH_VIRTUE;
  if (karma >= 100) return KARMA_STATES.VIRTUE;
  return KARMA_STATES.NEUTRAL;
}

// 祝福类型
const BLESSING_TYPES = {
  SECOND_CHANCE: { name: '再世为人', effect: '下辈子保留30%属性', multiplier: 0.3 },
  MEMORY_INHERIT: { name: '记忆传承', effect: '保留前世记忆碎片', multiplier: 0.2 },
  TALENT_BOOST: { name: '天赋提升', effect: '修炼速度+15%', multiplier: 0.15 },
  FATE_SHIFT: { name: '命格转变', effect: '随机改变命格', multiplier: 0 },
  ELITE_BLOODLINE: { name: '精英血脉', effect: '天生灵力+20%', multiplier: 0.2 }
};

/**
 * 查询轮回状态
 */
function queryReincarnationStatus() {
  _initDB();
  
  const playerLevel = GameGlobal.getPlayerAttribute ? GameGlobal.getPlayerAttribute('level') : 1;
  const playerSpirit = GameGlobal.getPlayerAttribute ? GameGlobal.getPlayerAttribute('spiritRoot') : 1;
  
  return {
    success: true,
    status: {
      state: _reincDB.state,
      reincarnationCount: _reincDB.reincarnationCount,
      totalLifetimes: _reincDB.totalLifetimes,
      karmaPoints: _reincDB.karmaPoints,
      karmaState: _reincDB.karmaState,
      memoriesCount: _reincDB.memories.length,
      blessingsCount: _reincDB.blessings.length
    },
    playerInfo: {
      level: playerLevel,
      spiritRoot: playerSpirit
    },
    previousLife: _reincDB.previousLife,
    activeBlessings: _reincDB.blessings.filter(b => !b.used),
    karmaStateInfo: {
      [KARMA_STATES.HEAVY_SIN]: { name: '重罪', description: '轮回将受惩罚，可能降生为畜生道', modifier: -0.5 },
      [KARMA_STATES.SIN]: { name: '有罪', description: '轮回将受轻微惩罚', modifier: -0.2 },
      [KARMA_STATES.NEUTRAL]: { name: '中立', description: '普通轮回', modifier: 0 },
      [KARMA_STATES.VIRTUE]: { name: '有德', description: '轮回将获奖励', modifier: 0.2 },
      [KARMA_STATES.HIGH_VIRTUE]: { name: '大德', description: '轮回将获大幅提升，可保留更多前世积累', modifier: 0.5 }
    }
  };
}

/**
 * 查询因果值
 */
function queryKarma() {
  _initDB();
  
  const karmaConfig = {
    [KARMA_STATES.HEAVY_SIN]: { name: '重罪', min: -Infinity, max: -1000, color: '#8B0000' },
    [KARMA_STATES.SIN]: { name: '有罪', min: -1000, max: -100, color: '#CD5C5C' },
    [KARMA_STATES.NEUTRAL]: { name: '中立', min: -100, max: 100, color: '#808080' },
    [KARMA_STATES.VIRTUE]: { name: '有德', min: 100, max: 1000, color: '#4169E1' },
    [KARMA_STATES.HIGH_VIRTUE]: { name: '大德', min: 1000, max: Infinity, color: '#FFD700' }
  };
  
  const config = karmaConfig[_reincDB.karmaState];
  
  return {
    success: true,
    karma: {
      points: _reincDB.karmaPoints,
      state: _reincDB.karmaState,
      stateName: config.name,
      color: config.color,
      description: _getKarmaDescription(_reincDB.karmaPoints)
    },
    reincarnationCount: _reincDB.reincarnationCount,
    lifetimeMultiplier: _getLifetimeMultiplier()
  };
}

function _getKarmaDescription(karma) {
  if (karma <= -1000) return '罪孽深重，来世将投身畜生道，历经苦难方能转人';
  if (karma <= -500) return '身负重罪，来世将降生为凡人，历经波折';
  if (karma <= -100) return '有些许罪孽，来世可能运势不佳';
  if (karma < 100) return '无功无过，来世将正常轮回';
  if (karma < 500) return '积累功德，来世将有良好运势';
  if (karma < 1000) return '功德深厚，来世将投身修道世家';
  return '功德无量，来世将天生灵根卓越，修炼事半功倍';
}

function _getLifetimeMultiplier() {
  const base = 1.0;
  const karmaMod = {
    [KARMA_STATES.HEAVY_SIN]: -0.5,
    [KARMA_STATES.SIN]: -0.2,
    [KARMA_STATES.NEUTRAL]: 0,
    [KARMA_STATES.VIRTUE]: 0.2,
    [KARMA_STATES.HIGH_VIRTUE]: 0.5
  }[_reincDB.karmaState] || 0;
  
  const reincMod = Math.min(_reincDB.reincarnationCount * 0.02, 0.3);
  return base + karmaMod + reincMod;
}

/**
 * 执行轮回转世
 */
function performReincarnation() {
  _initDB();
  
  if (_reincDB.state !== REINC_STATES.ALIVE) {
    return { success: false, error: `当前状态 ${_reincDB.state} 无法轮回` };
  }
  
  // 计算轮回条件
  const playerAge = GameGlobal.getPlayerAttribute ? GameGlobal.getPlayerAttribute('age') || 0 : 0;
  const minAge = 80 + Math.random() * 40; // 80-120岁自然死亡
  
  if (playerAge < minAge) {
    return { success: false, error: `寿元未尽（${Math.floor(minAge)}岁），无法轮回` };
  }
  
  // 开始轮回
  _reincDB.state = REINC_STATES.REINCARNATING;
  _saveDB();
  
  // 保存前世信息
  const previousLife = {
    age: playerAge,
    level: GameGlobal.getPlayerAttribute ? GameGlobal.getPlayerAttribute('level') : 1,
    karmaAtDeath: _reincDB.karmaPoints,
    reincarnationsBefore: _reincDB.reincarnationCount,
    deathTime: Date.now()
  };
  
  // 计算继承
  const modifier = _getLifetimeMultiplier();
  const memoryRetention = Math.max(0, 0.1 + modifier * 0.3);
  
  // 重置状态
  _reincDB.reincarnationCount++;
  _reincDB.totalLifetimes++;
  _reincDB.state = REINC_STATES.REBORN;
  _reincDB.currentLifetimeStart = Date.now();
  _reincDB.previousLife = previousLife;
  
  // 处理因果
  const karmaResult = _processKarmaAtReincarnation();
  _reincDB.karmaPoints += karmaResult.karmaChange;
  _reincDB.karmaState = _calculateKarmaState(_reincDB.karmaPoints);
  
  // 随机获得前世记忆
  if (Math.random() < memoryRetention && previousLife.level > 10) {
    _reincDB.memories.push({
      type: 'SKILL',
      description: `回忆起前世修炼心得`,
      level: previousLife.level,
      retainedAt: Date.now()
    });
  }
  
  // 应用祝福效果
  const blessingEffects = _applyBlessings(modifier);
  
  _saveDB();
  
  return {
    success: true,
    message: `轮回转世成功！这是第 ${_reincDB.reincarnationCount} 次轮回`,
    reincarnationCount: _reincDB.reincarnationCount,
    previousLife,
    karmaResult,
    blessingEffects,
    newState: REINC_STATES.REBORN,
    lifetimeMultiplier: modifier,
    memoryRetention: (memoryRetention * 100).toFixed(1) + '%',
    nextStep: '状态将在下一次登录时重置为 ALIVE'
  };
}

function _processKarmaAtReincarnation() {
  const karma = _reincDB.karmaPoints;
  let karmaChange = 0;
  let description = '';
  
  if (karma <= -1000) {
    karmaChange = 200; // 重罪者轮回后因果减轻
    description = '因重罪堕入畜生道，经历苦难后因果减轻';
  } else if (karma < -100) {
    karmaChange = 50;
    description = '因负罪而轮回，来世需继续积德';
  } else if (karma >= 1000) {
    karmaChange = -100; // 大德者轮回后部分因果回馈
    description = '因大德而受天道眷顾，部分功德回馈';
  } else if (karma >= 100) {
    karmaChange = -20;
    description = '因有德而受天道祝福，因果略有减轻';
  } else {
    karmaChange = 0;
    description = '普通轮回，无因果变化';
  }
  
  return { karmaChange, description };
}

function _applyBlessings(modifier) {
  const effects = [];
  
  // 检查激活的祝福
  _reincDB.blessings.filter(b => !b.used).forEach(blessing => {
    const config = BLESSING_TYPES[blessing.type];
    if (config) {
      effects.push({
        type: blessing.type,
        name: config.name,
        effect: config.effect,
        value: Math.floor(blessing.value * modifier)
      });
      blessing.used = true;
    }
  });
  
  return effects;
}

/**
 * 发放轮回祝福
 */
function grantReincarnationBlessing(type) {
  _initDB();
  
  if (!type) {
    // 随机祝福类型
    const types = Object.keys(BLESSING_TYPES);
    type = types[Math.floor(Math.random() * types.length)];
  }
  
  if (!BLESSING_TYPES[type]) {
    return { success: false, error: `祝福类型 ${type} 不存在` };
  }
  
  const config = BLESSING_TYPES[type];
  const value = 100 + _reincDB.reincarnationCount * 20;
  
  _reincDB.blessings.push({
    type,
    name: config.name,
    effect: config.effect,
    value,
    grantedAt: Date.now(),
    used: false
  });
  
  _saveDB();
  
  return {
    success: true,
    message: `获得轮回祝福：${config.name}`,
    blessing: {
      type,
      name: config.name,
      effect: config.effect,
      value,
      description: config.effect
    }
  };
}

/**
 * 消耗因果值（用于特殊行为）
 */
function spendKarma(amount) {
  _initDB();
  
  if (_reincDB.karmaPoints < amount) {
    return { success: false, error: `因果值不足（当前 ${_reincDB.karmaPoints}，需要 ${amount}）` };
  }
  
  _reincDB.karmaPoints -= amount;
  _reincDB.karmaState = _calculateKarmaState(_reincDB.karmaPoints);
  _saveDB();
  
  return {
    success: true,
    message: `消耗了 ${amount} 点因果值`,
    remainingKarma: _reincDB.karmaPoints,
    newKarmaState: _reincDB.karmaState
  };
}

/**
 * 增加因果值（用于善行）
 */
function gainKarma(amount, reason) {
  _initDB();
  
  _reincDB.karmaPoints += amount;
  _reincDB.karmaState = _calculateKarmaState(_reincDB.karmaPoints);
  _saveDB();
  
  return {
    success: true,
    message: `因 ${reason || '善行'} 获得 ${amount} 点因果值`,
    totalKarma: _reincDB.karmaPoints,
    karmaState: _reincDB.karmaState
  };
}

// MCP工具定义
const REINC_MCP_TOOLS = [
  { name: 'reincarnate.query', description: '查询轮回状态', params: {} },
  { name: 'reincarnate.karma', description: '查询因果值', params: {} },
  { name: 'reincarnate.perform', description: '执行轮回转世', params: {} },
  { name: 'reincarnate.bless', description: '发放轮回祝福', params: { type: 'string?' } },
  { name: 'reincarnate.spend', description: '消耗因果值', params: { amount: 'number' } },
  { name: 'reincarnate.gain', description: '增加因果值', params: { amount: 'number', reason: 'string?' } }
];

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ReincarnationService: {
      queryReincarnationStatus,
      queryKarma,
      performReincarnation,
      grantReincarnationBlessing,
      spendKarma,
      gainKarma,
      REINC_STATES,
      KARMA_STATES,
      BLESSING_TYPES,
      REINC_MCP_TOOLS
    }
  };
} else if (typeof GameGlobal !== 'undefined') {
  GameGlobal.ReincarnationService = {
    queryReincarnationStatus,
    queryKarma,
    performReincarnation,
    grantReincarnationBlessing,
    spendKarma,
    gainKarma,
    REINC_STATES,
    KARMA_STATES,
    BLESSING_TYPES,
    REINC_MCP_TOOLS
  };
}