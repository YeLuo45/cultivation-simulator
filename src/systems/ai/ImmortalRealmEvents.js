/**
 * ImmortalRealmEvents.js - 修仙界事件系统
 * V300 Iteration 6/9 - Immortal Realm Event System
 * 
 * 融合6大设计系统:
 * - generic-agent: 事件自进化 (auto-evolving events based on sect state)
 * - chatdev: 事件角色专业化 (event types with specialized roles)
 * - nanobot: 事件mesh网络广播 (mesh network broadcasting)
 * - claude-code: 事件工具系统 (event tools)
 * - thunderbolt: 事件离线持久化 (offline persistence)
 * - ruflo: 事件Hook系统 (hook system for events)
 */

export class ImmortalRealmEvents {
    constructor(config = {}) {
        // Event registry: eventId -> event definition
        this.events = new Map();
        
        // Event categories
        this.categories = new Map();
        
        // Active events (currently running)
        this.activeEvents = new Map(); // eventId -> { eventId, startTime, data }
        
        // Event history
        this.eventHistory = []; // completed/failed events
        
        // Timers for scheduled events
        this.timers = new Map(); // timerId -> { eventId, triggerTime, interval, repeat }
        
        // Hook system
        this.hooks = {};
        
        // Mesh network nodes
        this.meshNodes = new Map(); // nodeId -> { connected, lastBroadcast }
        
        // Event tools registry
        this.eventTools = new Map();
        
        // Evolution state
        this.evolutionState = {
            level: 0,
            autoTriggerCount: 0,
            lastEvolution: null,
        };
        
        this.config = {
            maxHistorySize: config.maxHistorySize || 1000,
            maxActiveEvents: config.maxActiveEvents || 50,
            tickInterval: config.tickInterval || 1000,
            autoEvolutionEnabled: config.autoEvolutionEnabled !== false,
            evolutionThreshold: config.evolutionThreshold || 10,
        };
        
        this._registerDefaultCategories();
        this._registerDefaultHooks();
        this._registerDefaultEventTypes();
        this._registerDefaultTools();
    }
    
    // ========== 事件注册 ==========
    
    registerEvent(eventId, eventDef) {
        if (this.events.has(eventId)) {
            return { success: false, error: 'EVENT_EXISTS' };
        }
        
        const event = {
            eventId,
            name: eventDef.name || eventId,
            description: eventDef.description || '',
            category: eventDef.category || 'misc',
            rarity: eventDef.rarity || 'common', // common, rare, epic, legendary
            triggerCondition: eventDef.triggerCondition || (() => ({ triggerable: false })),
            effects: eventDef.effects || {},
            rewards: eventDef.rewards || null,
            cooldown: eventDef.cooldown || 0, // ms
            lastTriggered: 0,
            statistics: {
                triggeredCount: 0,
                successCount: 0,
                failureCount: 0,
            },
        };
        
        this.events.set(eventId, event);
        this._triggerHook('eventRegistered', { eventId, category: event.category, rarity: event.rarity });
        
        return { success: true, event };
    }
    
    getEvent(eventId) {
        return this.events.get(eventId) || null;
    }
    
    getEventsByCategory(category) {
        return Array.from(this.events.values()).filter(e => e.category === category);
    }
    
    getEventsByRarity(rarity) {
        return Array.from(this.events.values()).filter(e => e.rarity === rarity);
    }
    
    // ========== 事件分类 ==========
    
    _registerDefaultCategories() {
        const categories = [
            { id: 'tianjie', name: '天劫', description: 'Heavenly Tribulation events' },
            { id: 'qijiyuan', name: '机缘', description: 'Fortune and opportunity events' },
            { id: 'menpaizhan', name: '门派战', description: 'Sect war events' },
            { id: 'yaoshouqin', name: '妖兽入侵', description: 'Monster beast invasion events' },
            { id: 'kuangmai', name: '矿脉发现', description: 'Mineral vein discovery events' },
            { id: 'zhiye', name: '职业事件', description: 'Professional events' },
            { id: 'xiuxian', name: '修仙大事', description: 'Cultivation major events' },
            { id: 'shezhan', name: '社交事件', description: 'Social events' },
        ];
        for (const c of categories) {
            this.categories.set(c.id, c);
        }
    }
    
