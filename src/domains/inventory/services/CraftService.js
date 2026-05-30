/**
 * CraftService - 制造服务
 * 管理炼丹、炼器等制造系统
 */

class CraftService {
    constructor() {
        this.selectedCraftType = 'alchemy'; // alchemy or forge
        this.selectedRecipeName = null;
    }

    /**
     * 初始化制造系统
     */
    init(gameState) {
        if (!gameState.crafting) {
            gameState.crafting = {
                furnace: { level: 1 },
                anvil: { level: 1 }
            };
        }
        return gameState;
    }

    /**
     * 选择制造类型 (alchemy/forge)
     */
    selectCraftType(type) {
        this.selectedCraftType = type;
        this.selectedRecipeName = null;
        return { success: true, type };
    }

    /**
     * 选择配方
     */
    selectRecipe(name) {
        this.selectedRecipeName = name;
        return { success: true, recipe: name };
    }

    /**
     * 检查配方材料是否足够
     */
    checkMaterialsForRecipe(gameState, recipe) {
        for (const [mat, qty] of Object.entries(recipe.materials)) {
            if (mat === '灵石') {
                if (gameState.spiritStones < qty) return false;
            } else {
                const hasItem = gameState.inventory.some(item =>
                    item.name === mat && item.quantity >= qty
                );
                if (!hasItem) return false;
            }
        }
        return true;
    }

    /**
     * 计算实际成功率
     */
    calculateSuccessRate(recipe, currentLevel) {
        const FURNACES = {
            '土炼丹炉': { level: 1, successBonus: 0 },
            '玄铁熔炉': { level: 2, successBonus: 0.15 },
            '天工神炉': { level: 3, successBonus: 0.30 }
        };
        const ANVILS = {
            '土炼器台': { level: 1, successBonus: 0 },
            '玄铁熔炉': { level: 2, successBonus: 0.15 },
            '天工神炉': { level: 3, successBonus: 0.30 }
        };

        const furnace = this.selectedCraftType === 'alchemy' ? FURNACES : ANVILS;
        const furnaceData = Object.values(furnace).find(f => f.level === currentLevel);
        const furnaceBonus = furnaceData ? furnaceData.successBonus : 0;
        
        return Math.min(0.95, recipe.successRate + furnaceBonus);
    }

    /**
     * 执行制造
     */
    doCraft(gameState, recipeName) {
        const recipes = this.selectedCraftType === 'alchemy' ? ALCHEMY_RECIPES : FORGE_RECIPES;
        const recipe = recipes[recipeName];
        
        if (!recipe) {
            return { success: false, reason: '配方不存在' };
        }

        // 检查材料
        const canCraft = this.checkMaterialsForRecipe(gameState, recipe);
        if (!canCraft) {
            return { success: false, reason: '材料不足' };
        }

        // 检查燃料费
        const hasFuel = gameState.spiritStones >= recipe.fuelCost;
        if (!hasFuel) {
            return { success: false, reason: '灵石不足(燃料)' };
        }

        // 消耗材料
        for (const [mat, qty] of Object.entries(recipe.materials)) {
            if (mat === '灵石') {
                gameState.spiritStones -= qty;
            } else {
                this.consumeMaterial(gameState, mat, qty);
            }
        }

        // 消耗燃料
        gameState.spiritStones -= recipe.fuelCost;

        // 计算成功率
        const currentLevel = gameState.crafting[this.selectedCraftType === 'alchemy' ? 'furnace' : 'anvil'].level;
        const successRate = this.calculateSuccessRate(recipe, currentLevel);

        // 判定成功
        const roll = Math.random();
        const success = roll < successRate;

        if (success) {
            // 制造成功
            const quality = this.getRecipeQuality(recipeName, recipe);
            let resultItem;

            if (this.selectedCraftType === 'alchemy') {
                // 丹药制造
                resultItem = {
                    type: 'pill',
                    name: recipeName,
                    quality,
                    effect: this.getPillEffect(recipeName),
                    desc: recipe.desc,
                    icon: recipe.icon || '💊'
                };
            } else {
                // 装备制造
                resultItem = {
                    type: 'treasure',
                    name: recipeName,
                    quality,
                    effect: recipe.effect || {},
                    desc: recipe.desc,
                    icon: recipe.icon || '⚔️'
                };
            }

            // 添加到背包
            const addResult = inventoryService.addItemObj(gameState, { ...resultItem, quantity: 1 });
            
            return {
                success: true,
                item: resultItem,
                quality,
                addResult
            };
        } else {
            // 制造失败
            return {
                success: false,
                reason: '炼制失败',
                materialsConsumed: true
            };
        }
    }

    /**
     * 消费材料
     */
    consumeMaterial(gameState, matName, qty) {
        let remaining = qty;
        for (let i = gameState.inventory.length - 1; i >= 0 && remaining > 0; i--) {
            const item = gameState.inventory[i];
            if (item.name === matName) {
                const consume = Math.min(item.quantity, remaining);
                item.quantity -= consume;
                remaining -= consume;
                if (item.quantity <= 0) {
                    gameState.inventory.splice(i, 1);
                }
            }
        }
    }

