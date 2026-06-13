/**
 * CultivationClothing.test.js - 修真衣测试
 * V564 Iteration 7/20 Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationClothing } from '../../../systems/ai/CultivationClothing.js';

describe('CultivationClothing', () => {
    let system;
    beforeEach(() => { system = new CultivationClothing(); });

    describe('sewClothing', () => {
        it('should sew', () => {
            const { clothing } = system.sewClothing({ tailorId: 't1', name: 'Cloud Robe', type: 'robe' });
            expect(clothing.tailorId).toBe('t1');
            expect(clothing.name).toBe('Cloud Robe');
            expect(clothing.type).toBe('robe');
        });

        it('should trigger clothingSewn hook', () => {
            let called = false;
            system.registerHook('clothingSewn', () => { called = true; });
            system.sewClothing({});
            expect(called).toBe(true);
        });

        it('should set default status to sewn', () => {
            const { clothing } = system.sewClothing({});
            expect(clothing.status).toBe('sewn');
        });

        it('should set default elegance to baseElegance', () => {
            const { clothing } = system.sewClothing({});
            expect(clothing.elegance).toBe(20);
        });

        it('should set default fabrics to empty array', () => {
            const { clothing } = system.sewClothing({});
            expect(clothing.fabrics).toEqual([]);
        });

        it('should set default level to 1', () => {
            const { clothing } = system.sewClothing({});
            expect(clothing.level).toBe(1);
        });
    });

    describe('getClothing', () => {
        it('should return', () => {
            const { clothing } = system.sewClothing({});
            expect(system.getClothing(clothing.clothingId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getClothing('ghost')).toBeNull(); });
    });

    describe('listClothings', () => {
        it('should list all', () => {
            system.sewClothing({});
            system.sewClothing({});
            expect(system.listClothings().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listClothings().length).toBe(0);
        });
    });

    describe('listByTailor', () => {
        it('should filter', () => {
            system.sewClothing({ tailorId: 't1' });
            system.sewClothing({ tailorId: 't2' });
            expect(system.listByTailor('t1').length).toBe(1);
        });

        it('should return empty when none match', () => {
            system.sewClothing({ tailorId: 't1' });
            expect(system.listByTailor('ghost').length).toBe(0);
        });
    });

    describe('listMasterpiece', () => {
        it('should filter masterpiece', () => {
            const { clothing } = system.sewClothing({});
            system.masterClothing(clothing.clothingId);
            system.sewClothing({});
            expect(system.listMasterpiece().length).toBe(1);
        });

        it('should return empty when none masterpiece', () => {
            system.sewClothing({});
            expect(system.listMasterpiece().length).toBe(0);
        });
    });

    describe('addFabric', () => {
        it('should add fabric', () => {
            const { clothing } = system.sewClothing({});
            system.addFabric(clothing.clothingId, 'celestial silk');
            expect(clothing.fabrics.length).toBe(1);
            expect(clothing.fabrics[0]).toBe('celestial silk');
        });

        it('should add multiple fabrics', () => {
            const { clothing } = system.sewClothing({});
            system.addFabric(clothing.clothingId, 'celestial silk');
            system.addFabric(clothing.clothingId, 'phoenix feather');
            expect(clothing.fabrics.length).toBe(2);
        });

        it('should change status to worn on first fabric', () => {
            const { clothing } = system.sewClothing({});
            system.addFabric(clothing.clothingId, 'celestial silk');
            expect(clothing.status).toBe('worn');
        });

        it('should reject missing', () => {
            const result = system.addFabric('ghost', 'celestial silk');
            expect(result.error).toBe('CLOTHING_NOT_FOUND');
        });

        it('should trigger fabricAdded hook', () => {
            const { clothing } = system.sewClothing({});
            let called = false;
            system.registerHook('fabricAdded', () => { called = true; });
            system.addFabric(clothing.clothingId, 'celestial silk');
            expect(called).toBe(true);
        });
    });

    describe('increaseElegance', () => {
        it('should increase elegance by default', () => {
            const { clothing } = system.sewClothing({});
            system.increaseElegance(clothing.clothingId);
            expect(clothing.elegance).toBe(25);
        });

        it('should increase elegance by amount', () => {
            const { clothing } = system.sewClothing({});
            system.increaseElegance(clothing.clothingId, 10);
            expect(clothing.elegance).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.increaseElegance('ghost', 10);
            expect(result.error).toBe('CLOTHING_NOT_FOUND');
        });

        it('should trigger eleganceIncreased hook', () => {
            const { clothing } = system.sewClothing({});
            let called = false;
            system.registerHook('eleganceIncreased', () => { called = true; });
            system.increaseElegance(clothing.clothingId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpClothing', () => {
        it('should level up', () => {
            const { clothing } = system.sewClothing({});
            system.levelUpClothing(clothing.clothingId);
            expect(clothing.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { clothing } = system.sewClothing({});
            system.levelUpClothing(clothing.clothingId);
            system.levelUpClothing(clothing.clothingId);
            system.levelUpClothing(clothing.clothingId);
            expect(clothing.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpClothing('ghost');
            expect(result.error).toBe('CLOTHING_NOT_FOUND');
        });

        it('should trigger clothingLeveledUp hook', () => {
            const { clothing } = system.sewClothing({});
            let called = false;
            system.registerHook('clothingLeveledUp', () => { called = true; });
            system.levelUpClothing(clothing.clothingId);
            expect(called).toBe(true);
        });
    });

    describe('masterClothing', () => {
        it('should mark as masterpiece', () => {
            const { clothing } = system.sewClothing({});
            system.masterClothing(clothing.clothingId);
            expect(clothing.status).toBe('masterpiece');
        });

        it('should reject missing', () => {
            const result = system.masterClothing('ghost');
            expect(result.error).toBe('CLOTHING_NOT_FOUND');
        });

        it('should trigger clothingMastered hook', () => {
            const { clothing } = system.sewClothing({});
            let called = false;
            system.registerHook('clothingMastered', () => { called = true; });
            system.masterClothing(clothing.clothingId);
            expect(called).toBe(true);
        });
    });

    describe('calculateClothingValue', () => {
        it('should calculate', () => {
            const { clothing } = system.sewClothing({});
            // level=1, elegance=20, fabrics=0: 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateClothingValue(clothing.clothingId)).toBe(140);
        });

        it('should calculate with fabrics', () => {
            const { clothing } = system.sewClothing({});
            system.addFabric(clothing.clothingId, 'celestial silk');
            system.addFabric(clothing.clothingId, 'phoenix feather');
            // level=1, elegance=20, fabrics=2: 100 + 40 + 60 = 200
            expect(system.calculateClothingValue(clothing.clothingId)).toBe(200);
        });

        it('should calculate with level up and elegance increased', () => {
            const { clothing } = system.sewClothing({});
            system.levelUpClothing(clothing.clothingId);
            system.levelUpClothing(clothing.clothingId);
            system.increaseElegance(clothing.clothingId, 30);
            // level=3, elegance=50, fabrics=0: 300 + 100 + 0 = 400
            expect(system.calculateClothingValue(clothing.clothingId)).toBe(400);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateClothingValue('ghost')).toBe(0);
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

        it('should execute default getClothing', () => {
            const result = system.executeTool('getClothing', { clothingId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('clothingSewn', () => count++);
            unregister();
            system.sewClothing({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('clothingSewn', () => { throw new Error('x'); });
            expect(() => system.sewClothing({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalClothings = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalClothings = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.sewClothing({});
            const json = system.toJSON();
            expect(json.clothings.length).toBe(1);
        });
        it('should deserialize', () => {
            system.sewClothing({});
            const json = system.toJSON();
            const newSys = new CultivationClothing();
            newSys.fromJSON(json);
            expect(newSys.clothings.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.clothingCount).toBe(0);
        });
    });
});
