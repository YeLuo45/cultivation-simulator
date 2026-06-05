/**
 * TradeHistory.test.js - 交易历史测试
 * V382 Iteration 7/9 Round 11 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TradeHistory } from '../../../systems/ai/TradeHistory.js';

describe('TradeHistory', () => {
    let system;
    beforeEach(() => { system = new TradeHistory(); });

    describe('addEntry', () => {
        it('should add', () => {
            const { entry } = system.addEntry({ traderId: 't1' });
            expect(entry.traderId).toBe('t1');
        });

        it('should trigger entryAdded hook', () => {
            let called = false;
            system.registerHook('entryAdded', () => { called = true; });
            system.addEntry({});
            expect(called).toBe(true);
        });
    });

    describe('getEntry', () => {
        it('should return', () => {
            const { entry } = system.addEntry({});
            expect(system.getEntry(entry.entryId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getEntry('ghost')).toBeNull(); });
    });

    describe('listEntries', () => {
        it('should list all', () => {
            system.addEntry({});
            expect(system.listEntries().length).toBe(1);
        });
    });

    describe('listByTrader', () => {
        it('should filter', () => {
            system.addEntry({ traderId: 't1' });
            system.addEntry({ traderId: 't2' });
            expect(system.listByTrader('t1').length).toBe(1);
        });
    });

    describe('listByAction', () => {
        it('should filter', () => {
            system.addEntry({ action: 'buy' });
            system.addEntry({ action: 'sell' });
            expect(system.listByAction('buy').length).toBe(1);
        });
    });

    describe('listByItem', () => {
        it('should filter', () => {
            system.addEntry({ itemId: 'sword' });
            system.addEntry({ itemId: 'potion' });
            expect(system.listByItem('sword').length).toBe(1);
        });
    });

    describe('listByTimeRange', () => {
        it('should filter', () => {
            system.addEntry({});
            const now = Date.now();
            expect(system.listByTimeRange(now - 100, now + 100).length).toBe(1);
        });
    });

    describe('calculateTotalAmount', () => {
        it('should calculate', () => {
            system.addEntry({ amount: 10 });
            system.addEntry({ amount: 20 });
            expect(system.calculateTotalAmount()).toBe(30);
        });
    });

    describe('calculateTotalPrice', () => {
        it('should calculate', () => {
            system.addEntry({ price: 100 });
            system.addEntry({ price: 200 });
            expect(system.calculateTotalPrice()).toBe(300);
        });
    });

    describe('getTraderVolume', () => {
        it('should calculate', () => {
            system.addEntry({ traderId: 't1', price: 100 });
            system.addEntry({ traderId: 't1', price: 200 });
            expect(system.getTraderVolume('t1')).toBe(300);
        });
    });

    describe('findMostTradedItem', () => {
        it('should find', () => {
            system.addEntry({ itemId: 'sword' });
            system.addEntry({ itemId: 'sword' });
            system.addEntry({ itemId: 'potion' });
            expect(system.findMostTradedItem()).toBe('sword');
        });

        it('should return null for empty', () => {
            expect(system.findMostTradedItem()).toBeNull();
        });
    });

    describe('clearOldEntries', () => {
        it('should clear', () => {
            const { entry } = system.addEntry({});
            entry.recordedAt = Date.now() - 10000;
            const result = system.clearOldEntries(5000);
            expect(result.cleared).toBe(1);
        });

        it('should not clear recent', () => {
            system.addEntry({});
            const result = system.clearOldEntries(5000);
            expect(result.cleared).toBe(0);
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

        it('should execute default getEntry', () => {
            const result = system.executeTool('getEntry', { entryId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('entryAdded', () => count++);
            unregister();
            system.addEntry({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('entryAdded', () => { throw new Error('x'); });
            expect(() => system.addEntry({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalEntries = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalEntries = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.addEntry({});
            const json = system.toJSON();
            expect(json.entries.length).toBe(1);
        });
        it('should deserialize', () => {
            system.addEntry({});
            const json = system.toJSON();
            const newSys = new TradeHistory();
            newSys.fromJSON(json);
            expect(newSys.entries.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.entryCount).toBe(0);
        });
    });
});