/**
 * CultivationMoon.test.js - 修真月系统测试
 * V684 Iteration 7/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMoon } from '../../../systems/ai/CultivationMoon.js';

describe('CultivationMoon', () => {
    let system;
    beforeEach(() => { system = new CultivationMoon(); });

    describe('recruitMoon', () => {
        it('should recruit a moon', () => {
            const { moon } = system.recruitMoon({ masterId: 'm1', name: 'Luna' });
            expect(moon.masterId).toBe('m1');
            expect(moon.name).toBe('Luna');
        });

        it('should default type to crescent', () => {
            const { moon } = system.recruitMoon({ masterId: 'm1' });
            expect(moon.type).toBe('crescent');
        });

        it('should accept full and new types', () => {
            const { moon: full } = system.recruitMoon({ type: 'full' });
            const { moon: newMoon } = system.recruitMoon({ type: 'new' });
            expect(full.type).toBe('full');
            expect(newMoon.type).toBe('new');
        });

        it('should default name to Unnamed Moon', () => {
            const { moon } = system.recruitMoon({ masterId: 'm1' });
            expect(moon.name).toBe('Unnamed Moon');
        });

        it('should default luminosity to baseLuminosity (20)', () => {
            const { moon } = system.recruitMoon({ masterId: 'm1' });
            expect(moon.luminosity).toBe(20);
        });

        it('should accept custom luminosity', () => {
            const { moon } = system.recruitMoon({ luminosity: 50 });
            expect(moon.luminosity).toBe(50);
        });

        it('should default phases to empty array', () => {
            const { moon } = system.recruitMoon({});
            expect(moon.phases).toEqual([]);
        });

        it('should accept custom phases', () => {
            const { moon } = system.recruitMoon({ phases: ['waxing', 'full'] });
            expect(moon.phases).toEqual(['waxing', 'full']);
        });

        it('should set level to 1', () => {
            const { moon } = system.recruitMoon({});
            expect(moon.level).toBe(1);
        });

        it('should set status to novice', () => {
            const { moon } = system.recruitMoon({});
            expect(moon.status).toBe('novice');
        });

        it('should trigger moonRecruited hook', () => {
            let called = false;
            system.registerHook('moonRecruited', () => { called = true; });
            system.recruitMoon({});
            expect(called).toBe(true);
        });

        it('should generate moonId when not provided', () => {
            const { moon } = system.recruitMoon({});
            expect(moon.moonId).toBeDefined();
            expect(typeof moon.moonId).toBe('string');
        });

        it('should use provided moonId', () => {
            const { moon } = system.recruitMoon({ moonId: 'mon_custom' });
            expect(moon.moonId).toBe('mon_custom');
        });
    });

    describe('getMoon', () => {
        it('should return moon by id', () => {
            const { moon } = system.recruitMoon({});
            expect(system.getMoon(moon.moonId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getMoon('ghost')).toBeNull();
        });

        it('should return a copy (not reference)', () => {
            const { moon } = system.recruitMoon({});
            const retrieved = system.getMoon(moon.moonId);
            retrieved.name = 'Modified';
            expect(system.getMoon(moon.moonId).name).toBe('Unnamed Moon');
        });
    });

    describe('listMoons', () => {
        it('should list all moons', () => {
            system.recruitMoon({});
            system.recruitMoon({});
            expect(system.listMoons().length).toBe(2);
        });

        it('should return empty array when none', () => {
            expect(system.listMoons()).toEqual([]);
        });
    });

    describe('listByMaster', () => {
        it('should filter by masterId', () => {
            system.recruitMoon({ masterId: 'm1' });
            system.recruitMoon({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitMoon({ masterId: 'm1' });
            expect(system.listByMaster('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary moons', () => {
            const { moon: a } = system.recruitMoon({});
            const { moon: b } = system.recruitMoon({});
            system.legendMoon(a.moonId);
            expect(system.listLegendary().length).toBe(1);
            expect(b.status).toBe('novice');
        });

        it('should return empty when none legendary', () => {
            system.recruitMoon({});
            expect(system.listLegendary()).toEqual([]);
        });
    });

    describe('addPhase', () => {
        it('should add phase to moon', () => {
            const { moon } = system.recruitMoon({});
            const result = system.addPhase(moon.moonId, 'waxing');
            expect(result.moon.phases).toContain('waxing');
        });

        it('should trigger phaseAdded hook', () => {
            const { moon } = system.recruitMoon({});
            let called = false;
            system.registerHook('phaseAdded', () => { called = true; });
            system.addPhase(moon.moonId, 'full');
            expect(called).toBe(true);
        });

        it('should reject missing moon', () => {
            const result = system.addPhase('ghost', 'waxing');
            expect(result.error).toBe('MOON_NOT_FOUND');
        });
    });

    describe('raiseLuminosity', () => {
        it('should raise luminosity by default 5', () => {
            const { moon } = system.recruitMoon({});
            system.raiseLuminosity(moon.moonId);
            expect(system.getMoon(moon.moonId).luminosity).toBe(25);
        });

        it('should raise luminosity by custom amount', () => {
            const { moon } = system.recruitMoon({});
            system.raiseLuminosity(moon.moonId, 10);
            expect(system.getMoon(moon.moonId).luminosity).toBe(30);
        });

        it('should trigger luminosityRaised hook', () => {
            const { moon } = system.recruitMoon({});
            let called = false;
            system.registerHook('luminosityRaised', () => { called = true; });
            system.raiseLuminosity(moon.moonId);
            expect(called).toBe(true);
        });

        it('should reject missing moon', () => {
            const result = system.raiseLuminosity('ghost');
            expect(result.error).toBe('MOON_NOT_FOUND');
        });
    });

    describe('levelUpMoon', () => {
        it('should increment level', () => {
            const { moon } = system.recruitMoon({});
            system.levelUpMoon(moon.moonId);
            expect(system.getMoon(moon.moonId).level).toBe(2);
        });

        it('should trigger moonLeveledUp hook', () => {
            const { moon } = system.recruitMoon({});
            let called = false;
            system.registerHook('moonLeveledUp', () => { called = true; });
            system.levelUpMoon(moon.moonId);
            expect(called).toBe(true);
        });

        it('should reject missing moon', () => {
            const result = system.levelUpMoon('ghost');
            expect(result.error).toBe('MOON_NOT_FOUND');
        });
    });

    describe('legendMoon', () => {
        it('should set status to legendary', () => {
            const { moon } = system.recruitMoon({});
            system.legendMoon(moon.moonId);
            expect(system.getMoon(moon.moonId).status).toBe('legendary');
        });

        it('should trigger moonLegendized hook', () => {
            const { moon } = system.recruitMoon({});
            let called = false;
            system.registerHook('moonLegendized', () => { called = true; });
            system.legendMoon(moon.moonId);
            expect(called).toBe(true);
        });

        it('should reject missing moon', () => {
            const result = system.legendMoon('ghost');
            expect(result.error).toBe('MOON_NOT_FOUND');
        });
    });

    describe('calculateMoonValue', () => {
        it('should calculate value correctly', () => {
            const { moon } = system.recruitMoon({});
            // level=1, luminosity=20, phases=[]  => 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateMoonValue(moon.moonId)).toBe(140);
        });

        it('should include phase count in value', () => {
            const { moon } = system.recruitMoon({});
            system.addPhase(moon.moonId, 'waxing');
            system.addPhase(moon.moonId, 'full');
            // level=1, luminosity=20, phases=2 => 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateMoonValue(moon.moonId)).toBe(200);
        });

        it('should scale with level', () => {
            const { moon } = system.recruitMoon({});
            system.levelUpMoon(moon.moonId);
            system.levelUpMoon(moon.moonId);
            // level=3, luminosity=20, phases=[] => 3*100 + 20*2 + 0 = 340
            expect(system.calculateMoonValue(moon.moonId)).toBe(340);
        });

        it('should return 0 for missing moon', () => {
            expect(system.calculateMoonValue('ghost')).toBe(0);
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

        it('should execute default getMoon', () => {
            const result = system.executeTool('getMoon', { moonId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('moonRecruited', () => count++);
            unregister();
            system.recruitMoon({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('moonRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitMoon({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient moons', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when totalMoons >= 5', () => {
            system.stats.totalMoons = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalMoons = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitMoon({});
            const json = system.toJSON();
            expect(json.moons.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitMoon({});
            const json = system.toJSON();
            const newSys = new CultivationMoon();
            newSys.fromJSON(json);
            expect(newSys.moons.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with moonCount', () => {
            const stats = system.getStats();
            expect(stats.moonCount).toBe(0);
            expect(stats.totalMoons).toBe(0);
        });
    });
});
