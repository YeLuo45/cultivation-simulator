/**
 * TradingDashboard.js - 交易仪表盘
 * V384 Iteration 9/9 FINAL Round 11
 */
export class TradingDashboard {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, ...config };
        this.dashboards = new Map();
        this.metrics = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDashboards: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDashboard', (ctx) => this.getDashboard(ctx.dashboardId));
        this.registerTool('getMetrics', (ctx) => this.getMetrics(ctx.dashboardId));
    }

    createDashboard(data) {
        const id = data.id || `trd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const dashboard = { dashboardId: id, name: data.name || 'Trading Dashboard', ownerId: data.ownerId, createdAt: Date.now(), lastRefresh: Date.now() };
        this.dashboards.set(id, dashboard);
        this.metrics.set(id, { totalTrades: 0, totalVolume: 0, activeAuctions: 0, openOrders: 0, brokersActive: 0, itemCount: 0 });
        this.stats.totalDashboards++;
        this._triggerHook('dashboardCreated', { dashboardId: id });
        return { success: true, dashboard };
    }

    getDashboard(id) { return this.dashboards.get(id) ? { ...this.dashboards.get(id) } : null; }
    listDashboards() { return Array.from(this.dashboards.values()).map(d => ({ ...d })); }

    setMetrics(dashboardId, metrics) {
        const current = this.metrics.get(dashboardId);
        if (!current) return { success: false, error: 'DASHBOARD_NOT_FOUND' };
        this.metrics.set(dashboardId, { ...current, ...metrics, updatedAt: Date.now() });
        return { success: true };
    }

    getMetrics(dashboardId) { return this.metrics.get(dashboardId) ? { ...this.metrics.get(dashboardId) } : null; }

    refreshDashboard(dashboardId) {
        const dashboard = this.dashboards.get(dashboardId);
        if (!dashboard) return { success: false, error: 'DASHBOARD_NOT_FOUND' };
        dashboard.lastRefresh = Date.now();
        this._triggerHook('dashboardRefreshed', { dashboardId });
        return { success: true };
    }

    calculateVolumeRank(dashboardId) {
        const metrics = this.getMetrics(dashboardId);
        if (!metrics) return null;
        const volume = metrics.totalVolume || 0;
        if (volume > 10000) return 'platinum';
        if (volume > 5000) return 'gold';
        if (volume > 1000) return 'silver';
        return 'bronze';
    }

    calculateActivityScore(dashboardId) {
        const metrics = this.getMetrics(dashboardId);
        if (!metrics) return 0;
        return (metrics.totalTrades || 0) * 10 + (metrics.activeAuctions || 0) * 5 + (metrics.openOrders || 0);
    }

    deleteDashboard(dashboardId) {
        if (!this.dashboards.has(dashboardId)) return { success: false, error: 'DASHBOARD_NOT_FOUND' };
        this.dashboards.delete(dashboardId);
        this.metrics.delete(dashboardId);
        this._triggerHook('dashboardDeleted', { dashboardId });
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
        if (this.stats.totalDashboards < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { dashboards: Array.from(this.dashboards.entries()), metrics: Array.from(this.metrics.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.dashboards) this.dashboards = new Map(data.dashboards);
        if (data.metrics) this.metrics = new Map(data.metrics);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, dashboardCount: this.dashboards.size }; }
}