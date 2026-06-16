/**
 * HallOfFame.js - 名人堂系统
 * V463 Iteration 10/15 Round 17
 */
export class HallOfFame {
    constructor(config = {}) {
        this.config = { maxLegends: config.maxLegends || 200, baseFame: config.baseFame || 100, ...config };
        this.legends = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalLegends: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getLegend', (ctx) => this.getLegend(ctx.legendId));
        this.registerTool('registerLegend', (ctx) => this.registerLegend(ctx));
    }

    registerLegend(data) {
        const id = data.id || `leg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const legend = { legendId: id, cultivatorId: data.cultivatorId, name: data.name || 'Anonymous', achievements: [], fame: data.fame || this.config.baseFame, yearsActive: data.yearsActive || 0, status: 'rising', createdAt: Date.now() };
        this.legends.set(id, legend);
        this.stats.totalLegends++;
        this._triggerHook('legendRegistered', { legendId: id });
        return { success: true, legend };
    }

    getLegend(id) { return this.legends.get(id) ? { ...this.legends.get(id) } : null; }
    listLegends() { return Array.from(this.legends.values()).map(l => ({ ...l })); }
    listByCultivator(cultivatorId) { return Array.from(this.legends.values()).filter(l => l.cultivatorId === cultivatorId).map(l => ({ ...l })); }
    listTop(n = 10) { return Array.from(this.legends.values()).sort((a, b) => b.fame - a.fame).slice(0, n).map(l => ({ ...l })); }
    listLegendary() { return Array.from(this.legends.values()).filter(l => l.status === 'legendary').map(l => ({ ...l })); }

    gainFame(legendId, amount = 5) {
        const legend = this.legends.get(legendId);
        if (!legend) return { success: false, error: 'LEGEND_NOT_FOUND' };
        legend.fame += amount;
        if (legend.status !== 'eternal') legend.status = 'legendary';
        this._triggerHook('fameGained', { legendId, newFame: legend.fame });
        return { success: true };
    }

    addAchievement(legendId, achievement) {
        const legend = this.legends.get(legendId);
        if (!legend) return { success: false, error: 'LEGEND_NOT_FOUND' };
        legend.achievements.push(achievement);
        this._triggerHook('achievementAdded', { legendId, achievement });
        return { success: true };
    }

    ascendToEternal(legendId) {
        const legend = this.legends.get(legendId);
        if (!legend) return { success: false, error: 'LEGEND_NOT_FOUND' };
        if (legend.fame < 1000) return { success: false, error: 'INSUFFICIENT_FAME' };
        legend.status = 'eternal';
        this._triggerHook('legendAscended', { legendId, status: legend.status });
        return { success: true };
    }

    calculateFameScore(legendId) {
        const legend = this.legends.get(legendId);
        if (!legend) return 0;
        return legend.fame * 10 + legend.achievements.length * 100 + legend.yearsActive * 50;
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
