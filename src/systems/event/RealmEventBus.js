/**
 * RealmEventBus.js - 仙界事件总线
 * Direction O: 仙界全局事件总线 + 事件级联触发机制
 * 
 * 核心机制：
 * 1. REALM_EVENT_BUS - 全局事件总线，连接所有游戏系统
 * 2. SUBSCRIBER_REGISTRY - 订阅者注册表，支持glob模式匹配
 * 3. EVENT_CASCADING - 事件级联触发，防止循环依赖检测
 * 
 * 事件类型：player.cultivation.breakthrough, npc.interact, realm.quake, 
 *          sect.war, treasure.discovered 等
 * 事件属性：type, source, target, timestamp, data, priority
 */

import { npcMessageBus } from '../ai/NPCCollaboration.js';

// ===== 配置常量 =====

const EVENT_CONFIG = {
    maxHistoryLength: 1000,
    maxSubscribersPerEvent: 100,
    cascadeDepthLimit: 5,
    defaultPriority: 'medium'
};

const EVENT_PRIORITIES = {
    high: 3,
    medium: 2,
    low: 1
};

const REALM_EVENT_TYPES = {
    // 玩家事件
    PLAYER_CULTIVATION_BREAKTHROUGH: 'player.cultivation.breakthrough',
    PLAYER_LEVEL_UP: 'player.level.up',
    PLAYER_QUESTS_COMPLETE: 'player.quest.complete',
    
    // NPC事件
    NPC_INTERACT: 'npc.interact',
    NPC_SPAWN: 'npc.spawn',
    NPC_DEFEAT: 'npc.defeat',
    
    // 仙界事件
    REALM_QUAKE: 'realm.quake',
    REALM_TRIBULATION: 'realm.tribulation',
    REALM_BLESSING: 'realm.blessing',
    
    // 宗门事件
    SECT_WAR: 'sect.war',
    SECT_JOIN: 'sect.join',
    SECT_TASK: 'sect.task',
    
    // 宝藏事件
    TREASURE_DISCOVERED: 'treasure.discovered',
    TREASURE_OPENED: 'treasure.opened',
    
    // 系统事件
    SYSTEM_INIT: 'system.init',
    SYSTEM_SAVE: 'system.save',
    SYSTEM_LOAD: 'system.load'
};

// ===== 仙界事件总线 =====

/**
 * RealmEvent - 单个事件对象
 */
class RealmEvent {
    constructor(type, data = {}, options = {}) {
        this.id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.type = type;
        this.source = options.source || 'system';
        this.target = options.target || null;
        this.timestamp = options.timestamp || Date.now();
        this.data = data;
        this.priority = options.priority || EVENT_CONFIG.defaultPriority;
        this.cascadeLevel = options.cascadeLevel || 0;
        this.processed = false;
    }
    
    /**
     * 获取优先级数值
     */
    getPriorityValue() {
        return EVENT_PRIORITIES[this.priority] || EVENT_PRIORITIES.medium;
    }
}

/**
 * SubscriberEntry - 订阅者条目
 */
class SubscriberEntry {
    constructor(pattern, callback, options = {}) {
        this.id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.pattern = pattern;  // 支持glob模式如 'player.*'
        this.callback = callback;
        this.priority = options.priority || EVENT_PRIORITIES.medium;
        this.subscriberId = options.subscriberId || 'anonymous';
        this.active = true;
        this.matchCount = 0;
        this.createdAt = Date.now();
    }
    
    /**
     * 获取优先级数值
     */
    getPriorityValue() {
        return this.priority;
    }
}

/**
 * RealmEventBus - 仙界事件总线
 * 实现全局事件发布/订阅机制，支持事件级联
 */
class RealmEventBus {
    constructor() {
        this.subscribers = new Map();     // eventType -> SubscriberEntry[]
        this.eventHistory = [];           // 事件历史
        this.subscriberStats = new Map(); // subscriberId -> stats
        this.cascadeTracking = new Set(); // 用于检测循环依赖
        this.eventIdCounter = 0;
        this.listenerCount = 0;
    }
    
    /**
     * 创建事件
     */
    createEvent(type, data = {}, options = {}) {
        return new RealmEvent(type, data, options);
    }
    
