/**
 * AlchemyDashboard.test.js - 炼丹仪表盘测试
 * V330 Iteration 9/9 FINAL Round 5 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AlchemyDashboard } from '../../../systems/ai/AlchemyDashboard.js';

describe('AlchemyDashboard', () => {
    let system;
    beforeEach(() => { system = new AlchemyDashboard(); });

    describe('createDashboard', () => {
        it('should create', () => {
            const { dashboard } = system.createDashboard({ name: 'D1' });
            expect(dashboard.name).toBe('D1');
        });

        it('should generate id', () => {
            const { dashboard } = system.createDashboard({});
            expect(dashboard.dashboardId).toBeDefined();
        });

        it('should trigger dashboardCreated hook', () => {
            let called = false;
            system.registerHook('dashboardCreated', () => { called = true; });
            system.createDashboard({});
            expect(called).toBe(true);
        });
    });

    describe('getDashboard', () => {
        it('should return', () => {
            const { dashboard } = system.createDashboard({});
            expect(system.getDashboard(dashboard.dashboardId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDashboard('ghost')).toBeNull(); });
    });

    describe('listDashboards', () => {
        it('should list all', () => {
            system.createDashboard({});
            expect(system.listDashboards().length).toBe(1);
        });
    });

    describe('addWidget', () => {
        it('should add', () => {
            const { dashboard } = system.createDashboard({});
            const result = system.addWidget(dashboard.dashboardId, {});
            expect(result.success).toBe(true);
        });

        it('should reject missing dashboard', () => {
            const result = system.addWidget('ghost', {});
            expect(result.error).toBe('DASHBOARD_NOT_FOUND');
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
        it('should return', () => {
            const { dashboard } = system.createDashboard({});
            const { widget } = system.addWidget(dashboard.dashboardId, {});
            expect(system.getWidget(widget.widgetId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getWidget('ghost')).toBeNull(); });
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

        it('should trigger widgetRemoved hook', () => {
            const { dashboard } = system.createDashboard({});
            const { widget } = system.addWidget(dashboard.dashboardId, {});
            let called = false;
            system.registerHook('widgetRemoved', () => { called = true; });
            system.removeWidget(widget.widgetId);
            expect(called).toBe(true);
        });
    });

    describe('setMetrics', () => {
        it('should set', () => {
            const { dashboard } = system.createDashboard({});
            const result = system.setMetrics(dashboard.dashboardId, { successRate: 0.8 });
            expect(result.success).toBe(true);
        });

        it('should retrieve', () => {
            const { dashboard } = system.createDashboard({});
            system.setMetrics(dashboard.dashboardId, { successRate: 0.8 });
            expect(system.getMetrics(dashboard.dashboardId).successRate).toBe(0.8);
        });
    });

    describe('getMetrics', () => {
        it('should return null for missing', () => { expect(system.getMetrics('ghost')).toBeNull(); });
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

        it('should trigger dashboardRefreshed hook', () => {
            const { dashboard } = system.createDashboard({});
            let called = false;
            system.registerHook('dashboardRefreshed', () => { called = true; });
            system.refreshDashboard(dashboard.dashboardId);
            expect(called).toBe(true);
        });
    });

    describe('Alerts', () => {
        it('should create alert', () => {
            const { alert } = system.createAlert({ message: 'X' });
            expect(alert.message).toBe('X');
        });

        it('should default severity to info', () => {
            const { alert } = system.createAlert({});
            expect(alert.severity).toBe('info');
        });

        it('should acknowledge', () => {
            const { alert } = system.createAlert({});
            const result = system.acknowledgeAlert(alert.id);
            expect(result.success).toBe(true);
        });

        it('should reject missing acknowledge', () => {
            const result = system.acknowledgeAlert('ghost');
            expect(result.error).toBe('ALERT_NOT_FOUND');
        });

        it('should list', () => {
            system.createAlert({});
            expect(system.listAlerts().length).toBe(1);
        });

        it('should filter by dashboard', () => {
            system.createAlert({ dashboardId: 'd1' });
            system.createAlert({ dashboardId: 'd2' });
            expect(system.listAlerts({ dashboardId: 'd1' }).length).toBe(1);
        });

        it('should trigger alertCreated hook', () => {
            let called = false;
            system.registerHook('alertCreated', () => { called = true; });
            system.createAlert({});
            expect(called).toBe(true);
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
            const newSys = new AlchemyDashboard();
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