/**
 * CultivationFlow.test.js - 修真流系统测试
 * V744 Iteration 7/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationFlow } from '../../../systems/ai/CultivationFlow.js';

describe('CultivationFlow', () => {
    let system;
    beforeEach(() => { system = new CultivationFlow(); });

    describe('recruitFlow', () => {
        it('should recruit', () => {
            const { flow } = system.recruitFlow({ masterId: 'm1', name: 'river-flow' });
            expect(flow.masterId).toBe('m1');
            expect(flow.name).toBe('river-flow');
        });

        it('should set defaults', () => {
            const { flow } = system.recruitFlow({});
            expect(flow.type).toBe('water');
            expect(flow.fluidity).toBe(20);
            expect(flow.level).toBe(1);
            expect(flow.status).toBe('novice');
            expect(flow.streams).toEqual([]);
        });

        it('should allow custom type and fluidity', () => {
            const { flow } = system.recruitFlow({ type: 'air', fluidity: 50 });
            expect(flow.type).toBe('air');
            expect(flow.fluidity).toBe(50);
        });

        it('should accept custom streams', () => {
            const { flow } = system.recruitFlow({ streams: ['s1', 's2'] });
            expect(flow.streams.length).toBe(2);
        });

        it('should trigger flowRecruited hook', () => {
            let called = false;
            system.registerHook('flowRecruited', () => { called = true; });
            system.recruitFlow({});
            expect(called).toBe(true);
        });

        it('should reject when max reached', () => {
            system.config.maxFlows = 1;
            system.recruitFlow({});
            const result = system.recruitFlow({});
            expect(result.error).toBe('MAX_FLOWS_REACHED');
        });
    });

    describe('getFlow', () => {
        it('should return', () => {
            const { flow } = system.recruitFlow({});
            expect(system.getFlow(flow.flowId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getFlow('ghost')).toBeNull(); });
    });

    describe('listFlows', () => {
        it('should list all', () => {
            system.recruitFlow({});
            system.recruitFlow({});
            expect(system.listFlows().length).toBe(2);
        });
        it('should return empty when none', () => {
            expect(system.listFlows().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitFlow({ masterId: 'm1' });
            system.recruitFlow({ masterId: 'm2' });
            system.recruitFlow({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { flow: f1 } = system.recruitFlow({});
            const { flow: f2 } = system.recruitFlow({});
            system.legendFlow(f2.flowId);
            const leg = system.listLegendary();
            expect(leg.length).toBe(1);
            expect(leg[0].flowId).toBe(f2.flowId);
        });

        it('should return empty when no legends', () => {
            system.recruitFlow({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addStream', () => {
        it('should add stream', () => {
            const { flow } = system.recruitFlow({});
            system.addStream(flow.flowId, 'stream-1');
            expect(flow.streams).toContain('stream-1');
        });

        it('should add multiple streams', () => {
            const { flow } = system.recruitFlow({});
            system.addStream(flow.flowId, 'a');
            system.addStream(flow.flowId, 'b');
            expect(flow.streams.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addStream('ghost', 'x');
            expect(result.error).toBe('FLOW_NOT_FOUND');
        });

        it('should trigger streamAdded hook', () => {
            const { flow } = system.recruitFlow({});
            let called = false;
            system.registerHook('streamAdded', () => { called = true; });
            system.addStream(flow.flowId, 'x');
            expect(called).toBe(true);
        });
    });

    describe('raiseFluidity', () => {
        it('should raise fluidity with default amount', () => {
            const { flow } = system.recruitFlow({});
            system.raiseFluidity(flow.flowId);
            expect(flow.fluidity).toBe(25);
        });

        it('should raise fluidity with custom amount', () => {
            const { flow } = system.recruitFlow({});
            system.raiseFluidity(flow.flowId, 10);
            expect(flow.fluidity).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raiseFluidity('ghost', 5);
            expect(result.error).toBe('FLOW_NOT_FOUND');
        });

        it('should trigger fluidityRaised hook', () => {
            const { flow } = system.recruitFlow({});
            let called = false;
            system.registerHook('fluidityRaised', () => { called = true; });
            system.raiseFluidity(flow.flowId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpFlow', () => {
        it('should level up', () => {
            const { flow } = system.recruitFlow({});
            system.levelUpFlow(flow.flowId);
            expect(flow.level).toBe(2);
        });

        it('should become veteran at level 5', () => {
            const { flow } = system.recruitFlow({});
            for (let i = 0; i < 4; i++) system.levelUpFlow(flow.flowId);
            expect(flow.level).toBe(5);
            expect(flow.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.levelUpFlow('ghost');
            expect(result.error).toBe('FLOW_NOT_FOUND');
        });

        it('should trigger flowLeveledUp hook', () => {
            const { flow } = system.recruitFlow({});
            let called = false;
            system.registerHook('flowLeveledUp', () => { called = true; });
            system.levelUpFlow(flow.flowId);
            expect(called).toBe(true);
        });
    });

    describe('legendFlow', () => {
        it('should set status to legendary', () => {
            const { flow } = system.recruitFlow({});
            system.legendFlow(flow.flowId);
            expect(flow.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendFlow('ghost');
            expect(result.error).toBe('FLOW_NOT_FOUND');
        });

        it('should trigger flowLegendized hook', () => {
            const { flow } = system.recruitFlow({});
            let called = false;
            system.registerHook('flowLegendized', () => { called = true; });
            system.legendFlow(flow.flowId);
            expect(called).toBe(true);
        });
    });

    describe('calculateFlowValue', () => {
        it('should calculate', () => {
            const { flow } = system.recruitFlow({});
            // level=1, fluidity=20, streams=[] => 1*100 + 20*2 + 0 = 140
            expect(system.calculateFlowValue(flow.flowId)).toBe(140);
        });

        it('should include streams', () => {
            const { flow } = system.recruitFlow({});
            system.addStream(flow.flowId, 'a');
            system.addStream(flow.flowId, 'b');
            // level=1, fluidity=20, streams=2 => 100 + 40 + 60 = 200
            expect(system.calculateFlowValue(flow.flowId)).toBe(200);
        });

        it('should include level', () => {
            const { flow } = system.recruitFlow({});
            system.levelUpFlow(flow.flowId);
            // level=2, fluidity=20, streams=0 => 200 + 40 + 0 = 240
            expect(system.calculateFlowValue(flow.flowId)).toBe(240);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateFlowValue('ghost')).toBe(0);
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

        it('should execute default getFlow', () => {
            const result = system.executeTool('getFlow', { flowId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitFlow', () => {
            const result = system.executeTool('recruitFlow', { masterId: 'm1' });
            expect(result.success).toBe(true);
            expect(result.result.flow.masterId).toBe('m1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('flowRecruited', () => count++);
            unregister();
            system.recruitFlow({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('flowRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitFlow({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalFlows = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalFlows = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitFlow({});
            const json = system.toJSON();
            expect(json.flows.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitFlow({});
            const json = system.toJSON();
            const newSys = new CultivationFlow();
            newSys.fromJSON(json);
            expect(newSys.flows.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recruitFlow({});
            const stats = system.getStats();
            expect(stats.flowCount).toBe(1);
            expect(stats.totalFlows).toBe(1);
        });
    });
});
