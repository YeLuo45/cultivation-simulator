/**
 * CelestialMap.js - 仙界地图实体配置
 * V248: 世界地图: 九州/四海/仙山/魔域, 区域资源分布, 传送阵连接
 */

// 世界区域配置
export const WORLD_REGIONS = {
    '九州': { 
        level: [1, 30], 
        resources: ['灵草', '灵石'], 
        explored: 0,
        description: '人界九州，灵气充沛，适合初入修炼之人',
        terrain: '平原丘陵',
        danger: '低'
    },
    '四海': { 
        level: [20, 60], 
        resources: ['灵珠', '海晶'], 
        explored: 0,
        description: '东海西海南海北海，海底有无穷宝藏',
        terrain: '海域',
        danger: '中'
    },
    '仙山': { 
        level: [50, 90], 
        resources: ['仙露', '天道石'], 
        explored: 0,
        description: '三十六洞天，七十二福地，仙家圣地',
        terrain: '高山云海',
        danger: '高'
    },
    '魔域': { 
        level: [70, 100], 
        resources: ['魔晶', '邪气'], 
        explored: 0,
        description: '妖魔横行之地的禁忌区域',
        terrain: '荒芜之地',
        danger: '极高'
    }
};

// 传送阵连接配置
export const PORTAL_CONNECTIONS = {
    '九州_四海': { 
        name: '东海传送阵',
        description: '连接九州与四海的古老传送阵',
        requiredExploration: 30,
        spiritStoneCost: 100
    },
    '九州_仙山': { 
        name: '登仙阵',
        description: '通往仙山的隐秘传送阵',
        requiredExploration: 50,
        spiritStoneCost: 200
    },
    '四海_仙山': { 
        name: '碧海仙踪阵',
        description: '跨越海域直连仙山',
        requiredExploration: 60,
        spiritStoneCost: 300
    },
    '仙山_魔域': { 
        name: '魔界裂隙',
        description: '危险的跨界裂隙',
        requiredExploration: 80,
        spiritStoneCost: 500
    },
    '魔域_九州': { 
        name: '万魔归宗阵',
        description: '连接人魔两界的禁忌通道',
        requiredExploration: 90,
        spiritStoneCost: 1000
    }
};

// 资源分布配置
export const RESOURCE_DISTRIBUTION = {
    '九州': [
        { name: '灵草', rarity: 0.6, baseYield: 10, qualityRange: [1, 3], discoveryChance: 0.4 },
        { name: '灵石', rarity: 0.5, baseYield: 5, qualityRange: [1, 2], discoveryChance: 0.3 },
        { name: '妖兽内丹', rarity: 0.3, baseYield: 2, qualityRange: [1, 3], discoveryChance: 0.2 },
        { name: '灵泉水', rarity: 0.2, baseYield: 3, qualityRange: [2, 4], discoveryChance: 0.15 }
    ],
    '四海': [
        { name: '灵珠', rarity: 0.5, baseYield: 8, qualityRange: [2, 4], discoveryChance: 0.35 },
        { name: '海晶', rarity: 0.4, baseYield: 6, qualityRange: [2, 5], discoveryChance: 0.3 },
        { name: '珍珠', rarity: 0.6, baseYield: 12, qualityRange: [1, 3], discoveryChance: 0.4 },
        { name: '珊瑚', rarity: 0.25, baseYield: 3, qualityRange: [3, 5], discoveryChance: 0.2 },
        { name: '海藻精', rarity: 0.15, baseYield: 2, qualityRange: [4, 5], discoveryChance: 0.1 }
    ],
    '仙山': [
        { name: '仙露', rarity: 0.3, baseYield: 5, qualityRange: [3, 5], discoveryChance: 0.25 },
        { name: '天道石', rarity: 0.15, baseYield: 1, qualityRange: [4, 5], discoveryChance: 0.1 },
        { name: '仙芝', rarity: 0.35, baseYield: 4, qualityRange: [3, 5], discoveryChance: 0.3 },
        { name: '云母', rarity: 0.4, baseYield: 6, qualityRange: [2, 4], discoveryChance: 0.35 },
        { name: '九天玄铁', rarity: 0.08, baseYield: 1, qualityRange: [5, 5], discoveryChance: 0.05 }
    ],
    '魔域': [
        { name: '魔晶', rarity: 0.4, baseYield: 7, qualityRange: [2, 5], discoveryChance: 0.3 },
        { name: '邪气', rarity: 0.5, baseYield: 10, qualityRange: [1, 4], discoveryChance: 0.4 },
        { name: '魔核', rarity: 0.25, baseYield: 2, qualityRange: [3, 5], discoveryChance: 0.2 },
        { name: '暗黑精华', rarity: 0.12, baseYield: 1, qualityRange: [4, 5], discoveryChance: 0.1 },
        { name: '魔血', rarity: 0.18, baseYield: 3, qualityRange: [3, 5], discoveryChance: 0.15 }
    ]
};

// 区域特殊事件配置
export const REGION_SPECIAL_EVENTS = {
    '九州': [
        { name: '灵气潮汐', chance: 0.1, effect: { allRegionYield: 1.5 } },
        { name: '妖兽暴动', chance: 0.05, effect: { danger: 2 } }
    ],
    '四海': [
        { name: '海啸', chance: 0.08, effect: { regionYield: 0.5 } },
        { name: '龙宫盛宴', chance: 0.03, effect: { spiritStones: 500 } }
    ],
    '仙山': [
        { name: '天劫降临', chance: 0.02, effect: { cultivation: 2 } },
        { name: '仙人讲道', chance: 0.04, effect: { comprehension: 1.5 } }
    ],
    '魔域': [
        { name: '魔潮', chance: 0.1, effect: { danger: 3 } },
        { name: '心魔入侵', chance: 0.05, effect: { spirit: -50 } }
    ]
};

// 地图成就配置
export const MAP_ACHIEVEMENTS = {
    firstExploration: { name: '初探天下', description: '首次探索任意区域', reward: { spiritStones: 100 } },
    fullyExploredJiuzhou: { name: '九州通', description: '九州探索度达到100%', reward: { reputation: 50 } },
    fullyExploredSihai: { name: '四海归一', description: '四海探索度达到100%', reward: { spiritStones: 500 } },
    fullyExploredShanshan: { name: '仙山之主', description: '仙山探索度达到100%', reward: { cultivation: 10 } },
    fullyExploredMoyu: { name: '魔域征服者', description: '魔域探索度达到100%', reward: { combat: 0.2 } },
    allPortalsUnlocked: { name: '传送枢纽', description: '解锁所有传送阵', reward: { spiritStones: 1000 } },
    allRegionsFullyExplored: { name: '天下我有', description: '所有区域探索度达到100%', reward: { luck: 10, title: '天下行走' } }
};

/**
 * 创建区域实例
 */
export function createRegion(name, config) {
    return {
        name,
        level: config.level,
        resources: [...config.resources],
        explored: config.explored || 0,
        description: config.description || '',
        terrain: config.terrain || '未知',
        danger: config.danger || '未知',
        discoveredResources: [],
        portalUnlocked: false,
        lastExplored: null,
        explorationCount: 0,
        perfectExplorations: 0,
        specialEventsTriggered: []
    };
}