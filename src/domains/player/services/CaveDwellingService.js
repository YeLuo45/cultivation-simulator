/**
 * CaveDwellingService.js - 灵界洞府系统
 * V233 Direction U: 灵界洞府系统
 * 
 * 提供6个MCP工具：
 * - residence.build - 建造洞府
 * - residence.upgrade - 升级洞府
 * - residence.query - 查询洞府状态
 * - residence.blessing - 获取洞府加成
 * - residence.visit - 拜访他人洞府
 * - residence.trade - 洞府资源交易
 */

/**
 * 洞府位置类型
 */
const CAVE_LOCATIONS = ['秘境', '仙山', '海底', '深渊', '云端'];

/**
 * 洞府规模类型
 */
const CAVE_SCALES = ['小型', '中型', '大型', '洞天'];

/**
 * 洞府等级配置
 */
const CAVE_LEVEL_CONFIG = {
    1: { name: '初成', cultivationBonus: 5, spiritStoneCost: 500, materials: ['灵石x100', '灵木x20'] },
    2: { name: '小成', cultivationBonus: 10, spiritStoneCost: 1500, materials: ['灵石x300', '灵木x50', '灵玉x10'] },
    3: { name: '大成', cultivationBonus: 20, spiritStoneCost: 5000, materials: ['灵石x1000', '灵木x150', '灵玉x30', '天材x5'] },
    4: { name: '圆满', cultivationBonus: 35, spiritStoneCost: 15000, materials: ['灵石x3000', '灵木x400', '灵玉x80', '天材x15'] },
    5: { name: '洞天', cultivationBonus: 50, spiritStoneCost: 50000, materials: ['灵石x10000', '灵木x1000', '灵玉x200', '天材x50'] }
};

/**
 * 位置加成配置
 */
const LOCATION_BLESSING_CONFIG = {
    '秘境': { primaryBonus: 'serendipity', secondaryBonus: 'cultivation', cultivationBonus: 1.5, serendipityBonus: 2.0, description: '秘境洞府 - 奇遇加成' },
    '仙山': { primaryBonus: 'cultivation', secondaryBonus: 'qi', cultivationBonus: 2.0, qiBonus: 1.5, description: '仙山洞府 - 修炼加成' },
    '海底': { primaryBonus: 'qi', secondaryBonus: 'spiritStones', cultivationBonus: 1.3, qiBonus: 2.0, spiritStoneBonus: 1.5, description: '海底洞府 - 灵气加成' },
    '深渊': { primaryBonus: 'combat', secondaryBonus: 'cultivation', cultivationBonus: 1.5, combatBonus: 2.0, description: '深渊洞府 - 战斗加成' },
    '云端': { primaryBonus: 'reputation', secondaryBonus: 'cultivation', cultivationBonus: 1.8, reputationBonus: 2.0, description: '云端洞府 - 名望加成' }
};

/**
 * 洞府服务类
 */
class CaveDwellingService {
    constructor(gameState) {
        this.gameState = gameState;
        this.residences = new Map();
        this.visitHistory = [];
        this.tradeHistory = [];
    }

    /**
     * 初始化洞府服务
     */
    init(gameState) {
        this.gameState = gameState;
        if (!gameState.residence) {
            gameState.residence = {
                hasResidence: false,
                residence: null,
                upgradeLevel: 0,
                location: null,
                scale: null,
                builtAt: null,
                lastVisitAt: null,
                totalBlessings: 0,
                visitors: [],
                tradeOffers: []
            };
        }
        if (!gameState.residence.residences) {
            gameState.residence.residences = [];
        }
        console.log('[CaveDwelling] 灵界洞府系统初始化完成');
        return this;
    }

    /**
     * 获取MCP工具处理器
     */
    getMCPHandlers() {
        return {
            'residence.build': (params) => this.mcpBuild(params),
            'residence.upgrade': (params) => this.mcpUpgrade(params),
            'residence.query': (params) => this.mcpQuery(params),
            'residence.blessing': (params) => this.mcpBlessing(params),
            'residence.visit': (params) => this.mcpVisit(params),
            'residence.trade': (params) => this.mcpTrade(params)
        };
    }

