/**
 * SectService.js - 仙盟系统
 * V247: 仙盟系统+宗门大战
 * 
 * 功能：
 * 1. 仙盟创建/加入/退出
 * 2. 仙盟等级 (1-10级)
 * 3. 成员职位管理 (盟主/副盟主/长老/精英/弟子)
 * 4. 仙盟技能 (修炼加成/灵石加成/战力加成)
 * 5. 贡献度系统
 */

// ===== 常量定义 =====

/**
 * 仙盟等级定义
 */
export const SECT_LEVELS = {
  1: { memberLimit: 10, skillBonus: 1.05, upgradeCost: 0 },
  2: { memberLimit: 20, skillBonus: 1.10, upgradeCost: 1000 },
  3: { memberLimit: 30, skillBonus: 1.15, upgradeCost: 3000 },
  4: { memberLimit: 40, skillBonus: 1.20, upgradeCost: 6000 },
  5: { memberLimit: 50, skillBonus: 1.25, upgradeCost: 10000 },
  6: { memberLimit: 70, skillBonus: 1.30, upgradeCost: 15000 },
  7: { memberLimit: 100, skillBonus: 1.35, upgradeCost: 25000 },
  8: { memberLimit: 150, skillBonus: 1.40, upgradeCost: 40000 },
  9: { memberLimit: 180, skillBonus: 1.45, upgradeCost: 60000 },
  10: { memberLimit: 200, skillBonus: 1.50, upgradeCost: 100000 }
};

/**
 * 职位定义
 */
export const SECT_POSITIONS = ['盟主', '副盟主', '长老', '精英', '弟子'];

/**
 * 职位权限等级
 */
export const POSITION_RANK = {
  '盟主': 5,
  '副盟主': 4,
  '长老': 3,
  '精英': 2,
  '弟子': 1
};

/**
 * 仙盟技能定义
 */
export const SECT_SKILLS = {
  '修炼加成': { effect: 'cultivationSpeed', value: 0.1, cost: 5000 },
  '灵石加成': { effect: 'spiritStoneBonus', value: 0.15, cost: 5000 },
  '战力加成': { effect: 'attackBonus', value: 0.1, cost: 5000 },
  '防御加成': { effect: 'defenseBonus', value: 0.1, cost: 5000 },
  '幸运加成': { effect: 'luckBonus', value: 0.05, cost: 8000 }
};

/**
 * 创建仙盟消耗
 */
const CREATE_SECT_COST = 5000;

/**
 * 加入仙盟消耗
 */
const JOIN_SECT_COST = 100;

// ===== 服务类 =====

let _sectInstance = null;
let _currentGameState = null;

export function createSectService(gameState) {
  _currentGameState = gameState;
  _sectInstance = new SectService(gameState);
  return _sectInstance;
}

class SectService {
  constructor(gameState) {
    this.gameState = gameState;
    this._ensureSectData();
  }

  _ensureSectData() {
    if (!this.gameState.sect) {
      this.gameState.sect = {
        id: null,
        name: null,
        level: 1,
        leaderId: null,
        members: {},
        skills: {},
        contribution: {},
        contributionHistory: [],
        resources: { spiritStones: 0, contribution: 0 }
      };
    }
    if (!this.gameState.sect.members) {
      this.gameState.sect.members = {};
    }
    if (!this.gameState.sect.contribution) {
      this.gameState.sect.contribution = {};
    }
  }

  // ===== 仙盟创建 =====

  /**
   * 创建仙盟
   */
  createSect(sectName) {
    const player = this.gameState.player;
    if (!player) return { success: false, message: '玩家数据不存在' };

    if (this.gameState.sect.id) {
      return { success: false, message: '已在仙盟中' };
    }

    if ((player.spiritStones || 0) < CREATE_SECT_COST) {
      return { success: false, message: '灵石不足' };
    }

    player.spiritStones -= CREATE_SECT_COST;
    const sectId = `sect_${Date.now()}`;

    this.gameState.sect = {
      id: sectId,
      name: sectName,
      level: 1,
      leaderId: player.id || player.name,
      members: {},
      skills: {},
      contribution: {},
      contributionHistory: [],
      resources: { spiritStones: CREATE_SECT_COST, contribution: 0 },
      createdAt: Date.now()
    };

    this._addMember(player, '盟主');
    this._addContribution(player, 1000, '创建仙盟奖励');

    return {
      success: true,
      message: `仙盟「${sectName}」创建成功`,
      sectId,
      remainingSpiritStones: player.spiritStones
    };
  }

  // ===== 成员管理 =====

  /**
   * 添加成员
   */
  _addMember(player, position = '弟子') {
    const playerId = player.id || player.name;
    this.gameState.sect.members[playerId] = {
      id: playerId,
      name: player.name || playerId,
      position,
      joinTime: Date.now(),
      lastActive: Date.now(),
      totalContribution: 0
    };
    if (!this.gameState.sect.contribution[playerId]) {
      this.gameState.sect.contribution[playerId] = 0;
    }
  }

