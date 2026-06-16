/**
 * CultivationCrystal.js - 修真水晶
 * V828 Iteration 1/30 Round 33
 */
export class CultivationCrystal {
    constructor(config = {}) {
        this.config = { maxCrystals: config.maxCrystals || 20, baseClarity: config.baseClarity || 20, ...config };
        this.crystals = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCrystals: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCrystal', (ctx) => this.getCrystal(ctx.crystalId));
        this.registerTool('recruitCrystal', (ctx) => this.recruitCrystal(ctx));
    }

    recruitCrystal(data) {
        const id = data.crystalId || `cry_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const crystal = { crystalId: id, masterId: data.masterId, name: data.name || 'Unnamed Crystal', type: data.type || 'clear', clarity: data.clarity || this.config.baseClarity, facets: data.facets || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.crystals.set(id, crystal);
        this.stats.totalCrystals++;
        this._triggerHook('crystalRecruited', { crystalId: id });
        return { success: true, crystal };
    }

    getCrystal(id) { return this.crystals.get(id) ? { ...this.crystals.get(id) } : null; }
    listCrystals() { return Array.from(this.crystals.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.crystals.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.crystals.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addFacet(crystalId, facet) {
        const crystal = this.crystals.get(crystalId);
        if (!crystal) return { success: false, error: 'CRYSTAL_NOT_FOUND' };
        crystal.facets.push(facet);
        this._triggerHook('facetAdded', { crystalId, facet, facetCount: crystal.facets.length });
        return { success: true };
    }

    raiseClarity(crystalId, amount = 5) {
        const crystal = this.crystals.get(crystalId);
        if (!crystal) return { success: false, error: 'CRYSTAL_NOT_FOUND' };
        crystal.clarity += amount;
        this._triggerHook('clarityRaised', { crystalId, newClarity: crystal.clarity });
        return { success: true };
    }

    levelUpCrystal(crystalId) {
        const crystal = this.crystals.get(crystalId);
        if (!crystal) return { success: false, error: 'CRYSTAL_NOT_FOUND' };
        crystal.level++;
        this._triggerHook('crystalLeveledUp', { crystalId, newLevel: crystal.level });
        return { success: true };
    }

    legendCrystal(crystalId) {
        const crystal = this.crystals.get(crystalId);
        if (!crystal) return { success: false, error: 'CRYSTAL_NOT_FOUND' };
        crystal.status = 'legendary';
        this._triggerHook('crystalLegendized', { crystalId });
        return { success: true };
    }

    calculateCrystalValue(crystalId) {
        const crystal = this.crystals.get(crystalId);
        if (!crystal) return 0;
        return crystal.level * 100 + crystal.clarity * 2 + crystal.facets.length * 30;
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
        if (this.stats.totalCrystals < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCrystals += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { crystals: Array.from(this.crystals.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.crystals) this.crystals = new Map(data.crystals);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, crystalCount: this.crystals.size }; }
}
