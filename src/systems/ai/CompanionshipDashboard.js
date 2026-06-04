/**
 * CompanionshipDashboard.js - 羁绊仪表盘
 * V312 Iteration 9/9 FINAL - Bond Dashboard UI
 */
export class CompanionshipDashboard {
    constructor(config = {}) {
        this.config = {
            refreshInterval: config.refreshInterval || 5000,
            maxWidgetsPerDashboard: config.maxWidgetsPerDashboard || 20,
            ...config
        };
        this.dashboards = new Map();
        this.widgets = new Map();
        this.metrics = new Map();
        this.alerts = [];
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDashboards: 0, totalWidgets: 0, totalAlerts: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDashboard', (ctx) => this.getDashboard(ctx.dashboardId));
        this.registerTool('getMetrics', (ctx) => this.getMetrics(ctx.dashboardId));
    }

    createDashboard(data) {
        const id = data.id || `dsh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const dashboard = {
            dashboardId: id, name: data.name || 'Unnamed', ownerId: data.ownerId,
            widgets: [], refreshInterval: data.refreshInterval || this.config.refreshInterval,
            createdAt: Date.now(), lastRefresh: Date.now()
        };
        this.dashboards.set(id, dashboard);
        this.metrics.set(id, {});
        this.stats.totalDashboards++;
        this._triggerHook('dashboardCreated', { dashboardId: id });
        return { success: true, dashboard };
    }

    getDashboard(id) { const d = this.dashboards.get(id); return d ? { ...d } : null; }
    listDashboards() { return Array.from(this.dashboards.values()).map(d => ({ ...d })); }

    addWidget(dashboardId, widgetData) {
        const dashboard = this.dashboards.get(dashboardId);
        if (!dashboard) return { success: false, error: 'DASHBOARD_NOT_FOUND' };
        if (dashboard.widgets.length >= this.config.maxWidgetsPerDashboard) {
            return { success: false, error: 'TOO_MANY_WIDGETS' };
        }
        const widgetId = widgetData.id || `wdg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const widget = {
            widgetId, dashboardId, type: widgetData.type || 'metric',
            title: widgetData.title || 'Widget', config: widgetData.config || {},
            data: widgetData.data || null, position: widgetData.position || 0
        };
        this.widgets.set(widgetId, widget);
        dashboard.widgets.push(widgetId);
        this.stats.totalWidgets++;
        this._triggerHook('widgetAdded', { dashboardId, widgetId });
        return { success: true, widget };
    }

    getWidget(widgetId) { const w = this.widgets.get(widgetId); return w ? { ...w } : null; }
    removeWidget(widgetId) {
        const widget = this.widgets.get(widgetId);
        if (!widget) return { success: false, error: 'WIDGET_NOT_FOUND' };
        const dashboard = this.dashboards.get(widget.dashboardId);
        if (dashboard) {
            dashboard.widgets = dashboard.widgets.filter(id => id !== widgetId);
        }
        this.widgets.delete(widgetId);
        this._triggerHook('widgetRemoved', { widgetId });
        return { success: true };
    }

    updateWidgetData(widgetId, data) {
        const widget = this.widgets.get(widgetId);
        if (!widget) return { success: false, error: 'WIDGET_NOT_FOUND' };
        widget.data = data;
        widget.lastUpdate = Date.now();
        return { success: true, widget: { ...widget } };
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
        const alert = {
            id, severity: alertData.severity || 'info', message: alertData.message || '',
            dashboardId: alertData.dashboardId, timestamp: Date.now(), acknowledged: false
        };
        this.alerts.push(alert);
        this.stats.totalAlerts++;
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
        if (filter.acknowledged !== undefined) return this.alerts.filter(a => a.acknowledged === filter.acknowledged);
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
        this.config.maxWidgetsPerDashboard += 5;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() {
        return {
            dashboards: Array.from(this.dashboards.entries()),
            widgets: Array.from(this.widgets.entries()),
            metrics: Array.from(this.metrics.entries()),
            alerts: this.alerts, stats: this.stats, config: this.config
        };
    }
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