/**
 * TalentTreeService.js - 天赋树+精通系统
 * V224 Direction P: 灵根天赋系统
 * 
 * 功能：
 * 1. 天赋树系统 - 4分支 x 5层
 * 2. 元素精通系统 - 6元素 x 6等级
 * 3. Hook机制 - 灵根变化触发钩子
 * 4. 6个MCP工具
 */

import { SpiritRootEntity, TIER_MAP, ROOT_TYPES } from '../entities/SpiritRootEntity.js';

// ===== 常量定义 =====

/**
 * 天赋分支类型
 */
const TALENT_BRANCHES = ['attack', 'defense', 'cultivation', 'perception'];

/**
 * 天赋分支中文名
 */
const BRANCH_NAMES = {
    attack: '攻击',
    defense: '防御',
    cultivation: '修炼',
    perception: '感知'
};

/**
 * 天赋每层所需点数
 */
const POINTS_PER_LAYER = [1, 2, 3, 4, 5]; // 第1-5层所需点数

/**
 * 天赋层效果
 */
const LAYER_EFFECTS = {
    attack: [
        { attack: 5 },      // 层1: 攻击+5
        { attack: 10 },    // 层2: 攻击+10
        { attack: 15 },    // 层3: 攻击+15
        { attack: 25 },    // 层4: 攻击+25
        { attack: 40 }    // 层5: 攻击+40
    ],
    defense: [
        { defense: 5 },    // 层1: 防御+5
        { defense: 10 },   // 层2: 防御+10
        { defense: 15 },  // 层3: 防御+15
        { defense: 25 },  // 层4: 防御+25
        { defense: 40 }  // 层5: 防御+40
    ],
    cultivation: [
        { cultivationSpeed: 5 },   // 层1: 修炼速度+5%
        { cultivationSpeed: 10 },  // 层2: 修炼速度+10%
        { cultivationSpeed: 15 }, // 层3: 修炼速度+15%
        { cultivationSpeed: 25 }, // 层4: 修炼速度+25%
        { cultivationSpeed: 40 }  // 层5: 修炼速度+40%
    ],
    perception: [
        { critRate: 2 },    // 层1: 暴击率+2%
        { critRate: 4 },    // 层2: 暴击率+4%
        { critRate: 6 },    // 层3: 暴击率+6%
        { critRate: 10 },   // 层4: 暴击率+10%
        { critRate: 15 }   // 层5: 暴击率+15%
    ]
};

/**
 * 元素精通类型
 */
const MASTERY_ELEMENTS = ['metal', 'wood', 'water', 'fire', 'earth', 'thunder'];

/**
 * 元素中文名
 */
const ELEMENT_NAMES = {
    metal: '金',
    wood: '木',
    water: '水',
    fire: '火',
    earth: '土',
    thunder: '雷'
};

/**
 * 精通等级定义
 */
const MASTERY_LEVELS = ['novice', 'apprentice', 'journeyman', 'expert', 'master', 'grandmaster'];

/**
 * 精通等级中文名
 */
const MASTERY_LEVEL_NAMES = {
    novice: '初窥',
    apprentice: '入门',
    journeyman: '熟练',
    expert: '精通',
    master: '大师',
    grandmaster: '宗师'
};

/**
 * 精通等级所需经验值
 */
const MASTERY_EXP_PER_LEVEL = [0, 100, 300, 600, 1000, 1500]; // 累计经验值

/**
 * 精通效果倍率
 */
const MASTERY_EFFECT_MULTIPLIERS = {
    novice: 0.5,
    apprentice: 1.0,
    journeyman: 1.5,
    expert: 2.0,
    master: 3.0,
    grandmaster: 5.0
};

/**
 * 重置天赋所需道具
 */
const TALENT_RESET_ITEM = '洗髓丹';

// ===== 天赋树数据结构 =====

/**
 * 创建初始天赋数据
 */
function createInitialTalentData() {
    const talentTree = {};
    for (const branch of TALENT_BRANCHES) {
        talentTree[branch] = {
            points: 0,      // 已投入点数
            layers: 0       // 已解锁层数 (0-5)
        };
    }
    
    return {
        talentTree,
        talentPoints: 0,           // 可用天赋点
        totalTalentPointsEarned: 0  // 累计获得天赋点
    };
}

/**
 * 创建初始精通数据
 */