    // ===== residence.build - 建造洞府 =====

    /**
     * MCP工具: 建造洞府
     */
    mcpBuild(params = {}) {
        const { location, scale, customName } = params;

        if (!location || !CAVE_LOCATIONS.includes(location)) {
            return { success: false, error: '无效的洞府位置', validLocations: CAVE_LOCATIONS };
        }
        if (!scale || !CAVE_SCALES.includes(scale)) {
            return { success: false, error: '无效的洞府规模', validScales: CAVE_SCALES };
        }

        const levelConfig = CAVE_LEVEL_CONFIG[1];
        const cost = levelConfig.spiritStoneCost;
        const currentStones = this.gameState.spiritStones || 0;

        if (currentStones < cost) {
            return { success: false, error: '灵石不足', required: cost, available: currentStones };
        }

        // 消耗灵石
        this.gameState.spiritStones -= cost;

        // 创建洞府
        const residence = {
            id: `residence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: customName || `${location}${scale}洞府`,
            location,
            scale,
            level: 1,
            builtAt: Date.now(),
            lastUpgradeAt: Date.now(),
            cultivationProgress: 0,
            totalVisits: 0,
            blessings: this.calculateBlessing(location, scale, 1)
        };

        // 更新游戏状态
        this.gameState.residence.hasResidence = true;
        this.gameState.residence.residence = residence;
        this.gameState.residence.upgradeLevel = 1;
        this.gameState.residence.location = location;
        this.gameState.residence.scale = scale;
        this.gameState.residence.builtAt = residence.builtAt;

        this.residences.set(residence.id, residence);

        return {
            success: true,
            message: `洞府【${residence.name}】建造成功！`,
            residence: {
                id: residence.id,
                name: residence.name,
                location: residence.location,
                scale: residence.scale,
                level: residence.level,
                cost: cost
            },
            remainingStones: this.gameState.spiritStones
        };
    }

    // ===== residence.upgrade - 升级洞府 =====

    /**
     * MCP工具: 升级洞府
     */
    mcpUpgrade(params = {}) {
        const { confirm } = params;

        if (!this.gameState.residence.hasResidence) {
            return { success: false, error: '尚未建造洞府' };
        }

        const residence = this.gameState.residence.residence;
        const currentLevel = residence.level;

        if (currentLevel >= 5) {
            return { success: false, error: '洞府已达到最高等级(5级)' };
        }

        const nextLevelConfig = CAVE_LEVEL_CONFIG[currentLevel + 1];
        const cost = nextLevelConfig.spiritStoneCost;
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

        // 升级洞府
        const oldLevel = residence.level;
        residence.level = currentLevel + 1;
        residence.lastUpgradeAt = Date.now();
        residence.blessings = this.calculateBlessing(residence.location, residence.scale, residence.level);

        // 更新游戏状态
        this.gameState.residence.upgradeLevel = residence.level;

        return {
            success: true,
            message: `洞府升级成功！${CAVE_LEVEL_CONFIG[oldLevel].name} → ${CAVE_LEVEL_CONFIG[residence.level].name}`,
            upgrade: {
                fromLevel: oldLevel,
                toLevel: residence.level,
                newBonus: residence.blessings.cultivationBonus,
                cost: cost
            },
            remainingStones: this.gameState.spiritStones
        };
    }

    // ===== residence.query - 查询洞府状态 =====

    /**
     * MCP工具: 查询洞府状态
     */
    mcpQuery(params = {}) {
        const { detailed } = params;

        if (!this.gameState.residence.hasResidence) {
            return {
                hasResidence: false,
                message: '尚未建造洞府，请使用 residence.build 建造'
            };
        }

        const residence = this.gameState.residence.residence;
        const levelConfig = CAVE_LEVEL_CONFIG[residence.level];
        const locationConfig = LOCATION_BLESSING_CONFIG[residence.location];

        const result = {
            hasResidence: true,
            residence: {
                id: residence.id,
                name: residence.name,
                location: residence.location,
                scale: residence.scale,
                level: residence.level,
                levelName: levelConfig.name,
                builtAt: residence.builtAt,
                lastUpgradeAt: residence.lastUpgradeAt,
                totalVisits: residence.totalVisits
            },
            blessings: {
                cultivationBonus: residence.blessings.cultivationBonus,
                primaryBonus: locationConfig.primaryBonus,
                description: locationConfig.description
            }
        };

        if (detailed) {
            result.detailed = {
                scaleName: residence.scale,
                locationBonus: locationConfig,
                nextLevelUpgrade: residence.level < 5 ? {
                    level: residence.level + 1,
                    name: CAVE_LEVEL_CONFIG[residence.level + 1].name,
                    cost: CAVE_LEVEL_CONFIG[residence.level + 1].spiritStoneCost,
                    bonus: CAVE_LEVEL_CONFIG[residence.level + 1].cultivationBonus
                } : null,
                age: Date.now() - residence.builtAt,
                visitors: residence.totalVisits
            };
        }

        return result;
    }

    // ===== residence.blessing - 获取洞府加成 =====

    /**
     * MCP工具: 获取洞府加成
     */
    mcpBlessing(params = {}) {
        const { type } = params;

        if (!this.gameState.residence.hasResidence) {
            return { success: false, error: '尚未建造洞府' };
        }

        const residence = this.gameState.residence.residence;
        const locationConfig = LOCATION_BLESSING_CONFIG[residence.location];
        const levelConfig = CAVE_LEVEL_CONFIG[residence.level];

        const blessings = {
            cultivation: {
                bonus: residence.blessings.cultivationBonus,
                description: `修炼速度提升${residence.blessings.cultivationBonus}%`
            },
            location: {
                bonus: locationConfig,
                description: locationConfig.description
            },
            total: {
                combinedBonus: this.calculateCombinedBonus(residence, locationConfig),
                description: '洞府综合加成'
            }
        };

        if (type && blessings[type]) {
            return { success: true, blessing: blessings[type] };
        }

        return {
            success: true,
            residenceId: residence.id,
            residenceName: residence.name,
            currentLevel: residence.level,
            levelName: levelConfig.name,
            blessings: blessings
        };
    }

    // ===== residence.visit - 拜访他人洞府 =====

    /**
     * MCP工具: 拜访他人洞府
     */
    mcpVisit(params = {}) {
        const { hostId, hostName } = params;

        // 模拟拜访逻辑
        const visitResult = {
            success: true,
            visitedAt: Date.now(),
            hostId: hostId || 'npc_001',
            hostName: hostName || '神秘修士',
            duration: 3600000, // 1小时
            rewards: {}
        };

        // 根据洞府位置和等级给予拜访奖励
        const baseReward = 10;
        const levelMultiplier = (this.gameState.residence.residence?.level || 1) * 0.5;
        visitResult.rewards.spiritStones = Math.floor(baseReward * levelMultiplier);
        visitResult.rewards.cultivationProgress = Math.floor(baseReward * levelMultiplier * 2);

        // 增加访客记录
        this.visitHistory.push({
            visitedAt: visitResult.visitedAt,
            hostId: visitResult.hostId,
            hostName: visitResult.hostName
        });

        // 更新被拜访洞府的访客数
        if (this.gameState.residence.hasResidence) {
            this.gameState.residence.residence.totalVisits = (this.gameState.residence.residence.totalVisits || 0) + 1;
        }

        return {
            success: true,
            message: `拜访【${visitResult.hostName}】的洞府成功！`,
            visit: visitResult,
            rewards: visitResult.rewards
        };
    }

    // ===== residence.trade - 洞府资源交易 =====

    /**
     * MCP工具: 洞府资源交易
     */
    mcpTrade(params = {}) {
        const { resourceType, amount, price, action } = params;

        if (!this.gameState.residence.hasResidence) {
            return { success: false, error: '尚未建造洞府，无法进行交易' };
        }

        // list action 不需要 resourceType 验证
        if (action === 'list') {
            const currentOffers = this.gameState.residence.tradeOffers || [];
            return {
                success: true,
                action: 'list',
                offers: currentOffers,
                count: currentOffers.length
            };
        }

        const validResources = ['spiritStones', 'materials', 'pills', 'herbs'];
        if (!resourceType || !validResources.includes(resourceType)) {
            return { success: false, error: '无效的交易资源类型', validTypes: validResources };
        }

        if (!amount || amount <= 0) {
            return { success: false, error: '交易数量必须大于0' };
        }

        if (!price || price <= 0) {
            return { success: false, error: '交易价格必须大于0' };
        }

        if (action === 'execute') {
            // 执行交易
            const totalCost = amount * price;
            const currentStones = this.gameState.spiritStones || 0;

            if (currentStones < totalCost) {
                return { success: false, error: '灵石不足', required: totalCost, available: currentStones };
            }

            // 消耗灵石，获得资源
            this.gameState.spiritStones -= totalCost;

            const tradeResult = {
                id: `trade_${Date.now()}`,
                resourceType,
                amount,
                price,
                totalCost,
                executedAt: Date.now(),
                seller: 'system'
            };

            this.tradeHistory.push(tradeResult);

            return {
                success: true,
                message: `交易成功！花费${totalCost}灵石购买${amount}个${resourceType}`,
                trade: tradeResult,
                remainingStones: this.gameState.spiritStones
            };
        }

        // 默认：创建交易挂单
        const offer = {
            id: `offer_${Date.now()}`,
            resourceType,
            amount,
            price,
            createdAt: Date.now(),
            seller: this.gameState.player?.name || '匿名修士'
        };

        if (!this.gameState.residence.tradeOffers) {
            this.gameState.residence.tradeOffers = [];
        }
        this.gameState.residence.tradeOffers.push(offer);

        return {
            success: true,
            message: `交易挂单创建成功！`,
            offer: offer
        };
    }

    // ===== 私有辅助方法 =====

    /**
     * 计算洞府加成
     */
    calculateBlessing(location, scale, level) {
        const locationConfig = LOCATION_BLESSING_CONFIG[location];
        const levelConfig = CAVE_LEVEL_CONFIG[level];
        
        const scaleBonus = {
            '小型': 1.0,
            '中型': 1.3,
            '大型': 1.6,
            '洞天': 2.0
        };

        return {
            cultivationBonus: Math.floor(locationConfig.cultivationBonus * levelConfig.cultivationBonus * scaleBonus[scale]),
            serendipityBonus: locationConfig.serendipityBonus || 1.0,
            qiBonus: locationConfig.qiBonus || 1.0,
            spiritStoneBonus: locationConfig.spiritStoneBonus || 1.0,
            combatBonus: locationConfig.combatBonus || 1.0,
            reputationBonus: locationConfig.reputationBonus || 1.0
        };
    }

    /**
     * 计算综合加成
     */
    calculateCombinedBonus(residence, locationConfig) {
        const baseBonus = residence.blessings.cultivationBonus;
        const locationBonus = locationConfig.cultivationBonus;
        return Math.floor(baseBonus * locationBonus);
    }
}

// 导出服务类和相关常量
export { 
    CaveDwellingService,
    CAVE_LOCATIONS,
    CAVE_SCALES,
    CAVE_LEVEL_CONFIG,
    LOCATION_BLESSING_CONFIG
};

// 导出工厂函数用于创建服务实例
export function createCaveDwellingService(gameState) {
    const service = new CaveDwellingService(gameState);
    service.init(gameState);
    return service;
}