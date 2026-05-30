/**
 * AchievementModule - 成就模块导出
 * 整合成就系统的所有功能
 */

const { Achievement, AchievementCategory, AchievementRequirementType, AchievementRewardType, ACHIEVEMENT_POOL } = require('./entities/Achievement');
const { Badge, BadgeRarity, BadgeType, BADGE_POOL, MAX_EQUIPPED_BADGES } = require('./entities/Badge');
const { AchievementService } = require('./services/AchievementService');
const { BadgeService } = require('./services/BadgeService');

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

// 徽章状态初始化
const BADGE_STATE_INITIALIZERS = {
    V114: '_initBadgeState',
    V137: '_initBadgeState',
    V155: '_initBadgeStateV2',
    V165: '_initBadgeStateV3',
    V175: '_initBadgeStateV4',
    V185: '_initBadgeStateV5',
    V195: '_initBadgeStateV6',
    V203: '_initBadgeStateV7',
};

// 导出API方法列表
const ACHIEVEMENT_API_METHODS = [
    'mcpAchievementList',
    'mcpAchievementView',
    'mcpAchievementUnlock',
    'mcpAchievementReward',
    'mcpAchievementListV2',
    'mcpAchievementViewV2',
    'mcpAchievementUnlockV2',
    'mcpAchievementListV3',
    'mcpAchievementViewV3',
    'mcpAchievementUnlockV3',
    'mcpAchievementRewardV3',
    'mcpAchievementListV4',
    'mcpAchievementViewV4',
    'mcpAchievementUnlockV4',
    'mcpAchievementRewardV4',
    'mcpAchievementListV5',
    'mcpAchievementViewV5',
    'mcpAchievementUnlockV5',
    'mcpAchievementRewardV5',
    'mcpAchievementListV6',
    'mcpAchievementViewV6',
    'mcpAchievementUnlockV6',
    'mcpAchievementRewardV6',
    'mcpAchievementEarnV8',
    'mcpAchievementListV7',
    'mcpAchievementListV8',
    'mcpAchievementRewardV8',
];

const BADGE_API_METHODS = [
    'mcpBadgeList',
    'mcpBadgeEquip',
    'mcpBadgeUnequip',
    'mcpBadgeListV2',
    'mcpBadgeEquipV2',
    'mcpBadgeUnequipV2',
    'mcpBadgeListV3',
    'mcpBadgeEquipV3',
    'mcpBadgeListV4',
    'mcpBadgeEquipV4',
    'mcpBadgeListV5',
    'mcpBadgeEquipV5',
    'mcpBadgeListV6',
    'mcpBadgeEquipV6',
    'mcpBadgeShowV8',
];

// 导出所有成就模块内容
module.exports = {
    // 实体
    Achievement,
    Badge,
    
    // 服务
    AchievementService,
    BadgeService,
    
    // 配置
    ACHIEVEMENT_STATE_INITIALIZERS,
    BADGE_STATE_INITIALIZERS,
    MAX_EQUIPPED_BADGES,
    
    // API方法列表
    ACHIEVEMENT_API_METHODS,
    BADGE_API_METHODS,
    
    // 模块信息
    moduleName: 'achievement',
    moduleVersion: 'V195',
    moduleDescription: '成就系统 - 包含成就、徽章、奖励等功能',
};