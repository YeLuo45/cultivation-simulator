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
 * 洞天升级所需建设度
 */
const CAVE_UPGRADE_COSTS = {
  '小洞天': 0,
  '中洞天': 100,
  '大洞天': 500,
  '洞天福地': 2000,
  '天府': 10000
};

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