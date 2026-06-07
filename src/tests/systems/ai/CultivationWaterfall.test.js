/**
 * CultivationWaterfall.test.js - 修真瀑系统测试
 * V691 Iteration 14/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationWaterfall } from '../../../systems/ai/CultivationWaterfall.js';

describe('CultivationWaterfall', () => {
    let system;
    beforeEach(() => { system = new CultivationWaterfall(); });

    describe('recruitWaterfall', () => {
        it('should recruit', () => {
            const { waterfall } = system.recruitWaterfall({ masterId: 'm1', name: 'Celestial Cascade' });
            expect(waterfall.masterId).toBe('m1');
            expect(waterfall.name).toBe('Celestial Cascade');
        });

        it('should use baseForce by default', () => {
            const { waterfall } = system.recruitWaterfall({});
            expect(waterfall.force).toBe(20);
        });

        it('should default type to heavenly', () => {
            const { waterfall } = system.recruitWaterfall({});
            expect(waterfall.type).toBe('heavenly');
        });

        it('should default status to novice', () => {
            const { waterfall } = system.recruitWaterfall({});
            expect(waterfall.status).toBe('novice');
        });

        it('should reject when max reached', () => {
            system.config.maxWaterfalls = 2;
            system.recruitWaterfall({});
            system.recruitWaterfall({});
            const result = system.recruitWaterfall({});
            expect(result.error).toBe('MAX_WATERFALLS_REACHED');
        });

        it('should trigger waterfallRecruited hook', () => {
            let called = false;
            system.registerHook('waterfallRecruited', () => { called = true; });
            system.recruitWaterfall({});
            expect(called).toBe(true);
        });
    });

    describe('getWaterfall', () => {
        it('should return', () => {
            const { waterfall } = system.recruitWaterfall({});
            expect(system.getWaterfall(waterfall.waterfallId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getWaterfall('ghost')).toBeNull(); });
    });

    describe('listWaterfalls', () => {
        it('should list all', () => {
            system.recruitWaterfall({});
            system.recruitWaterfall({});
            expect(system.listWaterfalls().length).toBe(2);
        });

        it('should return empty when no waterfalls', () => {
            expect(system.listWaterfalls().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitWaterfall({ masterId: 'm1' });
            system.recruitWaterfall({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { waterfall } = system.recruitWaterfall({});
            system.legendWaterfall(waterfall.waterfallId);
            system.recruitWaterfall({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addPool', () => {
        it('should add pool', () => {
            const { waterfall } = system.recruitWaterfall({});
            system.addPool(waterfall.waterfallId, 'Mirror Pool');
            expect(waterfall.pools.length).toBe(1);
            expect(waterfall.pools[0]).toBe('Mirror Pool');
        });

        it('should reject missing', () => {
            const result = system.addPool('ghost', 'X');
            expect(result.error).toBe('WATERFALL_NOT_FOUND');
        });

        it('should trigger poolAdded hook', () => {
            const { waterfall } = system.recruitWaterfall({});
            let called = false;
            system.registerHook('poolAdded', () => { called = true; });
            system.addPool(waterfall.waterfallId, 'X');
            expect(called).toBe(true);
        });
    });

    describe('raiseForce', () => {
        it('should raise', () => {
            const { waterfall } = system.recruitWaterfall({});
            system.raiseForce(waterfall.waterfallId, 10);
            expect(waterfall.force).toBe(30);
        });

        it('should use default 5', () => {
            const { waterfall } = system.recruitWaterfall({});
            system.raiseForce(waterfall.waterfallId);
            expect(waterfall.force).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseForce('ghost', 5);
            expect(result.error).toBe('WATERFALL_NOT_FOUND');
        });

        it('should trigger forceRaised hook', () => {
            const { waterfall } = system.recruitWaterfall({});
            let called = false;
            system.registerHook('forceRaised', () => { called = true; });
            system.raiseForce(waterfall.waterfallId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpWaterfall', () => {
        it('should level up', () => {
            const { waterfall } = system.recruitWaterfall({});
            system.levelUpWaterfall(waterfall.waterfallId);
            expect(waterfall.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpWaterfall('ghost');
            expect(result.error).toBe('WATERFALL_NOT_FOUND');
        });

        it('should trigger waterfallLeveledUp hook', () => {
            const { waterfall } = system.recruitWaterfall({});
            let called = false;
            system.registerHook('waterfallLeveledUp', () => { called = true; });
            system.levelUpWaterfall(waterfall.waterfallId);
            expect(called).toBe(true);
        });
    });

    describe('legendWaterfall', () => {
        it('should set legendary', () => {
            const { waterfall } = system.recruitWaterfall({});
            system.legendWaterfall(waterfall.waterfallId);
            expect(waterfall.status).toBe('legendary');
        });

        it('should increment legendaryCount', () => {
            const { waterfall } = system.recruitWaterfall({});
            system.legendWaterfall(waterfall.waterfallId);
            expect(system.stats.legendaryCount).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.legendWaterfall('ghost');
            expect(result.error).toBe('WATERFALL_NOT_FOUND');
        });

        it('should trigger waterfallLegendized hook', () => {
            const { waterfall } = system.recruitWaterfall({});
            let called = false;
            system.registerHook('waterfallLegendized', () => { called = true; });
            system.legendWaterfall(waterfall.waterfallId);
            expect(called).toBe(true);
        });
    });

    describe('calculateWaterfallValue', () => {
        it('should calculate', () => {
            const { waterfall } = system.recruitWaterfall({});
            system.addPool(waterfall.waterfallId, 'P1');
            system.addPool(waterfall.waterfallId, 'P2');
            // level=1, force=20, pools=2 -> 1*100 + 20*2 + 2*30 = 100 + 40 + 60 = 200
            expect(system.calculateWaterfallValue(waterfall.waterfallId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateWaterfallValue('ghost')).toBe(0);
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

        it('should execute default getWaterfall', () => {
            const result = system.executeTool('getWaterfall', { waterfallId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitWaterfall', () => {
            const result = system.executeTool('recruitWaterfall', { masterId: 'm1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('waterfallRecruited', () => count++);
            unregister();
            system.recruitWaterfall({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('waterfallRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitWaterfall({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalWaterfalls = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalWaterfalls = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitWaterfall({});
            const json = system.toJSON();
            expect(json.waterfalls.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitWaterfall({});
            const json = system.toJSON();
            const newSys = new CultivationWaterfall();
            newSys.fromJSON(json);
            expect(newSys.waterfalls.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.waterfallCount).toBe(0);
        });
    });
});
