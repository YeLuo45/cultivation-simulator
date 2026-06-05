/**
 * WorldClock.js - 世界时钟仪表盘
 * V357 Iteration 9/9 FINAL Round 8
 */
export class WorldClock {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, ...config };
        this.clocks = new Map();
        this.timezones = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalClocks: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const tzs = [
            { tzId: 'central', name: 'Central Time', offset: 0 },
            { tzId: 'eastern', name: 'Eastern Time', offset: 6 },
            { tzId: 'western', name: 'Western Time', offset: -6 }
        ];
        for (const t of tzs) this.timezones.set(t.tzId, t);
    }

    _registerDefaultTools() {
        this.registerTool('getClock', (ctx) => this.getClock(ctx.clockId));
        this.registerTool('createClock', (ctx) => this.createClock(ctx));
    }

    createClock(data) {
        const id = data.id || `clk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const tz = this.timezones.get(data.tzId) || this.timezones.get('central');
        const clock = { clockId: id, name: data.name || 'Clock', tzId: data.tzId || 'central', currentTime: data.currentTime || Date.now(), paused: data.paused || false };
        this.clocks.set(id, clock);
        this.stats.totalClocks++;
        this._triggerHook('clockCreated', { clockId: id });
        return { success: true, clock };
    }

    getClock(id) { return this.clocks.get(id) ? { ...this.clocks.get(id) } : null; }
    listClocks() { return Array.from(this.clocks.values()).map(c => ({ ...c })); }
    listByTimezone(tzId) { return Array.from(this.clocks.values()).filter(c => c.tzId === tzId).map(c => ({ ...c })); }

    getTimezone(id) { return this.timezones.get(id) ? { ...this.timezones.get(id) } : null; }
    listTimezones() { return Array.from(this.timezones.values()).map(t => ({ ...t })); }

    tick(id) {
        const clock = this.clocks.get(id);
        if (!clock) return { success: false, error: 'CLOCK_NOT_FOUND' };
        if (!clock.paused) clock.currentTime += 1000;
        this._triggerHook('clockTicked', { clockId: id, time: clock.currentTime });
        return { success: true, clock: { ...clock } };
    }

    pause(id) {
        const clock = this.clocks.get(id);
        if (!clock) return { success: false, error: 'CLOCK_NOT_FOUND' };
        clock.paused = true;
        return { success: true };
    }

    resume(id) {
        const clock = this.clocks.get(id);
        if (!clock) return { success: false, error: 'CLOCK_NOT_FOUND' };
        clock.paused = false;
        return { success: true };
    }

    syncClocks(masterId, slaveIds) {
        const master = this.clocks.get(masterId);
        if (!master) return { success: false, error: 'CLOCK_NOT_FOUND' };
        for (const slaveId of slaveIds) {
            const slave = this.clocks.get(slaveId);
            if (slave) slave.currentTime = master.currentTime;
        }
        this._triggerHook('clocksSynced', { masterId, slaveIds });
        return { success: true };
    }

    calculateOffset(clockId) {
        const clock = this.clocks.get(clockId);
        if (!clock) return null;
        const tz = this.timezones.get(clock.tzId);
        return tz ? tz.offset * 3600000 : 0;
    }

    deleteClock(clockId) {
        if (!this.clocks.has(clockId)) return { success: false, error: 'CLOCK_NOT_FOUND' };
        this.clocks.delete(clockId);
        this._triggerHook('clockDeleted', { clockId });
        return { success: true };
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
        if (this.stats.totalClocks < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { clocks: Array.from(this.clocks.entries()), timezones: Array.from(this.timezones.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.clocks) this.clocks = new Map(data.clocks);
        if (data.timezones) this.timezones = new Map(data.timezones);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, clockCount: this.clocks.size, timezoneCount: this.timezones.size }; }
}