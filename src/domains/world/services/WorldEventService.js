/**
 * WorldEventService.js - 世界事件系统
 * V248: 世界事件系统 - 随机事件触发, 事件类型: 天灾/奇遇/神迹/浩劫, 事件选择机制, 事件影响计算
 */

import { WORLD_EVENTS, CATASTROPHE_EVENTS, DIVINE_EVENTS, SERENDIPITY_EVENTS } from '../entities/WorldEvent.js';

// 世界事件配置
export const WORLD_EVENT_CONFIG = {
    // 基础触发概率
    baseTriggerChance: 0.1,
    // 每日最大事件数
    maxEventsPerDay: 3,
    // 事件冷却时间(小时)
    eventCooldown: 24,
    // 事件持续时间(回合)
    eventDuration: 5,
    // 浩劫触发所需的世界混乱度
    catastropheChaosThreshold: 80,
    // 神迹触发的幸运阈值
    divineLuckThreshold: 0.95
};

// 事件类型常量
export const EVENT_TYPES = {
    NATURAL_DISASTER: '天灾',
    SERENDIPITY: '奇遇',
    DIVINE: '神迹',
    CATASTROPHE: '浩劫'
};

// 事件稀有度
export const EVENT_RARITY = {
    COMMON: { name: '普通', weight: 0.6, color: '#fff' },
    RARE: { name: '稀有', weight: 0.25, color: '#00f' },
    EPIC: { name: '史诗', weight: 0.12, color: '#f80' },
    LEGENDARY: { name: '传说', weight: 0.03, color: '#f0f' }
};

// 事件影响类型
export const IMPACT_TYPES = {
    SPIRIT_STONES: 'spiritStones',
    CULTIVATION: 'cultivation',
    REALM: 'realm',
    HEALTH: 'health',
    SPIRIT: 'spirit',
    REPUTATION: 'reputation',
    LUCK: 'luck',
    CHAOS: 'chaos'
};

/**
 * 创建世界事件状态
 */
export function createWorldEventState() {
    return {
        activeEvents: [],
        eventHistory: [],
        totalEventsTriggered: 0,
        eventStreak: 0,
        lastEventTime: null,
        chaosLevel: 0,
        worldLuck: 1.0,
        protectedRegions: [],
        eventQueue: [],
        dailyEventCount: 0,
        lastResetDate: new Date().toDateString()
    };
}

/**
 * 触发世界事件
 * @param {object} worldEventState - 世界事件状态
 * @param {object} player - 玩家状态
 * @param {object} celestialMap - 地图状态 (可选)
 * @returns {object} 事件结果
 */
export function triggerWorldEvent(worldEventState, player, celestialMap = null) {
    // 检查每日事件数限制
    const today = new Date().toDateString();
    if (worldEventState.lastResetDate !== today) {
        worldEventState.dailyEventCount = 0;
        worldEventState.lastResetDate = today;
    }
    
    if (worldEventState.dailyEventCount >= WORLD_EVENT_CONFIG.maxEventsPerDay) {
        return { triggered: false, message: '今日事件已达上限', reason: 'daily_limit' };
    }
    
    // 计算触发概率
    const baseChance = WORLD_EVENT_CONFIG.baseTriggerChance;
    const chaosBonus = worldEventState.chaosLevel / 200;
    const luckBonus = (player?.luck || 1) / 200;
    const finalChance = Math.min(0.5, baseChance + chaosBonus + luckBonus);
    
    if (Math.random() > finalChance) {
        return { triggered: false, message: '今日平静无事', reason: 'probability' };
    }
    
    // 选择事件类型
    const eventType = selectEventType(worldEventState, player);
    
    // 根据类型选择具体事件
    let selectedEvent;
    switch (eventType) {
        case EVENT_TYPES.CATASTROPHE:
            selectedEvent = selectCatastropheEvent(worldEventState);
            break;
        case EVENT_TYPES.DIVINE:
            selectedEvent = selectDivineEvent(player, worldEventState);
            break;
        case EVENT_TYPES.SERENDIPITY:
            selectedEvent = selectSerendipityEvent(player);
            break;
        case EVENT_TYPES.NATURAL_DISASTER:
        default:
            selectedEvent = selectNaturalDisasterEvent();
            break;
    }
    
    if (!selectedEvent) {
        return { triggered: false, message: '无法选择合适的事件', reason: 'no_event' };
    }
    
    // 创建事件实例
    const eventInstance = createEventInstance(selectedEvent, eventType, celestialMap);
    
    // 添加到活跃事件
    worldEventState.activeEvents.push(eventInstance);
    worldEventState.totalEventsTriggered++;
    worldEventState.dailyEventCount++;
    worldEventState.lastEventTime = Date.now();
    
    // 应用世界级影响
    applyWorldImpact(eventInstance, worldEventState);
    
    return {
        triggered: true,
        event: eventInstance,
        message: `${eventInstance.eventType}: ${eventInstance.message}`,
        rarity: eventInstance.rarity
    };
}

