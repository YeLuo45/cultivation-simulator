/**
 * SpiritBeastService.js - 仙宠进化系统
 * V244: 仙宠进化+血脉系统
 * 
 * 功能：
 * 1. 仙宠进化阶段 (幼年期/成长期/成熟期/化形期/神兽期)
 * 2. 进化条件: 等级限制 + 进化材料消耗
 * 3. 进化分支: 每阶段2-3条进化路径分支
 * 4. 进化技能: 每阶段解锁新技能
 */

// ===== 常量定义 =====

/**
 * 仙宠进化阶段定义
 */
export const SPIRIT_BEAST_TIERS = {
    '幼年期': { minLevel: 1, maxLevel: 10, evolutionItems: ['灵兽蛋'], tierIndex: 0 },
    '成长期': { minLevel: 11, maxLevel: 30, evolutionItems: ['进化丹', '灵草'], tierIndex: 1 },
    '成熟期': { minLevel: 31, maxLevel: 60, evolutionItems: ['仙露', '神识果'], tierIndex: 2 },
    '化形期': { minLevel: 61, maxLevel: 90, evolutionItems: ['化形草', '天雷珠'], tierIndex: 3 },
    '神兽期': { minLevel: 91, maxLevel: 999, evolutionItems: ['神兽精血', '天道法则'], tierIndex: 4 }
};

/**
 * 进化阶段顺序
 */
export const TIER_ORDER = ['幼年期', '成长期', '成熟期', '化形期', '神兽期'];

/**
 * 进化阶段中文名称映射
 */
export const TIER_NAMES = {
    '幼年期': '幼年期',
    '成长期': '成长期',
    '成熟期': '成熟期',
    '化形期': '化形期',
    '神兽期': '神兽期'
};

/**
 * 每阶段解锁的技能
 */
export const TIER_SKILLS = {
    '幼年期': [],
    '成长期': ['灵视', '感知'],
    '成熟期': ['灵视', '感知', '灵风'],
    '化形期': ['灵视', '感知', '灵风', '仙风'],
    '神兽期': ['灵视', '感知', '灵风', '仙风', '神佑']
};

/**
 * 进化分支定义 (每阶段的进化选项)
 */
export const EVOLUTION_BRANCHES = {
    '幼年期': [
        { id: 'beast_type_a', name: '灵狐', description: '灵巧型仙宠', statBonus: { agility: 10 } },
        { id: 'beast_type_b', name: '灵熊', description: '力量型仙宠', statBonus: { strength: 10 } },
        { id: 'beast_type_c', name: '灵鹤', description: '智慧型仙宠', statBonus: { wisdom: 10 } }
    ],
    '成长期': [
        { id: 'fierce', name: '猛兽系', description: '强化攻击', statBonus: { attack: 15 } },
        { id: 'guard', name: '守护系', description: '强化防御', statBonus: { defense: 15 } }
    ],
    '成熟期': [
        { id: 'celestial', name: '仙道系', description: '增加灵力', statBonus: { spiritual: 20 } },
        { id: 'demon', name: '妖道系', description: '增加暴击', statBonus: { critRate: 5 } },
        { id: 'balance', name: '平衡系', description: '属性均衡', statBonus: { attack: 10, defense: 10 } }
    ],
    '化形期': [
        { id: 'divine', name: '神道系', description: '增加神识', statBonus: { divine: 25 } },
        { id: 'dragon', name: '龙系', description: '增加生命', statBonus: { health: 30 } }
    ],
    '神兽期': [
        { id: 'phoenix', name: '凤凰系', description: '涅槃重生', statBonus: { rebirth: 1 } },
        { id: 'titan', name: '泰坦系', description: '绝对力量', statBonus: { power: 50 } }
    ]
};

/**
 * 进化所需材料数量
 */
export const EVOLUTION_ITEM_COSTS = {
    '幼年期': { '灵兽蛋': 1 },
    '成长期': { '进化丹': 1, '灵草': 2 },
    '成熟期': { '仙露': 1, '神识果': 1 },
    '化形期': { '化形草': 1, '天雷珠': 1 },
    '神兽期': { '神兽精血': 1, '天道法则': 1 }
};

/**
 * 仙宠基础属性
 */
export const SPIRIT_BEAST_BASE_STATS = {
    attack: 5,
    defense: 5,
    health: 50,
    spiritual: 10,
    agility: 8,
    critRate: 1
};

