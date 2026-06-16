/**
 * AlchemyService.js - 仙药炼制+丹药系统
 * V256: 仙药炼制+丹药系统
 * 
 * 功能：
 * 1. 丹药配方管理
 * 2. 药材采集与合成
 * 3. 炼制过程模拟
 * 4. 丹药品质判定
 */

export const PILL_TIERS = { 下品: 1, 中品: 2, 上品: 3, 极品: 4, 神品: 5 };
export const HERB_TYPES = ['灵草', '矿石', '兽骨', '精华', '特殊'];
export const FURNACE_TIERS = { 凡炉: 1, 灵炉: 2, 仙炉: 3, 神炉: 4 };

let _instance = null;

export function createAlchemyService(gameState) {
  if (_instance) return _instance;
  _instance = new AlchemyService(gameState);
  return _instance;
}

class AlchemyService {
  constructor(gameState) {
    this.gameState = gameState;
    this._ensure();
  }

  _ensure() {
    if (!this.gameState.alchemy) {
      this.gameState.alchemy = {
        recipes: this._defaultRecipes(),
        inventory: {},
        craftedPills: [],
        furnaceLevel: 1,
        totalCrafted: 0
      };
    }
  }

  _defaultRecipes() {
    return {
      '筑基丹': { ingredients: { '灵草': 5, '精华': 2 }, tier: '下品', effect: '增加修炼速度', baseSuccess: 0.8 },
      '结金丹': { ingredients: { '灵草': 10, '矿石': 5, '精华': 5 }, tier: '中品', effect: '突破境界', baseSuccess: 0.6 },
      '化神丹': { ingredients: { '灵草': 15, '矿石': 10, '兽骨': 8 }, tier: '上品', effect: '加速化神', baseSuccess: 0.4 },
      '渡劫丹': { ingredients: { '灵草': 20, '矿石': 15, '精华': 10, '特殊': 3 }, tier: '极品', effect: '增加渡劫成功率', baseSuccess: 0.25 },
      '大还丹': { ingredients: { '灵草': 30, '矿石': 20, '兽骨': 15, '精华': 20 }, tier: '神品', effect: '大幅提升修为', baseSuccess: 0.1 }
    };
  }

  // ===== 药材管理 =====

  /**
   * 添加药材到背包
   */
  addHerb(herbType, herbName, quantity = 1) {
    if (!HERB_TYPES.includes(herbType)) return { success: false, message: '无效药材类型' };
    if (!this.gameState.alchemy.inventory[herbType]) {
      this.gameState.alchemy.inventory[herbType] = {};
    }
    this.gameState.alchemy.inventory[herbType][herbName] = (this.gameState.alchemy.inventory[herbType][herbName] || 0) + quantity;
    return {
      success: true,
      message: `获得${herbName} x${quantity}`,
      inventory: this.gameState.alchemy.inventory[herbType][herbName]
    };
  }

  /**
   * 消耗药材
   */
  _consumeIngredients(ingredients) {
    for (const [type, name, qty] of ingredients) {
      if ((this.gameState.alchemy.inventory[type]?.[name] || 0) < qty) {
        return false;
      }
    }
    for (const [type, name, qty] of ingredients) {
      this.gameState.alchemy.inventory[type][name] -= qty;
    }
    return true;
  }

  // ===== 丹药炼制 =====

  /**
   * 炼制丹药
   */
  craftPill(pillName, herbSelections = {}) {
    const recipe = this.gameState.alchemy.recipes[pillName];
    if (!recipe) return { success: false, message: '未知丹药配方' };

    // 准备材料列表
    const ingredientList = Object.entries(recipe.ingredients).map(([type, baseQty]) => {
      const selected = herbSelections[type] || {};
      const herbName = Object.keys(selected)[0] || `${type}材`;
      return [type, herbName, baseQty];
    });

    if (!this._consumeIngredients(ingredientList)) {
      return { success: false, message: '药材不足' };
    }

    // 计算成功率和品质
    const player = this.gameState.player;
    const alchemySkill = (player.alchemySkill || 0) * 0.02;
    const furnaceBonus = (this.gameState.alchemy.furnaceLevel - 1) * 0.05;
    const successRate = Math.min(0.95, recipe.baseSuccess + alchemySkill + furnaceBonus);

    const roll = Math.random();
    if (roll > successRate) {
      return { success: false, message: `炼制「${pillName}」失败，药材浪费`, pillName };
    }

    // 品质判定
    const qualityRoll = Math.random();
    let tier;
    if (qualityRoll < 0.05) tier = '神品';
    else if (qualityRoll < 0.15) tier = '极品';
    else if (qualityRoll < 0.35) tier = '上品';
    else if (qualityRoll < 0.60) tier = '中品';
    else tier = '下品';

    const qualityMultiplier = PILL_TIERS[tier] / PILL_TIERS[recipe.tier];
    const pillId = `pill_${Date.now()}`;

    this.gameState.alchemy.craftedPills.push({
      id: pillId,
      name: pillName,
      tier,
      quality: tier,
      effect: recipe.effect,
      power: Math.floor(recipe.tier * 10 * qualityMultiplier),
      craftedAt: Date.now()
    });
    this.gameState.alchemy.totalCrafted++;

    return {
      success: true,
      message: `炼制成功！获得${tier}「${pillName}」`,
      pillId,
      tier,
      power: this.gameState.alchemy.craftedPills.at(-1).power
    };
  }

