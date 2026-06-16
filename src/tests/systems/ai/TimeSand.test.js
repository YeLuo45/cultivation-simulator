/**
 * TimeSand.test.js - 时之沙系统测试
 * V433 Iteration 10/15 Round 15 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TimeSand } from '../../../systems/ai/TimeSand.js';

describe('TimeSand', () => {
    let system;
    beforeEach(() => { system = new TimeSand(); });

    describe('gatherSand', () => {
        it('should create with default values', () => {
            const { sand } = system.gatherSand({ masterId: 'm1' });
            expect(sand.masterId).toBe('m1');
            expect(sand.name).toBe('Time Sand');
            expect(sand.flow).toBe(10);
            expect(sand.grains).toBe(10);
            expect(sand.dilution).toBe(0);
            expect(sand.frozen).toBe(false);
            expect(sand.status).toBe('flowing');
        });

        it('should create with custom values', () => {
            const { sand } = system.gatherSand({ masterId: 'm1', name: 'Hourglass', flow: 50, grains: 100, dilution: 5 });
            expect(sand.name).toBe('Hourglass');
            expect(sand.flow).toBe(50);
            expect(sand.grains).toBe(100);
            expect(sand.dilution).toBe(5);
        });

        it('should trigger sandGathered hook', () => {
            let called = false;
            system.registerHook('sandGathered', () => { called = true; });
            system.gatherSand({});
            expect(called).toBe(true);
        });
    });

    describe('getSand', () => {
        it('should return sand', () => {
            const { sand } = system.gatherSand({});
            expect(system.getSand(sand.sandId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getSand('ghost')).toBeNull();
        });
    });

    describe('listSands', () => {
        it('should list all', () => {
            system.gatherSand({});
            system.gatherSand({});
            expect(system.listSands().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listSands().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.gatherSand({ masterId: 'm1' });
            system.gatherSand({ masterId: 'm2' });
            system.gatherSand({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.gatherSand({ masterId: 'm1' });
            expect(system.listByMaster('unknown').length).toBe(0);
        });
    });

    describe('listFlowing', () => {
        it('should only list flowing sands', () => {
            const { sand: s1 } = system.gatherSand({});
            const { sand: s2 } = system.gatherSand({});
            system.freezeSand(s1.sandId);
            const flowing = system.listFlowing();
            expect(flowing.length).toBe(1);
            expect(flowing[0].sandId).toBe(s2.sandId);
        });
    });

    describe('listFrozen', () => {
        it('should only list frozen sands', () => {
            const { sand: s1 } = system.gatherSand({});
            const { sand: s2 } = system.gatherSand({});
            system.freezeSand(s1.sandId);
            const frozen = system.listFrozen();
            expect(frozen.length).toBe(1);
            expect(frozen[0].sandId).toBe(s1.sandId);
            expect(frozen[0].sandId).not.toBe(s2.sandId);
        });
    });

    describe('accumulateGrain', () => {
        it('should increase grains by default 5', () => {
            const { sand } = system.gatherSand({});
            const initial = sand.grains;
            system.accumulateGrain(sand.sandId);
            expect(sand.grains).toBe(initial + 5);
        });

        it('should increase grains by custom amount', () => {
            const { sand } = system.gatherSand({});
            const initial = sand.grains;
            system.accumulateGrain(sand.sandId, 25);
            expect(sand.grains).toBe(initial + 25);
        });

        it('should reject missing', () => {
            const result = system.accumulateGrain('ghost', 5);
            expect(result.error).toBe('SAND_NOT_FOUND');
        });

        it('should trigger grainAccumulated hook', () => {
            const { sand } = system.gatherSand({});
            let received = null;
            system.registerHook('grainAccumulated', (d) => { received = d; });
            system.accumulateGrain(sand.sandId, 10);
            expect(received).not.toBeNull();
            expect(received.sandId).toBe(sand.sandId);
            expect(received.amount).toBe(10);
        });
    });

    describe('diluteFlow', () => {
        it('should increase dilution by default 2', () => {
            const { sand } = system.gatherSand({});
            const initial = sand.dilution;
            system.diluteFlow(sand.sandId);
            expect(sand.dilution).toBe(initial + 2);
        });

        it('should decrease flow by custom amount', () => {
            const { sand } = system.gatherSand({ flow: 50 });
            system.diluteFlow(sand.sandId, 10);
            expect(sand.dilution).toBe(10);
            expect(sand.flow).toBe(40);
        });

        it('should not let flow go negative', () => {
            const { sand } = system.gatherSand({ flow: 5 });
            system.diluteFlow(sand.sandId, 100);
            expect(sand.flow).toBe(0);
        });

        it('should reject missing', () => {
            const result = system.diluteFlow('ghost', 5);
            expect(result.error).toBe('SAND_NOT_FOUND');
        });

        it('should trigger flowDiluted hook', () => {
            const { sand } = system.gatherSand({});
            let received = null;
            system.registerHook('flowDiluted', (d) => { received = d; });
            system.diluteFlow(sand.sandId, 5);
            expect(received).not.toBeNull();
            expect(received.sandId).toBe(sand.sandId);
        });
    });

    describe('freezeSand', () => {
        it('should set frozen to true', () => {
            const { sand } = system.gatherSand({});
            system.freezeSand(sand.sandId);
            expect(sand.frozen).toBe(true);
        });

        it('should set status to paused', () => {
            const { sand } = system.gatherSand({});
            system.freezeSand(sand.sandId);
            expect(sand.status).toBe('paused');
        });

        it('should reject missing', () => {
            const result = system.freezeSand('ghost');
            expect(result.error).toBe('SAND_NOT_FOUND');
        });

        it('should trigger sandFrozen hook', () => {
            const { sand } = system.gatherSand({});
            let called = false;
            system.registerHook('sandFrozen', () => { called = true; });
            system.freezeSand(sand.sandId);
            expect(called).toBe(true);
        });
    });

    describe('rewindSand', () => {
        it('should set status to rewinding', () => {
            const { sand } = system.gatherSand({});
            system.rewindSand(sand.sandId);
            expect(sand.status).toBe('rewinding');
        });

        it('should reject missing', () => {
            const result = system.rewindSand('ghost');
            expect(result.error).toBe('SAND_NOT_FOUND');
        });

        it('should trigger sandRewound hook', () => {
            const { sand } = system.gatherSand({});
            let called = false;
            system.registerHook('sandRewound', () => { called = true; });
            system.rewindSand(sand.sandId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTemporalDensity', () => {
        it('should calculate grains * (1 + flow/100) + dilution * 2', () => {
            const { sand } = system.gatherSand({ grains: 100, flow: 50, dilution: 10 });
            // 100 * (1 + 50/100) + 10 * 2 = 150 + 20 = 170
            expect(system.calculateTemporalDensity(sand.sandId)).toBeCloseTo(170, 5);
        });

        it('should handle low flow', () => {
            const { sand } = system.gatherSand({ grains: 10, flow: 1, dilution: 0 });
            // 10 * (1 + 1/100) + 0 = 10.1
            expect(system.calculateTemporalDensity(sand.sandId)).toBeCloseTo(10.1, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTemporalDensity('ghost')).toBe(0);
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

        it('should execute default getSand', () => {
            const result = system.executeTool('getSand', { sandId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('sandGathered', () => count++);
            unregister();
            system.gatherSand({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('sandGathered', () => { throw new Error('x'); });
            expect(() => system.gatherSand({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when totalSands >= 5', () => {
            system.stats.totalSands = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSands = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.gatherSand({});
            const json = system.toJSON();
            expect(json.sands.length).toBe(1);
        });
        it('should deserialize', () => {
            system.gatherSand({});
            const json = system.toJSON();
            const newSys = new TimeSand();
            newSys.fromJSON(json);
            expect(newSys.sands.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with sandCount', () => {
            system.gatherSand({});
            const stats = system.getStats();
            expect(stats.sandCount).toBe(1);
            expect(stats.totalSands).toBe(1);
        });
    });
});
