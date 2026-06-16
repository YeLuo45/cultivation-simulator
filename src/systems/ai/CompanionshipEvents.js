/**
 * CompanionshipEvents.js - 羁绊事件系统
 * V307 Iteration 4/9 - Bond Event System
 *
 * 融合6大设计系统:
 * - generic-agent: 事件自进化
 * - chatdev: 事件角色协调
 * - nanobot: 事件广播mesh
 * - claude-code: 事件分析工具
 * - thunderbolt: 事件持久化
 * - ruflo: 事件Hook
 */

export class CompanionshipEvents {
    constructor(config = {}) {
        this.config = {
            maxActiveEvents: config.maxActiveEvents || 50,
            eventCooldown: config.eventCooldown || 5000,
            ...config
        };
        this.eventTypes = new Map();
        this.activeEvents = new Map();
        this.eventLog = [];
        this.participations = new Map();
        this.meshNodes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTriggered: 0, totalCompleted: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const defaults = [
            { typeId: 'first_meeting', name: '初次相遇', rarity: 'common', minBond: 0, rewardExp: 10 },
            { typeId: 'moonlit_walk', name: '月下漫步', rarity: 'common', minBond: 20, rewardExp: 25 },
            { typeId: 'gift_exchange', name: '互赠礼物', rarity: 'common', minBond: 30, rewardExp: 30 },
            { typeId: 'shared_danger', name: '共度危机', rarity: 'rare', minBond: 40, rewardExp: 80 },
            { typeId: 'vow_renewal', name: '重温誓言', rarity: 'epic', minBond: 70, rewardExp: 200 },
            { typeId: 'dao_fusion', name: '道心相融', rarity: 'legendary', minBond: 90, rewardExp: 500 }
        ];
        for (const t of defaults) this.eventTypes.set(t.typeId, t);
    }

    _registerDefaultTools() {
        this.registerTool('triggerEvent', (ctx) => this.triggerEvent(ctx.typeId, ctx.companionshipId));
        this.registerTool('getEvent', (ctx) => this.getEvent(ctx.eventId));
        this.registerTool('listAvailable', (ctx) => this.listAvailable(ctx.companionshipId || 0));
    }

    registerEventType(data) {
        const id = data.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const type = {
            typeId: id, name: data.name || 'Unnamed', rarity: data.rarity || 'common',
            minBond: data.minBond || 0, rewardExp: data.rewardExp || 10
        };
        this.eventTypes.set(id, type);
        return { success: true, type };
    }

    getEventType(id) { return this.eventTypes.get(id) || null; }

