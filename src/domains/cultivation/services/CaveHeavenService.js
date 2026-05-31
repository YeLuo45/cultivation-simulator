/**
 * CaveHeavenService.js - 仙府洞天+洞府经营系统
 * V245: 仙府洞天+洞府经营
 * 
 * 功能：
 * 1. 洞天等级系统 (小洞天/中洞天/大门天/洞天福地/天府)
 * 2. 洞府建筑系统 (修炼室/丹房/炼器室/灵草园/藏经阁)
 * 3. 资源产出机制
 */

// ===== 常量定义 =====

/**
 * 洞天等级定义
 */
export const CAVE_HEAVEN_LEVELS = {
  '小洞天': { minLevel: 1, 灵气加成: 1.0, 建设度上限: 100, tierIndex: 0 },
  '中洞天': { minLevel: 10, 灵气加成: 1.5, 建设度上限: 500, tierIndex: 1 },
  '大洞天': { minLevel: 30, 灵气加成: 2.0, 建设度上限: 2000, tierIndex: 2 },
  '洞天福地': { minLevel: 60, 灵气加成: 3.0, 建设度上限: 10000, tierIndex: 3 },
  '天府': { minLevel: 100, 灵气加成: 5.0, 建设度上限: 99999, tierIndex: 4 }
};

/**
 * 洞天等级顺序
 */
export const CAVE_LEVEL_ORDER = ['小洞天', '中洞天', '大洞天', '洞天福地', '天府'];

/**
 * 建筑类型定义
 */
export const CAVE_BUILDINGS = {
  '修炼室': { cost: 50, 资源类型: '灵气', 产出量: 10, 建设时间: 60 },
  '丹房': { cost: 100, 资源类型: '丹药', 产出量: 5, 建设时间: 120 },
  '炼器室': { cost: 100, 资源类型: '法器', 产出量: 3, 建设时间: 120 },
  '灵草园': { cost: 80, 资源类型: '灵草', 产出量: 15, 建设时间: 90 },
  '藏经阁': { cost: 200, 资源类型: '功法', 产出量: 2, 建设时间: 180 }
};

/**
 * 建筑等级加成
 */
export const BUILDING_LEVEL_MULTIPLIERS = {
  1: 1.0,
  2: 1.5,
  3: 2.0,
  4: 3.0,
  5: 5.0
};

/**
 * 设施类型定义 (灵界洞府专用)
 */
export const CAVE_FACILITIES = {
  '灵池': { 
    cost: 200, 
    resourceType: '灵气', 
    output: 50, 
    buildTime: 180,
    description: '聚集天地灵气，提升修炼效率'
  },
  '药园': { 
    cost: 150, 
    resourceType: '灵草', 
    output: 30, 
    buildTime: 120,
    description: '种植灵草，可产出炼丹材料'
  },
  '矿脉': { 
    cost: 300, 
    resourceType: '矿石', 
    output: 20, 
    buildTime: 240,
    description: '开采灵矿，产出炼器材料'
  },
  '阵法': { 
    cost: 250, 
    resourceType: '阵法经验', 
    output: 15, 
    buildTime: 200,
    description: '布置阵法，可提升洞府防护和产出'
  }
};

/**
 * 洞府等级升级消耗
 */
const CAVE_UPGRADE_COSTS = {
  '小洞天': 0,
  '中洞天': 100,
  '大洞天': 500,
  '洞天福地': 2000,
  '天府': 10000
};

// ===== MCP工具新增洞府存储 =====
// 用于管理多个灵界洞府
const _caveHeavenDatabase = new Map();
let _caveIdCounter = 0;

// ===== 服务类 =====

/**
 * 创建洞天服务实例
 */
export function createCaveHeavenService(gameState) {
  return new CaveHeavenService(gameState);
}

class CaveHeavenService {
  constructor(gameState) {
    this.gameState = gameState;
    this._ensureCaveData();
  }

