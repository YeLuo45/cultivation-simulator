/**
 * CultivationSand.test.js - 修真沙系统测试
 * V843 Iteration 16/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSand } from '../../../systems/ai/CultivationSand.js';

describe('CultivationSand', () => {
    let system;
    beforeEach(() => { system = new CultivationSand(); });

    describe('recruitSand', () => {
        it('should recruit', () => {
            const { sand } = system.recruitSand({ masterId: 'm1', name: 'Desert Sand' });
            expect(sand.masterId).toBe('m1');
            expect(sand.name).toBe('Desert Sand');
        });

        it('should default type to desert', () => {
            const { sand } = system.recruitSand({ masterId: 'm1', name: 'x' });
            expect(sand.type).toBe('desert');
        });

        it('should allow custom type', () => {
            const { sand } = system.recruitSand({ masterId: 'm1', name: 'x', type: 'divine' });
            expect(sand.type).toBe('divine');
        });

        it('should default fineness to baseFineness', () => {
            const { sand } = system.recruitSand({ masterId: 'm1', name: 'x' });
            expect(sand.fineness).toBe(20);
        });

        it('should default grains to empty array', () => {
            const { sand } = system.recruitSand({ masterId: 'm1', name: 'x' });
            expect(sand.grains).toEqual([]);
        });

        it('should default level to 1', () => {
            const { sand } = system.recruitSand({ masterId: 'm1', name: 'x' });
            expect(sand.level).toBe(1);
        });

        it('should default status to novice', () => {
            const { sand } = system.recruitSand({ masterId: 'm1', name: 'x' });
            expect(sand.status).toBe('novice');
        });

        it('should trigger sandRecruited hook', () => {
            let called = false;
            system.registerHook('sandRecruited', () => { called = true; });
            system.recruitSand({ masterId: 'm1', name: 'x' });
            expect(called).toBe(true);
        });

        it('should increment stats.totalSands', () => {
            system.recruitSand({ masterId: 'm1', name: 'x' });
            expect(system.stats.totalSands).toBe(1);
        });
    });

    describe('getSand', () => {
        it('should return sand', () => {
            const { sand } = system.recruitSand({ masterId: 'm1', name: 'x' });
            const got = system.getSand(sand.sandId);
            expect(got).not.toBeNull();
            expect(got.sandId).toBe(sand.sandId);
        });

        it('should return null for missing', () => {
            expect(system.getSand('ghost')).toBeNull();
        });
    });

    describe('listSands', () => {
        it('should list all', () => {
            system.recruitSand({ masterId: 'm1', name: 'a' });
            system.recruitSand({ masterId: 'm2', name: 'b' });
            expect(system.listSands().length).toBe(2);
        });

        it('should return empty array initially', () => {
            expect(system.listSands()).toEqual([]);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitSand({ masterId: 'm1', name: 'a' });
            system.recruitSand({ masterId: 'm2', name: 'b' });
            system.recruitSand({ masterId: 'm1', name: 'c' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitSand({ masterId: 'm1', name: 'a' });
            expect(system.listByMaster('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should return legendary sands', () => {
            const { sand: s1 } = system.recruitSand({ masterId: 'm1', name: 'a' });
            system.recruitSand({ masterId: 'm1', name: 'b' });
            system.legendSand(s1.sandId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitSand({ masterId: 'm1', name: 'a' });
            expect(system.listLegendary()).toEqual([]);
        });
    });

    describe('addGrain', () => {
        it('should add grain', () => {
            const { sand } = system.recruitSand({ masterId: 'm1', name: 'x' });
            system.addGrain(sand.sandId, { kind: 'quartz' });
            expect(sand.grains.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addGrain('ghost', {});
            expect(result.error).toBe('SAND_NOT_FOUND');
        });

        it('should trigger grainAdded hook', () => {
            const { sand } = system.recruitSand({ masterId: 'm1', name: 'x' });
            let called = false;
            system.registerHook('grainAdded', () => { called = true; });
            system.addGrain(sand.sandId, {});
            expect(called).toBe(true);
        });
    });

    describe('raiseFineness', () => {
        it('should raise by default 5', () => {
            const { sand } = system.recruitSand({ masterId: 'm1', name: 'x' });
            system.raiseFineness(sand.sandId);
            expect(sand.fineness).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { sand } = system.recruitSand({ masterId: 'm1', name: 'x' });
            system.raiseFineness(sand.sandId, 10);
            expect(sand.fineness).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raiseFineness('ghost', 5);
            expect(result.error).toBe('SAND_NOT_FOUND');
        });

        it('should trigger finenessRaised hook', () => {
            const { sand } = system.recruitSand({ masterId: 'm1', name: 'x' });
            let called = false;
            system.registerHook('finenessRaised', () => { called = true; });
            system.raiseFineness(sand.sandId, 7);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSand', () => {
        it('should level up', () => {
            const { sand } = system.recruitSand({ masterId: 'm1', name: 'x' });
            system.levelUpSand(sand.sandId);
            expect(sand.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpSand('ghost');
            expect(result.error).toBe('SAND_NOT_FOUND');
        });

        it('should trigger sandLeveledUp hook', () => {
            const { sand } = system.recruitSand({ masterId: 'm1', name: 'x' });
            let called = false;
            system.registerHook('sandLeveledUp', () => { called = true; });
            system.levelUpSand(sand.sandId);
            expect(called).toBe(true);
        });
    });

    describe('legendSand', () => {
        it('should set status to legendary', () => {
            const { sand } = system.recruitSand({ masterId: 'm1', name: 'x' });
            system.legendSand(sand.sandId);
            expect(sand.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSand('ghost');
            expect(result.error).toBe('SAND_NOT_FOUND');
        });

        it('should trigger sandLegendized hook', () => {
            const { sand } = system.recruitSand({ masterId: 'm1', name: 'x' });
            let called = false;
            system.registerHook('sandLegendized', () => { called = true; });
            system.legendSand(sand.sandId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSandValue', () => {
        it('should calculate for new sand', () => {
            const { sand } = system.recruitSand({ masterId: 'm1', name: 'x' });
            // level=1, fineness=20, grains=0 -> 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateSandValue(sand.sandId)).toBe(140);
        });

        it('should account for level, fineness, grains', () => {
            const { sand } = system.recruitSand({ masterId: 'm1', name: 'x' });
            system.levelUpSand(sand.sandId);
            system.raiseFineness(sand.sandId, 5);
            system.addGrain(sand.sandId, {});
            system.addGrain(sand.sandId, {});
            // level=2, fineness=25, grains=2 -> 2*100 + 25*2 + 2*30 = 200 + 50 + 60 = 310
            expect(system.calculateSandValue(sand.sandId)).toBe(310);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSandValue('ghost')).toBe(0);
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

        it('should execute default getSand tool', () => {
            const result = system.executeTool('getSand', { sandId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitSand tool', () => {
            const result = system.executeTool('recruitSand', { masterId: 'm1', name: 'x' });
            expect(result.result.success).toBe(true);
            expect(result.result.sand.masterId).toBe('m1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('sandRecruited', () => count++);
            unregister();
            system.recruitSand({ masterId: 'm1', name: 'x' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('sandRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSand({ masterId: 'm1', name: 'x' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient sands', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve with sufficient sands', () => {
            system.stats.totalSands = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });

        it('should not double evolve', () => {
            system.stats.totalSands = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSand({ masterId: 'm1', name: 'x' });
            const json = system.toJSON();
            expect(json.sands.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitSand({ masterId: 'm1', name: 'x' });
            const json = system.toJSON();
            const newSys = new CultivationSand();
            newSys.fromJSON(json);
            expect(newSys.sands.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recruitSand({ masterId: 'm1', name: 'x' });
            const stats = system.getStats();
            expect(stats.sandCount).toBe(1);
            expect(stats.totalSands).toBe(1);
        });
    });
});
