/**
 * WarService.js - 万界战争系统
 * 仙界万界之间的战争机制
 * 
 * MCP工具:
 * - war.declare(worldId, reason) - 宣战某个世界
 * - war.mobilize(armySize) - 动员军队
 * - war.battle() - 发起战斗
 * - war.result() - 获取战争结果
 * - war.query(worldId) - 查询世界战争状态
 */

const WAR_STATES = {
  PEACE: 'PEACE',
  MOBILIZING: 'MOBILIZING',
  AT_WAR: 'AT_WAR',
  RESOLVING: 'RESOLVING'
};

const WAR_OUTCOMES = {
  VICTORY: 'VICTORY',
  DEFEAT: 'DEFEAT',
  STALEMATE: 'STALEMATE',
  SURRENDER: 'SURRENDER'
};

const WORLD_DB_KEY = '_war_worlds_db';
const ACTIVE_WAR_KEY = '_war_active_war';
const WAR_COUNTER_KEY = '_war_id_counter';

// 世界数据库
let _worldsDB = {};
let _activeWar = null;
let _warIdCounter = 1;

// 初始化
function _initWarDatabase() {
  const existing = GameGlobal.getDB ? GameGlobal.getDB(WORLD_DB_KEY) : null;
  if (existing) {
    _worldsDB = existing;
  } else {
    _worldsDB = _createInitialWorlds();
    if (GameGlobal.setDB) GameGlobal.setDB(WORLD_DB_KEY, _worldsDB);
  }
  
  const activeWarData = GameGlobal.getDB ? GameGlobal.getDB(ACTIVE_WAR_KEY) : null;
  _activeWar = activeWarData || null;
  
  const counterData = GameGlobal.getDB ? GameGlobal.getDB(WAR_COUNTER_KEY) : null;
  _warIdCounter = counterData || 1;
}

function _createInitialWorlds() {
  return {
    'realm_1': { id: 'realm_1', name: '天元界', power: 1000, resources: 5000, allies: [], status: WAR_STATES.PEACE },
    'realm_2': { id: 'realm_2', name: '万妖界', power: 800, resources: 4000, allies: [], status: WAR_STATES.PEACE },
    'realm_3': { id: 'realm_3', name: '佛光界', power: 600, resources: 3000, allies: [], status: WAR_STATES.PEACE },
    'realm_4': { id: 'realm_4', name: '幽冥界', power: 700, resources: 3500, allies: [], status: WAR_STATES.PEACE },
    'realm_5': { id: 'realm_5', name: '天魔界', power: 900, resources: 4500, allies: [], status: WAR_STATES.PEACE },
    'player': { id: 'player', name: '玩家界', power: 500, resources: 2000, allies: ['realm_1'], status: WAR_STATES.PEACE }
  };
}

function _saveWorldsDB() {
  if (GameGlobal.setDB) GameGlobal.setDB(WORLD_DB_KEY, _worldsDB);
}

function _saveActiveWar() {
  if (GameGlobal.setDB) GameGlobal.setDB(ACTIVE_WAR_KEY, _activeWar);
}

function _saveWarCounter() {
  if (GameGlobal.setDB) GameGlobal.setDB(WAR_COUNTER_KEY, _warIdCounter);
}

// ========== MCP工具实现 ==========

/**
 * 宣战
 * @param {string} worldId - 目标世界ID
 * @param {string} reason - 宣战理由
 * @returns {object} 宣战结果
 */
