/**
 * CultivationOrder.test.js - 修真秩序测试
 * V552 Iteration 15/20 Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationOrder } from '../../../systems/ai/CultivationOrder.js';

describe('CultivationOrder', () => {
    let system;
    beforeEach(() => { system = new CultivationOrder(); });

    describe('openOrder', () => {
        it('should open', () => {
            const { order } = system.openOrder({ founderId: 'f1', name: '天道盟' });
            expect(order.founderId).toBe('f1');
            expect(order.name).toBe('天道盟');
        });

        it('should default name', () => {
            const { order } = system.openOrder({});
            expect(order.name).toBe('无名秩序');
        });

        it('should default type celestial', () => {
            const { order } = system.openOrder({});
            expect(order.type).toBe('celestial');
        });

        it('should accept demonic type', () => {
            const { order } = system.openOrder({ type: 'demonic' });
            expect(order.type).toBe('demonic');
        });

        it('should accept chaotic type', () => {
            const { order } = system.openOrder({ type: 'chaotic' });
            expect(order.type).toBe('chaotic');
        });

        it('should default stability', () => {
            const { order } = system.openOrder({});
            expect(order.stability).toBe(20);
        });

        it('should accept custom stability', () => {
            const { order } = system.openOrder({ stability: 100 });
            expect(order.stability).toBe(100);
        });

        it('should initialize members empty', () => {
            const { order } = system.openOrder({});
            expect(order.members).toEqual([]);
        });

        it('should accept members array', () => {
            const { order } = system.openOrder({ members: [{ id: 'm1' }] });
            expect(order.members.length).toBe(1);
        });

        it('should initialize level 1', () => {
            const { order } = system.openOrder({});
            expect(order.level).toBe(1);
        });

        it('should default status forming', () => {
            const { order } = system.openOrder({});
            expect(order.status).toBe('forming');
        });

        it('should trigger orderOpened hook', () => {
            let called = false;
            system.registerHook('orderOpened', () => { called = true; });
            system.openOrder({});
            expect(called).toBe(true);
        });
    });

    describe('getOrder', () => {
        it('should return', () => {
            const { order } = system.openOrder({});
            expect(system.getOrder(order.orderId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getOrder('ghost')).toBeNull(); });
    });

    describe('listOrders', () => {
        it('should list all', () => {
            system.openOrder({});
            system.openOrder({});
            expect(system.listOrders().length).toBe(2);
        });

        it('should return empty', () => {
            expect(system.listOrders().length).toBe(0);
        });
    });

    describe('listByFounder', () => {
        it('should filter', () => {
            system.openOrder({ founderId: 'f1' });
            system.openOrder({ founderId: 'f2' });
            expect(system.listByFounder('f1').length).toBe(1);
        });

        it('should return empty for missing founder', () => {
            system.openOrder({ founderId: 'f1' });
            expect(system.listByFounder('ghost').length).toBe(0);
        });
    });

    describe('listStable', () => {
        it('should filter stable', () => {
            const { order: o1 } = system.openOrder({});
            const { order: o2 } = system.openOrder({});
            o1.status = 'stable';
            expect(system.listStable().length).toBe(1);
        });

        it('should include eternal', () => {
            const { order: o1 } = system.openOrder({});
            const { order: o2 } = system.openOrder({});
            o1.status = 'eternal';
            o2.status = 'forming';
            expect(system.listStable().length).toBe(1);
        });
    });

    describe('addMember', () => {
        it('should add', () => {
            const { order } = system.openOrder({});
            const result = system.addMember(order.orderId, { id: 'm1', name: 'Cult1' });
            expect(result.success).toBe(true);
            expect(order.members.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addMember('ghost', { id: 'm1' });
            expect(result.error).toBe('ORDER_NOT_FOUND');
        });

        it('should trigger memberAdded hook', () => {
            const { order } = system.openOrder({});
            let called = false;
            system.registerHook('memberAdded', () => { called = true; });
            system.addMember(order.orderId, { id: 'm1' });
            expect(called).toBe(true);
        });
    });

    describe('increaseStability', () => {
        it('should increase by default', () => {
            const { order } = system.openOrder({});
            system.increaseStability(order.orderId);
            expect(order.stability).toBe(25);
        });

        it('should increase custom amount', () => {
            const { order } = system.openOrder({});
            system.increaseStability(order.orderId, 30);
            expect(order.stability).toBe(50);
        });

        it('should promote forming to stable at 50', () => {
            const { order } = system.openOrder({ stability: 30 });
            system.increaseStability(order.orderId, 30);
            expect(order.status).toBe('stable');
        });

        it('should reject missing', () => {
            const result = system.increaseStability('ghost', 10);
            expect(result.error).toBe('ORDER_NOT_FOUND');
        });

        it('should trigger stabilityIncreased hook', () => {
            const { order } = system.openOrder({});
            let called = false;
            system.registerHook('stabilityIncreased', () => { called = true; });
            system.increaseStability(order.orderId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpOrder', () => {
        it('should level up', () => {
            const { order } = system.openOrder({});
            system.levelUpOrder(order.orderId);
            expect(order.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { order } = system.openOrder({});
            system.levelUpOrder(order.orderId);
            system.levelUpOrder(order.orderId);
            expect(order.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpOrder('ghost');
            expect(result.error).toBe('ORDER_NOT_FOUND');
        });

        it('should trigger orderLeveledUp hook', () => {
            const { order } = system.openOrder({});
            let called = false;
            system.registerHook('orderLeveledUp', () => { called = true; });
            system.levelUpOrder(order.orderId);
            expect(called).toBe(true);
        });
    });

    describe('eternizeOrder', () => {
        it('should eternize', () => {
            const { order } = system.openOrder({});
            system.eternizeOrder(order.orderId);
            expect(order.status).toBe('eternal');
        });

        it('should reject missing', () => {
            const result = system.eternizeOrder('ghost');
            expect(result.error).toBe('ORDER_NOT_FOUND');
        });

        it('should trigger orderEternalized hook', () => {
            const { order } = system.openOrder({});
            let called = false;
            system.registerHook('orderEternalized', () => { called = true; });
            system.eternizeOrder(order.orderId);
            expect(called).toBe(true);
        });
    });

    describe('calculateOrderPower', () => {
        it('should calculate', () => {
            const { order } = system.openOrder({ members: [{ id: 'm1' }, { id: 'm2' }] });
            const power = system.calculateOrderPower(order.orderId);
            expect(power).toBe(1 * 100 + 20 * 2 + 2 * 30);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateOrderPower('ghost')).toBe(0);
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

        it('should execute default getOrder', () => {
            const result = system.executeTool('getOrder', { orderId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('orderOpened', () => count++);
            unregister();
            system.openOrder({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('orderOpened', () => { throw new Error('x'); });
            expect(() => system.openOrder({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalOrders = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalOrders = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openOrder({});
            const json = system.toJSON();
            expect(json.orders.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openOrder({});
            const json = system.toJSON();
            const newSys = new CultivationOrder();
            newSys.fromJSON(json);
            expect(newSys.orders.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.orderCount).toBe(0);
        });
    });
});