function createInitialMasteryData() {
    const mastery = {};
    for (const element of MASTERY_ELEMENTS) {
        mastery[element] = {
            level: 0,           // 0-5 (novice-grandmaster)
            exp: 0,             // 当前经验值
            totalExpEarned: 0   // 累计获得经验值
        };
    }
    
    return {
        mastery,
        lastUpdateTime: Date.now()
    };
}

// ===== TalentTreeService 类 =====

/**
 * 天赋树服务类
 */
class TalentTreeService {
    constructor(gameState) {
        this.gameState = gameState;
        this.hooks = new Map();  // hookId -> { type, callback, enabled }
        this.hookIdCounter = 0;
        
        // 初始化数据
        this.initializeData();
    }

    /**
     * 初始化天赋和精通数据
     */
    initializeData() {
        if (!this.gameState.talentData) {
            this.gameState.talentData = createInitialTalentData();
        }
        if (!this.gameState.masteryData) {
            this.gameState.masteryData = createInitialMasteryData();
        }
    }

    /**
     * 获取天赋数据
     */
    getTalentData() {
        return this.gameState.talentData;
    }

    /**
     * 获取精通数据
     */
    getMasteryData() {
        return this.gameState.masteryData;
    }

    // ===== 天赋点获取 =====

    /**
     * 获得天赋点
     * @param {number} amount - 获得数量
     * @param {string} reason - 原因 (levelup/breakthrough/reward)
     */
    gainTalentPoints(amount, reason = 'reward') {
        const talentData = this.getTalentData();
        talentData.talentPoints += amount;
        talentData.totalTalentPointsEarned += amount;
        
        this.triggerHook('talentPointsGained', {
            amount,
            reason,
            totalPoints: talentData.talentPoints,
            totalEarned: talentData.totalTalentPointsEarned
        });
        
        return {
            success: true,
            gained: amount,
            reason,
            availablePoints: talentData.talentPoints,
            totalEarned: talentData.totalTalentPointsEarned
        };
    }

    /**
     * 消耗天赋点
     * @param {number} amount - 消耗数量
     */
    consumeTalentPoints(amount) {
        const talentData = this.getTalentData();
        if (talentData.talentPoints < amount) {
            return {
                success: false,
                error: '天赋点不足',
                required: amount,
                available: talentData.talentPoints
            };
        }
        
        talentData.talentPoints -= amount;
        return { success: true, consumed: amount, remaining: talentData.talentPoints };
    }

    // ===== 天赋树操作 =====

    /**
     * 分配天赋点
     * @param {string} branch - 分支 (attack/defense/cultivation/perception)
     * @param {number} layer - 层 (1-5)
     */
    allocateTalent(branch, layer) {
        // 验证分支
        if (!TALENT_BRANCHES.includes(branch)) {
            return { success: false, error: `无效分支: ${branch}` };
        }
        
        // 验证层
        if (layer < 1 || layer > 5) {
            return { success: false, error: '层数必须在1-5之间' };
        }
        
        const talentData = this.getTalentData();
        const branchData = talentData.talentTree[branch];
        
        // 检查是否已解锁该层
        if (branchData.layers >= layer) {
            return { success: false, error: `分支 ${branch} 的第 ${layer} 层已解锁` };
        }
        
        // 检查是否满足前置条件 (必须先解锁前一层的第1点)
        if (layer > 1 && branchData.layers < layer - 1) {
            return { success: false, error: `必须先解锁第 ${layer - 1} 层` };
        }
        
        // 计算所需点数
        const pointsNeeded = POINTS_PER_LAYER[layer - 1];
        
        // 检查天赋点是否足够
        if (talentData.talentPoints < pointsNeeded) {
            return {
                success: false,
                error: '天赋点不足',
                required: pointsNeeded,
                available: talentData.talentPoints
            };
        }
        
        // 消耗天赋点
        const consumeResult = this.consumeTalentPoints(pointsNeeded);
        if (!consumeResult.success) {
            return consumeResult;
        }
        
        // 增加分支点数和层数
        branchData.points += pointsNeeded;
        branchData.layers = layer;
        
        const effect = LAYER_EFFECTS[branch][layer - 1];
        
        this.triggerHook('talentAllocated', {
            branch,
            layer,
            pointsUsed: pointsNeeded,
            effect,
            totalPoints: branchData.points,
            totalLayers: branchData.layers
        });
        
        return {
            success: true,
            branch,
            layer,
            pointsUsed: pointsNeeded,
            effect,
            remainingPoints: talentData.talentPoints,
            totalPoints: branchData.points,
            totalLayers: branchData.layers
        };
    }