    /**
     * 获取配方品质
     */
    getRecipeQuality(name, recipe) {
        const rate = recipe.successRate;
        if (rate >= 0.7) return 'common';
        if (rate >= 0.5) return 'rare';
        if (rate >= 0.35) return 'precious';
        return 'legendary';
    }

    /**
     * 获取丹药效果
     */
    getPillEffect(name) {
        const effects = {
            '回气丹': { type: 'attackBoost', value: 0.2 },
            '护体丹': { type: 'defenseBoost', value: 0.2 },
            '破妄丹': { type: 'ignoreDefense', value: 1 },
            '回春丹': { type: 'heal', value: 0.3 }
        };
        return effects[name] || { type: 'unknown' };
    }

    /**
     * 选择炉/台
     */
    selectFurnace(name) {
        const furnace = this.selectedCraftType === 'alchemy' ? FURNACES : ANVILS;
        if (furnace[name]) {
            return { success: true, level: furnace[name].level };
        }
        return { success: false, reason: '炉/台不存在' };
    }

    /**
     * 升级炉/台
     */
    upgradeFurnace(gameState, name) {
        const furnace = this.selectedCraftType === 'alchemy' ? FURNACES : ANVILS;
        const data = furnace[name];
        
        if (!data) {
            return { success: false, reason: '炉/台不存在' };
        }

        if (gameState.spiritStones < data.cost) {
            return { success: false, reason: '灵石不足' };
        }

        gameState.spiritStones -= data.cost;
        gameState.crafting[this.selectedCraftType === 'alchemy' ? 'furnace' : 'anvil'].level = data.level;
        
        return { success: true, newLevel: data.level, cost: data.cost };
    }

    /**
     * 获取配方列表
     */
    getRecipes() {
        return {
            alchemy: Object.entries(ALCHEMY_RECIPES).map(([name, recipe]) => ({
                name,
                desc: recipe.desc,
                materials: recipe.materials,
                successRate: recipe.successRate,
                fuelCost: recipe.fuelCost,
                icon: recipe.icon
            })),
            forge: Object.entries(FORGE_RECIPES).map(([name, recipe]) => ({
                name,
                desc: recipe.desc,
                materials: recipe.materials,
                successRate: recipe.successRate,
                fuelCost: recipe.fuelCost,
                icon: recipe.icon,
                effect: recipe.effect
            }))
        };
    }

    /**
     * 获取当前炉/台等级
     */
    getCurrentLevel(gameState) {
        return gameState.crafting[this.selectedCraftType === 'alchemy' ? 'furnace' : 'anvil'].level;
    }
}

// 炼丹配方
const ALCHEMY_RECIPES = {
    '回气丹': { materials: { '灵草': 3 }, successRate: 0.80, fuelCost: 100, desc: '恢复20%灵力', icon: '💊' },
    '疗伤丹': { materials: { '灵草': 2, '妖兽血': 1 }, successRate: 0.75, fuelCost: 100, desc: '恢复30%生命', icon: '💊' },
    '聚灵丹': { materials: { '灵石': 100, '灵草': 5 }, successRate: 0.60, fuelCost: 100, desc: '修炼速度+20%，持续3天', icon: '💊' },
    '破境丹': { materials: { '灵石': 500, '天材': 2 }, successRate: 0.40, fuelCost: 100, desc: '突破瓶颈概率+15%', icon: '💊' },
    '渡劫丹': { materials: { '天材': 5, '灵石': 1000 }, successRate: 0.30, fuelCost: 100, desc: '渡劫成功率+10%', icon: '💊' },
    '洗髓丹': { materials: { '天材': 3, '灵石': 500 }, successRate: 0.50, fuelCost: 100, desc: '灵根刷新', icon: '💊' },
    '混沌丹': { materials: { '混沌石': 1, '天材': 10 }, successRate: 0.20, fuelCost: 100, desc: '保底混沌灵根', icon: '💊', requireChaos: true }
};

// 炼器配方
const FORGE_RECIPES = {
    '凡铁剑': { materials: { '玄铁': 5 }, successRate: 0.90, fuelCost: 200, effect: { type: 'attack', value: 0.05 }, desc: '攻击+5%', icon: '⚔️' },
    '青云剑': { materials: { '玄铁': 10, '天材': 1 }, successRate: 0.60, fuelCost: 200, effect: { type: 'attack', value: 0.15 }, desc: '攻击+15%', icon: '⚔️' },
    '混元珠': { materials: { '天材': 5, '灵石': 1000 }, successRate: 0.40, fuelCost: 200, effect: { type: 'crit', value: 0.10 }, desc: '暴击+10%', icon: '🔮' },
    '金缕衣': { materials: { '天材': 3, '妖兽皮': 5 }, successRate: 0.50, fuelCost: 200, effect: { type: 'hp', value: 0.10 }, desc: '生命+10%', icon: '👘' },
    '避火罩': { materials: { '天材': 2, '妖兽骨': 5 }, successRate: 0.45, fuelCost: 200, effect: { type: 'fireResist', value: 0.30 }, desc: '火抗+30%', icon: '🔥' },
    '定神珠': { materials: { '天材': 5, '灵石': 2000 }, successRate: 0.35, fuelCost: 200, effect: { type: 'mindset', value: 0.20 }, desc: '精神状态+20%', icon: '📿' }
};