    registerCategory(categoryId, categoryDef) {
        if (this.categories.has(categoryId)) {
            return { success: false, error: 'CATEGORY_EXISTS' };
        }
        this.categories.set(categoryId, { id: categoryId, ...categoryDef });
        return { success: true };
    }
    
    getCategory(categoryId) {
        return this.categories.get(categoryId) || null;
    }
    
    getAllCategories() {
        return Array.from(this.categories.values());
    }
    
    // ========== 事件触发条件 ==========
    
    checkTriggerConditions(sectState = {}) {
        const results = [];
        
        for (const [eventId, event] of this.events) {
            // Check cooldown
            if (event.cooldown > 0) {
                const timeSinceLastTrigger = Date.now() - event.lastTriggered;
                if (timeSinceLastTrigger < event.cooldown) continue;
            }
            
            try {
                const conditionResult = event.triggerCondition(sectState, this);
                if (conditionResult.triggerable) {
                    results.push({
                        eventId,
                        name: event.name,
                        category: event.category,
                        rarity: event.rarity,
                        priority: conditionResult.priority || 0,
                        data: conditionResult.data || {},
                    });
                }
            } catch (e) {
                // Silent fail for trigger condition
            }
        }
        
        // Sort by priority (higher first), then by rarity
        const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
        results.sort((a, b) => {
            if (b.priority !== a.priority) return b.priority - a.priority;
            return (rarityOrder[a.rarity] || 99) - (rarityOrder[b.rarity] || 99);
        });
        
        return results;
    }
    
    // ========== 事件触发和执行 ==========
    
    triggerEvent(eventId, context = {}) {
        const event = this.events.get(eventId);
        if (!event) return { success: false, error: 'EVENT_NOT_FOUND' };
        
        if (this.activeEvents.size >= this.config.maxActiveEvents) {
            return { success: false, error: 'MAX_ACTIVE_EVENTS_REACHED' };
        }
        
        // Check cooldown
        if (event.cooldown > 0) {
            const timeSinceLastTrigger = Date.now() - event.lastTriggered;
            if (timeSinceLastTrigger < event.cooldown) {
                return { success: false, error: 'EVENT_IN_COOLDOWN' };
            }
        }
        
        // Execute event effects
        const executionId = `exec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const execution = {
            executionId,
            eventId,
            startTime: Date.now(),
            data: context.data || {},
            status: 'running',
            effectsApplied: [],
        };
        
        // Apply effects
        if (event.effects) {
            for (const [target, effectFn] of Object.entries(event.effects)) {
                try {
                    const result = effectFn(context, this);
                    execution.effectsApplied.push({ target, result, success: true });
                } catch (e) {
                    execution.effectsApplied.push({ target, error: e.message, success: false });
                }
            }
        }
        
        event.lastTriggered = Date.now();
        event.statistics.triggeredCount++;
        
        this.activeEvents.set(executionId, execution);
        this._triggerHook('eventTriggered', { eventId, executionId, category: event.category });
        
        // Auto-complete if no ongoing effects
        this._completeEvent(executionId);
        
        return { success: true, executionId, eventId };
    }
    
    _completeEvent(executionId) {
        const execution = this.activeEvents.get(executionId);
        if (!execution) return;
        
        const event = this.events.get(execution.eventId);
        execution.endTime = Date.now();
        execution.status = 'completed';
        execution.duration = execution.endTime - execution.startTime;
        
        if (event) {
            event.statistics.successCount++;
        }
        
        // Move to history
        this.eventHistory.push({ ...execution });
        if (this.eventHistory.length > this.config.maxHistorySize) {
            this.eventHistory.shift();
        }
        
        this.activeEvents.delete(executionId);
        this._triggerHook('eventCompleted', { executionId, eventId: execution.eventId });
        
        // Trigger auto-evolution check
        if (this.config.autoEvolutionEnabled) {
            this._checkEvolution();
        }
    }
    
    // ========== 定时器 ==========
    
    scheduleEvent(eventId, triggerTime, interval = 0) {
        const event = this.events.get(eventId);
        if (!event) return { success: false, error: 'EVENT_NOT_FOUND' };
        
        const timerId = `timer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        // If triggerTime is a small positive number (< 1 billion), treat as offset from now
        // Otherwise treat as absolute timestamp (or 0 = immediate)
        const isOffset = typeof triggerTime === 'number' && triggerTime >= 0 && triggerTime < 1000000000;
        const actualTriggerTime = isOffset 
            ? Date.now() + triggerTime 
            : (typeof triggerTime === 'number' && triggerTime > 0 ? triggerTime : Date.now());
        
        const timer = {
            timerId,
            eventId,
            triggerTime: actualTriggerTime,
            interval, // 0 = one-time, >0 = repeating
            active: true,
        };
        
        this.timers.set(timerId, timer);
        this._triggerHook('timerScheduled', { timerId, eventId, triggerTime: timer.triggerTime });
        
        return { success: true, timerId };
    }
    
