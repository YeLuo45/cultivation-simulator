/**
 * Astrology.js - 占星系统
 * V428 Iteration 5/15 Round 15 - Astrology
 *
 * 融合6大设计系统:
 * - generic-agent: 星图自循环
 * - chatdev: 占星角色协调
 * - nanobot: 星图mesh
 * - claude-code: 占星分析工具
 * - thunderbolt: 星图持久化
 * - ruflo: 占星Hook
 */

export class Astrology {
    constructor(config = {}) {
        this.config = { maxCharts: config.maxCharts || 100, baseStars: config.baseStars || 108, ...config };
        this.charts = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCharts: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getChart', (ctx) => this.getChart(ctx.chartId));
        this.registerTool('castChart', (ctx) => this.castChart(ctx));
    }

    castChart(data) {
        const id = data.chartId || `chr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const chart = {
            chartId: id,
            cultivatorId: data.cultivatorId,
            sun: data.sun || 'Sun',
            moon: data.moon || 'Moon',
            stars: data.stars || this.config.baseStars,
            planets: data.planets || [],
            aspects: data.aspects || [],
            status: 'cast',
            createdAt: Date.now()
        };
        this.charts.set(id, chart);
        this.stats.totalCharts++;
        this._triggerHook('chartCast', { chartId: id });
        return { success: true, chart };
    }

    getChart(id) { return this.charts.get(id) ? { ...this.charts.get(id) } : null; }
    listCharts() { return Array.from(this.charts.values()).map(c => ({ ...c })); }
    listByCultivator(cultivatorId) { return Array.from(this.charts.values()).filter(c => c.cultivatorId === cultivatorId).map(c => ({ ...c })); }

    addPlanet(chartId, planet) {
        const chart = this.charts.get(chartId);
        if (!chart) return { success: false, error: 'CHART_NOT_FOUND' };
        chart.planets.push(planet);
        this._triggerHook('planetAdded', { chartId, planet });
        return { success: true, chart: { ...chart } };
    }

    calculateAspects(chartId) {
        const chart = this.charts.get(chartId);
        if (!chart) return { success: false, error: 'CHART_NOT_FOUND' };
        const aspects = [];
        for (let i = 0; i < chart.planets.length; i++) {
            for (let j = i + 1; j < chart.planets.length; j++) {
                aspects.push({ a: chart.planets[i], b: chart.planets[j], type: 'conjunction' });
            }
        }
        chart.aspects = aspects;
        this._triggerHook('aspectsCalculated', { chartId, count: aspects.length });
        return { success: true, aspects };
    }

    interpretChart(chartId) {
        const chart = this.charts.get(chartId);
        if (!chart) return { success: false, error: 'CHART_NOT_FOUND' };
        chart.status = 'interpreted';
        this._triggerHook('chartInterpreted', { chartId });
        return { success: true, chart: { ...chart } };
    }

    calculateCelestialPower(chartId) {
        const chart = this.charts.get(chartId);
        if (!chart) return 0;
        return chart.stars * 2 + chart.planets.length * 5 + chart.aspects.length * 3;
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
        if (this.stats.totalCharts < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCharts += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { charts: Array.from(this.charts.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.charts) this.charts = new Map(data.charts);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, chartCount: this.charts.size }; }
}