  /**
   * 加入仙盟
   */
  joinSect(sectId, sectName) {
    const player = this.gameState.player;
    if (!player) return { success: false, message: '玩家数据不存在' };

    if (this.gameState.sect.id) {
      return { success: false, message: '已在仙盟中' };
    }

    const levelInfo = SECT_LEVELS[this.gameState.sect.level];
    if (Object.keys(this.gameState.sect.members).length >= levelInfo.memberLimit) {
      return { success: false, message: '仙盟人数已满' };
    }

    if ((player.spiritStones || 0) < JOIN_SECT_COST) {
      return { success: false, message: '灵石不足' };
    }

    player.spiritStones -= JOIN_SECT_COST;
    this._addMember(player);

    return {
      success: true,
      message: `成功加入「${sectName}」`,
      sectName,
      remainingSpiritStones: player.spiritStones
    };
  }

  /**
   * 退出仙盟
   */
  leaveSect() {
    const player = this.gameState.player;
    if (!player) return { success: false, message: '玩家数据不存在' };

    const playerId = player.id || player.name;
    const playerData = this.gameState.sect.members[playerId];

    if (!playerData) {
      return { success: false, message: '不在仙盟中' };
    }

    if (playerData.position === '盟主') {
      return { success: false, message: '盟主无法退出，请先转让盟主' };
    }

    delete this.gameState.sect.members[playerId];
    delete this.gameState.sect.contribution[playerId];

    return { success: true, message: '已退出仙盟' };
  }

  /**
   * 修改成员职位
   */
  changeMemberPosition(targetId, newPosition) {
    const player = this.gameState.player;
    if (!player) return { success: false, message: '玩家数据不存在' };

    const playerId = player.id || player.name;
    const playerData = this.gameState.sect.members[playerId];

    if (!playerData || POSITION_RANK[playerData.position] < POSITION_RANK['长老']) {
      return { success: false, message: '权限不足' };
    }

    const targetMember = this.gameState.sect.members[targetId];
    if (!targetMember) {
      return { success: false, message: '成员不存在' };
    }

    if (POSITION_RANK[newPosition] >= POSITION_RANK[playerData.position]) {
      return { success: false, message: '无法授予高于自身职位的级别' };
    }

    targetMember.position = newPosition;
    return { success: true, message: `已将${targetMember.name}职位调整为${newPosition}` };
  }

  // ===== 贡献度系统 =====

  /**
   * 添加贡献度
   */
  _addContribution(player, amount, reason = '贡献') {
    const playerId = player.id || player.name;
    if (!this.gameState.sect.contribution[playerId]) {
      this.gameState.sect.contribution[playerId] = 0;
    }
    this.gameState.sect.contribution[playerId] += amount;
    
    const member = this.gameState.sect.members[playerId];
    if (member) {
      member.totalContribution += amount;
      member.lastActive = Date.now();
    }

    this.gameState.sect.contributionHistory.push({
      playerId,
      amount,
      reason,
      timestamp: Date.now()
    });
  }

  /**
   * 捐献灵石增加贡献
   */
  donateContributions(amount) {
    const player = this.gameState.player;
    if (!player) return { success: false, message: '玩家数据不存在' };

    if (!this.gameState.sect.id) {
      return { success: false, message: '未加入仙盟' };
    }

    if (amount <= 0) {
      return { success: false, message: '捐献数量必须大于0' };
    }

    if ((player.spiritStones || 0) < amount) {
      return { success: false, message: '灵石不足' };
    }

    player.spiritStones -= amount;
    const contributionGain = Math.floor(amount / 10);
    
    this._addContribution(player, contributionGain, `捐献${amount}灵石`);

    return {
      success: true,
      message: `贡献${contributionGain}点贡献度`,
      contributionGain,
      remainingSpiritStones: player.spiritStones
    };
  }

  // ===== 仙盟技能 =====

  /**
   * 学习仙盟技能
   */
  learnSectSkill(skillName) {
    if (!this.gameState.sect.id) {
      return { success: false, message: '未加入仙盟' };
    }

    const skill = SECT_SKILLS[skillName];
    if (!skill) {
      return { success: false, message: '未知技能' };
    }

    if (this.gameState.sect.skills[skillName]) {
      return { success: false, message: '已学习该技能' };
    }

    const player = this.gameState.player;
    const playerId = player.id || player.name;
    const playerContribution = this.gameState.sect.contribution[playerId] || 0;

    if (playerContribution < skill.cost) {
      return { success: false, message: '贡献度不足' };
    }

    this.gameState.sect.contribution[playerId] -= skill.cost;
    this.gameState.sect.skills[skillName] = {
      ...skill,
      learnedAt: Date.now(),
      learnerId: playerId
    };

    return {
      success: true,
      message: `成功学习「${skillName}」`,
      skill
    };
  }