    scheduleRepeatingEvent(eventId, intervalMs) {
        if (intervalMs <= 0) return { success: false, error: 'INVALID_INTERVAL' };
        return this.scheduleEvent(eventId, Date.now() + intervalMs, intervalMs);
    }
    
    cancelTimer(timerId) {
        const timer = this.timers.get(timerId);
        if (!timer) return { success: false, error: 'TIMER_NOT_FOUND' };
        timer.active = false;
        this.timers.delete(timerId);
        this._triggerHook('timerCancelled', { timerId, eventId: timer.eventId });
        return { success: true };
    }
    
    processTimers() {
        const now = Date.now();
        const toTrigger = [];
        
        for (const [timerId, timer] of this.timers) {
            if (!timer.active) continue;
            if (timer.triggerTime <= now) {
                toTrigger.push(timerId);
            }
        }
        
        for (const timerId of toTrigger) {
            const timer = this.timers.get(timerId);
            if (!timer || !timer.active) continue;
            
            // Trigger the event
            this.triggerEvent(timer.eventId, { timerId, scheduled: true });
            
            // Reschedule if repeating
            if (timer.interval > 0) {
                timer.triggerTime = now + timer.interval;
            } else {
                timer.active = false;
                this.timers.delete(timerId);
            }
        }
        
        return toTrigger.length;
    }
    
    getActiveTimers() {
        return Array.from(this.timers.values()).filter(t => t.active);
    }
    
    // ========== 事件影响和奖励系统 ==========
    
    applyEventRewards(executionId, targetId) {
        const execution = this.eventHistory.find(e => e.executionId === executionId);
        if (!execution) return { success: false, error: 'EXECUTION_NOT_FOUND' };
        
        const event = this.events.get(execution.eventId);
        if (!event || !event.rewards) return { success: false, error: 'NO_REWARDS' };
        
        const rewards = typeof event.rewards === 'function' 
            ? event.rewards(execution.data, this) 
            : event.rewards;
        
        this._triggerHook('rewardsApplied', { executionId, targetId, rewards });
        
        return { success: true, rewards };
    }
    
    calculateEventImpact(eventId, context = {}) {
        const event = this.events.get(eventId);
        if (!event) return null;
        
        // Generic impact calculation based on rarity and category
        const rarityMultiplier = { legendary: 4, epic: 3, rare: 2, common: 1 };
        const mult = rarityMultiplier[event.rarity] || 1;
        
        return {
            eventId,
            name: event.name,
            rarity: event.rarity,
            baseImpact: 100 * mult,
            affectedCategories: [event.category],
            cooldown: event.cooldown,
            lastTriggered: event.lastTriggered,
            statistics: { ...event.statistics },
        };
    }
    
    // ========== 事件角色专业化 (chatdev) ==========
    
    getEventRoles(eventId) {
        const event = this.events.get(eventId);
        if (!event) return [];
        
        // Role assignments based on event category
        const roleMap = {
            tianjie: ['tianjie_master', 'cultivator'],
            qijiyuan: ['fortune_seeker', 'elder'],
            menpaizhan: ['sect_leader', 'warrior'],
            yaoshouqin: ['beast_tamer', 'hunter'],
            kuangmai: ['miner', 'earth_master'],
            zhiye: ['professional', 'master'],
            xiuxian: ['cultivator', 'immortal'],
            shezhan: ['diplomat', 'messenger'],
        };
        
        return roleMap[event.category] || ['participant'];
    }
    
