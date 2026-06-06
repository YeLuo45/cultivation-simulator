/**
 * GemCutting.js - 宝石切割系统
 * V514 Iteration 16/20 Round 20
 */
export class GemCutting {
    constructor(config = {}) {
        this.config = { maxGems: config.maxGems || 200, baseClarity: config.baseClarity || 20, ...config };
        this.gems = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGems: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getGem', (ctx) => this.getGem(ctx.gemId));
        this.registerTool('cutGem', (ctx) => this.cutGem(ctx));
    }

    cutGem(data) {
        const id = data.id || `gem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const gem = {
            gemId: id,
            cutterId: data.cutterId || 'unknown_cutter',
            name: data.name || 'unnamed_gem',
            type: data.type || 'diamond',
            clarity: data.clarity || this.config.baseClarity,
            facets: data.facets || [],
            polish: data.polish || 0,
            status: data.status || 'raw',
            createdAt: Date.now()
        };
        this.gems.set(id, gem);
        this.stats.totalGems++;
        this._triggerHook('gemCut', { gemId: id });
        return { success: true, gem };
    }

    getGem(id) { return this.gems.get(id) ? { ...this.gems.get(id) } : null; }
    listGems() { return Array.from(this.gems.values()).map(g => ({ ...g })); }
    listByCutter(cutterId) { return Array.from(this.gems.values()).filter(g => g.cutterId === cutterId).map(g => ({ ...g })); }
    listMastered() { return Array.from(this.gems.values()).filter(g => g.status === 'mastered').map(g => ({ ...g })); }

    addFacet(gemId, facet) {
        const gem = this.gems.get(gemId);
        if (!gem) return { success: false, error: 'GEM_NOT_FOUND' };
        gem.facets.push(facet);
        if (gem.facets.length >= 5) gem.status = 'cut';
        this._triggerHook('facetAdded', { gemId, facet });
        return { success: true };
    }

    increaseClarity(gemId, amount = 5) {
        const gem = this.gems.get(gemId);
        if (!gem) return { success: false, error: 'GEM_NOT_FOUND' };
        gem.clarity += amount;
        this._triggerHook('clarityIncreased', { gemId, newClarity: gem.clarity });
        return { success: true };
    }

    polishGem(gemId, amount = 5) {
        const gem = this.gems.get(gemId);
        if (!gem) return { success: false, error: 'GEM_NOT_FOUND' };
        gem.polish += amount;
        this._triggerHook('gemPolished', { gemId, newPolish: gem.polish });
        return { success: true };
    }

    masterGem(gemId) {
        const gem = this.gems.get(gemId);
        if (!gem) return { success: false, error: 'GEM_NOT_FOUND' };
        gem.status = 'mastered';
        this._triggerHook('gemMastered', { gemId });
        return { success: true };
    }

    calculateGemValue(gemId) {
        const gem = this.gems.get(gemId);
        if (!gem) return 0;
        return gem.clarity * 2 + gem.polish + gem.facets.length * 30;
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
        if (this.stats.totalGems < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxGems += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { gems: Array.from(this.gems.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.gems) this.gems = new Map(data.gems);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, gemCount: this.gems.size }; }
}
