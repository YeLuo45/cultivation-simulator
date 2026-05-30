/**
 * CaveRealmService.js - 洞天福地系统
 * V242 Direction D: 洞天福地系统 (chatdev/nanobot)
 * 
 * 提供6个MCP工具：
 * - cave.create - 创建洞天
 * - cave.expand - 扩展洞天
 * - cave.resource - 洞天资源
 * - cave.blessed - 福地增益
 * - cave.spirit - 灵气充盈
 * - cave.harvest - 收获资源
 */

/**
 * 洞天等级类型
 */
const CAVE_TIERS = ['小型', '中型', '大型', '巨型'];

/**
 * 洞天等级配置
 */
const CAVE_TIER_CONFIG = {
    '小型': { 
        capacity: 2, 
        resourceSlots: 3, 
        spiritBonus: 1.0, 
        expandCost: 500,
        createCost: 200
    },
    '中型': { 
        capacity: 5, 
        resourceSlots: 6, 
        spiritBonus: 1.3, 
        expandCost: 1500,
        createCost: 0
    },
    '大型': { 
        capacity: 10, 
        resourceSlots: 10, 
        spiritBonus: 1.6, 
        expandCost: 5000,
        createCost: 0
    },
    '巨型': { 
        capacity: 20, 
        resourceSlots: 20, 
        spiritBonus: 2.0, 
        expandCost: 20000,
        createCost: 0
    }
};

/**
 * 福地等级配置
 */
const BLESSED_LAND_CONFIG = {
    1: { name: '福地初成', qiRegenBonus: 1.2, cultivationBonus: 5, expandCost: 300 },
    2: { name: '福地小成', qiRegenBonus: 1.5, cultivationBonus: 10, expandCost: 800 },
    3: { name: '福地大成', qiRegenBonus: 1.8, cultivationBonus: 20, expandCost: 2000 },
    4: { name: '福地圆满', qiRegenBonus: 2.2, cultivationBonus: 35, expandCost: 6000 },
    5: { name: '洞天福地', qiRegenBonus: 3.0, cultivationBonus: 50, expandCost: 15000 }
};

/**
 * 资源类型配置
 */
const RESOURCE_TYPES = {
    'spiritStone': { name: '灵石', baseYield: 10, regenTime: 3600000 },
    'qiCrystal': { name: '灵气结晶', baseYield: 5, regenTime: 7200000 },
    'essence': { name: '精华', baseYield: 2, regenTime: 10800000 },
    'mysticHerb': { name: '灵草', baseYield: 3, regenTime: 5400000 }
};

/**
 * 洞天福地服务类
 */
class CaveRealmService {
    constructor(gameState) {
        this.gameState = gameState;
        this.realms = new Map();
        this.blessedLands = new Map();
        this.resourceTimers = new Map();
        this.harvestHistory = [];
    }

    /**
     * 初始化洞天福地服务
     */
    init(gameState) {
        this.gameState = gameState;
        if (!gameState.caveRealm) {
            gameState.caveRealm = {
                hasCave: false,
                cave: null,
                blessedLands: [],
                resources: [],
                totalHarvests: 0,
                spiritBalance: 0,
                lastSpiritUpdate: Date.now()
            };
        }
        if (!gameState.caveRealm.realms) {
            gameState.caveRealm.realms = [];
        }
        if (!gameState.caveRealm.blessedLands) {
            gameState.caveRealm.blessedLands = [];
        }
        if (!gameState.caveRealm.resources) {
            gameState.caveRealm.resources = [];
        }
        console.log('[CaveRealm] 洞天福地系统初始化完成');
        return this;
    }

    /**
     * 获取MCP工具处理器
     */
    getMCPHandlers() {
        return {
            'cave.create': (params) => this.mcpCreate(params),
            'cave.expand': (params) => this.mcpExpand(params),
            'cave.resource': (params) => this.mcpResource(params),
            'cave.blessed': (params) => this.mcpBlessed(params),
            'cave.spirit': (params) => this.mcpSpirit(params),
            'cave.harvest': (params) => this.mcpHarvest(params)
        };
    }