  _ensureCaveData() {
    if (!this.gameState.caveHeaven) {
      this.gameState.caveHeaven = {
        等级: '小洞天',
        建设度: 0,
        灵气浓度: 1.0,
        建筑: {},
        升级历史: []
      };
    }
    if (!this.gameState.caveHeaven.建筑) {
      this.gameState.caveHeaven.建筑 = {};
    }
  }

  // ===== 洞天等级系统 =====

  /**
   * 获取当前洞天等级
   */
  getCaveLevel() {
    return this.gameState.caveHeaven.等级;
  }

  /**
   * 获取洞天信息
   */
  getCaveInfo() {
    const cave = this.gameState.caveHeaven;
    const levelInfo = CAVE_HEAVEN_LEVELS[cave.等级];
    return {
      等级: cave.等级,
      建设度: cave.建设度,
      灵气浓度: cave.灵气浓度,
      建设度上限: levelInfo.建设度上限,
      灵气加成: levelInfo.灵气加成,
      建筑数量: Object.keys(cave.建筑).length
    };
  }

  /**
   * 升级洞天
   */
  upgradeCaveHeaven() {
    const cave = this.gameState.caveHeaven;
    const currentLevel = cave.等级;
    const currentIndex = CAVE_LEVEL_ORDER.indexOf(currentLevel);
    
    if (currentIndex >= CAVE_LEVEL_ORDER.length - 1) {
      return { success: false, message: '已达最高洞天等级' };
    }

    const nextLevel = CAVE_LEVEL_ORDER[currentIndex + 1];
    const requiredConstruction = CAVE_UPGRADE_COSTS[nextLevel];

    if (cave.建设度 < requiredConstruction) {
      return {
        success: false,
        message: `建设度不足，需要${requiredConstruction}点，当前${cave.建设度}点`
      };
    }

    cave.等级 = nextLevel;
    cave.灵气浓度 = CAVE_HEAVEN_LEVELS[nextLevel].灵气加成;

    this.gameState.caveHeaven.升级历史.push({
      from: currentLevel,
      to: nextLevel,
      timestamp: Date.now()
    });

    return {
      success: true,
      message: `洞天升级成功：${currentLevel} → ${nextLevel}`,
      newLevel: nextLevel,
      灵气加成: cave.灵气浓度
    };
  }

  /**
   * 检查洞天升级条件
   */
  canUpgradeCaveHeaven() {
    const cave = this.gameState.caveHeaven;
    const currentLevel = cave.等级;
    const currentIndex = CAVE_LEVEL_ORDER.indexOf(currentLevel);
    
    if (currentIndex >= CAVE_LEVEL_ORDER.length - 1) {
      return { canUpgrade: false, reason: '已达最高等级' };
    }

    const nextLevel = CAVE_LEVEL_ORDER[currentIndex + 1];
    const requiredConstruction = CAVE_UPGRADE_COSTS[nextLevel];

    if (cave.建设度 < requiredConstruction) {
      return {
        canUpgrade: false,
        required: requiredConstruction,
        current: cave.建设度,
        reason: `建设度不足`
      };
    }

    return { canUpgrade: true, nextLevel };
  }

  // ===== 建筑系统 =====

  /**
   * 建造建筑
   */
  buildBuilding(buildingType, position = null) {
    if (!CAVE_BUILDINGS[buildingType]) {
      throw new Error(`未知建筑类型: ${buildingType}`);
    }

    const cave = this.gameState.caveHeaven;
    const buildingDef = CAVE_BUILDINGS[buildingType];

    // 检查资源
    if ((this.gameState.player?.spiritStones || 0) < buildingDef.cost) {
      return { success: false, message: '灵石不足' };
    }

    // 消耗灵石
    this.gameState.player.spiritStones = (this.gameState.player.spiritStones || 0) - buildingDef.cost;

    // 创建建筑
    const buildingId = `${buildingType}_${Date.now()}`;
    cave.建筑[buildingId] = {
      类型: buildingType,
      等级: 1,
      位置: position,
      建造时间: Date.now(),
      总产出: 0
    };

    return {
      success: true,
      message: `${buildingType}建造成功`,
      buildingId,
      剩余灵石: this.gameState.player.spiritStones
    };
  }

