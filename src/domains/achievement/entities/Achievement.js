/**
 * Achievement Entity - 成就实体
 * 成就系统核心数据模型
 */

// 成就类别
const AchievementCategory = {
    BEGINNER: 'beginner',     // 入门
    REALM: 'realm',          // 境界
    RESOURCE: 'resource',    // 资源
    BATTLE: 'battle',        // 战斗
    QUEST: 'quest',          // 任务
    ACTIVITY: 'activity',    // 活动
    SOCIAL: 'social',        // 社交
    COLLECTION: 'collection', // 收集
};

// 成就要求类型
const AchievementRequirementType = {
    LOGIN: 'login',           // 登录次数
    REALM: 'realm',           // 境界等级
    SPIRIT: 'spirit',          // 灵气数量
    STONE: 'stone',           // 灵石数量
    BATTLE: 'battle',          // 战斗次数
    QUEST: 'quest',           // 任务完成数
    SIGNIN: 'signin',         // 签到天数
    PET: 'pet',               // 宠物相关
    ITEM: 'item',             // 物品相关
    EXPLORE: 'explore',       // 探险相关
};

// 成就奖励类型
const AchievementRewardType = {
    SPIRIT_STONE: 'spiritStone',
    REPUTATION: 'reputation',
    ITEM: 'item',
    TITLE: 'title',
    BADGE: 'badge',
    SPIRIT: 'spirit',
    EXP: 'exp',
};

/**
 * Achievement Entity Class
 */
class Achievement {
    constructor(data = {}) {
        // 基本信息
        this.id = data.id || '';
        this.name = data.name || '成就';
        this.description = data.description || '';
        this.category = data.category || AchievementCategory.BEGINNER;
        
        // 需求
        this.requirement = data.requirement || { type: AchievementRequirementType.LOGIN, count: 1 };
        
        // 进度
        this.progress = data.progress || 0;
        this.targetValue = this.requirement.count || this.requirement.amount || this.requirement.level || 1;
        
        // 状态
        this.completed = data.completed || false;
        this.completedAt = data.completedAt || null;
        this.rewardClaimed = data.rewardClaimed || false;
        
        // 奖励
        this.reward = data.reward || { type: AchievementRewardType.SPIRIT_STONE, amount: 100 };
        
        // 隐藏成就
        this.hidden = data.hidden || false;
        
        // 图标
        this.icon = data.icon || 'trophy';
        
        // 排序
        this.sortOrder = data.sortOrder || 0;
    }

    /**
     * 更新进度
     */
    updateProgress(value) {
        this.progress = value;
        if (this.progress >= this.targetValue && !this.completed) {
            this.completed = true;
            this.completedAt = new Date().toISOString();
            return { leveledUp: true, completed: true };
        }
        return { leveledUp: false, completed: false };
    }

    /**
     * 检查是否可领取奖励
     */
    canClaimReward() {
        return this.completed && !this.rewardClaimed;
    }

    /**
     * 领取奖励
     */
    claimReward() {
        if (!this.canClaimReward()) {
            return { success: false, message: '奖励不可领取' };
        }
        this.rewardClaimed = true;
        return {
            success: true,
            reward: this.reward,
            message: '领取奖励成功'
        };
    }

    /**
     * 获取进度百分比
     */
    getProgressPercent() {
        if (this.completed) return 100;
        return Math.min(100, Math.floor((this.progress / this.targetValue) * 100));
    }

    /**
     * 转换为JSON对象
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            category: this.category,
            requirement: this.requirement,
            progress: this.progress,
            targetValue: this.targetValue,
            completed: this.completed,
            completedAt: this.completedAt,
            rewardClaimed: this.rewardClaimed,
            reward: this.reward,
            hidden: this.hidden,
            icon: this.icon,
            sortOrder: this.sortOrder
        };
    }

    /**
     * 从JSON创建实例
     */
    static fromJSON(json) {
        return new Achievement(json);
    }
}

