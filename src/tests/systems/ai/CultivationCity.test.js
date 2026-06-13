/**
 * CultivationCity.test.js - 修真城测试
 * V589 Iteration 12/20 Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationCity } from '../../../systems/ai/CultivationCity.js';

describe('CultivationCity', () => {
    let system;
    beforeEach(() => { system = new CultivationCity(); });

    describe('buildCity', () => {
        it('should build', () => {
            const { city } = system.buildCity({ mayorId: 'm1', name: 'Skyreach', type: 'capital' });
            expect(city.mayorId).toBe('m1');
            expect(city.name).toBe('Skyreach');
            expect(city.type).toBe('capital');
        });

        it('should default to cultivation type and thriving status', () => {
            const { city } = system.buildCity({ mayorId: 'm1', name: 'Haven' });
            expect(city.type).toBe('cultivation');
            expect(city.status).toBe('thriving');
            expect(city.population).toBe(10000);
            expect(city.level).toBe(1);
        });

        it('should accept custom population and districts', () => {
            const { city } = system.buildCity({ mayorId: 'm1', name: 'Port', type: 'port', population: 5000, districts: ['d1', 'd2'] });
            expect(city.population).toBe(5000);
            expect(city.districts.length).toBe(2);
        });

        it('should trigger cityBuilt hook', () => {
            let called = false;
            system.registerHook('cityBuilt', () => { called = true; });
            system.buildCity({ mayorId: 'm1', name: 'X' });
            expect(called).toBe(true);
        });
    });

    describe('getCity', () => {
        it('should return', () => {
            const { city } = system.buildCity({ mayorId: 'm1', name: 'X' });
            expect(system.getCity(city.cityId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCity('ghost')).toBeNull(); });
    });

    describe('listCities', () => {
        it('should list all', () => {
            system.buildCity({ mayorId: 'm1', name: 'A' });
            system.buildCity({ mayorId: 'm2', name: 'B' });
            expect(system.listCities().length).toBe(2);
        });
    });

    describe('listByMayor', () => {
        it('should filter by mayor', () => {
            system.buildCity({ mayorId: 'm1', name: 'A' });
            system.buildCity({ mayorId: 'm2', name: 'B' });
            system.buildCity({ mayorId: 'm1', name: 'C' });
            expect(system.listByMayor('m1').length).toBe(2);
        });
    });

    describe('listEternal', () => {
        it('should filter by eternal status', () => {
            const { city } = system.buildCity({ mayorId: 'm1', name: 'A' });
            system.buildCity({ mayorId: 'm2', name: 'B' });
            system.eternalizeCity(city.cityId);
            expect(system.listEternal().length).toBe(1);
        });
    });

    describe('addDistrict', () => {
        it('should add district', () => {
            const { city } = system.buildCity({ mayorId: 'm1', name: 'A' });
            system.addDistrict(city.cityId, 'Market District');
            expect(city.districts.length).toBe(1);
            expect(city.districts[0]).toBe('Market District');
        });

        it('should reject missing', () => {
            const result = system.addDistrict('ghost', 'd');
            expect(result.error).toBe('CITY_NOT_FOUND');
        });

        it('should trigger districtAdded hook', () => {
            const { city } = system.buildCity({ mayorId: 'm1', name: 'A' });
            let called = false;
            system.registerHook('districtAdded', () => { called = true; });
            system.addDistrict(city.cityId, 'Temple District');
            expect(called).toBe(true);
        });
    });

    describe('growPopulation', () => {
        it('should grow by amount', () => {
            const { city } = system.buildCity({ mayorId: 'm1', name: 'A' });
            system.growPopulation(city.cityId, 500);
            expect(city.population).toBe(10500);
        });

        it('should use default amount of 5', () => {
            const { city } = system.buildCity({ mayorId: 'm1', name: 'A' });
            system.growPopulation(city.cityId);
            expect(city.population).toBe(10005);
        });

        it('should reject missing', () => {
            const result = system.growPopulation('ghost', 100);
            expect(result.error).toBe('CITY_NOT_FOUND');
        });

        it('should trigger populationGrown hook', () => {
            const { city } = system.buildCity({ mayorId: 'm1', name: 'A' });
            let called = false;
            system.registerHook('populationGrown', () => { called = true; });
            system.growPopulation(city.cityId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpCity', () => {
        it('should level up', () => {
            const { city } = system.buildCity({ mayorId: 'm1', name: 'A' });
            system.levelUpCity(city.cityId);
            expect(city.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpCity('ghost');
            expect(result.error).toBe('CITY_NOT_FOUND');
        });

        it('should trigger cityLeveledUp hook', () => {
            const { city } = system.buildCity({ mayorId: 'm1', name: 'A' });
            let called = false;
            system.registerHook('cityLeveledUp', () => { called = true; });
            system.levelUpCity(city.cityId);
            expect(called).toBe(true);
        });
    });

    describe('eternalizeCity', () => {
        it('should set status to eternal', () => {
            const { city } = system.buildCity({ mayorId: 'm1', name: 'A' });
            system.eternalizeCity(city.cityId);
            expect(city.status).toBe('eternal');
        });

        it('should reject missing', () => {
            const result = system.eternalizeCity('ghost');
            expect(result.error).toBe('CITY_NOT_FOUND');
        });

        it('should trigger cityEternalized hook', () => {
            const { city } = system.buildCity({ mayorId: 'm1', name: 'A' });
            let called = false;
            system.registerHook('cityEternalized', () => { called = true; });
            system.eternalizeCity(city.cityId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCityValue', () => {
        it('should calculate value', () => {
            const { city } = system.buildCity({ mayorId: 'm1', name: 'A' });
            system.levelUpCity(city.cityId);
            system.levelUpCity(city.cityId);
            system.addDistrict(city.cityId, 'd1');
            system.addDistrict(city.cityId, 'd2');
            system.addDistrict(city.cityId, 'd3');
            // level=3, population=10000, districts.length=3 => 3*100 + 10000*2 + 3*30 = 300 + 20000 + 90 = 20390
            expect(system.calculateCityValue(city.cityId)).toBe(20390);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCityValue('ghost')).toBe(0);
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

        it('should execute default getCity', () => {
            const result = system.executeTool('getCity', { cityId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('cityBuilt', () => count++);
            unregister();
            system.buildCity({ mayorId: 'm1', name: 'X' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('cityBuilt', () => { throw new Error('x'); });
            expect(() => system.buildCity({ mayorId: 'm1', name: 'X' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCities = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCities = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.buildCity({ mayorId: 'm1', name: 'A' });
            const json = system.toJSON();
            expect(json.cities.length).toBe(1);
        });
        it('should deserialize', () => {
            system.buildCity({ mayorId: 'm1', name: 'A' });
            const json = system.toJSON();
            const newSys = new CultivationCity();
            newSys.fromJSON(json);
            expect(newSys.cities.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.cityCount).toBe(0);
        });
    });
});
