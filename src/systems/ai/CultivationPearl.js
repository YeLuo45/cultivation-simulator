/**
 * CultivationPearl.js - 修真珍珠
 * V830 Iteration 3/30 Round 33
 */
export class CultivationPearl {
    constructor(config = {}) {
        this.config = { maxPearls: config.maxPearls || 20, baseLuster: config.baseLuster || 20, ...config };
        this.pearls = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPearls: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPearl', (ctx) => this.getPearl(ctx.pearlId));
        this.registerTool('recruitPearl', (ctx) => this.recruitPearl(ctx));
    }

    recruitPearl(data) {
        const id = data.id || `pearl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const pearl = {
            pearlId: id,
            masterId: data.masterId || 'unknown',
            name: data.name || 'Unnamed Pearl',
            type: data.type || 'salt',
            luster: data.luster || this.config.baseLuster,
            layers: data.layers || [],
            level: data.level || 1,
            status: data.status || 'novice',
            recruitedAt: Date.now()
        };
        this.pearls.set(id, pearl);
        this.stats.totalPearls++;
        this._triggerHook('pearlRecruited', { pearlId: id });
        return { success: true, pearl };
    }

    getPearl(id) { return this.pearls.get(id) ? { ...this.pearls.get(id) } : null; }
    listPearls() { return Array.from(this.pearls.values()).map(p => ({ ...p })); }
    listByMaster(masterId) { return Array.from(this.pearls.values()).filter(p => p.masterId === masterId).map(p => ({ ...p })); }
    listLegendary() { return Array.from(this.pearls.values()).filter(p => p.status === 'legendary').map(p => ({ ...p })); }

    addLayer(pearlId, layer) {
        const pearl = this.pearls.get(pearlId);
        if (!pearl) return { success: false, error: 'PEARL_NOT_FOUND' };
        pearl.layers.push(layer);
        this._triggerHook('layerAdded', { pearlId, layer });
        return { success: true };
    }

    raiseLuster(pearlId, amount = 5) {
        const pearl = this.pearls.get(pearlId);
        if (!pearl) return { success: false, error: 'PEARL_NOT_FOUND' };
        pearl.luster += amount;
        this._triggerHook('lusterRaised', { pearlId, newLuster: pearl.luster });
        return { success: true };
    }

    levelUpPearl(pearlId) {
        const pearl = this.pearls.get(pearlId);
        if (!pearl) return { success: false, error: 'PEARL_NOT_FOUND' };
        pearl.level++;
        this._triggerHook('pearlLeveledUp', { pearlId, newLevel: pearl.level });
        return { success: true };
    }

    legendPearl(pearlId) {
        const pearl = this.pearls.get(pearlId);
        if (!pearl) return { success: false, error: 'PEARL_NOT_FOUND' };
        pearl.status = 'legendary';
        this._triggerHook('pearlLegendized', { pearlId });
        return { success: true };
    }

    calculatePearlValue(pearlId) {
        const pearl = this.pearls.get(pearlId);
        if (!pearl) return 0;
        return pearl.level * 100 + pearl.luster * 2 + pearl.layers.length * 30;
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
        if (this.stats.totalPearls < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPearls += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { pearls: Array.from(this.pearls.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.pearls) this.pearls = new Map(data.pearls);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, pearlCount: this.pearls.size }; }
}
