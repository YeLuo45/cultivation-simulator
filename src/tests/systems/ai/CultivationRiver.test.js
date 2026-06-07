/**
 * CultivationRiver.test.js - 修真河测试
 * V689 Iteration 12/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationRiver } from '../../../systems/ai/CultivationRiver.js';

describe('CultivationRiver', () => {
    let system;
    beforeEach(() => { system = new CultivationRiver(); });

    describe('recruitRiver', () => {
        it('should recruit a river', () => {
            const { river } = system.recruitRiver({ masterId: 'm1', name: 'Yellow River', type: 'heavenly' });
            expect(river.masterId).toBe('m1');
            expect(river.name).toBe('Yellow River');
            expect(river.type).toBe('heavenly');
            expect(river.status).toBe('novice');
            expect(river.level).toBe(1);
        });

        it('should use defaults when not provided', () => {
            const { river } = system.recruitRiver({});
            expect(river.name).toBe('Unnamed River');
            expect(river.type).toBe('earthly');
            expect(river.flow).toBe(20);
            expect(river.tributaries).toEqual([]);
        });

        it('should generate id if not provided', () => {
            const { river } = system.recruitRiver({});
            expect(river.riverId).toBeTruthy();
            expect(typeof river.riverId).toBe('string');
        });

        it('should use provided riverId', () => {
            const { river } = system.recruitRiver({ riverId: 'custom-river-1' });
            expect(river.riverId).toBe('custom-river-1');
        });

        it('should trigger riverRecruited hook', () => {
            let called = false;
            system.registerHook('riverRecruited', () => { called = true; });
            system.recruitRiver({});
            expect(called).toBe(true);
        });

        it('should increment totalRivers stat', () => {
            expect(system.stats.totalRivers).toBe(0);
            system.recruitRiver({});
            expect(system.stats.totalRivers).toBe(1);
            system.recruitRiver({});
            expect(system.stats.totalRivers).toBe(2);
        });
    });

    describe('getRiver', () => {
        it('should return a river', () => {
            const { river } = system.recruitRiver({});
            expect(system.getRiver(river.riverId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getRiver('ghost')).toBeNull();
        });
    });

    describe('listRivers', () => {
        it('should list all', () => {
            system.recruitRiver({});
            system.recruitRiver({});
            expect(system.listRivers().length).toBe(2);
        });

        it('should return empty list when empty', () => {
            expect(system.listRivers().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitRiver({ masterId: 'm1' });
            system.recruitRiver({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty when no match', () => {
            system.recruitRiver({ masterId: 'm1' });
            expect(system.listByMaster('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { river: r1 } = system.recruitRiver({});
            system.recruitRiver({});
            system.legendRiver(r1.riverId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendary', () => {
            system.recruitRiver({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addTributary', () => {
        it('should add tributary', () => {
            const { river } = system.recruitRiver({});
            system.addTributary(river.riverId, 'creek-1');
            expect(river.tributaries.length).toBe(1);
            expect(river.tributaries[0]).toBe('creek-1');
        });

        it('should add multiple tributaries', () => {
            const { river } = system.recruitRiver({});
            system.addTributary(river.riverId, 'tributary-a');
            system.addTributary(river.riverId, 'tributary-b');
            expect(river.tributaries.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addTributary('ghost', 'x');
            expect(result.error).toBe('RIVER_NOT_FOUND');
        });

        it('should trigger tributaryAdded hook', () => {
            const { river } = system.recruitRiver({});
            let called = false;
            system.registerHook('tributaryAdded', () => { called = true; });
            system.addTributary(river.riverId, 'side-stream');
            expect(called).toBe(true);
        });
    });

    describe('raiseFlow', () => {
        it('should raise flow', () => {
            const { river } = system.recruitRiver({});
            system.raiseFlow(river.riverId, 10);
            expect(river.flow).toBe(30);
        });

        it('should use default amount of 5', () => {
            const { river } = system.recruitRiver({});
            system.raiseFlow(river.riverId);
            expect(river.flow).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseFlow('ghost', 5);
            expect(result.error).toBe('RIVER_NOT_FOUND');
        });

        it('should trigger flowRaised hook', () => {
            const { river } = system.recruitRiver({});
            let called = false;
            system.registerHook('flowRaised', () => { called = true; });
            system.raiseFlow(river.riverId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpRiver', () => {
        it('should level up', () => {
            const { river } = system.recruitRiver({});
            system.levelUpRiver(river.riverId);
            expect(river.level).toBe(2);
        });

        it('should increment multiple levels', () => {
            const { river } = system.recruitRiver({});
            system.levelUpRiver(river.riverId);
            system.levelUpRiver(river.riverId);
            system.levelUpRiver(river.riverId);
            expect(river.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpRiver('ghost');
            expect(result.error).toBe('RIVER_NOT_FOUND');
        });

        it('should trigger riverLeveledUp hook', () => {
            const { river } = system.recruitRiver({});
            let called = false;
            system.registerHook('riverLeveledUp', () => { called = true; });
            system.levelUpRiver(river.riverId);
            expect(called).toBe(true);
        });
    });

    describe('legendRiver', () => {
        it('should set status to legendary', () => {
            const { river } = system.recruitRiver({});
            system.legendRiver(river.riverId);
            expect(river.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendRiver('ghost');
            expect(result.error).toBe('RIVER_NOT_FOUND');
        });

        it('should trigger riverLegendized hook', () => {
            const { river } = system.recruitRiver({});
            let called = false;
            system.registerHook('riverLegendized', () => { called = true; });
            system.legendRiver(river.riverId);
            expect(called).toBe(true);
        });
    });

    describe('calculateRiverValue', () => {
        it('should calculate value', () => {
            const { river } = system.recruitRiver({});
            system.addTributary(river.riverId, 'tributary-1');
            // level=1, flow=20 (default baseFlow), tributaries=1
            // 1*100 + 20*2 + 1*30 = 100 + 40 + 30 = 170
            expect(system.calculateRiverValue(river.riverId)).toBe(170);
        });

        it('should reflect level and flow changes', () => {
            const { river } = system.recruitRiver({});
            system.levelUpRiver(river.riverId);
            system.raiseFlow(river.riverId, 10);
            // level=2, flow=30, tributaries=0
            // 2*100 + 30*2 + 0*30 = 200 + 60 + 0 = 260
            expect(system.calculateRiverValue(river.riverId)).toBe(260);
        });

        it('should include multiple tributaries in value', () => {
            const { river } = system.recruitRiver({});
            system.addTributary(river.riverId, 't1');
            system.addTributary(river.riverId, 't2');
            system.addTributary(river.riverId, 't3');
            // level=1, flow=20, tributaries=3
            // 1*100 + 20*2 + 3*30 = 100 + 40 + 90 = 230
            expect(system.calculateRiverValue(river.riverId)).toBe(230);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateRiverValue('ghost')).toBe(0);
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

        it('should default context to empty object', () => {
            system.registerTool('test', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('test', null);
            expect(result.result).toBe(0);
        });

        it('should execute default getRiver', () => {
            const result = system.executeTool('getRiver', { riverId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitRiver', () => {
            const result = system.executeTool('recruitRiver', { name: 'ToolRiver' });
            expect(result.success).toBe(true);
            expect(result.result.river.name).toBe('ToolRiver');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('riverRecruited', () => count++);
            unregister();
            system.recruitRiver({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('riverRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitRiver({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalRivers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalRivers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitRiver({});
            const json = system.toJSON();
            expect(json.rivers.length).toBe(1);
            expect(json.stats.totalRivers).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitRiver({});
            const json = system.toJSON();
            const newSys = new CultivationRiver();
            newSys.fromJSON(json);
            expect(newSys.rivers.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.riverCount).toBe(0);
            expect(stats.totalRivers).toBe(0);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
