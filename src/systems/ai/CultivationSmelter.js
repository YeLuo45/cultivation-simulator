/**
 * CultivationSmelter.js - 修真冶炼
 * V857 Iteration 30/30 FINAL Round 33
 */
export class CultivationSmelter {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxSmelters: config.maxSmelters || 30, baseFirepower: config.baseFirepower || 20, ...config };
        this.smelters = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSmelted: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSmelter', (ctx) => this.getSmelter(ctx.smelterId));
        this.registerTool('listByMaterial', (ctx) => this.listByMaterial(ctx.material));
    }

    smeltOre(data) {
        const id = data.id || `smelter_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const smelter = {
            smelterId: id, masterId: data.masterId || 'unknown', name: data.name || 'Unnamed Smelter',
            material: data.material || 'iron', firepower: data.firepower || this.config.baseFirepower, smelts: data.smelts || [],
            level: data.level || 1, status: 'novice',
            smeltedAt: Date.now(), lastSmelt: Date.now()
        };
        this.smelters.set(id, smelter);
        this.stats.totalSmelted++;
        this._triggerHook('oreSmelted', { smelterId: id });
        return { success: true, smelter };
    }

    getSmelter(id) { return this.smelters.get(id) ? { ...this.smelters.get(id) } : null; }
    listSmelters() { return Array.from(this.smelters.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.smelters.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listByMaterial(material) { return Array.from(this.smelters.values()).filter(s => s.material === material).map(s => ({ ...s })); }
    listVeteran() { return Array.from(this.smelters.values()).filter(s => s.status === 'veteran' || s.status === 'legendary').map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.smelters.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }
    listTop(n = 10) { return [...this.listSmelters()].sort((a, b) => b.level - a.level).slice(0, n); }

    addSmelt(smelterId, smelt) {
        const smelter = this.smelters.get(smelterId);
        if (!smelter) return { success: false, error: 'SMELTER_NOT_FOUND' };
        smelter.smelts.push(smelt);
        this._triggerHook('smeltAdded', { smelterId });
        return { success: true };
    }

    raiseFirepower(smelterId, amount = 5) {
        const smelter = this.smelters.get(smelterId);
        if (!smelter) return { success: false, error: 'SMELTER_NOT_FOUND' };
        smelter.firepower = Math.max(0, smelter.firepower + amount);
        this._triggerHook('firepowerRaised', { smelterId });
        return { success: true };
    }

    promoteSmelter(smelterId) {
        const smelter = this.smelters.get(smelterId);
        if (!smelter) return { success: false, error: 'SMELTER_NOT_FOUND' };
        smelter.level++;
        this._triggerHook('smelterPromoted', { smelterId });
        return { success: true };
    }

    veteranizeSmelter(smelterId) {
        const smelter = this.smelters.get(smelterId);
        if (!smelter) return { success: false, error: 'SMELTER_NOT_FOUND' };
        smelter.status = 'veteran';
        this._triggerHook('smelterVeteranized', { smelterId });
        return { success: true };
    }

    legendizeSmelter(smelterId) {
        const smelter = this.smelters.get(smelterId);
        if (!smelter) return { success: false, error: 'SMELTER_NOT_FOUND' };
        smelter.status = 'legendary';
        this._triggerHook('smelterLegendized', { smelterId });
        return { success: true };
    }

    changeMaterial(smelterId, newMaterial) {
        const smelter = this.smelters.get(smelterId);
        if (!smelter) return { success: false, error: 'SMELTER_NOT_FOUND' };
        smelter.material = newMaterial;
        this._triggerHook('materialChanged', { smelterId });
        return { success: true };
    }

    tickSmelter(smelterId) {
        const smelter = this.smelters.get(smelterId);
        if (!smelter) return { success: false, error: 'SMELTER_NOT_FOUND' };
        smelter.lastSmelt = Date.now();
        this._triggerHook('smelterTicked', { smelterId });
        return { success: true };
    }

    calculateSmelterValue(smelterId) {
        const smelter = this.smelters.get(smelterId);
        if (!smelter) return 0;
        return smelter.level * 100 + smelter.firepower * 2 + smelter.smelts.length * 30;
    }

    mergeSmelters(smelterId, otherSmelterId) {
        const smelter = this.smelters.get(smelterId);
        const other = this.smelters.get(otherSmelterId);
        if (!smelter || !other) return { success: false, error: 'SMELTER_NOT_FOUND' };
        smelter.firepower = Math.max(smelter.firepower, other.firepower);
        smelter.smelts = [...smelter.smelts, ...other.smelts];
        this.smelters.delete(otherSmelterId);
        this._triggerHook('smeltersMerged', { smelterId, otherSmelterId });
        return { success: true };
    }

    deleteSmelter(smelterId) {
        if (!this.smelters.has(smelterId)) return { success: false, error: 'SMELTER_NOT_FOUND' };
        this.smelters.delete(smelterId);
        this._triggerHook('smelterDeleted', { smelterId });
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
        if (this.stats.totalSmelted < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { smelters: Array.from(this.smelters.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.smelters) this.smelters = new Map(data.smelters);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, smelterCount: this.smelters.size }; }
}