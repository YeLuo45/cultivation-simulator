/**
 * InventoryModule - 背包模块导出
 * 整合inventory领域的所有实体和服务
 */

// Entities
const { Item, ITEM_TYPES, ITEM_QUALITIES } = require('./entities/Item.js');
const { Equipment, EQUIPMENT_TYPES, EQUIPMENT_SLOTS, HEAVENLY_DAO_SET_BONUSES, ENHANCE_CONFIG } = require('./entities/Equipment.js');

// Services
const { InventoryService, inventoryService } = require('./services/InventoryService.js');
const { CraftService, craftService, ALCHEMY_RECIPES, FORGE_RECIPES, ADVANCED_FORGE_RECIPES, FURNACES, ANVILS, MATERIALS } = require('./services/CraftService.js');

/**
 * 创建物品实例
 */
function createItem(config) {
    return new Item(config);
}

/**
 * 创建装备实例
 */
function createEquipment(config) {
    return new Equipment(config);
}

/**
 * 初始化背包服务
 */
function initInventory(gameState) {
    return inventoryService.init(gameState);
}

/**
 * 添加物品到背包
 */
function addItemToInventory(gameState, type, name, quantity, quality, effect, desc, icon, star, grade, level, maxLevel) {
    return inventoryService.addItem(gameState, type, name, quantity, quality, effect, desc, icon, star, grade, level, maxLevel);
}

/**
 * 使用物品
 */
function useItem(gameState, name) {
    return inventoryService.useItem(gameState, name);
}

/**
 * 获取背包统计
 */
function getInventoryStats(gameState) {
    return inventoryService.getInventoryStats(gameState);
}

/**
 * 执行制造
 */
function doCraft(gameState, recipeName, craftType = 'alchemy') {
    craftService.selectCraftType(craftType);
    return craftService.doCraft(gameState, recipeName);
}

/**
 * 获取所有配方
 */
function getAllRecipes() {
    return craftService.getRecipes();
}

/**
 * 装备宝物
 */
function equipTreasure(gameState, item, idx) {
    return inventoryService.equipTreasure(gameState, item, idx);
}

/**
 * 扩展背包
 */
function expandInventorySlots(gameState, slots, cost) {
    return inventoryService.expandSlots(gameState, slots, cost);
}

// 导出
module.exports = {
    // Entities
    Item,
    ITEM_TYPES,
    ITEM_QUALITIES,
    Equipment,
    EQUIPMENT_TYPES,
    EQUIPMENT_SLOTS,
    HEAVENLY_DAO_SET_BONUSES,
    ENHANCE_CONFIG,
    
    // Services
    InventoryService,
    inventoryService,
    CraftService,
    craftService,
    
    // Recipes
    ALCHEMY_RECIPES,
    FORGE_RECIPES,
    ADVANCED_FORGE_RECIPES,
    FURNACES,
    ANVILS,
    MATERIALS,
    
    // Helper functions
    createItem,
    createEquipment,
    initInventory,
    addItemToInventory,
    useItem,
    getInventoryStats,
    doCraft,
    getAllRecipes,
    equipTreasure,
    expandInventorySlots
};