    /**
     * 发布事件
     */
    publish(type, data = {}, options = {}) {
        const event = this.createEvent(type, data, options);
        
        // 添加到历史
        this.eventHistory.push(event);
        if (this.eventHistory.length > EVENT_CONFIG.maxHistoryLength) {
            this.eventHistory = this.eventHistory.slice(-EVENT_CONFIG.maxHistoryLength);
        }
        
        // 获取匹配的订阅者
        const matchedSubscribers = this.getMatchedSubscribers(type);
        
        // 按优先级排序 (high > medium > low)
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        matchedSubscribers.sort((a, b) => {
            const aVal = priorityOrder[a.getPriorityValue()] || 2;
            const bVal = priorityOrder[b.getPriorityValue()] || 2;
            return bVal - aVal;
        });
        
        // 执行回调
        const results = [];
        for (const subscriber of matchedSubscribers) {
            if (subscriber.active) {
                try {
                    const result = subscriber.callback(event);
                    subscriber.matchCount++;
                    results.push({
                        subscriberId: subscriber.subscriberId,
                        success: true,
                        result
                    });
                } catch (e) {
                    results.push({
                        subscriberId: subscriber.subscriberId,
                        success: false,
                        error: e.message
                    });
                }
            }
        }
        
        return {
            success: true,
            eventId: event.id,
            type: event.type,
            timestamp: event.timestamp,
            matchedCount: matchedSubscribers.length,
            results
        };
    }
    
    /**
     * 订阅事件
     */
    subscribe(pattern, callback, options = {}) {
        const subscriber = new SubscriberEntry(pattern, callback, options);
        
        // 初始化该模式的订阅者数组
        if (!this.subscribers.has(pattern)) {
            this.subscribers.set(pattern, []);
        }
        
        // 检查订阅者数量限制
        const subs = this.subscribers.get(pattern);
        if (subs.length >= EVENT_CONFIG.maxSubscribersPerEvent) {
            return { 
                success: false, 
                error: 'Max subscribers reached for this pattern',
                subscriberId: null
            };
        }
        
        subs.push(subscriber);
        this.listenerCount++;
        
        // 更新订阅者统计
        const stats = this.subscriberStats.get(subscriber.subscriberId) || { 
            activeSubscriptions: 0, 
            totalMatches: 0 
        };
        stats.activeSubscriptions++;
        this.subscriberStats.set(subscriber.subscriberId, stats);
        
        return {
            success: true,
            subscriberId: subscriber.id,
            pattern: subscriber.pattern
        };
    }
    
    /**
     * 取消订阅
     */
    unsubscribe(subscriberId) {
        let found = false;
        
        for (const [pattern, subs] of this.subscribers) {
            const index = subs.findIndex(s => s.id === subscriberId);
            if (index >= 0) {
                const sub = subs[index];
                sub.active = false;
                subs.splice(index, 1);
                this.listenerCount--;
                found = true;
                
                // 更新统计
                const stats = this.subscriberStats.get(sub.subscriberId);
                if (stats) {
                    stats.activeSubscriptions--;
                }
                break;
            }
        }
        
        return { success: found };
    }
    
    /**
     * 取消订阅指定模式和订阅者ID
     */
    unsubscribeByPattern(pattern, subscriberId) {
        const subs = this.subscribers.get(pattern);
        if (!subs) return { success: false };
        
        const index = subs.findIndex(s => 
            s.id === subscriberId || s.subscriberId === subscriberId
        );
        
        if (index >= 0) {
            const sub = subs[index];
            sub.active = false;
            subs.splice(index, 1);
            this.listenerCount--;
            
            const stats = this.subscriberStats.get(sub.subscriberId);
            if (stats) {
                stats.activeSubscriptions--;
            }
            
            return { success: true };
        }
        
        return { success: false };
    }
    
    /**
     * 获取事件历史
     */
    history(options = {}) {
        const {
            eventType = null,
            source = null,
            since = 0,
            limit = 100
        } = options;
        
        let filtered = this.eventHistory;
        
        if (eventType) {
            filtered = filtered.filter(e => e.type === eventType);
        }
        
        if (source) {
            filtered = filtered.filter(e => e.source === source);
        }
        
        if (since > 0) {
            filtered = filtered.filter(e => e.timestamp >= since);
        }
        
        return filtered.slice(-limit);
    }
    
    /**
     * 获取订阅者列表
     */
    listSubscribers(options = {}) {
        const { pattern = null, subscriberId = null } = options;
        
        const allSubscribers = [];
        
        for (const [pat, subs] of this.subscribers) {
            for (const sub of subs) {
                if (!sub.active) continue;
                
                if (pattern && !this.matchPattern(pat, pattern)) continue;
                if (subscriberId && sub.subscriberId !== subscriberId) continue;
                
                allSubscribers.push({
                    id: sub.id,
                    pattern: sub.pattern,
                    subscriberId: sub.subscriberId,
                    priority: sub.priority,
                    matchCount: sub.matchCount,
                    active: sub.active,
                    createdAt: sub.createdAt
                });
            }
        }
        
        return allSubscribers;
    }
    