  /**
   * 获取技能加成
   */
  getSkillBonuses() {
    const bonuses = {};
    for (const [name, skill] of Object.entries(this.gameState.sect.skills)) {
      bonuses[skill.effect] = (bonuses[skill.effect] || 0) + skill.value;
    }
    return bonuses;
  }

  // ===== 仙盟升级 =====

  /**
   * 升级仙盟
   */
  upgradeSect() {
    if (!this.gameState.sect.id) {
      return { success: false, message: '未加入仙盟' };
    }

    const currentLevel = this.gameState.sect.level;
    if (currentLevel >= 10) {
      return { success: false, message: '已达最高等级' };
    }

    const nextLevelInfo = SECT_LEVELS[currentLevel + 1];
    if (!nextLevelInfo) {
      return { success: false, message: '无法升级' };
    }

    if (this.gameState.sect.resources.spiritStones < nextLevelInfo.upgradeCost) {
      return { success: false, message: '仙盟资源不足' };
    }

    this.gameState.sect.resources.spiritStones -= nextLevelInfo.upgradeCost;
    this.gameState.sect.level += 1;

    return {
      success: true,
      message: `仙盟升级成功：${currentLevel}级 → ${this.gameState.sect.level}级`,
      newLevel: this.gameState.sect.level
    };
  }

  // ===== 查询接口 =====

  /**
   * 获取仙盟信息
   */
  getSectInfo() {
    if (!this.gameState.sect.id) {
      return { success: true, inSect: false };
    }

    const levelInfo = SECT_LEVELS[this.gameState.sect.level];
    return {
      success: true,
      inSect: true,
      id: this.gameState.sect.id,
      name: this.gameState.sect.name,
      level: this.gameState.sect.level,
      memberCount: Object.keys(this.gameState.sect.members).length,
      memberLimit: levelInfo.memberLimit,
      skillBonus: levelInfo.skillBonus,
      skills: Object.keys(this.gameState.sect.skills),
      resources: this.gameState.sect.resources
    };
  }

  /**
   * 获取成员列表
   */
  listMembers() {
    if (!this.gameState.sect.id) {
      return { success: false, message: '未加入仙盟' };
    }

    return {
      success: true,
      members: Object.values(this.gameState.sect.members).map(m => ({
        id: m.id,
        name: m.name,
        position: m.position,
        totalContribution: m.totalContribution,
        lastActive: m.lastActive
      })).sort((a, b) => POSITION_RANK[b.position] - POSITION_RANK[a.position])
    };
  }

  /**
   * 获取成员贡献度排名
   */
  getContributionRankings() {
    if (!this.gameState.sect.id) {
      return { success: false, message: '未加入仙盟' };
    }

    const rankings = Object.entries(this.gameState.sect.contribution)
      .map(([playerId, contribution]) => {
        const member = this.gameState.sect.members[playerId];
        return {
          playerId,
          name: member?.name || playerId,
          contribution,
          position: member?.position || '弟子'
        };
      })
      .sort((a, b) => b.contribution - a.contribution);

    return { success: true, rankings };
  }

  /**
   * 获取贡献历史
   */
  getContributionHistory(limit = 20) {
    const history = this.gameState.sect.contributionHistory || [];
    return {
      success: true,
      history: history.slice(-limit)
    };
  }

  /**
   * 获取个人贡献度
   */
  getMyContribution() {
    const player = this.gameState.player;
    if (!player) return { success: false, message: '玩家数据不存在' };

    const playerId = player.id || player.name;
    return {
      success: true,
      contribution: this.gameState.sect.contribution[playerId] || 0,
      totalContributed: this.gameState.sect.members[playerId]?.totalContribution || 0
    };
  }
}

// ===== MCP工具导出 =====

export const SECT_TOOLS = [
  { name: 'sect.create', description: '创建仙盟', params: ['sectName'] },
  { name: 'sect.join', description: '加入仙盟', params: ['sectId', 'sectName'] },
  { name: 'sect.leave', description: '退出仙盟', params: [] },
  { name: 'sect.info', description: '获取仙盟信息', params: [] },
  { name: 'sect.members', description: '获取成员列表', params: [] },
  { name: 'sect.donate', description: '捐献灵石增加贡献', params: ['amount'] },
  { name: 'sect.skill', description: '学习仙盟技能', params: ['skillName'] },
  { name: 'sect.upgrade', description: '升级仙盟', params: [] },
  { name: 'sect.rankings', description: '贡献度排名', params: [] },
  { name: 'sect.contribution', description: '我的贡献度', params: [] },
  { name: 'sect.history', description: '贡献历史', params: [] }
];