    /**
     * 重置天赋树
     * @param {boolean} hasItem - 是否有洗髓丹
     */
    resetTalentTree(hasItem = false) {
        if (!hasItem) {
            // 检查背包是否有洗髓丹
            const inventory = this.gameState.inventory?.items || [];
            const resetItemIndex = inventory.findIndex(item => item.name === TALENT_RESET_ITEM);
            if (resetItemIndex === -1) {
                return {
                    success: false,
                    error: `需要 ${TALENT_RESET_ITEM} 才能重置天赋树`
                };
            }
            // 消耗道具
            inventory.splice(resetItemIndex, 1);
        }
        
        const talentData = this.getTalentData();
        const oldTree = JSON.parse(JSON.stringify(talentData.talentTree));
        
        // 重置所有分支
        for (const branch of TALENT_BRANCHES) {
            talentData.talentTree[branch] = {
                points: 0,
                layers: 0
            };
        }
        
        this.triggerHook('talentReset', {
            oldTree,
            newTree: talentData.talentTree
        });
        
        return {
            success: true,
            message: '天赋树已重置',
            itemConsumed: hasItem
        };
    }

    /**
     * 查询天赋树状态
     */
    queryTalentTree() {
        const talentData = this.getTalentData();
        
        const treeStatus = {};
        for (const branch of TALENT_BRANCHES) {
            const branchData = talentData.talentTree[branch];
            const effects = [];
            
            for (let i = 0; i < branchData.layers; i++) {
                effects.push(LAYER_EFFECTS[branch][i]);
            }
            
            treeStatus[branch] = {
                name: BRANCH_NAMES[branch],
                points: branchData.points,
                layers: branchData.layers,
                maxLayers: 5,
                effects,
                nextLayerCost: branchData.layers < 5 ? POINTS_PER_LAYER[branchData.layers] : null,
                nextLayerEffect: branchData.layers < 5 ? LAYER_EFFECTS[branch][branchData.layers] : null
            };
        }
        
        return {
            success: true,
            availablePoints: talentData.talentPoints,
            totalEarnedPoints: talentData.totalTalentPointsEarned,
            tree: treeStatus
        };
    }

    // ===== 元素精通操作 =====

    /**
     * 获得精通经验
     * @param {string} element - 元素类型
     * @param {number} exp - 经验值
     */
    gainMasteryExp(element, exp) {
        if (!MASTERY_ELEMENTS.includes(element)) {
            return { success: false, error: `无效元素: ${element}` };
        }
        
        const masteryData = this.getMasteryData();
        const elementData = masteryData.mastery[element];
        
        const oldLevel = elementData.level;
        elementData.exp += exp;
        elementData.totalExpEarned += exp;
        
        // 检查是否可以升级
        let leveledUp = false;
        while (elementData.level < 5 && elementData.exp >= MASTERY_EXP_PER_LEVEL[elementData.level + 1]) {
            elementData.level++;
            leveledUp = true;
        }
        
        const newLevel = elementData.level;
        
        if (leveledUp) {
            this.triggerHook('masteryLevelUp', {
                element,
                oldLevel,
                newLevel,
                newLevelName: MASTERY_LEVEL_NAMES[MASTERY_LEVELS[newLevel]]
            });
        }
        
        return {
            success: true,
            element,
            expGained: exp,
            currentExp: elementData.exp,
            currentLevel: newLevel,
            currentLevelName: MASTERY_LEVEL_NAMES[MASTERY_LEVELS[newLevel]],
            leveledUp,
            nextLevelExp: newLevel < 5 ? MASTERY_EXP_PER_LEVEL[newLevel + 1] : null
        };
    }

