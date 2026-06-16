/**
 * WineBrewing.js - 灵酒酿造系统
 * V441 Iteration 3/15 Round 16
 */
export class WineBrewing {
    constructor(config = {}) {
        this.config = { maxWines: config.maxWines || 200, baseAlcohol: config.baseAlcohol || 15, ...config };
        this.wines = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalWines: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getWine', (ctx) => this.getWine(ctx.wineId));
        this.registerTool('brewWine', (ctx) => this.brewWine(ctx));
    }

    brewWine(data) {
        const id = data.id || `wn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const wine = { wineId: id, brewerId: data.brewerId, name: data.name || 'Mystic Brew', base: data.base || 'fruit', alcohol: data.alcohol || this.config.baseAlcohol, aroma: data.aroma || 10, age: data.age || 0, status: 'brewing', brewedAt: Date.now() };
        this.wines.set(id, wine);
        this.stats.totalWines++;
        this._triggerHook('wineBrewed', { wineId: id });
        return { success: true, wine };
    }

    getWine(id) { return this.wines.get(id) ? { ...this.wines.get(id) } : null; }
    listWines() { return Array.from(this.wines.values()).map(w => ({ ...w })); }
    listByBase(base) { return Array.from(this.wines.values()).filter(w => w.base === base).map(w => ({ ...w })); }
    listByBrewer(brewerId) { return Array.from(this.wines.values()).filter(w => w.brewerId === brewerId).map(w => ({ ...w })); }

    fermentWine(wineId, amount = 5) {
        const wine = this.wines.get(wineId);
        if (!wine) return { success: false, error: 'WINE_NOT_FOUND' };
        wine.alcohol += amount;
        this._triggerHook('wineFermented', { wineId, newAlcohol: wine.alcohol });
        return { success: true };
    }

    ageWine(wineId, amount = 10) {
        const wine = this.wines.get(wineId);
        if (!wine) return { success: false, error: 'WINE_NOT_FOUND' };
        wine.age += amount;
        wine.status = 'aged';
        this._triggerHook('wineAged', { wineId, newAge: wine.age });
        return { success: true };
    }

    serveWine(wineId) {
        const wine = this.wines.get(wineId);
        if (!wine) return { success: false, error: 'WINE_NOT_FOUND' };
        wine.status = 'served';
        this._triggerHook('wineServed', { wineId });
        return { success: true };
    }

    calculateWineQuality(wineId) {
        const wine = this.wines.get(wineId);
        if (!wine) return 0;
        return wine.alcohol * (1 + wine.age / 100) + wine.aroma;
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
        if (this.stats.totalWines < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxWines += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { wines: Array.from(this.wines.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.wines) this.wines = new Map(data.wines);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, wineCount: this.wines.size }; }
}
