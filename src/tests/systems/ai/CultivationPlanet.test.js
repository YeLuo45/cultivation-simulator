/**
 * CultivationPlanet.test.js - 修真行星系统测试
 * V687 Iteration 10/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationPlanet } from '../../../systems/ai/CultivationPlanet.js';

describe('CultivationPlanet', () => {
    let system;
    beforeEach(() => { system = new CultivationPlanet(); });

    describe('recruitPlanet', () => {
        it('should create', () => {
            const { planet } = system.recruitPlanet({ masterId: 'm1' });
            expect(planet.masterId).toBe('m1');
        });

        it('should set defaults', () => {
            const { planet } = system.recruitPlanet({});
            expect(planet.name).toBe('Unnamed Planet');
            expect(planet.type).toBe('rocky');
            expect(planet.mass).toBe(20);
            expect(planet.level).toBe(1);
            expect(planet.status).toBe('novice');
            expect(planet.moons).toEqual([]);
        });

        it('should accept custom values', () => {
            const { planet } = system.recruitPlanet({ name: 'Mars', type: 'gas', mass: 100 });
            expect(planet.name).toBe('Mars');
            expect(planet.type).toBe('gas');
            expect(planet.mass).toBe(100);
        });

        it('should trigger planetRecruited hook', () => {
            let called = false;
            system.registerHook('planetRecruited', () => { called = true; });
            system.recruitPlanet({});
            expect(called).toBe(true);
        });
    });

    describe('getPlanet', () => {
        it('should return planet', () => {
            const { planet } = system.recruitPlanet({});
            expect(system.getPlanet(planet.planetId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getPlanet('ghost')).toBeNull();
        });
    });

    describe('listPlanets', () => {
        it('should list all', () => {
            system.recruitPlanet({});
            system.recruitPlanet({});
            expect(system.listPlanets().length).toBe(2);
        });

        it('should return empty', () => {
            expect(system.listPlanets().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitPlanet({ masterId: 'm1' });
            system.recruitPlanet({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitPlanet({ masterId: 'm1' });
            expect(system.listByMaster('m99').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { planet } = system.recruitPlanet({});
            system.legendPlanet(planet.planetId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitPlanet({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addMoon', () => {
        it('should add a moon', () => {
            const { planet } = system.recruitPlanet({});
            system.addMoon(planet.planetId, { name: 'Luna' });
            expect(planet.moons.length).toBe(1);
            expect(planet.moons[0].name).toBe('Luna');
        });

        it('should reject missing planet', () => {
            const result = system.addMoon('ghost', {});
            expect(result.error).toBe('PLANET_NOT_FOUND');
        });

        it('should trigger moonAdded hook', () => {
            const { planet } = system.recruitPlanet({});
            let called = false;
            system.registerHook('moonAdded', () => { called = true; });
            system.addMoon(planet.planetId, {});
            expect(called).toBe(true);
        });
    });

    describe('raiseMass', () => {
        it('should raise mass', () => {
            const { planet } = system.recruitPlanet({});
            system.raiseMass(planet.planetId, 10);
            expect(planet.mass).toBe(30);
        });

        it('should default amount to 5', () => {
            const { planet } = system.recruitPlanet({});
            system.raiseMass(planet.planetId);
            expect(planet.mass).toBe(25);
        });

        it('should reject missing planet', () => {
            const result = system.raiseMass('ghost', 5);
            expect(result.error).toBe('PLANET_NOT_FOUND');
        });

        it('should trigger massRaised hook', () => {
            const { planet } = system.recruitPlanet({});
            let called = false;
            system.registerHook('massRaised', () => { called = true; });
            system.raiseMass(planet.planetId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpPlanet', () => {
        it('should level up', () => {
            const { planet } = system.recruitPlanet({});
            system.levelUpPlanet(planet.planetId);
            expect(planet.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpPlanet('ghost');
            expect(result.error).toBe('PLANET_NOT_FOUND');
        });

        it('should trigger planetLeveledUp hook', () => {
            const { planet } = system.recruitPlanet({});
            let called = false;
            system.registerHook('planetLeveledUp', () => { called = true; });
            system.levelUpPlanet(planet.planetId);
            expect(called).toBe(true);
        });
    });

    describe('legendPlanet', () => {
        it('should legendize', () => {
            const { planet } = system.recruitPlanet({});
            system.legendPlanet(planet.planetId);
            expect(planet.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendPlanet('ghost');
            expect(result.error).toBe('PLANET_NOT_FOUND');
        });

        it('should trigger planetLegendized hook', () => {
            const { planet } = system.recruitPlanet({});
            let called = false;
            system.registerHook('planetLegendized', () => { called = true; });
            system.legendPlanet(planet.planetId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePlanetValue', () => {
        it('should calculate value', () => {
            const { planet } = system.recruitPlanet({ mass: 50 });
            system.addMoon(planet.planetId, {});
            system.levelUpPlanet(planet.planetId);
            // level=2, mass=50, moons=1 => 200 + 100 + 30 = 330
            expect(system.calculatePlanetValue(planet.planetId)).toBe(330);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePlanetValue('ghost')).toBe(0);
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

        it('should execute default getPlanet', () => {
            const result = system.executeTool('getPlanet', { planetId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('planetRecruited', () => count++);
            unregister();
            system.recruitPlanet({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('planetRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitPlanet({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalPlanets = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalPlanets = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitPlanet({});
            const json = system.toJSON();
            expect(json.planets.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitPlanet({});
            const json = system.toJSON();
            const newSys = new CultivationPlanet();
            newSys.fromJSON(json);
            expect(newSys.planets.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.planetCount).toBe(0);
        });
    });
});
