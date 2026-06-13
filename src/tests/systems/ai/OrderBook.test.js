/**
 * OrderBook.test.js - 订单簿测试
 * V381 Iteration 6/9 Round 11 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { OrderBook } from '../../../systems/ai/OrderBook.js';

describe('OrderBook', () => {
    let system;
    beforeEach(() => { system = new OrderBook(); });

    describe('placeOrder', () => {
        it('should place', () => {
            const { order } = system.placeOrder({ traderId: 't1', price: 100 });
            expect(order.traderId).toBe('t1');
        });

        it('should trigger orderPlaced hook', () => {
            let called = false;
            system.registerHook('orderPlaced', () => { called = true; });
            system.placeOrder({});
            expect(called).toBe(true);
        });
    });

    describe('getOrder', () => {
        it('should return', () => {
            const { order } = system.placeOrder({});
            expect(system.getOrder(order.orderId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getOrder('ghost')).toBeNull(); });
    });

    describe('listOrders', () => {
        it('should list all', () => {
            system.placeOrder({});
            expect(system.listOrders().length).toBe(1);
        });
    });

    describe('listOpen', () => {
        it('should filter', () => {
            const { order } = system.placeOrder({});
            order.status = 'filled';
            system.placeOrder({});
            expect(system.listOpen().length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.placeOrder({ type: 'buy' });
            system.placeOrder({ type: 'sell' });
            expect(system.listByType('buy').length).toBe(1);
        });
    });

    describe('listByTrader', () => {
        it('should filter', () => {
            system.placeOrder({ traderId: 't1' });
            system.placeOrder({ traderId: 't2' });
            expect(system.listByTrader('t1').length).toBe(1);
        });
    });

    describe('listByItem', () => {
        it('should filter', () => {
            system.placeOrder({ itemId: 'sword' });
            system.placeOrder({ itemId: 'potion' });
            expect(system.listByItem('sword').length).toBe(1);
        });
    });

    describe('cancelOrder', () => {
        it('should cancel', () => {
            const { order } = system.placeOrder({});
            const result = system.cancelOrder(order.orderId);
            expect(order.status).toBe('cancelled');
        });

        it('should reject missing', () => {
            const result = system.cancelOrder('ghost');
            expect(result.error).toBe('ORDER_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { order } = system.placeOrder({});
            order.status = 'filled';
            const result = system.cancelOrder(order.orderId);
            expect(result.error).toBe('ORDER_INACTIVE');
        });

        it('should trigger orderCancelled hook', () => {
            const { order } = system.placeOrder({});
            let called = false;
            system.registerHook('orderCancelled', () => { called = true; });
            system.cancelOrder(order.orderId);
            expect(called).toBe(true);
        });
    });

    describe('fillOrder', () => {
        it('should fill', () => {
            const { order } = system.placeOrder({});
            const result = system.fillOrder(order.orderId);
            expect(order.status).toBe('filled');
        });

        it('should reject missing', () => {
            const result = system.fillOrder('ghost');
            expect(result.error).toBe('ORDER_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { order } = system.placeOrder({});
            order.status = 'cancelled';
            const result = system.fillOrder(order.orderId);
            expect(result.error).toBe('ORDER_INACTIVE');
        });

        it('should trigger orderFilled hook', () => {
            const { order } = system.placeOrder({});
            let called = false;
            system.registerHook('orderFilled', () => { called = true; });
            system.fillOrder(order.orderId);
            expect(called).toBe(true);
        });
    });

    describe('findBestBid', () => {
        it('should find highest', () => {
            system.placeOrder({ type: 'buy', itemId: 'sword', price: 100 });
            system.placeOrder({ type: 'buy', itemId: 'sword', price: 150 });
            expect(system.findBestBid('sword')).toBe(150);
        });

        it('should return null for none', () => {
            expect(system.findBestBid('sword')).toBeNull();
        });
    });

    describe('findBestAsk', () => {
        it('should find lowest', () => {
            system.placeOrder({ type: 'sell', itemId: 'sword', price: 200 });
            system.placeOrder({ type: 'sell', itemId: 'sword', price: 150 });
            expect(system.findBestAsk('sword')).toBe(150);
        });

        it('should return null for none', () => {
            expect(system.findBestAsk('sword')).toBeNull();
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
            const unregister = system.registerHook('orderPlaced', () => count++);
            unregister();
            system.placeOrder({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('orderPlaced', () => { throw new Error('x'); });
            expect(() => system.placeOrder({})).not.toThrow();
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
            system.placeOrder({});
            const json = system.toJSON();
            expect(json.orders.length).toBe(1);
        });
        it('should deserialize', () => {
            system.placeOrder({});
            const json = system.toJSON();
            const newSys = new OrderBook();
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