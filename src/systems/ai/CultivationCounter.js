/**
 * CultivationCounter.js - 修真反击
 * V736 Iteration 29/30 Round 29 - Cultivation Counter
 */
export class CultivationCounter {
    constructor(config = {}) {
        this.config = { maxCounters: config.maxCounters || 30, baseReadiness: config.baseReadiness || 20, ...config };
        this.counters = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCounters: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCounter', (ctx) => this.getCounter(ctx.counterId));
        this.registerTool('recruitCounter', (ctx) => this.recruitCounter(ctx));
    }

    recruitCounter(data) {
        const id = data.id || `ctr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const counter = { counterId: id, masterId: data.masterId, name: data.name || 'unnamed', type: data.type || 'strike', readiness: data.readiness || this.config.baseReadiness, retorts: [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.counters.set(id, counter);
        this.stats.totalCounters++;
        this._triggerHook('counterRecruited', { counterId: id });
        return { success: true, counter };
    }

    getCounter(id) { return this.counters.get(id) ? { ...this.counters.get(id) } : null; }
    listCounters() { return Array.from(this.counters.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.counters.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.counters.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addRetort(counterId, retort) {
        const counter = this.counters.get(counterId);
        if (!counter) return { success: false, error: 'COUNTER_NOT_FOUND' };
        counter.retorts.push(retort);
        this._triggerHook('retortAdded', { counterId, retort });
        return { success: true };
    }

    raiseReadiness(counterId, amount = 5) {
        const counter = this.counters.get(counterId);
        if (!counter) return { success: false, error: 'COUNTER_NOT_FOUND' };
        counter.readiness += amount;
        this._triggerHook('readinessRaised', { counterId, newReadiness: counter.readiness });
        return { success: true };
    }

    levelUpCounter(counterId) {
        const counter = this.counters.get(counterId);
        if (!counter) return { success: false, error: 'COUNTER_NOT_FOUND' };
        counter.level++;
        if (counter.level >= 3) counter.status = 'veteran';
        this._triggerHook('counterLeveledUp', { counterId, newLevel: counter.level });
        return { success: true };
    }

    legendCounter(counterId) {
        const counter = this.counters.get(counterId);
        if (!counter) return { success: false, error: 'COUNTER_NOT_FOUND' };
        counter.status = 'legendary';
        this._triggerHook('counterLegendized', { counterId });
        return { success: true };
    }

    calculateCounterValue(counterId) {
        const counter = this.counters.get(counterId);
        if (!counter) return 0;
        return counter.level * 100 + counter.readiness * 2 + counter.retorts.length * 30;
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
        if (this.stats.totalCounters < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCounters += 15;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { counters: Array.from(this.counters.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.counters) this.counters = new Map(data.counters);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, counterCount: this.counters.size }; }
}
