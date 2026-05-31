/**
 * CelestialMapService.js - 仙界地图系统
 * V248: 仙界地图系统 - 世界地图: 九州/四海/仙山/魔域, 区域探索度, 传送阵连接, 区域资源分布
 */

import { WORLD_REGIONS, PORTAL_CONNECTIONS, RESOURCE_DISTRIBUTION } from '../entities/CelestialMap.js';

// 区域探索度配置
export const EXPLORATION_CONFIG = {
    // 每次探索增加的基础探索度
    baseExplorationGain: 5,
    // 完美探索加成
    perfectBonus: 2,
    // 探索消耗行动力
    actionPointCost: 10,
    // 探索度等级阈值
    explorationLevels: [
        { threshold: 0, name: '未探索', color: '#666' },
        { threshold: 20, name: '初步探索', color: '#9cf' },
        { threshold: 50, name: '部分探索', color: '#6f9' },
        { threshold: 80, name: '深度探索', color: '#96f' },
        { threshold: 100, name: '完全探索', color: '#ffd700' }
    ]
};

// 传送阵配置
export const PORTAL_CONFIG = {
    // 传送消耗灵石
    spiritStoneCost: 100,
    // 传送冷却时间(回合)
    cooldown: 3,
    // 解锁新传送阵需要的探索度
    unlockExplorationRequired: 50
};

// 资源采集配置
export const GATHERING_CONFIG = {
    // 采集消耗行动力
    actionPointCost: 5,
    // 采集基础时间(秒/产出间隔)
    baseInterval: 10,
    // 资源品质骰子
    qualityDice: [1, 2, 3, 4, 5, 6],
    // 品质权重 (普通, 精良, 稀有, 传说, 神级)
    qualityWeights: [0.5, 0.3, 0.15, 0.04, 0.01],
    // 品质颜色映射
    qualityColors: {
        '普通': '#fff',
        '精良': '#0f0',
        '稀有': '#00f',
        '传说': '#f80',
        '神级': '#f0f'
    }
};

/**
 * 创建仙界地图状态
 */
export function createCelestialMapState() {
    const regions = {};
    for (const [name, config] of Object.entries(WORLD_REGIONS)) {
        regions[name] = {
            name: name,
            level: config.level,
            resources: [...config.resources],
            explored: config.explored || 0,
            discoveredResources: [],
            portalUnlocked: false,
            lastExplored: null,
            explorationCount: 0,
            perfectExplorations: 0
        };
    }
    
    return {
        regions,
        currentRegion: null,
        totalExplored: 0,
        actionPoints: 100,
        maxActionPoints: 100,
        portalCooldowns: {},
        gatheringActive: false,
        gatheringRegion: null,
        gatheringResource: null,
        gatheringTimer: null,
        gatheredAmount: 0
    };
}

/**
 * 获取区域探索等级信息
 */
export function getExplorationLevel(explored) {
    const levels = EXPLORATION_CONFIG.explorationLevels;
    for (let i = levels.length - 1; i >= 0; i--) {
        if (explored >= levels[i].threshold) {
            return levels[i];
        }
    }
    return levels[0];
}

/**
 * 获取区域信息
 */
export function getRegionInfo(regionName, celestialMap) {
    const region = celestialMap.regions[regionName];
    if (!region) return null;
    
    return {
        ...region,
        explorationLevel: getExplorationLevel(region.explored),
        isUnlocked: region.portalUnlocked || region.explored >= PORTAL_CONFIG.unlockExplorationRequired,
        canExplore: celestialMap.actionPoints >= EXPLORATION_CONFIG.actionPointCost,
        canGather: region.explored > 0 && celestialMap.actionPoints >= GATHERING_CONFIG.actionPointCost
    };
}

/**
 * 探索区域
 * @param {string} regionName - 区域名称
 * @param {object} celestialMap - 地图状态
 * @param {object} player - 玩家状态 (可选)
 * @returns {object} 探索结果
 */
