/**
 * CultivationGarden.test.js - 修真园系统测试
 * V562 Iteration 5/20 Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationGarden } from '../../../systems/ai/CultivationGarden.js';

describe('CultivationGarden', () => {
    let system;
    beforeEach(() => { system = new CultivationGarden(); });

    describe('openGarden', () => {
        it('should open', () => {
            const { garden } = system.openGarden({ gardenerId: 'g1', name: 'Moonlit Herb Garden', type: 'herb' });
            expect(garden.gardenerId).toBe('g1');
            expect(garden.name).toBe('Moonlit Herb Garden');
            expect(garden.type).toBe('herb');
        });

        it('should default to herb type and seeding status', () => {
            const { garden } = system.openGarden({ gardenerId: 'g1' });
            expect(garden.type).toBe('herb');
            expect(garden.status).toBe('seeding');
            expect(garden.level).toBe(1);
            expect(garden.vitality).toBe(20);
            expect(garden.plants).toEqual([]);
        });

        it('should generate unique ids', () => {
            const a = system.openGarden({});
            const b = system.openGarden({});
            expect(a.garden.gardenId).not.toBe(b.garden.gardenId);
        });

        it('should trigger gardenOpened hook', () => {
            let called = false;
            system.registerHook('gardenOpened', () => { called = true; });
            system.openGarden({});
            expect(called).toBe(true);
        });
    });

    describe('getGarden', () => {
        it('should return', () => {
            const { garden } = system.openGarden({});
            expect(system.getGarden(garden.gardenId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getGarden('ghost')).toBeNull(); });
    });

    describe('listGardens', () => {
        it('should list all', () => {
            system.openGarden({});
            system.openGarden({});
            expect(system.listGardens().length).toBe(2);
        });
        it('should return empty when none', () => {
            expect(system.listGardens().length).toBe(0);
        });
    });

    describe('listByGardener', () => {
        it('should filter by gardener', () => {
            system.openGarden({ gardenerId: 'g1' });
            system.openGarden({ gardenerId: 'g2' });
            expect(system.listByGardener('g1').length).toBe(1);
        });
        it('should return empty for unknown gardener', () => {
            system.openGarden({ gardenerId: 'g1' });
            expect(system.listByGardener('unknown').length).toBe(0);
        });
    });

    describe('listParadise', () => {
        it('should filter paradise gardens', () => {
            const { garden } = system.openGarden({});
            system.openGarden({});
            system.paradiseGarden(garden.gardenId);
            expect(system.listParadise().length).toBe(1);
        });
        it('should return empty when none paradise', () => {
            system.openGarden({});
            expect(system.listParadise().length).toBe(0);
        });
    });

    describe('addPlant', () => {
        it('should add plant to garden', () => {
            const { garden } = system.openGarden({});
            system.addPlant(garden.gardenId, { name: 'Spirit Herb', type: 'herb' });
            const updated = system.getGarden(garden.gardenId);
            expect(updated.plants.length).toBe(1);
            expect(updated.plants[0].name).toBe('Spirit Herb');
        });

        it('should transition status from seeding to growing', () => {
            const { garden } = system.openGarden({});
            expect(garden.status).toBe('seeding');
            system.addPlant(garden.gardenId, { name: 'Lotus' });
            const updated = system.getGarden(garden.gardenId);
            expect(updated.status).toBe('growing');
        });

        it('should reject missing garden', () => {
            const result = system.addPlant('ghost', { name: 'X' });
            expect(result.error).toBe('GARDEN_NOT_FOUND');
        });

        it('should trigger plantAdded hook', () => {
            const { garden } = system.openGarden({});
            let called = false;
            system.registerHook('plantAdded', () => { called = true; });
            system.addPlant(garden.gardenId, { name: 'Lotus' });
            expect(called).toBe(true);
        });
    });

    describe('increaseVitality', () => {
        it('should increase vitality by default amount', () => {
            const { garden } = system.openGarden({});
            system.increaseVitality(garden.gardenId);
            const updated = system.getGarden(garden.gardenId);
            expect(updated.vitality).toBe(25);
        });

        it('should increase vitality by custom amount', () => {
            const { garden } = system.openGarden({});
            system.increaseVitality(garden.gardenId, 30);
            const updated = system.getGarden(garden.gardenId);
            expect(updated.vitality).toBe(50);
        });

        it('should reject missing garden', () => {
            const result = system.increaseVitality('ghost', 10);
            expect(result.error).toBe('GARDEN_NOT_FOUND');
        });

        it('should trigger vitalityIncreased hook', () => {
            const { garden } = system.openGarden({});
            let called = false;
            system.registerHook('vitalityIncreased', () => { called = true; });
            system.increaseVitality(garden.gardenId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpGarden', () => {
        it('should level up', () => {
            const { garden } = system.openGarden({});
            system.levelUpGarden(garden.gardenId);
            const updated = system.getGarden(garden.gardenId);
            expect(updated.level).toBe(2);
        });

        it('should allow multiple level ups', () => {
            const { garden } = system.openGarden({});
            system.levelUpGarden(garden.gardenId);
            system.levelUpGarden(garden.gardenId);
            system.levelUpGarden(garden.gardenId);
            const updated = system.getGarden(garden.gardenId);
            expect(updated.level).toBe(4);
        });

        it('should reject missing garden', () => {
            const result = system.levelUpGarden('ghost');
            expect(result.error).toBe('GARDEN_NOT_FOUND');
        });

        it('should trigger gardenLeveledUp hook', () => {
            const { garden } = system.openGarden({});
            let called = false;
            system.registerHook('gardenLeveledUp', () => { called = true; });
            system.levelUpGarden(garden.gardenId);
            expect(called).toBe(true);
        });
    });

    describe('paradiseGarden', () => {
        it('should set status to paradise', () => {
            const { garden } = system.openGarden({});
            system.paradiseGarden(garden.gardenId);
            const updated = system.getGarden(garden.gardenId);
            expect(updated.status).toBe('paradise');
        });

        it('should reject missing garden', () => {
            const result = system.paradiseGarden('ghost');
            expect(result.error).toBe('GARDEN_NOT_FOUND');
        });

        it('should trigger gardenParadise hook', () => {
            const { garden } = system.openGarden({});
            let called = false;
            system.registerHook('gardenParadise', () => { called = true; });
            system.paradiseGarden(garden.gardenId);
            expect(called).toBe(true);
        });
    });

    describe('calculateGardenValue', () => {
        it('should calculate base value', () => {
            const { garden } = system.openGarden({});
            // level 1 * 100 + vitality 20 * 2 + plants 0 * 30 = 100 + 40 + 0 = 140
            expect(system.calculateGardenValue(garden.gardenId)).toBe(140);
        });

        it('should reflect plants, level, and vitality', () => {
            const { garden } = system.openGarden({});
            system.levelUpGarden(garden.gardenId); // level 2
            system.increaseVitality(garden.gardenId, 30); // vitality 50
            system.addPlant(garden.gardenId, { name: 'A' });
            system.addPlant(garden.gardenId, { name: 'B' });
            // level 2 * 100 + vitality 50 * 2 + plants 2 * 30 = 200 + 100 + 60 = 360
            expect(system.calculateGardenValue(garden.gardenId)).toBe(360);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateGardenValue('ghost')).toBe(0);
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

        it('should execute default getGarden', () => {
            const result = system.executeTool('getGarden', { gardenId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('gardenOpened', () => count++);
            unregister();
            system.openGarden({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('gardenOpened', () => { throw new Error('x'); });
            expect(() => system.openGarden({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalGardens = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalGardens = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openGarden({});
            const json = system.toJSON();
            expect(json.gardens.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openGarden({});
            const json = system.toJSON();
            const newSys = new CultivationGarden();
            newSys.fromJSON(json);
            expect(newSys.gardens.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.gardenCount).toBe(0);
        });
    });
});
