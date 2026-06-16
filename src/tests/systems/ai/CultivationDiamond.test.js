/**
 * CultivationDiamond.test.js - 修真钻石系统测试
 * V829 Iteration 2/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDiamond } from '../../../systems/ai/CultivationDiamond.js';

describe('CultivationDiamond', () => {
    let system;
    beforeEach(() => { system = new CultivationDiamond(); });

    describe('recruitDiamond', () => {
        it('should recruit a diamond', () => {
            const { diamond } = system.recruitDiamond({ masterId: 'm1', name: 'BrightStar' });
            expect(diamond.masterId).toBe('m1');
            expect(diamond.name).toBe('BrightStar');
        });

        it('should default type to white', () => {
            const { diamond } = system.recruitDiamond({});
            expect(diamond.type).toBe('white');
        });

        it('should accept type pink', () => {
            const { diamond } = system.recruitDiamond({ type: 'pink' });
            expect(diamond.type).toBe('pink');
        });

        it('should accept type celestial', () => {
            const { diamond } = system.recruitDiamond({ type: 'celestial' });
            expect(diamond.type).toBe('celestial');
        });

        it('should default status to novice', () => {
            const { diamond } = system.recruitDiamond({});
            expect(diamond.status).toBe('novice');
        });

        it('should default hardness to baseHardness', () => {
            const { diamond } = system.recruitDiamond({});
            expect(diamond.hardness).toBe(20);
        });

        it('should default level to 1', () => {
            const { diamond } = system.recruitDiamond({});
            expect(diamond.level).toBe(1);
        });

        it('should generate an id', () => {
            const { diamond } = system.recruitDiamond({});
            expect(diamond.diamondId).toBeTruthy();
        });

        it('should accept custom id', () => {
            const { diamond } = system.recruitDiamond({ id: 'custom_id' });
            expect(diamond.diamondId).toBe('custom_id');
        });

        it('should accept custom hardness', () => {
            const { diamond } = system.recruitDiamond({ hardness: 100 });
            expect(diamond.hardness).toBe(100);
        });

        it('should accept custom facets', () => {
            const { diamond } = system.recruitDiamond({ facets: ['a', 'b'] });
            expect(diamond.facets.length).toBe(2);
        });

        it('should trigger diamondRecruited hook', () => {
            let called = false;
            system.registerHook('diamondRecruited', () => { called = true; });
            system.recruitDiamond({});
            expect(called).toBe(true);
        });

        it('should increment stats', () => {
            system.recruitDiamond({});
            expect(system.stats.totalDiamonds).toBe(1);
        });
    });

    describe('getDiamond', () => {
        it('should return diamond', () => {
            const { diamond } = system.recruitDiamond({});
            expect(system.getDiamond(diamond.diamondId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getDiamond('ghost')).toBeNull();
        });

        it('should return a copy', () => {
            const { diamond } = system.recruitDiamond({});
            const fetched = system.getDiamond(diamond.diamondId);
            expect(fetched).not.toBe(diamond);
        });
    });

    describe('listDiamonds', () => {
        it('should list all', () => {
            system.recruitDiamond({});
            system.recruitDiamond({});
            expect(system.listDiamonds().length).toBe(2);
        });

        it('should return empty', () => {
            expect(system.listDiamonds().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitDiamond({ masterId: 'm1' });
            system.recruitDiamond({ masterId: 'm2' });
            system.recruitDiamond({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitDiamond({ masterId: 'm1' });
            expect(system.listByMaster('mX').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list legendary only', () => {
            const { diamond: d1 } = system.recruitDiamond({});
            const { diamond: d2 } = system.recruitDiamond({});
            system.legendDiamond(d1.diamondId);
            const result = system.listLegendary();
            expect(result.length).toBe(1);
            expect(result[0].diamondId).toBe(d1.diamondId);
        });

        it('should return empty when none legendary', () => {
            system.recruitDiamond({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addFacet', () => {
        it('should add facet', () => {
            const { diamond } = system.recruitDiamond({});
            system.addFacet(diamond.diamondId, 'top-facet');
            expect(diamond.facets).toContain('top-facet');
        });

        it('should add multiple facets', () => {
            const { diamond } = system.recruitDiamond({});
            system.addFacet(diamond.diamondId, 'a');
            system.addFacet(diamond.diamondId, 'b');
            expect(diamond.facets.length).toBe(2);
        });

        it('should reject missing diamond', () => {
            const result = system.addFacet('ghost', 'x');
            expect(result.error).toBe('DIAMOND_NOT_FOUND');
        });

        it('should trigger facetAdded hook', () => {
            const { diamond } = system.recruitDiamond({});
            let called = false;
            system.registerHook('facetAdded', () => { called = true; });
            system.addFacet(diamond.diamondId, 'x');
            expect(called).toBe(true);
        });
    });

    describe('raiseHardness', () => {
        it('should raise hardness with default amount', () => {
            const { diamond } = system.recruitDiamond({});
            system.raiseHardness(diamond.diamondId);
            expect(diamond.hardness).toBe(25);
        });

        it('should raise hardness with custom amount', () => {
            const { diamond } = system.recruitDiamond({});
            system.raiseHardness(diamond.diamondId, 30);
            expect(diamond.hardness).toBe(50);
        });

        it('should reject missing diamond', () => {
            const result = system.raiseHardness('ghost', 10);
            expect(result.error).toBe('DIAMOND_NOT_FOUND');
        });

        it('should trigger hardnessRaised hook', () => {
            const { diamond } = system.recruitDiamond({});
            let called = false;
            system.registerHook('hardnessRaised', () => { called = true; });
            system.raiseHardness(diamond.diamondId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDiamond', () => {
        it('should level up', () => {
            const { diamond } = system.recruitDiamond({});
            system.levelUpDiamond(diamond.diamondId);
            expect(diamond.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { diamond } = system.recruitDiamond({});
            system.levelUpDiamond(diamond.diamondId);
            system.levelUpDiamond(diamond.diamondId);
            system.levelUpDiamond(diamond.diamondId);
            expect(diamond.level).toBe(4);
        });

        it('should reject missing diamond', () => {
            const result = system.levelUpDiamond('ghost');
            expect(result.error).toBe('DIAMOND_NOT_FOUND');
        });
    });

    describe('legendDiamond', () => {
        it('should set status to legendary', () => {
            const { diamond } = system.recruitDiamond({});
            system.legendDiamond(diamond.diamondId);
            expect(diamond.status).toBe('legendary');
        });

        it('should reject missing diamond', () => {
            const result = system.legendDiamond('ghost');
            expect(result.error).toBe('DIAMOND_NOT_FOUND');
        });

        it('should trigger diamondLegendized hook', () => {
            const { diamond } = system.recruitDiamond({});
            let called = false;
            system.registerHook('diamondLegendized', () => { called = true; });
            system.legendDiamond(diamond.diamondId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDiamondValue', () => {
        it('should calculate base value', () => {
            const { diamond } = system.recruitDiamond({});
            // level=1, hardness=20, facets=0 -> 100 + 40 + 0 = 140
            expect(system.calculateDiamondValue(diamond.diamondId)).toBe(140);
        });

        it('should include facets in value', () => {
            const { diamond } = system.recruitDiamond({});
            system.addFacet(diamond.diamondId, 'a');
            system.addFacet(diamond.diamondId, 'b');
            // level=1, hardness=20, facets=2 -> 100 + 40 + 60 = 200
            expect(system.calculateDiamondValue(diamond.diamondId)).toBe(200);
        });

        it('should include level in value', () => {
            const { diamond } = system.recruitDiamond({});
            system.levelUpDiamond(diamond.diamondId);
            system.levelUpDiamond(diamond.diamondId);
            // level=3, hardness=20, facets=0 -> 300 + 40 + 0 = 340
            expect(system.calculateDiamondValue(diamond.diamondId)).toBe(340);
        });

        it('should include hardness in value', () => {
            const { diamond } = system.recruitDiamond({});
            system.raiseHardness(diamond.diamondId, 30);
            // level=1, hardness=50, facets=0 -> 100 + 100 + 0 = 200
            expect(system.calculateDiamondValue(diamond.diamondId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDiamondValue('ghost')).toBe(0);
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

        it('should handle tool errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default getDiamond tool', () => {
            const result = system.executeTool('getDiamond', { diamondId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitDiamond tool', () => {
            const result = system.executeTool('recruitDiamond', { masterId: 'm1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('diamondRecruited', () => count++);
            unregister();
            system.recruitDiamond({});
            expect(count).toBe(0);
        });

        it('should handle hook errors silently', () => {
            system.registerHook('diamondRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDiamond({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient diamonds', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when threshold met', () => {
            system.stats.totalDiamonds = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalDiamonds = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should increase maxDiamonds when evolved', () => {
            const before = system.config.maxDiamonds;
            system.stats.totalDiamonds = 10;
            system.autoEvolve();
            expect(system.config.maxDiamonds).toBeGreaterThan(before);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitDiamond({});
            const json = system.toJSON();
            expect(json.diamonds.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitDiamond({});
            const json = system.toJSON();
            const newSys = new CultivationDiamond();
            newSys.fromJSON(json);
            expect(newSys.diamonds.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with count', () => {
            system.recruitDiamond({});
            const stats = system.getStats();
            expect(stats.diamondCount).toBe(1);
            expect(stats.totalDiamonds).toBe(1);
        });
    });

    describe('config', () => {
        it('should accept custom config', () => {
            const sys = new CultivationDiamond({ maxDiamonds: 50, baseHardness: 100 });
            expect(sys.config.maxDiamonds).toBe(50);
            expect(sys.config.baseHardness).toBe(100);
        });

        it('should use baseHardness for new diamond', () => {
            const sys = new CultivationDiamond({ baseHardness: 50 });
            const { diamond } = sys.recruitDiamond({});
            expect(diamond.hardness).toBe(50);
        });
    });
});