export function exploreRegion(regionName, celestialMap, player = null) {
    const region = celestialMap.regions[regionName];
    if (!region) {
        return { success: false, message: '区域不存在' };
    }
    
    if (celestialMap.actionPoints < EXPLORATION_CONFIG.actionPointCost) {
        return { success: false, message: '行动力不足' };
    }
    
    // 消耗行动力
    celestialMap.actionPoints -= EXPLORATION_CONFIG.actionPointCost;
    
    // 计算探索成果
    const baseGain = EXPLORATION_CONFIG.baseExplorationGain;
    const playerBonus = player ? Math.floor(player.cultivation / 50) : 0;
    const perfectRoll = Math.random();
    const isPerfect = perfectRoll > 0.8;
    
    let gain = baseGain + playerBonus;
    if (isPerfect) {
        gain += EXPLORATION_CONFIG.perfectBonus;
        region.perfectExplorations++;
    }
    
    // 应用探索度上限
    const oldExplored = region.explored;
    region.explored = Math.min(100, region.explored + gain);
    const actualGain = region.explored - oldExplored;
    
    region.explorationCount++;
    region.lastExplored = Date.now();
    
    // 更新总探索度
    celestialMap.totalExplored += actualGain;
    
    // 发现新资源
    const resources = RESOURCE_DISTRIBUTION[regionName] || [];
    const newResources = [];
    for (const res of resources) {
        if (!region.discoveredResources.includes(res.name) && Math.random() < res.discoveryChance) {
            region.discoveredResources.push(res.name);
            newResources.push(res.name);
        }
    }
    
    // 检查传送阵解锁
    if (!region.portalUnlocked && region.explored >= PORTAL_CONFIG.unlockExplorationRequired) {
        region.portalUnlocked = true;
    }
    
    return {
        success: true,
        message: isPerfect ? `完美探索！探索度 +${actualGain}` : `探索成功！探索度 +${actualGain}`,
        isPerfect,
        oldExplored,
        newExplored: region.explored,
        gain: actualGain,
        newResources,
        portalUnlocked: region.portalUnlocked
    };
}

/**
 * 传送至区域
 * @param {string} targetRegion - 目标区域
 * @param {string} currentRegion - 当前区域
 * @param {object} celestialMap - 地图状态
 * @returns {object} 传送结果
 */
export function teleportToRegion(targetRegion, currentRegion, celestialMap) {
    const target = celestialMap.regions[targetRegion];
    const portalKey = `${currentRegion}_${targetRegion}`;
    
    if (!target) {
        return { success: false, message: '目标区域不存在' };
    }
    
    if (!target.portalUnlocked) {
        return { success: false, message: '传送阵未解锁，需要探索度达到 ' + PORTAL_CONFIG.unlockExplorationRequired };
    }
    
    if (celestialMap.portalCooldowns[portalKey] && celestialMap.portalCooldowns[portalKey] > Date.now()) {
        const remaining = Math.ceil((celestialMap.portalCooldowns[portalKey] - Date.now()) / 1000);
        return { success: false, message: `传送阵冷却中，剩余 ${remaining} 秒` };
    }
    
    if (gameState && gameState.spiritStones < PORTAL_CONFIG.spiritStoneCost) {
        return { success: false, message: '灵石不足，传送需要 ' + PORTAL_CONFIG.spiritStoneCost + ' 灵石' };
    }
    
    // 消耗灵石
    if (typeof gameState !== 'undefined') {
        gameState.spiritStones -= PORTAL_CONFIG.spiritStoneCost;
    }
    
    // 设置冷却
    celestialMap.portalCooldowns[portalKey] = Date.now() + PORTAL_CONFIG.cooldown * 1000;
    celestialMap.currentRegion = targetRegion;
    
    return {
        success: true,
        message: `传送至 ${targetRegion} 成功！消耗 ${PORTAL_CONFIG.spiritStoneCost} 灵石`,
        newRegion: targetRegion
    };
}

/**
 * 获取传送阵连接信息
 */