// ===== 数据结构创建函数 =====

/**
 * 创建初始仙宠数据
 */
export function createInitialSpiritBeastData() {
    return {
        beasts: [],                // 拥有的仙宠列表
        selectedBeastId: null,     // 当前选中的仙宠ID
        totalBeastsOwned: 0       // 累计拥有的仙宠数量
    };
}

/**
 * 创建新的仙宠
 * @param {string} name - 仙宠名称
 * @param {string} type - 仙宠类型
 * @param {string} tier - 进化阶段 (默认幼年期)
 */
export function createSpiritBeast(name, type = 'beast_type_a', tier = '幼年期') {
    const id = `beast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
        id,
        name,
        type,
        tier,
        level: 1,
        exp: 0,
        expToNextLevel: 100,
        skills: [],
        bloodlineRank: '凡兽',
        bloodlineAwakened: false,
        bloodlineProgress: 0,
        stats: { ...SPIRIT_BEAST_BASE_STATS },
        evolutionBranch: null,
        isSelected: false,
        createdAt: Date.now()
    };
}

// ===== SpiritBeastService 类 =====

/**
 * 仙宠进化服务类
 */
class SpiritBeastService {
    constructor(gameState) {
        this.gameState = gameState;
        this.hooks = new Map();
        this.hookIdCounter = 0;
        
        // 初始化数据
        this.initializeData();
    }

    /**
     * 初始化仙宠数据
     */
    initializeData() {
        if (!this.gameState.spiritBeastData) {
            this.gameState.spiritBeastData = createInitialSpiritBeastData();
        }
    }

    /**
     * 获取仙宠数据
     */
    getSpiritBeastData() {
        return this.gameState.spiritBeastData;
    }

    /**
     * 获取所有仙宠
     */
    getAllBeasts() {
        return this.gameState.spiritBeastData.beasts;
    }

    /**
     * 获取选中的仙宠
     */
    getSelectedBeast() {
        const data = this.getSpiritBeastData();
        if (!data.selectedBeastId) return null;
        return data.beasts.find(b => b.id === data.selectedBeastId) || null;
    }

    /**
     * 选择仙宠
     * @param {string} beastId - 仙宠ID
     */
    selectBeast(beastId) {
        const data = this.getSpiritBeastData();
        const beast = data.beasts.find(b => b.id === beastId);
        
        if (!beast) {
            return { success: false, error: '仙宠不存在' };
        }
        
        // 取消之前选中的选中状态
        if (data.selectedBeastId) {
            const prevBeast = data.beasts.find(b => b.id === data.selectedBeastId);
            if (prevBeast) prevBeast.isSelected = false;
        }
        
        data.selectedBeastId = beastId;
        beast.isSelected = true;
        
        return { success: true, beast };
    }

    /**
     * 获得新仙宠
     * @param {string} name - 仙宠名称
     * @param {string} type - 仙宠类型
     */
    acquireBeast(name, type = 'beast_type_a') {
        const data = this.getSpiritBeastData();
        const beast = createSpiritBeast(name, type, '幼年期');
        
        // 如果是第一只仙宠，自动选中
        if (data.beasts.length === 0) {
            data.selectedBeastId = beast.id;
            beast.isSelected = true;
        }
        
        data.beasts.push(beast);
        data.totalBeastsOwned++;
        
        this.triggerHook('beastAcquired', { beast });
        
        return { success: true, beast };
    }

    /**
     * 检查是否可以进化
     * @param {string} beastId - 仙宠ID
     * @param {string} branchId - 进化分支ID (可选)
     */
    canEvolve(beastId, branchId = null) {
        const beast = this.getBeastById(beastId);
        if (!beast) {
            return { success: false, error: '仙宠不存在' };
        }
        
        const currentTierIndex = TIER_ORDER.indexOf(beast.tier);
        
        // 已经是最顶级
        if (currentTierIndex >= TIER_ORDER.length - 1) {
            return { success: false, error: '已达最高进化阶段' };
        }
        
        // 检查等级限制
        const tierConfig = SPIRIT_BEAST_TIERS[beast.tier];
        if (beast.level < tierConfig.maxLevel) {
            return { 
                success: false, 
                error: `等级不足，需要等级 ${tierConfig.maxLevel}`,
                currentLevel: beast.level,
                requiredLevel: tierConfig.maxLevel
            };
        }
        
        // 检查进化材料
        const requiredItems = EVOLUTION_ITEM_COSTS[beast.tier];
        const inventory = this.gameState.inventory?.items || [];
        
        for (const [itemName, requiredCount] of Object.entries(requiredItems)) {
            const ownedCount = inventory.filter(item => item.name === itemName).length;
            if (ownedCount < requiredCount) {
                return {
                    success: false,
                    error: `材料不足: 需要 ${itemName} x${requiredCount}`,
                    currentItem: itemName,
                    required: requiredCount,
                    owned: ownedCount
                };
            }
        }
        
        // 检查进化分支选择 (成熟期及以上需要选择分支)
        if (currentTierIndex >= 1 && !beast.evolutionBranch && !branchId) {
            return {
                success: false,
                error: '需要选择进化分支',
                requiresBranch: true,
                availableBranches: EVOLUTION_BRANCHES[beast.tier]
            };
        }
        
        return { success: true };
    }

    /**
     * 进化仙宠
     * @param {string} beastId - 仙宠ID
     * @param {string} branchId - 进化分支ID
     */
    evolveBeast(beastId, branchId = null) {
        // 检查是否可以进化
        const canEvolveResult = this.canEvolve(beastId, branchId);
        if (!canEvolveResult.success) {
            return canEvolveResult;
        }
        
        const beast = this.getBeastById(beastId);
        const currentTierIndex = TIER_ORDER.indexOf(beast.tier);
        const nextTier = TIER_ORDER[currentTierIndex + 1];
        const tierConfig = SPIRIT_BEAST_TIERS[beast.tier];
        
        // 消耗进化材料
        const requiredItems = EVOLUTION_ITEM_COSTS[beast.tier];
        const inventory = this.gameState.inventory.items;
        
        for (const [itemName, requiredCount] of Object.entries(requiredItems)) {
            let remaining = requiredCount;
            for (let i = inventory.length - 1; i >= 0 && remaining > 0; i--) {
                if (inventory[i].name === itemName) {
                    inventory.splice(i, 1);
                    remaining--;
                }
            }
        }
        
        // 设置进化分支 (如果需要)
        if (branchId) {
            beast.evolutionBranch = branchId;
            const branch = EVOLUTION_BRANCHES[beast.tier].find(b => b.id === branchId);
            if (branch) {
                // 应用分支属性加成
                Object.assign(beast.stats, branch.statBonus);
            }
        }
        
        // 执行进化
        const oldTier = beast.tier;
        beast.tier = nextTier;
        
        // 解锁新技能
        const newSkills = TIER_SKILLS[nextTier];
        const unlockedSkills = newSkills.filter(skill => !beast.skills.includes(skill));
        beast.skills.push(...unlockedSkills);
        
        // 重置等级为新阶段最低等级
        const nextTierConfig = SPIRIT_BEAST_TIERS[nextTier];
        beast.level = nextTierConfig.minLevel;
        beast.exp = 0;
        beast.expToNextLevel = nextTierConfig.minLevel * 10;
        
        this.triggerHook('beastEvolved', {
            beast,
            oldTier,
            newTier: nextTier,
            unlockedSkills,
            branchId
        });
        
        return {
            success: true,
            beast,
            oldTier,
            newTier: nextTier,
            unlockedSkills,
            newStats: beast.stats
        };
    }

    /**
     * 获取仙宠信息
     * @param {string} beastId - 仙宠ID
     */
    getBeastById(beastId) {
        return this.getSpiritBeastData().beasts.find(b => b.id === beastId) || null;
    }

    /**
     * 获取进化信息
     * @param {string} beastId - 仙宠ID
     */
    getEvolutionInfo(beastId) {
        const beast = this.getBeastById(beastId);
        if (!beast) return { success: false, error: '仙宠不存在' };
        
        const currentTierIndex = TIER_ORDER.indexOf(beast.tier);
        const tierConfig = SPIRIT_BEAST_TIERS[beast.tier];
        
        return {
            success: true,
            currentTier: beast.tier,
            currentTierIndex,
            nextTier: currentTierIndex < TIER_ORDER.length - 1 ? TIER_ORDER[currentTierIndex + 1] : null,
            levelProgress: {
                current: beast.level,
                max: tierConfig.maxLevel,
                percentage: Math.round((beast.level / tierConfig.maxLevel) * 100)
            },
            evolutionItems: tierConfig.evolutionItems,
            itemCosts: EVOLUTION_ITEM_COSTS[beast.tier],
            availableBranches: currentTierIndex >= 1 ? EVOLUTION_BRANCHES[beast.tier] : null,
            currentBranch: beast.evolutionBranch,
            potentialSkills: currentTierIndex < TIER_ORDER.length - 1 ? TIER_SKILLS[TIER_ORDER[currentTierIndex + 1]] : []
        };
    }

    /**
     * 获取所有进化阶段
     */
    getAllTiers() {
        return TIER_ORDER.map(tier => ({
            name: tier,
            ...SPIRIT_BEAST_TIERS[tier]
        }));
    }

    /**
     * 仙宠获得经验
     * @param {string} beastId - 仙宠ID
     * @param {number} amount - 经验值
     */
    gainExp(beastId, amount) {
        const beast = this.getBeastById(beastId);
        if (!beast) return { success: false, error: '仙宠不存在' };
        
        beast.exp += amount;
        let leveledUp = false;
        let totalLevelsGained = 0;
        
        // 检查升级
        while (beast.exp >= beast.expToNextLevel) {
            beast.exp -= beast.expToNextLevel;
            beast.level++;
            beast.expToNextLevel = Math.floor(beast.expToNextLevel * 1.2);
            leveledUp = true;
            totalLevelsGained++;
            
            this.triggerHook('beastLevelUp', { beast, level: beast.level });
        }
        
        return {
            success: true,
            expGained: amount,
            currentExp: beast.exp,
            leveledUp,
            totalLevelsGained,
            currentLevel: beast.level
        };
    }

    /**
     * 获取仙宠战斗力
     * @param {string} beastId - 仙宠ID
     */
    getBeastPower(beastId) {
        const beast = this.getBeastById(beastId);
        if (!beast) return 0;
        
        const stats = beast.stats;
        const tierMultiplier = (SPIRIT_BEAST_TIERS[beast.tier].tierIndex + 1);
        const levelBonus = beast.level * 0.5;
        
        return Math.floor(
            (stats.attack + stats.defense + stats.health * 0.1 + stats.spiritual * 0.5) 
            * tierMultiplier + levelBonus
        );
    }

    /**
     * 获取所有仙宠战力排行榜
     */
    getBeastPowerRanking() {
        return this.getAllBeasts()
            .map(beast => ({
                beast,
                power: this.getBeastPower(beast.id)
            }))
            .sort((a, b) => b.power - a.power);
    }

    // ===== Hook系统 =====

    /**
     * 注册钩子
     * @param {string} type - 钩子类型
     * @param {function} callback - 回调函数
     */
    registerHook(type, callback) {
        const hookId = ++this.hookIdCounter;
        this.hooks.set(hookId, { type, callback, enabled: true });
        return { success: true, hookId, type };
    }

    /**
     * 注销钩子
     * @param {number} hookId - 钩子ID
     */
    unregisterHook(hookId) {
        if (!this.hooks.has(hookId)) {
            return { success: false, error: '钩子不存在' };
        }
        this.hooks.delete(hookId);
        return { success: true };
    }

    /**
     * 触发钩子
     * @param {string} type - 钩子类型
     * @param {object} data - 数据
     */
    triggerHook(type, data) {
        const triggeredIds = [];
        for (const [hookId, hook] of this.hooks) {
            if (hook.type === type && hook.enabled) {
                hook.callback(data);
                triggeredIds.push(hookId);
            }
        }
        return triggeredIds;
    }

    /**
     * 列出所有钩子
     */
    listHooks() {
        return Array.from(this.hooks.entries()).map(([id, h]) => ({
            id,
            type: h.type,
            enabled: h.enabled
        }));
    }

    // ===== 序列化 =====

    /**
     * 序列化数据
     */
    serialize() {
        return {
            spiritBeastData: this.gameState.spiritBeastData
        };
    }

    /**
     * 反序列化数据
     * @param {object} data - 序列化数据
     */
    deserialize(data) {
        if (data.spiritBeastData) {
            this.gameState.spiritBeastData = data.spiritBeastData;
        }
    }
}

export default SpiritBeastService;
export { SpiritBeastService };