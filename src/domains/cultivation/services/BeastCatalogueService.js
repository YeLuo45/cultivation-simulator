/**
 * BeastCatalogueService.js - 仙宠图鉴+收集系统
 * V255: 仙宠图鉴+收集系统
 * 
 * 功能：
 * 1. 仙宠图鉴 - 收录所有仙宠种类
 * 2. 收集进度 - 追踪已捕获/已孵化仙宠
 * 3. 图鉴解锁奖励 - 完成收集目标获得奖励
 * 4. 稀有度系统 - 普通/稀有/传说/神话
 */

export const BEAST_RARITIES = { 普通: 1, 稀有: 2, 传说: 3, 神话: 4 };
export const ELEMENT_TYPES = ['金', '木', '水', '火', '土', '雷', '风', '冰', '暗', '光'];
export const BEAST_CATEGORIES = ['走兽', '飞禽', '游鱼', '虫蛊', '神兽', '凶兽'];

let _instance = null;

export function createBeastCatalogueService(gameState) {
  if (_instance) return _instance;
  _instance = new BeastCatalogueService(gameState);
  return _instance;
}

class BeastCatalogueService {
  constructor(gameState) {
    this.gameState = gameState;
    this._ensure();
  }

  _ensure() {
    if (!this.gameState.beastCatalogue) {
      this.gameState.beastCatalogue = {
        discovered: [],
        owned: {},
        unlockedElements: [],
        categoryProgress: {},
        totalDiscovered: 0,
        totalOwned: 0
      };
    }
    this._initCategories();
  }

  _initCategories() {
    for (const cat of BEAST_CATEGORIES) {
      if (!this.gameState.beastCatalogue.categoryProgress[cat]) {
        this.gameState.beastCatalogue.categoryProgress[cat] = { discovered: 0, total: 0, unlocked: false };
      }
    }
  }

  // ===== 图鉴发现 =====

  /**
   * 记录发现新仙宠
   */
  discoverBeast(beastId, name, rarity, element, category) {
    if (!BEAST_RARITIES[rarity]) return { success: false, message: '无效稀有度' };
    if (!ELEMENT_TYPES.includes(element)) return { success: false, message: '无效元素' };
    if (!BEAST_CATEGORIES.includes(category)) return { success: false, message: '无效分类' };

    const catalogue = this.gameState.beastCatalogue;
    const alreadyDiscovered = catalogue.discovered.includes(beastId);
    const alreadyOwned = catalogue.owned[beastId];

    if (!alreadyDiscovered) {
      catalogue.discovered.push(beastId);
      catalogue.totalDiscovered++;
      catalogue.categoryProgress[category].discovered++;
      catalogue.categoryProgress[category].total++;
    }

    if (!alreadyOwned) {
      catalogue.owned[beastId] = {
        id: beastId,
        name,
        rarity,
        element,
        category,
        obtainedAt: Date.now(),
        level: 1,
        stars: 1
      };
      catalogue.totalOwned++;
    }

    return {
      success: true,
      newlyDiscovered: !alreadyDiscovered,
      newlyObtained: !alreadyOwned,
      message: alreadyOwned ? `已拥有「${name}」` : `获得「${name}」！`
    };
  }

  // ===== 图鉴查询 =====

  /**
   * 获取图鉴概览
   */
  getCatalogueOverview() {
    const c = this.gameState.beastCatalogue;
    return {
      success: true,
      totalDiscovered: c.totalDiscovered,
      totalOwned: c.totalOwned,
      completionPercent: c.totalDiscovered > 0 ? Math.floor((c.totalDiscovered / c.totalDiscovered) * 100) : 0,
      categories: c.categoryProgress,
      ownedElements: c.unlockedElements
    };
  }

  /**
   * 获取仙宠详情
   */
  getBeastDetails(beastId) {
    const owned = this.gameState.beastCatalogue.owned[beastId];
    if (!owned) return { success: false, message: '未拥有该仙宠' };
    return { success: true, ...owned };
  }

  /**
   * 按元素查询
   */
  getBeastsByElement(element) {
    if (!ELEMENT_TYPES.includes(element)) return { success: false, message: '无效元素' };
    const owned = Object.values(this.gameState.beastCatalogue.owned);
    const filtered = owned.filter(b => b.element === element);
    return {
      success: true,
      element,
      count: filtered.length,
      beasts: filtered
    };
  }

  /**
   * 按稀有度查询
   */
  getBeastsByRarity(rarity) {
    if (!BEAST_RARITIES[rarity]) return { success: false, message: '无效稀有度' };
    const owned = Object.values(this.gameState.beastCatalogue.owned);
    const filtered = owned.filter(b => b.rarity === rarity);
    return {
      success: true,
      rarity,
      count: filtered.length,
      beasts: filtered
    };
  }

  /**
   * 按分类查询
   */
  getBeastsByCategory(category) {
    if (!BEAST_CATEGORIES.includes(category)) return { success: false, message: '无效分类' };
    const owned = Object.values(this.gameState.beastCatalogue.owned);
    const filtered = owned.filter(b => b.category === category);
    return {
      success: true,
      category,
      count: filtered.length,
      beasts: filtered,
      progress: this.gameState.beastCatalogue.categoryProgress[category]
    };
  }

