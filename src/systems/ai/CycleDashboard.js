/**
 * CycleDashboard.js - 轮回仪表盘
 * V375 Iteration 9/9 FINAL Round 10
 */
export class CycleDashboard {
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
        const id = data.id || `cyd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const dashboard = { dashboardId: id, name: data.name || 'Cycle Dashboard', soulId: data.soulId, createdAt: Date.now(), lastRefresh: Date.now() };
        this.dashboards.set(id, dashboard);
        this.metrics.set(id, { soulCount: 0, cycleCount: 0, karmicBalance: 0, memoryCount: 0, activeGates: 0, totalMaturity: 0 });
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

    calculateCycleProgress(dashboardId) {
        const metrics = this.getMetrics(dashboardId);
        if (!metrics) return null;
        const totalCycles = metrics.cycleCount || 0;
        const target = 10;
        return Math.min(1, totalCycles / target);
    }

    calculateKarmaScore(dashboardId) {
        const metrics = this.getMetrics(dashboardId);
        if (!metrics) return 0;
        return Math.floor((metrics.karmicBalance || 0) / 10);
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