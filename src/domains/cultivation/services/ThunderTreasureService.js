/**
 * ThunderTreasureService.js - 天雷异宝+法宝进阶系统
 * V251: 天雷异宝+法宝进阶
 * 
 * 功能：
 * 1. 天雷异宝发现与收集
 * 2. 雷劫能量吸收强化
 * 3. 法宝炼制与升级
 * 4. 异宝觉醒与进阶
 */

// ===== 常量定义 =====

/**
 * 异宝类型定义
 */
export const TREASURE_TYPES = {
  '天雷珠': { rarity: '传说', basePower: 100, absorbRate: 0.2, awakenBonus: 1.5 },
  '雷罚印': { rarity: '史诗', basePower: 80, absorbRate: 0.15, awakenBonus: 1.4 },
  '紫电刀': { rarity: '稀有', basePower: 60, absorbRate: 0.12, awakenBonus: 1.3 },
  '雷芒剑': { rarity: '稀有', basePower: 55, absorbRate: 0.1, awakenBonus: 1.3 },
  '九天雷鞭': { rarity: '传说', basePower: 120, absorbRate: 0.25, awakenBonus: 1.6 }
};

/**
 * 法宝等阶定义
 */
export const ARTIFACT_TIERS = {
  '凡品': { power: 10, upgradeCost: 0, requiredLevel: 1 },
  '灵品': { power: 30, upgradeCost: 500, requiredLevel: 10 },
  '仙品': { power: 80, upgradeCost: 2000, requiredLevel: 30 },
  '神品': { power: 200, upgradeCost: 8000, requiredLevel: 50 },
  '先天至宝': { power: 500, upgradeCost: 30000, requiredLevel: 80 }
};

/**
 * 异宝觉醒等级
 */
export const AWAKEN_LEVELS = [0, 1, 2, 3, 4, 5];

/**
 * 雷劫能量转化率
 */
const THUNDER_CONVERT_RATE = 0.1;

/**
 * 法宝炼制基础消耗
 */
const FORGE_BASE_COST = 1000;

// ===== 服务类 =====

let _treasureInstance = null;
let _artifactInstance = null;

export function createThunderTreasureService(gameState) {
  if (_treasureInstance) return _treasureInstance;
  _treasureInstance = new ThunderTreasureService(gameState);
  return _treasureInstance;
}

export function createArtifactService(gameState) {
  if (_artifactInstance) return _artifactInstance;
  _artifactInstance = new ArtifactService(gameState);
  return _artifactInstance;
}

class ThunderTreasureService {
  constructor(gameState) {
    this.gameState = gameState;
    this._ensureTreasureData();
  }

  _ensureTreasureData() {
    if (!this.gameState.treasures) {
      this.gameState.treasures = { discovered: [], bound: {}, thunderEnergy: 0 };
    }
    if (!this.gameState.treasures.discovered) this.gameState.treasures.discovered = [];
    if (!this.gameState.treasures.bound) this.gameState.treasures.bound = {};
    if (this.gameState.treasures.thunderEnergy === undefined) {
      this.gameState.treasures.thunderEnergy = 0;
    }
  }

  /**
   * 发现天雷异宝
   */
  discoverTreasure() {
    const player = this.gameState.player;
    if (!player) return { success: false, message: '玩家数据不存在' };

    const treasureKeys = Object.keys(TREASURE_TYPES);
    const roll = Math.random();
    let rarity;
    if (roll < 0.05) rarity = '传说';
    else if (roll < 0.15) rarity = '史诗';
    else rarity = '稀有';

    const candidates = treasureKeys.filter(k => TREASURE_TYPES[k].rarity === rarity);
    if (candidates.length === 0) {
      return { success: false, message: '发现失败' };
    }

    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    const treasureData = TREASURE_TYPES[selected];

    if (this.gameState.treasures.discovered.includes(selected)) {
      return {
        success: true,
        message: `发现已拥有的异宝「${selected}」碎片 x5`,
        type: 'fragment',
        fragmentCount: 5,
        treasure: selected,
        rarity
      };
    }

    this.gameState.treasures.discovered.push(selected);
    this.gameState.treasures.bound[selected] = {
      type: selected,
      awakenLevel: 0,
      thunderAbsorbed: 0,
      power: treasureData.basePower
    };

    return {
      success: true,
      message: `发现全新异宝「${selected}」！`,
      treasure: selected,
      rarity,
      power: treasureData.basePower
    };
  }

