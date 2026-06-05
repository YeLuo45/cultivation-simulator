/**
 * TradingCore.test.js - 交易核心测试
 * V376 Iteration 1/9 Round 11 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TradingCore } from '../../../systems/ai/TradingCore.js';

describe('TradingCore', () => {
    let system;
    beforeEach(() => { system = new TradingCore(); });

    describe('registerTrader', () => {
        it('should register', () => {
            const { trader } = system.registerTrader({ name: 'T1' });
            expect(trader.name).toBe('T1');
        });

        it('should trigger traderRegistered hook', () => {
            let called = false;
            system.registerHook('traderRegistered', () => { called = true; });
            system.registerTrader({});
            expect(called).toBe(true);
        });
    });

    describe('getTrader', () => {
        it('should return', () => {
            const { trader } = system.registerTrader({});
            expect(system.getTrader(trader.traderId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTrader('ghost')).toBeNull(); });
    });

    describe('listTraders', () => {
        it('should list all', () => {
            system.registerTrader({});
            expect(system.listTraders().length).toBe(1);
        });
    });

    describe('listByBalance', () => {
        it('should filter', () => {
            const { trader: t1 } = system.registerTrader({});
            const { trader: t2 } = system.registerTrader({});
            t1.balance = 100;
            t2.balance = 1000;
            expect(system.listByBalance(500).length).toBe(1);
        });
    });

    describe('executeTrade', () => {
        it('should execute', () => {
            const { trader: buyer } = system.registerTrader({ balance: 1000 });
            const { trader: seller } = system.registerTrader({});
            const result = system.executeTrade(buyer.traderId, seller.traderId, 'potion', 100);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const { trader } = system.registerTrader({});
            const result = system.executeTrade('ghost', trader.traderId, 'potion', 100);
            expect(result.error).toBe('TRADER_NOT_FOUND');
        });

        it('should reject self trade', () => {
            const { trader } = system.registerTrader({});
            const result = system.executeTrade(trader.traderId, trader.traderId, 'potion', 100);
            expect(result.error).toBe('SELF_TRADE');
        });

        it('should reject insufficient funds', () => {
            const { trader: buyer } = system.registerTrader({ balance: 10 });
            const { trader: seller } = system.registerTrader({});
            const result = system.executeTrade(buyer.traderId, seller.traderId, 'potion', 100);
            expect(result.error).toBe('INSUFFICIENT_FUNDS');
        });

        it('should transfer balance', () => {
            const { trader: buyer } = system.registerTrader({ balance: 1000 });
            const { trader: seller } = system.registerTrader({ balance: 0 });
            system.executeTrade(buyer.traderId, seller.traderId, 'potion', 100);
            expect(seller.balance).toBe(95);
        });

        it('should trigger tradeExecuted hook', () => {
            const { trader: buyer } = system.registerTrader({});
            const { trader: seller } = system.registerTrader({});
            let called = false;
            system.registerHook('tradeExecuted', () => { called = true; });
            system.executeTrade(buyer.traderId, seller.traderId, 'potion', 100);
            expect(called).toBe(true);
        });
    });

    describe('getTrade', () => {
        it('should return', () => {
            const { trader: buyer } = system.registerTrader({});
            const { trader: seller } = system.registerTrader({});
            const { trade } = system.executeTrade(buyer.traderId, seller.traderId, 'potion', 100);
            expect(system.getTrade(trade.tradeId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTrade('ghost')).toBeNull(); });
    });

    describe('listTrades', () => {
        it('should list all', () => {
            const { trader: buyer } = system.registerTrader({});
            const { trader: seller } = system.registerTrader({});
            system.executeTrade(buyer.traderId, seller.traderId, 'potion', 100);
            expect(system.listTrades().length).toBe(1);
        });
    });

    describe('listByBuyer', () => {
        it('should filter', () => {
            const { trader: b1 } = system.registerTrader({});
            const { trader: b2 } = system.registerTrader({});
            const { trader: s1 } = system.registerTrader({});
            system.executeTrade(b1.traderId, s1.traderId, 'potion', 100);
            system.executeTrade(b2.traderId, s1.traderId, 'potion', 100);
            expect(system.listByBuyer(b1.traderId).length).toBe(1);
        });
    });

    describe('listBySeller', () => {
        it('should filter', () => {
            const { trader: b1 } = system.registerTrader({});
            const { trader: s1 } = system.registerTrader({});
            const { trader: s2 } = system.registerTrader({});
            system.executeTrade(b1.traderId, s1.traderId, 'potion', 100);
            system.executeTrade(b1.traderId, s2.traderId, 'potion', 100);
            expect(system.listBySeller(s1.traderId).length).toBe(1);
        });
    });

    describe('listByItem', () => {
        it('should filter', () => {
            const { trader: buyer } = system.registerTrader({});
            const { trader: seller } = system.registerTrader({});
            system.executeTrade(buyer.traderId, seller.traderId, 'potion', 100);
            system.executeTrade(buyer.traderId, seller.traderId, 'sword', 200);
            expect(system.listByItem('potion').length).toBe(1);
        });
    });

    describe('calculateVolume', () => {
        it('should calculate', () => {
            const { trader: buyer } = system.registerTrader({ balance: 1000 });
            const { trader: seller } = system.registerTrader({});
            system.executeTrade(buyer.traderId, seller.traderId, 'potion', 100);
            system.executeTrade(buyer.traderId, seller.traderId, 'sword', 200);
            expect(system.calculateVolume()).toBe(300);
        });
    });

    describe('calculateVolumeByItem', () => {
        it('should calculate', () => {
            const { trader: buyer } = system.registerTrader({ balance: 1000 });
            const { trader: seller } = system.registerTrader({});
            system.executeTrade(buyer.traderId, seller.traderId, 'potion', 100);
            system.executeTrade(buyer.traderId, seller.traderId, 'potion', 200);
            expect(system.calculateVolumeByItem('potion')).toBe(300);
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

        it('should execute default getTrader', () => {
            const result = system.executeTool('getTrader', { traderId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('traderRegistered', () => count++);
            unregister();
            system.registerTrader({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('traderRegistered', () => { throw new Error('x'); });
            expect(() => system.registerTrader({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTrades = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTrades = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerTrader({});
            const json = system.toJSON();
            expect(json.traders.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerTrader({});
            const json = system.toJSON();
            const newSys = new TradingCore();
            newSys.fromJSON(json);
            expect(newSys.traders.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.traderCount).toBe(0);
        });
    });
});