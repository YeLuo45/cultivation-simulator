/**
 * ReincarnationModule - 轮回模块导出
 * 整合reincarnation领域的所有实体和服务
 */

// Entities
const { Reincarnation, REINCARNATION_CAUSES, REINCARNATION_QUALITY_BONUSES } = require('./entities/Reincarnation.js');

// Services
const { ReincarnationService, reincarnationService, CELESTIAL_REINCARNATION_CONFIG, REINCARNATION_EVENTS } = require('./services/ReincarnationService.js');

/**
 * 创建轮回实例
 */
function createReincarnation(config) {
    return new Reincarnation(config);
}

/**
 * 初始化轮回服务
 */
function initReincarnation(gameState) {
    return reincarnationService.init(gameState);
}

/**
 * 获取轮回统计
 */
function getReincarnationStats() {
    return reincarnationService.getStats();
}

/**
 * 预览轮回加成
 */
function previewReincarnation() {
    return reincarnationService.preview();
}

/**
 * 执行轮回
 */
function doReincarnate(gameState) {
    return reincarnationService.doReincarnate(gameState);
}

/**
 * 记录因果
 */
function recordKarma(type, amount) {
    return reincarnationService.recordKarma(type, amount);
}

/**
 * 应用轮回加成到游戏状态
 */
function applyReincarnationBonuses(gameState) {
    return reincarnationService.applyBonusesToGameState(gameState);
}

/**
 * 获取轮回加成描述
 */
function getBonusDescriptions() {
    return reincarnationService.getBonusDescriptions();
}

/**
 * 检查是否可以轮回
 */
function canReincarnate(gameState) {
    return reincarnationService.canReincarnate(gameState);
}

/**
 * 设置死亡原因
 */
function setCauseOfDeath(cause) {
    return reincarnationService.setCauseOfDeath(cause);
}

/**
 * 添加保留技能
 */
function addRetainedSkill(skill) {
    return reincarnationService.addRetainedSkill(skill);
}

/**
 * 添加保留物品
 */
function addRetainedItem(item) {
    return reincarnationService.addRetainedItem(item);
}

/**
 * 获取过去生世信息
 */
function getPastLives(limit) {
    return reincarnationService.getPastLives(limit);
}

/**
 * MCP: 轮回统计
 */
function mcpStats() {
    return reincarnationService.mcpStats();
}

/**
 * MCP: 预览轮回
 */
function mcpPreview() {
    return reincarnationService.mcpPreview();
}

/**
 * MCP: 执行轮回
 */
function mcpReincarnate(gameState) {
    return reincarnationService.mcpReincarnate(gameState);
}

// 导出
module.exports = {
    // Entities
    Reincarnation,
    REINCARNATION_CAUSES,
    REINCARNATION_QUALITY_BONUSES,
    
    // Services
    ReincarnationService,
    reincarnationService,
    CELESTIAL_REINCARNATION_CONFIG,
    REINCARNATION_EVENTS,
    
    // Helper functions
    createReincarnation,
    initReincarnation,
    getReincarnationStats,
    previewReincarnation,
    doReincarnate,
    recordKarma,
    applyReincarnationBonuses,
    getBonusDescriptions,
    canReincarnate,
    setCauseOfDeath,
    addRetainedSkill,
    addRetainedItem,
    getPastLives,
    mcpStats,
    mcpPreview,
    mcpReincarnate
};