  /**
   * 吸收雷劫能量
   */
  absorbThunder(treasureName, amount) {
    if (!this.gameState.treasures.bound[treasureName]) {
      return { success: false, message: '异宝未绑定' };
    }

    const treasureData = TREASURE_TYPES[treasureName];
    if (!treasureData) {
      return { success: false, message: '未知异宝' };
    }

    if (amount <= 0) {
      return { success: false, message: '能量必须为正数' };
    }

    const absorbAmount = Math.floor(amount * treasureData.absorbRate);
    this.gameState.treasures.thunderEnergy += absorbAmount;
    this.gameState.treasures.bound[treasureName].thunderAbsorbed += absorbAmount;

    return {
      success: true,
      message: `吸收雷劫能量 ${absorbAmount}`,
      absorbAmount,
      totalEnergy: this.gameState.treasures.thunderEnergy
    };
  }

  /**
   * 异宝进阶
   */
  enhanceTreasure(treasureName) {
    const bound = this.gameState.treasures.bound[treasureName];
    if (!bound) {
      return { success: false, message: '异宝未绑定' };
    }

    const player = this.gameState.player;
    const currentPower = bound.power;
    const treasureData = TREASURE_TYPES[treasureName];
    const requiredEnergy = Math.floor(treasureData.basePower * 0.5);

    if (this.gameState.treasures.thunderEnergy < requiredEnergy) {
      return { success: false, message: '雷劫能量不足' };
    }

    this.gameState.treasures.thunderEnergy -= requiredEnergy;
    const newPower = Math.floor(currentPower * 1.3);

    return {
      success: true,
      message: `异宝「${treasureName}」进阶成功！`,
      powerIncrease: newPower - currentPower,
      newPower
    };
  }

  /**
   * 异宝觉醒
   */
  awakenTreasure(treasureName) {
    const bound = this.gameState.treasures.bound[treasureName];
    if (!bound) {
      return { success: false, message: '异宝未绑定' };
    }

    if (bound.awakenLevel >= 5) {
      return { success: false, message: '已达最高觉醒等级' };
    }

    const treasureData = TREASURE_TYPES[treasureName];
    const requiredEnergy = Math.floor(treasureData.basePower * 2 * Math.pow(2, bound.awakenLevel));

    if (this.gameState.treasures.thunderEnergy < requiredEnergy) {
      return { success: false, message: '雷劫能量不足' };
    }

    this.gameState.treasures.thunderEnergy -= requiredEnergy;
    bound.awakenLevel += 1;
    bound.power = Math.floor(bound.power * treasureData.awakenBonus);

    return {
      success: true,
      message: `异宝「${treasureName}」觉醒等级提升至 ${bound.awakenLevel}`,
      newAwakenLevel: bound.awakenLevel,
      newPower: bound.power
    };
  }

  /**
   * 获取异宝属性
   */
  getTreasureStats(treasureName) {
    if (!this.gameState.treasures.bound[treasureName]) {
      return { success: false, message: '异宝未绑定' };
    }

    const bound = this.gameState.treasures.bound[treasureName];
    const baseData = TREASURE_TYPES[treasureName];

    return {
      success: true,
      treasure: treasureName,
      rarity: baseData.rarity,
      awakenLevel: bound.awakenLevel,
      power: bound.power,
      thunderAbsorbed: bound.thunderAbsorbed,
      basePower: baseData.basePower
    };
  }

  /**
   * 列出所有异宝
   */
  listTreasures() {
    return {
      success: true,
      discovered: this.gameState.treasures.discovered,
      bound: Object.keys(this.gameState.treasures.bound),
      thunderEnergy: this.gameState.treasures.thunderEnergy
    };
  }
}

class ArtifactService {
  constructor(gameState) {
    this.gameState = gameState;
    this._ensureArtifactData();
  }

  _ensureArtifactData() {
    if (!this.gameState.artifacts) {
      this.gameState.artifacts = { forged: [], bound: {} };
    }
    if (!this.gameState.artifacts.forged) this.gameState.artifacts.forged = [];
    if (!this.gameState.artifacts.bound) this.gameState.artifacts.bound = {};
  }

  /**
   * 炼制法宝
   */
  forgeArtifact(artifactType) {
    const player = this.gameState.player;
    if (!player) return { success: false, message: '玩家数据不存在' };

    if ((player.spiritStones || 0) < FORGE_BASE_COST) {
      return { success: false, message: '灵石不足' };
    }

    const tier = '凡品';
    player.spiritStones -= FORGE_BASE_COST;

    const artifactId = `artifact_${Date.now()}`;
    const artifact = {
      id: artifactId,
      type: artifactType,
      tier,
      level: 1,
      spirit: 0,
      bound: false,
      power: ARTIFACT_TIERS[tier].power,
      forgedAt: Date.now()
    };

    this.gameState.artifacts.forged.push(artifactId);
    this.gameState.artifacts.bound[artifactId] = artifact;

    return {
      success: true,
      message: `炼制「${artifactType}」成功！`,
      artifactId,
      tier,
      power: artifact.power
    };
  }