  /**
   * 升级建筑
   */
  upgradeBuilding(buildingId) {
    const cave = this.gameState.caveHeaven;
    const building = cave.建筑[buildingId];

    if (!building) {
      return { success: false, message: '建筑不存在' };
    }

    const buildingDef = CAVE_BUILDINGS[building.类型];
    const upgradeCost = buildingDef.cost * building.等级;

    if ((this.gameState.player?.spiritStones || 0) < upgradeCost) {
      return { success: false, message: '灵石不足' };
    }

    if (building.等级 >= 5) {
      return { success: false, message: '已达建筑最高等级' };
    }

    // 消耗灵石
    this.gameState.player.spiritStones = (this.gameState.player.spiritStones || 0) - upgradeCost;

    // 升级建筑
    building.等级 += 1;
    building.上次升级时间 = Date.now();

    return {
      success: true,
      message: `${building.类型}升级至${building.等级}级`,
      newLevel: building.等级,
      剩余灵石: this.gameState.player.spiritStones
    };
  }

  /**
   * 获取建筑列表
   */
  listBuildings() {
    const cave = this.gameState.caveHeaven;
    return Object.entries(cave.建筑).map(([id, b]) => ({
      id,
      类型: b.类型,
      等级: b.等级,
      位置: b.位置,
      产出量: CAVE_BUILDINGS[b.类型].产出量 * (BUILDING_LEVEL_MULTIPLIERS[b.等级] || 1)
    }));
  }

  /**
   * 计算总产出
   */
  calculateTotalOutput() {
    const buildings = this.listBuildings();
    const output = {};
    
    for (const b of buildings) {
      const def = CAVE_BUILDINGS[b.类型];
      if (!output[def.资源类型]) {
        output[def.资源类型] = 0;
      }
      output[def.资源类型] += b.产出量;
    }

    return output;
  }

  /**
   * 添加建设度
   */
  addConstruction(points) {
    const cave = this.gameState.caveHeaven;
    cave.建设度 += points;
    
    // 检查是否达到当前等级上限
    const levelInfo = CAVE_HEAVEN_LEVELS[cave.等级];
    if (cave.建设度 > levelInfo.建设度上限) {
      cave.建设度 = levelInfo.建设度上限;
    }

    return {
      success: true,
      建设度: cave.建设度,
      建设度上限: levelInfo.建设度上限
    };
  }

  // ===== 灵界洞府系统 (MCP工具) =====

  /**
   * 创建灵界洞府
   * @param {string} name - 洞府名称
   */
  createCaveHeaven(name) {
    const id = `cave_${++_caveIdCounter}_${Date.now()}`;
    const caveData = {
      id,
      name,
      level: '小洞天',
      constructionPoints: 0,
      spiritConcentration: 1.0,
      facilities: {},
      facilityHistory: [],
      createdAt: Date.now(),
      lastCollectedAt: Date.now()
    };
    
    _caveHeavenDatabase.set(id, caveData);
    
    return {
      success: true,
      message: `灵界洞府「${name}」创建成功`,
      id,
      name,
      level: '小洞天'
    };
  }

  /**
   * 升级洞府等级 (按ID)
   * @param {string} id - 洞府ID
   * @param {number} targetLevel - 目标等级
   */
  upgradeCaveHeavenById(id, targetLevel) {
    const cave = _caveHeavenDatabase.get(id);
    if (!cave) {
      return { success: false, message: '洞府不存在' };
    }

    const currentIndex = CAVE_LEVEL_ORDER.indexOf(cave.level);
    const levelNum = typeof targetLevel === 'string' 
      ? CAVE_LEVEL_ORDER.indexOf(targetLevel) + 1 
      : targetLevel;
    
    if (levelNum <= currentIndex) {
      return { success: false, message: '目标等级不能低于当前等级' };
    }

    // 检查建设度是否足够
    const nextLevelName = CAVE_LEVEL_ORDER[levelNum - 1];
    const upgradeCost = CAVE_UPGRADE_COSTS[nextLevelName] || 0;
    
    if (cave.constructionPoints < upgradeCost) {
      return {
        success: false,
        message: `建设度不足，需要${upgradeCost}点，当前${cave.constructionPoints}点`
      };
    }

    // 执行升级
    cave.level = nextLevelName;
    cave.spiritConcentration = CAVE_HEAVEN_LEVELS[nextLevelName].灵气加成;
    cave.constructionPoints -= upgradeCost;

    return {
      success: true,
      message: `洞府升级成功：${cave.level} → ${nextLevelName}`,
      newLevel: nextLevelName,
      spiritConcentration: cave.spiritConcentration,
      remainingConstructionPoints: cave.constructionPoints
    };
  }

