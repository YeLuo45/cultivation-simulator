/**
 * InventoryService - 背包服务
 * 管理玩家物品、背包容量、物品操作等
 */

class InventoryService {
    constructor() {
        this.maxSlots = 20;
        this.inventory = [];
    }

    /**
     * 初始化背包
     */
    init(gameState) {
        if (!gameState.inventory) {
            gameState.inventory = [];
        }
        if (!gameState.maxInventorySlots) {
            gameState.maxInventorySlots = 20;
        }
        if (!gameState.equippedTreasures) {
            gameState.equippedTreasures = [null, null, null, null];
        }
        this.maxSlots = gameState.maxInventorySlots;
        this.inventory = gameState.inventory;
        return gameState;
    }

    /**
     * 添加物品到背包
     */
    addItem(gameState, type, name, quantity, quality, effect, desc, icon, star, grade, level, maxLevel) {
        // 查找是否已存在同类型物品
        const existing = gameState.inventory.find(item => item.name === name && item.type === type);
        
        if (existing) {
            existing.quantity += quantity;
            return { success: true, added: quantity, total: existing.quantity };
        } else {
            // 检查背包是否已满
            if (gameState.inventory.length >= gameState.maxInventorySlots) {
                return { success: false, reason: '背包已满' };
            }

            const itemObj = {
                id: Date.now().toString(),
                type,
                name,
                quantity,
                quality,
                effect: effect || {},
                desc: desc || '',
                icon: icon || '📦',
                star: star || 1
            };

            // 功法额外字段
            if (type === 'technique') {
                itemObj.grade = grade !== undefined ? grade : 0;
                itemObj.level = level || 1;
                itemObj.maxLevel = maxLevel || 5;
            }

            gameState.inventory.push(itemObj);
            return { success: true, added: quantity, total: quantity };
        }
    }

    /**
     * 添加物品对象到背包
     */
    addItemObj(gameState, itemObj) {
        const existing = gameState.inventory.find(i => i.name === itemObj.name && i.type === itemObj.type);
        
        if (existing) {
            existing.quantity += itemObj.quantity;
            return { success: true, added: itemObj.quantity };
        } else {
            if (gameState.inventory.length >= gameState.maxInventorySlots) {
                return { success: false, reason: '背包已满' };
            }
            
            gameState.inventory.push({
                id: Date.now().toString(),
                type: itemObj.type,
                name: itemObj.name,
                quantity: itemObj.quantity,
                quality: itemObj.quality || 'common',
                effect: itemObj.effect || {},
                desc: itemObj.desc || '',
                icon: itemObj.icon || '📦',
                star: itemObj.star || 1
            });
            return { success: true, added: itemObj.quantity };
        }
    }

    /**
     * 移除物品
     */
    removeItem(gameState, name, quantity) {
        const idx = gameState.inventory.findIndex(i => i.name === name);
        if (idx !== -1) {
            gameState.inventory[idx].quantity -= quantity;
            if (gameState.inventory[idx].quantity <= 0) {
                gameState.inventory.splice(idx, 1);
            }
            return { success: true, removed: quantity };
        }
        return { success: false, reason: '物品不存在' };
    }

    /**
     * 按ID移除物品
     */
    removeItemById(gameState, itemId, quantity = 1) {
        const idx = gameState.inventory.findIndex(i => i.id === itemId);
        if (idx !== -1) {
            const item = gameState.inventory[idx];
            const removeQty = Math.min(quantity, item.quantity);
            item.quantity -= removeQty;
            if (item.quantity <= 0) {
                gameState.inventory.splice(idx, 1);
            }
            return { success: true, removed: removeQty };
        }
        return { success: false, reason: '物品不存在' };
    }

    /**
     * 使用物品
     */
    useItem(gameState, name) {
        const idx = gameState.inventory.findIndex(i => i.name === name);
        if (idx === -1) {
            return { success: false, reason: '物品不存在' };
        }

        const item = gameState.inventory[idx];
        if (item.quantity <= 0) {
            return { success: false, reason: '物品数量不足' };
        }

        // 根据物品类型处理
        switch (item.type) {
            case 'pill':
                return this.usePill(gameState, item, idx);
            case 'treasure':
                return this.equipTreasure(gameState, item, idx);
            default:
                return { success: false, reason: '此物品无法使用' };
        }
    }

    /**
     * 使用丹药
     */
    usePill(gameState, item, idx) {
        const PILLS = {
            '聚灵丹': { effect: { type: 'qi', value: 50 } },
            '心魔丹': { effect: { type: 'mindset', value: 30 } },
            '金髓丹': { effect: { type: 'qi', value: 200 } },
            '筑基丹': { effect: { type: 'breakthrough_boost', value: 0.2 } },
            '破境丹': { effect: { type: 'breakthrough_boost', value: 0.3 } },
            '洗髓丹': { effect: { type: 'cultivate_speed', value: 0.1 } },
            '定神丹': { effect: { type: '渡劫_mindset_protect', value: 0.5 } }
        };

        const pill = PILLS[item.name];
        if (!pill) {
            return { success: false, reason: '未知丹药' };
        }

        // 消耗物品
        item.quantity--;
        if (item.quantity <= 0) {
            gameState.inventory.splice(idx, 1);
        }

        // 应用效果
        switch (pill.effect.type) {
            case 'qi':
                gameState.qi = Math.min(gameState.maxQi, gameState.qi + pill.effect.value);
                break;
            case 'mindset':
                gameState.mindset = Math.min(100, gameState.mindset + pill.effect.value);
                break;
            case 'breakthrough_boost':
            case 'cultivate_speed':
            case '渡劫_mindset_protect':
                gameState.activeEffects[pill.effect.type] += pill.effect.value;
                break;
        }

        return { success: true, pill: item.name, effect: pill.effect };
    }