// 高级炼器配方
const ADVANCED_FORGE_RECIPES = {
    '灵宝·苍穹印': { 
        materials: { '玄铁': 20, '天材': 5, '混沌石': 1 }, 
        fuelCost: 2000, 
        desc: '灵宝·攻击+25%', icon: '🔮', 
        effect: { type: 'attack', value: 0.25 }
    },
    '灵宝·玄武甲': { 
        materials: { '玄铁': 20, '天材': 5, '混沌石': 1 }, 
        fuelCost: 2000, 
        desc: '灵宝·防御+25%', icon: '🛡️', 
        effect: { type: 'defense', value: 0.25 }
    },
    '圣器·天使神剑': { 
        materials: { '天材': 10, '混沌石': 3 }, 
        fuelCost: 8000, 
        desc: '圣器·攻击+40%', icon: '⚔️', 
        effect: { type: 'attack', value: 0.40 }
    },
    '圣器·天使神甲': { 
        materials: { '天材': 10, '混沌石': 3 }, 
        fuelCost: 8000, 
        desc: '圣器·防御+40%', icon: '👘', 
        effect: { type: 'defense', value: 0.40 }
    },
    '圣器·天使神翼': { 
        materials: { '天材': 10, '混沌石': 3 }, 
        fuelCost: 8000, 
        desc: '圣器·全属性+15%', icon: '👼', 
        effect: { type: 'all_stats', value: 0.15 }
    },
    '天神器·天使神剑': { 
        materials: { '天材': 20, '混沌石': 8 }, 
        fuelCost: 20000, 
        desc: '天神器·攻击+60%', icon: '⚔️', 
        effect: { type: 'attack', value: 0.60 }
    },
    '天神器·天使神甲': { 
        materials: { '天材': 20, '混沌石': 8 }, 
        fuelCost: 20000, 
        desc: '天神器·防御+60%', icon: '👘', 
        effect: { type: 'defense', value: 0.60 }
    },
    '天神器·天使神翼': { 
        materials: { '天材': 20, '混沌石': 8 }, 
        fuelCost: 20000, 
        desc: '天神器·全属性+25%', icon: '👼', 
        effect: { type: 'all_stats', value: 0.25 }
    }
};

// 炉/台配置
const FURNACES = {
    '土炼丹炉': { level: 1, successBonus: 0, cost: 0, unlockCondition: '默认', desc: '基础炼丹炉' },
    '玄铁熔炉': { level: 2, successBonus: 0.15, cost: 80000, unlockCondition: '宗门2级或80000灵石', desc: '中级炼丹炉，成功率+15%' },
    '天工神炉': { level: 3, successBonus: 0.30, cost: 300000, unlockCondition: '化神期', desc: '高级炼丹炉，成功率+30%' }
};

const ANVILS = {
    '土炼器台': { level: 1, successBonus: 0, cost: 0, unlockCondition: '默认', desc: '基础炼器台' },
    '玄铁熔炉': { level: 2, successBonus: 0.15, cost: 80000, unlockCondition: '宗门2级或80000灵石', desc: '中级炼器台，成功率+15%' },
    '天工神炉': { level: 3, successBonus: 0.30, cost: 300000, unlockCondition: '化神期', desc: '高级炼器台，成功率+30%' }
};

// 材料配置
const MATERIALS = {
    '灵草': { type: 'herb', basePrice: 100, icon: '🌿', desc: '普通灵草，炼丹材料' },
    '妖兽血': { type: 'beast', basePrice: 200, icon: '🩸', desc: '妖兽血液，炼丹炼器材料' },
    '天材': { type: 'rare', basePrice: 500, icon: '✨', desc: '稀有天材，高级材料' },
    '混沌石': { type: 'legendary', basePrice: 1667, icon: '💎', desc: '混沌神石，传说材料', requireChaos: true },
    '玄铁': { type: 'metal', basePrice: 100, icon: '🔩', desc: '玄铁矿物，炼器材料' },
    '妖兽皮': { type: 'beast', basePrice: 180, icon: '🐾', desc: '妖兽皮毛，炼器材料' },
    '妖兽骨': { type: 'beast', basePrice: 220, icon: '🦴', desc: '妖兽骨骼，炼器材料' }
};

// 导出单例
const craftService = new CraftService();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        CraftService, 
        craftService,
        ALCHEMY_RECIPES, 
        FORGE_RECIPES, 
        ADVANCED_FORGE_RECIPES,
        FURNACES, 
        ANVILS,
        MATERIALS
    };
}