/**
 * MetalTempering.js - 金属淬火系统
 * V515 Iteration 17/20 Round 20
 */
export class MetalTempering {
    constructor(config = {}) {
        this.config = { maxMetals: config.maxMetals || 200, baseHardness: config.baseHardness || 20, ...config };
        this.metals = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMetals: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMetal', (ctx) => this.getMetal(ctx.metalId));
        this.registerTool('temperMetal', (ctx) => this.temperMetal(ctx));
    }

    temperMetal(data) {
        const id = data.metalId || `mtl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const metal = {
            metalId: id,
            smithId: data.smithId,
            name: data.name,
            type: data.type || 'steel',
            hardness: data.hardness || this.config.baseHardness,
            oils: data.oils || [],
            heat: data.heat || 0,
            status: data.status || 'raw',
            createdAt: Date.now()
        };
        this.metals.set(id, metal);
        this.stats.totalMetals++;
        this._triggerHook('metalTempered', { metalId: id });
        return { success: true, metal };
    }

    getMetal(id) { return this.metals.get(id) ? { ...this.metals.get(id) } : null; }
    listMetals() { return Array.from(this.metals.values()).map(m => ({ ...m })); }
    listBySmith(smithId) { return Array.from(this.metals.values()).filter(m => m.smithId === smithId).map(m => ({ ...m })); }
    listTempered() { return Array.from(this.metals.values()).filter(m => m.status === 'tempered').map(m => ({ ...m })); }

    addOil(metalId, oil) {
        const metal = this.metals.get(metalId);
        if (!metal) return { success: false, error: 'METAL_NOT_FOUND' };
        metal.oils.push(oil);
        this._triggerHook('oilAdded', { metalId, oil });
        return { success: true };
    }

    increaseHeat(metalId, amount = 10) {
        const metal = this.metals.get(metalId);
        if (!metal) return { success: false, error: 'METAL_NOT_FOUND' };
        metal.heat += amount;
        this._triggerHook('heatIncreased', { metalId, newHeat: metal.heat });
        return { success: true };
    }

    hardenMetal(metalId, amount = 5) {
        const metal = this.metals.get(metalId);
        if (!metal) return { success: false, error: 'METAL_NOT_FOUND' };
        metal.hardness += amount;
        this._triggerHook('metalHardened', { metalId, newHardness: metal.hardness });
        return { success: true };
    }

    markTempered(metalId) {
        const metal = this.metals.get(metalId);
        if (!metal) return { success: false, error: 'METAL_NOT_FOUND' };
        metal.status = 'tempered';
        this._triggerHook('metalTempered', { metalId });
        return { success: true };
    }

    calculateMetalValue(metalId) {
        const metal = this.metals.get(metalId);
        if (!metal) return 0;
        return metal.hardness * 2 + metal.heat / 10 + metal.oils.length * 10;
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
        if (this.stats.totalMetals < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMetals += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { metals: Array.from(this.metals.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.metals) this.metals = new Map(data.metals);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, metalCount: this.metals.size }; }
}
