/**
 * CultivationCountry.test.js - 修真国系统测试
 * V588 Iteration 11/20 Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationCountry } from '../../../systems/ai/CultivationCountry.js';

describe('CultivationCountry', () => {
    let system;
    beforeEach(() => { system = new CultivationCountry(); });

    describe('foundCountry', () => {
        it('should found', () => {
            const { country } = system.foundCountry({ sovereignId: 's1', name: '青云国' });
            expect(country.sovereignId).toBe('s1');
            expect(country.name).toBe('青云国');
        });

        it('should default regions to empty array', () => {
            const { country } = system.foundCountry({});
            expect(country.regions).toEqual([]);
        });

        it('should set status to forming', () => {
            const { country } = system.foundCountry({});
            expect(country.status).toBe('forming');
        });

        it('should default power from config', () => {
            const { country } = system.foundCountry({});
            expect(country.power).toBe(20);
        });

        it('should accept custom power', () => {
            const { country } = system.foundCountry({ power: 80 });
            expect(country.power).toBe(80);
        });

        it('should generate countryId', () => {
            const { country } = system.foundCountry({});
            expect(country.countryId).toBeTruthy();
        });

        it('should accept custom regions', () => {
            const { country } = system.foundCountry({ regions: ['r1', 'r2', 'r3'] });
            expect(country.regions.length).toBe(3);
        });

        it('should default type to kingdom', () => {
            const { country } = system.foundCountry({});
            expect(country.type).toBe('kingdom');
        });

        it('should accept custom type empire', () => {
            const { country } = system.foundCountry({ type: 'empire' });
            expect(country.type).toBe('empire');
        });

        it('should accept custom type republic', () => {
            const { country } = system.foundCountry({ type: 'republic' });
            expect(country.type).toBe('republic');
        });

        it('should default level to 1', () => {
            const { country } = system.foundCountry({});
            expect(country.level).toBe(1);
        });

        it('should trigger countryFound hook', () => {
            let called = false;
            system.registerHook('countryFound', () => { called = true; });
            system.foundCountry({});
            expect(called).toBe(true);
        });
    });

    describe('getCountry', () => {
        it('should return country', () => {
            const { country } = system.foundCountry({});
            expect(system.getCountry(country.countryId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCountry('ghost')).toBeNull(); });
    });

    describe('listCountries', () => {
        it('should list all', () => {
            system.foundCountry({});
            system.foundCountry({});
            system.foundCountry({});
            expect(system.listCountries().length).toBe(3);
        });

        it('should return empty initially', () => {
            expect(system.listCountries().length).toBe(0);
        });
    });

    describe('listBySovereign', () => {
        it('should filter by sovereign', () => {
            system.foundCountry({ sovereignId: 's1' });
            system.foundCountry({ sovereignId: 's2' });
            system.foundCountry({ sovereignId: 's1' });
            expect(system.listBySovereign('s1').length).toBe(2);
        });

        it('should return empty for unknown sovereign', () => {
            system.foundCountry({});
            expect(system.listBySovereign('ghost').length).toBe(0);
        });
    });

    describe('listStable', () => {
        it('should filter stable status', () => {
            const { country: c1 } = system.foundCountry({ regions: ['r1'] });
            const { country: c2 } = system.foundCountry({});
            system.increasePower(c1.countryId, 5); // c1 becomes stable
            c2.status = 'forming';
            expect(system.listStable().length).toBe(1);
        });

        it('should include eternal status', () => {
            const { country } = system.foundCountry({ regions: ['r1'] });
            system.increasePower(country.countryId, 5);
            system.eternizeCountry(country.countryId);
            expect(system.listStable().length).toBe(1);
        });

        it('should return empty when no stable', () => {
            system.foundCountry({});
            expect(system.listStable().length).toBe(0);
        });
    });

    describe('addRegion', () => {
        it('should add region to regions array', () => {
            const { country } = system.foundCountry({});
            system.addRegion(country.countryId, 'r1');
            expect(country.regions.length).toBe(1);
            expect(country.regions[0]).toBe('r1');
        });

        it('should add multiple regions', () => {
            const { country } = system.foundCountry({});
            system.addRegion(country.countryId, 'r1');
            system.addRegion(country.countryId, 'r2');
            system.addRegion(country.countryId, 'r3');
            expect(country.regions.length).toBe(3);
        });

        it('should reject missing country', () => {
            const result = system.addRegion('ghost', 'r1');
            expect(result.error).toBe('COUNTRY_NOT_FOUND');
        });

        it('should trigger regionAdded hook', () => {
            const { country } = system.foundCountry({});
            let called = false;
            system.registerHook('regionAdded', () => { called = true; });
            system.addRegion(country.countryId, 'r1');
            expect(called).toBe(true);
        });
    });

    describe('increasePower', () => {
        it('should increase power by amount', () => {
            const { country } = system.foundCountry({});
            system.increasePower(country.countryId, 30);
            expect(country.power).toBe(50);
        });

        it('should use default amount of 5', () => {
            const { country } = system.foundCountry({});
            system.increasePower(country.countryId);
            expect(country.power).toBe(25);
        });

        it('should set status to stable when regions exist', () => {
            const { country } = system.foundCountry({ regions: ['r1'] });
            system.increasePower(country.countryId, 5);
            expect(country.status).toBe('stable');
        });

        it('should not change status if no regions', () => {
            const { country } = system.foundCountry({});
            system.increasePower(country.countryId, 5);
            expect(country.status).toBe('forming');
        });

        it('should reject missing country', () => {
            const result = system.increasePower('ghost', 10);
            expect(result.error).toBe('COUNTRY_NOT_FOUND');
        });

        it('should trigger powerIncreased hook', () => {
            const { country } = system.foundCountry({});
            let called = false;
            system.registerHook('powerIncreased', () => { called = true; });
            system.increasePower(country.countryId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpCountry', () => {
        it('should increment level by 1', () => {
            const { country } = system.foundCountry({});
            system.levelUpCountry(country.countryId);
            expect(country.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { country } = system.foundCountry({});
            system.levelUpCountry(country.countryId);
            system.levelUpCountry(country.countryId);
            system.levelUpCountry(country.countryId);
            expect(country.level).toBe(4);
        });

        it('should reject missing country', () => {
            const result = system.levelUpCountry('ghost');
            expect(result.error).toBe('COUNTRY_NOT_FOUND');
        });

        it('should trigger countryLeveledUp hook', () => {
            const { country } = system.foundCountry({});
            let called = false;
            system.registerHook('countryLeveledUp', () => { called = true; });
            system.levelUpCountry(country.countryId);
            expect(called).toBe(true);
        });
    });

    describe('eternizeCountry', () => {
        it('should set status to eternal', () => {
            const { country } = system.foundCountry({});
            system.eternizeCountry(country.countryId);
            expect(country.status).toBe('eternal');
        });

        it('should reject missing country', () => {
            const result = system.eternizeCountry('ghost');
            expect(result.error).toBe('COUNTRY_NOT_FOUND');
        });

        it('should trigger countryEternalized hook', () => {
            const { country } = system.foundCountry({});
            let called = false;
            system.registerHook('countryEternalized', () => { called = true; });
            system.eternizeCountry(country.countryId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCountryValue', () => {
        it('should calculate value = level * 100 + power * 2 + regions.length * 30', () => {
            const { country } = system.foundCountry({ power: 20, regions: ['r1', 'r2'] });
            system.levelUpCountry(country.countryId); // level=2
            // 2 * 100 + 20 * 2 + 2 * 30 = 200 + 40 + 60 = 300
            expect(system.calculateCountryValue(country.countryId)).toBe(300);
        });

        it('should calculate with no regions', () => {
            const { country } = system.foundCountry({ power: 20 });
            // 1 * 100 + 20 * 2 + 0 * 30 = 100 + 40 + 0 = 140
            expect(system.calculateCountryValue(country.countryId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCountryValue('ghost')).toBe(0);
        });

        it('should increase value when regions added', () => {
            const { country } = system.foundCountry({ power: 20 });
            const before = system.calculateCountryValue(country.countryId);
            system.addRegion(country.countryId, 'r1');
            const after = system.calculateCountryValue(country.countryId);
            expect(after - before).toBe(30);
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

        it('should execute default getCountry', () => {
            const result = system.executeTool('getCountry', { countryId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle missing context gracefully', () => {
            system.registerTool('echo', (ctx) => ctx);
            const result = system.executeTool('echo');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('countryFound', () => count++);
            unregister();
            system.foundCountry({});
            expect(count).toBe(0);
        });

        it('should handle unregister when handler not in array', () => {
            const handler = () => {};
            const unregister = system.registerHook('countryFound', handler);
            // Manually remove handler to force idx === -1 branch
            system.hooks.get('countryFound').splice(0, 1);
            expect(() => unregister()).not.toThrow();
        });

        it('should handle unregister when event map entry missing', () => {
            const handler = () => {};
            const unregister = system.registerHook('countryFound', handler);
            // Remove the event entry entirely
            system.hooks.delete('countryFound');
            expect(() => unregister()).not.toThrow();
        });

        it('should handle errors silently', () => {
            system.registerHook('countryFound', () => { throw new Error('x'); });
            expect(() => system.foundCountry({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCountries = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCountries = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.foundCountry({});
            const json = system.toJSON();
            expect(json.countries.length).toBe(1);
        });
        it('should deserialize', () => {
            system.foundCountry({});
            const json = system.toJSON();
            const newSys = new CultivationCountry();
            newSys.fromJSON(json);
            expect(newSys.countries.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.countryCount).toBe(0);
        });
    });
});
