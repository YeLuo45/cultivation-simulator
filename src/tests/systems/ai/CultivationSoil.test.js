/**
 * CultivationSoil.test.js - 修真土壤系统测试
 * V845 Iteration 18/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSoil } from '../../../systems/ai/CultivationSoil.js';

describe('CultivationSoil', () => {
    let system;
    beforeEach(() => { system = new CultivationSoil(); });

    describe('recruitSoil', () => {
        it('should create', () => {
            const { soil } = system.recruitSoil({ masterId: 'm1', name: 'Mystic', type: 'clay' });
            expect(soil.masterId).toBe('m1');
            expect(soil.name).toBe('Mystic');
            expect(soil.type).toBe('clay');
        });

        it('should default type to loam and use baseFertility', () => {
            const { soil } = system.recruitSoil({});
            expect(soil.type).toBe('loam');
            expect(soil.fertility).toBe(20);
            expect(soil.status).toBe('novice');
            expect(soil.level).toBe(1);
            expect(soil.harvests).toEqual([]);
        });

        it('should accept custom fertility and harvests', () => {
            const { soil } = system.recruitSoil({ fertility: 50, harvests: ['herb', 'mushroom'] });
            expect(soil.fertility).toBe(50);
            expect(soil.harvests.length).toBe(2);
        });

        it('should trigger soilRecruited hook', () => {
            let called = false;
            system.registerHook('soilRecruited', () => { called = true; });
            system.recruitSoil({});
            expect(called).toBe(true);
        });

        it('should reject when at maxSoils', () => {
            const small = new CultivationSoil({ maxSoils: 1 });
            small.recruitSoil({});
            const result = small.recruitSoil({});
            expect(result.error).toBe('MAX_SOILS_REACHED');
        });
    });

    describe('getSoil', () => {
        it('should return', () => {
            const { soil } = system.recruitSoil({});
            expect(system.getSoil(soil.soilId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSoil('ghost')).toBeNull(); });
    });

    describe('listSoils', () => {
        it('should list all', () => {
            system.recruitSoil({});
            system.recruitSoil({});
            expect(system.listSoils().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitSoil({ masterId: 'm1' });
            system.recruitSoil({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { soil: a } = system.recruitSoil({});
            const { soil: b } = system.recruitSoil({});
            system.legendSoil(a.soilId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addHarvest', () => {
        it('should add', () => {
            const { soil } = system.recruitSoil({});
            system.addHarvest(soil.soilId, 'spirit-weed');
            expect(soil.harvests.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addHarvest('ghost', 'x');
            expect(result.error).toBe('SOIL_NOT_FOUND');
        });

        it('should trigger harvestAdded hook', () => {
            const { soil } = system.recruitSoil({});
            let called = false;
            system.registerHook('harvestAdded', () => { called = true; });
            system.addHarvest(soil.soilId, 'ginseng');
            expect(called).toBe(true);
        });
    });

    describe('raiseFertility', () => {
        it('should raise with custom amount', () => {
            const { soil } = system.recruitSoil({});
            system.raiseFertility(soil.soilId, 10);
            expect(soil.fertility).toBe(30);
        });

        it('should default amount to 5', () => {
            const { soil } = system.recruitSoil({});
            system.raiseFertility(soil.soilId);
            expect(soil.fertility).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseFertility('ghost', 5);
            expect(result.error).toBe('SOIL_NOT_FOUND');
        });

        it('should trigger fertilityRaised hook', () => {
            const { soil } = system.recruitSoil({});
            let called = false;
            system.registerHook('fertilityRaised', () => { called = true; });
            system.raiseFertility(soil.soilId, 3);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSoil', () => {
        it('should level up', () => {
            const { soil } = system.recruitSoil({});
            system.levelUpSoil(soil.soilId);
            expect(soil.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpSoil('ghost');
            expect(result.error).toBe('SOIL_NOT_FOUND');
        });

        it('should trigger soilLeveledUp hook', () => {
            const { soil } = system.recruitSoil({});
            let called = false;
            system.registerHook('soilLeveledUp', () => { called = true; });
            system.levelUpSoil(soil.soilId);
            expect(called).toBe(true);
        });
    });

    describe('legendSoil', () => {
        it('should legendize', () => {
            const { soil } = system.recruitSoil({});
            system.legendSoil(soil.soilId);
            expect(soil.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSoil('ghost');
            expect(result.error).toBe('SOIL_NOT_FOUND');
        });

        it('should trigger soilLegendized hook', () => {
            const { soil } = system.recruitSoil({});
            let called = false;
            system.registerHook('soilLegendized', () => { called = true; });
            system.legendSoil(soil.soilId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSoilValue', () => {
        it('should calculate', () => {
            const { soil } = system.recruitSoil({ level: 2, fertility: 30 });
            system.addHarvest(soil.soilId, 'a');
            system.addHarvest(soil.soilId, 'b');
            // level*100 + fertility*2 + harvests*30 = 200 + 60 + 60 = 320
            expect(system.calculateSoilValue(soil.soilId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSoilValue('ghost')).toBe(0);
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

        it('should execute default getSoil', () => {
            const result = system.executeTool('getSoil', { soilId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('soilRecruited', () => count++);
            unregister();
            system.recruitSoil({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('soilRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSoil({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSoils = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSoils = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSoil({});
            const json = system.toJSON();
            expect(json.soils.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSoil({});
            const json = system.toJSON();
            const newSys = new CultivationSoil();
            newSys.fromJSON(json);
            expect(newSys.soils.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.soilCount).toBe(0);
        });
    });
});
