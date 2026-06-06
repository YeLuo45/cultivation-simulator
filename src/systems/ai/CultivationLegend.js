/**
 * CultivationLegend.js - 修真传说系统
 * V571 Iteration 14/20 Round 23
 */
export class CultivationLegend {
    constructor(config = {}) {
        this.config = { maxLegends: config.maxLegends || 50, baseNarrative: config.baseNarrative || 20, ...config };
        this.legends = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalLegends: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getLegend', (ctx) => this.getLegend(ctx.legendId));
        this.registerTool('tellLegend', (ctx) => this.tellLegend(ctx));
    }

    tellLegend(data) {
        if (this.legends.size >= this.config.maxLegends) return { success: false, error: 'STORAGE_FULL' };
        const id = data.legendId || `lgn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const legend = {
            legendId: id,
            narratorId: data.narratorId || 'unknown',
            name: data.name || 'Untitled Legend',
            type: data.type || 'hero',
            narrative: data.narrative !== undefined ? data.narrative : this.config.baseNarrative,
            heroes: Array.isArray(data.heroes) ? [...data.heroes] : [],
            level: data.level || 1,
            status: data.status || 'oral',
            createdAt: Date.now()
        };
        this.legends.set(id, legend);
        this.stats.totalLegends++;
        this._triggerHook('legendTold', { legendId: id });
        return { success: true, legend };
    }

    getLegend(id) { return this.legends.get(id) ? { ...this.legends.get(id) } : null; }
    listLegends() { return Array.from(this.legends.values()).map(l => ({ ...l })); }
    listByNarrator(narratorId) { return Array.from(this.legends.values()).filter(l => l.narratorId === narratorId).map(l => ({ ...l })); }
    listImmortal() { return Array.from(this.legends.values()).filter(l => l.status === 'immortal').map(l => ({ ...l })); }

    addHero(legendId, hero) {
        const legend = this.legends.get(legendId);
        if (!legend) return { success: false, error: 'LEGEND_NOT_FOUND' };
        legend.heroes.push(hero);
        this._triggerHook('heroAdded', { legendId, heroCount: legend.heroes.length });
        return { success: true };
    }

    deepenNarrative(legendId, amount = 5) {
        const legend = this.legends.get(legendId);
        if (!legend) return { success: false, error: 'LEGEND_NOT_FOUND' };
        legend.narrative += amount;
        this._triggerHook('narrativeDeepened', { legendId, newNarrative: legend.narrative });
        return { success: true };
    }

    levelUpLegend(legendId) {
        const legend = this.legends.get(legendId);
        if (!legend) return { success: false, error: 'LEGEND_NOT_FOUND' };
        legend.level++;
        this._triggerHook('legendLeveledUp', { legendId, newLevel: legend.level });
        return { success: true };
    }

    immortalizeLegend(legendId) {
        const legend = this.legends.get(legendId);
        if (!legend) return { success: false, error: 'LEGEND_NOT_FOUND' };
        legend.status = 'immortal';
        this._triggerHook('legendImmortalized', { legendId });
        return { success: true };
    }

    calculateLegendValue(legendId) {
        const legend = this.legends.get(legendId);
        if (!legend) return 0;
        return legend.level * 100 + legend.narrative * 2 + legend.heroes.length * 30;
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
        if (this.stats.totalLegends < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxLegends += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { legends: Array.from(this.legends.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.legends) this.legends = new Map(data.legends);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, legendCount: this.legends.size }; }
}
