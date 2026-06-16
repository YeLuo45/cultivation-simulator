/**
 * CultivationElder.test.js - 修真长老测试
 * V664 Iteration 17/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationElder } from '../../../systems/ai/CultivationElder.js';

describe('CultivationElder', () => {
    let system;
    beforeEach(() => { system = new CultivationElder(); });

    describe('recruitElder', () => {
        it('should recruit an elder', () => {
            const { elder } = system.recruitElder({ sectId: 's1', name: 'Elder Zhao', type: 'inner' });
            expect(elder.sectId).toBe('s1');
            expect(elder.name).toBe('Elder Zhao');
            expect(elder.type).toBe('inner');
            expect(elder.status).toBe('novice');
            expect(elder.level).toBe(1);
        });

        it('should use defaults when not provided', () => {
            const { elder } = system.recruitElder({});
            expect(elder.name).toBe('Unnamed Elder');
            expect(elder.type).toBe('inner');
            expect(elder.wisdom).toBe(20);
            expect(elder.decrees).toEqual([]);
        });

        it('should generate id if not provided', () => {
            const { elder } = system.recruitElder({});
            expect(elder.elderId).toBeTruthy();
            expect(typeof elder.elderId).toBe('string');
        });

        it('should use provided elderId', () => {
            const { elder } = system.recruitElder({ elderId: 'custom-elder-1' });
            expect(elder.elderId).toBe('custom-elder-1');
        });

        it('should trigger elderRecruited hook', () => {
            let called = false;
            system.registerHook('elderRecruited', () => { called = true; });
            system.recruitElder({});
            expect(called).toBe(true);
        });

        it('should increment totalElders stat', () => {
            expect(system.stats.totalElders).toBe(0);
            system.recruitElder({});
            expect(system.stats.totalElders).toBe(1);
            system.recruitElder({});
            expect(system.stats.totalElders).toBe(2);
        });

        it('should accept honorary type', () => {
            const { elder } = system.recruitElder({ type: 'honorary' });
            expect(elder.type).toBe('honorary');
        });

        it('should accept outer type', () => {
            const { elder } = system.recruitElder({ type: 'outer' });
            expect(elder.type).toBe('outer');
        });
    });

    describe('getElder', () => {
        it('should return an elder', () => {
            const { elder } = system.recruitElder({});
            expect(system.getElder(elder.elderId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getElder('ghost')).toBeNull();
        });
        it('should return a copy, not a reference', () => {
            const { elder } = system.recruitElder({});
            const got = system.getElder(elder.elderId);
            got.name = 'Modified';
            expect(elder.name).toBe('Unnamed Elder');
        });
    });

    describe('listElders', () => {
        it('should list all', () => {
            system.recruitElder({});
            system.recruitElder({});
            expect(system.listElders().length).toBe(2);
        });

        it('should return empty list when empty', () => {
            expect(system.listElders().length).toBe(0);
        });
    });

    describe('listBySect', () => {
        it('should filter by sect', () => {
            system.recruitElder({ sectId: 's1' });
            system.recruitElder({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });

        it('should return empty when no match', () => {
            system.recruitElder({ sectId: 's1' });
            expect(system.listBySect('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { elder: e1 } = system.recruitElder({});
            system.recruitElder({});
            system.legendElder(e1.elderId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendary', () => {
            system.recruitElder({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addDecree', () => {
        it('should add decree', () => {
            const { elder } = system.recruitElder({});
            system.addDecree(elder.elderId, 'no-pets-allowed');
            expect(elder.decrees.length).toBe(1);
            expect(elder.decrees[0]).toBe('no-pets-allowed');
        });

        it('should reject missing', () => {
            const result = system.addDecree('ghost', 'x');
            expect(result.error).toBe('ELDER_NOT_FOUND');
        });

        it('should trigger decreeAdded hook', () => {
            const { elder } = system.recruitElder({});
            let called = false;
            system.registerHook('decreeAdded', () => { called = true; });
            system.addDecree(elder.elderId, 'silence-decree');
            expect(called).toBe(true);
        });

        it('should add multiple decrees', () => {
            const { elder } = system.recruitElder({});
            system.addDecree(elder.elderId, 'd1');
            system.addDecree(elder.elderId, 'd2');
            system.addDecree(elder.elderId, 'd3');
            expect(elder.decrees.length).toBe(3);
        });
    });

    describe('deepenWisdom', () => {
        it('should deepen wisdom', () => {
            const { elder } = system.recruitElder({});
            system.deepenWisdom(elder.elderId, 10);
            expect(elder.wisdom).toBe(30);
        });

        it('should use default amount of 5', () => {
            const { elder } = system.recruitElder({});
            system.deepenWisdom(elder.elderId);
            expect(elder.wisdom).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.deepenWisdom('ghost', 5);
            expect(result.error).toBe('ELDER_NOT_FOUND');
        });

        it('should trigger wisdomDeepened hook', () => {
            const { elder } = system.recruitElder({});
            let called = false;
            system.registerHook('wisdomDeepened', () => { called = true; });
            system.deepenWisdom(elder.elderId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpElder', () => {
        it('should level up', () => {
            const { elder } = system.recruitElder({});
            system.levelUpElder(elder.elderId);
            expect(elder.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { elder } = system.recruitElder({});
            system.levelUpElder(elder.elderId);
            system.levelUpElder(elder.elderId);
            system.levelUpElder(elder.elderId);
            expect(elder.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpElder('ghost');
            expect(result.error).toBe('ELDER_NOT_FOUND');
        });

        it('should trigger elderLeveledUp hook', () => {
            const { elder } = system.recruitElder({});
            let called = false;
            system.registerHook('elderLeveledUp', () => { called = true; });
            system.levelUpElder(elder.elderId);
            expect(called).toBe(true);
        });
    });

    describe('legendElder', () => {
        it('should set status to legendary', () => {
            const { elder } = system.recruitElder({});
            system.legendElder(elder.elderId);
            expect(elder.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendElder('ghost');
            expect(result.error).toBe('ELDER_NOT_FOUND');
        });

        it('should trigger elderLegendized hook', () => {
            const { elder } = system.recruitElder({});
            let called = false;
            system.registerHook('elderLegendized', () => { called = true; });
            system.legendElder(elder.elderId);
            expect(called).toBe(true);
        });
    });

    describe('calculateElderValue', () => {
        it('should calculate value', () => {
            const { elder } = system.recruitElder({});
            system.addDecree(elder.elderId, 'decree-1');
            // level=1, wisdom=20 (default baseWisdom), decrees=1
            // 1*100 + 20*2 + 1*30 = 100 + 40 + 30 = 170
            expect(system.calculateElderValue(elder.elderId)).toBe(170);
        });

        it('should reflect level and wisdom changes', () => {
            const { elder } = system.recruitElder({});
            system.levelUpElder(elder.elderId);
            system.deepenWisdom(elder.elderId, 10);
            // level=2, wisdom=30, decrees=0
            // 2*100 + 30*2 + 0*30 = 200 + 60 + 0 = 260
            expect(system.calculateElderValue(elder.elderId)).toBe(260);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateElderValue('ghost')).toBe(0);
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

        it('should execute default getElder', () => {
            const result = system.executeTool('getElder', { elderId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitElder', () => {
            const result = system.executeTool('recruitElder', { name: 'ToolElder' });
            expect(result.success).toBe(true);
            expect(result.result.elder.name).toBe('ToolElder');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('elderRecruited', () => count++);
            unregister();
            system.recruitElder({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('elderRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitElder({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalElders = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalElders = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitElder({});
            const json = system.toJSON();
            expect(json.elders.length).toBe(1);
            expect(json.stats.totalElders).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitElder({});
            const json = system.toJSON();
            const newSys = new CultivationElder();
            newSys.fromJSON(json);
            expect(newSys.elders.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.elderCount).toBe(0);
            expect(stats.totalElders).toBe(0);
            expect(stats.evolutionCount).toBe(0);
        });
    });

    describe('Config', () => {
        it('should use default config', () => {
            expect(system.config.maxElders).toBe(20);
            expect(system.config.baseWisdom).toBe(20);
        });
        it('should accept custom config', () => {
            const custom = new CultivationElder({ maxElders: 50, baseWisdom: 100 });
            expect(custom.config.maxElders).toBe(50);
            expect(custom.config.baseWisdom).toBe(100);
        });
    });
});