/**
 * 选择事件类型
 */
function selectEventType(worldEventState, player) {
    const roll = Math.random();
    const chaosLevel = worldEventState.chaosLevel;
    
    // 高混乱度增加浩劫概率
    if (chaosLevel >= WORLD_EVENT_CONFIG.catastropheChaosThreshold && roll < 0.2) {
        return EVENT_TYPES.CATASTROPHE;
    }
    
    // 高幸运增加神迹概率
    if ((player?.luck || 1) >= 100 && roll < WORLD_EVENT_CONFIG.divineLuckThreshold) {
        return EVENT_TYPES.DIVINE;
    }
    
    // 普通概率分布
    if (roll < 0.5) return EVENT_TYPES.NATURAL_DISASTER;
    if (roll < 0.75) return EVENT_TYPES.SERENDIPITY;
    if (roll < 0.9) return EVENT_TYPES.DIVINE;
    return EVENT_TYPES.CATASTROPHE;
}

/**
 * 选择天灾事件
 */
function selectNaturalDisasterEvent() {
    const events = Object.values(WORLD_EVENTS).filter(e => e.type === EVENT_TYPES.NATURAL_DISASTER);
    if (events.length === 0) return null;
    return events[Math.floor(Math.random() * events.length)];
}

/**
 * 选择浩劫事件
 */
function selectCatastropheEvent(worldEventState) {
    const events = Object.values(CATASTROPHE_EVENTS);
    if (events.length === 0) return null;
    
    // 根据混乱度加权选择
    const weights = events.map(e => e.chaosRequired ? e.chaosWeight || 1 : 1);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < events.length; i++) {
        random -= weights[i];
        if (random <= 0) return events[i];
    }
    
    return events[events.length - 1];
}

/**
 * 选择神迹事件
 */
function selectDivineEvent(player, worldEventState) {
    const events = Object.values(DIVINE_EVENTS);
    if (events.length === 0) return null;
    
    // 根据玩家修为等级筛选合适的事件
    const playerLevel = player?.realm || 1;
    const suitableEvents = events.filter(e => !e.minLevel || e.minLevel <= playerLevel);
    
    if (suitableEvents.length === 0) return events[0];
    return suitableEvents[Math.floor(Math.random() * suitableEvents.length)];
}

/**
 * 选择奇遇事件
 */
function selectSerendipityEvent(player) {
    const events = Object.values(SERENDIPITY_EVENTS);
    if (events.length === 0) return null;
    
    // 修为越高，遇到的奇遇越好
    const playerCultivation = player?.cultivation || 1;
    const suitableEvents = events.filter(e => !e.minCultivation || e.minCultivation <= playerCultivation);
    
    if (suitableEvents.length === 0) return events[0];
    
    // 按稀有度加权
    const weights = suitableEvents.map(e => e.rarity === 'LEGENDARY' ? 0.1 : e.rarity === 'EPIC' ? 0.3 : 1);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < suitableEvents.length; i++) {
        random -= weights[i];
        if (random <= 0) return suitableEvents[i];
    }
    
    return suitableEvents[suitableEvents.length - 1];
}