    /**
     * 升级精通等级
     * @param {string} element - 元素类型
     */
    upgradeMastery(element) {
        if (!MASTERY_ELEMENTS.includes(element)) {
            return { success: false, error: `无效元素: ${element}` };
        }
        
        const masteryData = this.getMasteryData();
        const elementData = masteryData.mastery[element];
        
        if (elementData.level >= 5) {
            return {
                success: false,
                error: '已达到最高精通等级',
                currentLevel: elementData.level,
                currentLevelName: MASTERY_LEVEL_NAMES[MASTERY_LEVELS[elementData.level]]
            };
        }
        
        const currentLevelExp = MASTERY_EXP_PER_LEVEL[elementData.level];
        const nextLevelExp = MASTERY_EXP_PER_LEVEL[elementData.level + 1];
        const expNeeded = nextLevelExp - currentLevelExp;
        
        if (elementData.exp < expNeeded) {
            return {
                success: false,
                error: '经验值不足',
                required: expNeeded,
                available: elementData.exp
            };
        }
        
        const oldLevel = elementData.level;
        elementData.exp -= expNeeded;
        elementData.level++;
        
        this.triggerHook('masteryUpgraded', {
            element,
            oldLevel,
            newLevel: elementData.level,
            newLevelName: MASTERY_LEVEL_NAMES[MASTERY_LEVELS[elementData.level]]
        });
        
        return {
            success: true,
            element,
            newLevel: elementData.level,
            newLevelName: MASTERY_LEVEL_NAMES[MASTERY_LEVELS[elementData.level]],
            effectMultiplier: MASTERY_EFFECT_MULTIPLIERS[MASTERY_LEVELS[elementData.level]]
        };
    }

    /**
     * 查询元素精通
     * @param {string} element - 元素类型 (可选，不传则查询全部)
     */
    queryMastery(element = null) {
        const masteryData = this.getMasteryData();
        
        if (element) {
            if (!MASTERY_ELEMENTS.includes(element)) {
                return { success: false, error: `无效元素: ${element}` };
            }
            
            const elementData = masteryData.mastery[element];
            return {
                success: true,
                element,
                level: elementData.level,
                levelName: MASTERY_LEVEL_NAMES[MASTERY_LEVELS[elementData.level]],
                exp: elementData.exp,
                totalExpEarned: elementData.totalExpEarned,
                effectMultiplier: MASTERY_EFFECT_MULTIPLIERS[MASTERY_LEVELS[elementData.level]],
                nextLevelExp: elementData.level < 5 ? MASTERY_EXP_PER_LEVEL[elementData.level + 1] : null
            };
        }
        
        // 返回所有元素精通
        const allMastery = {};
        for (const elem of MASTERY_ELEMENTS) {
            const elementData = masteryData.mastery[elem];
            allMastery[elem] = {
                name: ELEMENT_NAMES[elem],
                level: elementData.level,
                levelName: MASTERY_LEVEL_NAMES[MASTERY_LEVELS[elementData.level]],
                exp: elementData.exp,
                effectMultiplier: MASTERY_EFFECT_MULTIPLIERS[MASTERY_LEVELS[elementData.level]],
                progress: elementData.level < 5 
                    ? ((elementData.exp / MASTERY_EXP_PER_LEVEL[elementData.level + 1]) * 100).toFixed(1) + '%'
                    : '100%'
            };
        }
        
        return {
            success: true,
            mastery: allMastery
        };
    }

    // ===== Hook系统 =====

    /**
     * 注册钩子
     * @param {string} type - 钩子类型
     * @param {Function} callback - 回调函数
     */
    registerHook(type, callback) {
        const hookId = ++this.hookIdCounter;
        this.hooks.set(hookId, {
            type,
            callback,
            enabled: true
        });
        
        return {
            success: true,
            hookId,
            type,
            message: `已注册钩子: ${type}`
        };
    }

    /**
     * 注销钩子
     * @param {number} hookId - 钩子ID
     */
    unregisterHook(hookId) {
        if (!this.hooks.has(hookId)) {
            return { success: false, error: `钩子不存在: ${hookId}` };
        }
        
        const hook = this.hooks.get(hookId);
        this.hooks.delete(hookId);
        
        return {
            success: true,
            message: `已注销钩子: ${hook.type}`
        };
    }

    /**
     * 触发钩子
     * @param {string} type - 钩子类型
     * @param {object} data - 传递给回调的数据
     */
    triggerHook(type, data) {
        const triggeredHooks = [];
        
        for (const [hookId, hook] of this.hooks) {
            if (hook.type === type && hook.enabled) {
                try {
                    hook.callback(data);
                    triggeredHooks.push(hookId);
                } catch (e) {
                    console.error(`[TalentTree] Hook error: ${type}`, e);
                }
            }
        }
        
        return triggeredHooks;
    }

    /**
     * 获取所有已注册的钩子
     */
    listHooks() {
        const hookList = [];
        for (const [hookId, hook] of this.hooks) {
            hookList.push({
                hookId,
                type: hook.type,
                enabled: hook.enabled
            });
        }
        return hookList;
    }

    // ===== 工具方法 =====

