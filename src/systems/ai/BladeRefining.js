/**
 * BladeRefining.js - 刀刃打磨系统
 * V513 Iteration 15/15 Round 20
 */
export class BladeRefining {
    constructor(config = {}) {
        this.config = { maxBlades: config.maxBlades || 200, baseEdge: config.baseEdge || 20, ...config };
        this.blades = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBlades: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBlade', (ctx) => this.getBlade(ctx.bladeId));
        this.registerTool('refineBlade', (ctx) => this.refineBlade(ctx));
    }

    refineBlade(data) {
        if (this.blades.size >= this.config.maxBlades) return { success: false, error: 'MAX_BLADES_REACHED' };
        const id = data.bladeId || `bld_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const blade = {
            bladeId: id,
            refinerId: data.refinerId,
            name: data.name || 'Unnamed Blade',
            edge: data.edge != null ? data.edge : this.config.baseEdge,
            oils: data.oils || [],
            polishing: data.polishing != null ? data.polishing : 0,
            status: 'raw',
            createdAt: Date.now()
        };
        this.blades.set(id, blade);
        this.stats.totalBlades++;
        this._triggerHook('bladeRefined', { bladeId: id, refinerId: blade.refinerId });
        return { success: true, blade };
    }

    getBlade(id) { return this.blades.get(id) ? { ...this.blades.get(id) } : null; }
    listBlades() { return Array.from(this.blades.values()).map(b => ({ ...b })); }
    listByRefiner(refinerId) { return Array.from(this.blades.values()).filter(b => b.refinerId === refinerId).map(b => ({ ...b })); }
    listMastered() { return Array.from(this.blades.values()).filter(b => b.status === 'mastered').map(b => ({ ...b })); }

    addOil(bladeId, oil) {
        const blade = this.blades.get(bladeId);
        if (!blade) return { success: false, error: 'BLADE_NOT_FOUND' };
        blade.oils.push(oil);
        this._triggerHook('oilAdded', { bladeId, oil });
        return { success: true };
    }

    increaseEdge(bladeId, amount = 5) {
        const blade = this.blades.get(bladeId);
        if (!blade) return { success: false, error: 'BLADE_NOT_FOUND' };
        blade.edge += amount;
        if (blade.edge >= 100 && blade.status === 'raw') blade.status = 'refined';
        this._triggerHook('edgeIncreased', { bladeId, newEdge: blade.edge });
        return { success: true };
    }

    polishBlade(bladeId, amount = 5) {
        const blade = this.blades.get(bladeId);
        if (!blade) return { success: false, error: 'BLADE_NOT_FOUND' };
        blade.polishing += amount;
        this._triggerHook('bladePolished', { bladeId, newPolishing: blade.polishing });
        return { success: true };
    }

    masterBlade(bladeId) {
        const blade = this.blades.get(bladeId);
        if (!blade) return { success: false, error: 'BLADE_NOT_FOUND' };
        blade.status = 'mastered';
        this._triggerHook('bladeMastered', { bladeId });
        return { success: true };
    }

    calculateBladeValue(bladeId) {
        const blade = this.blades.get(bladeId);
        if (!blade) return 0;
        return blade.edge * 2 + blade.polishing + blade.oils.length * 10;
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
        if (this.stats.totalBlades < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBlades += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { blades: Array.from(this.blades.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.blades) this.blades = new Map(data.blades);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, bladeCount: this.blades.size }; }
}
