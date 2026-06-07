/**
 * CultivationOpal.test.js - 修真蛋白石系统测试
 * V837 Iteration 10/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationOpal } from '../../../systems/ai/CultivationOpal.js';

describe('CultivationOpal', () => {
    let system;
    beforeEach(() => { system = new CultivationOpal(); });

    describe('recruitOpal', () => {
        it('should recruit', () => {
            const { opal } = system.recruitOpal({ masterId: 'm1', name: 'Sacred Opal', type: 'black' });
            expect(opal.masterId).toBe('m1');
            expect(opal.name).toBe('Sacred Opal');
            expect(opal.type).toBe('black');
        });

        it('should default type to divine', () => {
            const { opal } = system.recruitOpal({});
            expect(opal.type).toBe('divine');
        });

        it('should default status to novice', () => {
            const { opal } = system.recruitOpal({});
            expect(opal.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { opal } = system.recruitOpal({});
            expect(opal.level).toBe(1);
        });

        it('should default inclusions to empty array', () => {
            const { opal } = system.recruitOpal({});
            expect(opal.inclusions).toEqual([]);
        });

        it('should default shimmer to baseShimmer', () => {
            const { opal } = system.recruitOpal({});
            expect(opal.shimmer).toBe(20);
        });

        it('should assign auto id when missing', () => {
            const { opal } = system.recruitOpal({});
            expect(opal.opalId).toMatch(/^opal_/);
        });

        it('should use provided opalId', () => {
            const { opal } = system.recruitOpal({ opalId: 'o_explicit' });
            expect(opal.opalId).toBe('o_explicit');
        });

        it('should trigger opalRecruited hook', () => {
            let called = false;
            system.registerHook('opalRecruited', () => { called = true; });
            system.recruitOpal({});
            expect(called).toBe(true);
        });

        it('should respect custom config baseShimmer', () => {
            const customSystem = new CultivationOpal({ baseShimmer: 50 });
            const { opal } = customSystem.recruitOpal({});
            expect(opal.shimmer).toBe(50);
        });

        it('should increment totalOpals stat', () => {
            system.recruitOpal({});
            system.recruitOpal({});
            expect(system.stats.totalOpals).toBe(2);
        });

        it('should support all three types', () => {
            const { opal: a } = system.recruitOpal({ type: 'black' });
            const { opal: b } = system.recruitOpal({ type: 'fire' });
            const { opal: c } = system.recruitOpal({ type: 'divine' });
            expect(a.type).toBe('black');
            expect(b.type).toBe('fire');
            expect(c.type).toBe('divine');
        });
    });

    describe('getOpal', () => {
        it('should return', () => {
            const { opal } = system.recruitOpal({});
            expect(system.getOpal(opal.opalId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getOpal('ghost')).toBeNull(); });
        it('should return a copy (not reference)', () => {
            const { opal } = system.recruitOpal({ name: 'Original' });
            const fetched = system.getOpal(opal.opalId);
            fetched.name = 'Mutated';
            const refetched = system.getOpal(opal.opalId);
            expect(refetched.name).toBe('Original');
        });
    });

    describe('listOpals', () => {
        it('should list all', () => {
            system.recruitOpal({});
            system.recruitOpal({});
            expect(system.listOpals().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listOpals().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitOpal({ masterId: 'm1' });
            system.recruitOpal({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitOpal({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });

        it('should return multiple for same master', () => {
            system.recruitOpal({ masterId: 'm1' });
            system.recruitOpal({ masterId: 'm1' });
            system.recruitOpal({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { opal: a } = system.recruitOpal({});
            const { opal: b } = system.recruitOpal({});
            system.legendOpal(a.opalId);
            expect(system.listLegendary().length).toBe(1);
            expect(b.opalId).toBeDefined();
        });

        it('should return empty when none legendary', () => {
            system.recruitOpal({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addInclusion', () => {
        it('should add inclusion', () => {
            const { opal } = system.recruitOpal({});
            system.addInclusion(opal.opalId, 'play_of_color_vein');
            expect(opal.inclusions).toContain('play_of_color_vein');
        });

        it('should add multiple inclusions', () => {
            const { opal } = system.recruitOpal({});
            system.addInclusion(opal.opalId, 'play_of_color_vein');
            system.addInclusion(opal.opalId, 'potch_matrix');
            expect(opal.inclusions.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addInclusion('ghost', 'play_of_color_vein');
            expect(result.error).toBe('OPAL_NOT_FOUND');
        });

        it('should trigger inclusionAdded hook', () => {
            const { opal } = system.recruitOpal({});
            let called = false;
            system.registerHook('inclusionAdded', () => { called = true; });
            system.addInclusion(opal.opalId, 'play_of_color_vein');
            expect(called).toBe(true);
        });
    });

    describe('raiseShimmer', () => {
        it('should raise shimmer', () => {
            const { opal } = system.recruitOpal({});
            system.raiseShimmer(opal.opalId, 10);
            expect(opal.shimmer).toBe(30);
        });

        it('should default amount to 5', () => {
            const { opal } = system.recruitOpal({});
            system.raiseShimmer(opal.opalId);
            expect(opal.shimmer).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseShimmer('ghost', 10);
            expect(result.error).toBe('OPAL_NOT_FOUND');
        });

        it('should trigger shimmerRaised hook', () => {
            const { opal } = system.recruitOpal({});
            let called = false;
            system.registerHook('shimmerRaised', () => { called = true; });
            system.raiseShimmer(opal.opalId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpOpal', () => {
        it('should increment level', () => {
            const { opal } = system.recruitOpal({});
            system.levelUpOpal(opal.opalId);
            expect(opal.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { opal } = system.recruitOpal({});
            system.levelUpOpal(opal.opalId);
            system.levelUpOpal(opal.opalId);
            system.levelUpOpal(opal.opalId);
            expect(opal.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpOpal('ghost');
            expect(result.error).toBe('OPAL_NOT_FOUND');
        });
    });

    describe('legendOpal', () => {
        it('should set status to legendary', () => {
            const { opal } = system.recruitOpal({});
            system.legendOpal(opal.opalId);
            expect(opal.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendOpal('ghost');
            expect(result.error).toBe('OPAL_NOT_FOUND');
        });

        it('should trigger opalLegendized hook', () => {
            const { opal } = system.recruitOpal({});
            let called = false;
            system.registerHook('opalLegendized', () => { called = true; });
            system.legendOpal(opal.opalId);
            expect(called).toBe(true);
        });
    });

    describe('calculateOpalValue', () => {
        it('should calculate', () => {
            const { opal } = system.recruitOpal({});
            system.addInclusion(opal.opalId, 'play_of_color_vein');
            // value = 1 * 100 + 20 * 2 + 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculateOpalValue(opal.opalId)).toBeCloseTo(170, 5);
        });

        it('should recalculate after level up', () => {
            const { opal } = system.recruitOpal({});
            system.levelUpOpal(opal.opalId);
            // value = 2 * 100 + 20 * 2 + 0 * 30 = 200 + 40 + 0 = 240
            expect(system.calculateOpalValue(opal.opalId)).toBeCloseTo(240, 5);
        });

        it('should recalculate after shimmer raise', () => {
            const { opal } = system.recruitOpal({});
            system.raiseShimmer(opal.opalId, 5);
            // value = 1 * 100 + 25 * 2 + 0 * 30 = 100 + 50 + 0 = 150
            expect(system.calculateOpalValue(opal.opalId)).toBeCloseTo(150, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateOpalValue('ghost')).toBe(0);
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

        it('should execute default getOpal', () => {
            const result = system.executeTool('getOpal', { opalId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle undefined context with default', () => {
            system.registerTool('echo', (ctx) => ctx);
            const result = system.executeTool('echo');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('opalRecruited', () => count++);
            unregister();
            system.recruitOpal({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('opalRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitOpal({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalOpals = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalOpals = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitOpal({});
            const json = system.toJSON();
            expect(json.opals.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitOpal({});
            const json = system.toJSON();
            const newSys = new CultivationOpal();
            newSys.fromJSON(json);
            expect(newSys.opals.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recruitOpal({});
            const stats = system.getStats();
            expect(stats.opalCount).toBe(1);
        });
    });
});
