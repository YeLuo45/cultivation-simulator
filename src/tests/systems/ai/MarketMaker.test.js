/**
 * MarketMaker.test.js - 做市商测试
 * V379 Iteration 4/9 Round 11 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MarketMaker } from '../../../systems/ai/MarketMaker.js';

describe('MarketMaker', () => {
    let system;
    beforeEach(() => { system = new MarketMaker(); });

    describe('createMarket', () => {
        it('should create', () => {
            const { market } = system.createMarket({ itemId: 'potion' });
            expect(market.itemId).toBe('potion');
        });

        it('should trigger marketCreated hook', () => {
            let called = false;
            system.registerHook('marketCreated', () => { called = true; });
            system.createMarket({});
            expect(called).toBe(true);
        });
    });

    describe('getMarket', () => {
        it('should return', () => {
            const { market } = system.createMarket({});
            expect(system.getMarket(market.marketId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMarket('ghost')).toBeNull(); });
    });

    describe('listMarkets', () => {
        it('should list all', () => {
            system.createMarket({});
            expect(system.listMarkets().length).toBe(1);
        });
    });

    describe('listByItem', () => {
        it('should filter', () => {
            system.createMarket({ itemId: 'potion' });
            system.createMarket({ itemId: 'sword' });
            expect(system.listByItem('potion').length).toBe(1);
        });
    });

    describe('provideQuote', () => {
        it('should provide', () => {
            const { market } = system.createMarket({});
            const result = system.provideQuote(market.marketId, 90, 110);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.provideQuote('ghost', 90, 110);
            expect(result.error).toBe('MARKET_NOT_FOUND');
        });

        it('should update spread', () => {
            const { market } = system.createMarket({});
            system.provideQuote(market.marketId, 90, 100);
            expect(market.spread).toBeCloseTo(0.1, 5);
        });

        it('should trigger quoteProvided hook', () => {
            const { market } = system.createMarket({});
            let called = false;
            system.registerHook('quoteProvided', () => { called = true; });
            system.provideQuote(market.marketId, 90, 110);
            expect(called).toBe(true);
        });
    });

    describe('executeMarketBuy', () => {
        it('should execute', () => {
            const { market } = system.createMarket({});
            const result = system.executeMarketBuy(market.marketId);
            expect(result.price).toBe(market.askPrice);
        });

        it('should reject missing', () => {
            const result = system.executeMarketBuy('ghost');
            expect(result.error).toBe('MARKET_NOT_FOUND');
        });
    });

    describe('executeMarketSell', () => {
        it('should execute', () => {
            const { market } = system.createMarket({});
            const result = system.executeMarketSell(market.marketId);
            expect(result.price).toBe(market.bidPrice);
        });

        it('should reject missing', () => {
            const result = system.executeMarketSell('ghost');
            expect(result.error).toBe('MARKET_NOT_FOUND');
        });
    });

    describe('listQuotes', () => {
        it('should list all', () => {
            const { market } = system.createMarket({});
            system.provideQuote(market.marketId, 90, 110);
            expect(system.listQuotes().length).toBe(1);
        });
    });

    describe('listQuotesByMarket', () => {
        it('should filter', () => {
            const { market: m1 } = system.createMarket({});
            const { market: m2 } = system.createMarket({});
            system.provideQuote(m1.marketId, 90, 110);
            system.provideQuote(m2.marketId, 90, 110);
            expect(system.listQuotesByMarket(m1.marketId).length).toBe(1);
        });
    });

    describe('calculateMidPrice', () => {
        it('should calculate', () => {
            const { market } = system.createMarket({});
            system.provideQuote(market.marketId, 90, 110);
            expect(system.calculateMidPrice(market.marketId)).toBe(100);
        });

        it('should return null for missing', () => {
            expect(system.calculateMidPrice('ghost')).toBeNull();
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

        it('should execute default getMarket', () => {
            const result = system.executeTool('getMarket', { marketId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('marketCreated', () => count++);
            unregister();
            system.createMarket({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('marketCreated', () => { throw new Error('x'); });
            expect(() => system.createMarket({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalQuotes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalQuotes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createMarket({});
            const json = system.toJSON();
            expect(json.markets.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createMarket({});
            const json = system.toJSON();
            const newSys = new MarketMaker();
            newSys.fromJSON(json);
            expect(newSys.markets.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.marketCount).toBe(0);
        });
    });
});