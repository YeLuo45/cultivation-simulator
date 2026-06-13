/**
 * CultivationChronos.test.js - 修真时间测试
 * V827 Iteration 30/30 FINAL Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationChronos } from '../../../systems/ai/CultivationChronos.js';

describe('CultivationChronos', () => {
    let system;
    beforeEach(() => { system = new CultivationChronos(); });

    describe('flowChronos', () => {
        it('should flow', () => {
            const { chronos } = system.flowChronos({ name: 'Flow' });
            expect(chronos.name).toBe('Flow');
        });
        it('should initialize empty moments', () => {
            const { chronos } = system.flowChronos({});
            expect(chronos.moments).toEqual([]);
        });
        it('should trigger chronosFlowed hook', () => {
            let called = false;
            system.registerHook('chronosFlowed', () => { called = true; });
            system.flowChronos({});
            expect(called).toBe(true);
        });
    });

    describe('getChronos', () => {
        it('should return', () => {
            const { chronos } = system.flowChronos({});
            expect(system.getChronos(chronos.chronosId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getChronos('ghost')).toBeNull(); });
    });

    describe('listChronoses', () => {
        it('should list all', () => {
            system.flowChronos({});
            expect(system.listChronoses().length).toBe(1);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.flowChronos({ masterId: 'm1' });
            system.flowChronos({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listByEpoch', () => {
        it('should filter', () => {
            system.flowChronos({ epoch: 'past' });
            system.flowChronos({ epoch: 'future' });
            expect(system.listByEpoch('past').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.flowChronos({ type: 'linear' });
            system.flowChronos({ type: 'cyclic' });
            expect(system.listByType('linear').length).toBe(1);
        });
    });

    describe('listVeteran', () => {
        it('should list veteran+', () => {
            system.flowChronos({});
            expect(system.listVeteran().length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            system.flowChronos({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('listTop', () => {
        it('should return top', () => {
            system.flowChronos({});
            expect(system.listTop(2).length).toBe(1);
        });
    });

    describe('addMoment', () => {
        it('should add', () => {
            const { chronos } = system.flowChronos({});
            system.addMoment(chronos.chronosId, 'big-bang');
            expect(chronos.moments.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addMoment('ghost', 'moment');
            expect(result.error).toBe('CHRONOS_NOT_FOUND');
        });

        it('should trigger momentAdded hook', () => {
            const { chronos } = system.flowChronos({});
            let called = false;
            system.registerHook('momentAdded', () => { called = true; });
            system.addMoment(chronos.chronosId, 'moment');
            expect(called).toBe(true);
        });
    });

    describe('raiseEternity', () => {
        it('should raise', () => {
            const { chronos } = system.flowChronos({});
            system.raiseEternity(chronos.chronosId, 5);
            expect(chronos.eternity).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseEternity('ghost', 5);
            expect(result.error).toBe('CHRONOS_NOT_FOUND');
        });

        it('should trigger eternityRaised hook', () => {
            const { chronos } = system.flowChronos({});
            let called = false;
            system.registerHook('eternityRaised', () => { called = true; });
            system.raiseEternity(chronos.chronosId, 5);
            expect(called).toBe(true);
        });
    });

    describe('promoteChronos', () => {
        it('should promote', () => {
            const { chronos } = system.flowChronos({});
            system.promoteChronos(chronos.chronosId);
            expect(chronos.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.promoteChronos('ghost');
            expect(result.error).toBe('CHRONOS_NOT_FOUND');
        });

        it('should trigger chronosPromoted hook', () => {
            const { chronos } = system.flowChronos({});
            let called = false;
            system.registerHook('chronosPromoted', () => { called = true; });
            system.promoteChronos(chronos.chronosId);
            expect(called).toBe(true);
        });
    });

    describe('veteranizeChronos', () => {
        it('should veteranize', () => {
            const { chronos } = system.flowChronos({});
            system.veteranizeChronos(chronos.chronosId);
            expect(chronos.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.veteranizeChronos('ghost');
            expect(result.error).toBe('CHRONOS_NOT_FOUND');
        });

        it('should trigger chronosVeteranized hook', () => {
            const { chronos } = system.flowChronos({});
            let called = false;
            system.registerHook('chronosVeteranized', () => { called = true; });
            system.veteranizeChronos(chronos.chronosId);
            expect(called).toBe(true);
        });
    });

    describe('legendizeChronos', () => {
        it('should legendize', () => {
            const { chronos } = system.flowChronos({});
            system.legendizeChronos(chronos.chronosId);
            expect(chronos.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendizeChronos('ghost');
            expect(result.error).toBe('CHRONOS_NOT_FOUND');
        });

        it('should trigger chronosLegendized hook', () => {
            const { chronos } = system.flowChronos({});
            let called = false;
            system.registerHook('chronosLegendized', () => { called = true; });
            system.legendizeChronos(chronos.chronosId);
            expect(called).toBe(true);
        });
    });

    describe('changeType', () => {
        it('should change', () => {
            const { chronos } = system.flowChronos({});
            system.changeType(chronos.chronosId, 'cyclic');
            expect(chronos.type).toBe('cyclic');
        });

        it('should reject missing', () => {
            const result = system.changeType('ghost', 'cyclic');
            expect(result.error).toBe('CHRONOS_NOT_FOUND');
        });

        it('should trigger typeChanged hook', () => {
            const { chronos } = system.flowChronos({});
            let called = false;
            system.registerHook('typeChanged', () => { called = true; });
            system.changeType(chronos.chronosId, 'cyclic');
            expect(called).toBe(true);
        });
    });

    describe('changeEpoch', () => {
        it('should change', () => {
            const { chronos } = system.flowChronos({});
            system.changeEpoch(chronos.chronosId, 'future');
            expect(chronos.epoch).toBe('future');
        });

        it('should reject missing', () => {
            const result = system.changeEpoch('ghost', 'future');
            expect(result.error).toBe('CHRONOS_NOT_FOUND');
        });

        it('should trigger epochChanged hook', () => {
            const { chronos } = system.flowChronos({});
            let called = false;
            system.registerHook('epochChanged', () => { called = true; });
            system.changeEpoch(chronos.chronosId, 'future');
            expect(called).toBe(true);
        });
    });

    describe('tickChronos', () => {
        it('should tick', () => {
            const { chronos } = system.flowChronos({});
            system.tickChronos(chronos.chronosId);
            expect(chronos.lastFlow).toBeGreaterThan(0);
        });

        it('should reject missing', () => {
            const result = system.tickChronos('ghost');
            expect(result.error).toBe('CHRONOS_NOT_FOUND');
        });

        it('should trigger chronosTicked hook', () => {
            const { chronos } = system.flowChronos({});
            let called = false;
            system.registerHook('chronosTicked', () => { called = true; });
            system.tickChronos(chronos.chronosId);
            expect(called).toBe(true);
        });
    });

    describe('calculateChronosValue', () => {
        it('should calculate', () => {
            const { chronos } = system.flowChronos({});
            expect(system.calculateChronosValue(chronos.chronosId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateChronosValue('ghost')).toBe(0);
        });
    });

    describe('mergeChronoses', () => {
        it('should merge', () => {
            const a = system.flowChronos({}).chronos;
            const b = system.flowChronos({}).chronos;
            const result = system.mergeChronoses(a.chronosId, b.chronosId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.mergeChronoses('ghost', 'ghost2');
            expect(result.error).toBe('CHRONOS_NOT_FOUND');
        });

        it('should trigger chronosesMerged hook', () => {
            const a = system.flowChronos({}).chronos;
            const b = system.flowChronos({}).chronos;
            let called = false;
            system.registerHook('chronosesMerged', () => { called = true; });
            system.mergeChronoses(a.chronosId, b.chronosId);
            expect(called).toBe(true);
        });
    });

    describe('deleteChronos', () => {
        it('should delete', () => {
            const { chronos } = system.flowChronos({});
            const result = system.deleteChronos(chronos.chronosId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteChronos('ghost');
            expect(result.error).toBe('CHRONOS_NOT_FOUND');
        });

        it('should trigger chronosDeleted hook', () => {
            const { chronos } = system.flowChronos({});
            let called = false;
            system.registerHook('chronosDeleted', () => { called = true; });
            system.deleteChronos(chronos.chronosId);
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

        it('should execute default listByEpoch', () => {
            system.flowChronos({ epoch: 'past' });
            const result = system.executeTool('listByEpoch', { epoch: 'past' });
            expect(result.result.length).toBe(1);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('chronosFlowed', () => count++);
            unregister();
            system.flowChronos({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('chronosFlowed', () => { throw new Error('x'); });
            expect(() => system.flowChronos({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalFlowed = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalFlowed = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.flowChronos({});
            const json = system.toJSON();
            expect(json.chronos.length).toBe(1);
        });
        it('should deserialize', () => {
            system.flowChronos({});
            const json = system.toJSON();
            const newSys = new CultivationChronos();
            newSys.fromJSON(json);
            expect(newSys.chronos.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.chronosCount).toBe(0);
        });
    });
});