function declareWar(worldId, reason) {
  _initWarDatabase();
  
  if (!worldId) {
    return { success: false, error: '缺少目标世界ID' };
  }
  
  const targetWorld = _worldsDB[worldId];
  if (!targetWorld) {
    return { success: false, error: `目标世界 ${worldId} 不存在` };
  }
  
  const playerWorld = _worldsDB['player'];
  if (!playerWorld) {
    return { success: false, error: '玩家世界未初始化' };
  }
  
  // 检查是否已有战争
  if (_activeWar && _activeWar.state !== WAR_STATES.PEACE) {
    return { success: false, error: `当前正在与 ${_activeWar.targetWorldId} 交战，无法同时宣战` };
  }
  
  // 检查条件：玩家世界状态
  if (playerWorld.status !== WAR_STATES.PEACE) {
    return { success: false, error: '玩家世界当前不处于和平状态，无法宣战' };
  }
  
  // 检查条件：目标世界状态
  if (targetWorld.status !== WAR_STATES.PEACE) {
    return { success: false, error: `目标世界 ${targetWorld.name} 当前不处于和平状态` };
  }
  
  // 检查条件：资源足够（宣战需要500资源）
  if (playerWorld.resources < 500) {
    return { success: false, error: '宣战需要至少500资源，当前资源不足' };
  }
  
  // 检查条件：实力差距不能太大（玩家power的50%-200%）
  const powerRatio = targetWorld.power / playerWorld.power;
  if (powerRatio > 2.0) {
    return { success: false, error: `目标世界 ${targetWorld.name} 实力过强（${powerRatio.toFixed(1)}倍），无法宣战` };
  }
  if (powerRatio < 0.5) {
    return { success: false, error: `目标世界 ${targetWorld.name} 实力过弱，无需宣战` };
  }
  
  // 扣除宣战资源
  playerWorld.resources -= 500;
  
  // 创建战争
  const warId = _warIdCounter++;
  _activeWar = {
    id: warId,
    attackerWorldId: 'player',
    targetWorldId: worldId,
    attackerName: playerWorld.name,
    targetName: targetWorld.name,
    reason: reason || '争夺资源',
    state: WAR_STATES.MOBILIZING,
    startTime: Date.now(),
    armies: {
      attacker: { size: 0, morale: 100, casualties: 0 },
      defender: { size: 0, morale: 100, casualties: 0 }
    },
    outcome: null
  };
  
  // 更新世界状态
  playerWorld.status = WAR_STATES.MOBILIZING;
  targetWorld.status = WAR_STATES.MOBILIZING;
  
  _saveWorldsDB();
  _saveActiveWar();
  _saveWarCounter();
  
  return {
    success: true,
    warId,
    message: `正式向 ${targetWorld.name} 宣战！理由：${reason || '争夺资源'}`,
    state: WAR_STATES.MOBILIZING,
    costs: { resources: 500 },
    nextStep: '请使用 war.mobilize() 动员军队'
  };
}

/**
 * 动员军队
 * @param {number} armySize - 军队规模
 * @returns {object} 动员结果
 */
function mobilizeArmy(armySize) {
  _initWarDatabase();
  
  if (!_activeWar) {
    return { success: false, error: '当前没有进行中的战争，请先宣战' };
  }
  
  if (_activeWar.state !== WAR_STATES.MOBILIZING) {
    return { success: false, error: `当前战争状态为 ${_activeWar.state}，无法动员军队` };
  }
  
  if (!armySize || armySize < 100) {
    return { success: false, error: '军队规模必须至少100人' };
  }
  
  const playerWorld = _worldsDB['player'];
  if (!playerWorld) {
    return { success: false, error: '玩家世界未初始化' };
  }
  
  // 计算资源消耗：每100人消耗10资源
  const resourceCost = Math.floor(armySize / 10) * 10;
  if (playerWorld.resources < resourceCost) {
    return { success: false, error: `资源不足，需要 ${resourceCost} 资源，当前只有 ${playerWorld.resources}` };
  }
  
  // 检查军队规模与power的关系（每100power最多动员1000人）
  const maxArmySize = Math.floor(playerWorld.power * 10);
  if (armySize > maxArmySize) {
    return { success: false, error: `军队规模过大，最多可动员 ${maxArmySize} 人` };
  }
  
  // 扣除资源
  playerWorld.resources -= resourceCost;
  
  // 动员军队
  _activeWar.armies.attacker.size = armySize;
  _activeWar.armies.attacker.morale = 100;
  
  // 模拟防御方动员
  const defenderWorld = _worldsDB[_activeWar.targetWorldId];
  if (defenderWorld) {
    const defenderArmySize = Math.floor(defenderWorld.power * 8);
    _activeWar.armies.defender.size = defenderArmySize;
    _activeWar.armies.defender.morale = 100;
    defenderWorld.status = WAR_STATES.AT_WAR;
  }
  
  playerWorld.status = WAR_STATES.AT_WAR;
  _activeWar.state = WAR_STATES.AT_WAR;
  
  _saveWorldsDB();
  _saveActiveWar();
  
  return {
    success: true,
    warId: _activeWar.id,
    message: `成功动员 ${armySize} 名士兵投入战争！`,
    armies: {
      attacker: { size: armySize, morale: 100 },
      defender: { size: _activeWar.armies.defender.size, morale: 100 }
    },
    resourceCost,
    nextStep: '请使用 war.battle() 发起战斗'
  };
}

/**
 * 发起战斗
 * @returns {object} 战斗结果
 */
