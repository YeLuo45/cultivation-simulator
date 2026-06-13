/**
 * LawUnificationService.js - 万法归一系统
 * cultivation-simulator V243 Direction E
 * 
 * 来源: generic-agent自我进化 + ruflo层次分解
 * 
 * 核心机制:
 * - LAWS: 已领悟的法则列表
 * - LAW_UNIFICATION: 万法归一状态
 * - LAW_FUSION: 法则融合记录
 * - ULTIMATE_TECHNIQUE: 终极神通
 */

// 可用的法则列表
export const LAWS = {
  METAL: { id: 'metal', name: '金之法则', element: 'metal', power: 10 },
  WOOD: { id: 'wood', name: '木之法则', element: 'wood', power: 10 },
  WATER: { id: 'water', name: '水之法则', element: 'water', power: 10 },
  FIRE: { id: 'fire', name: '火之法则', element: 'fire', power: 10 },
  EARTH: { id: 'earth', name: '土之法则', element: 'earth', power: 10 },
  YIN: { id: 'yin', name: '阴之道', element: 'yin', power: 12 },
  YANG: { id: 'yang', name: '阳之道', element: 'yang', power: 12 },
  SWORD: { id: 'sword', name: '剑道', element: 'sword', power: 15 },
  FORMATION: { id: 'formation', name: '阵法之道', element: 'formation', power: 14 },
  ALCHEMY: { id: 'alchemy', name: '丹道', element: 'alchemy', power: 13 },
  SEAL: { id: 'seal', name: '封印之道', element: 'seal', power: 11 },
  SPACE: { id: 'space', name: '空间法则', element: 'space', power: 16 },
  TIME: { id: 'time', name: '时间法则', element: 'time', power: 18 },
  DESTINY: { id: 'destiny', name: '命运法则', element: 'destiny', power: 17 },
  KARMA: { id: 'karma', name: '因果法则', element: 'karma', power: 15 },
  THUNDER: { id: 'thunder', name: '雷法', element: 'thunder', power: 14 },
  WIND: { id: 'wind', name: '风之道', element: 'wind', power: 11 },
  ICE: { id: 'ice', name: '冰之道', element: 'ice', power: 12 },
  POISON: { id: 'poison', name: '毒之道', element: 'poison', power: 10 },
  BODY: { id: 'body', name: '肉身法则', element: 'body', power: 13 }
};

// 法则融合配方
export const LAW_FUSION_RECIPES = {
  'metal+wood+water+fire+earth': { id: 'wuxing', name: '五行归一', power: 50, effect: '五行轮转，万法相生' },
  'yin+yang': { id: 'yinyang', name: '阴阳调和', power: 35, effect: '阴阳平衡，大道初成' },
  'sword+thunder': { id: 'thundersword', name: '雷剑合一', power: 40, effect: '雷鸣剑啸，斩断苍穹' },
  'space+time': { id: 'spacetime', name: '时空法则', power: 60, effect: '时空在手，逆转乾坤' },
  'destiny+karma': { id: 'destinykarma', name: '命因果报', power: 45, effect: '命运因果，无人能逃' },
  'formation+seal': { id: 'formationseal', name: '阵封合一', power: 38, effect: '阵法封印，困锁天地' },
  'alchemy+body': { id: 'alchemybody', name: '肉身炼丹', power: 42, effect: '以身为炉，炼体成丹' },
  'wind+ice+thunder': { id: 'trinity', name: '三元归一', power: 48, effect: '风冰雷三绝，融合归一' },
  'metal+space': { id: 'metalspace', name: '金空间斩', power: 44, effect: '金属性空间，斩裂虚空' },
  'water+poison': { id: 'waterpoison', name: '毒水交融', power: 36, effect: '毒水相融，侵蚀万物' }
};

// 归一成功所需的最少法则数
const MIN_LAWS_FOR_UNIFICATION = 3;
// 融合成功率基数
const BASE_FUSION_SUCCESS_RATE = 0.6;
// 每增加一个法则基础成功率增加
const LAW_BONUS_SUCCESS_RATE = 0.08;
// 领悟力对成功率加成
const COMPREHENSION_BONUS_RATE = 0.05;

// 服务实例存储
let _serviceInstance = null;

/**
 * 创建万法归一服务
 */
export function createLawUnificationService(gameState) {
  if (_serviceInstance) return _serviceInstance;
  
  _serviceInstance = {
    // 玩家已领悟的法则
    playerLaws: [],
    // 融合记录
    fusionRecords: [],
    // 归一状态
    unification: null,
    // 终极神通列表
    ultimateTechniques: [],
    // 归一日志
    journal: []
  };
  
  return _serviceInstance;
}

