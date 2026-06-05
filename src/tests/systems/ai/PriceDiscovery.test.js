/**
 * PriceDiscovery.test.js - 价格发现测试
 * V378 Iteration 3/9 Round 11 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PriceDiscovery } from '../../../systems/ai/PriceDiscovery.js';

describe('PriceDiscovery', () => {
    let system;
    beforeEach(() => { system = new PriceDiscovery(); });

    describe('addItem', () => {
        it('should add', () => {
            const { item } = system.addItem({ name: 'I1' });
            expect(item.name).toBe('I1');
        });
    });

    describe('getItem', () => {
        it('should return', () => {
            const { item } = system.addItem({});
            expect(system.getItem(item.itemId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getItem('ghost')).toBeNull(); });
    });

    describe('listItems', () => {
        it('should list all', () => {
            system.addItem({});
            expect(system.listItems().length).toBe(1);
        });
    });

    describe('recordPrice', () => {
        it('should record', () => {
            const { item } = system.addItem({});
            const result = system.recordPrice(item.itemId, 200);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.recordPrice('ghost', 200);
            expect(result.error).toBe('ITEM_NOT_FOUND');
        });

        it('should add to history', () => {
            const { item } = system.addItem({});
            system.recordPrice(item.itemId, 200);
            expect(item.history.length).toBe(1);
        });

        it('should trigger priceUpdated hook', () => {
            const { item } = system.addItem({});
            let called = false;
            system.registerHook('priceUpdated', () => { called = true; });
            system.recordPrice(item.itemId, 200);
            expect(called).toBe(true);
        });
    });

    describe('getPriceHistory', () => {
        it('should return', () => {
            const { item } = system.addItem({});
            system.recordPrice(item.itemId, 200);
            expect(system.getPriceHistory(item.itemId).length).toBe(1);
        });

        it('should return null for missing', () => {
            expect(system.getPriceHistory('ghost')).toBeNull();
        });
    });

    describe('calculateAverage', () => {
        it('should calculate', () => {
            const { item } = system.addItem({});
            system.recordPrice(item.itemId, 100);
            system.recordPrice(item.itemId, 200);
            expect(system.calculateAverage(item.itemId)).toBe(150);
        });

        it('should return null for empty', () => {
            const { item } = system.addItem({});
            expect(system.calculateAverage(item.itemId)).toBeNull();
        });
    });

    describe('calculateVolatility', () => {
        it('should calculate', () => {
            const { item } = system.addItem({});
            system.recordPrice(item.itemId, 100);
            system.recordPrice(item.itemId, 200);
            expect(system.calculateVolatility(item.itemId)).toBeGreaterThan(0);
        });

        it('should return 0 for single price', () => {
            const { item } = system.addItem({});
            system.recordPrice(item.itemId, 100);
            expect(system.calculateVolatility(item.itemId)).toBe(0);
        });
    });

    describe('calculateTrend', () => {
        it('should detect rising', () => {
            const { item } = system.addItem({});
            system.recordPrice(item.itemId, 100);
            system.recordPrice(item.itemId, 200);
            system.recordPrice(item.itemId, 300);
            expect(system.calculateTrend(item.itemId)).toBe('rising');
        });

        it('should detect falling', () => {
            const { item } = system.addItem({});
            system.recordPrice(item.itemId, 300);
            system.recordPrice(item.itemId, 200);
            system.recordPrice(item.itemId, 100);
            expect(system.calculateTrend(item.itemId)).toBe('falling');
        });

        it('should return neutral for empty', () => {
            const { item } = system.addItem({});
            expect(system.calculateTrend(item.itemId)).toBe('neutral');
        });
    });

    describe('findCheapestAbove', () => {
        it('should find', () => {
            system.addItem({ name: 'A', basePrice: 200 });
            system.addItem({ name: 'B', basePrice: 300 });
            const result = system.findCheapestAbove(150);
            expect(result[0].name).toBe('A');
        });
    });

    describe('findExpensiveBelow', () => {
        it('should find', () => {
            system.addItem({ name: 'A', basePrice: 200 });
            system.addItem({ name: 'B', basePrice: 100 });
            const result = system.findExpensiveBelow(250);
            expect(result[0].name).toBe('A');
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

        it('should execute default getItem', () => {
            const result = system.executeTool('getItem', { itemId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('priceUpdated', () => count++);
            unregister();
            const { item } = system.addItem({});
            system.recordPrice(item.itemId, 200);
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('priceUpdated', () => { throw new Error('x'); });
            const { item } = system.addItem({});
            expect(() => system.recordPrice(item.itemId, 200)).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPriceUpdates = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPriceUpdates = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.addItem({});
            const json = system.toJSON();
            expect(json.items.length).toBe(1);
        });
        it('should deserialize', () => {
            system.addItem({});
            const json = system.toJSON();
            const newSys = new PriceDiscovery();
            newSys.fromJSON(json);
            expect(newSys.items.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.itemCount).toBe(0);
        });
    });
});