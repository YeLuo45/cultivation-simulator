/**
 * CultivationAmber.test.js - 修真琥珀系统测试
 * V832 Iteration 5/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationAmber } from '../../../systems/ai/CultivationAmber.js';

describe('CultivationAmber', () => {
    let system;
    beforeEach(() => { system = new CultivationAmber(); });

    describe('recruitAmber', () => {
        it('should recruit with defaults', () => {
            const { amber } = system.recruitAmber({});
            expect(amber.masterId).toBe('unknown_master');
            expect(amber.name).toBe('unnamed_amber');
            expect(amber.type).toBe('golden');
            expect(amber.warmth).toBe(20);
            expect(amber.inclusions).toEqual([]);
            expect(amber.level).toBe(1);
            expect(amber.status).toBe('novice');
        });

        it('should recruit with custom data', () => {
            const { amber } = system.recruitAmber({
                masterId: 'm1',
                name: 'SunAmber',
                type: 'red',
                warmth: 80,
                inclusions: ['firefly'],
                level: 3,
                status: 'veteran'
            });
            expect(amber.masterId).toBe('m1');
            expect(amber.name).toBe('SunAmber');
            expect(amber.type).toBe('red');
            expect(amber.warmth).toBe(80);
            expect(amber.inclusions).toEqual(['firefly']);
            expect(amber.level).toBe(3);
            expect(amber.status).toBe('veteran');
        });

        it('should increment totalAmbers', () => {
            system.recruitAmber({});
            system.recruitAmber({});
            expect(system.stats.totalAmbers).toBe(2);
        });

        it('should trigger amberRecruited hook', () => {
            let called = false;
            system.registerHook('amberRecruited', () => { called = true; });
            system.recruitAmber({});
            expect(called).toBe(true);
        });
    });

    describe('getAmber', () => {
        it('should return amber', () => {
            const { amber } = system.recruitAmber({});
            const got = system.getAmber(amber.amberId);
            expect(got).not.toBeNull();
            expect(got.amberId).toBe(amber.amberId);
        });
        it('should return null for missing', () => { expect(system.getAmber('ghost')).toBeNull(); });
    });

    describe('listAmbers', () => {
        it('should list all', () => {
            system.recruitAmber({});
            system.recruitAmber({});
            system.recruitAmber({});
            expect(system.listAmbers().length).toBe(3);
        });

        it('should return empty list when no ambers', () => {
            expect(system.listAmbers().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitAmber({ masterId: 'm1' });
            system.recruitAmber({ masterId: 'm1' });
            system.recruitAmber({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary ambers', () => {
            const { amber: a1 } = system.recruitAmber({});
            const { amber: a2 } = system.recruitAmber({});
            system.legendAmber(a1.amberId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].amberId).toBe(a1.amberId);
        });

        it('should return empty when none legendary', () => {
            system.recruitAmber({});
            system.recruitAmber({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addInclusion', () => {
        it('should add inclusion', () => {
            const { amber } = system.recruitAmber({});
            system.addInclusion(amber.amberId, 'firefly');
            expect(amber.inclusions).toContain('firefly');
            expect(amber.inclusions.length).toBe(1);
        });

        it('should add multiple inclusions', () => {
            const { amber } = system.recruitAmber({});
            system.addInclusion(amber.amberId, 'firefly');
            system.addInclusion(amber.amberId, 'leaf');
            expect(amber.inclusions).toEqual(['firefly', 'leaf']);
        });

        it('should set status to veteran when 5+ inclusions', () => {
            const { amber } = system.recruitAmber({});
            system.addInclusion(amber.amberId, 'a');
            system.addInclusion(amber.amberId, 'b');
            system.addInclusion(amber.amberId, 'c');
            system.addInclusion(amber.amberId, 'd');
            expect(amber.status).toBe('novice');
            system.addInclusion(amber.amberId, 'e');
            expect(amber.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.addInclusion('ghost', 'firefly');
            expect(result.error).toBe('AMBER_NOT_FOUND');
        });

        it('should trigger inclusionAdded hook', () => {
            const { amber } = system.recruitAmber({});
            let called = false;
            system.registerHook('inclusionAdded', () => { called = true; });
            system.addInclusion(amber.amberId, 'firefly');
            expect(called).toBe(true);
        });
    });

    describe('raiseWarmth', () => {
        it('should raise by default amount', () => {
            const { amber } = system.recruitAmber({});
            system.raiseWarmth(amber.amberId);
            expect(amber.warmth).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { amber } = system.recruitAmber({});
            system.raiseWarmth(amber.amberId, 30);
            expect(amber.warmth).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.raiseWarmth('ghost', 5);
            expect(result.error).toBe('AMBER_NOT_FOUND');
        });

        it('should trigger warmthRaised hook', () => {
            const { amber } = system.recruitAmber({});
            let called = false;
            system.registerHook('warmthRaised', () => { called = true; });
            system.raiseWarmth(amber.amberId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpAmber', () => {
        it('should level up', () => {
            const { amber } = system.recruitAmber({});
            system.levelUpAmber(amber.amberId);
            expect(amber.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { amber } = system.recruitAmber({});
            system.levelUpAmber(amber.amberId);
            system.levelUpAmber(amber.amberId);
            expect(amber.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpAmber('ghost');
            expect(result.error).toBe('AMBER_NOT_FOUND');
        });

        it('should trigger amberLeveledUp hook', () => {
            const { amber } = system.recruitAmber({});
            let called = false;
            system.registerHook('amberLeveledUp', () => { called = true; });
            system.levelUpAmber(amber.amberId);
            expect(called).toBe(true);
        });
    });

    describe('legendAmber', () => {
        it('should set status to legendary', () => {
            const { amber } = system.recruitAmber({});
            system.legendAmber(amber.amberId);
            expect(amber.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendAmber('ghost');
            expect(result.error).toBe('AMBER_NOT_FOUND');
        });

        it('should trigger amberLegendized hook', () => {
            const { amber } = system.recruitAmber({});
            let called = false;
            system.registerHook('amberLegendized', () => { called = true; });
            system.legendAmber(amber.amberId);
            expect(called).toBe(true);
        });
    });

    describe('calculateAmberValue', () => {
        it('should calculate default value', () => {
            const { amber } = system.recruitAmber({});
            // level=1 * 100 + warmth=20 * 2 + 0 * 30 = 140
            expect(system.calculateAmberValue(amber.amberId)).toBe(140);
        });

        it('should add 30 per inclusion', () => {
            const { amber } = system.recruitAmber({});
            system.addInclusion(amber.amberId, 'firefly');
            system.addInclusion(amber.amberId, 'leaf');
            // 100 + 40 + 2*30 = 200
            expect(system.calculateAmberValue(amber.amberId)).toBe(200);
        });

        it('should reflect level in formula', () => {
            const { amber } = system.recruitAmber({});
            system.levelUpAmber(amber.amberId);
            system.levelUpAmber(amber.amberId);
            // 3*100 + 40 + 0 = 340
            expect(system.calculateAmberValue(amber.amberId)).toBe(340);
        });

        it('should reflect warmth in formula', () => {
            const { amber } = system.recruitAmber({});
            system.raiseWarmth(amber.amberId, 30);
            // 100 + 50*2 + 0 = 200
            expect(system.calculateAmberValue(amber.amberId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateAmberValue('ghost')).toBe(0);
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

        it('should execute default getAmber', () => {
            const result = system.executeTool('getAmber', { amberId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('amberRecruited', () => count++);
            unregister();
            system.recruitAmber({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('amberRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitAmber({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalAmbers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalAmbers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitAmber({});
            const json = system.toJSON();
            expect(json.ambers.length).toBe(1);
            expect(json.stats.totalAmbers).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitAmber({ name: 'a' });
            const json = system.toJSON();
            const newSys = new CultivationAmber();
            newSys.fromJSON(json);
            expect(newSys.ambers.size).toBe(1);
            expect(newSys.stats.totalAmbers).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.amberCount).toBe(0);
            expect(stats.totalAmbers).toBe(0);
            system.recruitAmber({});
            expect(system.getStats().amberCount).toBe(1);
        });
    });
});