// 成就池定义
const ACHIEVEMENT_POOL = [
    // 入门成就
    { id: 'ach_first_login', name: '初入仙途', description: '首次登录游戏', category: AchievementCategory.BEGINNER, requirement: { type: AchievementRequirementType.LOGIN, count: 1 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 100 } },
    { id: 'ach_login_7', name: '连续登录', description: '累计登录7天', category: AchievementCategory.BEGINNER, requirement: { type: AchievementRequirementType.LOGIN, count: 7 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 200 } },
    { id: 'ach_login_30', name: '签到之星', description: '累计签到30天', category: AchievementCategory.BEGINNER, requirement: { type: AchievementRequirementType.SIGNIN, days: 30 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 1000 } },
    
    // 境界成就
    { id: 'ach_realm_qi', name: '炼气初期', description: '境界达到炼气初期', category: AchievementCategory.REALM, requirement: { type: AchievementRequirementType.REALM, level: 1 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 200 } },
    { id: 'ach_realm_zhu', name: '筑基成功', description: '境界达到筑基', category: AchievementCategory.REALM, requirement: { type: AchievementRequirementType.REALM, level: 2 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 500 } },
    { id: 'ach_realm_jin', name: '金丹大道', description: '境界达到金丹', category: AchievementCategory.REALM, requirement: { type: AchievementRequirementType.REALM, level: 3 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 1000 } },
    { id: 'ach_realm_yuan', name: '元婴突破', description: '境界达到元婴', category: AchievementCategory.REALM, requirement: { type: AchievementRequirementType.REALM, level: 4 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 2000 } },
    
    // 资源成就
    { id: 'ach_spirit_1000', name: '灵气充裕', description: '累计获得1000灵气', category: AchievementCategory.RESOURCE, requirement: { type: AchievementRequirementType.SPIRIT, amount: 1000 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 300 } },
    { id: 'ach_stone_5000', name: '富甲一方', description: '累计获得5000灵石', category: AchievementCategory.RESOURCE, requirement: { type: AchievementRequirementType.STONE, amount: 5000 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 500 } },
    { id: 'ach_stone_50000', name: '腰缠万贯', description: '累计获得50000灵石', category: AchievementCategory.RESOURCE, requirement: { type: AchievementRequirementType.STONE, amount: 50000 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 2000 } },
    
    // 战斗成就
    { id: 'ach_battle_10', name: '初试锋芒', description: '完成10次战斗', category: AchievementCategory.BATTLE, requirement: { type: AchievementRequirementType.BATTLE, count: 10 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 200 } },
    { id: 'ach_battle_50', name: '战斗达人', description: '完成50次战斗', category: AchievementCategory.BATTLE, requirement: { type: AchievementRequirementType.BATTLE, count: 50 }, reward: { type: AchievementRewardType.REPUTATION, amount: 50 } },
    { id: 'ach_battle_100', name: '百战百胜', description: '完成100次战斗', category: AchievementCategory.BATTLE, requirement: { type: AchievementRequirementType.BATTLE, count: 100 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 1000 } },
    
    // 任务成就
    { id: 'ach_quest_5', name: '任务达人', description: '完成5个任务', category: AchievementCategory.QUEST, requirement: { type: AchievementRequirementType.QUEST, count: 5 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 300 } },
    { id: 'ach_quest_20', name: '任务大师', description: '完成20个任务', category: AchievementCategory.QUEST, requirement: { type: AchievementRequirementType.QUEST, count: 20 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 800 } },
];

// 成就类别名称映射
const ACHIEVEMENT_CATEGORY_NAMES = {
    [AchievementCategory.BEGINNER]: '入门',
    [AchievementCategory.REALM]: '境界',
    [AchievementCategory.RESOURCE]: '资源',
    [AchievementCategory.BATTLE]: '战斗',
    [AchievementCategory.QUEST]: '任务',
    [AchievementCategory.ACTIVITY]: '活动',
    [AchievementCategory.SOCIAL]: '社交',
    [AchievementCategory.COLLECTION]: '收集',
};

module.exports = {
    Achievement,
    AchievementCategory,
    AchievementRequirementType,
    AchievementRewardType,
    ACHIEVEMENT_POOL,
    ACHIEVEMENT_CATEGORY_NAMES,
};