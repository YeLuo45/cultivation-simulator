/**
 * CultivationContinent.test.js - 修真大陆测试
 * V587 Iteration 10/20 Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationContinent } from '../../../systems/ai/CultivationContinent.js';

describe('CultivationContinent', () => {
    let system;
    beforeEach(() => { system = new CultivationContinent(); });

    describe('openContinent', () => {
        it('should open', () => {
            const { continent } = system.openContinent({ governorId: 'g1', name: 'Eastern Realm' });
            expect(continent.governorId).toBe('g1');
            expect(continent.name).toBe('Eastern Realm');
            expect(continent.type).toBe('eastern');
            expect(continent.status).toBe('forming');
            expect(continent.level).toBe(1);
            expect(continent.area).toBe(1000);
        });

        it('should accept custom type and area', () => {
            const { continent } = system.openContinent({ governorId: 'g1', type: 'western', area: 5000 });
            expect(continent.type).toBe('western');
            expect(continent.area).toBe(5000);
        });

        it('should trigger continentOpened hook', () => {
            let called = false;
            system.registerHook('continentOpened', () => { called = true; });
            system.openContinent({});
            expect(called).toBe(true);
        });

        it('should auto-generate id when not provided', () => {
            const { continent } = system.openContinent({});
            expect(continent.continentId).toBeDefined();
            expect(continent.continentId).toMatch(/^cnt_/);
        });
    });

    describe('getContinent', () => {
        it('should return', () => {
            const { continent } = system.openContinent({});
            expect(system.getContinent(continent.continentId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getContinent('ghost')).toBeNull(); });
        it('should return a copy, not a reference', () => {
            const { continent } = system.openContinent({ name: 'Realm' });
            const fetched = system.getContinent(continent.continentId);
            fetched.name = 'Mutated';
            expect(system.getContinent(continent.continentId).name).toBe('Realm');
        });
    });

    describe('listContinents', () => {
        it('should list all', () => {
            system.openContinent({});
            system.openContinent({});
            expect(system.listContinents().length).toBe(2);
        });
        it('should return empty when no continents', () => {
            expect(system.listContinents().length).toBe(0);
        });
    });

    describe('listByGovernor', () => {
        it('should filter', () => {
            system.openContinent({ governorId: 'g1' });
            system.openContinent({ governorId: 'g2' });
            expect(system.listByGovernor('g1').length).toBe(1);
        });
        it('should return empty for unknown governor', () => {
            system.openContinent({ governorId: 'g1' });
            expect(system.listByGovernor('unknown').length).toBe(0);
        });
    });

    describe('listStable', () => {
        it('should filter stable and eternal', () => {
            const { continent: c1 } = system.openContinent({});
            const { continent: c2 } = system.openContinent({});
            const { continent: c3 } = system.openContinent({});
            c2.status = 'stable';
            system.eternizeContinent(c3.continentId);
            const stable = system.listStable();
            expect(stable.length).toBe(2);
            expect(stable.map(c => c.continentId)).toContain(c2.continentId);
            expect(stable.map(c => c.continentId)).toContain(c3.continentId);
        });

        it('should not include forming continents', () => {
            system.openContinent({});
            expect(system.listStable().length).toBe(0);
        });
    });

    describe('addNation', () => {
        it('should add nation', () => {
            const { continent } = system.openContinent({});
            system.addNation(continent.continentId, { name: 'Yan Kingdom' });
            expect(continent.nations.length).toBe(1);
            expect(continent.nations[0].name).toBe('Yan Kingdom');
        });

        it('should reject missing', () => {
            const result = system.addNation('ghost', { name: 'X' });
            expect(result.error).toBe('CONTINENT_NOT_FOUND');
        });

        it('should trigger nationAdded hook', () => {
            const { continent } = system.openContinent({});
            let called = false;
            system.registerHook('nationAdded', () => { called = true; });
            system.addNation(continent.continentId, { name: 'Yan' });
            expect(called).toBe(true);
        });
    });

    describe('expandArea', () => {
        it('should expand with default amount', () => {
            const { continent } = system.openContinent({});
            system.expandArea(continent.continentId);
            expect(continent.area).toBe(1005);
        });

        it('should expand with custom amount', () => {
            const { continent } = system.openContinent({});
            system.expandArea(continent.continentId, 500);
            expect(continent.area).toBe(1500);
        });

        it('should reject missing', () => {
            const result = system.expandArea('ghost', 10);
            expect(result.error).toBe('CONTINENT_NOT_FOUND');
        });

        it('should trigger areaExpanded hook', () => {
            const { continent } = system.openContinent({});
            let called = false;
            system.registerHook('areaExpanded', () => { called = true; });
            system.expandArea(continent.continentId, 100);
            expect(called).toBe(true);
        });
    });

    describe('levelUpContinent', () => {
        it('should level up', () => {
            const { continent } = system.openContinent({});
            system.levelUpContinent(continent.continentId);
            expect(continent.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpContinent('ghost');
            expect(result.error).toBe('CONTINENT_NOT_FOUND');
        });

        it('should trigger continentLeveledUp hook', () => {
            const { continent } = system.openContinent({});
            let called = false;
            system.registerHook('continentLeveledUp', () => { called = true; });
            system.levelUpContinent(continent.continentId);
            expect(called).toBe(true);
        });
    });

    describe('eternizeContinent', () => {
        it('should eternize', () => {
            const { continent } = system.openContinent({});
            system.eternizeContinent(continent.continentId);
            expect(continent.status).toBe('eternal');
        });

        it('should reject missing', () => {
            const result = system.eternizeContinent('ghost');
            expect(result.error).toBe('CONTINENT_NOT_FOUND');
        });

        it('should trigger continentEternalized hook', () => {
            const { continent } = system.openContinent({});
            let called = false;
            system.registerHook('continentEternalized', () => { called = true; });
            system.eternizeContinent(continent.continentId);
            expect(called).toBe(true);
        });
    });

    describe('calculateContinentValue', () => {
        it('should calculate', () => {
            const { continent } = system.openContinent({});
            system.addNation(continent.continentId, { name: 'A' });
            system.addNation(continent.continentId, { name: 'B' });
            system.levelUpContinent(continent.continentId);
            // level 2*100 + area 1000*2 + nations 2*30 = 200+2000+60 = 2260
            expect(system.calculateContinentValue(continent.continentId)).toBe(2260);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateContinentValue('ghost')).toBe(0);
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

        it('should execute default getContinent', () => {
            const result = system.executeTool('getContinent', { continentId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default openContinent', () => {
            const result = system.executeTool('openContinent', { governorId: 'g1' });
            expect(result.result.success).toBe(true);
        });

        it('should execute tool with null context', () => {
            system.registerTool('nulltest', () => 'ok');
            const result = system.executeTool('nulltest', null);
            expect(result.result).toBe('ok');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('continentOpened', () => count++);
            unregister();
            system.openContinent({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('continentOpened', () => { throw new Error('x'); });
            expect(() => system.openContinent({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalContinents = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalContinents = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openContinent({});
            const json = system.toJSON();
            expect(json.continents.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openContinent({});
            const json = system.toJSON();
            const newSys = new CultivationContinent();
            newSys.fromJSON(json);
            expect(newSys.continents.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.continentCount).toBe(0);
            expect(stats.totalContinents).toBe(0);
        });
    });
});