/**
 * 创建事件实例
 */
function createEventInstance(event, eventType, celestialMap) {
    const rarity = determineEventRarity(event);
    
    return {
        id: generateEventId(),
        eventType,
        name: event.name || event.message,
        message: event.message,
        effects: { ...event.effect },
        rarity,
        rarityColor: EVENT_RARITY[rarity].color,
        duration: event.duration || WORLD_EVENT_CONFIG.eventDuration,
        startTime: Date.now(),
        affectedRegions: celestialMap ? Object.keys(celestialMap.regions) : [],
        isGlobal: event.isGlobal !== false,
        canResist: event.canResist !== false,
        baseProbability: event.probability || 0.1
    };
}

/**
 * 确定事件稀有度
 */
function determineEventRarity(event) {
    const probability = event.probability || 0.1;
    
    if (probability <= 0.02) return 'LEGENDARY';
    if (probability <= 0.05) return 'EPIC';
    if (probability <= 0.15) return 'RARE';
    return 'COMMON';
}

/**
 * 生成事件ID
 */
function generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 应用世界影响
 */
function applyWorldImpact(event, worldEventState) {
    // 增加混乱度
    if (event.eventType === EVENT_TYPES.CATASTROPHE) {
        worldEventState.chaosLevel = Math.min(100, worldEventState.chaosLevel + 15);
    } else if (event.eventType === EVENT_TYPES.NATURAL_DISASTER) {
        worldEventState.chaosLevel = Math.min(100, worldEventState.chaosLevel + 5);
    } else if (event.eventType === EVENT_TYPES.DIVINE) {
        worldEventState.chaosLevel = Math.max(0, worldEventState.chaosLevel - 10);
    }
    
    // 更新世界幸运
    if (event.eventType === EVENT_TYPES.SERENDIPITY) {
        worldEventState.worldLuck = Math.min(2.0, worldEventState.worldLuck + 0.1);
    }
}

/**
 * 计算事件对玩家的影响
 * @param {object} event - 事件实例
 * @param {object} player - 玩家状态
 * @param {object} celestialMap - 地图状态
 * @returns {object} 影响结果
 */
export function calculateEventImpact(event, player, celestialMap = null) {
    const impactResult = {
        spiritStones: 0,
        cultivation: 0,
        realm: 0,
        health: 0,
        spirit: 0,
        reputation: 0,
        luck: 0,
        chaos: 0
    };
    
    const effects = event.effects || {};
    
    // 应用基础效果
    for (const [key, value] of Object.entries(effects)) {
        if (key in impactResult) {
            // 根据稀有度调整效果
            const rarityMultiplier = {
                'COMMON': 1,
                'RARE': 1.5,
                'EPIC': 2,
                'LEGENDARY': 3
            }[event.rarity] || 1;
            
            impactResult[key] = Math.floor(value * rarityMultiplier);
        }
    }
    
    // 检查抵抗
    if (event.canResist) {
        const resistance = calculatePlayerResistance(player, event, celestialMap);
        for (const key of Object.keys(impactResult)) {
            if (impactResult[key] < 0) {
                impactResult[key] = Math.floor(impactResult[key] * (1 - resistance));
            }
        }
    }
    
    // 检查保护区域
    if (celestialMap && event.affectedRegions) {
        const currentRegion = celestialMap.currentRegion;
        if (currentRegion && worldEventState?.protectedRegions?.includes(currentRegion)) {
            for (const key of Object.keys(impactResult)) {
                if (impactResult[key] < 0) {
                    impactResult[key] = 0;
                }
            }
        }
    }
    
    return impactResult;
}