export function getPortalConnections(regionName, celestialMap) {
    const connections = [];
    
    for (const [from, to] of Object.entries(PORTAL_CONNECTIONS)) {
        if (from === regionName || to === regionName) {
            const connectedRegion = from === regionName ? to : from;
            const portalKey = `${from}_${to}`;
            const isUnlocked = celestialMap.regions[connectedRegion]?.portalUnlocked || false;
            const isOnCooldown = celestialMap.portalCooldowns[portalKey] && celestialMap.portalCooldowns[portalKey] > Date.now();
            
            connections.push({
                from,
                to,
                connectedRegion,
                isUnlocked,
                isOnCooldown,
                cooldownRemaining: isOnCooldown ? Math.ceil((celestialMap.portalCooldowns[portalKey] - Date.now()) / 1000) : 0
            });
        }
    }
    
    return connections;
}

/**
 * 开始资源采集
 */
export function startGathering(regionName, resourceName, celestialMap) {
    const region = celestialMap.regions[regionName];
    if (!region) {
        return { success: false, message: '区域不存在' };
    }
    
    if (celestialMap.actionPoints < GATHERING_CONFIG.actionPointCost) {
        return { success: false, message: '行动力不足' };
    }
    
    if (!region.discoveredResources.includes(resourceName)) {
        return { success: false, message: '该资源未在区域中发现' };
    }
    
    celestialMap.actionPoints -= GATHERING_CONFIG.actionPointCost;
    celestialMap.gatheringActive = true;
    celestialMap.gatheringRegion = regionName;
    celestialMap.gatheringResource = resourceName;
    celestialMap.gatheredAmount = 0;
    
    return {
        success: true,
        message: `开始采集 ${resourceName}`,
        region: regionName,
        resource: resourceName,
        actionPointsSpent: GATHERING_CONFIG.actionPointCost
    };
}

/**
 * 采集资源（单次）
 */
export function gatherResource(celestialMap) {
    if (!celestialMap.gatheringActive) {
        return { success: false, message: '当前没有进行采集' };
    }
    
    const regionName = celestialMap.gatheringRegion;
    const resourceName = celestialMap.gatheringResource;
    const region = celestialMap.regions[regionName];
    
    if (!region) {
        celestialMap.gatheringActive = false;
        return { success: false, message: '区域不存在' };
    }
    
    // 计算品质
    const roll = Math.random();
    let cumulative = 0;
    let quality = '普通';
    let qualityIndex = 0;
    
    for (let i = 0; i < GATHERING_CONFIG.qualityWeights.length; i++) {
        cumulative += GATHERING_CONFIG.qualityWeights[i];
        if (roll < cumulative) {
            qualityIndex = i;
            const qualities = ['普通', '精良', '稀有', '传说', '神级'];
            quality = qualities[i];
            break;
        }
    }
    
    // 计算产出数量
    const baseAmount = 1 + Math.floor(Math.random() * 3);
    const qualityBonus = [1, 1.5, 2, 3, 5][qualityIndex];
    const amount = Math.floor(baseAmount * qualityBonus);
    
    celestialMap.gatheredAmount += amount;
    
    return {
        success: true,
        message: `获得 ${amount} 个 ${quality}品质 ${resourceName}`,
        resource: resourceName,
        quality,
        amount,
        totalGathered: celestialMap.gatheredAmount,
        qualityColor: GATHERING_CONFIG.qualityColors[quality]
    };
}

/**
 * 停止采集
 */
export function stopGathering(celestialMap) {
    if (!celestialMap.gatheringActive) {
        return { success: false, message: '当前没有进行采集' };
    }
    
    const result = {
        success: true,
        message: `采集结束，共获得 ${celestialMap.gatheredAmount} 个 ${celestialMap.gatheringResource}`,
        region: celestialMap.gatheringRegion,
        resource: celestialMap.gatheringResource,
        totalAmount: celestialMap.gatheredAmount
    };
    
    celestialMap.gatheringActive = false;
    celestialMap.gatheringRegion = null;
    celestialMap.gatheringResource = null;
    celestialMap.gatheredAmount = 0;
    
    return result;
}

