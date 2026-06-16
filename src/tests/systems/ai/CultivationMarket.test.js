/**
 * CultivationMarket.test.js - 修真市场测试
 * V538 Iteration 1/20 Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMarket } from '../../../systems/ai/CultivationMarket.js';

describe('CultivationMarket', () => {
    let system;
    beforeEach(() => { system = new CultivationMarket(); });

    describe('openMarket', () => {
        it('should create', () => {
            const { market } = system.openMarket({ ownerId: 'o1', name: 'Azure Pavilion', type: 'auction' });
            expect(market.ownerId).toBe('o1');
            expect(market.name).toBe('Azure Pavilion');
            expect(market.type).toBe('auction');
        });

        it('should trigger marketOpened hook', () => {
            let called = false;
            system.registerHook('marketOpened', () => { called = true; });
            system.openMarket({});
            expect(called).toBe(true);
        });
    });

    describe('getMarket', () => {
        it('should return', () => {
            const { market } = system.openMarket({});
            expect(system.getMarket(market.marketId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMarket('ghost')).toBeNull(); });
    });

    describe('listMarkets', () => {
        it('should list all', () => {
            system.openMarket({});
            system.openMarket({});
            expect(system.listMarkets().length).toBe(2);
        });
    });

    describe('listByOwner', () => {
        it('should filter', () => {
            system.openMarket({ ownerId: 'o1' });
            system.openMarket({ ownerId: 'o2' });
            expect(system.listByOwner('o1').length).toBe(1);
        });
    });

    describe('listOpen', () => {
        it('should filter open markets', () => {
            const { market: m1 } = system.openMarket({ ownerId: 'o1' });
            system.openMarket({ ownerId: 'o2' });
            system.closeMarket(m1.marketId);
            expect(system.listOpen().length).toBe(1);
        });
    });

    describe('addGood', () => {
        it('should add good', () => {
            const { market } = system.openMarket({});
            system.addGood(market.marketId, { id: 'g1', name: 'Spirit Herb' });
            expect(market.goods.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addGood('ghost', { id: 'g1' });
            expect(result.error).toBe('MARKET_NOT_FOUND');
        });

        it('should trigger goodAdded hook', () => {
            const { market } = system.openMarket({});
            let called = false;
            system.registerHook('goodAdded', () => { called = true; });
            system.addGood(market.marketId, { id: 'g1' });
            expect(called).toBe(true);
        });
    });

    describe('increaseLiquidity', () => {
        it('should increase', () => {
            const { market } = system.openMarket({});
            system.increaseLiquidity(market.marketId, 15);
            expect(market.liquidity).toBe(35);
        });

        it('should reject missing', () => {
            const result = system.increaseLiquidity('ghost', 10);
            expect(result.error).toBe('MARKET_NOT_FOUND');
        });

        it('should trigger liquidityIncreased hook', () => {
            const { market } = system.openMarket({});
            let called = false;
            system.registerHook('liquidityIncreased', () => { called = true; });
            system.increaseLiquidity(market.marketId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMarket', () => {
        it('should level up', () => {
            const { market } = system.openMarket({});
            system.levelUpMarket(market.marketId);
            expect(market.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpMarket('ghost');
            expect(result.error).toBe('MARKET_NOT_FOUND');
        });

        it('should trigger marketLeveledUp hook', () => {
            const { market } = system.openMarket({});
            let called = false;
            system.registerHook('marketLeveledUp', () => { called = true; });
            system.levelUpMarket(market.marketId);
            expect(called).toBe(true);
        });
    });

    describe('closeMarket', () => {
        it('should close', () => {
            const { market } = system.openMarket({});
            system.closeMarket(market.marketId);
            expect(market.status).toBe('closed');
        });

        it('should reject missing', () => {
            const result = system.closeMarket('ghost');
            expect(result.error).toBe('MARKET_NOT_FOUND');
        });

        it('should trigger marketClosed hook', () => {
            const { market } = system.openMarket({});
            let called = false;
            system.registerHook('marketClosed', () => { called = true; });
            system.closeMarket(market.marketId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMarketPower', () => {
        it('should calculate', () => {
            const { market } = system.openMarket({});
            // level=1, liquidity=20, goods=[] => 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateMarketPower(market.marketId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMarketPower('ghost')).toBe(0);
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
            const unregister = system.registerHook('marketOpened', () => count++);
            unregister();
            system.openMarket({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('marketOpened', () => { throw new Error('x'); });
            expect(() => system.openMarket({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMarkets = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMarkets = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openMarket({});
            const json = system.toJSON();
            expect(json.markets.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openMarket({});
            const json = system.toJSON();
            const newSys = new CultivationMarket();
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
