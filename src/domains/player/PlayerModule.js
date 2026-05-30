/**
 * PlayerModule.js - 玩家模块导出
 * 整合 player 领域的所有实体和服务
 */

const { PlayerEntity, REALMS, STAGES, STAGE_NAMES } = require('./entities/PlayerEntity');
const { PlayerService } = require('./services/PlayerService');

/**
 * 创建玩家模块实例
 * @param {Object} gameState - 游戏状态对象 (window.gameState)
 */
function createPlayerModule(gameState) {
    const playerService = new PlayerService(gameState);
    
    return {
        // 实体
        PlayerEntity,
        REALMS,
        STAGES,
        STAGE_NAMES,
        
        // 服务
        playerService,
        
        // 便捷方法
        getPlayerInfo: () => playerService.getPlayerInfo(),
        addSpiritStones: (amount) => playerService.addSpiritStones(amount),
        spendSpiritStones: (amount) => playerService.spendSpiritStones(amount),
        addQi: (amount) => playerService.addQi(amount),
        spendQi: (amount) => playerService.spendQi(amount),
        advanceRealm: () => playerService.advanceRealm(),
        advanceStage: () => playerService.advanceStage(),
        addLevel: (amount) => playerService.addLevel(amount),
        addReputation: (amount) => playerService.addReputation(amount),
        addKarmaPoints: (amount) => playerService.addKarmaPoints(amount),
        addCultivationProgress: (amount) => playerService.addCultivationProgress(amount),
        addCultivationXP: (amount) => playerService.addCultivationXP(amount),
        addItem: (item) => playerService.addItem(item),
        removeItem: (itemId, quantity) => playerService.removeItem(itemId, quantity),
        setEquipment: (slot, equipment) => playerService.setEquipment(slot, equipment),
        getEquipment: (slot) => playerService.getEquipment(slot),
        addWin: () => playerService.addWin(),
        addLoss: () => playerService.addLoss(),
        reset: () => playerService.reset(),
        getStateSummary: () => playerService.getStateSummary(),
        
        // 获取玩家实体
        getPlayerEntity: () => playerService.getPlayerEntity()
    };
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createPlayerModule, PlayerEntity, PlayerService, REALMS, STAGES, STAGE_NAMES };
} else {
    // 浏览器环境
    window.PlayerModule = {
        createPlayerModule,
        PlayerEntity,
        PlayerService,
        REALMS,
        STAGES,
        STAGE_NAMES
    };
}