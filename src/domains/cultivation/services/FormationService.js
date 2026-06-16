/**
 * FormationService.js - 仙阵布设+护山大阵
 * V257: 仙阵布设+护山大阵
 */

export const FORMATION_TYPES = { 防御: 1, 攻击: 2, 聚灵: 3, 困敌: 4, 幻阵: 5 };
export const FORMATION_TIERS = { 基础: 1, 精妙: 2, 玄妙: 3, 神妙: 4, 仙阵: 5 };

let _instance = null;

export function createFormationService(gameState) {
  if (_instance) return _instance;
  _instance = new FormationService(gameState);
  return _instance;
}

class FormationService {
  constructor(gameState) {
    this.gameState = gameState;
    this._ensure();
  }

  _ensure() {
    if (!this.gameState.formations) {
      this.gameState.formations = {
        placed: {},
        learned: [],
        energy: 0,
        activeFormation: null
      };
    }
  }

  /**
   * 学习阵法
   */
  learnFormation(type, tier = '基础') {
    if (!FORMATION_TYPES[type]) return { success: false, message: '无效阵法类型' };
    if (!FORMATION_TIERS[tier]) return { success: false, message: '无效阵法等阶' };

    const id = `${type}_${tier}_${Date.now()}`;
    const formation = { id, type, tier, level: 1, learnedAt: Date.now() };
    this.gameState.formations.learned.push(formation);

    return { success: true, message: `学会${tier}「${type}阵」`, formation };
  }

  /**
   * 布设阵法
   */
  placeFormation(type, position) {
    if (!FORMATION_TYPES[type]) return { success: false, message: '无效阵法类型' };

    const learned = this.gameState.formations.learned.find(f => f.type === type);
    if (!learned) return { success: false, message: '尚未学习该阵法' };

    if (this.gameState.formations.placed[position]) {
      return { success: false, message: '该位置已有阵法' };
    }

    const cost = FORMATION_TIERS[learned.tier] * 500;
    const player = this.gameState.player;
    if ((player.spiritStones || 0) < cost) {
      return { success: false, message: '灵石不足' };
    }

    player.spiritStones -= cost;
    this.gameState.formations.placed[position] = {
      type,
      tier: learned.tier,
      level: learned.level,
      placedAt: Date.now(),
      owner: player.id || player.name
    };

    return { success: true, message: `在「${position}」布设${learned.tier}「${type}阵」` };
  }

  /**
   * 激活阵法
   */
  activateFormation(position) {
    const placed = this.gameState.formations.placed[position];
    if (!placed) return { success: false, message: '阵法不存在' };

    const energyCost = FORMATION_TIERS[placed.tier] * 10;
    if (this.gameState.formations.energy < energyCost) {
      return { success: false, message: '阵法能量不足' };
    }

    this.gameState.formations.energy -= energyCost;
    this.gameState.formations.activeFormation = position;

    return { success: true, message: `激活「${position}」的${placed.tier}「${placed.type}阵」` };
  }

  /**
   * 充能阵法
   */
  chargeFormation(amount) {
    if (amount <= 0) return { success: false, message: '充能必须为正数' };
    const player = this.gameState.player;
    if ((player.spiritStones || 0) < amount) {
      return { success: false, message: '灵石不足' };
    }
    player.spiritStones -= amount;
    this.gameState.formations.energy += Math.floor(amount * 0.8);
    return { success: true, message: `充能${Math.floor(amount * 0.8)}点`, energy: this.gameState.formations.energy };
  }

  /**
   * 获取阵法效果
   */
  getFormationBonus(position) {
    const placed = this.gameState.formations.placed[position];
    if (!placed || this.gameState.formations.activeFormation !== position) {
      return { success: false, active: false };
    }

    const bonuses = {
      '防御': { defense: placed.level * 50 },
      '攻击': { attack: placed.level * 30 },
      '聚灵': { cultivation: placed.level * 0.1 },
      '困敌': { trapStrength: placed.level * 20 },
      '幻阵': { evasion: placed.level * 15 }
    };

    return { success: true, active: true, type: placed.type, bonus: bonuses[placed.type] || {} };
  }

  /**
   * 列出已学习阵法
   */
  listLearned() {
    return { success: true, learned: this.gameState.formations.learned };
  }

  /**
   * 列出已布设阵法
   */
  listPlaced() {
    return { success: true, placed: this.gameState.formations.placed };
  }
}

export const FORMATION_TOOLS = [
  { name: 'formation.learn', description: '学习阵法', params: ['type', 'tier'] },
  { name: 'formation.place', description: '布设阵法', params: ['type', 'position'] },
  { name: 'formation.activate', description: '激活阵法', params: ['position'] },
  { name: 'formation.charge', description: '充能阵法', params: ['amount'] },
  { name: 'formation.bonus', description: '阵法效果', params: ['position'] },
  { name: 'formation.listLearned', description: '已学阵法', params: [] },
  { name: 'formation.listPlaced', description: '已布阵法', params: [] }
];