function initiateBattle() {
  _initWarDatabase();
  
  if (!_activeWar) {
    return { success: false, error: '当前没有进行中的战争' };
  }
  
  if (_activeWar.state !== WAR_STATES.AT_WAR) {
    return { success: false, error: `当前战争状态为 ${_activeWar.state}，无法发起战斗` };
  }
  
  if (_activeWar.armies.attacker.size === 0) {
    return { success: false, error: '尚未动员军队，请先调用 war.mobilize()' };
  }
  
  const attacker = _activeWar.armies.attacker;
  const defender = _activeWar.armies.defender;
  
  // 战斗力计算：规模 * (morale/100) * (0.8-1.2随机)
  const attackerPower = attacker.size * (attacker.morale / 100) * (0.8 + Math.random() * 0.4);
  const defenderPower = defender.size * (defender.morale / 100) * (0.8 + Math.random() * 0.4);
  
  // 计算伤亡
  const totalPower = attackerPower + defenderPower;
  const attackerCasualtyRate = defenderPower / totalPower * 0.4;
  const defenderCasualtyRate = attackerPower / totalPower * 0.35;
  
  const attackerCasualties = Math.floor(attacker.size * attackerCasualtyRate);
  const defenderCasualties = Math.floor(defender.size * defenderCasualtyRate);
  
  attacker.casualties = attackerCasualties;
  defender.casualties = defenderCasualties;
  
  // 士气打击
  attacker.morale = Math.max(20, attacker.morale - attackerCasualtyRate * 50);
  defender.morale = Math.max(20, defender.morale - defenderCasualtyRate * 50);
  
  // 更新战争状态
  _activeWar.state = WAR_STATES.RESOLVING;
  
  _saveActiveWar();
  
  return {
    success: true,
    warId: _activeWar.id,
    battleStats: {
      attackerPower: Math.floor(attackerPower),
      defenderPower: Math.floor(defenderPower),
      attackerCasualties,
      defenderCasualties,
      attackerRemaining: attacker.size - attackerCasualties,
      defenderRemaining: defender.size - defenderCasualties
    },
    message: `战斗结束！攻击方损失 ${attackerCasualties} 人，防守方损失 ${defenderCasualties} 人`,
    nextStep: '请使用 war.result() 获取最终战争结果'
  };
}

/**
 * 获取战争结果
 * @returns {object} 战争最终结果
 */
function getWarResult() {
  _initWarDatabase();
  
  if (!_activeWar) {
    return { success: false, error: '当前没有进行中的战争' };
  }
  
  if (_activeWar.state !== WAR_STATES.RESOLVING) {
    return { success: false, error: `战争尚未结束，当前状态为 ${_activeWar.state}` };
  }
  
  const attacker = _activeWar.armies.attacker;
  const defender = _activeWar.armies.defender;
  
  const attackerRemaining = attacker.size - attacker.casualties;
  const defenderRemaining = defender.size - defender.casualties;
  
  // 判断胜负
  let outcome;
  let outcomeMessage;
  
  const powerRatio = attackerRemaining / defenderRemaining;
  
  if (defenderRemaining <= 0 || powerRatio > 1.5) {
    outcome = WAR_OUTCOMES.VICTORY;
    outcomeMessage = '大获全胜！攻占目标世界！';
  } else if (attackerRemaining < defenderRemaining * 0.5) {
    outcome = WAR_OUTCOMES.DEFEAT;
    outcomeMessage = '惨败，军队被击溃';
  } else if (Math.abs(powerRatio - 1.0) < 0.2) {
    outcome = WAR_OUTCOMES.STALEMATE;
    outcomeMessage = '陷入僵局，双方协议停战';
  } else {
    outcome = WAR_OUTCOMES.VICTORY;
    outcomeMessage = '险胜，迫使对方求和';
  }
  
  _activeWar.outcome = outcome;
  _activeWar.state = WAR_STATES.PEACE;
  
  // 计算奖励/惩罚
  let resourcesGained = 0;
  let resourcesLost = 0;
  
  if (outcome === WAR_OUTCOMES.VICTORY) {
    const targetWorld = _worldsDB[_activeWar.targetWorldId];
    if (targetWorld) {
      resourcesGained = Math.floor(targetWorld.resources * 0.1);
      targetWorld.resources -= resourcesGained;
      const playerWorld = _worldsDB['player'];
      if (playerWorld) playerWorld.resources += resourcesGained;
      targetWorld.status = WAR_STATES.PEACE;
    }
    _activeWar.rewards = { resources: resourcesGained };
  } else if (outcome === WAR_OUTCOMES.DEFEAT) {
    resourcesLost = Math.floor((_worldsDB['player']?.resources || 0) * 0.1);
    if (_worldsDB['player']) _worldsDB['player'].resources -= resourcesLost;
    _activeWar.penalties = { resources: resourcesLost };
  }
  
  // 重置世界状态
  const playerWorld = _worldsDB['player'];
  if (playerWorld) playerWorld.status = WAR_STATES.PEACE;
  const targetWorld = _worldsDB[_activeWar.targetWorldId];
  if (targetWorld) targetWorld.status = WAR_STATES.PEACE;
  
  _saveWorldsDB();
  _saveActiveWar();
  
  return {
    success: true,
    warId: _activeWar.id,
    outcome,
    outcomeMessage,
    finalStats: {
      attackerCasualties: attacker.casualties,
      defenderCasualties: defender.casualties,
      attackerRemaining,
      defenderRemaining
    },
    rewards: outcome === WAR_OUTCOMES.VICTORY ? { resources: resourcesGained } : null,
    penalties: outcome === WAR_OUTCOMES.DEFEAT ? { resources: resourcesLost } : null,
    warDuration: Math.floor((Date.now() - _activeWar.startTime) / 1000 / 60) + '分钟',
    message: outcomeMessage
  };
}