  /**
   * 采集洞府产出
   * @param {string} id - 洞府ID
   */
  collectFromCave(id) {
    const cave = _caveHeavenDatabase.get(id);
    if (!cave) {
      return { success: false, message: '洞府不存在' };
    }

    const now = Date.now();
    const timePassed = (now - cave.lastCollectedAt) / 1000; // 秒
    const facilities = Object.values(cave.facilities);
    
    if (facilities.length === 0) {
      return { success: false, message: '洞府内没有设施，请先建造设施' };
    }

    // 计算产出
    const output = {};
    let totalOutputValue = 0;
    
    for (const facility of facilities) {
      const def = CAVE_FACILITIES[facility.type];
      if (def) {
        // 基础产出 * 等级加成 * 时间因子 (每分钟产出)
        const timeMultiplier = Math.max(1, Math.floor(timePassed / 60));
        const levelMultiplier = BUILDING_LEVEL_MULTIPLIERS[facility.level] || 1;
        const amount = Math.floor(def.output * levelMultiplier * timeMultiplier);
        
        if (!output[def.resourceType]) {
          output[def.resourceType] = 0;
        }
        output[def.resourceType] += amount;
        totalOutputValue += amount;
        
        // 更新设施总产出
        facility.totalOutput = (facility.totalOutput || 0) + amount;
      }
    }

    cave.lastCollectedAt = now;

    return {
      success: true,
      message: `采集成功，获得${totalOutputValue}点资源`,
      output,
      totalOutput: totalOutputValue,
      timePassed,
      facilitiesCount: facilities.length
    };
  }

