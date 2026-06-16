/**
 * SectDisaster.test.js - 宗门大劫测试
 * V391 Iteration 7/9 Round 12 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectDisaster } from '../../../systems/ai/SectDisaster.js';

describe('SectDisaster', () => {
    let system;
    beforeEach(() => { system = new SectDisaster(); });

    describe('triggerDisaster', () => {
        it('should trigger', () => {
            const { disaster } = system.triggerDisaster({ sectId: 's1' });
            expect(disaster.sectId).toBe('s1');
        });

        it('should trigger disasterTriggered hook', () => {
            let called = false;
            system.registerHook('disasterTriggered', () => { called = true; });
            system.triggerDisaster({});
            expect(called).toBe(true);
        });
    });

    describe('getDisaster', () => {
        it('should return', () => {
            const { disaster } = system.triggerDisaster({});
            expect(system.getDisaster(disaster.disasterId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDisaster('ghost')).toBeNull(); });
    });

    describe('listDisasters', () => {
        it('should list all', () => {
            system.triggerDisaster({});
            expect(system.listDisasters().length).toBe(1);
        });
    });

    describe('listOngoing', () => {
        it('should filter', () => {
            const { disaster } = system.triggerDisaster({});
            disaster.status = 'ended';
            system.triggerDisaster({});
            expect(system.listOngoing().length).toBe(1);
        });
    });

    describe('listBySect', () => {
        it('should filter', () => {
            system.triggerDisaster({ sectId: 's1' });
            system.triggerDisaster({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.triggerDisaster({ type: 'invasion' });
            system.triggerDisaster({ type: 'plague' });
            expect(system.listByType('invasion').length).toBe(1);
        });
    });

    describe('contributeDefense', () => {
        it('should add', () => {
            const { disaster } = system.triggerDisaster({});
            system.contributeDefense(disaster.disasterId, 50);
            expect(disaster.defense).toBe(50);
        });

        it('should repel when enough', () => {
            const { disaster } = system.triggerDisaster({ impact: 100 });
            system.contributeDefense(disaster.disasterId, 100);
            expect(disaster.status).toBe('repelled');
        });

        it('should reject missing', () => {
            const result = system.contributeDefense('ghost', 10);
            expect(result.error).toBe('DISASTER_NOT_FOUND');
        });

        it('should trigger defenseContributed hook', () => {
            const { disaster } = system.triggerDisaster({});
            let called = false;
            system.registerHook('defenseContributed', () => { called = true; });
            system.contributeDefense(disaster.disasterId, 10);
            expect(called).toBe(true);
        });

        it('should trigger disasterRepelled hook', () => {
            const { disaster } = system.triggerDisaster({ impact: 100 });
            let called = false;
            system.registerHook('disasterRepelled', () => { called = true; });
            system.contributeDefense(disaster.disasterId, 100);
            expect(called).toBe(true);
        });
    });

    describe('endDisaster', () => {
        it('should end', () => {
            const { disaster } = system.triggerDisaster({});
            system.endDisaster(disaster.disasterId);
            expect(disaster.status).toBe('ended');
        });

        it('should reject missing', () => {
            const result = system.endDisaster('ghost');
            expect(result.error).toBe('DISASTER_NOT_FOUND');
        });

        it('should trigger disasterEnded hook', () => {
            const { disaster } = system.triggerDisaster({});
            let called = false;
            system.registerHook('disasterEnded', () => { called = true; });
            system.endDisaster(disaster.disasterId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDefenseRatio', () => {
        it('should calculate', () => {
            const { disaster } = system.triggerDisaster({ impact: 100 });
            system.contributeDefense(disaster.disasterId, 25);
            expect(system.calculateDefenseRatio(disaster.disasterId)).toBeCloseTo(0.25, 5);
        });

        it('should return null for missing', () => {
            expect(system.calculateDefenseRatio('ghost')).toBeNull();
        });
    });

    describe('countByStatus', () => {
        it('should count', () => {
            system.triggerDisaster({});
            system.triggerDisaster({});
            expect(system.countByStatus('ongoing')).toBe(2);
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

        it('should execute default getDisaster', () => {
            const result = system.executeTool('getDisaster', { disasterId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('disasterTriggered', () => count++);
            unregister();
            system.triggerDisaster({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('disasterTriggered', () => { throw new Error('x'); });
            expect(() => system.triggerDisaster({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDisasters = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDisasters = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.triggerDisaster({});
            const json = system.toJSON();
            expect(json.disasters.length).toBe(1);
        });
        it('should deserialize', () => {
            system.triggerDisaster({});
            const json = system.toJSON();
            const newSys = new SectDisaster();
            newSys.fromJSON(json);
            expect(newSys.disasters.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.disasterCount).toBe(0);
        });
    });
});