    assignEventRole(eventId, role) {
        const roles = this.getEventRoles(eventId);
        if (!roles.includes(role)) {
            roles.push(role);
        }
        return roles;
    }
    
    // ========== Mesh 网络广播 (nanobot) ==========
    
    registerMeshNode(nodeId, nodeData = {}) {
        if (this.meshNodes.has(nodeId)) {
            return { success: false, error: 'NODE_EXISTS' };
        }
        
        const node = {
            nodeId,
            connected: nodeData.connected !== false,
            lastBroadcast: null,
            neighbors: new Set(),
            eventSubscriptions: new Set(),
            ...nodeData,
        };
        
        this.meshNodes.set(nodeId, node);
        return { success: true, node };
    }
    
    connectMeshNodes(nodeIdA, nodeIdB) {
        const nodeA = this.meshNodes.get(nodeIdA);
        const nodeB = this.meshNodes.get(nodeIdB);
        if (!nodeA || !nodeB) return { success: false, error: 'NODE_NOT_FOUND' };
        
        nodeA.neighbors.add(nodeIdB);
        nodeB.neighbors.add(nodeIdA);
        
        this._triggerHook('meshNodesConnected', { nodeIdA, nodeIdB });
        return { success: true };
    }
    
    broadcastEvent(eventId, sourceNodeId, propagationDepth = 3) {
        const sourceNode = this.meshNodes.get(sourceNodeId);
        if (!sourceNode) return { success: false, error: 'NODE_NOT_FOUND' };
        
        const visited = new Set([sourceNodeId]);
        const propagationQueue = [{ nodeId: sourceNodeId, depth: 0 }];
        const broadcastTargets = [];
        
        // BFS-style propagation
        while (propagationQueue.length > 0) {
            const current = propagationQueue.shift();
            if (current.depth > propagationDepth) continue;
            
            const node = this.meshNodes.get(current.nodeId);
            if (!node || !node.connected) continue;
            
            // Check if node is subscribed to this event category
            const event = this.events.get(eventId);
            if (event && node.eventSubscriptions.has(event.category)) {
                broadcastTargets.push(current.nodeId);
            }
            
            // Add neighbors to queue
            for (const neighborId of node.neighbors) {
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    propagationQueue.push({ nodeId: neighborId, depth: current.depth + 1 });
                }
            }
        }
        
        // Update source node last broadcast
        sourceNode.lastBroadcast = { eventId, timestamp: Date.now(), targets: broadcastTargets.length };
        
        this._triggerHook('eventBroadcast', { eventId, sourceNodeId, targets: broadcastTargets.length });
        
