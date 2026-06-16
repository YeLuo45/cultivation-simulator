/**
 * BeastBondService.js - 仙宠羁绊+合体技能
 * V259: 仙宠羁绊+合体技能
 * 
 * 功能：
 * 1. 仙宠羁绊系统 - 两只仙宠建立羁绊
 * 2. 合体技能 - 羁绊仙宠触发合体
 * 3. 羁绊等级 - 随使用提升
 */

export const BOND_TYPES = {
  '心灵感应': { bonus: { luck: 5 }, skill: '心有灵犀' },
  '并肩作战': { bonus: { attack: 30 }, skill: '双宠出击' },
  '生死与共': { bonus: { defense: 30 }, skill: '共赴生死' },
  '心意相通': { bonus: { cultivation: 0.1 }, skill: '心意相通' }
};

let _instance = null;

export function createBeastBondService(gameState) {
  if (_instance) return _instance;
  _instance = new BeastBondService(gameState);
  return _instance;
}

class BeastBondService {
  constructor(gameState) {
    this.gameState = gameState;
    this._ensure();
  }

  _ensure() {
    if (!this.gameState.beastBonds) {
      this.gameState.beastBonds = {
        bonds: {},
        fusionSkills: {},
        totalBonds: 0
      };
    }
  }

  /**
   * 建立羁绊
   */
  createBond(beastId1, beastId2, bondType) {
    if (!BOND_TYPES[bondType]) return { success: false, message: '无效羁绊类型' };

    const catalogue = this.gameState.beastCatalogue?.owned;
    if (!catalogue?.[beastId1] || !catalogue?.[beastId2]) {
      return { success: false, message: '仙宠不存在' };
    }
    if (beastId1 === beastId2) return { success: false, message: '不能与自身建立羁绊' };

    const bondKey = [beastId1, beastId2].sort().join('_');
    if (this.gameState.beastBonds.bonds[bondKey]) {
      return { success: false, message: '已有羁绊' };
    }

    const bondData = BOND_TYPES[bondType];
    this.gameState.beastBonds.bonds[bondKey] = {
      beasts: [beastId1, beastId2],
      type: bondType,
      level: 1,
      exp: 0,
      skill: bondData.skill,
      bonus: { ...bondData.bonus },
      createdAt: Date.now()
    };
    this.gameState.beastBonds.totalBonds++;

    return {
      success: true,
      message: `「${catalogue[beastId1].name}」与「${catalogue[beastId2].name}」建立${bondType}羁绊`,
      bondKey,
      skill: bondData.skill
    };
  }

  /**
   * 触发合体技能
   */
  triggerFusionSkill(beastId1, beastId2) {
    const bondKey = [beastId1, beastId2].sort().join('_');
    const bond = this.gameState.beastBonds.bonds[bondKey];
    if (!bond) return { success: false, message: '无羁绊关系' };

    const player = this.gameState.player;
    const luckBonus = (bond.bonus.luck || 0) * bond.level;
    const attackBonus = (bond.bonus.attack || 0) * bond.level;
    const defenseBonus = (bond.bonus.defense || 0) * bond.level;
    const cultivationBonus = (bond.bonus.cultivation || 0) * bond.level;

    player.luck = (player.luck || 0) + luckBonus;
    player.attack = (player.attack || 0) + attackBonus;
    player.defense = (player.defense || 0) + defenseBonus;
    player.cultivationSpeed = (player.cultivationSpeed || 1) + cultivationBonus;

    // 羁绊经验
    bond.exp += 10;
    if (bond.exp >= bond.level * 100) {
      bond.level++;
      bond.exp = 0;
    }

    return {
      success: true,
      message: `触发合体技能「${bond.skill}」！`,
      level: bond.level,
      bonuses: { luck: luckBonus, attack: attackBonus, defense: defenseBonus, cultivation: cultivationBonus }
    };
  }

  /**
   * 获取所有羁绊
   */
  listBonds() {
    const bonds = Object.entries(this.gameState.beastBonds.bonds).map(([key, data]) => {
      const cat = this.gameState.beastCatalogue?.owned;
      return {
        bondKey: key,
        beast1: cat?.[data.beasts[0]]?.name || data.beasts[0],
        beast2: cat?.[data.beasts[1]]?.name || data.beasts[1],
        type: data.type,
        level: data.level,
        skill: data.skill
      };
    });
    return { success: true, bonds, total: this.gameState.beastBonds.totalBonds };
  }

  /**
   * 解散羁绊
   */
  dissolveBond(beastId1, beastId2) {
    const bondKey = [beastId1, beastId2].sort().join('_');
    if (!this.gameState.beastBonds.bonds[bondKey]) {
      return { success: false, message: '无羁绊关系' };
    }
    delete this.gameState.beastBonds.bonds[bondKey];
    this.gameState.beastBonds.totalBonds--;
    return { success: true, message: '羁绊已解除' };
  }
}

export const BEAST_BOND_TOOLS = [
  { name: 'bond.create', description: '建立羁绊', params: ['beastId1', 'beastId2', 'bondType'] },
  { name: 'bond.trigger', description: '触发合体', params: ['beastId1', 'beastId2'] },
  { name: 'bond.list', description: '羁绊列表', params: [] },
  { name: 'bond.dissolve', description: '解散羁绊', params: ['beastId1', 'beastId2'] }
];