  // ===== 收集奖励 =====

  /**
   * 解锁元素奖励
   */
  unlockElementReward(element) {
    if (!ELEMENT_TYPES.includes(element)) return { success: false, message: '无效元素' };
    const catalogue = this.gameState.beastCatalogue;
    if (catalogue.unlockedElements.includes(element)) {
      return { success: false, message: '元素已解锁' };
    }

    const owned = Object.values(catalogue.owned);
    const elementBeasts = owned.filter(b => b.element === element);
    if (elementBeasts.length < 5) {
      return { success: false, message: `需要至少5种${element}元素仙宠，当前${elementBeasts.length}种` };
    }

    catalogue.unlockedElements.push(element);
    const player = this.gameState.player;
    player.spiritStones = (player.spiritStones || 0) + 500;

    return {
      success: true,
      message: `解锁${element}元素奖励：+500灵石`,
      newElement: element
    };
  }

  /**
   * 收集里程碑奖励
   */
  claimCollectionMilestone(milestoneId) {
    const milestones = {
      'first_beast': { require: 1, reward: { exp: 100, spiritStones: 50 }, claimed: false },
      'five_beasts': { require: 5, reward: { exp: 500, spiritStones: 200 }, claimed: false },
      'ten_beasts': { require: 10, reward: { exp: 1000, spiritStones: 500 }, claimed: false },
      'twenty_beasts': { require: 20, reward: { exp: 3000, spiritStones: 1000 }, claimed: false },
      'all_elements': { require: 10, reward: { exp: 10000, spiritStones: 5000 }, claimed: false, requires: 'all_elements' }
    };

    const milestone = milestones[milestoneId];
    if (!milestone) return { success: false, message: '未知里程碑' };
    if (milestone.claimed) return { success: false, message: '已领取' };

    const owned = this.gameState.beastCatalogue.totalOwned;
    if (milestone.requires === 'all_elements') {
      if (this.gameState.beastCatalogue.unlockedElements.length < 10) {
        return { success: false, message: '需解锁全部10种元素' };
      }
    } else if (owned < milestone.require) {
      return { success: false, message: `需要${milestone.require}只仙宠，当前${owned}只` };
    }

    const player = this.gameState.player;
    player.exp = (player.exp || 0) + milestone.reward.exp;
    player.spiritStones = (player.spiritStones || 0) + milestone.reward.spiritStones;
    milestone.claimed = true;

    return {
      success: true,
      message: `领取里程碑奖励：+${milestone.reward.exp}经验 +${milestone.reward.spiritStones}灵石`
    };
  }

  // ===== 仙宠培养 =====

  /**
   * 仙宠升级
   */
  levelUpBeast(beastId) {
    const beast = this.gameState.beastCatalogue.owned[beastId];
    if (!beast) return { success: false, message: '未拥有该仙宠' };

    const player = this.gameState.player;
    const cost = beast.level * 100;

    if ((player.spiritStones || 0) < cost) {
      return { success: false, message: '灵石不足' };
    }

    player.spiritStones -= cost;
    beast.level++;

    return {
      success: true,
      message: `「${beast.name}」升级至${beast.level}级`,
      newLevel: beast.level
    };
  }

  /**
   * 仙宠升星
   */
  starUpBeast(beastId) {
    const beast = this.gameState.beastCatalogue.owned[beastId];
    if (!beast) return { success: false, message: '未拥有该仙宠' };

    if (beast.stars >= 5) return { success: false, message: '已达最高星级' };

    const player = this.gameState.player;
    const cost = beast.stars * 500;

    if ((player.spiritStones || 0) < cost) {
      return { success: false, message: '灵石不足' };
    }

    player.spiritStones -= cost;
    beast.stars++;

    return {
      success: true,
      message: `「${beast.name}」升星至${beast.stars}星`,
      newStars: beast.stars
    };
  }

  /**
   * 获取所有拥有的仙宠
   */
  listOwnedBeasts() {
    const owned = Object.values(this.gameState.beastCatalogue.owned);
    return {
      success: true,
      count: owned.length,
      beasts: owned.sort((a, b) => BEAST_RARITIES[b.rarity] - BEAST_RARITIES[a.rarity])
    };
  }
}

export const BEAST_CATALOGUE_TOOLS = [
  { name: 'beast.discover', description: '记录发现仙宠', params: ['beastId', 'name', 'rarity', 'element', 'category'] },
  { name: 'beast.overview', description: '图鉴概览', params: [] },
  { name: 'beast.details', description: '仙宠详情', params: ['beastId'] },
  { name: 'beast.byElement', description: '按元素查询', params: ['element'] },
  { name: 'beast.byRarity', description: '按稀有度查询', params: ['rarity'] },
  { name: 'beast.byCategory', description: '按分类查询', params: ['category'] },
  { name: 'beast.unlockElement', description: '解锁元素奖励', params: ['element'] },
  { name: 'beast.milestone', description: '领取里程碑奖励', params: ['milestoneId'] },
  { name: 'beast.levelUp', description: '仙宠升级', params: ['beastId'] },
  { name: 'beast.starUp', description: '仙宠升星', params: ['beastId'] },
  { name: 'beast.list', description: '列出仙宠', params: [] }
];