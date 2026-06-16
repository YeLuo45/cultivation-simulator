/**
 * CultivationTopaz.js - 修真黄玉系统
 * V836 Iteration 9/30 Round 33
 */
export class CultivationTopaz {
    constructor(config = {}) {
        this.config = { maxTopazes: config.maxTopazes || 20, baseWarmth: config.baseWarmth || 20, ...config };
        this.topazes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTopazes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTopaz', (ctx) => this.getTopaz(ctx.topazId));
        this.registerTool('recruitTopaz', (ctx) => this.recruitTopaz(ctx));
    }

    recruitTopaz(data) {
        const id = data.id || `tpz_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const topaz = {
            topazId: id,
            masterId: data.masterId || 'unknown_master',
            name: data.name || 'unnamed_topaz',
            type: data.type || 'imperial',
            warmth: data.warmth || this.config.baseWarmth,
            inclusions: data.inclusions || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.topazes.set(id, topaz);
        this.stats.totalTopazes++;
        this._triggerHook('topazRecruited', { topazId: id });
        return { success: true, topaz };
    }

    getTopaz(id) { return this.topazes.get(id) ? { ...this.topazes.get(id) } : null; }
    listTopazes() { return Array.from(this.topazes.values()).map(t => ({ ...t })); }
    listByMaster(masterId) { return Array.from(this.topazes.values()).filter(t => t.masterId === masterId).map(t => ({ ...t })); }
    listLegendary() { return Array.from(this.topazes.values()).filter(t => t.status === 'legendary').map(t => ({ ...t })); }

    addInclusion(topazId, inclusion) {
        const topaz = this.topazes.get(topazId);
        if (!topaz) return { success: false, error: 'TOPAZ_NOT_FOUND' };
        topaz.inclusions.push(inclusion);
        if (topaz.inclusions.length >= 5) topaz.status = 'veteran';
        this._triggerHook('inclusionAdded', { topazId, inclusion });
        return { success: true };
    }

    raiseWarmth(topazId, amount = 5) {
        const topaz = this.topazes.get(topazId);
        if (!topaz) return { success: false, error: 'TOPAZ_NOT_FOUND' };
        topaz.warmth += amount;
        this._triggerHook('warmthRaised', { topazId, newWarmth: topaz.warmth });
        return { success: true };
    }

    levelUpTopaz(topazId) {
        const topaz = this.topazes.get(topazId);
        if (!topaz) return { success: false, error: 'TOPAZ_NOT_FOUND' };
        topaz.level++;
        this._triggerHook('topazLeveledUp', { topazId, newLevel: topaz.level });
        return { success: true };
    }

    legendTopaz(topazId) {
        const topaz = this.topazes.get(topazId);
        if (!topaz) return { success: false, error: 'TOPAZ_NOT_FOUND' };
        topaz.status = 'legendary';
        this._triggerHook('topazLegendized', { topazId });
        return { success: true };
    }

    calculateTopazValue(topazId) {
        const topaz = this.topazes.get(topazId);
        if (!topaz) return 0;
        return topaz.level * 100 + topaz.warmth * 2 + topaz.inclusions.length * 30;
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
        if (this.stats.totalTopazes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTopazes += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { topazes: Array.from(this.topazes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.topazes) this.topazes = new Map(data.topazes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, topazCount: this.topazes.size }; }
}
