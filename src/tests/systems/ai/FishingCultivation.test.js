/**
 * FishingCultivation.test.js - 钓鱼修真测试
 * V446 Iteration 8/15 Round 16 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FishingCultivation } from '../../../systems/ai/FishingCultivation.js';

describe('FishingCultivation', () => {
    let system;
    beforeEach(() => { system = new FishingCultivation(); });

    describe('castRod', () => {
        it('should cast', () => {
            const { theCatch } = system.castRod({ fisherId: 'f1' });
            expect(theCatch.fisherId).toBe('f1');
        });

        it('should trigger rodCast hook', () => {
            let called = false;
            system.registerHook('rodCast', () => { called = true; });
            system.castRod({});
            expect(called).toBe(true);
        });
    });

    describe('getCatch', () => {
        it('should return', () => {
            const { theCatch } = system.castRod({});
            expect(system.getCatch(theCatch.catchId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCatch('ghost')).toBeNull(); });
    });

    describe('listCatches', () => {
        it('should list all', () => {
            system.castRod({});
            expect(system.listCatches().length).toBe(1);
        });
    });

    describe('listByFisher', () => {
        it('should filter', () => {
            system.castRod({ fisherId: 'f1' });
            system.castRod({ fisherId: 'f2' });
            expect(system.listByFisher('f1').length).toBe(1);
        });
    });

    describe('listByFishType', () => {
        it('should filter', () => {
            system.castRod({ fishType: 'carp' });
            system.castRod({ fishType: 'koi' });
            expect(system.listByFishType('carp').length).toBe(1);
        });
    });

    describe('hookFish', () => {
        it('should hook', () => {
            const { theCatch } = system.castRod({});
            system.hookFish(theCatch.catchId, 10);
            expect(theCatch.baits).toBe(10);
        });

        it('should reject missing', () => {
            const result = system.hookFish('ghost', 10);
            expect(result.error).toBe('CATCH_NOT_FOUND');
        });

        it('should trigger fishHooked hook', () => {
            const { theCatch } = system.castRod({});
            let called = false;
            system.registerHook('fishHooked', () => { called = true; });
            system.hookFish(theCatch.catchId, 10);
            expect(called).toBe(true);
        });
    });

    describe('catchFish', () => {
        it('should catch', () => {
            const { theCatch } = system.castRod({});
            system.catchFish(theCatch.catchId, 20);
            expect(theCatch.weight).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.catchFish('ghost', 20);
            expect(result.error).toBe('CATCH_NOT_FOUND');
        });

        it('should trigger fishCaught hook', () => {
            const { theCatch } = system.castRod({});
            let called = false;
            system.registerHook('fishCaught', () => { called = true; });
            system.catchFish(theCatch.catchId, 20);
            expect(called).toBe(true);
        });
    });

    describe('releaseFish', () => {
        it('should release', () => {
            const { theCatch } = system.castRod({});
            system.releaseFish(theCatch.catchId);
            expect(theCatch.status).toBe('released');
        });

        it('should reject missing', () => {
            const result = system.releaseFish('ghost');
            expect(result.error).toBe('CATCH_NOT_FOUND');
        });

        it('should trigger fishReleased hook', () => {
            const { theCatch } = system.castRod({});
            let called = false;
            system.registerHook('fishReleased', () => { called = true; });
            system.releaseFish(theCatch.catchId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCatchQuality', () => {
        it('should calculate', () => {
            const { theCatch } = system.castRod({ weight: 10, rarity: 5, baits: 3 });
            // quality = 10 * (1 + 5/10) + 3 * 2 = 10 * 1.5 + 6 = 15 + 6 = 21
            expect(system.calculateCatchQuality(theCatch.catchId)).toBeCloseTo(21, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCatchQuality('ghost')).toBe(0);
        });
    });

    describe('listCaught', () => {
        it('should filter caught', () => {
            const { theCatch: c1 } = system.castRod({});
            const { theCatch: c2 } = system.castRod({});
            system.catchFish(c1.catchId);
            expect(system.listCaught().length).toBe(1);
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

        it('should execute default getCatch', () => {
            const result = system.executeTool('getCatch', { catchId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('rodCast', () => count++);
            unregister();
            system.castRod({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('rodCast', () => { throw new Error('x'); });
            expect(() => system.castRod({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCatches = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCatches = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.castRod({});
            const json = system.toJSON();
            expect(json.catches.length).toBe(1);
        });
        it('should deserialize', () => {
            system.castRod({});
            const json = system.toJSON();
            const newSys = new FishingCultivation();
            newSys.fromJSON(json);
            expect(newSys.catches.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.catchCount).toBe(0);
        });
    });
});
