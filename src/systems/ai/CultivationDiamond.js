/**
 * CultivationDiamond.js - 修真钻石系统
 * V829 Iteration 2/30 Round 33
 */
export class CultivationDiamond {
    constructor(config = {}) {
        this.config = { maxDiamonds: config.maxDiamonds || 20, baseHardness: config.baseHardness || 20, ...config };
        this.diamonds = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDiamonds: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDiamond', (ctx) => this.getDiamond(ctx.diamondId));
        this.registerTool('recruitDiamond', (ctx) => this.recruitDiamond(ctx));
    }

    recruitDiamond(data) {
        const id = data.id || `dia_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const diamond = {
            diamondId: id,
            masterId: data.masterId || 'unknown_master',
            name: data.name || 'unnamed_diamond',
            type: data.type || 'white',
            hardness: data.hardness || this.config.baseHardness,
            facets: data.facets || [],
            level: 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.diamonds.set(id, diamond);
        this.stats.totalDiamonds++;
        this._triggerHook('diamondRecruited', { diamondId: id });
        return { success: true, diamond };
    }

    getDiamond(id) { return this.diamonds.get(id) ? { ...this.diamonds.get(id) } : null; }
    listDiamonds() { return Array.from(this.diamonds.values()).map(d => ({ ...d })); }
    listByMaster(masterId) { return Array.from(this.diamonds.values()).filter(d => d.masterId === masterId).map(d => ({ ...d })); }
    listLegendary() { return Array.from(this.diamonds.values()).filter(d => d.status === 'legendary').map(d => ({ ...d })); }

    addFacet(diamondId, facet) {
        const diamond = this.diamonds.get(diamondId);
        if (!diamond) return { success: false, error: 'DIAMOND_NOT_FOUND' };
        diamond.facets.push(facet);
        this._triggerHook('facetAdded', { diamondId, facet });
        return { success: true };
    }

    raiseHardness(diamondId, amount = 5) {
        const diamond = this.diamonds.get(diamondId);
        if (!diamond) return { success: false, error: 'DIAMOND_NOT_FOUND' };
        diamond.hardness += amount;
        this._triggerHook('hardnessRaised', { diamondId, newHardness: diamond.hardness });
        return { success: true };
    }

    levelUpDiamond(diamondId) {
        const diamond = this.diamonds.get(diamondId);
        if (!diamond) return { success: false, error: 'DIAMOND_NOT_FOUND' };
        diamond.level++;
        this._triggerHook('diamondLeveledUp', { diamondId, newLevel: diamond.level });
        return { success: true };
    }

    legendDiamond(diamondId) {
        const diamond = this.diamonds.get(diamondId);
        if (!diamond) return { success: false, error: 'DIAMOND_NOT_FOUND' };
        diamond.status = 'legendary';
        this._triggerHook('diamondLegendized', { diamondId });
        return { success: true };
    }

    calculateDiamondValue(diamondId) {
        const diamond = this.diamonds.get(diamondId);
        if (!diamond) return 0;
        return diamond.level * 100 + diamond.hardness * 2 + diamond.facets.length * 30;
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
        if (this.stats.totalDiamonds < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDiamonds += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { diamonds: Array.from(this.diamonds.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.diamonds) this.diamonds = new Map(data.diamonds);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, diamondCount: this.diamonds.size }; }
}
