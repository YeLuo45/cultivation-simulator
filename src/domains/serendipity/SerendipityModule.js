/**
 * SerendipityModule - 奇遇模块导出
 * 整合serendipity领域的所有实体和服务
 */

// Entities
const { Serendipity, SerendipityNode, SuperNode, SERENDIPITY_EVENTS, SERENDIPITY_TALISMANS } = require('./entities/Serendipity.js');
const { DAG } = require('./entities/DAG.js');

// Services
const { SerendipityService, serendipityService, SerendipityDAG } = require('./services/SerendipityService.js');
const { DAGExecutor, dagExecutor } = require('./services/DAGExecutor.js');

/**
 * 创建奇遇实例
 */
function createSerendipity(config) {
    return new Serendipity(config);
}

/**
 * 创建DAG实例
 */
function createDAG() {
    return new DAG();
}

/**
 * 初始化奇遇服务
 */
function initSerendipities() {
    serendipityService.initDefaultSerendipities();
    serendipityService.extendSerendipityChains();
    return serendipityService;
}

/**
 * 触发随机奇遇
 */
function triggerRandomSerendipity(playerState) {
    return serendipityService.triggerRandomSerendipity(playerState);
}

/**
 * 获取奇遇状态
 */
function getSerendipityStatus() {
    return serendipityService.getDAGStatus();
}

/**
 * 使用DAG执行器执行节点
 */
function executeNode(nodeId, dag) {
    return dagExecutor.executeNodeEffects(nodeId, dag);
}

/**
 * 处理分支选择
 */
function handleBranch(nodeId, choice) {
    return dagExecutor.handleBranch(nodeId, choice, serendipityService.serendipityBranch);
}

/**
 * 获取奇遇进度
 */
function getSerendipityProgress() {
    return serendipityService.getProgress();
}

/**
 * 记录因果
 */
function recordKarma(action, type, amount) {
    return serendipityService.recordKarma(action, type, amount);
}

/**
 * 查询因果
 */
function queryKarma() {
    return serendipityService.queryKarma();
}

/**
 * 查询命运
 */
function queryFate(query) {
    return serendipityService.queryFate(query);
}

/**
 * 使用符咒
 */
function useTalisman(name, gameState) {
    const talisman = SERENDIPITY_TALISMANS[name];
    if (!talisman) {
        return { success: false, reason: '符咒不存在' };
    }
    
    // 应用符咒效果
    if (talisman.effect.type === 'serendipity_boost') {
        gameState.activeEffects.serendipity_boost += talisman.effect.value;
    }
    
    return { success: true, talisman: name, effect: talisman.effect };
}

/**
 * 触发奇遇 (MCP)
 */
function mcpTrigger(type) {
    return serendipityService.mcpTrigger(type);
}

/**
 * 更新因果 (MCP)
 */
function mcpKarmaUpdate(eventId, karmaDelta, reason) {
    return serendipityService.mcpKarmaUpdate(eventId, karmaDelta, reason);
}

// 导出
module.exports = {
    // Entities
    Serendipity,
    SerendipityNode,
    SuperNode,
    DAG,
    SERENDIPITY_EVENTS,
    SERENDIPITY_TALISMANS,
    
    // Services
    SerendipityService,
    serendipityService,
    SerendipityDAG,
    DAGExecutor,
    dagExecutor,
    
    // Helper functions
    createSerendipity,
    createDAG,
    initSerendipities,
    triggerRandomSerendipity,
    getSerendipityStatus,
    executeNode,
    handleBranch,
    getSerendipityProgress,
    recordKarma,
    queryKarma,
    queryFate,
    useTalisman,
    mcpTrigger,
    mcpKarmaUpdate
};