    triggerEvent(typeId, companionshipId) {
        const type = this.eventTypes.get(typeId);
        if (!type) return { success: false, error: 'EVENT_TYPE_NOT_FOUND' };
        if (this.activeEvents.size >= this.config.maxActiveEvents) {
            return { success: false, error: 'TOO_MANY_EVENTS' };
        }
        const eventId = `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const event = {
            eventId, typeId, companionshipId, status: 'active',
            startedAt: Date.now(), participants: []
        };
        this.activeEvents.set(eventId, event);
        this.stats.totalTriggered++;
        this._triggerHook('eventTriggered', { eventId, typeId, companionshipId });
        return { success: true, event };
    }

    getEvent(eventId) {
        const e = this.activeEvents.get(eventId);
        return e ? { ...e } : null;
    }

    listAvailable(minBond = 0) {
        return Array.from(this.eventTypes.values()).filter(t => t.minBond <= minBond);
    }

    listActiveEvents() {
        return Array.from(this.activeEvents.values()).filter(e => e.status === 'active').map(e => ({ ...e }));
    }

    participate(eventId, participantId) {
        const event = this.activeEvents.get(eventId);
        if (!event) return { success: false, error: 'EVENT_NOT_FOUND' };
        if (event.status !== 'active') return { success: false, error: 'EVENT_INACTIVE' };
        if (!event.participants.includes(participantId)) event.participants.push(participantId);
        if (!this.participations.has(participantId)) this.participations.set(participantId, []);
        this.participations.get(participantId).push(eventId);
        this._triggerHook('participantJoined', { eventId, participantId });
        return { success: true };
    }

    completeEvent(eventId) {
        const event = this.activeEvents.get(eventId);
        if (!event) return { success: false, error: 'EVENT_NOT_FOUND' };
        if (event.status !== 'active') return { success: false, error: 'EVENT_INACTIVE' };
        event.status = 'completed';
        event.completedAt = Date.now();
        this.eventLog.push({ ...event });
        this.activeEvents.delete(eventId);
        this.stats.totalCompleted++;
        this._triggerHook('eventCompleted', { eventId });
        return { success: true, event };
    }

    failEvent(eventId, reason = 'unknown') {
        const event = this.activeEvents.get(eventId);
        if (!event) return { success: false, error: 'EVENT_NOT_FOUND' };
        event.status = 'failed';
        event.failureReason = reason;
        this.activeEvents.delete(eventId);
        this._triggerHook('eventFailed', { eventId, reason });
        return { success: true };
    }

    addMeshNode(nodeId) {
        const node = { nodeId, events: new Set(), connections: new Set() };
        this.meshNodes.set(nodeId, node);
        return { success: true, node };
    }

    connectMeshNodes(a, b) {
        const na = this.meshNodes.get(a);
        const nb = this.meshNodes.get(b);
        if (!na || !nb) return { success: false, error: 'NODE_NOT_FOUND' };
        na.connections.add(b);
        nb.connections.add(a);
        return { success: true };
    }

    broadcastEvent(eventId, sourceNodeId) {
        const source = this.meshNodes.get(sourceNodeId);
        if (!source) return { success: false, error: 'NODE_NOT_FOUND' };
        const event = this.activeEvents.get(eventId);
        if (!event) return { success: false, error: 'EVENT_NOT_FOUND' };
        const visited = new Set([sourceNodeId]);
        const queue = [sourceNodeId];
        const targets = [];
        while (queue.length > 0) {
            const current = queue.shift();
            const node = this.meshNodes.get(current);
            if (!node) continue;
            node.events.add(eventId);
            targets.push(current);
            for (const n of node.connections) {
                if (!visited.has(n)) { visited.add(n); queue.push(n); }
            }
        }
        return { success: true, propagated: targets.length };
    }

    registerTool(name, handler) { this.tools.set(name, { name, handler }); }
    executeTool(name, context) {
        const tool = this.tools.get(name);
        if (!tool) return { success: false, error: 'TOOL_NOT_FOUND' };
        try { return { success: true, result: tool.handler(context || {}) }; }
        catch (e) { return { success: false, error: e.message }; }
    }
    listTools() { return Array.from(this.tools.keys()); }

    registerHook(event, handler) {
        if (!this.hooks.has(event)) this.hooks.set(event, []);
        this.hooks.get(event).push(handler);
        return () => {
            const arr = this.hooks.get(event);
            if (arr) { const idx = arr.indexOf(handler); if (idx >= 0) arr.splice(idx, 1); }
        };
    }

    _triggerHook(event, data) {
        const handlers = this.hooks.get(event);
        if (!handlers) return;
        for (const h of handlers) { try { h(data); } catch (e) {} }
    }

    autoEvolve() {
        if (this.stats.totalCompleted < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.eventCooldown = Math.max(1000, this.config.eventCooldown - 500);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() {
        return {
            eventTypes: Array.from(this.eventTypes.entries()),
            activeEvents: Array.from(this.activeEvents.entries()),
            eventLog: this.eventLog,
            participations: Array.from(this.participations.entries()).map(([k, v]) => [k, Array.from(v)]),
            meshNodes: Array.from(this.meshNodes.entries()),
            stats: this.stats,
            config: this.config
        };
    }

    fromJSON(data) {
        if (data.eventTypes) this.eventTypes = new Map(data.eventTypes);
        if (data.activeEvents) this.activeEvents = new Map(data.activeEvents);
        if (data.eventLog) this.eventLog = data.eventLog;
        if (data.participations) this.participations = new Map(data.participations);
        if (data.meshNodes) {
            this.meshNodes = new Map(data.meshNodes.map(([k, v]) => [k, { ...v, events: new Set(v.events || []), connections: new Set(v.connections || []) }]));
        }
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }

    getStats() {
        return {
            ...this.stats,
            eventTypeCount: this.eventTypes.size,
            activeEventCount: this.activeEvents.size
        };
    }
}