/**
 * CultivationHour.js - 修真时辰 (Cultivation Hour system)
 * V820 Iteration 23/30 Round 32
 */
export class CultivationHour {
    constructor(config = {}) {
        this.config = { maxHours: config.maxHours || 20, baseWeight: config.baseWeight || 20, ...config };
        this.hours = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalHours: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getHour', (ctx) => this.getHour(ctx.hourId));
        this.registerTool('recruitHour', (ctx) => this.recruitHour(ctx));
    }

    recruitHour(data) {
        const id = data.id || `chr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const hour = {
            hourId: id,
            masterId: data.masterId,
            name: data.name || 'Cultivation Hour',
            type: data.type || 'earthly',
            weight: data.weight || this.config.baseWeight,
            ticks: data.ticks || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.hours.set(id, hour);
        this.stats.totalHours++;
        this._triggerHook('hourRecruited', { hourId: id });
        return { success: true, hour };
    }

    getHour(id) { return this.hours.get(id) ? { ...this.hours.get(id) } : null; }
    listHours() { return Array.from(this.hours.values()).map(h => ({ ...h, ticks: [...h.ticks] })); }
    listByMaster(masterId) { return Array.from(this.hours.values()).filter(h => h.masterId === masterId).map(h => ({ ...h, ticks: [...h.ticks] })); }
    listLegendary() { return Array.from(this.hours.values()).filter(h => h.status === 'legendary').map(h => ({ ...h, ticks: [...h.ticks] })); }

    addTick(hourId, tick) {
        const hour = this.hours.get(hourId);
        if (!hour) return { success: false, error: 'HOUR_NOT_FOUND' };
        const t = typeof tick === 'string' ? { name: tick, timestamp: Date.now() } : { ...tick, timestamp: tick.timestamp || Date.now() };
        hour.ticks.push(t);
        this._triggerHook('tickAdded', { hourId, tick: t, tickCount: hour.ticks.length });
        return { success: true, tick: t };
    }

    raiseWeight(hourId, amount = 5) {
        const hour = this.hours.get(hourId);
        if (!hour) return { success: false, error: 'HOUR_NOT_FOUND' };
        hour.weight += amount;
        this._triggerHook('weightRaised', { hourId, amount, newWeight: hour.weight });
        return { success: true };
    }

    levelUpHour(hourId) {
        const hour = this.hours.get(hourId);
        if (!hour) return { success: false, error: 'HOUR_NOT_FOUND' };
        hour.level++;
        this._triggerHook('hourLeveledUp', { hourId, newLevel: hour.level });
        return { success: true };
    }

    legendHour(hourId) {
        const hour = this.hours.get(hourId);
        if (!hour) return { success: false, error: 'HOUR_NOT_FOUND' };
        hour.status = 'legendary';
        this._triggerHook('hourLegendized', { hourId });
        return { success: true };
    }

    calculateHourValue(hourId) {
        const hour = this.hours.get(hourId);
        if (!hour) return 0;
        return hour.level * 100 + hour.weight * 2 + hour.ticks.length * 30;
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
        if (this.stats.totalHours < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxHours += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { hours: Array.from(this.hours.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.hours) this.hours = new Map(data.hours);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, hourCount: this.hours.size }; }
}