    /**
     * 根据灵根类型和品级计算天赋点奖励
     */
    calculateTalentPointsReward() {
        const spiritRoot = this.gameState.spiritRoot || { type: 'wood', tier: 1 };
        const tier = spiritRoot.tier || 1;
        
        // 天赋点 = 品级 * 2 + 境界 * 1
        const realm = this.gameState.realm || 0;
        return tier * 2 + realm;
    }

    /**
     * 获取当前所有加成效果汇总
     */
    getAllBonuses() {
        const talentData = this.getTalentData();
        const bonuses = {
            attack: 0,
            defense: 0,
            cultivationSpeed: 0,
            critRate: 0
        };
        
        // 累加天赋树效果
        for (const branch of TALENT_BRANCHES) {
            const branchData = talentData.talentTree[branch];
            for (let i = 0; i < branchData.layers; i++) {
                const effect = LAYER_EFFECTS[branch][i];
                for (const [key, value] of Object.entries(effect)) {
                    if (bonuses[key] !== undefined) {
                        bonuses[key] += value;
                    }
                }
            }
        }
        
        // 累加灵根基础加成
        const spiritRoot = new SpiritRootEntity(this.gameState.spiritRoot);
        const rootBonuses = spiritRoot.getBonuses();
        for (const [key, value] of Object.entries(rootBonuses)) {
            if (bonuses[key] !== undefined) {
                bonuses[key] += value;
            }
        }
        
        return bonuses;
    }

    /**
     * 获取精通加成倍率
     * @param {string} element - 元素类型
     */
    getMasteryMultiplier(element) {
        if (!MASTERY_ELEMENTS.includes(element)) {
            return 1.0;
        }
        
        const masteryData = this.getMasteryData();
        const level = masteryData.mastery[element].level;
        return MASTERY_EFFECT_MULTIPLIERS[MASTERY_LEVELS[level]];
    }

    /**
     * 序列化数据 (用于保存)
     */
    serialize() {
        const hookData = [];
        for (const [hookId, hook] of this.hooks) {
            hookData.push({ hookId, type: hook.type, enabled: hook.enabled });
        }
        
        return {
            talentData: this.gameState.talentData,
            masteryData: this.gameState.masteryData,
            hookIdCounter: this.hookIdCounter,
            registeredHooks: hookData
        };
    }

    /**
     * 从存档恢复
     */
    deserialize(data) {
        if (data.talentData) {
            this.gameState.talentData = data.talentData;
        }
        if (data.masteryData) {
            this.gameState.masteryData = data.masteryData;
        }
        if (data.hookIdCounter) {
            this.hookIdCounter = data.hookIdCounter;
        }
    }
}

// ===== MCP工具接口 =====

/**
 * 创建MCP工具处理器
 */
function createTalentTreeMCPHandlers(gameState) {
    const service = new TalentTreeService(gameState);
    
    return {
        /**
         * spirit.talent.allocate - 分配天赋点
         */
        'spirit.talent.allocate': (params) => {
            const { branch, layer } = params || {};
            return service.allocateTalent(branch, layer);
        },
        
        /**
         * spirit.talent.reset - 重置天赋树
         */
        'spirit.talent.reset': (params) => {
            const { hasItem } = params || {};
            return service.resetTalentTree(hasItem);
        },
        
        /**
         * spirit.talent.query - 查询天赋树状态
         */
        'spirit.talent.query': () => {
            return service.queryTalentTree();
        },
        
        /**
         * spirit.mastery.query - 查询元素精通
         */
        'spirit.mastery.query': (params) => {
            const { element } = params || {};
            return service.queryMastery(element);
        },
        
        /**
         * spirit.mastery.upgrade - 提升精通等级
         */
        'spirit.mastery.upgrade': (params) => {
            const { element } = params || {};
            return service.upgradeMastery(element);
        },
        
        /**
         * spirit.hook.register - 注册灵根变化钩子
         */
        'spirit.hook.register': (params) => {
            const { type, callback } = params || {};
            return service.registerHook(type, callback);
        }
    };
}

// 导出
export { 
    TalentTreeService, 
    createTalentTreeMCPHandlers,
    TALENT_BRANCHES, 
    BRANCH_NAMES, 
    MASTERY_ELEMENTS, 
    MASTERY_LEVELS,
    MASTERY_LEVEL_NAMES,
    MASTERY_EFFECT_MULTIPLIERS,
    LAYER_EFFECTS,
    POINTS_PER_LAYER,
    TALENT_RESET_ITEM,
    createInitialTalentData,
    createInitialMasteryData
};