  /**
   * 法宝升级
   */
  upgradeArtifact(artifactId) {
    const artifact = this.gameState.artifacts.bound[artifactId];
    if (!artifact) {
      return { success: false, message: '法宝不存在' };
    }

    const tiers = Object.keys(ARTIFACT_TIERS);
    const currentTierIndex = tiers.indexOf(artifact.tier);

    if (currentTierIndex >= tiers.length - 1) {
      return { success: false, message: '已达最高等阶' };
    }

    const nextTier = tiers[currentTierIndex + 1];
    const upgradeCost = ARTIFACT_TIERS[nextTier].upgradeCost;
    const player = this.gameState.player;

    if ((player.spiritStones || 0) < upgradeCost) {
      return { success: false, message: '灵石不足' };
    }

    if (player.level < ARTIFACT_TIERS[nextTier].requiredLevel) {
      return { success: false, message: '境界不足' };
    }

    player.spiritStones -= upgradeCost;
    artifact.tier = nextTier;
    artifact.power = ARTIFACT_TIERS[nextTier].power;
    artifact.level = 1;

    return {
      success: true,
      message: `法宝升级为「${nextTier}」！`,
      newTier: nextTier,
      newPower: artifact.power
    };
  }

  /**
   * 注入灵气
   */
  infuseSpirit(artifactId, amount) {
    const artifact = this.gameState.artifacts.bound[artifactId];
    if (!artifact) {
      return { success: false, message: '法宝不存在' };
    }

    if (amount <= 0) {
      return { success: false, message: '灵气必须为正数' };
    }

    const player = this.gameState.player;
    if ((player.spirit || 0) < amount) {
      return { success: false, message: '灵气不足' };
    }

    player.spirit -= amount;
    artifact.spirit += amount;
    artifact.power += Math.floor(amount * 0.1);

    return {
      success: true,
      message: `注入灵气 ${amount}`,
      newSpirit: artifact.spirit,
      newPower: artifact.power
    };
  }

  /**
   * 绑定法宝
   */
  bindArtifact(artifactId) {
    const artifact = this.gameState.artifacts.bound[artifactId];
    if (!artifact) {
      return { success: false, message: '法宝不存在' };
    }

    if (artifact.bound) {
      return { success: false, message: '法宝已绑定' };
    }

    artifact.bound = true;
    return {
      success: true,
      message: `法宝「${artifact.type}」绑定成功`,
      power: artifact.power
    };
  }

  /**
   * 法宝共鸣
   */
  artifactResonance() {
    const boundArtifacts = Object.values(this.gameState.artifacts.bound).filter(a => a.bound);
    if (boundArtifacts.length < 2) {
      return { success: false, message: '需要至少2件绑定法宝' };
    }

    const totalPower = boundArtifacts.reduce((sum, a) => sum + a.power, 0);
    const resonanceBonus = Math.floor(totalPower * 0.1);

    return {
      success: true,
      message: `共鸣加成 +${resonanceBonus} 战力`,
      resonanceBonus,
      participatingArtifacts: boundArtifacts.length
    };
  }

  /**
   * 获取法宝列表
   */
  listArtifacts() {
    return {
      success: true,
      artifacts: Object.values(this.gameState.artifacts.bound).map(a => ({
        id: a.id,
        type: a.type,
        tier: a.tier,
        level: a.level,
        power: a.power,
        bound: a.bound
      }))
    };
  }
}

// ===== MCP工具导出 =====

export const THUNDER_TREASURE_TOOLS = [
  { name: 'treasure.discover', description: '发现天雷异宝', params: [] },
  { name: 'treasure.absorb', description: '吸收雷劫能量', params: ['treasureName', 'amount'] },
  { name: 'treasure.enhance', description: '异宝进阶', params: ['treasureName'] },
  { name: 'treasure.awaken', description: '异宝觉醒', params: ['treasureName'] },
  { name: 'treasure.stats', description: '获取异宝属性', params: ['treasureName'] },
  { name: 'treasure.list', description: '列出异宝', params: [] }
];

export const ARTIFACT_TOOLS = [
  { name: 'artifact.forge', description: '炼制法宝', params: ['artifactType'] },
  { name: 'artifact.upgrade', description: '法宝升级', params: ['artifactId'] },
  { name: 'artifact.infuse', description: '注入灵气', params: ['artifactId', 'amount'] },
  { name: 'artifact.bind', description: '绑定法宝', params: ['artifactId'] },
  { name: 'artifact.resonance', description: '法宝共鸣', params: [] },
  { name: 'artifact.list', description: '列出法宝', params: [] }
];