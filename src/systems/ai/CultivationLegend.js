/**
 * CultivationLegend.js - 修真传奇系统
 * V662 Iteration 15/30 Round 27 - Cultivation Legend
 */

export class CultivationLegend {
    constructor(config = {}) {
        this.config = { maxLegends: config.maxLegends || 10, baseFame: config.baseFame || 20, ...config };
        this.legends = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalLegends: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getLegend', (ctx) => this.getLegend(ctx.legendId));
        this.registerTool('recruitLegend', (ctx) => this.recruitLegend(ctx));
    }

    recruitLegend(data) {
        const id = data.legendId || `lgn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const legend = {
            legendId: id,
            masterId: data.masterId,
            name: data.name || 'Untitled Legend',
            type: data.type || 'myth',
            fame: data.fame !== undefined ? data.fame : this.config.baseFame,
            tales: Array.isArray(data.tales) ? [...data.tales] : [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.legends.set(id, legend);
        this.stats.totalLegends++;
        this._triggerHook('legendRecruited', { legendId: id });
        return { success: true, legend };
    }

    getLegend(id) { return this.legends.get(id) ? { ...this.legends.get(id) } : null; }
    listLegends() { return Array.from(this.legends.values()).map(l => ({ ...l })); }
    listByMaster(masterId) { return Array.from(this.legends.values()).filter(l => l.masterId === masterId).map(l => ({ ...l })); }
    listLegendary() { return Array.from(this.legends.values()).filter(l => l.status === 'legendary').map(l => ({ ...l })); }

    addTale(legendId, tale) {
        const legend = this.legends.get(legendId);
        if (!legend) return { success: false, error: 'LEGEND_NOT_FOUND' };
        legend.tales.push(tale);
        this._triggerHook('taleAdded', { legendId, tale });
        return { success: true };
    }

    buildFame(legendId, amount = 5) {
        const legend = this.legends.get(legendId);
        if (!legend) return { success: false, error: 'LEGEND_NOT_FOUND' };
        legend.fame += amount;
        this._triggerHook('fameBuilt', { legendId, newFame: legend.fame });
        return { success: true };
    }

    levelUpLegend(legendId) {
        const legend = this.legends.get(legendId);
        if (!legend) return { success: false, error: 'LEGEND_NOT_FOUND' };
        legend.level++;
        this._triggerHook('legendLeveledUp', { legendId, newLevel: legend.level });
        return { success: true };
    }

    legendLegend(legendId) {
        const legend = this.legends.get(legendId);
        if (!legend) return { success: false, error: 'LEGEND_NOT_FOUND' };
        legend.status = 'legendary';
        this._triggerHook('legendLegendized', { legendId });
        return { success: true };
    }

    calculateLegendValue(legendId) {
        const legend = this.legends.get(legendId);
        if (!legend) return 0;
        return legend.level * 100 + legend.fame * 2 + legend.tales.length * 30;
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