    /**
     * 装备宝物
     */
    equipTreasure(gameState, item, idx) {
        // 找到空槽位
        const emptySlot = gameState.equippedTreasures.findIndex(t => t === null);
        if (emptySlot === -1) {
            return { success: false, reason: '装备栏已满' };
        }

        // 保留星级
        const star = item.star || 1;
        
        // 消耗物品
        item.quantity--;
        if (item.quantity <= 0) {
            gameState.inventory.splice(idx, 1);
        }

        // 装备到槽位
        gameState.equippedTreasures[emptySlot] = {
            name: item.name,
            type: item.type,
            quality: item.quality,
            effect: item.effect,
            desc: item.desc,
            icon: item.icon,
            star
        };

        return { success: true, slot: emptySlot, treasure: item.name };
    }

    /**
     * 出售物品
     */
    sellItem(gameState, idx) {
        let items = gameState.inventory;
        const item = items[idx];
        if (!item) {
            return { success: false, reason: '物品不存在' };
        }

        const sellPrice = this.getSellPrice(item);
        gameState.spiritStones = (gameState.spiritStones || 0) + sellPrice;
        
        // 移除物品
        item.quantity--;
        if (item.quantity <= 0) {
            items.splice(idx, 1);
        }

        return { success: true, sold: item.name, price: sellPrice };
    }

    /**
     * 丢弃物品
     */
    discardItem(gameState, idx) {
        const items = gameState.inventory;
        if (idx < 0 || idx >= items.length) {
            return { success: false, reason: '物品不存在' };
        }

        const item = items[idx];
        items.splice(idx, 1);
        return { success: true, discarded: item.name };
    }

    /**
     * 获取物品出售价格
     */
    getSellPrice(item) {
        const basePrices = {
            'common': 10,
            'rare': 50,
            'precious': 200,
            'legendary': 1000,
            'ultimate': 5000
        };
        return basePrices[item.quality] || 10;
    }

    /**
     * 获取背包统计信息
     */
    getInventoryStats(gameState) {
        const items = gameState.inventory || [];
        const stats = {
            totalItems: items.length,
            totalSlots: gameState.maxInventorySlots,
            usedSlots: items.length,
            freeSlots: gameState.maxInventorySlots - items.length,
            byType: {},
            byQuality: {}
        };

        for (const item of items) {
            // 按类型统计
            stats.byType[item.type] = (stats.byType[item.type] || 0) + item.quantity;
            
            // 按品质统计
            stats.byQuality[item.quality] = (stats.byQuality[item.quality] || 0) + 1;
        }

        return stats;
    }

    /**
     * 获取指定类型的物品
     */
    getItemsByType(gameState, type) {
        return gameState.inventory.filter(item => item.type === type);
    }

    /**
     * 获取指定品质的物品
     */
    getItemsByQuality(gameState, quality) {
        return gameState.inventory.filter(item => item.quality === quality);
    }

    /**
     * 扩展背包容量
     */
    expandSlots(gameState, additionalSlots, cost) {
        if ((gameState.spiritStones || 0) < cost) {
            return { success: false, reason: '灵石不足' };
        }

        gameState.spiritStones -= cost;
        gameState.maxInventorySlots += additionalSlots;
        
        return { 
            success: true, 
            newSlots: gameState.maxInventorySlots,
            cost 
        };
    }

    /**
     * 整理背包
     */
    organizeInventory(gameState) {
        // 合并相同物品
        const merged = {};
        const result = [];

        for (const item of gameState.inventory) {
            const key = `${item.name}_${item.type}`;
            if (merged[key]) {
                merged[key].quantity += item.quantity;
            } else {
                merged[key] = { ...item };
                result.push(merged[key]);
            }
        }

        gameState.inventory = result;
        return { success: true, itemCount: result.length };
    }

    /**
     * 检查物品是否足够
     */
    hasItem(gameState, name, quantity = 1) {
        const item = gameState.inventory.find(i => i.name === name);
        return item && item.quantity >= quantity;
    }

    /**
     * 获取物品数量
     */
    getItemCount(gameState, name) {
        const item = gameState.inventory.find(i => i.name === name);
        return item ? item.quantity : 0;
    }

    /**
     * 清空背包
     */
    clearInventory(gameState) {
        gameState.inventory = [];
        return { success: true };
    }
}

// 导出单例
const inventoryService = new InventoryService();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InventoryService, inventoryService };
}