    /**
     * 触发事件级联
     * 用于手动触发事件链式反应
     */
    triggerCascade(initialEvent, cascadeConfig = {}) {
        const {
            maxDepth = EVENT_CONFIG.cascadeDepthLimit,
            followUpEvents = []
        } = cascadeConfig;
        
        // 检测循环依赖
        if (this.cascadeTracking.has(initialEvent.type)) {
            return {
                success: false,
                error: 'Circular cascade detected',
                eventType: initialEvent.type
            };
        }
        
        // 创建事件
        const event = this.createEvent(initialEvent.type, initialEvent.data || {}, {
            source: initialEvent.source || 'cascade',
            cascadeLevel: 0
        });
        
        // 追踪链
        this.cascadeTracking.add(event.type);
        
        const cascadeResults = [];
        
        try {
            // 发布初始事件
            const initialResult = this.publish(event.type, event.data, {
                source: event.source,
                cascadeLevel: 0
            });
            cascadeResults.push({
                level: 0,
                eventType: event.type,
                result: initialResult
            });
            
            // 递归处理后续事件
            let currentLevel = 0;
            let pendingEvents = [...followUpEvents];
            
            while (pendingEvents.length > 0 && currentLevel < maxDepth) {
                currentLevel++;
                const nextEvent = pendingEvents.shift();
                
                const result = this.publish(nextEvent.type, nextEvent.data || {}, {
                    source: 'cascade',
                    cascadeLevel: currentLevel
                });
                
                cascadeResults.push({
                    level: currentLevel,
                    eventType: nextEvent.type,
                    result
                });
            }
        } finally {
            // 清理追踪
            this.cascadeTracking.delete(event.type);
        }
        
        return {
            success: true,
            cascadeResults,
            totalEvents: cascadeResults.length
        };
    }
    
    /**
     * 匹配事件类型模式
     */
    matchPattern(eventType, pattern) {
        if (eventType === pattern) return true;
        
        // Glob模式匹配
        const regex = new RegExp(
            '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$'
        );
        
        return regex.test(eventType);
    }
    
    /**
     * 获取匹配的订阅者
     */
    getMatchedSubscribers(eventType) {
        const matched = new Map(); // Use Map to dedupe by subscriber id
        
        for (const [pattern, subs] of this.subscribers) {
            if (this.matchPattern(eventType, pattern)) {
                for (const sub of subs) {
                    // Only include active subscribers once
                    if (sub.active && !matched.has(sub.id)) {
                        matched.set(sub.id, sub);
                    }
                }
            }
        }
        
        return Array.from(matched.values());
    }
    
    /**
     * 获取统计信息
     */
    getStats() {
        return {
            totalEvents: this.eventHistory.length,
            totalSubscribers: this.listenerCount,
            uniquePatterns: this.subscribers.size,
            subscriberStats: Object.fromEntries(this.subscriberStats),
            cascadeTracking: Array.from(this.cascadeTracking)
        };
    }
    
    /**
     * 清除历史
     */
    clearHistory() {
        this.eventHistory = [];
        return { success: true };
    }
    
    /**
     * 重置
     */
    reset() {
        this.subscribers.clear();
        this.eventHistory = [];
        this.subscriberStats.clear();
        this.cascadeTracking.clear();
        this.listenerCount = 0;
        return { success: true };
    }
}

// ===== 全局实例 =====

const realmEventBus = new RealmEventBus();

// ===== MCP工具实现 =====

/**
 * event.bus.publish - 发布事件
 */
function mcpPublish(params = {}) {
    const { type, data = {}, source, target, priority } = params;
    
    if (!type) {
        return { success: false, error: 'Event type is required' };
    }
    
    const result = realmEventBus.publish(type, data, { 
        source: source || 'mcp',
        target,
        priority: priority || 'medium'
    });
    
    return {
        success: true,
        eventId: result.eventId,
        type: result.type,
        timestamp: result.timestamp,
        matchedCount: result.matchedCount
    };
}

/**
 * event.bus.subscribe - 订阅事件
 */
function mcpSubscribe(params = {}) {
    const { pattern, subscriberId = 'mcp', priority = 'medium' } = params;
    
    if (!pattern) {
        return { success: false, error: 'Event pattern is required' };
    }
    
    // 创建默认回调
    const callback = (event) => {
        return { received: true, eventId: event.id, type: event.type };
    };
    
    const result = realmEventBus.subscribe(pattern, callback, { 
        subscriberId,
        priority
    });
    
    return {
        success: result.success,
        subscriberId: result.subscriberId,
        pattern: result.pattern
    };
}

/**
 * event.bus.unsubscribe - 取消订阅
 */
function mcpUnsubscribe(params = {}) {
    const { subscriberId } = params;
    
    if (!subscriberId) {
        return { success: false, error: 'Subscriber ID is required' };
    }
    
    const result = realmEventBus.unsubscribe(subscriberId);
    return result;
}

