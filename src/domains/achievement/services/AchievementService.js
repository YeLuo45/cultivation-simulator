/**
 * AchievementService - 成就服务
 * 处理成就相关的业务逻辑
 */

const { Achievement, AchievementCategory, AchievementRequirementType, ACHIEVEMENT_POOL } = require('../entities/Achievement');

// 成就配置
const ACHIEVEMENT_CONFIG = {
    maxEquippedBadges: 3,
    autoCheckEnabled: true,
    progressUpdateInterval: 60000, // 1分钟
};

// 成就状态初始化
const ACHIEVEMENT_STATE_INITIALIZERS = {
    V114: '_initAchievementState',
    V124: '_initAchievementState',
    V137: '_initAchievementState',
    V155: '_initAchievementStateV2',
    V165: '_initAchievementStateV3',
    V175: '_initAchievementStateV4',
    V185: '_initAchievementStateV5',
    V195: '_initAchievementStateV6',
    V203: '_initAchievementStateV7',
};

/**
 * AchievementService Class
 */
class AchievementService {
    constructor(gameState) {
        this.gs = gameState;
    }

    /**
     * 初始化成就状态 (V114基础版)
     */
    _initAchievementState() {
        if (!this.gs.achievement) {
            this.gs.achievement = {
                unlocked: [],
                rewardsClaimed: [],
                achievementPool: [...ACHIEVEMENT_POOL]
            };
        }
        return this.gs.achievement;
    }

    /**
     * 初始化成就状态V2 (V155)
     */
    _initAchievementStateV2() {
        if (!this.gs.achievementV2) {
            this.gs.achievementV2 = {
                achievements: [...ACHIEVEMENT_POOL].map(a => ({ ...a, progress: 0, completed: false, completedAt: null, rewardClaimed: false })),
                totalAchievements: 0,
                completedCount: 0
            };
            this.gs.achievementV2.totalAchievements = this.gs.achievementV2.achievements.length;
        }
        return this.gs.achievementV2;
    }

    /**
     * 初始化成就状态V3 (V165)
     */
    _initAchievementStateV3() {
        if (!this.gs.achievementV3) {
            this.gs.achievementV3 = {
                achievements: [...ACHIEVEMENT_POOL].map(a => ({
                    ...a,
                    progress: 0,
                    completed: false,
                    completedAt: null,
                    reward: a.reward || { type: 'spiritStone', amount: 100 }
                })),
                totalAchievements: 0,
                completedCount: 0
            };
            this.gs.achievementV3.totalAchievements = this.gs.achievementV3.achievements.length;
        }
        return this.gs.achievementV3;
    }

