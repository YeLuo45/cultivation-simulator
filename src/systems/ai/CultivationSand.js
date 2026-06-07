/**
 * CultivationSand.js - 修真沙系统
 * V843 Iteration 16/30 Round 33
 */
export class CultivationSand {
    constructor(config = {}) {
        this.config = { maxSands: config.maxSands || 20, baseFineness: config.baseFineness || 20, ...config };
        this.sands = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSands: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSand', (ctx) => this.getSand(ctx.sandId));
        this.registerTool('recruitSand', (ctx) => this.recruitSand(ctx));
    }

    recruitSand(data) {
        const id = data.sandId || `snd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const sand = {
            sandId: id,
            masterId: data.masterId,
            name: data.name,
            type: data.type || 'desert',
            fineness: data.fineness || this.config.baseFineness,
            grains: data.grains || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.sands.set(id, sand);
        this.stats.totalSands++;
        this._triggerHook('sandRecruited', { sandId: id });
        return { success: true, sand };
    }

    getSand(id) { return this.sands.get(id) ? { ...this.sands.get(id) } : null; }
    listSands() { return Array.from(this.sands.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.sands.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.sands.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addGrain(sandId, grain) {
        const sand = this.sands.get(sandId);
        if (!sand) return { success: false, error: 'SAND_NOT_FOUND' };
        sand.grains.push(grain);
        this._triggerHook('grainAdded', { sandId, grain });
        return { success: true };
    }

    raiseFineness(sandId, amount = 5) {
        const sand = this.sands.get(sandId);
        if (!sand) return { success: false, error: 'SAND_NOT_FOUND' };
        sand.fineness += amount;
        this._triggerHook('finenessRaised', { sandId, newFineness: sand.fineness });
        return { success: true };
    }

    levelUpSand(sandId) {
        const sand = this.sands.get(sandId);
        if (!sand) return { success: false, error: 'SAND_NOT_FOUND' };
        sand.level++;
        this._triggerHook('sandLeveledUp', { sandId, newLevel: sand.level });
        return { success: true };
    }

    legendSand(sandId) {
        const sand = this.sands.get(sandId);
        if (!sand) return { success: false, error: 'SAND_NOT_FOUND' };
        sand.status = 'legendary';
        this._triggerHook('sandLegendized', { sandId });
        return { success: true };
    }

    calculateSandValue(sandId) {
        const sand = this.sands.get(sandId);
        if (!sand) return 0;
        return sand.level * 100 + sand.fineness * 2 + sand.grains.length * 30;
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
