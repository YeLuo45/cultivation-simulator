/**
 * CompanionshipDashboard.test.js - 羁绊仪表盘测试
 * V312 Iteration 9/9 FINAL - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CompanionshipDashboard } from '../../../systems/ai/CompanionshipDashboard.js';

describe('CompanionshipDashboard', () => {
    let system;

    beforeEach(() => { system = new CompanionshipDashboard(); });

    describe('createDashboard', () => {
        it('should create dashboard', () => {
            const { dashboard } = system.createDashboard({ name: 'My Dashboard' });
            expect(dashboard.name).toBe('My Dashboard');
        });

        it('should generate id', () => {
            const { dashboard } = system.createDashboard({});
            expect(dashboard.dashboardId).toBeDefined();
        });

        it('should set lastRefresh to now', () => {
            const { dashboard } = system.createDashboard({});
            expect(dashboard.lastRefresh).toBeGreaterThan(0);
        });

        it('should increment totalDashboards', () => {
            system.createDashboard({});
            expect(system.stats.totalDashboards).toBe(1);
        });

        it('should trigger dashboardCreated hook', () => {
            let called = false;
            system.registerHook('dashboardCreated', () => { called = true; });
            system.createDashboard({});
            expect(called).toBe(true);
        });
    });

    describe('getDashboard', () => {
        it('should return dashboard', () => {
            const { dashboard } = system.createDashboard({});
            expect(system.getDashboard(dashboard.dashboardId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getDashboard('ghost')).toBeNull();
        });
    });

    describe('listDashboards', () => {
        it('should list all', () => {
            system.createDashboard({});
            system.createDashboard({});
            expect(system.listDashboards().length).toBe(2);
        });
    });

    describe('addWidget', () => {
        it('should add widget', () => {
            const { dashboard } = system.createDashboard({});
            const result = system.addWidget(dashboard.dashboardId, { type: 'metric' });
            expect(result.success).toBe(true);
        });

        it('should reject missing dashboard', () => {
            const result = system.addWidget('ghost', { type: 'metric' });
            expect(result.error).toBe('DASHBOARD_NOT_FOUND');
        });

        it('should reject too many widgets', () => {
            system.config.maxWidgetsPerDashboard = 1;
            const { dashboard } = system.createDashboard({});
            system.addWidget(dashboard.dashboardId, { type: 'metric' });
            const result = system.addWidget(dashboard.dashboardId, { type: 'metric' });
            expect(result.error).toBe('TOO_MANY_WIDGETS');
        });

        it('should increment totalWidgets', () => {
            const { dashboard } = system.createDashboard({});
            system.addWidget(dashboard.dashboardId, {});
            expect(system.stats.totalWidgets).toBe(1);
        });

        it('should add to dashboard widgets', () => {
            const { dashboard } = system.createDashboard({});
            system.addWidget(dashboard.dashboardId, {});
            expect(dashboard.widgets.length).toBe(1);
        });

        it('should trigger widgetAdded hook', () => {
            const { dashboard } = system.createDashboard({});
            let called = false;
            system.registerHook('widgetAdded', () => { called = true; });
            system.addWidget(dashboard.dashboardId, {});
            expect(called).toBe(true);
        });
    });

    describe('getWidget', () => {
        it('should return widget', () => {
            const { dashboard } = system.createDashboard({});
            const { widget } = system.addWidget(dashboard.dashboardId, {});
            expect(system.getWidget(widget.widgetId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getWidget('ghost')).toBeNull();
        });
    });

    describe('removeWidget', () => {
        it('should remove', () => {
            const { dashboard } = system.createDashboard({});
            const { widget } = system.addWidget(dashboard.dashboardId, {});
            const result = system.removeWidget(widget.widgetId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.removeWidget('ghost');
            expect(result.error).toBe('WIDGET_NOT_FOUND');
        });

        it('should remove from dashboard widgets', () => {
            const { dashboard } = system.createDashboard({});
            const { widget } = system.addWidget(dashboard.dashboardId, {});
            system.removeWidget(widget.widgetId);
            expect(dashboard.widgets.length).toBe(0);
        });

        it('should trigger widgetRemoved hook', () => {
            const { dashboard } = system.createDashboard({});
            const { widget } = system.addWidget(dashboard.dashboardId, {});
            let called = false;
            system.registerHook('widgetRemoved', () => { called = true; });
            system.removeWidget(widget.widgetId);
            expect(called).toBe(true);
        });
    });

    describe('updateWidgetData', () => {
        it('should update', () => {
            const { dashboard } = system.createDashboard({});
            const { widget } = system.addWidget(dashboard.dashboardId, {});
            const result = system.updateWidgetData(widget.widgetId, { value: 42 });
            expect(result.success).toBe(true);
            expect(widget.data.value).toBe(42);
        });

        it('should reject missing', () => {
            const result = system.updateWidgetData('ghost', {});
            expect(result.error).toBe('WIDGET_NOT_FOUND');
        });

        it('should set lastUpdate', () => {
            const { dashboard } = system.createDashboard({});
            const { widget } = system.addWidget(dashboard.dashboardId, {});
            system.updateWidgetData(widget.widgetId, {});
            expect(widget.lastUpdate).toBeGreaterThan(0);
        });
    });

    describe('setMetrics', () => {
        it('should set', () => {
            const { dashboard } = system.createDashboard({});
            const result = system.setMetrics(dashboard.dashboardId, { happiness: 0.8 });
            expect(result.success).toBe(true);
        });

        it('should retrieve', () => {
            const { dashboard } = system.createDashboard({});
            system.setMetrics(dashboard.dashboardId, { happiness: 0.8 });
            expect(system.getMetrics(dashboard.dashboardId).happiness).toBe(0.8);
        });
    });

    describe('getMetrics', () => {
        it('should return null for missing', () => {
            expect(system.getMetrics('ghost')).toBeNull();
        });
    });

    describe('refreshDashboard', () => {
        it('should refresh', () => {
            const { dashboard } = system.createDashboard({});
            const result = system.refreshDashboard(dashboard.dashboardId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.refreshDashboard('ghost');
            expect(result.error).toBe('DASHBOARD_NOT_FOUND');
        });

        it('should update lastRefresh', () => {
            const { dashboard } = system.createDashboard({});
            dashboard.lastRefresh = 0;
            system.refreshDashboard(dashboard.dashboardId);
            expect(dashboard.lastRefresh).toBeGreaterThan(0);
        });

        it('should trigger dashboardRefreshed hook', () => {
            const { dashboard } = system.createDashboard({});
            let called = false;
            system.registerHook('dashboardRefreshed', () => { called = true; });
            system.refreshDashboard(dashboard.dashboardId);
            expect(called).toBe(true);
        });
    });

    describe('createAlert', () => {
        it('should create alert', () => {
            const result = system.createAlert({ message: 'Test' });
            expect(result.success).toBe(true);
        });

        it('should default severity to info', () => {
            const { alert } = system.createAlert({});
            expect(alert.severity).toBe('info');
        });

        it('should increment totalAlerts', () => {
            system.createAlert({});
            expect(system.stats.totalAlerts).toBe(1);
        });

        it('should trigger alertCreated hook', () => {
            let called = false;
            system.registerHook('alertCreated', () => { called = true; });
            system.createAlert({});
            expect(called).toBe(true);
        });
    });

    describe('acknowledgeAlert', () => {
        it('should acknowledge', () => {
            const { alert } = system.createAlert({});
            const result = system.acknowledgeAlert(alert.id);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.acknowledgeAlert('ghost');
            expect(result.error).toBe('ALERT_NOT_FOUND');
        });

        it('should set acknowledged', () => {
            const { alert } = system.createAlert({});
            system.acknowledgeAlert(alert.id);
            expect(alert.acknowledged).toBe(true);
        });
    });

    describe('listAlerts', () => {
        it('should list all', () => {
            system.createAlert({});
            expect(system.listAlerts().length).toBe(1);
        });

        it('should filter by dashboard', () => {
            system.createAlert({ dashboardId: 'd1' });
            system.createAlert({ dashboardId: 'd2' });
            expect(system.listAlerts({ dashboardId: 'd1' }).length).toBe(1);
        });

        it('should filter by acknowledged', () => {
            const { alert } = system.createAlert({});
            system.acknowledgeAlert(alert.id);
            system.createAlert({});
            expect(system.listAlerts({ acknowledged: true }).length).toBe(1);
        });
    });

    describe('Tool System', () => {
        it('should register tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute tool', () => {
            system.registerTool('test', (ctx) => ctx.value);
            const result = system.executeTool('test', { value: 42 });
            expect(result.result).toBe(42);
        });

        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should handle errors', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('x');
        });

        it('should execute default getDashboard', () => {
            const result = system.executeTool('getDashboard', { dashboardId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('dashboardCreated', () => count++);
            unregister();
            system.createDashboard({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('dashboardCreated', () => { throw new Error('x'); });
            expect(() => system.createDashboard({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalDashboards = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalDashboards = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createDashboard({});
            const json = system.toJSON();
            expect(json.dashboards.length).toBe(1);
        });

        it('should deserialize', () => {
            system.createDashboard({});
            const json = system.toJSON();
            const newSys = new CompanionshipDashboard();
            newSys.fromJSON(json);
            expect(newSys.dashboards.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.dashboardCount).toBe(0);
        });
    });
});