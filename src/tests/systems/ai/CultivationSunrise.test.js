/**
 * CultivationSunrise.test.js - 修真日出测试
 * V813 Iteration 16/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSunrise } from '../../../systems/ai/CultivationSunrise.js';

describe('CultivationSunrise', () => {
    let system;
    beforeEach(() => { system = new CultivationSunrise(); });

    describe('recruitSunrise', () => {
        it('should recruit a sunrise', () => {
            const { sunrise } = system.recruitSunrise({ masterId: 'm1', name: 'Dawn Break', type: 'silver' });
            expect(sunrise.masterId).toBe('m1');
            expect(sunrise.name).toBe('Dawn Break');
            expect(sunrise.type).toBe('silver');
            expect(sunrise.status).toBe('novice');
            expect(sunrise.level).toBe(1);
        });

        it('should use defaults when not provided', () => {
            const { sunrise } = system.recruitSunrise({});
            expect(sunrise.name).toBe('Unnamed Sunrise');
            expect(sunrise.type).toBe('golden');
            expect(sunrise.glow).toBe(20);
            expect(sunrise.rays).toEqual([]);
        });

        it('should generate id if not provided', () => {
            const { sunrise } = system.recruitSunrise({});
            expect(sunrise.sunriseId).toBeTruthy();
            expect(typeof sunrise.sunriseId).toBe('string');
        });

        it('should use provided sunriseId', () => {
            const { sunrise } = system.recruitSunrise({ sunriseId: 'custom-sunrise-1' });
            expect(sunrise.sunriseId).toBe('custom-sunrise-1');
        });

        it('should trigger sunriseRecruited hook', () => {
            let called = false;
            system.registerHook('sunriseRecruited', () => { called = true; });
            system.recruitSunrise({});
            expect(called).toBe(true);
        });

        it('should increment totalSunrises stat', () => {
            expect(system.stats.totalSunrises).toBe(0);
            system.recruitSunrise({});
            expect(system.stats.totalSunrises).toBe(1);
            system.recruitSunrise({});
            expect(system.stats.totalSunrises).toBe(2);
        });
    });

    describe('getSunrise', () => {
        it('should return a sunrise', () => {
            const { sunrise } = system.recruitSunrise({});
            expect(system.getSunrise(sunrise.sunriseId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getSunrise('ghost')).toBeNull();
        });
    });

    describe('listSunrises', () => {
        it('should list all', () => {
            system.recruitSunrise({});
            system.recruitSunrise({});
            expect(system.listSunrises().length).toBe(2);
        });

        it('should return empty list when empty', () => {
            expect(system.listSunrises().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitSunrise({ masterId: 'm1' });
            system.recruitSunrise({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty when no match', () => {
            system.recruitSunrise({ masterId: 'm1' });
            expect(system.listByMaster('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { sunrise: s1 } = system.recruitSunrise({});
            system.recruitSunrise({});
            system.legendSunrise(s1.sunriseId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendary', () => {
            system.recruitSunrise({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addRay', () => {
        it('should add ray', () => {
            const { sunrise } = system.recruitSunrise({});
            system.addRay(sunrise.sunriseId, 'morning-ray-1');
            expect(sunrise.rays.length).toBe(1);
            expect(sunrise.rays[0]).toBe('morning-ray-1');
        });

        it('should reject missing', () => {
            const result = system.addRay('ghost', 'x');
            expect(result.error).toBe('SUNRISE_NOT_FOUND');
        });

        it('should trigger rayAdded hook', () => {
            const { sunrise } = system.recruitSunrise({});
            let called = false;
            system.registerHook('rayAdded', () => { called = true; });
            system.addRay(sunrise.sunriseId, 'aurora-ray');
            expect(called).toBe(true);
        });
    });

    describe('raiseGlow', () => {
        it('should raise glow', () => {
            const { sunrise } = system.recruitSunrise({});
            system.raiseGlow(sunrise.sunriseId, 10);
            expect(sunrise.glow).toBe(30);
        });

        it('should use default amount of 5', () => {
            const { sunrise } = system.recruitSunrise({});
            system.raiseGlow(sunrise.sunriseId);
            expect(sunrise.glow).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseGlow('ghost', 5);
            expect(result.error).toBe('SUNRISE_NOT_FOUND');
        });

        it('should trigger glowRaised hook', () => {
            const { sunrise } = system.recruitSunrise({});
            let called = false;
            system.registerHook('glowRaised', () => { called = true; });
            system.raiseGlow(sunrise.sunriseId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSunrise', () => {
        it('should level up', () => {
            const { sunrise } = system.recruitSunrise({});
            system.levelUpSunrise(sunrise.sunriseId);
            expect(sunrise.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpSunrise('ghost');
            expect(result.error).toBe('SUNRISE_NOT_FOUND');
        });

        it('should trigger sunriseLeveledUp hook', () => {
            const { sunrise } = system.recruitSunrise({});
            let called = false;
            system.registerHook('sunriseLeveledUp', () => { called = true; });
            system.levelUpSunrise(sunrise.sunriseId);
            expect(called).toBe(true);
        });
    });

    describe('legendSunrise', () => {
        it('should set status to legendary', () => {
            const { sunrise } = system.recruitSunrise({});
            system.legendSunrise(sunrise.sunriseId);
            expect(sunrise.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSunrise('ghost');
            expect(result.error).toBe('SUNRISE_NOT_FOUND');
        });

        it('should trigger sunriseLegendized hook', () => {
            const { sunrise } = system.recruitSunrise({});
            let called = false;
            system.registerHook('sunriseLegendized', () => { called = true; });
            system.legendSunrise(sunrise.sunriseId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSunriseValue', () => {
        it('should calculate value', () => {
            const { sunrise } = system.recruitSunrise({});
            system.addRay(sunrise.sunriseId, 'ray-1');
            // level=1, glow=20 (default baseGlow), rays=1
            // 1*100 + 20*2 + 1*30 = 100 + 40 + 30 = 170
            expect(system.calculateSunriseValue(sunrise.sunriseId)).toBe(170);
        });

        it('should reflect level and glow changes', () => {
            const { sunrise } = system.recruitSunrise({});
            system.levelUpSunrise(sunrise.sunriseId);
            system.raiseGlow(sunrise.sunriseId, 10);
            // level=2, glow=30, rays=0
            // 2*100 + 30*2 + 0*30 = 200 + 60 + 0 = 260
            expect(system.calculateSunriseValue(sunrise.sunriseId)).toBe(260);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSunriseValue('ghost')).toBe(0);
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

        it('should execute default getSunrise', () => {
            const result = system.executeTool('getSunrise', { sunriseId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitSunrise', () => {
            const result = system.executeTool('recruitSunrise', { name: 'ToolSunrise' });
            expect(result.success).toBe(true);
            expect(result.result.sunrise.name).toBe('ToolSunrise');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('sunriseRecruited', () => count++);
            unregister();
            system.recruitSunrise({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('sunriseRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSunrise({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSunrises = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalSunrises = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSunrise({});
            const json = system.toJSON();
            expect(json.sunrises.length).toBe(1);
            expect(json.stats.totalSunrises).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSunrise({});
            const json = system.toJSON();
            const newSys = new CultivationSunrise();
            newSys.fromJSON(json);
            expect(newSys.sunrises.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.sunriseCount).toBe(0);
            expect(stats.totalSunrises).toBe(0);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