    /**
     * 初始化成就状态V6 (V195)
     */
    _initAchievementStateV6() {
        if (!this.gs.achievementV6) {
            this.gs.achievementV6 = {
                achievements: [
                    { id: 'ach_first_login_v6', name: '初入仙途v6', description: '首次登录游戏', category: 'beginner', requirement: { type: 'login', count: 1 }, progress: 0, completed: false, completedAt: null, reward: { type: 'spiritStone', amount: 100 } },
                    { id: 'ach_realm_qi_v6', name: '炼气初期v6', description: '境界达到炼气初期', category: 'realm', requirement: { type: 'realm', level: 1 }, progress: 0, completed: false, completedAt: null, reward: { type: 'spiritStone', amount: 200 } },
                    { id: 'ach_realm_zhu_v6', name: '筑基成功v6', description: '境界达到筑基', category: 'realm', requirement: { type: 'realm', level: 2 }, progress: 0, completed: false, completedAt: null, reward: { type: 'spiritStone', amount: 500 } },
                    { id: 'ach_realm_jin_v6', name: '金丹大道v6', description: '境界达到金丹', category: 'realm', requirement: { type: 'realm', level: 3 }, progress: 0, completed: false, completedAt: null, reward: { type: 'spiritStone', amount: 1000 } },
                    { id: 'ach_realm_yuan_v6', name: '元婴突破v6', description: '境界达到元婴', category: 'realm', requirement: { type: 'realm', level: 4 }, progress: 0, completed: false, completedAt: null, reward: { type: 'spiritStone', amount: 2000 } },
                    { id: 'ach_spirit_1000_v6', name: '灵气充裕v6', description: '累计获得1000灵气', category: 'resource', requirement: { type: 'spirit', amount: 1000 }, progress: 0, completed: false, completedAt: null, reward: { type: 'spiritStone', amount: 300 } },
                    { id: 'ach_stone_5000_v6', name: '富甲一方v6', description: '累计获得5000灵石', category: 'resource', requirement: { type: 'stone', amount: 5000 }, progress: 0, completed: false, completedAt: null, reward: { type: 'spiritStone', amount: 500 } },
                    { id: 'ach_stone_50000_v6', name: '腰缠万贯v6', description: '累计获得50000灵石', category: 'resource', requirement: { type: 'stone', amount: 50000 }, progress: 0, completed: false, completedAt: null, reward: { type: 'spiritStone', amount: 2000 } },
                    { id: 'ach_battle_10_v6', name: '初试锋芒v6', description: '完成10次战斗', category: 'battle', requirement: { type: 'battle', count: 10 }, progress: 0, completed: false, completedAt: null, reward: { type: 'spiritStone', amount: 200 } },
                    { id: 'ach_battle_50_v6', name: '战斗达人v6', description: '完成50次战斗', category: 'battle', requirement: { type: 'battle', count: 50 }, progress: 0, completed: false, completedAt: null, reward: { type: 'reputation', amount: 50 } },
                    { id: 'ach_battle_100_v6', name: '百战百胜v6', description: '完成100次战斗', category: 'battle', requirement: { type: 'battle', count: 100 }, progress: 0, completed: false, completedAt: null, reward: { type: 'spiritStone', amount: 1000 } },
                    { id: 'ach_quest_5_v6', name: '任务达人v6', description: '完成5个任务', category: 'quest', requirement: { type: 'quest', count: 5 }, progress: 0, completed: false, completedAt: null, reward: { type: 'spiritStone', amount: 300 } },
                    { id: 'ach_quest_20_v6', name: '任务大师v6', description: '完成20个任务', category: 'quest', requirement: { type: 'quest', count: 20 }, progress: 0, completed: false, completedAt: null, reward: { type: 'spiritStone', amount: 800 } },
                    { id: 'ach_signin_7_v6', name: '连续签到v6', description: '累计签到7天', category: 'activity', requirement: { type: 'signin', days: 7 }, progress: 0, completed: false, completedAt: null, reward: { type: 'spiritStone', amount: 200 } },
                    { id: 'ach_signin_30_v6', name: '签到之星v6', description: '累计签到30天', category: 'activity', requirement: { type: 'signin', days: 30 }, progress: 0, completed: false, completedAt: null, reward: { type: 'spiritStone', amount: 1000 } }
                ],
                totalAchievements: 0,
                completedCount: 0
            };
            this.gs.achievementV6.totalAchievements = this.gs.achievementV6.achievements.length;
        }
        return this.gs.achievementV6;
    }