/**
 * 获取区域资源分布
 */
export function getResourceDistribution(regionName) {
    return RESOURCE_DISTRIBUTION[regionName] || [];
}

/**
 * 获取所有区域状态摘要
 */
export function getAllRegionsSummary(celestialMap) {
    return Object.entries(celestialMap.regions).map(([name, region]) => ({
        name,
        explored: region.explored,
        explorationLevel: getExplorationLevel(region.explored),
        resourceCount: region.discoveredResources.length,
        portalUnlocked: region.portalUnlocked
    }));
}

/**
 * 恢复行动力
 * @param {number} amount - 恢复量
 * @param {object} celestialMap - 地图状态
 */
export function restoreActionPoints(amount, celestialMap) {
    const oldPoints = celestialMap.actionPoints;
    celestialMap.actionPoints = Math.min(celestialMap.maxActionPoints, celestialMap.actionPoints + amount);
    return {
        restored: celestialMap.actionPoints - oldPoints,
        current: celestialMap.actionPoints,
        max: celestialMap.maxActionPoints
    };
}

/**
 * 检查是否满足进入区域的条件
 * @param {string} regionName - 区域名称
 * @param {object} player - 玩家状态
 * @param {object} celestialMap - 地图状态
 */
export function canEnterRegion(regionName, player, celestialMap) {
    const region = celestialMap.regions[regionName];
    if (!region) {
        return { allowed: false, reason: '区域不存在' };
    }
    
    const playerLevel = player?.realm || 1;
    const [minLevel, maxLevel] = region.level;
    
    if (playerLevel < minLevel) {
        return { allowed: false, reason: `修为不足，需要达到境界等级 ${minLevel}` };
    }
    
    if (playerLevel > maxLevel) {
        return { allowed: false, reason: `修为过高，此区域最高支持境界等级 ${maxLevel}` };
    }
    
    if (!region.portalUnlocked && region.explored < PORTAL_CONFIG.unlockExplorationRequired) {
        return { allowed: false, reason: `探索度不足，需要探索度达到 ${PORTAL_CONFIG.unlockExplorationRequired}` };
    }
    
    return { allowed: true };
}

/**
 * 获取地图总览信息
 */
export function getMapOverview(celestialMap) {
    const regions = getAllRegionsSummary(celestialMap);
    const totalExploredPercent = regions.length > 0 
        ? regions.reduce((sum, r) => sum + r.explored, 0) / regions.length 
        : 0;
    
    return {
        totalRegions: regions.length,
        totalExploredPercent: Math.round(totalExploredPercent * 10) / 10,
        fullyExploredCount: regions.filter(r => r.explored >= 100).length,
        unlockedPortalCount: regions.filter(r => r.portalUnlocked).length,
        regions,
        actionPoints: celestialMap.actionPoints,
        maxActionPoints: celestialMap.maxActionPoints
    };
}

/**
 * 计算区域难度等级
 */
export function calculateRegionDifficulty(regionName) {
    const region = WORLD_REGIONS[regionName];
    if (!region) return null;
    
    const [min, max] = region.level;
    const avgLevel = (min + max) / 2;
    
    let difficulty = '简单';
    if (avgLevel >= 70) difficulty = '极难';
    else if (avgLevel >= 50) difficulty = '困难';
    else if (avgLevel >= 20) difficulty = '中等';
    
    return {
        name: regionName,
        minLevel: min,
        maxLevel: max,
        avgLevel,
        difficulty,
        recommendedCultivation: Math.ceil(avgLevel / 10)
    };
}

/**
 * 重置区域探索进度
 */
export function resetRegionExploration(regionName, celestialMap) {
    const region = celestialMap.regions[regionName];
    if (!region) {
        return { success: false, message: '区域不存在' };
    }
    
    region.explored = 0;
    region.discoveredResources = [];
    region.portalUnlocked = false;
    region.lastExplored = null;
    region.explorationCount = 0;
    region.perfectExplorations = 0;
    
    return {
        success: true,
        message: `${regionName} 探索进度已重置`
    };
}