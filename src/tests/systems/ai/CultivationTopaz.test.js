/**
 * CultivationTopaz.test.js - 修真黄玉系统测试
 * V836 Iteration 9/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTopaz } from '../../../systems/ai/CultivationTopaz.js';

describe('CultivationTopaz', () => {
    let system;
    beforeEach(() => { system = new CultivationTopaz(); });

    describe('recruitTopaz', () => {
        it('should recruit with defaults', () => {
            const { topaz } = system.recruitTopaz({});
            expect(topaz.masterId).toBe('unknown_master');
            expect(topaz.name).toBe('unnamed_topaz');
            expect(topaz.type).toBe('imperial');
            expect(topaz.warmth).toBe(20);
            expect(topaz.inclusions).toEqual([]);
            expect(topaz.level).toBe(1);
            expect(topaz.status).toBe('novice');
        });

        it('should recruit with custom data', () => {
            const { topaz } = system.recruitTopaz({
                masterId: 'm1',
                name: 'SunTopaz',
                type: 'sherry',
                warmth: 80,
                inclusions: ['firefly'],
                level: 3,
                status: 'veteran'
            });
            expect(topaz.masterId).toBe('m1');
            expect(topaz.name).toBe('SunTopaz');
            expect(topaz.type).toBe('sherry');
            expect(topaz.warmth).toBe(80);
            expect(topaz.inclusions).toEqual(['firefly']);
            expect(topaz.level).toBe(3);
            expect(topaz.status).toBe('veteran');
        });

        it('should increment totalTopazes', () => {
            system.recruitTopaz({});
            system.recruitTopaz({});
            expect(system.stats.totalTopazes).toBe(2);
        });

        it('should trigger topazRecruited hook', () => {
            let called = false;
            system.registerHook('topazRecruited', () => { called = true; });
            system.recruitTopaz({});
            expect(called).toBe(true);
        });
    });

    describe('getTopaz', () => {
        it('should return topaz', () => {
            const { topaz } = system.recruitTopaz({});
            const got = system.getTopaz(topaz.topazId);
            expect(got).not.toBeNull();
            expect(got.topazId).toBe(topaz.topazId);
        });
        it('should return null for missing', () => { expect(system.getTopaz('ghost')).toBeNull(); });
    });

    describe('listTopazes', () => {
        it('should list all', () => {
            system.recruitTopaz({});
            system.recruitTopaz({});
            system.recruitTopaz({});
            expect(system.listTopazes().length).toBe(3);
        });

        it('should return empty list when no topazes', () => {
            expect(system.listTopazes().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitTopaz({ masterId: 'm1' });
            system.recruitTopaz({ masterId: 'm1' });
            system.recruitTopaz({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary topazes', () => {
            const { topaz: t1 } = system.recruitTopaz({});
            const { topaz: t2 } = system.recruitTopaz({});
            system.legendTopaz(t1.topazId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].topazId).toBe(t1.topazId);
        });

        it('should return empty when none legendary', () => {
            system.recruitTopaz({});
            system.recruitTopaz({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addInclusion', () => {
        it('should add inclusion', () => {
            const { topaz } = system.recruitTopaz({});
            system.addInclusion(topaz.topazId, 'firefly');
            expect(topaz.inclusions).toContain('firefly');
            expect(topaz.inclusions.length).toBe(1);
        });

        it('should add multiple inclusions', () => {
            const { topaz } = system.recruitTopaz({});
            system.addInclusion(topaz.topazId, 'firefly');
            system.addInclusion(topaz.topazId, 'leaf');
            expect(topaz.inclusions).toEqual(['firefly', 'leaf']);
        });

        it('should set status to veteran when 5+ inclusions', () => {
            const { topaz } = system.recruitTopaz({});
            system.addInclusion(topaz.topazId, 'a');
            system.addInclusion(topaz.topazId, 'b');
            system.addInclusion(topaz.topazId, 'c');
            system.addInclusion(topaz.topazId, 'd');
            expect(topaz.status).toBe('novice');
            system.addInclusion(topaz.topazId, 'e');
            expect(topaz.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.addInclusion('ghost', 'firefly');
            expect(result.error).toBe('TOPAZ_NOT_FOUND');
        });

        it('should trigger inclusionAdded hook', () => {
            const { topaz } = system.recruitTopaz({});
            let called = false;
            system.registerHook('inclusionAdded', () => { called = true; });
            system.addInclusion(topaz.topazId, 'firefly');
            expect(called).toBe(true);
        });
    });

    describe('raiseWarmth', () => {
        it('should raise by default amount', () => {
            const { topaz } = system.recruitTopaz({});
            system.raiseWarmth(topaz.topazId);
            expect(topaz.warmth).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { topaz } = system.recruitTopaz({});
            system.raiseWarmth(topaz.topazId, 30);
            expect(topaz.warmth).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.raiseWarmth('ghost', 5);
            expect(result.error).toBe('TOPAZ_NOT_FOUND');
        });

        it('should trigger warmthRaised hook', () => {
            const { topaz } = system.recruitTopaz({});
            let called = false;
            system.registerHook('warmthRaised', () => { called = true; });
            system.raiseWarmth(topaz.topazId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpTopaz', () => {
        it('should level up', () => {
            const { topaz } = system.recruitTopaz({});
            system.levelUpTopaz(topaz.topazId);
            expect(topaz.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { topaz } = system.recruitTopaz({});
            system.levelUpTopaz(topaz.topazId);
            system.levelUpTopaz(topaz.topazId);
            expect(topaz.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpTopaz('ghost');
            expect(result.error).toBe('TOPAZ_NOT_FOUND');
        });

        it('should trigger topazLeveledUp hook', () => {
            const { topaz } = system.recruitTopaz({});
            let called = false;
            system.registerHook('topazLeveledUp', () => { called = true; });
            system.levelUpTopaz(topaz.topazId);
            expect(called).toBe(true);
        });
    });

    describe('legendTopaz', () => {
        it('should set status to legendary', () => {
            const { topaz } = system.recruitTopaz({});
            system.legendTopaz(topaz.topazId);
            expect(topaz.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendTopaz('ghost');
            expect(result.error).toBe('TOPAZ_NOT_FOUND');
        });

        it('should trigger topazLegendized hook', () => {
            const { topaz } = system.recruitTopaz({});
            let called = false;
            system.registerHook('topazLegendized', () => { called = true; });
            system.legendTopaz(topaz.topazId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTopazValue', () => {
        it('should calculate default value', () => {
            const { topaz } = system.recruitTopaz({});
            // level=1 * 100 + warmth=20 * 2 + 0 * 30 = 140
            expect(system.calculateTopazValue(topaz.topazId)).toBe(140);
        });

        it('should add 30 per inclusion', () => {
            const { topaz } = system.recruitTopaz({});
            system.addInclusion(topaz.topazId, 'firefly');
            system.addInclusion(topaz.topazId, 'leaf');
            // 100 + 40 + 2*30 = 200
            expect(system.calculateTopazValue(topaz.topazId)).toBe(200);
        });

        it('should reflect level in formula', () => {
            const { topaz } = system.recruitTopaz({});
            system.levelUpTopaz(topaz.topazId);
            system.levelUpTopaz(topaz.topazId);
            // 3*100 + 40 + 0 = 340
            expect(system.calculateTopazValue(topaz.topazId)).toBe(340);
        });

        it('should reflect warmth in formula', () => {
            const { topaz } = system.recruitTopaz({});
            system.raiseWarmth(topaz.topazId, 30);
            // 100 + 50*2 + 0 = 200
            expect(system.calculateTopazValue(topaz.topazId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTopazValue('ghost')).toBe(0);
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
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default getTopaz', () => {
            const result = system.executeTool('getTopaz', { topazId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle undefined context', () => {
            const result = system.executeTool('getTopaz');
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('topazRecruited', () => count++);
            unregister();
            system.recruitTopaz({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('topazRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitTopaz({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTopazes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalTopazes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitTopaz({});
            const json = system.toJSON();
            expect(json.topazes.length).toBe(1);
            expect(json.stats.totalTopazes).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitTopaz({ name: 'a' });
            const json = system.toJSON();
            const newSys = new CultivationTopaz();
            newSys.fromJSON(json);
            expect(newSys.topazes.size).toBe(1);
            expect(newSys.stats.totalTopazes).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.topazCount).toBe(0);
            expect(stats.totalTopazes).toBe(0);
            system.recruitTopaz({});
            expect(system.getStats().topazCount).toBe(1);
        });
    });
});