        return { success: true, broadcastTargets, totalReached: broadcastTargets.length + 1 };
    }
    
    subscribeToEvents(nodeId, category) {
        const node = this.meshNodes.get(nodeId);
        if (!node) return { success: false, error: 'NODE_NOT_FOUND' };
        node.eventSubscriptions.add(category);
        return { success: true };
    }
    
    getMeshNetworkStatus() {
        return {
            totalNodes: this.meshNodes.size,
            connectedNodes: Array.from(this.meshNodes.values()).filter(n => n.connected).length,
            totalConnections: Array.from(this.meshNodes.values()).reduce((sum, n) => sum + n.neighbors.size, 0) / 2,
        };
    }
    
    // ========== 事件工具系统 (claude-code) ==========
    
    _registerDefaultTools() {
        this.registerEventTool('analyze_trigger_conditions', {
            name: 'Analyze Trigger Conditions',
            description: 'Analyze which events can be triggered given current sect state',
            execute: (context) => this.checkTriggerConditions(context.sectState),
        });
        
        this.registerEventTool('get_event_statistics', {
            name: 'Get Event Statistics',
            description: 'Get statistics for all events',
            execute: () => this.getEventStatistics(),
        });
        
        this.registerEventTool('schedule_event', {
            name: 'Schedule Event',
            description: 'Schedule an event to trigger at a specific time',
            execute: (context) => this.scheduleEvent(context.eventId, context.triggerTime, context.interval),
        });
        
        this.registerEventTool('broadcast_event', {
            name: 'Broadcast Event',
            description: 'Broadcast an event through the mesh network',
            execute: (context) => this.broadcastEvent(context.eventId, context.sourceNodeId, context.depth),
        });
        
        this.registerEventTool('calculate_impact', {
            name: 'Calculate Event Impact',
            description: 'Calculate the impact of an event',
            execute: (context) => this.calculateEventImpact(context.eventId, context),
        });
    }
    
    registerEventTool(toolId, toolDef) {
        if (this.eventTools.has(toolId)) {
            return { success: false, error: 'TOOL_EXISTS' };
        }
        this.eventTools.set(toolId, {
            toolId,
            name: toolDef.name || toolId,
            description: toolDef.description || '',
            execute: toolDef.execute,
        });
        return { success: true };
    }
    
    executeEventTool(toolId, context = {}) {
        const tool = this.eventTools.get(toolId);
        if (!tool) return { success: false, error: 'TOOL_NOT_FOUND' };
        
        try {
            const result = tool.execute(context, this);
            this._triggerHook('toolExecuted', { toolId, success: true });
            return { success: true, result };
        } catch (e) {
            this._triggerHook('toolExecuted', { toolId, success: false, error: e.message });
            return { success: false, error: e.message };
        }
    }
    
    getEventTool(toolId) {
        return this.eventTools.get(toolId) || null;
    }
    
    getAllEventTools() {
        return Array.from(this.eventTools.values());
    }
    
    // ========== 事件自进化 (generic-agent) ==========
    
    _checkEvolution() {
        this.evolutionState.autoTriggerCount++;
        
        if (this.evolutionState.autoTriggerCount >= this.config.evolutionThreshold) {
            this.evolutionState.level++;
            this.evolutionState.autoTriggerCount = 0;
            this.evolutionState.lastEvolution = Date.now();
            
            this._triggerHook('systemEvolved', { 
                level: this.evolutionState.level,
                reason: 'auto_trigger_threshold_reached',
            });
        }
    }
    
    getEvolutionState() {
        return { ...this.evolutionState };
    }
    
    resetEvolutionState() {
        this.evolutionState = {
            level: 0,
            autoTriggerCount: 0,
            lastEvolution: null,
        };
    }
    
    // ========== Hook 系统 (ruflo) ==========
    
    _registerDefaultHooks() {
        const defaultHooks = [
            'eventRegistered',
            'eventTriggered',
            'eventCompleted',
            'timerScheduled',
            'timerCancelled',
            'rewardsApplied',
            'meshNodesConnected',
            'eventBroadcast',
            'toolExecuted',
            'systemEvolved',
        ];
        for (const h of defaultHooks) {
            this.hooks[h] = [];
        }
    }
    
    registerHook(event, callback) {
        if (!this.hooks[event]) this.hooks[event] = [];
        const wrappedCallback = (data) => {
            try {
                callback(data);
            } catch (e) {
                // Silent fail for hooks
            }
        };
        this.hooks[event].push(wrappedCallback);
        return () => {
            this.hooks[event] = this.hooks[event].filter(c => c !== wrappedCallback);
        };
    }
    
    _triggerHook(event, data) {
        if (!this.hooks[event]) return;
        for (const callback of this.hooks[event]) {
            try {
                callback(data);
            } catch (e) {
                // Silent fail
            }
        }
    }
    
    // ========== 事件历史记录 ==========
    
    getEventHistory(limit = 100, eventId = null) {
        let history = this.eventHistory;
        if (eventId) {
            history = history.filter(e => e.eventId === eventId);
        }
        return history.slice(-limit);
    }
    
    getEventStatistics() {
        const stats = {
            totalEvents: this.events.size,
            activeEvents: this.activeEvents.size,
            totalExecutions: this.eventHistory.length,
            byCategory: {},
            byRarity: {},
            topEvents: [],
        };
        
        for (const event of this.events.values()) {
            const cat = event.category;
            const rar = event.rarity;
            
            if (!stats.byCategory[cat]) stats.byCategory[cat] = 0;
            if (!stats.byRarity[rar]) stats.byRarity[rar] = 0;
            
            stats.byCategory[cat]++;
            stats.byRarity[rar]++;
        }
        
        // Top events by trigger count
        stats.topEvents = Array.from(this.events.values())
            .sort((a, b) => b.statistics.triggeredCount - a.statistics.triggeredCount)
            .slice(0, 10)
            .map(e => ({ eventId: e.eventId, name: e.name, triggeredCount: e.statistics.triggeredCount }));
        
        return stats;
    }
    
    clearHistory() {
        this.eventHistory = [];
        return { success: true };
    }
    
    // ========== 事件默认类型注册 ==========
    
    _registerDefaultEventTypes() {
        // 天劫 (Tian Jie - Heavenly Tribulation)
        this.registerEvent('tianjie_lightning', {
            name: 'Lightning Tribulation',
            description: 'A cultivator faces the lightning tribulation',
            category: 'tianjie',
            rarity: 'epic',
            cooldown: 3600000, // 1 hour
            triggerCondition: (sectState) => ({
                triggerable: sectState.cultivationProgress >= 80 && sectState.peakCultivators > 0,
                priority: 10,
                data: { affectedSect: sectState.sectId },
            }),
            effects: {
                sect: (ctx, system) => ({ damage: 1000, message: 'Lightning strikes the sect' }),
                cultivators: (ctx, system) => ({ risk: 0.3, message: 'Cultivators may breakthrough or die' }),
            },
            rewards: { spiritStones: 500, experience: 1000 },
        });
        
        // 机缘 (Fortune)
        this.registerEvent('qijiyuan_ancient_treasure', {
            name: 'Ancient Treasure Discovery',
            description: 'An ancient treasure is discovered',
            category: 'qijiyuan',
            rarity: 'rare',
            cooldown: 1800000, // 30 minutes
            triggerCondition: (sectState) => ({
                triggerable: sectState.fortune >= 50,
                priority: 5,
                data: { location: 'ancient_ruins' },
            }),
            effects: {
                sect: (ctx, system) => ({ treasure: true, message: 'Ancient treasure found!' }),
            },
            rewards: { artifact: true, spiritStones: 200 },
        });
        
        // 门派战 (Sect War)
        this.registerEvent('menpaizhan_invasion', {
            name: 'Sect Invasion',
            description: 'Enemy sect launches an invasion',
            category: 'menpaizhan',
            rarity: 'legendary',
            cooldown: 7200000, // 2 hours
            triggerCondition: (sectState) => ({
                triggerable: sectState.hostility >= 70 && sectState.sectStrength < sectState.enemyStrength,
                priority: 15,
                data: { enemySect: sectState.rivalSectId },
            }),
            effects: {
                defense: (ctx, system) => ({ defenseNeeded: 5000, message: 'Defend the sect!' }),
                resources: (ctx, system) => ({ drain: 0.2, message: 'Resources depleted' }),
            },
            rewards: null, // War has no rewards, only consequences
        });
        
        // 妖兽入侵 (Monster Beast Invasion)
        this.registerEvent('yaoshouqin_tide', {
            name: 'Beast Tide',
            description: 'A tide of monster beasts attacks',
            category: 'yaoshouqin',
            rarity: 'rare',
            cooldown: 3600000, // 1 hour
            triggerCondition: (sectState) => ({
                triggerable: sectState.beastActivity >= 60,
                priority: 8,
                data: { beastType: 'mixed' },
            }),
            effects: {
                outerSect: (ctx, system) => ({ damage: 500, message: 'Outer sect buildings damaged' }),
                disciples: (ctx, system) => ({ casualties: 0.1, message: 'Some disciples were injured' }),
            },
            rewards: { beastCores: 50, experience: 300 },
        });
        
        // 矿脉发现 (Mineral Vein Discovery)
        this.registerEvent('kuangmai_discovery', {
            name: 'Spirit Stone Vein Discovery',
            description: 'A new spirit stone vein is discovered',
            category: 'kuangmai',
            rarity: 'common',
            cooldown: 900000, // 15 minutes
            triggerCondition: (sectState) => ({
                triggerable: sectState.explorationLevel >= 30,
                priority: 3,
                data: { veinSize: 'medium' },
            }),
            effects: {
                resources: (ctx, system) => ({ newVein: true, message: 'New vein discovered!' }),
            },
            rewards: { spiritStones: 100, monthlyOutput: 50 },
        });
        
        // 职业事件 (Professional Event)
        this.registerEvent('zhiye_auction', {
            name: 'Cultivation Auction',
            description: 'A grand auction of cultivation resources',
            category: 'zhiye',
            rarity: 'rare',
            cooldown: 5400000, // 1.5 hours
            triggerCondition: (sectState) => ({
                triggerable: sectState.merchantActivity >= 40,
                priority: 4,
                data: { auctioneer: 'Master Liu' },
            }),
            effects: {
                economy: (ctx, system) => ({ priceBoost: 1.2, message: 'Market prices surge' }),
            },
            rewards: { rareItems: true, networking: true },
        });
        
        // 修仙大事 (Cultivation Major Event)
        this.registerEvent('xiuxian_breakthrough', {
            name: 'Grand Breakthrough',
            description: 'A major cultivation breakthrough occurs',
            category: 'xiuxian',
            rarity: 'epic',
            cooldown: 1800000, // 30 minutes
            triggerCondition: (sectState) => ({
                triggerable: sectState.cultivationProgress >= 90 && sectState.peakCultivators >= 3,
                priority: 12,
                data: { cultivatorLevel: 'Foundation' },
            }),
            effects: {
                cultivator: (ctx, system) => ({ level: '+1', message: 'Cultivator reached new level!' }),
                sect: (ctx, system) => ({ reputation: 100, message: 'Sect reputation increased' }),
            },
            rewards: { cultivationManual: true, experience: 2000 },
        });
        
        // 社交事件 (Social Event)
        this.registerEvent('shezhan_alliance', {
            name: 'Alliance Formation',
            description: 'A new alliance between sects is formed',
            category: 'shezhan',
            rarity: 'rare',
            cooldown: 3600000, // 1 hour
            triggerCondition: (sectState) => ({
                triggerable: sectState.diplomacyLevel >= 50 && sectState.sectReputation >= 60,
                priority: 6,
                data: { alliedSect: sectState.potentialAllyId },
            }),
            effects: {
                diplomacy: (ctx, system) => ({ newAlly: true, message: 'Alliance formed!' }),
                resources: (ctx, system) => ({ shared: 0.1, message: 'Resources are shared' }),
            },
            rewards: { allianceBonus: true, sharedResources: true },
        });
    }
    
    // ========== 状态查询 ==========
    
    getOverview() {
        return {
            totalEvents: this.events.size,
            activeEvents: this.activeEvents.size,
            eventHistorySize: this.eventHistory.length,
            activeTimers: this.getActiveTimers().length,
            meshNodes: this.meshNodes.size,
            eventTools: this.eventTools.size,
            evolutionLevel: this.evolutionState.level,
            categories: this.categories.size,
        };
    }
    
    // ========== 数据持久化 (thunderbolt) ==========
    
    toJSON() {
        return {
            events: Array.from(this.events.entries()),
            categories: Array.from(this.categories.entries()),
            eventHistory: this.eventHistory.slice(-500), // Keep last 500
            timers: Array.from(this.timers.entries()).filter(([, t]) => t.active),
            meshNodes: Array.from(this.meshNodes.entries()),
            evolutionState: this.evolutionState,
            config: this.config,
        };
    }
    
    fromJSON(data) {
        this.events = new Map(data.events || []);
        this.categories = new Map(data.categories || []);
        this.eventHistory = data.eventHistory || [];
        this.timers = new Map(data.timers || []);
        this.meshNodes = new Map(data.meshNodes || []);
        this.evolutionState = data.evolutionState || { level: 0, autoTriggerCount: 0, lastEvolution: null };
        if (data.config) this.config = { ...this.config, ...data.config };
    }
}