    /**
     * 获取所有工具定义
     */
    static get TOOLS() {
        return {
            'cave.create': {
                name: 'cave.create',
                description: '创建洞天 - 开辟属于自己的秘境空间',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: '洞天名称' },
                        tier: { type: 'string', enum: ['小型', '中型', '大型', '巨型'], description: '洞天规模' }
                    }
                }
            },
            'cave.expand': {
                name: 'cave.expand',
                description: '扩展洞天 - 提升洞天等级和容量',
                inputSchema: {
                    type: 'object',
                    properties: {
                        targetTier: { type: 'string', enum: ['小型', '中型', '大型', '巨型'], description: '目标规模' }
                    }
                }
            },
            'cave.resource': {
                name: 'cave.resource',
                description: '洞天资源 - 查看洞天内资源状态',
                inputSchema: {
                    type: 'object',
                    properties: {
                        resourceType: { type: 'string', description: '资源类型（可选）' }
                    }
                }
            },
            'cave.blessed': {
                name: 'cave.blessed',
                description: '福地增益 - 获取福地提供的加成',
                inputSchema: {
                    type: 'object',
                    properties: {
                        blessedLandId: { type: 'string', description: '福地ID（可选）' }
                    }
                }
            },
            'cave.spirit': {
                name: 'cave.spirit',
                description: '灵气充盈 - 充盈洞天灵气',
                inputSchema: {
                    type: 'object',
                    properties: {
                        amount: { type: 'number', description: '灵气数量' }
                    }
                }
            },
            'cave.harvest': {
                name: 'cave.harvest',
                description: '收获资源 - 收获洞天内已成熟的资源',
                inputSchema: {
                    type: 'object',
                    properties: {
                        resourceId: { type: 'string', description: '资源ID（可选，收获全部）' }
                    }
                }
            }
        };
    }

    // ===== cave.create - 创建洞天 =====

    /**
     * MCP工具: 创建洞天
     */
    mcpCreate(params = {}) {
        const { name, tier = '小型' } = params;

        if (!CAVE_TIERS.includes(tier)) {
            return { 
                success: false, 
                error: '无效的洞天规模',
                validTiers: CAVE_TIERS 
            };
        }

        if (this.gameState.caveRealm.hasCave) {
            return { 
                success: false, 
                error: '已存在洞天，请使用 cave.expand 扩展'
            };
        }

        const tierConfig = CAVE_TIER_CONFIG[tier];
        const cost = tierConfig.createCost || CAVE_TIER_CONFIG['小型'].expandCost;
        const currentStones = this.gameState.spiritStones || 0;

        if (currentStones < cost) {
            return { 
                success: false, 
                error: '灵石不足',
                required: cost,
                available: currentStones
            };
        }

        // 消耗灵石
        this.gameState.spiritStones -= cost;

        // 创建洞天
        const cave = {
            id: `cave_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name || `${tier}洞天`,
            tier,
            capacity: tierConfig.capacity,
            resourceSlots: tierConfig.resourceSlots,
            spiritBonus: tierConfig.spiritBonus,
            createdAt: Date.now(),
            lastExpandAt: Date.now(),
            resourceSlotsUsed: 0,
            totalResourcesProduced: 0
        };

        // 更新游戏状态
        this.gameState.caveRealm.hasCave = true;
        this.gameState.caveRealm.cave = cave;
        this.gameState.caveRealm.realms.push(cave);
        this.realms.set(cave.id, cave);

        return {
            success: true,
            message: `洞天【${cave.name}】创建成功！`,
            cave: {
                id: cave.id,
                name: cave.name,
                tier: cave.tier,
                capacity: cave.capacity,
                resourceSlots: cave.resourceSlots,
                cost: cost
            },
            remainingStones: this.gameState.spiritStones
        };
    }

    // ===== cave.expand - 扩展洞天 =====

    /**
     * MCP工具: 扩展洞天
     */
    mcpExpand(params = {}) {
        const { targetTier } = params;

        if (!this.gameState.caveRealm.hasCave) {
            return { 
                success: false, 
                error: '尚未创建洞天，请先使用 cave.create'
            };
        }

        const cave = this.gameState.caveRealm.cave;
        const currentTierIndex = CAVE_TIERS.indexOf(cave.tier);

        if (!targetTier || !CAVE_TIERS.includes(targetTier)) {
            return { 
                success: false, 
                error: '无效的目标规模',
                validTiers: CAVE_TIERS 
            };
        }

        const targetTierIndex = CAVE_TIERS.indexOf(targetTier);
        if (targetTierIndex <= currentTierIndex) {
            return { 
                success: false, 
                error: '目标规模必须大于当前规模',
                currentTier: cave.tier
            };
        }

        const tierConfig = CAVE_TIER_CONFIG[targetTier];
        const cost = tierConfig.expandCost;
        const currentStones = this.gameState.spiritStones || 0;

        if (currentStones < cost) {
            return { 
                success: false, 
                error: '灵石不足',
                required: cost,
                available: currentStones,
                shortfall: cost - currentStones
            };
        }

        // 消耗灵石
        this.gameState.spiritStones -= cost;

        // 扩展洞天
        const oldTier = cave.tier;
        cave.tier = targetTier;
        cave.capacity = tierConfig.capacity;
        cave.resourceSlots = tierConfig.resourceSlots;
        cave.spiritBonus = tierConfig.spiritBonus;
        cave.lastExpandAt = Date.now();

        return {
            success: true,
            message: `洞天扩展成功！${oldTier} → ${targetTier}`,
            expand: {
                fromTier: oldTier,
                toTier: targetTier,
                newCapacity: cave.capacity,
                newResourceSlots: cave.resourceSlots,
                cost: cost
            },
            remainingStones: this.gameState.spiritStones
        };
    }

    // ===== cave.resource - 洞天资源 =====

    /**
     * MCP工具: 洞天资源
     */
    mcpResource(params = {}) {
        const { resourceType } = params;

        if (!this.gameState.caveRealm.hasCave) {
            return { 
                success: false, 
                error: '尚未创建洞天'
            };
        }

        const cave = this.gameState.caveRealm.cave;
        const resources = this.gameState.caveRealm.resources;

        if (resourceType) {
            if (!RESOURCE_TYPES[resourceType]) {
                return { 
                    success: false, 
                    error: '无效的资源类型',
                    validTypes: Object.keys(RESOURCE_TYPES)
                };
            }
            const filtered = resources.filter(r => r.type === resourceType);
            return {
                success: true,
                resourceType,
                resources: filtered,
                count: filtered.length
            };
        }

        return {
            success: true,
            cave: {
                id: cave.id,
                name: cave.name,
                tier: cave.tier,
                capacity: cave.capacity,
                resourceSlots: cave.resourceSlots,
                resourceSlotsUsed: resources.length,
                resourceSlotsAvailable: cave.resourceSlots - resources.length
            },
            resources: resources.map(r => ({
                id: r.id,
                type: r.type,
                name: RESOURCE_TYPES[r.type]?.name || r.type,
                amount: r.amount,
                readyAt: r.readyAt,
                isReady: Date.now() >= r.readyAt
            })),
            totalResources: resources.length,
            availableTypes: Object.keys(RESOURCE_TYPES)
        };
    }

    // ===== cave.blessed - 福地增益 =====

    /**
     * MCP工具: 福地增益
     */
    mcpBlessed(params = {}) {
        const { blessedLandId } = params;

        if (!this.gameState.caveRealm.hasCave) {
            return { 
                success: false, 
                error: '尚未创建洞天'
            };
        }

        const blessedLands = this.gameState.caveRealm.blessedLands;

        if (blessedLandId) {
            const land = blessedLands.find(l => l.id === blessedLandId);
            if (!land) {
                return { 
                    success: false, 
                    error: '福地不存在',
                    validIds: blessedLands.map(l => l.id)
                };
            }
            const config = BLESSED_LAND_CONFIG[land.level];
            return {
                success: true,
                blessedLand: {
                    id: land.id,
                    name: land.name,
                    level: land.level,
                    levelName: config.name,
                    qiRegenBonus: land.qiRegenBonus,
                    cultivationBonus: land.cultivationBonus,
                    createdAt: land.createdAt
                }
            };
        }

        // 计算总增益
        let totalQiRegenBonus = 1.0;
        let totalCultivationBonus = 0;

        for (const land of blessedLands) {
            totalQiRegenBonus *= land.qiRegenBonus;
            totalCultivationBonus += land.cultivationBonus;
        }

        return {
            success: true,
            blessedLands: blessedLands.map(land => {
                const config = BLESSED_LAND_CONFIG[land.level];
                return {
                    id: land.id,
                    name: land.name,
                    level: land.level,
                    levelName: config.name,
                    qiRegenBonus: land.qiRegenBonus,
                    cultivationBonus: land.cultivationBonus
                };
            }),
            totalBlessedLands: blessedLands.length,
            totalQiRegenBonus,
            totalCultivationBonus
        };
    }

    // ===== cave.spirit - 灵气充盈 =====

    /**
     * MCP工具: 灵气充盈
     */
    mcpSpirit(params = {}) {
        const { amount = 100 } = params;

        if (!this.gameState.caveRealm.hasCave) {
            return { 
                success: false, 
                error: '尚未创建洞天'
            };
        }

        if (amount <= 0) {
            return { 
                success: false, 
                error: '灵气数量必须大于0'
            };
        }

        const currentQi = this.gameState.qi || 0;
        const cave = this.gameState.caveRealm.cave;
        const bonusMultiplier = cave.spiritBonus;

        // 灵气注入洞天
        const actualAdded = Math.floor(amount * bonusMultiplier);
        this.gameState.caveRealm.spiritBalance = (this.gameState.caveRealm.spiritBalance || 0) + actualAdded;
        this.gameState.caveRealm.lastSpiritUpdate = Date.now();

        return {
            success: true,
            message: `灵气充盈成功！+${actualAdded}灵气（倍率${bonusMultiplier}）`,
            spirit: {
                added: actualAdded,
                bonusMultiplier,
                totalBalance: this.gameState.caveRealm.spiritBalance,
                currentQi
            }
        };
    }

    // ===== cave.harvest - 收获资源 =====

    /**
     * MCP工具: 收获资源
     */
    mcpHarvest(params = {}) {
        const { resourceId } = params;

        if (!this.gameState.caveRealm.hasCave) {
            return { 
                success: false, 
                error: '尚未创建洞天'
            };
        }

        const resources = this.gameState.caveRealm.resources;
        const now = Date.now();

        let toHarvest;
        if (resourceId) {
            toHarvest = resources.find(r => r.id === resourceId);
            if (!toHarvest) {
                return { 
                    success: false, 
                    error: '资源不存在'
                };
            }
            if (now < toHarvest.readyAt) {
                return { 
                    success: false, 
                    error: '资源尚未成熟',
                    readyAt: toHarvest.readyAt,
                    remainingMs: toHarvest.readyAt - now
                };
            }
            toHarvest = [toHarvest];
        } else {
            toHarvest = resources.filter(r => now >= r.readyAt);
        }

        if (toHarvest.length === 0) {
            return { 
                success: true,
                message: '暂无可收获的资源',
                harvested: [],
                totalHarvested: 0
            };
        }

        // 计算收获
        const harvested = toHarvest.map(r => {
            const resourceConfig = RESOURCE_TYPES[r.type];
            return {
                id: r.id,
                type: r.type,
                name: resourceConfig?.name || r.type,
                amount: r.amount,
                harvestedAt: now
            };
        });

        // 更新游戏状态
        this.gameState.caveRealm.totalHarvests += harvested.length;
        this.harvestHistory.push(...harvested);

        // 移除已收获资源
        const harvestedIds = harvested.map(h => h.id);
        this.gameState.caveRealm.resources = resources.filter(r => !harvestedIds.includes(r.id));

        // 根据资源类型给予奖励
        let totalSpiritStones = 0;
        let totalQi = 0;

        for (const h of harvested) {
            if (h.type === 'spiritStone') {
                totalSpiritStones += h.amount;
            } else if (h.type === 'qiCrystal') {
                totalQi += h.amount * 10;
            }
        }

        if (totalSpiritStones > 0) {
            this.gameState.spiritStones = (this.gameState.spiritStones || 0) + totalSpiritStones;
        }
        if (totalQi > 0) {
            this.gameState.qi = (this.gameState.qi || 0) + totalQi;
        }

        return {
            success: true,
            message: `收获成功！获得${harvested.length}个资源`,
            harvested,
            rewards: {
                spiritStones: totalSpiritStones,
                qi: totalQi
            },
            totalHarvests: this.gameState.caveRealm.totalHarvests,
            remainingResources: this.gameState.caveRealm.resources.length
        };
    }

    // ===== 私有辅助方法 =====

    /**
     * 生成资源ID
     */
    generateResourceId() {
        return `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 计算资源再生时间
     */
    calculateRegenTime(resourceType, tierMultiplier = 1.0) {
        const config = RESOURCE_TYPES[resourceType];
        if (!config) return 0;
        return Math.floor(config.regenTime / tierMultiplier);
    }
}

/**
 * 创建洞天福地服务实例
 */
function createCaveRealmService(gameState) {
    return new CaveRealmService(gameState);
}

export { 
    CaveRealmService, 
    createCaveRealmService,
    CAVE_TIERS,
    CAVE_TIER_CONFIG,
    BLESSED_LAND_CONFIG,
    RESOURCE_TYPES
};