/**
 * 计算玩家抵抗率
 */
function calculatePlayerResistance(player, event, celestialMap) {
    let resistance = 0;
    
    // 修为抵抗
    if (player?.cultivation) {
        resistance += player.cultivation / 1000;
    }
    
    // 境界抵抗
    if (player?.realm) {
        resistance += player.realm * 0.02;
    }
    
    // 区域探索加成
    if (celestialMap?.currentRegion) {
        const region = celestialMap.regions[celestialMap.currentRegion];
        if (region) {
            resistance += region.explored / 500;
        }
    }
    
    return Math.min(0.8, resistance);
}

/**
 * 应用事件影响到玩家
 */
export function applyEventEffectsToPlayer(event, player, celestialMap = null) {
    const impact = calculateEventImpact(event, player, celestialMap);
    const applied = {};
    
    if (typeof gameState !== 'undefined') {
        if (impact.spiritStones !== 0) {
            gameState.spiritStones = Math.max(0, gameState.spiritStones + impact.spiritStones);
            applied.spiritStones = impact.spiritStones;
        }
        
        if (impact.cultivation !== 0) {
            gameState.cultivation = (gameState.cultivation || 0) + impact.cultivation;
            applied.cultivation = impact.cultivation;
        }
        
        if (impact.realm !== 0) {
            gameState.realm = Math.max(1, Math.min(13, gameState.realm + impact.realm));
            applied.realm = impact.realm;
        }
        
        if (impact.health !== 0) {
            gameState.health = Math.max(0, Math.min(gameState.maxHealth || 100, gameState.health + impact.health));
            applied.health = impact.health;
        }
        
        if (impact.spirit !== 0) {
            gameState.spirit = Math.max(0, Math.min(gameState.maxSpirit || 100, gameState.spirit + impact.spirit));
            applied.spirit = impact.spirit;
        }
        
        if (impact.luck !== 0) {
            gameState.luck = (gameState.luck || 1) + impact.luck;
            applied.luck = impact.luck;
        }
    }
    
    return {
        applied,
        eventId: event.id,
        eventName: event.name
    };
}

/**
 * 结束事件
 */
export function endEvent(eventId, worldEventState) {
    const eventIndex = worldEventState.activeEvents.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
        return { success: false, message: '事件不存在' };
    }
    
    const event = worldEventState.activeEvents[eventIndex];
    worldEventState.activeEvents.splice(eventIndex, 1);
    worldEventState.eventHistory.push({
        ...event,
        endTime: Date.now()
    });
    
    return {
        success: true,
        message: `${event.name} 已结束`,
        event
    };
}

/**
 * 推进事件回合
 */
export function tickEvents(worldEventState) {
    const now = Date.now();
    const expiredEvents = [];
    
    for (const event of worldEventState.activeEvents) {
        const duration = event.duration * 60000; // 转换为毫秒
        if (now - event.startTime >= duration) {
            expiredEvents.push(event);
        }
    }
    
    const results = expiredEvents.map(event => endEvent(event.id, worldEventState));
    
    return {
        expiredCount: expiredEvents.length,
        results
    };
}

/**
 * 获取活跃事件列表
 */
export function getActiveEvents(worldEventState) {
    return worldEventState.activeEvents.map(event => ({
        id: event.id,
        name: event.name,
        type: event.eventType,
        rarity: event.rarity,
        rarityColor: event.rarityColor,
        message: event.message,
        remainingDuration: Math.max(0, event.duration - Math.floor((Date.now() - event.startTime) / 60000)),
        effects: event.effects
    }));
}

/**
 * 获取事件历史
 */
export function getEventHistory(worldEventState, limit = 20) {
    return worldEventState.eventHistory.slice(-limit).map(event => ({
        name: event.name,
        type: event.eventType,
        rarity: event.rarity,
        endTime: event.endTime
    }));
}

