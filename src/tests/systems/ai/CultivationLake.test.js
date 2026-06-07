/**
 * CultivationLake.test.js - 修真湖系统测试
 * V690 Iteration 13/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationLake } from '../../../systems/ai/CultivationLake.js';

describe('CultivationLake', () => {
    let system;
    beforeEach(() => { system = new CultivationLake(); });

    describe('recruitLake', () => {
        it('should recruit', () => {
            const { lake } = system.recruitLake({ masterId: 'm1', name: 'Azure Lake', type: 'heavenly' });
            expect(lake.masterId).toBe('m1');
            expect(lake.name).toBe('Azure Lake');
            expect(lake.type).toBe('heavenly');
        });

        it('should default to earthly type', () => {
            const { lake } = system.recruitLake({ masterId: 'm1' });
            expect(lake.type).toBe('earthly');
        });

        it('should default depth to baseDepth', () => {
            const { lake } = system.recruitLake({ masterId: 'm1' });
            expect(lake.depth).toBe(20);
        });

        it('should initialize level=1 status=novice', () => {
            const { lake } = system.recruitLake({ masterId: 'm1' });
            expect(lake.level).toBe(1);
            expect(lake.status).toBe('novice');
        });

        it('should initialize empty islands', () => {
            const { lake } = system.recruitLake({ masterId: 'm1' });
            expect(lake.islands).toEqual([]);
        });

        it('should generate lakeId', () => {
            const { lake } = system.recruitLake({ masterId: 'm1' });
            expect(lake.lakeId).toBeTruthy();
        });

        it('should increment stats', () => {
            system.recruitLake({ masterId: 'm1' });
            expect(system.stats.totalLakes).toBe(1);
        });

        it('should trigger lakeRecruited hook', () => {
            let called = false;
            system.registerHook('lakeRecruited', () => { called = true; });
            system.recruitLake({});
            expect(called).toBe(true);
        });
    });

    describe('getLake', () => {
        it('should return', () => {
            const { lake } = system.recruitLake({ masterId: 'm1' });
            expect(system.getLake(lake.lakeId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getLake('ghost')).toBeNull(); });
    });

    describe('listLakes', () => {
        it('should list all', () => {
            system.recruitLake({});
            system.recruitLake({});
            expect(system.listLakes().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listLakes().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitLake({ masterId: 'm1' });
            system.recruitLake({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitLake({ masterId: 'm1' });
            expect(system.listByMaster('m99').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { lake } = system.recruitLake({});
            system.legendLake(lake.lakeId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should not include non-legendary', () => {
            system.recruitLake({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addIsland', () => {
        it('should add island', () => {
            const { lake } = system.recruitLake({});
            system.addIsland(lake.lakeId, { name: 'Island A' });
            expect(lake.islands.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addIsland('ghost', { name: 'X' });
            expect(result.error).toBe('LAKE_NOT_FOUND');
        });

        it('should trigger islandAdded hook', () => {
            const { lake } = system.recruitLake({});
            let called = false;
            system.registerHook('islandAdded', () => { called = true; });
            system.addIsland(lake.lakeId, { name: 'Island A' });
            expect(called).toBe(true);
        });
    });

    describe('deepenDepth', () => {
        it('should deepen', () => {
            const { lake } = system.recruitLake({});
            system.deepenDepth(lake.lakeId, 10);
            expect(lake.depth).toBe(30);
        });

        it('should use default amount=5', () => {
            const { lake } = system.recruitLake({});
            system.deepenDepth(lake.lakeId);
            expect(lake.depth).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.deepenDepth('ghost', 5);
            expect(result.error).toBe('LAKE_NOT_FOUND');
        });

        it('should trigger depthDeepened hook', () => {
            const { lake } = system.recruitLake({});
            let called = false;
            system.registerHook('depthDeepened', () => { called = true; });
            system.deepenDepth(lake.lakeId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpLake', () => {
        it('should level up', () => {
            const { lake } = system.recruitLake({});
            system.levelUpLake(lake.lakeId);
            expect(lake.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpLake('ghost');
            expect(result.error).toBe('LAKE_NOT_FOUND');
        });

        it('should trigger lakeLeveledUp hook', () => {
            const { lake } = system.recruitLake({});
            let called = false;
            system.registerHook('lakeLeveledUp', () => { called = true; });
            system.levelUpLake(lake.lakeId);
            expect(called).toBe(true);
        });
    });

    describe('legendLake', () => {
        it('should legendize', () => {
            const { lake } = system.recruitLake({});
            system.legendLake(lake.lakeId);
            expect(lake.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendLake('ghost');
            expect(result.error).toBe('LAKE_NOT_FOUND');
        });

        it('should trigger lakeLegendized hook', () => {
            const { lake } = system.recruitLake({});
            let called = false;
            system.registerHook('lakeLegendized', () => { called = true; });
            system.legendLake(lake.lakeId);
            expect(called).toBe(true);
        });
    });

    describe('calculateLakeValue', () => {
        it('should calculate', () => {
            const { lake } = system.recruitLake({});
            system.addIsland(lake.lakeId, { name: 'A' });
            // level 1 * 100 + depth 20 * 2 + 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculateLakeValue(lake.lakeId)).toBe(170);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateLakeValue('ghost')).toBe(0);
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

        it('should execute default getLake', () => {
            const result = system.executeTool('getLake', { lakeId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('lakeRecruited', () => count++);
            unregister();
            system.recruitLake({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('lakeRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitLake({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalLakes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalLakes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitLake({});
            const json = system.toJSON();
            expect(json.lakes.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitLake({});
            const json = system.toJSON();
            const newSys = new CultivationLake();
            newSys.fromJSON(json);
            expect(newSys.lakes.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.lakeCount).toBe(0);
        });
    });
});