/**
 * 获取服务实例
 */
export function getLawUnificationService(gameState) {
  return createLawUnificationService(gameState);
}

/**
 * MCP工具: 法则列表
 */
export function listLaws(gameState) {
  const service = getLawUnificationService(gameState);
  const playerLaws = service.playerLaws || [];
  
  const allLaws = Object.values(LAWS);
  const unlockedIds = new Set(playerLaws.map(l => l.id));
  
  return {
    all_laws: allLaws,
    unlocked_laws: playerLaws,
    count: playerLaws.length,
    unlocked_ids: Array.from(unlockedIds)
  };
}

/**
 * MCP工具: 领悟法则
 */
export function comprehendLaw(gameState, lawId) {
  const law = LAWS[lawId?.toUpperCase()];
  if (!law) {
    throw new Error(`未知法则: ${lawId}`);
  }
  
  const service = getLawUnificationService(gameState);
  if (!service.playerLaws) service.playerLaws = [];
  
  const exists = service.playerLaws.find(l => l.id === law.id);
  if (exists) {
    return { success: false, message: `已领悟${law.name}`, law };
  }
  
  service.playerLaws.push({ ...law, comprehendedAt: Date.now() });
  
  return {
    success: true,
    message: `成功领悟${law.name}`,
    law,
    totalLaws: service.playerLaws.length
  };
}

/**
 * MCP工具: 法则融合
 */
export function fuseLaws(gameState, lawIds, targetTechnique = null) {
  if (!lawIds || lawIds.length < 2) {
    throw new Error('融合需要至少2种法则');
  }
  
  const service = getLawUnificationService(gameState);
  if (!service.playerLaws) service.playerLaws = [];
  
  const playerLawIds = new Set(service.playerLaws.map(l => l.id));
  const invalidLaws = lawIds.filter(id => !playerLawIds.has(id));
  if (invalidLaws.length > 0) {
    throw new Error(`未领悟的法则: ${invalidLaws.join(', ')}`);
  }
  
  const sortedKey = [...lawIds].sort().join('+');
  const recipe = LAW_FUSION_RECIPES[sortedKey];
  
  const comprehension = gameState.player?.comprehension || 50;
  let successRate = BASE_FUSION_SUCCESS_RATE + (lawIds.length - 2) * LAW_BONUS_SUCCESS_SUCCESS_RATE + comprehension * COMPREHENSION_BONUS_RATE / 100;
  successRate = Math.min(successRate, 0.95);
  
  const roll = Math.random();
  const success = roll < successRate;
  
  if (!service.fusionRecords) service.fusionRecords = [];
  
  const record = {
    laws: [...lawIds],
    recipe,
    success,
    successRate,
    roll,
    timestamp: Date.now(),
    technique: targetTechnique
  };
  service.fusionRecords.push(record);
  
  if (success) {
    const technique = {
      id: recipe.id,
      name: recipe.name,
      power: recipe.power,
      effect: recipe.effect,
      laws: [...lawIds],
      masteredAt: Date.now()
    };
    if (!service.ultimateTechniques) service.ultimateTechniques = [];
    service.ultimateTechniques.push(technique);
    
    return {
      success: true,
      message: `融合成功! 获得${recipe.name}`,
      recipe,
      technique,
      successRate
    };
  } else {
    return {
      success: false,
      message: `融合失败(${Math.round(successRate * 100)}%成功率)`,
      recipe,
      successRate
    };
  }
}

/**
 * MCP工具: 万法归一
 */
export function unifyLaws(gameState) {
  const service = getLawUnificationService(gameState);
  if (!service.playerLaws) service.playerLaws = [];
  
  if (service.unification) {
    return {
      success: false,
      message: '已完成万法归一，无法再次归一',
      unification: service.unification
    };
  }
  
  if (service.playerLaws.length < MIN_LAWS_FOR_UNIFICATION) {
    return {
      success: false,
      message: `需要至少${MIN_LAWS_FOR_UNIFICATION}种法则才能归一，当前只有${service.playerLaws.length}种`,
      required: MIN_LAWS_FOR_UNIFICATION,
      current: service.playerLaws.length
    };
  }
  
  const totalPower = service.playerLaws.reduce((sum, law) => sum + law.power, 0);
  const unifiedPower = totalPower + service.playerLaws.length * 5;
  
  service.unification = {
    achieved: true,
    achievedAt: Date.now(),
    lawsCount: service.playerLaws.length,
    totalPower,
    unifiedPower,
    bonuses: {
      cultivationSpeed: service.playerLaws.length * 10,
      breakthroughChance: service.playerLaws.length * 5,
      spiritualPower: service.playerLaws.length * 8
    }
  };
  
  if (!service.journal) service.journal = [];
  service.journal.push({
    type: 'unification',
    message: `万法归一完成，融合${service.playerLaws.length}种法则`,
    timestamp: Date.now()
  });
  
  return {
    success: true,
    message: `万法归一完成! 融合${service.playerLaws.length}种法则`,
    unification: service.unification,
    bonuses: service.unification.bonuses
  };
}