/**
 * 设置区域保护
 */
export function setRegionProtection(regionName, protect, worldEventState) {
    if (protect) {
        if (!worldEventState.protectedRegions.includes(regionName)) {
            worldEventState.protectedRegions.push(regionName);
        }
    } else {
        worldEventState.protectedRegions = worldEventState.protectedRegions.filter(r => r !== regionName);
    }
    
    return {
        success: true,
        protected: protect,
        region: regionName
    };
}

/**
 * 获取世界状态摘要
 */
export function getWorldStatus(worldEventState) {
    return {
        activeEventCount: worldEventState.activeEvents.length,
        totalEventsTriggered: worldEventState.totalEventsTriggered,
        chaosLevel: worldEventState.chaosLevel,
        worldLuck: worldEventState.worldLuck,
        protectedRegions: worldEventState.protectedRegions,
        eventStreak: worldEventState.eventStreak,
        dailyEventCount: worldEventState.dailyEventCount,
        maxDailyEvents: WORLD_EVENT_CONFIG.maxEventsPerDay
    };
}

/**
 * 祈福消灾（消耗灵石减少混乱度）
 */
export function performRitual(spiritStoneCost, worldEventState) {
    if (typeof gameState !== 'undefined' && gameState.spiritStones < spiritStoneCost) {
        return { success: false, message: '灵石不足' };
    }
    
    if (typeof gameState !== 'undefined') {
        gameState.spiritStones -= spiritStoneCost;
    }
    
    const chaosReduction = Math.floor(spiritStoneCost / 100);
    worldEventState.chaosLevel = Math.max(0, worldEventState.chaosLevel - chaosReduction);
    
    return {
        success: true,
        message: `祈福成功！混乱度降低 ${chaosReduction}`,
        newChaosLevel: worldEventState.chaosLevel
    };
}

/**
 * 检查事件是否可以触发
 */
export function canTriggerEvent(worldEventState) {
    const today = new Date().toDateString();
    if (worldEventState.lastResetDate !== today) {
        return { canTrigger: true, reason: 'new_day' };
    }
    
    if (worldEventState.dailyEventCount >= WORLD_EVENT_CONFIG.maxEventsPerDay) {
        return { canTrigger: false, reason: 'daily_limit', remaining: 0 };
    }
    
    if (worldEventState.lastEventTime) {
        const hoursSinceLastEvent = (Date.now() - worldEventState.lastEventTime) / 3600000;
        if (hoursSinceLastEvent < 1) {
            return { canTrigger: false, reason: 'cooldown', remaining: Math.ceil(60 - hoursSinceLastEvent * 60) };
        }
    }
    
    return { canTrigger: true };
}

/**
 * 手动触发特定类型事件（用于测试或特殊玩法）
 */
export function forceTriggerEvent(eventType, worldEventState, player) {
    let selectedEvent;
    
    switch (eventType) {
        case EVENT_TYPES.NATURAL_DISASTER:
            selectedEvent = selectNaturalDisasterEvent();
            break;
        case EVENT_TYPES.CATASTROPHE:
            selectedEvent = selectCatastropheEvent(worldEventState);
            break;
        case EVENT_TYPES.DIVINE:
            selectedEvent = selectDivineEvent(player, worldEventState);
            break;
        case EVENT_TYPES.SERENDIPITY:
            selectedEvent = selectSerendipityEvent(player);
            break;
        default:
            return { success: false, message: '未知事件类型' };
    }
    
    if (!selectedEvent) {
        return { success: false, message: '无法找到该类型事件' };
    }
    
    const eventInstance = createEventInstance(selectedEvent, eventType, null);
    worldEventState.activeEvents.push(eventInstance);
    worldEventState.totalEventsTriggered++;
    
    return {
        success: true,
        event: eventInstance,
        message: `强制触发: ${eventInstance.name}`
    };
}