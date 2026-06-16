/**
 * CultivationCrystal.test.js - 修真水晶测试
 * V828 Iteration 1/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationCrystal } from '../../../systems/ai/CultivationCrystal.js';

describe('CultivationCrystal', () => {
    let system;
    beforeEach(() => { system = new CultivationCrystal(); });

    describe('recruitCrystal', () => {
        it('should recruit', () => {
            const { crystal } = system.recruitCrystal({ masterId: 'm1', name: 'Sky Crystal', type: 'celestial' });
            expect(crystal.masterId).toBe('m1');
            expect(crystal.name).toBe('Sky Crystal');
            expect(crystal.type).toBe('celestial');
        });

        it('should default type, clarity, level, status', () => {
            const { crystal } = system.recruitCrystal({ masterId: 'm1' });
            expect(crystal.type).toBe('clear');
            expect(crystal.clarity).toBe(20);
            expect(crystal.level).toBe(1);
            expect(crystal.status).toBe('novice');
            expect(crystal.facets).toEqual([]);
        });

        it('should accept custom crystalId', () => {
            const { crystal } = system.recruitCrystal({ crystalId: 'custom-id', masterId: 'm1' });
            expect(crystal.crystalId).toBe('custom-id');
        });

        it('should trigger crystalRecruited hook', () => {
            let called = false;
            system.registerHook('crystalRecruited', () => { called = true; });
            system.recruitCrystal({});
            expect(called).toBe(true);
        });

        it('should return success true', () => {
            const result = system.recruitCrystal({ masterId: 'm1' });
            expect(result.success).toBe(true);
        });
    });

    describe('getCrystal', () => {
        it('should return', () => {
            const { crystal } = system.recruitCrystal({});
            expect(system.getCrystal(crystal.crystalId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCrystal('ghost')).toBeNull(); });
    });

    describe('listCrystals', () => {
        it('should list all', () => {
            system.recruitCrystal({});
            system.recruitCrystal({});
            expect(system.listCrystals().length).toBe(2);
        });

        it('should return empty array initially', () => {
            expect(system.listCrystals()).toEqual([]);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitCrystal({ masterId: 'm1' });
            system.recruitCrystal({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitCrystal({ masterId: 'm1' });
            expect(system.listByMaster('unknown')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter by legendary', () => {
            const { crystal: c1 } = system.recruitCrystal({});
            const { crystal: c2 } = system.recruitCrystal({});
            system.legendCrystal(c2.crystalId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].crystalId).toBe(c2.crystalId);
        });

        it('should return empty when none legendary', () => {
            system.recruitCrystal({});
            expect(system.listLegendary()).toEqual([]);
        });
    });

    describe('addFacet', () => {
        it('should add facet', () => {
            const { crystal } = system.recruitCrystal({});
            system.addFacet(crystal.crystalId, 'fire-facet');
            expect(crystal.facets).toContain('fire-facet');
            expect(crystal.facets.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addFacet('ghost', 'f');
            expect(result.error).toBe('CRYSTAL_NOT_FOUND');
        });

        it('should trigger facetAdded hook', () => {
            const { crystal } = system.recruitCrystal({});
            let called = false;
            system.registerHook('facetAdded', () => { called = true; });
            system.addFacet(crystal.crystalId, 'f');
            expect(called).toBe(true);
        });
    });

    describe('raiseClarity', () => {
        it('should raise', () => {
            const { crystal } = system.recruitCrystal({});
            system.raiseClarity(crystal.crystalId, 10);
            expect(crystal.clarity).toBe(30);
        });

        it('should default amount to 5', () => {
            const { crystal } = system.recruitCrystal({});
            system.raiseClarity(crystal.crystalId);
            expect(crystal.clarity).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseClarity('ghost', 10);
            expect(result.error).toBe('CRYSTAL_NOT_FOUND');
        });

        it('should trigger clarityRaised hook', () => {
            const { crystal } = system.recruitCrystal({});
            let called = false;
            system.registerHook('clarityRaised', () => { called = true; });
            system.raiseClarity(crystal.crystalId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpCrystal', () => {
        it('should level up', () => {
            const { crystal } = system.recruitCrystal({});
            system.levelUpCrystal(crystal.crystalId);
            expect(crystal.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpCrystal('ghost');
            expect(result.error).toBe('CRYSTAL_NOT_FOUND');
        });

        it('should trigger crystalLeveledUp hook', () => {
            const { crystal } = system.recruitCrystal({});
            let called = false;
            system.registerHook('crystalLeveledUp', () => { called = true; });
            system.levelUpCrystal(crystal.crystalId);
            expect(called).toBe(true);
        });
    });

    describe('legendCrystal', () => {
        it('should legendize', () => {
            const { crystal } = system.recruitCrystal({});
            system.legendCrystal(crystal.crystalId);
            expect(crystal.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendCrystal('ghost');
            expect(result.error).toBe('CRYSTAL_NOT_FOUND');
        });

        it('should trigger crystalLegendized hook', () => {
            const { crystal } = system.recruitCrystal({});
            let called = false;
            system.registerHook('crystalLegendized', () => { called = true; });
            system.legendCrystal(crystal.crystalId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCrystalValue', () => {
        it('should calculate', () => {
            const { crystal } = system.recruitCrystal({});
            system.raiseClarity(crystal.crystalId, 10);
            system.addFacet(crystal.crystalId, 'f1');
            system.addFacet(crystal.crystalId, 'f2');
            system.levelUpCrystal(crystal.crystalId);
            // level=2*100 + clarity=30*2 + facets=2*30 = 200 + 60 + 60 = 320
            expect(system.calculateCrystalValue(crystal.crystalId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCrystalValue('ghost')).toBe(0);
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

        it('should execute default getCrystal', () => {
            const result = system.executeTool('getCrystal', { crystalId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle undefined context', () => {
            let received = 'unset';
            system.registerTool('echo', (ctx) => { received = ctx; return 'ok'; });
            system.executeTool('echo');
            expect(received).toEqual({});
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('crystalRecruited', () => count++);
            unregister();
            system.recruitCrystal({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('crystalRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitCrystal({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCrystals = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCrystals = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitCrystal({});
            const json = system.toJSON();
            expect(json.crystals.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitCrystal({});
            const json = system.toJSON();
            const newSys = new CultivationCrystal();
            newSys.fromJSON(json);
            expect(newSys.crystals.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.crystalCount).toBe(0);
        });
    });
});