    /**
     * 获取成就列表 (V114/V124基础版)
     */
    mcpAchievementList() {
        try {
            const achievement = this._initAchievementState();
            return {
                success: true,
                achievements: achievement.achievementPool,
                total: achievement.achievementPool.length,
                unlocked: achievement.unlocked.length
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 领取成就奖励 (V114/V124基础版)
     */
    mcpAchievementClaim(achievementId) {
        try {
            const achievement = this._initAchievementState();
            const idx = achievement.unlocked.indexOf(achievementId);
            if (idx === -1) return { error: '成就未解锁' };
            if (achievement.rewardsClaimed.includes(achievementId)) return { error: '奖励已领取' };
            
            const ach = achievement.achievementPool.find(a => a.id === achievementId);
            if (!ach) return { error: '成就不存在' };
            
            achievement.rewardsClaimed.push(achievementId);
            return { success: true, achievementId, reward: ach.reward };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 获取成就列表 (V137/V155/V165)
     */
    mcpAchievementListV2() {
        try {
            const achV2 = this._initAchievementStateV2();
            return {
                success: true,
                achievements: achV2.achievements,
                totalAchievements: achV2.totalAchievements,
                completedCount: achV2.completedCount
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 查看成就详情 (V155)
     */
    mcpAchievementViewV2(achievementId) {
        try {
            const achV2 = this._initAchievementStateV2();
            const ach = achV2.achievements.find(a => a.id === achievementId);
            if (!ach) return { error: '成就不存在' };
            return { success: true, achievement: ach };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 解锁成就 (V155)
     */
    mcpAchievementUnlockV2(achievementId) {
        try {
            const achV2 = this._initAchievementStateV2();
            const ach = achV2.achievements.find(a => a.id === achievementId);
            if (!ach) return { error: '成就不存在' };
            if (ach.completed) return { error: '成就已完成' };
            
            ach.completed = true;
            ach.completedAt = new Date().toISOString();
            achV2.completedCount = achV2.achievements.filter(a => a.completed).length;
            
            return { success: true, achievementId, message: '成就解锁: ' + ach.name };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 获取成就列表 (V165)
     */
    mcpAchievementListV3() {
        try {
            const achV3 = this._initAchievementStateV3();
            return {
                success: true,
                achievements: achV3.achievements.map(a => ({
                    id: a.id,
                    name: a.name,
                    description: a.description,
                    category: a.category,
                    progress: a.progress,
                    completed: a.completed,
                    reward: a.reward
                })),
                totalAchievements: achV3.totalAchievements,
                completedCount: achV3.completedCount
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 查看成就详情 (V165)
     */
    mcpAchievementViewV3(achievementId) {
        try {
            const achV3 = this._initAchievementStateV3();
            const ach = achV3.achievements.find(a => a.id === achievementId);
            if (!ach) return { error: '成就不存在' };
            return { success: true, achievement: ach };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 解锁成就 (V165)
     */
    mcpAchievementUnlockV3(achievementId) {
        try {
            const achV3 = this._initAchievementStateV3();
            if (!achievementId) {
                // 自动检查所有成就
                let unlockedAny = false;
                for (const ach of achV3.achievements) {
                    if (ach.completed) continue;
                    let progress = 0;
                    switch (ach.requirement.type) {
                        case 'login': progress = this.gs.loginCount || 1; break;
                        case 'realm': progress = this.gs.realmIndex || 0; break;
                        case 'spirit': progress = this.gs.totalSpirit || 0; break;
                        case 'stone': progress = this.gs.totalSpiritStones || 0; break;
                        case 'battle': progress = this.gs.battleCount || 0; break;
                        case 'quest': progress = this.gs.questCount || 0; break;
                        case 'signin': progress = this.gs.signinV6 ? this.gs.signinV6.totalCheckins : 0; break;
                    }
                    ach.progress = progress;
                    if (progress >= (ach.requirement.count || ach.requirement.amount || ach.requirement.level || 1)) {
                        ach.completed = true;
                        ach.completedAt = new Date().toISOString();
                        unlockedAny = true;
                    }
                }
                achV3.completedCount = achV3.achievements.filter(a => a.completed).length;
                return { success: true, unlockedAny, completedCount: achV3.completedCount };
            }
            
            const ach = achV3.achievements.find(a => a.id === achievementId);
            if (!ach) return { error: '成就不存在' };
            if (ach.completed) return { error: '成就已完成，无需重复解锁' };
            
            ach.completed = true;
            ach.completedAt = new Date().toISOString();
            achV3.completedCount = achV3.achievements.filter(a => a.completed).length;
            
            return { success: true, achievementId, completedCount: achV3.completedCount };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 领取成就奖励 (V165)
     */
    mcpAchievementRewardV3(achievementId) {
        try {
            const achV3 = this._initAchievementStateV3();
            if (!achievementId) return { error: '请指定成就ID' };
            
            const ach = achV3.achievements.find(a => a.id === achievementId);
            if (!ach) return { error: '成就不存在' };
            if (!ach.completed) return { error: '成就未完成，无法领取奖励' };
            if (ach.rewardClaimed) return { error: '奖励已领取' };
            
            let rewardMessage = '';
            switch (ach.reward.type) {
                case 'spiritStone':
                    this.gs.spiritStones = (this.gs.spiritStones || 0) + ach.reward.amount;
                    rewardMessage = '灵石x' + ach.reward.amount;
                    break;
                case 'reputation':
                    this.gs.reputation = (this.gs.reputation || 0) + ach.reward.amount;
                    rewardMessage = '声望x' + ach.reward.amount;
                    break;
            }
            
            ach.rewardClaimed = true;
            return { success: true, achievementId, reward: ach.reward, rewardMessage };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 获取成就列表 (V195/V203)
     */
    mcpAchievementListV6(category = 'all') {
        try {
            const achV6 = this._initAchievementStateV6();
            let achievements = achV6.achievements;
            if (category && category !== 'all') {
                achievements = achievements.filter(a => a.category === category);
            }
            const completedCount = achV6.achievements.filter(a => a.completed).length;
            return {
                success: true,
                achievements: achievements.map(a => ({
                    id: a.id,
                    name: a.name,
                    description: a.description,
                    category: a.category,
                    requirement: a.requirement,
                    progress: a.progress,
                    completed: a.completed,
                    completedAt: a.completedAt,
                    reward: a.reward
                })),
                totalAchievements: achV6.totalAchievements,
                completedCount: completedCount
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 查看成就详情 (V195/V203)
     */
    mcpAchievementViewV6(achievementId) {
        try {
            const achV6 = this._initAchievementStateV6();
            if (!achievementId) return { error: '请指定成就ID' };
            const ach = achV6.achievements.find(a => a.id === achievementId);
            if (!ach) return { error: '成就不存在' };
            return { success: true, achievement: ach };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 解锁成就 (V195/V203)
     */
    mcpAchievementUnlockV6(achievementId) {
        try {
            const achV6 = this._initAchievementStateV6();
            const now = new Date().toISOString();
            
            if (!achievementId) {
                // 自动检查所有成就
                let unlockedAny = false;
                for (const ach of achV6.achievements) {
                    if (ach.completed) continue;
                    let progress = 0;
                    switch (ach.requirement.type) {
                        case 'login': progress = this.gs.loginCount || 1; break;
                        case 'realm': progress = this.gs.realmIndex || 0; break;
                        case 'spirit': progress = this.gs.totalSpirit || 0; break;
                        case 'stone': progress = this.gs.totalSpiritStones || 0; break;
                        case 'battle': progress = this.gs.battleCount || 0; break;
                        case 'quest': progress = this.gs.questCount || 0; break;
                        case 'signin': progress = this.gs.signinV6 ? this.gs.signinV6.totalCheckins : 0; break;
                    }
                    ach.progress = progress;
                    const target = ach.requirement.count || ach.requirement.amount || ach.requirement.level || 1;
                    if (progress >= target) {
                        ach.completed = true;
                        ach.completedAt = now;
                        unlockedAny = true;
                    }
                }
                const completedCount = achV6.achievements.filter(a => a.completed).length;
                return { success: true, unlockedAny, completedCount };
            }
            
            const ach = achV6.achievements.find(a => a.id === achievementId);
            if (!ach) return { error: '成就不存在' };
            if (ach.completed) return { error: '成就已完成，无需重复解锁' };
            
            ach.completed = true;
            ach.completedAt = now;
            const completedCount = achV6.achievements.filter(a => a.completed).length;
            return { success: true, achievementId, completedCount };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 领取成就奖励 (V195/V203)
     */
    mcpAchievementRewardV6(achievementId) {
        try {
            const achV6 = this._initAchievementStateV6();
            if (!achievementId) return { error: '请指定成就ID' };
            
            const ach = achV6.achievements.find(a => a.id === achievementId);
            if (!ach) return { error: '成就不存在' };
            if (!ach.completed) return { error: '成就未完成，无法领取奖励' };
            if (ach.rewardClaimed) return { error: '奖励已领取' };
            
            let rewardMessage = '';
            switch (ach.reward.type) {
                case 'spiritStone':
                    this.gs.spiritStones = (this.gs.spiritStones || 0) + ach.reward.amount;
                    rewardMessage = '灵石x' + ach.reward.amount;
                    break;
                case 'reputation':
                    this.gs.reputation = (this.gs.reputation || 0) + ach.reward.amount;
                    rewardMessage = '声望x' + ach.reward.amount;
                    break;
            }
            
            ach.rewardClaimed = true;
            return { success: true, achievementId, reward: ach.reward, rewardMessage };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 获取成就统计信息
     */
    getAchievementStats() {
        const achV6 = this._initAchievementStateV6();
        const achievements = achV6.achievements;
        
        const stats = {
            total: achievements.length,
            completed: achievements.filter(a => a.completed).length,
            inProgress: achievements.filter(a => !a.completed && a.progress > 0).length,
            notStarted: achievements.filter(a => !a.completed && a.progress === 0).length,
            rewardsClaimed: achievements.filter(a => a.rewardClaimed).length,
            byCategory: {}
        };
        
        const categories = [...new Set(achievements.map(a => a.category))];
        for (const cat of categories) {
            const catAchievements = achievements.filter(a => a.category === cat);
            stats.byCategory[cat] = {
                total: catAchievements.length,
                completed: catAchievements.filter(a => a.completed).length
            };
        }
        
        return stats;
    }
}

module.exports = {
    AchievementService,
    ACHIEVEMENT_CONFIG,
    ACHIEVEMENT_STATE_INITIALIZERS,
};