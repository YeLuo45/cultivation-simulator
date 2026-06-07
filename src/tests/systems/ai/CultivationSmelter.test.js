/**
 * CultivationSmelter.test.js - 修真冶炼测试
 * V857 Iteration 30/30 FINAL Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSmelter } from '../../../systems/ai/CultivationSmelter.js';

describe('CultivationSmelter', () => {
    let system;
    beforeEach(() => { system = new CultivationSmelter(); });

    describe('smeltOre', () => {
        it('should smelt', () => {
            const { smelter } = system.smeltOre({ name: 'Forge' });
            expect(smelter.name).toBe('Forge');
        });
        it('should initialize empty smelts', () => {
            const { smelter } = system.smeltOre({});
            expect(smelter.smelts).toEqual([]);
        });
        it('should trigger oreSmelted hook', () => {
            let called = false;
            system.registerHook('oreSmelted', () => { called = true; });
            system.smeltOre({});
            expect(called).toBe(true);
        });
    });

    describe('getSmelter', () => {
        it('should return', () => {
            const { smelter } = system.smeltOre({});
            expect(system.getSmelter(smelter.smelterId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSmelter('ghost')).toBeNull(); });
    });

    describe('listSmelters', () => {
        it('should list all', () => {
            system.smeltOre({});
            expect(system.listSmelters().length).toBe(1);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.smeltOre({ masterId: 'm1' });
            system.smeltOre({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listByMaterial', () => {
        it('should filter', () => {
            system.smeltOre({ material: 'iron' });
            system.smeltOre({ material: 'gold' });
            expect(system.listByMaterial('iron').length).toBe(1);
        });
    });

    describe('listVeteran', () => {
        it('should list veteran+', () => {
            system.smeltOre({});
            expect(system.listVeteran().length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            system.smeltOre({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('listTop', () => {
        it('should return top', () => {
            system.smeltOre({});
            expect(system.listTop(2).length).toBe(1);
        });
    });

    describe('addSmelt', () => {
        it('should add', () => {
            const { smelter } = system.smeltOre({});
            system.addSmelt(smelter.smelterId, 'sword');
            expect(smelter.smelts.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addSmelt('ghost', 'sword');
            expect(result.error).toBe('SMELTER_NOT_FOUND');
        });

        it('should trigger smeltAdded hook', () => {
            const { smelter } = system.smeltOre({});
            let called = false;
            system.registerHook('smeltAdded', () => { called = true; });
            system.addSmelt(smelter.smelterId, 'sword');
            expect(called).toBe(true);
        });
    });

    describe('raiseFirepower', () => {
        it('should raise', () => {
            const { smelter } = system.smeltOre({});
            system.raiseFirepower(smelter.smelterId, 5);
            expect(smelter.firepower).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseFirepower('ghost', 5);
            expect(result.error).toBe('SMELTER_NOT_FOUND');
        });

        it('should trigger firepowerRaised hook', () => {
            const { smelter } = system.smeltOre({});
            let called = false;
            system.registerHook('firepowerRaised', () => { called = true; });
            system.raiseFirepower(smelter.smelterId, 5);
            expect(called).toBe(true);
        });
    });

    describe('promoteSmelter', () => {
        it('should promote', () => {
            const { smelter } = system.smeltOre({});
            system.promoteSmelter(smelter.smelterId);
            expect(smelter.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.promoteSmelter('ghost');
            expect(result.error).toBe('SMELTER_NOT_FOUND');
        });

        it('should trigger smelterPromoted hook', () => {
            const { smelter } = system.smeltOre({});
            let called = false;
            system.registerHook('smelterPromoted', () => { called = true; });
            system.promoteSmelter(smelter.smelterId);
            expect(called).toBe(true);
        });
    });

    describe('veteranizeSmelter', () => {
        it('should veteranize', () => {
            const { smelter } = system.smeltOre({});
            system.veteranizeSmelter(smelter.smelterId);
            expect(smelter.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.veteranizeSmelter('ghost');
            expect(result.error).toBe('SMELTER_NOT_FOUND');
        });

        it('should trigger smelterVeteranized hook', () => {
            const { smelter } = system.smeltOre({});
            let called = false;
            system.registerHook('smelterVeteranized', () => { called = true; });
            system.veteranizeSmelter(smelter.smelterId);
            expect(called).toBe(true);
        });
    });

    describe('legendizeSmelter', () => {
        it('should legendize', () => {
            const { smelter } = system.smeltOre({});
            system.legendizeSmelter(smelter.smelterId);
            expect(smelter.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendizeSmelter('ghost');
            expect(result.error).toBe('SMELTER_NOT_FOUND');
        });

        it('should trigger smelterLegendized hook', () => {
            const { smelter } = system.smeltOre({});
            let called = false;
            system.registerHook('smelterLegendized', () => { called = true; });
            system.legendizeSmelter(smelter.smelterId);
            expect(called).toBe(true);
        });
    });

    describe('changeMaterial', () => {
        it('should change', () => {
            const { smelter } = system.smeltOre({});
            system.changeMaterial(smelter.smelterId, 'gold');
            expect(smelter.material).toBe('gold');
        });

        it('should reject missing', () => {
            const result = system.changeMaterial('ghost', 'gold');
            expect(result.error).toBe('SMELTER_NOT_FOUND');
        });

        it('should trigger materialChanged hook', () => {
            const { smelter } = system.smeltOre({});
            let called = false;
            system.registerHook('materialChanged', () => { called = true; });
            system.changeMaterial(smelter.smelterId, 'gold');
            expect(called).toBe(true);
        });
    });

    describe('tickSmelter', () => {
        it('should tick', () => {
            const { smelter } = system.smeltOre({});
            system.tickSmelter(smelter.smelterId);
            expect(smelter.lastSmelt).toBeGreaterThan(0);
        });

        it('should reject missing', () => {
            const result = system.tickSmelter('ghost');
            expect(result.error).toBe('SMELTER_NOT_FOUND');
        });

        it('should trigger smelterTicked hook', () => {
            const { smelter } = system.smeltOre({});
            let called = false;
            system.registerHook('smelterTicked', () => { called = true; });
            system.tickSmelter(smelter.smelterId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSmelterValue', () => {
        it('should calculate', () => {
            const { smelter } = system.smeltOre({});
            expect(system.calculateSmelterValue(smelter.smelterId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSmelterValue('ghost')).toBe(0);
        });
    });

    describe('mergeSmelters', () => {
        it('should merge', () => {
            const a = system.smeltOre({}).smelter;
            const b = system.smeltOre({}).smelter;
            const result = system.mergeSmelters(a.smelterId, b.smelterId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.mergeSmelters('ghost', 'ghost2');
            expect(result.error).toBe('SMELTER_NOT_FOUND');
        });

        it('should trigger smeltersMerged hook', () => {
            const a = system.smeltOre({}).smelter;
            const b = system.smeltOre({}).smelter;
            let called = false;
            system.registerHook('smeltersMerged', () => { called = true; });
            system.mergeSmelters(a.smelterId, b.smelterId);
            expect(called).toBe(true);
        });
    });

    describe('deleteSmelter', () => {
        it('should delete', () => {
            const { smelter } = system.smeltOre({});
            const result = system.deleteSmelter(smelter.smelterId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteSmelter('ghost');
            expect(result.error).toBe('SMELTER_NOT_FOUND');
        });

        it('should trigger smelterDeleted hook', () => {
            const { smelter } = system.smeltOre({});
            let called = false;
            system.registerHook('smelterDeleted', () => { called = true; });
            system.deleteSmelter(smelter.smelterId);
            expect(called).toBe(true);
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

        it('should execute default listByMaterial', () => {
            system.smeltOre({ material: 'iron' });
            const result = system.executeTool('listByMaterial', { material: 'iron' });
            expect(result.result.length).toBe(1);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('oreSmelted', () => count++);
            unregister();
            system.smeltOre({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('oreSmelted', () => { throw new Error('x'); });
            expect(() => system.smeltOre({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSmelted = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSmelted = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.smeltOre({});
            const json = system.toJSON();
            expect(json.smelters.length).toBe(1);
        });
        it('should deserialize', () => {
            system.smeltOre({});
            const json = system.toJSON();
            const newSys = new CultivationSmelter();
            newSys.fromJSON(json);
            expect(newSys.smelters.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.smelterCount).toBe(0);
        });
    });
});