/**
 * CultivationModule.js - 修炼模块导出
 * 整合 cultivation 领域的所有实体和服务
 */

const { CultivationEntity } = require('./entities/CultivationEntity');
const { SpiritRootEntity, TIER_MAP, ROOT_TYPES, ROOT_TYPE_NAMES, TIER_BONUSES } = require('./entities/SpiritRootEntity');
const { CultivationService, TRIBULATIONS, BLESSING_TYPES } = require('./services/CultivationService');

/**
 * 创建修炼模块实例
 * @param {Object} gameState - 游戏状态对象 (window.gameState)
 */
function createCultivationModule(gameState) {
    const cultivationService = new CultivationService(gameState);
    
    return {
        // 实体
        CultivationEntity,
        SpiritRootEntity,
        TIER_MAP,
        ROOT_TYPES,
        ROOT_TYPE_NAMES,
        TIER_BONUSES,
        
        // 服务
        cultivationService,
        
        // 配置
        TRIBULATIONS,
        BLESSING_TYPES,
        
        // 便捷方法 - 修炼
        meditate: (amount) => cultivationService.meditate(amount),
        breakthrough: () => cultivationService.breakthrough(),
        executeTribulation: () => cultivationService.executeTribulation(),
        tribulationLightning: (damage, resisted) => cultivationService.tribulationLightning(damage, resisted),
        startTribulation: (targetRealm) => cultivationService.startTribulation(targetRealm),
        getTribulationProgress: () => cultivationService.getTribulationProgress(),
        advance: (action) => cultivationService.advance(action),
        
        // 便捷方法 - 祝福
        receiveBlessing: (type) => cultivationService.receiveBlessing(type),
        getBlessings: () => cultivationService.getBlessings(),
        
        // 便捷方法 - 灵根
        evolveSpiritRoot: (rootType) => cultivationService.evolveSpiritRoot(rootType),
        querySpiritRoot: (detail) => cultivationService.querySpiritRoot(detail),
        
        // 便捷方法 - 状态
        getSummary: () => cultivationService.getSummary(),
        getCultivationEntity: () => cultivationService.getCultivationEntity(),
        getSpiritRootEntity: () => cultivationService.getSpiritRootEntity()
    };
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createCultivationModule, CultivationEntity, SpiritRootEntity, CultivationService, TIER_MAP, ROOT_TYPES, ROOT_TYPE_NAMES, TIER_BONUSES, TRIBULATIONS, BLESSING_TYPES };
} else {
    // 浏览器环境
    window.CultivationModule = {
        createCultivationModule,
        CultivationEntity,
        SpiritRootEntity,
        CultivationService,
        TIER_MAP,
        ROOT_TYPES,
        ROOT_TYPE_NAMES,
        TIER_BONUSES,
        TRIBULATIONS,
        BLESSING_TYPES
    };
}