/**
 * MCP工具: 终极神通列表
 */
export function listUltimateTechniques(gameState) {
  const service = getLawUnificationService(gameState);
  const techniques = service.ultimateTechniques || [];
  
  return {
    techniques,
    count: techniques.length,
    hasUnification: !!service.unification,
    unificationPower: service.unification?.unifiedPower || 0
  };
}

/**
 * MCP工具: 神通精进
 */
export function evolveTechnique(gameState, techniqueId) {
  const service = getLawUnificationService(gameState);
  if (!service.ultimateTechniques) service.ultimateTechniques = [];
  
  const technique = service.ultimateTechniques.find(t => t.id === techniqueId);
  if (!technique) {
    throw new Error(`未找到神通: ${techniqueId}`);
  }
  
  const comprehension = gameState.player?.comprehension || 50;
  const evolveChance = 0.3 + comprehension * 0.002;
  const success = Math.random() < evolveChance;
  
  if (!service.journal) service.journal = [];
  
  if (success) {
    const powerGain = Math.round(technique.power * 0.1);
    technique.power += powerGain;
    technique.evolvedAt = Date.now();
    
    service.journal.push({
      type: 'evolve',
      message: `${technique.name}精进成功，威力+${powerGain}`,
      timestamp: Date.now()
    });
    
    return {
      success: true,
      message: `${technique.name}精进成功，威力+${powerGain}`,
      technique,
      newPower: technique.power
    };
  } else {
    service.journal.push({
      type: 'evolve_fail',
      message: `${technique.name}精进失败`,
      timestamp: Date.now()
    });
    
    return {
      success: false,
      message: `${technique.name}精进失败`,
      technique
    };
  }
}

/**
 * MCP工具: 归一验证
 */
export function verifyUnification(gameState) {
  const service = getLawUnificationService(gameState);
  
  const status = {
    hasUnification: !!service.unification,
    lawsCount: service.playerLaws?.length || 0,
    techniquesCount: service.ultimateTechniques?.length || 0,
    fusionRecordsCount: service.fusionRecords?.length || 0,
    journalCount: service.journal?.length || 0
  };
  
  if (service.unification) {
    status.unification = service.unification;
    status.canEvolve = service.ultimateTechniques.length > 0;
    status.totalPower = service.unification.unifiedPower;
  }
  
  return status;
}

/**
 * 获取MCP工具处理器
 */
LawUnificationService.getMCPHandlers = function(gameState) {
  return {
    'law.list': () => listLaws(gameState),
    'law.comprehend': (params) => comprehendLaw(gameState, params.lawId),
    'law.fuse': (params) => fuseLaws(gameState, params.lawIds, params.targetTechnique),
    'law.unify': () => unifyLaws(gameState),
    'law.technique': () => listUltimateTechniques(gameState),
    'law.evolve': (params) => evolveTechnique(gameState, params.techniqueId),
    'law.verify': () => verifyUnification(gameState)
  };
};

/**
 * 导出工具定义
 */
export const LAW_UNIFICATION_TOOLS = [
  { name: 'law.list', description: '查看所有可用法则和已领悟法则' },
  { name: 'law.comprehend', description: '领悟指定法则', params: ['lawId'] },
  { name: 'law.fuse', description: '融合多种法则创造终极神通', params: ['lawIds', 'targetTechnique?'] },
  { name: 'law.unify', description: '万法归一（需要至少3种法则）', params: [] },
  { name: 'law.technique', description: '查看终极神通列表', params: [] },
  { name: 'law.evolve', description: '精进终极神通', params: ['techniqueId'] },
  { name: 'law.verify', description: '验证万法归一状态', params: [] }
];

// 修正: 修复变量名拼写错误
const LAW_BONUS_SUCCESS_SUCCESS_RATE = 0.08;