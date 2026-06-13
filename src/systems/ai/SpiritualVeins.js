/**
 * SpiritualVeins.js - 灵脉系统
 * V448 Iteration 10/15 Round 16
 */
export class SpiritualVeins {
    constructor(config = {}) {
        this.config = { maxVeins: config.maxVeins || 50, baseOutput: config.baseOutput || 10, ...config };
        this.veins = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalVeins: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getVein', (ctx) => this.getVein(ctx.veinId));
        this.registerTool('discoverVein', (ctx) => this.discoverVein(ctx));
    }

    discoverVein(data) {
        const id = data.id || `vn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const vein = { veinId: id, ownerId: data.ownerId, name: data.name || 'unnamed_vein', type: data.type || 'copper', purity: data.purity || 50, output: data.output || this.config.baseOutput, reserves: data.reserves || 100, status: 'flowing', discoveredAt: Date.now() };
        this.veins.set(id, vein);
        this.stats.totalVeins++;
        this._triggerHook('veinDiscovered', { veinId: id });
        return { success: true, vein };
    }

    getVein(id) { return this.veins.get(id) ? { ...this.veins.get(id) } : null; }
    listVeins() { return Array.from(this.veins.values()).map(v => ({ ...v })); }
    listByOwner(ownerId) { return Array.from(this.veins.values()).filter(v => v.ownerId === ownerId).map(v => ({ ...v })); }
    listByType(type) { return Array.from(this.veins.values()).filter(v => v.type === type).map(v => ({ ...v })); }

    extractEnergy(veinId, amount = 5) {
        const vein = this.veins.get(veinId);
        if (!vein) return { success: false, error: 'VEIN_NOT_FOUND' };
        vein.reserves = Math.max(0, vein.reserves - amount);
        if (vein.reserves === 0) vein.status = 'depleted';
        this._triggerHook('energyExtracted', { veinId, amount, newReserves: vein.reserves });
        return { success: true, newReserves: vein.reserves };
    }

    purifyVein(veinId, amount = 2) {
        const vein = this.veins.get(veinId);
        if (!vein) return { success: false, error: 'VEIN_NOT_FOUND' };
        vein.purity = Math.min(100, vein.purity + amount);
        this._triggerHook('veinPurified', { veinId, newPurity: vein.purity });
        return { success: true, newPurity: vein.purity };
    }

    refineVein(veinId) {
        const vein = this.veins.get(veinId);
        if (!vein) return { success: false, error: 'VEIN_NOT_FOUND' };
        vein.status = 'refined';
        this._triggerHook('veinRefined', { veinId });
        return { success: true };
    }

    calculateVeinProductivity(veinId) {
        const vein = this.veins.get(veinId);
        if (!vein) return 0;
        return vein.purity * (vein.reserves / 100) * vein.output;
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
        if (this.stats.totalVeins < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxVeins += 25;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { veins: Array.from(this.veins.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.veins) this.veins = new Map(data.veins);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, veinCount: this.veins.size }; }
}
