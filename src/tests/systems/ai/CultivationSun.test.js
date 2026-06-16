/**
 * CultivationSun.test.js - 修真日测试
 * V685 Iteration 8/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSun } from '../../../systems/ai/CultivationSun.js';

describe('CultivationSun', () => {
    let system;
    beforeEach(() => { system = new CultivationSun(); });

    describe('recruitSun', () => {
        it('should recruit a sun', () => {
            const { sun } = system.recruitSun({ masterId: 'm1', name: 'Solar Flare', type: 'dawn' });
            expect(sun.masterId).toBe('m1');
            expect(sun.name).toBe('Solar Flare');
            expect(sun.type).toBe('dawn');
            expect(sun.status).toBe('novice');
            expect(sun.level).toBe(1);
        });

        it('should use defaults when not provided', () => {
            const { sun } = system.recruitSun({});
            expect(sun.name).toBe('Unnamed Sun');
            expect(sun.type).toBe('noon');
            expect(sun.radiance).toBe(20);
            expect(sun.flares).toEqual([]);
        });

        it('should generate id if not provided', () => {
            const { sun } = system.recruitSun({});
            expect(sun.sunId).toBeTruthy();
            expect(typeof sun.sunId).toBe('string');
        });

        it('should use provided sunId', () => {
            const { sun } = system.recruitSun({ sunId: 'custom-sun-1' });
            expect(sun.sunId).toBe('custom-sun-1');
        });

        it('should trigger sunRecruited hook', () => {
            let called = false;
            system.registerHook('sunRecruited', () => { called = true; });
            system.recruitSun({});
            expect(called).toBe(true);
        });

        it('should increment totalSuns stat', () => {
            expect(system.stats.totalSuns).toBe(0);
            system.recruitSun({});
            expect(system.stats.totalSuns).toBe(1);
            system.recruitSun({});
            expect(system.stats.totalSuns).toBe(2);
        });
    });

    describe('getSun', () => {
        it('should return a sun', () => {
            const { sun } = system.recruitSun({});
            expect(system.getSun(sun.sunId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getSun('ghost')).toBeNull();
        });
    });

    describe('listSuns', () => {
        it('should list all', () => {
            system.recruitSun({});
            system.recruitSun({});
            expect(system.listSuns().length).toBe(2);
        });

        it('should return empty list when empty', () => {
            expect(system.listSuns().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitSun({ masterId: 'm1' });
            system.recruitSun({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty when no match', () => {
            system.recruitSun({ masterId: 'm1' });
            expect(system.listByMaster('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { sun: s1 } = system.recruitSun({});
            system.recruitSun({});
            system.legendSun(s1.sunId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendary', () => {
            system.recruitSun({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addFlare', () => {
        it('should add flare', () => {
            const { sun } = system.recruitSun({});
            system.addFlare(sun.sunId, 'solar-flare-1');
            expect(sun.flares.length).toBe(1);
            expect(sun.flares[0]).toBe('solar-flare-1');
        });

        it('should reject missing', () => {
            const result = system.addFlare('ghost', 'x');
            expect(result.error).toBe('SUN_NOT_FOUND');
        });

        it('should trigger flareAdded hook', () => {
            const { sun } = system.recruitSun({});
            let called = false;
            system.registerHook('flareAdded', () => { called = true; });
            system.addFlare(sun.sunId, 'corona-flare');
            expect(called).toBe(true);
        });
    });

    describe('raiseRadiance', () => {
        it('should raise radiance', () => {
            const { sun } = system.recruitSun({});
            system.raiseRadiance(sun.sunId, 10);
            expect(sun.radiance).toBe(30);
        });

        it('should use default amount of 5', () => {
            const { sun } = system.recruitSun({});
            system.raiseRadiance(sun.sunId);
            expect(sun.radiance).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseRadiance('ghost', 5);
            expect(result.error).toBe('SUN_NOT_FOUND');
        });

        it('should trigger radianceRaised hook', () => {
            const { sun } = system.recruitSun({});
            let called = false;
            system.registerHook('radianceRaised', () => { called = true; });
            system.raiseRadiance(sun.sunId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSun', () => {
        it('should level up', () => {
            const { sun } = system.recruitSun({});
            system.levelUpSun(sun.sunId);
            expect(sun.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpSun('ghost');
            expect(result.error).toBe('SUN_NOT_FOUND');
        });

        it('should trigger sunLeveledUp hook', () => {
            const { sun } = system.recruitSun({});
            let called = false;
            system.registerHook('sunLeveledUp', () => { called = true; });
            system.levelUpSun(sun.sunId);
            expect(called).toBe(true);
        });
    });

    describe('legendSun', () => {
        it('should set status to legendary', () => {
            const { sun } = system.recruitSun({});
            system.legendSun(sun.sunId);
            expect(sun.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSun('ghost');
            expect(result.error).toBe('SUN_NOT_FOUND');
        });

        it('should trigger sunLegendized hook', () => {
            const { sun } = system.recruitSun({});
            let called = false;
            system.registerHook('sunLegendized', () => { called = true; });
            system.legendSun(sun.sunId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSunValue', () => {
        it('should calculate value', () => {
            const { sun } = system.recruitSun({});
            system.addFlare(sun.sunId, 'flare-1');
            // level=1, radiance=20 (default baseRadiance), flares=1
            // 1*100 + 20*2 + 1*30 = 100 + 40 + 30 = 170
            expect(system.calculateSunValue(sun.sunId)).toBe(170);
        });

        it('should reflect level and radiance changes', () => {
            const { sun } = system.recruitSun({});
            system.levelUpSun(sun.sunId);
            system.raiseRadiance(sun.sunId, 10);
            // level=2, radiance=30, flares=0
            // 2*100 + 30*2 + 0*30 = 200 + 60 + 0 = 260
            expect(system.calculateSunValue(sun.sunId)).toBe(260);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSunValue('ghost')).toBe(0);
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

        it('should default context to empty object', () => {
            system.registerTool('test', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('test', null);
            expect(result.result).toBe(0);
        });

        it('should execute default getSun', () => {
            const result = system.executeTool('getSun', { sunId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitSun', () => {
            const result = system.executeTool('recruitSun', { name: 'ToolSun' });
            expect(result.success).toBe(true);
            expect(result.result.sun.name).toBe('ToolSun');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('sunRecruited', () => count++);
            unregister();
            system.recruitSun({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('sunRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSun({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSuns = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalSuns = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSun({});
            const json = system.toJSON();
            expect(json.suns.length).toBe(1);
            expect(json.stats.totalSuns).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSun({});
            const json = system.toJSON();
            const newSys = new CultivationSun();
            newSys.fromJSON(json);
            expect(newSys.suns.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.sunCount).toBe(0);
            expect(stats.totalSuns).toBe(0);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
