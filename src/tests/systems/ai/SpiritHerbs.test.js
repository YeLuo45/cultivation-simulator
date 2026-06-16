/**
 * SpiritHerbs.test.js - 灵草测试
 * V411 Iteration 3/15 Round 14 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SpiritHerbs } from '../../../systems/ai/SpiritHerbs.js';

describe('SpiritHerbs', () => {
    let system;
    beforeEach(() => { system = new SpiritHerbs(); });

    describe('plantHerb', () => {
        it('should plant', () => {
            const { herb } = system.plantHerb({ name: 'H1' });
            expect(herb.name).toBe('H1');
        });

        it('should trigger herbPlanted hook', () => {
            let called = false;
            system.registerHook('herbPlanted', () => { called = true; });
            system.plantHerb({});
            expect(called).toBe(true);
        });
    });

    describe('getHerb', () => {
        it('should return', () => {
            const { herb } = system.plantHerb({});
            expect(system.getHerb(herb.herbId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getHerb('ghost')).toBeNull(); });
    });

    describe('listHerbs', () => {
        it('should list all', () => {
            system.plantHerb({});
            expect(system.listHerbs().length).toBe(1);
        });
    });

    describe('listByElement', () => {
        it('should filter', () => {
            system.plantHerb({ element: 'wood' });
            system.plantHerb({ element: 'fire' });
            expect(system.listByElement('wood').length).toBe(1);
        });
    });

    describe('listByPotency', () => {
        it('should filter', () => {
            system.plantHerb({ potency: 10 });
            system.plantHerb({ potency: 100 });
            expect(system.listByPotency(50).length).toBe(1);
        });
    });

    describe('grow', () => {
        it('should grow', () => {
            const { herb } = system.plantHerb({});
            system.grow(herb.herbId, 10);
            expect(herb.age).toBe(10);
        });

        it('should reject missing', () => {
            const result = system.grow('ghost', 10);
            expect(result.error).toBe('HERB_NOT_FOUND');
        });

        it('should trigger herbGrown hook', () => {
            const { herb } = system.plantHerb({});
            let called = false;
            system.registerHook('herbGrown', () => { called = true; });
            system.grow(herb.herbId, 10);
            expect(called).toBe(true);
        });
    });

    describe('harvestHerb', () => {
        it('should harvest', () => {
            const { herb } = system.plantHerb({});
            const result = system.harvestHerb(herb.herbId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.harvestHerb('ghost');
            expect(result.error).toBe('HERB_NOT_FOUND');
        });

        it('should set status', () => {
            const { herb } = system.plantHerb({});
            system.harvestHerb(herb.herbId);
            expect(herb.status).toBe('harvested');
        });

        it('should trigger herbHarvested hook', () => {
            const { herb } = system.plantHerb({});
            let called = false;
            system.registerHook('herbHarvested', () => { called = true; });
            system.harvestHerb(herb.herbId);
            expect(called).toBe(true);
        });
    });

    describe('getHarvest', () => {
        it('should return', () => {
            const { herb } = system.plantHerb({});
            const { harvest } = system.harvestHerb(herb.herbId);
            expect(system.getHarvest(harvest.harvestId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getHarvest('ghost')).toBeNull(); });
    });

    describe('listHarvests', () => {
        it('should list all', () => {
            const { herb } = system.plantHerb({});
            system.harvestHerb(herb.herbId);
            expect(system.listHarvests().length).toBe(1);
        });
    });

    describe('listHarvestsByHerb', () => {
        it('should filter', () => {
            const { herb: h1 } = system.plantHerb({});
            const { herb: h2 } = system.plantHerb({});
            system.harvestHerb(h1.herbId);
            system.harvestHerb(h2.herbId);
            expect(system.listHarvestsByHerb(h1.herbId).length).toBe(1);
        });
    });

    describe('calculateTotalPotency', () => {
        it('should calculate', () => {
            const { herb: h1 } = system.plantHerb({});
            const { herb: h2 } = system.plantHerb({});
            system.harvestHerb(h1.herbId);
            system.harvestHerb(h2.herbId);
            expect(system.calculateTotalPotency()).toBe(20);
        });
    });

    describe('listMature', () => {
        it('should filter', () => {
            system.plantHerb({ potency: 10 });
            system.plantHerb({ potency: 100 });
            expect(system.listMature(50).length).toBe(1);
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

        it('should execute default getHerb', () => {
            const result = system.executeTool('getHerb', { herbId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('herbPlanted', () => count++);
            unregister();
            system.plantHerb({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('herbPlanted', () => { throw new Error('x'); });
            expect(() => system.plantHerb({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalHerbs = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalHerbs = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.plantHerb({});
            const json = system.toJSON();
            expect(json.herbs.length).toBe(1);
        });
        it('should deserialize', () => {
            system.plantHerb({});
            const json = system.toJSON();
            const newSys = new SpiritHerbs();
            newSys.fromJSON(json);
            expect(newSys.herbs.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.herbCount).toBe(0);
        });
    });
});