/**
 * 查询世界战争状态
 * @param {string} worldId - 世界ID（可选，默认查玩家世界）
 * @returns {object} 世界状态
 */
function queryWorldWarStatus(worldId) {
  _initWarDatabase();
  
  const targetId = worldId || 'player';
  const world = _worldsDB[targetId];
  
  if (!world) {
    return { success: false, error: `世界 ${targetId} 不存在` };
  }
  
  // 如果是玩家且有activeWar，附加战争信息
  if (targetId === 'player' && _activeWar) {
    return {
      success: true,
      world: {
        id: world.id,
        name: world.name,
        power: world.power,
        resources: world.resources,
        status: world.status,
        allies: world.allies
      },
      activeWar: {
        id: _activeWar.id,
        targetWorldId: _activeWar.targetWorldId,
        targetName: _activeWar.targetName,
        state: _activeWar.state,
        outcome: _activeWar.outcome,
        armies: _activeWar.armies
      }
    };
  }
  
  return {
    success: true,
    world: {
      id: world.id,
      name: world.name,
      power: world.power,
      resources: world.resources,
      status: world.status,
      allies: world.allies
    }
  };
}

/**
 * 获取所有世界列表
 * @returns {object} 所有世界信息
 */
function listAllWorlds() {
  _initWarDatabase();
  
  const worlds = Object.values(_worldsDB).map(w => ({
    id: w.id,
    name: w.name,
    power: w.power,
    status: w.status
  }));
  
  return {
    success: true,
    worlds,
    count: worlds.length
  };
}

// ========== MCP工具定义 ==========
const WAR_MCP_TOOLS = [
  {
    name: 'war.declare',
    description: '向指定世界宣战（需要500资源，实力差距在0.5-2.0倍之间）',
    params: { worldId: 'string', reason: 'string?' }
  },
  {
    name: 'war.mobilize',
    description: '动员军队投入战争（消耗资源，每100人10资源）',
    params: { armySize: 'number' }
  },
  {
    name: 'war.battle',
    description: '发起战斗，计算双方伤亡',
    params: {}
  },
  {
    name: 'war.result',
    description: '获取战争最终结果（胜/败/僵局）及奖励惩罚',
    params: {}
  },
  {
    name: 'war.query',
    description: '查询世界战争状态',
    params: { worldId: 'string?' }
  },
  {
    name: 'war.list',
    description: '获取所有世界列表',
    params: {}
  }
];

// ========== 导出 ==========
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    WarService: {
      declareWar,
      mobilizeArmy,
      initiateBattle,
      getWarResult,
      queryWorldWarStatus,
      listAllWorlds,
      WAR_STATES,
      WAR_OUTCOMES,
      WAR_MCP_TOOLS
    }
  };
} else if (typeof GameGlobal !== 'undefined') {
  GameGlobal.WarService = {
    declareWar,
    mobilizeArmy,
    initiateBattle,
    getWarResult,
    queryWorldWarStatus,
    listAllWorlds,
    WAR_STATES,
    WAR_OUTCOMES,
    WAR_MCP_TOOLS
  };
}