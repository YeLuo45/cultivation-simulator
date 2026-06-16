/**
 * AlchemyDashboard.js - 炼丹仪表盘
 * V330 Iteration 9/9 FINAL Round 5
 */
export class AlchemyDashboard {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxDashboards: config.maxDashboards || 50, ...config };
        this.dashboards = new Map();
        this.widgets = new Map();
        this.metrics = new Map();
        this.alerts = [];
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDashboards: 0, totalWidgets: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDashboard', (ctx) => this.getDashboard(ctx.dashboardId));
        this.registerTool('getMetrics', (ctx) => this.getMetrics(ctx.dashboardId));
    }

    createDashboard(data) {
        const id = data.id || `dsh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const dashboard = { dashboardId: id, name: data.name || 'Unnamed', alchemistId: data.alchemistId, widgets: [], createdAt: Date.now(), lastRefresh: Date.now() };
        this.dashboards.set(id, dashboard);
        this.metrics.set(id, {});
        this.stats.totalDashboards++;
        this._triggerHook('dashboardCreated', { dashboardId: id });
        return { success: true, dashboard };
    }

    getDashboard(id) { return this.dashboards.get(id) ? { ...this.dashboards.get(id) } : null; }
    listDashboards() { return Array.from(this.dashboards.values()).map(d => ({ ...d })); }

    addWidget(dashboardId, widgetData) {
        const dashboard = this.dashboards.get(dashboardId);
        if (!dashboard) return { success: false, error: 'DASHBOARD_NOT_FOUND' };
        const widgetId = widgetData.id || `wdg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const widget = { widgetId, dashboardId, type: widgetData.type || 'metric', title: widgetData.title || 'Widget', data: widgetData.data || null, position: widgetData.position || 0 };
        this.widgets.set(widgetId, widget);
        dashboard.widgets.push(widgetId);
        this.stats.totalWidgets++;
        this._triggerHook('widgetAdded', { dashboardId, widgetId });
        return { success: true, widget };
    }

    getWidget(widgetId) { return this.widgets.get(widgetId) ? { ...this.widgets.get(widgetId) } : null; }
    removeWidget(widgetId) {
        const widget = this.widgets.get(widgetId);
        if (!widget) return { success: false, error: 'WIDGET_NOT_FOUND' };
        const dashboard = this.dashboards.get(widget.dashboardId);
        if (dashboard) dashboard.widgets = dashboard.widgets.filter(id => id !== widgetId);
        this.widgets.delete(widgetId);
        this._triggerHook('widgetRemoved', { widgetId });
        return { success: true };
    }

    setMetrics(dashboardId, metrics) {
        this.metrics.set(dashboardId, { ...metrics, updatedAt: Date.now() });
        return { success: true };
    }

    getMetrics(dashboardId) { return this.metrics.get(dashboardId) || null; }

    refreshDashboard(dashboardId) {
        const dashboard = this.dashboards.get(dashboardId);
        if (!dashboard) return { success: false, error: 'DASHBOARD_NOT_FOUND' };
        dashboard.lastRefresh = Date.now();
        this._triggerHook('dashboardRefreshed', { dashboardId });
        return { success: true, dashboard: { ...dashboard } };
    }

    createAlert(alertData) {
        const id = `alt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const alert = { id, severity: alertData.severity || 'info', message: alertData.message || '', dashboardId: alertData.dashboardId, timestamp: Date.now(), acknowledged: false };
        this.alerts.push(alert);
        this._triggerHook('alertCreated', alert);
        return { success: true, alert };
    }

    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return { success: false, error: 'ALERT_NOT_FOUND' };
        alert.acknowledged = true;
        return { success: true };
    }

    listAlerts(filter = {}) {
        if (filter.dashboardId) return this.alerts.filter(a => a.dashboardId === filter.dashboardId);
        return [...this.alerts];
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
        this.config.maxDashboards += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { dashboards: Array.from(this.dashboards.entries()), widgets: Array.from(this.widgets.entries()), metrics: Array.from(this.metrics.entries()), alerts: this.alerts, stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.dashboards) this.dashboards = new Map(data.dashboards);
        if (data.widgets) this.widgets = new Map(data.widgets);
        if (data.metrics) this.metrics = new Map(data.metrics);
        if (data.alerts) this.alerts = data.alerts;
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, dashboardCount: this.dashboards.size, widgetCount: this.widgets.size }; }
}