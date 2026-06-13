/**
 * DailyQuestService.js - 每日任务+成就奖励系统
 * V254: 每日任务+成就奖励系统
 * 
 * 功能：
 * 1. 每日任务生成与刷新
 * 2. 成就进度追踪
 * 3. 奖励领取
 * 4. 连续活跃奖励
 */

export const QUEST_TYPES = ['击杀', '修炼', '灵石', '仙宠', '仙盟', '挑战'];
export const ACHIEVEMENT_TIERS = { 铜: 1, 银: 2, 金: 3, 钻: 4 };

const DAILY_RESET_HOUR = 4; // 每天4点重置

let _questInstance = null;
let _achInstance = null;

export function createDailyQuestService(gameState) {
  if (_questInstance) return _questInstance;
  _questInstance = new DailyQuestService(gameState);
  return _questInstance;
}

export function createAchievementService(gameState) {
  if (_achInstance) return _achInstance;
  _achInstance = new AchievementService(gameState);
  return _achInstance;
}

function shouldResetDaily(lastReset) {
  if (!lastReset) return true;
  const now = Date.now();
  const last = new Date(lastReset);
  const today = new Date(now);
  const resetTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), DAILY_RESET_HOUR);
  return now >= resetTime && last < resetTime;
}

class DailyQuestService {
  constructor(gameState) {
    this.gameState = gameState;
    this._ensure();
  }

  _ensure() {
    if (!this.gameState.dailyQuests) {
      this.gameState.dailyQuests = { quests: [], lastReset: 0, streak: 0, completedIds: [] };
    }
  }

  generateDailyQuests() {
    if (!shouldResetDaily(this.gameState.dailyQuests.lastReset)) {
      return { success: true, message: '今日任务已生成', quests: this.gameState.dailyQuests.quests };
    }

    const quests = [];
    const baseExp = 100;
    for (let i = 0; i < 5; i++) {
      const type = QUEST_TYPES[Math.floor(Math.random() * QUEST_TYPES.length)];
      const difficulty = i + 1;
      quests.push({
        id: `dq_${Date.now()}_${i}`,
        type,
        title: this._generateTitle(type, difficulty),
        target: difficulty * (type === '修炼' ? 60 : 10),
        reward: { exp: baseExp * difficulty * 10, spiritStones: difficulty * 50 },
        progress: 0,
        completed: false,
        claimed: false
      });
    }

    this.gameState.dailyQuests.quests = quests;
    this.gameState.dailyQuests.lastReset = Date.now();
    this.gameState.dailyQuests.completedIds = [];

    return { success: true, message: '生成5个每日任务', quests };
  }

  _generateTitle(type, diff) {
    const titles = {
      '击杀': `击败${diff * 5}名敌人`,
      '修炼': `修炼${diff * 10}分钟`,
      '灵石': `赚取${diff * 1000}灵石`,
      '仙宠': `捕捉${diff}只仙宠`,
      '仙盟': `参加${diff}次仙盟活动`,
      '挑战': `通关${diff}层试炼`
    };
    return titles[type] || `${type}任务 x${diff}`;
  }

  updateQuestProgress(type, amount) {
    this.generateDailyQuests();
    let updated = false;

    for (const q of this.gameState.dailyQuests.quests) {
      if (q.type === type && !q.completed) {
        q.progress += amount;
        if (q.progress >= q.target) {
          q.completed = true;
          this.gameState.dailyQuests.completedIds.push(q.id);
        }
        updated = true;
      }
    }

    return { success: true, updated };
  }

  claimQuestReward(questId) {
    const q = this.gameState.dailyQuests.quests.find(q => q.id === questId);
    if (!q) return { success: false, message: '任务不存在' };
    if (!q.completed) return { success: false, message: '任务未完成' };
    if (q.claimed) return { success: false, message: '奖励已领取' };

    const player = this.gameState.player;
    player.exp = (player.exp || 0) + q.reward.exp;
    player.spiritStones = (player.spiritStones || 0) + q.reward.spiritStones;
    q.claimed = true;

    return {
      success: true,
      message: `领取奖励：+${q.reward.exp}经验 +${q.reward.spiritStones}灵石`,
      newExp: player.exp,
      newSpiritStones: player.spiritStones
    };
  }

  getDailyQuests() {
    this.generateDailyQuests();
    return {
      success: true,
      quests: this.gameState.dailyQuests.quests,
      completedCount: this.gameState.dailyQuests.quests.filter(q => q.completed).length,
      streak: this.gameState.dailyQuests.streak
    };
  }
}

class AchievementService {
  constructor(gameState) {
    this.gameState = gameState;
    this._ensure();
  }

  _ensure() {
    if (!this.gameState.achievements) {
      this.gameState.achievements = { list: {}, totalAchieved: 0 };
    }
    if (!this.gameState.achievements.list) this.gameState.achievements.list = {};
  }

  registerAchievement(id, name, desc, tier, condition, reward) {
    if (this.gameState.achievements.list[id]) return;
    this.gameState.achievements.list[id] = {
      name, desc, tier, condition, reward,
      progress: 0, achieved: false, achievedAt: null
    };
  }

  updateAchievementProgress(id, amount) {
    const ach = this.gameState.achievements.list[id];
    if (!ach || ach.achieved) return;

    ach.progress += amount;
    if (ach.progress >= ach.condition) {
      ach.achieved = true;
      ach.achievedAt = Date.now();
      this.gameState.achievements.totalAchieved++;

      const player = this.gameState.player;
      player.exp = (player.exp || 0) + ach.reward.exp;
      player.spiritStones = (player.spiritStones || 0) + ach.reward.spiritStones;
    }
  }

  getAchievementInfo(id) {
    const ach = this.gameState.achievements.list[id];
    if (!ach) return { success: false };
    return {
      success: true,
      achieved: ach.achieved,
      progress: ach.progress,
      condition: ach.condition,
      progressPercent: Math.min(100, Math.floor((ach.progress / ach.condition) * 100))
    };
  }

  getAllAchievements() {
    return {
      success: true,
      achievements: Object.entries(this.gameState.achievements.list).map(([id, data]) => ({
        id, name: data.name, tier: data.tier, achieved: data.achieved, progress: data.progress
      })),
      totalAchieved: this.gameState.achievements.totalAchieved
    };
  }
}

export const QUEST_TOOLS = [
  { name: 'quest.daily', description: '获取每日任务', params: [] },
  { name: 'quest.claim', description: '领取任务奖励', params: ['questId'] },
  { name: 'quest.progress', description: '更新任务进度', params: ['type', 'amount'] },
  { name: 'ach.list', description: '成就列表', params: [] },
  { name: 'ach.info', description: '成就详情', params: ['id'] }
];