  /**
   * 建造设施
   * @param {string} id - 洞府ID
   * @param {string} facilityType - 设施类型
   */
  buildFacility(id, facilityType) {
    const cave = _caveHeavenDatabase.get(id);
    if (!cave) {
      return { success: false, message: '洞府不存在' };
    }

    if (!CAVE_FACILITIES[facilityType]) {
      return { success: false, message: `未知设施类型: ${facilityType}` };
    }

    const def = CAVE_FACILITIES[facilityType];
    
    // 检查灵石是否足够
    if ((this.gameState.player?.spiritStones || 0) < def.cost) {
      return { success: false, message: '灵石不足' };
    }

    // 消耗灵石
    this.gameState.player.spiritStones -= def.cost;

    // 创建设施
    const facilityId = `facility_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    cave.facilities[facilityId] = {
      id: facilityId,
      type: facilityType,
      level: 1,
      builtAt: Date.now(),
      totalOutput: 0
    };

    // 添加建设度
    cave.constructionPoints += Math.floor(def.cost / 2);

    return {
      success: true,
      message: `${facilityType}建造成功`,
      facilityId,
      remainingSpiritStones: this.gameState.player.spiritStones,
      constructionPointsGained: Math.floor(def.cost / 2)
    };
  }

  /**
   * 查询洞府状态
   * @param {string} id - 洞府ID
   */
  queryCaveHeaven(id) {
    const cave = _caveHeavenDatabase.get(id);
    if (!cave) {
      return { success: false, message: '洞府不存在' };
    }

    const levelInfo = CAVE_HEAVEN_LEVELS[cave.level];
    const facilities = Object.values(cave.facilities).map(f => ({
      id: f.id,
      type: f.type,
      level: f.level,
      totalOutput: f.totalOutput,
      outputPerMinute: (CAVE_FACILITIES[f.type]?.output || 0) * (BUILDING_LEVEL_MULTIPLIERS[f.level] || 1)
    }));

    // 计算距下次采集的时间
    const now = Date.now();
    const timeSinceLastCollect = Math.floor((now - cave.lastCollectedAt) / 1000);

    return {
      success: true,
      id: cave.id,
      name: cave.name,
      level: cave.level,
      levelInfo: {
        constructionLimit: levelInfo.建设度上限,
        spiritBonus: levelInfo.灵气加成
      },
      constructionPoints: cave.constructionPoints,
      spiritConcentration: cave.spiritConcentration,
      facilities,
      totalFacilities: facilities.length,
      createdAt: cave.createdAt,
      lastCollectedAt: cave.lastCollectedAt,
      timeSinceLastCollect
    };
  }

  /**
   * 获取玩家所有洞府列表
   */
  listAllCaves() {
    return Array.from(_caveHeavenDatabase.values()).map(cave => ({
      id: cave.id,
      name: cave.name,
      level: cave.level,
      facilitiesCount: Object.keys(cave.facilities).length,
      constructionPoints: cave.constructionPoints
    }));
  }

  /**
   * 升级设施
   * @param {string} caveId - 洞府ID
   * @param {string} facilityId - 设施ID
   */
  upgradeFacility(caveId, facilityId) {
    const cave = _caveHeavenDatabase.get(caveId);
    if (!cave) {
      return { success: false, message: '洞府不存在' };
    }

    const facility = cave.facilities[facilityId];
    if (!facility) {
      return { success: false, message: '设施不存在' };
    }

    if (facility.level >= 5) {
      return { success: false, message: '设施已达最高等级' };
    }

    const def = CAVE_FACILITIES[facility.type];
    const upgradeCost = def.cost * facility.level;

    if ((this.gameState.player?.spiritStones || 0) < upgradeCost) {
      return { success: false, message: '灵石不足' };
    }

    this.gameState.player.spiritStones -= upgradeCost;
    facility.level += 1;
    facility.upgradedAt = Date.now();

    return {
      success: true,
      message: `${facility.type}升级至${facility.level}级`,
      facilityId,
      newLevel: facility.level,
      remainingSpiritStones: this.gameState.player.spiritStones
    };
  }

  /**
   * 销毁设施
   * @param {string} caveId - 洞府ID
   * @param {string} facilityId - 设施ID
   */
  demolishFacility(caveId, facilityId) {
    const cave = _caveHeavenDatabase.get(caveId);
    if (!cave) {
      return { success: false, message: '洞府不存在' };
    }

    if (!cave.facilities[facilityId]) {
      return { success: false, message: '设施不存在' };
    }

    const facility = cave.facilities[facilityId];
    delete cave.facilities[facilityId];

    return {
      success: true,
      message: `${facility.type}已拆除`,
      demolitionRefund: Math.floor(CAVE_FACILITIES[facility.type].cost * 0.3)
    };
  }
}

// ===== MCP工具 =====

/**
 * 获取洞天信息MCP工具
 */
export function getCaveHeavenInfo(gameState) {
  const service = createCaveHeavenService(gameState);
  return service.getCaveInfo();
}

/**
 * 升级洞天MCP工具
 */
export function upgradeCaveHeaven(gameState) {
  const service = createCaveHeavenService(gameState);
  return service.upgradeCaveHeaven();
}

/**
 * 建造建筑MCP工具
 */
export function buildCaveBuilding(gameState, buildingType, position = null) {
  const service = createCaveHeavenService(gameState);
  return service.buildBuilding(buildingType, position);
}

/**
 * 升级建筑MCP工具
 */
export function upgradeCaveBuilding(gameState, buildingId) {
  const service = createCaveHeavenService(gameState);
  return service.upgradeBuilding(buildingId);
}

/**
 * 获取建筑列表MCP工具
 */
export function listCaveBuildings(gameState) {
  const service = createCaveHeavenService(gameState);
  return service.listBuildings();
}

/**
 * 获取洞天产出MCP工具
 */
export function getCaveOutput(gameState) {
  const service = createCaveHeavenService(gameState);
  return service.calculateTotalOutput();
}

/**
 * 添加建设度MCP工具
 */
export function addCaveConstruction(gameState, points) {
  const service = createCaveHeavenService(gameState);
  return service.addConstruction(points);
}

// ===== 导出MCP工具定义 =====

export const CAVE_HEAVEN_TOOLS = [
  { name: 'cave.info', description: '获取洞天信息', params: [] },
  { name: 'cave.upgrade', description: '升级洞天等级', params: [] },
  { name: 'cave.build', description: '建造建筑', params: ['buildingType', 'position?'] },
  { name: 'cave.upgrade_building', description: '升级建筑', params: ['buildingId'] },
  { name: 'cave.list_buildings', description: '获取建筑列表', params: [] },
  { name: 'cave.output', description: '获取洞天产出', params: [] },
  { name: 'cave.add_construction', description: '添加建设度', params: ['points'] }
];

// ===== 灵界洞府 MCP工具 =====

/**
 * 创建灵界洞府 MCP工具
 * @param {string} name - 洞府名称
 */
export function createCaveHeaven(gameState, name) {
  const service = createCaveHeavenService(gameState);
  return service.createCaveHeaven(name);
}

/**
 * 升级洞府等级 MCP工具
 * @param {string} id - 洞府ID
 * @param {number} targetLevel - 目标等级
 */
export function upgradeCaveHeavenById(gameState, id, targetLevel) {
  const service = createCaveHeavenService(gameState);
  return service.upgradeCaveHeavenById(id, targetLevel);
}

/**
 * 采集洞府产出 MCP工具
 * @param {string} id - 洞府ID
 */
export function collectFromCave(gameState, id) {
  const service = createCaveHeavenService(gameState);
  return service.collectFromCave(id);
}

/**
 * 建造设施 MCP工具
 * @param {string} id - 洞府ID
 * @param {string} facility - 设施类型
 */
export function buildCaveFacility(gameState, id, facility) {
  const service = createCaveHeavenService(gameState);
  return service.buildFacility(id, facility);
}

/**
 * 查询洞府状态 MCP工具
 * @param {string} id - 洞府ID
 */
export function queryCaveHeaven(gameState, id) {
  const service = createCaveHeavenService(gameState);
  return service.queryCaveHeaven(id);
}

/**
 * 获取所有洞府列表 MCP工具
 */
export function listCaveHeavens(gameState) {
  const service = createCaveHeavenService(gameState);
  return service.listAllCaves();
}

/**
 * 升级设施 MCP工具
 * @param {string} caveId - 洞府ID
 * @param {string} facilityId - 设施ID
 */
export function upgradeCaveFacility(gameState, caveId, facilityId) {
  const service = createCaveHeavenService(gameState);
  return service.upgradeFacility(caveId, facilityId);
}

/**
 * 销毁设施 MCP工具
 * @param {string} caveId - 洞府ID
 * @param {string} facilityId - 设施ID
 */
export function demolishCaveFacility(gameState, caveId, facilityId) {
  const service = createCaveHeavenService(gameState);
  return service.demolishFacility(caveId, facilityId);
}

// ===== 导出灵界洞府工具定义 =====

export const CAVE_HEAVEN_MCP_TOOLS = [
  { name: 'caveheaven.create', description: '创建灵界洞府', params: ['name'] },
  { name: 'caveheaven.upgrade', description: '升级洞府等级', params: ['id', 'targetLevel'] },
  { name: 'caveheaven.collect', description: '采集洞府产出', params: ['id'] },
  { name: 'caveheaven.build', description: '建造设施', params: ['id', 'facility'] },
  { name: 'caveheaven.query', description: '查询洞府状态', params: ['id'] }
];