  /**
   * 使用丹药
   */
  usePill(pillId) {
    const pill = this.gameState.alchemy.craftedPills.find(p => p.id === pillId);
    if (!pill) return { success: false, message: '丹药不存在' };

    const player = this.gameState.player;
    const idx = this.gameState.alchemy.craftedPills.findIndex(p => p.id === pillId);
    this.gameState.alchemy.craftedPills.splice(idx, 1);

    switch (pill.name) {
      case '筑基丹': player.cultivationSpeed = (player.cultivationSpeed || 1) + 0.1; break;
      case '结金丹': player.realmProgress = (player.realmProgress || 0) + 1000; break;
      case '化神丹': player.spiritPower = (player.spiritPower || 0) + 500; break;
      case '渡劫丹': player.tribulationBonus = (player.tribulationBonus || 0) + 0.2; break;
      case '大还丹': player.exp = (player.exp || 0) + 50000; break;
      default: player.exp = (player.exp || 0) + pill.power * 10;
    }

    return {
      success: true,
      message: `使用${pill.tier}「${pill.name}」，效果：${pill.effect}`
    };
  }

  // ===== 炉鼎升级 =====

  /**
   * 升级炉鼎
   */
  upgradeFurnace() {
    if (this.gameState.alchemy.furnaceLevel >= 4) {
      return { success: false, message: '已达最高炉鼎等级' };
    }
    const costs = { 2: 5000, 3: 20000, 4: 80000 };
    const cost = costs[this.gameState.alchemy.furnaceLevel + 1];
    const player = this.gameState.player;
    if ((player.spiritStones || 0) < cost) {
      return { success: false, message: '灵石不足' };
    }
    player.spiritStones -= cost;
    this.gameState.alchemy.furnaceLevel++;
    return {
      success: true,
      message: `炉鼎升级至${Object.keys(FURNACE_TIERS)[this.gameState.alchemy.furnaceLevel - 1]}`,
      newLevel: this.gameState.alchemy.furnaceLevel
    };
  }

  // ===== 查询接口 =====

  /**
   * 获取配方列表
   */
  listRecipes() {
    return {
      success: true,
      recipes: Object.entries(this.gameState.alchemy.recipes).map(([name, data]) => ({
        name, tier: data.tier, effect: data.effect, ingredients: data.ingredients, baseSuccess: data.baseSuccess
      }))
    };
  }

  /**
   * 获取背包药材
   */
  getInventory() {
    return { success: true, inventory: this.gameState.alchemy.inventory };
  }

  /**
   * 获取炼制的丹药
   */
  listPills() {
    return {
      success: true,
      pills: this.gameState.alchemy.craftedPills,
      total: this.gameState.alchemy.totalCrafted
    };
  }

  /**
   * 获取炉鼎等级
   */
  getFurnaceInfo() {
    const levels = Object.keys(FURNACE_TIERS);
    return {
      success: true,
      level: this.gameState.alchemy.furnaceLevel,
      name: levels[this.gameState.alchemy.furnaceLevel - 1],
      totalCrafted: this.gameState.alchemy.totalCrafted
    };
  }
}

export const ALCHEMY_TOOLS = [
  { name: 'alchemy.addHerb', description: '添加药材', params: ['herbType', 'herbName', 'quantity'] },
  { name: 'alchemy.craft', description: '炼制丹药', params: ['pillName', 'herbSelections'] },
  { name: 'alchemy.use', description: '使用丹药', params: ['pillId'] },
  { name: 'alchemy.upgradeFurnace', description: '升级炉鼎', params: [] },
  { name: 'alchemy.recipes', description: '配方列表', params: [] },
  { name: 'alchemy.inventory', description: '药材背包', params: [] },
  { name: 'alchemy.pills', description: '丹药列表', params: [] },
  { name: 'alchemy.furnace', description: '炉鼎信息', params: [] }
];