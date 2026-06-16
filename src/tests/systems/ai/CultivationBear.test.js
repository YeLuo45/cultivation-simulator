/**
 * CultivationBear.test.js - 修真熊测试
 * V719 Iteration 12/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationBear } from '../../../systems/ai/CultivationBear.js';

describe('CultivationBear', () => {
    let system;
    beforeEach(() => { system = new CultivationBear(); });

    describe('recruitBear', () => {
        it('should create bear with name', () => {
            const { bear } = system.recruitBear({ name: 'Misha' });
            expect(bear.name).toBe('Misha');
        });

        it('should default type to brown', () => {
            const { bear } = system.recruitBear({});
            expect(bear.type).toBe('brown');
        });

        it('should default strength to baseStrength', () => {
            const { bear } = system.recruitBear({});
            expect(bear.strength).toBe(20);
        });

        it('should default level to 1', () => {
            const { bear } = system.recruitBear({});
            expect(bear.level).toBe(1);
        });

        it('should default status to novice', () => {
            const { bear } = system.recruitBear({});
            expect(bear.status).toBe('novice');
        });

        it('should default cubs to empty array', () => {
            const { bear } = system.recruitBear({});
            expect(bear.cubs).toEqual([]);
        });

        it('should default masterId to unknown', () => {
            const { bear } = system.recruitBear({});
            expect(bear.masterId).toBe('unknown');
        });

        it('should generate bearId', () => {
            const { bear } = system.recruitBear({});
            expect(bear.bearId).toBeDefined();
        });

        it('should store bear in map', () => {
            const { bear } = system.recruitBear({ name: 'X' });
            expect(system.bears.has(bear.bearId)).toBe(true);
        });

        it('should increment totalBears stats', () => {
            system.recruitBear({});
            expect(system.stats.totalBears).toBe(1);
        });

        it('should trigger bearRecruited hook', () => {
            let called = false;
            system.registerHook('bearRecruited', () => { called = true; });
            system.recruitBear({});
            expect(called).toBe(true);
        });

        it('should accept custom id', () => {
            const { bear } = system.recruitBear({ id: 'custom_bear' });
            expect(bear.bearId).toBe('custom_bear');
        });
    });

    describe('getBear', () => {
        it('should return bear', () => {
            const { bear } = system.recruitBear({});
            expect(system.getBear(bear.bearId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getBear('ghost')).toBeNull();
        });
    });

    describe('listBears', () => {
        it('should list all', () => {
            system.recruitBear({});
            system.recruitBear({});
            expect(system.listBears().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listBears().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitBear({ masterId: 'm1' });
            system.recruitBear({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for missing master', () => {
            system.recruitBear({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitBear({ type: 'polar' });
            system.recruitBear({ type: 'spirit' });
            expect(system.listByType('polar').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            const { bear } = system.recruitBear({});
            system.legendBear(bear.bearId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitBear({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addCub', () => {
        it('should add cub', () => {
            const { bear } = system.recruitBear({});
            system.addCub(bear.bearId, 'CubA');
            expect(bear.cubs.length).toBe(1);
        });

        it('should reject missing bear', () => {
            const result = system.addCub('ghost', 'CubA');
            expect(result.error).toBe('BEAR_NOT_FOUND');
        });

        it('should trigger cubAdded hook', () => {
            const { bear } = system.recruitBear({});
            let called = false;
            system.registerHook('cubAdded', () => { called = true; });
            system.addCub(bear.bearId, 'CubA');
            expect(called).toBe(true);
        });
    });

    describe('raiseStrength', () => {
        it('should raise strength', () => {
            const { bear } = system.recruitBear({});
            system.raiseStrength(bear.bearId, 5);
            expect(bear.strength).toBe(25);
        });

        it('should default amount to 5', () => {
            const { bear } = system.recruitBear({});
            system.raiseStrength(bear.bearId);
            expect(bear.strength).toBe(25);
        });

        it('should reject missing bear', () => {
            const result = system.raiseStrength('ghost', 5);
            expect(result.error).toBe('BEAR_NOT_FOUND');
        });

        it('should trigger strengthRaised hook', () => {
            const { bear } = system.recruitBear({});
            let called = false;
            system.registerHook('strengthRaised', () => { called = true; });
            system.raiseStrength(bear.bearId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpBear', () => {
        it('should level up', () => {
            const { bear } = system.recruitBear({});
            system.levelUpBear(bear.bearId);
            expect(bear.level).toBe(2);
        });

        it('should reject missing bear', () => {
            const result = system.levelUpBear('ghost');
            expect(result.error).toBe('BEAR_NOT_FOUND');
        });

        it('should trigger bearLeveledUp hook', () => {
            const { bear } = system.recruitBear({});
            let called = false;
            system.registerHook('bearLeveledUp', () => { called = true; });
            system.levelUpBear(bear.bearId);
            expect(called).toBe(true);
        });
    });

    describe('legendBear', () => {
        it('should set status to legendary', () => {
            const { bear } = system.recruitBear({});
            system.legendBear(bear.bearId);
            expect(bear.status).toBe('legendary');
        });

        it('should reject missing bear', () => {
            const result = system.legendBear('ghost');
            expect(result.error).toBe('BEAR_NOT_FOUND');
        });

        it('should trigger bearLegendized hook', () => {
            const { bear } = system.recruitBear({});
            let called = false;
            system.registerHook('bearLegendized', () => { called = true; });
            system.legendBear(bear.bearId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBearValue', () => {
        it('should calculate correctly', () => {
            const { bear } = system.recruitBear({});
            // level=1, strength=20, cubs=0 => 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateBearValue(bear.bearId)).toBe(140);
        });

        it('should include cubs in value', () => {
            const { bear } = system.recruitBear({});
            system.addCub(bear.bearId, 'CubA');
            system.addCub(bear.bearId, 'CubB');
            // 1*100 + 20*2 + 2*30 = 100 + 40 + 60 = 200
            expect(system.calculateBearValue(bear.bearId)).toBe(200);
        });

        it('should include level in value', () => {
            const { bear } = system.recruitBear({});
            system.levelUpBear(bear.bearId);
            // 2*100 + 20*2 + 0*30 = 240
            expect(system.calculateBearValue(bear.bearId)).toBe(240);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBearValue('ghost')).toBe(0);
        });
    });

    describe('deleteBear', () => {
        it('should delete', () => {
            const { bear } = system.recruitBear({});
            const result = system.deleteBear(bear.bearId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteBear('ghost');
            expect(result.error).toBe('BEAR_NOT_FOUND');
        });

        it('should trigger bearDeleted hook', () => {
            const { bear } = system.recruitBear({});
            let called = false;
            system.registerHook('bearDeleted', () => { called = true; });
            system.deleteBear(bear.bearId);
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
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default getBear', () => {
            const { bear } = system.recruitBear({});
            const result = system.executeTool('getBear', { bearId: bear.bearId });
            expect(result.result).not.toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('bearRecruited', () => count++);
            unregister();
            system.recruitBear({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('bearRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitBear({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalBears = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalBears = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitBear({});
            const json = system.toJSON();
            expect(json.bears.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitBear({});
            const json = system.toJSON();
            const newSys = new CultivationBear();
            newSys.fromJSON(json);
            expect(newSys.bears.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with bearCount', () => {
            const stats = system.getStats();
            expect(stats.bearCount).toBe(0);
        });
    });
});
