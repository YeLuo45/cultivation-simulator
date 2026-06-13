/**
 * CultivationTime.js - 修真时 (Cultivation Time system)
 * V578 Iteration 1/20 Round 24
 */
export class CultivationTime {
    constructor(config = {}) {
        this.config = { maxTimes: config.maxTimes || 50, baseFlow: config.baseFlow || 20, ...config };
        this.times = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTimes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTime', (ctx) => this.getTime(ctx.timeId));
        this.registerTool('openTime', (ctx) => this.openTime(ctx));
    }

    openTime(data) {
        const id = data.id || `ctm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const time = {
            timeId: id,
            keeperId: data.keeperId,
            name: data.name || 'Cultivation Time',
            type: data.type || 'present',
            flow: data.flow || this.config.baseFlow,
            events: data.events || [],
            level: 1,
            status: 'moving',
            createdAt: Date.now()
        };
        this.times.set(id, time);
        this.stats.totalTimes++;
        this._triggerHook('timeOpened', { timeId: id });
        return { success: true, time };
    }

    getTime(id) { return this.times.get(id) ? { ...this.times.get(id) } : null; }
    listTimes() { return Array.from(this.times.values()).map(t => ({ ...t, events: [...t.events] })); }
    listByKeeper(keeperId) { return Array.from(this.times.values()).filter(t => t.keeperId === keeperId).map(t => ({ ...t, events: [...t.events] })); }
    listEternal() { return Array.from(this.times.values()).filter(t => t.status === 'eternal').map(t => ({ ...t, events: [...t.events] })); }

    addEvent(timeId, event) {
        const time = this.times.get(timeId);
        if (!time) return { success: false, error: 'TIME_NOT_FOUND' };
        const evt = typeof event === 'string' ? { name: event, timestamp: Date.now() } : { ...event, timestamp: event.timestamp || Date.now() };
        time.events.push(evt);
        this._triggerHook('eventAdded', { timeId, event: evt, eventCount: time.events.length });
        return { success: true, event: evt };
    }

    increaseFlow(timeId, amount = 5) {
        const time = this.times.get(timeId);
        if (!time) return { success: false, error: 'TIME_NOT_FOUND' };
        time.flow += amount;
        this._triggerHook('flowIncreased', { timeId, amount, newFlow: time.flow });
        return { success: true };
    }

    levelUpTime(timeId) {
        const time = this.times.get(timeId);
        if (!time) return { success: false, error: 'TIME_NOT_FOUND' };
        time.level++;
        this._triggerHook('timeLeveledUp', { timeId, newLevel: time.level });
        return { success: true };
    }

    eternizeTime(timeId) {
        const time = this.times.get(timeId);
        if (!time) return { success: false, error: 'TIME_NOT_FOUND' };
        time.status = 'eternal';
        this._triggerHook('timeEternalized', { timeId });
        return { success: true };
    }

    calculateTimeValue(timeId) {
        const time = this.times.get(timeId);
        if (!time) return 0;
        return time.level * 100 + time.flow * 2 + time.events.length * 30;
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
        return () => { const arr = this.hooks.get(event); if (arr) { const idx = arr.indexOf(handler); if (idx >= 0) arr.splice(idx, 1); } };
    }
    _triggerHook(event, data) {
        const handlers = this.hooks.get(event);
        if (!handlers) return;
        for (const h of handlers) { try { h(data); } catch (e) {} }
    }

    autoEvolve() {
        if (this.stats.totalTimes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTimes += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { times: Array.from(this.times.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.times) this.times = new Map(data.times);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, timeCount: this.times.size }; }
}
