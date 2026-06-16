/**
 * WorldEventCore.js - 天地异变核心
 * V385 Iteration 1/9 Round 12 - World Event Core
 *
 * 融合6大设计系统:
 * - generic-agent: 异变自循环
 * - chatdev: 异变角色协调
 * - nanobot: 异变mesh
 * - claude-code: 异变分析工具
 * - thunderbolt: 异变持久化
 * - ruflo: 异变Hook
 */

export class WorldEventCore {
    constructor(config = {}) {
        this.config = { maxEvents: config.maxEvents || 100, baseSeverity: config.baseSeverity || 1, ...config };
        this.events = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEvents: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getEvent', (ctx) => this.getEvent(ctx.eventId));
        this.registerTool('createEvent', (ctx) => this.createEvent(ctx));
    }

    createEvent(data) {
        const id = data.id || `wev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const event = { eventId: id, name: data.name || 'World Event', type: data.type || 'phenomenon', severity: data.severity || this.config.baseSeverity, status: 'active', affectedRegion: data.affectedRegion, startedAt: Date.now() };
        this.events.set(id, event);
        this.stats.totalEvents++;
        this._triggerHook('eventCreated', { eventId: id });
        return { success: true, event };
    }

    getEvent(id) { return this.events.get(id) ? { ...this.events.get(id) } : null; }
    listEvents() { return Array.from(this.events.values()).map(e => ({ ...e })); }
    listActive() { return Array.from(this.events.values()).filter(e => e.status === 'active').map(e => ({ ...e })); }
    listByType(type) { return Array.from(this.events.values()).filter(e => e.type === type).map(e => ({ ...e })); }
    listByRegion(region) { return Array.from(this.events.values()).filter(e => e.affectedRegion === region).map(e => ({ ...e })); }
    listBySeverity(min) { return Array.from(this.events.values()).filter(e => e.severity >= min).map(e => ({ ...e })); }

    escalateEvent(eventId, delta = 1) {
        const event = this.events.get(eventId);
        if (!event) return { success: false, error: 'EVENT_NOT_FOUND' };
        event.severity += delta;
        this._triggerHook('eventEscalated', { eventId, newSeverity: event.severity });
        return { success: true };
    }

    resolveEvent(eventId) {
        const event = this.events.get(eventId);
        if (!event) return { success: false, error: 'EVENT_NOT_FOUND' };
        event.status = 'resolved';
        event.resolvedAt = Date.now();
        this._triggerHook('eventResolved', { eventId });
        return { success: true };
    }

    cancelEvent(eventId) {
        const event = this.events.get(eventId);
        if (!event) return { success: false, error: 'EVENT_NOT_FOUND' };
        event.status = 'cancelled';
        this._triggerHook('eventCancelled', { eventId });
        return { success: true };
    }

    calculateTotalSeverity() { return Array.from(this.events.values()).reduce((s, e) => s + e.severity, 0); }
    findCriticalEvents() { return this.listBySeverity(5); }
    countByStatus(status) { return Array.from(this.events.values()).filter(e => e.status === status).length; }

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
        return () => { const arr = this.hooks.get(event); if (arr) { const idx = arr.indexOf(handler); if (idx >= 0) arr.splice(idx, 1); } };
    }
    _triggerHook(event, data) {
        const handlers = this.hooks.get(event);
        if (!handlers) return;
        for (const h of handlers) { try { h(data); } catch (e) {} }
    }

    autoEvolve() {
        if (this.stats.totalEvents < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxEvents += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { events: Array.from(this.events.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.events) this.events = new Map(data.events);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, eventCount: this.events.size }; }
}