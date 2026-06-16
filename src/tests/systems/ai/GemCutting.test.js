/**
 * GemCutting.test.js - 宝石切割系统测试
 * V514 Iteration 16/20 Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GemCutting } from '../../../systems/ai/GemCutting.js';

describe('GemCutting', () => {
    let system;
    beforeEach(() => { system = new GemCutting(); });

    describe('cutGem', () => {
        it('should cut with defaults', () => {
            const { gem } = system.cutGem({});
            expect(gem.cutterId).toBe('unknown_cutter');
            expect(gem.name).toBe('unnamed_gem');
            expect(gem.type).toBe('diamond');
            expect(gem.clarity).toBe(20);
            expect(gem.facets).toEqual([]);
            expect(gem.polish).toBe(0);
            expect(gem.status).toBe('raw');
        });

        it('should cut with custom data', () => {
            const { gem } = system.cutGem({
                cutterId: 'c1',
                name: 'SkyDiamond',
                type: 'ruby',
                clarity: 80,
                facets: ['top'],
                polish: 20,
                status: 'cut'
            });
            expect(gem.cutterId).toBe('c1');
            expect(gem.name).toBe('SkyDiamond');
            expect(gem.type).toBe('ruby');
            expect(gem.clarity).toBe(80);
            expect(gem.facets).toEqual(['top']);
            expect(gem.polish).toBe(20);
            expect(gem.status).toBe('cut');
        });

        it('should increment totalGems', () => {
            system.cutGem({});
            system.cutGem({});
            expect(system.stats.totalGems).toBe(2);
        });

        it('should trigger gemCut hook', () => {
            let called = false;
            system.registerHook('gemCut', () => { called = true; });
            system.cutGem({});
            expect(called).toBe(true);
        });
    });

    describe('getGem', () => {
        it('should return gem', () => {
            const { gem } = system.cutGem({});
            const got = system.getGem(gem.gemId);
            expect(got).not.toBeNull();
            expect(got.gemId).toBe(gem.gemId);
        });
        it('should return null for missing', () => { expect(system.getGem('ghost')).toBeNull(); });
    });

    describe('listGems', () => {
        it('should list all', () => {
            system.cutGem({});
            system.cutGem({});
            system.cutGem({});
            expect(system.listGems().length).toBe(3);
        });

        it('should return empty list when no gems', () => {
            expect(system.listGems().length).toBe(0);
        });
    });

    describe('listByCutter', () => {
        it('should filter by cutter', () => {
            system.cutGem({ cutterId: 'c1' });
            system.cutGem({ cutterId: 'c1' });
            system.cutGem({ cutterId: 'c2' });
            expect(system.listByCutter('c1').length).toBe(2);
            expect(system.listByCutter('c2').length).toBe(1);
            expect(system.listByCutter('c3').length).toBe(0);
        });
    });

    describe('listMastered', () => {
        it('should list only mastered gems', () => {
            const { gem: g1 } = system.cutGem({});
            const { gem: g2 } = system.cutGem({});
            system.masterGem(g1.gemId);
            expect(system.listMastered().length).toBe(1);
            expect(system.listMastered()[0].gemId).toBe(g1.gemId);
        });

        it('should return empty when none mastered', () => {
            system.cutGem({});
            system.cutGem({});
            expect(system.listMastered().length).toBe(0);
        });
    });

    describe('addFacet', () => {
        it('should add facet', () => {
            const { gem } = system.cutGem({});
            system.addFacet(gem.gemId, 'top');
            expect(gem.facets).toContain('top');
            expect(gem.facets.length).toBe(1);
        });

        it('should add multiple facets', () => {
            const { gem } = system.cutGem({});
            system.addFacet(gem.gemId, 'top');
            system.addFacet(gem.gemId, 'side');
            expect(gem.facets).toEqual(['top', 'side']);
        });

        it('should set status to cut when 5+ facets', () => {
            const { gem } = system.cutGem({});
            system.addFacet(gem.gemId, 'a');
            system.addFacet(gem.gemId, 'b');
            system.addFacet(gem.gemId, 'c');
            system.addFacet(gem.gemId, 'd');
            expect(gem.status).toBe('raw');
            system.addFacet(gem.gemId, 'e');
            expect(gem.status).toBe('cut');
        });

        it('should reject missing', () => {
            const result = system.addFacet('ghost', 'top');
            expect(result.error).toBe('GEM_NOT_FOUND');
        });

        it('should trigger facetAdded hook', () => {
            const { gem } = system.cutGem({});
            let called = false;
            system.registerHook('facetAdded', () => { called = true; });
            system.addFacet(gem.gemId, 'top');
            expect(called).toBe(true);
        });
    });

    describe('increaseClarity', () => {
        it('should increase by default amount', () => {
            const { gem } = system.cutGem({});
            system.increaseClarity(gem.gemId);
            expect(gem.clarity).toBe(25);
        });

        it('should increase by custom amount', () => {
            const { gem } = system.cutGem({});
            system.increaseClarity(gem.gemId, 30);
            expect(gem.clarity).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.increaseClarity('ghost', 5);
            expect(result.error).toBe('GEM_NOT_FOUND');
        });

        it('should trigger clarityIncreased hook', () => {
            const { gem } = system.cutGem({});
            let called = false;
            system.registerHook('clarityIncreased', () => { called = true; });
            system.increaseClarity(gem.gemId, 5);
            expect(called).toBe(true);
        });
    });

    describe('polishGem', () => {
        it('should polish by default amount', () => {
            const { gem } = system.cutGem({});
            system.polishGem(gem.gemId);
            expect(gem.polish).toBe(5);
        });

        it('should polish by custom amount', () => {
            const { gem } = system.cutGem({});
            system.polishGem(gem.gemId, 25);
            expect(gem.polish).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.polishGem('ghost', 5);
            expect(result.error).toBe('GEM_NOT_FOUND');
        });

        it('should trigger gemPolished hook', () => {
            const { gem } = system.cutGem({});
            let called = false;
            system.registerHook('gemPolished', () => { called = true; });
            system.polishGem(gem.gemId, 5);
            expect(called).toBe(true);
        });
    });

    describe('masterGem', () => {
        it('should set status to mastered', () => {
            const { gem } = system.cutGem({});
            system.masterGem(gem.gemId);
            expect(gem.status).toBe('mastered');
        });

        it('should reject missing', () => {
            const result = system.masterGem('ghost');
            expect(result.error).toBe('GEM_NOT_FOUND');
        });

        it('should trigger gemMastered hook', () => {
            const { gem } = system.cutGem({});
            let called = false;
            system.registerHook('gemMastered', () => { called = true; });
            system.masterGem(gem.gemId);
            expect(called).toBe(true);
        });
    });

    describe('calculateGemValue', () => {
        it('should calculate default value', () => {
            const { gem } = system.cutGem({});
            // clarity=20 * 2 + polish=0 + 0 * 30 = 40
            expect(system.calculateGemValue(gem.gemId)).toBe(40);
        });

        it('should add 30 per facet', () => {
            const { gem } = system.cutGem({});
            system.addFacet(gem.gemId, 'top');
            system.addFacet(gem.gemId, 'side');
            // 40 + 0 + 2*30 = 100
            expect(system.calculateGemValue(gem.gemId)).toBe(100);
        });

        it('should reflect polish in formula', () => {
            const { gem } = system.cutGem({});
            system.polishGem(gem.gemId, 20);
            // 40 + 20 + 0 = 60
            expect(system.calculateGemValue(gem.gemId)).toBe(60);
        });

        it('should reflect clarity in formula', () => {
            const { gem } = system.cutGem({ clarity: 50 });
            // 50 * 2 + 0 + 0 = 100
            expect(system.calculateGemValue(gem.gemId)).toBe(100);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateGemValue('ghost')).toBe(0);
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
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default getGem', () => {
            const result = system.executeTool('getGem', { gemId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('gemCut', () => count++);
            unregister();
            system.cutGem({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('gemCut', () => { throw new Error('x'); });
            expect(() => system.cutGem({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalGems = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalGems = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.cutGem({});
            const json = system.toJSON();
            expect(json.gems.length).toBe(1);
            expect(json.stats.totalGems).toBe(1);
        });
        it('should deserialize', () => {
            system.cutGem({ name: 'a' });
            const json = system.toJSON();
            const newSys = new GemCutting();
            newSys.fromJSON(json);
            expect(newSys.gems.size).toBe(1);
            expect(newSys.stats.totalGems).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.gemCount).toBe(0);
            expect(stats.totalGems).toBe(0);
            system.cutGem({});
            expect(system.getStats().gemCount).toBe(1);
        });
    });
});
