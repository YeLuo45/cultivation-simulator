/**
 * TimeSand.js - 时之沙 (Time Sand system)
 * V433 Iteration 10/15 Round 15
 */
export class TimeSand {
    constructor(config = {}) {
        this.config = { maxSands: config.maxSands || 100, baseGrains: config.baseGrains || 10, ...config };
        this.sands = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSands: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSand', (ctx) => this.getSand(ctx.sandId));
        this.registerTool('gatherSand', (ctx) => this.gatherSand(ctx));
    }

    gatherSand(data) {
        const id = data.id || `tms_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const sand = {
            sandId: id,
            masterId: data.masterId,
            name: data.name || 'Time Sand',
            flow: data.flow || 10,
            grains: data.grains || this.config.baseGrains,
            dilution: data.dilution || 0,
            frozen: false,
            status: 'flowing',
            createdAt: Date.now()
        };
        this.sands.set(id, sand);
        this.stats.totalSands++;
        this._triggerHook('sandGathered', { sandId: id });
        return { success: true, sand };
    }

    getSand(id) { return this.sands.get(id) ? { ...this.sands.get(id) } : null; }
    listSands() { return Array.from(this.sands.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.sands.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listFlowing() { return Array.from(this.sands.values()).filter(s => s.status === 'flowing').map(s => ({ ...s })); }

    accumulateGrain(sandId, amount = 5) {
        const sand = this.sands.get(sandId);
        if (!sand) return { success: false, error: 'SAND_NOT_FOUND' };
        sand.grains += amount;
        this._triggerHook('grainAccumulated', { sandId, amount, newGrains: sand.grains });
        return { success: true };
    }

    diluteFlow(sandId, amount = 2) {
        const sand = this.sands.get(sandId);
        if (!sand) return { success: false, error: 'SAND_NOT_FOUND' };
        sand.dilution += amount;
        sand.flow = Math.max(0, sand.flow - amount);
        this._triggerHook('flowDiluted', { sandId, amount, newFlow: sand.flow });
        return { success: true };
    }

    freezeSand(sandId) {
        const sand = this.sands.get(sandId);
        if (!sand) return { success: false, error: 'SAND_NOT_FOUND' };
        sand.frozen = true;
        sand.status = 'paused';
        this._triggerHook('sandFrozen', { sandId });
        return { success: true };
    }

    rewindSand(sandId) {
        const sand = this.sands.get(sandId);
        if (!sand) return { success: false, error: 'SAND_NOT_FOUND' };
        sand.status = 'rewinding';
        this._triggerHook('sandRewound', { sandId });
        return { success: true };
    }

    calculateTemporalDensity(sandId) {
        const sand = this.sands.get(sandId);
        if (!sand) return 0;
        return sand.grains * (1 + sand.flow / 100) + sand.dilution * 2;
    }

    listFrozen() { return Array.from(this.sands.values()).filter(s => s.frozen).map(s => ({ ...s })); }

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
        if (this.stats.totalSands < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSands += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { sands: Array.from(this.sands.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.sands) this.sands = new Map(data.sands);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, sandCount: this.sands.size }; }
}