/**
 * event.bus.history - 查看事件历史
 */
function mcpHistory(params = {}) {
    const { eventType, source, since, limit } = params;
    
    const history = realmEventBus.history({
        eventType,
        source,
        since: since || 0,
        limit: limit || 100
    });
    
    return {
        success: true,
        count: history.length,
        events: history.map(e => ({
            id: e.id,
            type: e.type,
            source: e.source,
            target: e.target,
            timestamp: e.timestamp,
            priority: e.priority,
            data: e.data
        }))
    };
}

/**
 * event.cascade.trigger - 手动触发事件级联
 */
function mcpCascadeTrigger(params = {}) {
    const { initialEvent, followUpEvents = [], maxDepth } = params;
    
    if (!initialEvent || !initialEvent.type) {
        return { success: false, error: 'Initial event with type is required' };
    }
    
    const result = realmEventBus.triggerCascade(initialEvent, {
        maxDepth: maxDepth || EVENT_CONFIG.cascadeDepthLimit,
        followUpEvents
    });
    
    return result;
}

/**
 * event.subscriber.list - 查看所有订阅者
 */
function mcpSubscriberList(params = {}) {
    const { pattern, subscriberId } = params;
    
    const subscribers = realmEventBus.listSubscribers({
        pattern: pattern || null,
        subscriberId: subscriberId || null
    });
    
    return {
        success: true,
        count: subscribers.length,
        subscribers
    };
}

// ===== MCP工具定义 =====

const EVENT_BUS_TOOLS = {
    'event.bus.publish': {
        name: 'event.bus.publish',
        description: 'Publish an event to the realm event bus',
        inputSchema: {
            type: 'object',
            properties: {
                type: { type: 'string', description: 'Event type (e.g., player.cultivation.breakthrough)' },
                data: { type: 'object', description: 'Event data payload' },
                source: { type: 'string', description: 'Event source (default: mcp)' },
                target: { type: 'string', description: 'Event target (optional)' },
                priority: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Event priority' }
            },
            required: ['type']
        }
    },
    'event.bus.subscribe': {
        name: 'event.bus.subscribe',
        description: 'Subscribe to events matching a pattern (supports glob: player.*, *.breakthrough)',
        inputSchema: {
            type: 'object',
            properties: {
                pattern: { type: 'string', description: 'Event pattern (glob supported: player.*, npc.interact)' },
                subscriberId: { type: 'string', description: 'Subscriber identifier (default: mcp)' },
                priority: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Callback priority' }
            },
            required: ['pattern']
        }
    },
    'event.bus.unsubscribe': {
        name: 'event.bus.unsubscribe',
        description: 'Unsubscribe from an event',
        inputSchema: {
            type: 'object',
            properties: {
                subscriberId: { type: 'string', description: 'Subscriber ID to remove' }
            },
            required: ['subscriberId']
        }
    },
    'event.bus.history': {
        name: 'event.bus.history',
        description: 'View event history',
        inputSchema: {
            type: 'object',
            properties: {
                eventType: { type: 'string', description: 'Filter by event type' },
                source: { type: 'string', description: 'Filter by source' },
                since: { type: 'number', description: 'Filter events since timestamp' },
                limit: { type: 'number', description: 'Max events to return (default: 100)' }
            }
        }
    },
    'event.cascade.trigger': {
        name: 'event.cascade.trigger',
        description: 'Manually trigger a cascade of events',
        inputSchema: {
            type: 'object',
            properties: {
                initialEvent: {
                    type: 'object',
                    description: 'Initial event to trigger',
                    properties: {
                        type: { type: 'string' },
                        data: { type: 'object' },
                        source: { type: 'string' }
                    },
                    required: ['type']
                },
                followUpEvents: {
                    type: 'array',
                    description: 'Array of follow-up events to trigger in order'
                },
                maxDepth: { type: 'number', description: 'Maximum cascade depth' }
            },
            required: ['initialEvent']
        }
    },
    'event.subscriber.list': {
        name: 'event.subscriber.list',
        description: 'List all event subscribers',
        inputSchema: {
            type: 'object',
            properties: {
                pattern: { type: 'string', description: 'Filter by pattern' },
                subscriberId: { type: 'string', description: 'Filter by subscriber ID' }
            }
        }
    }
};

// ===== 导出 =====

export {
    RealmEventBus,
    RealmEvent,
    SubscriberEntry,
    realmEventBus,
    EVENT_CONFIG,
    EVENT_PRIORITIES,
    REALM_EVENT_TYPES,
    mcpPublish,
    mcpSubscribe,
    mcpUnsubscribe,
    mcpHistory,
    mcpCascadeTrigger,
    mcpSubscriberList,
    EVENT_BUS_TOOLS
};

export default realmEventBus;