/**
 * CultivationDreamTimeLoop.test.js - 修真时间循环测试
 * V875 Iteration 9/30 Round 34 - 测试覆盖率目标: 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDreamTimeLoop, TIME_RANGES, MAX_REWIND_STEPS, BREAK_CONDITIONS } from '../../../systems/ai/CultivationDreamTimeLoop.js';

describe('CultivationDreamTimeLoop', () => {
    let system;
    beforeEach(() => { system = new CultivationDreamTimeLoop(); });

    describe('exports', () => {
        it('should export constants', () => {
            expect(TIME_RANGES.length).toBe(3);
            expect(MAX_REWIND_STEPS).toBe(10);
            expect(BREAK_CONDITIONS.length).toBe(5);
        });
    });

    describe('constructor', () => {
        it('should accept custom config', () => {
            const s = new CultivationDreamTimeLoop({ maxLoops: 5, maxRewind: 5 });
            expect(s.config.maxLoops).toBe(5);
        });
    });

    describe('enterTimeLoop', () => {
        it('should enter', () => {
            const { loop } = system.enterTimeLoop('d1', 'hour');
            expect(loop.dreamId).toBe('d1');
            expect(loop.loopRange).toBe('hour');
            expect(loop.iterationCount).toBe(1);
        });
        it('should reject invalid range', () => {
            expect(system.enterTimeLoop('d', 'invalid').error).toBe('INVALID_RANGE');
        });
        it('should trigger hook', () => {
            let called = false;
            system.registerHook('loopEntered', () => { called = true; });
            system.enterTimeLoop('d', 'day');
            expect(called).toBe(true);
        });
        it('should support all ranges', () => {
            for (const r of TIME_RANGES) {
                expect(system.enterTimeLoop('d', r).success).toBe(true);
            }
        });
    });

    describe('rewindTime', () => {
        it('should rewind', () => {
            const { loop } = system.enterTimeLoop('d', 'hour');
            const r = system.rewindTime(loop.id, 3);
            expect(r.rewoundSteps).toBe(3);
            expect(r.iterationCount).toBe(2);
        });
        it('should reject missing', () => {
            expect(system.rewindTime('ghost', 1).error).toBe('LOOP_NOT_FOUND');
        });
        it('should reject broken', () => {
            const { loop } = system.enterTimeLoop('d', 'hour');
            system.breakLoop(loop.id, 'realization');
            expect(system.rewindTime(loop.id, 1).error).toBe('LOOP_BROKEN');
        });
        it('should clamp steps', () => {
            const { loop } = system.enterTimeLoop('d', 'hour');
            system.rewindTime(loop.id, 100);
            expect(loop.rewoundSteps).toBe(10);
        });
        it('should trigger hook', () => {
            const { loop } = system.enterTimeLoop('d', 'hour');
            let called = false;
            system.registerHook('timeRewound', () => { called = true; });
            system.rewindTime(loop.id, 1);
            expect(called).toBe(true);
        });
    });

    describe('breakLoop', () => {
        it('should break', () => {
            const { loop } = system.enterTimeLoop('d', 'hour');
            const r = system.breakLoop(loop.id, 'realization');
            expect(r.success).toBe(true);
            expect(loop.broken).toBe(true);
        });
        it('should reject missing', () => {
            expect(system.breakLoop('ghost', 'realization').error).toBe('LOOP_NOT_FOUND');
        });
        it('should reject already broken', () => {
            const { loop } = system.enterTimeLoop('d', 'hour');
            system.breakLoop(loop.id, 'realization');
            expect(system.breakLoop(loop.id, 'realization').error).toBe('ALREADY_BROKEN');
        });
        it('should handle invalid condition', () => {
            const { loop } = system.enterTimeLoop('d', 'hour');
            const r = system.breakLoop(loop.id, 'invalid');
            expect(r.success).toBe(true);
        });
        it('should trigger hook', () => {
            const { loop } = system.enterTimeLoop('d', 'hour');
            let called = false;
            system.registerHook('loopBroken', () => { called = true; });
            system.breakLoop(loop.id, 'realization');
            expect(called).toBe(true);
        });
    });

    describe('incrementIteration', () => {
        it('should increment', () => {
            const { loop } = system.enterTimeLoop('d', 'hour');
            const r = system.incrementIteration(loop.id);
            expect(r.iterationCount).toBe(2);
        });
        it('should reject missing', () => {
            expect(system.incrementIteration('ghost').error).toBe('LOOP_NOT_FOUND');
        });
    });

    describe('getMaxRewind', () => {
        it('should return max', () => {
            expect(system.getMaxRewind()).toBe(MAX_REWIND_STEPS);
        });
    });

    describe('list methods', () => {
        it('listLoops', () => {
            system.enterTimeLoop('d', 'hour');
            expect(system.listLoops().length).toBe(1);
        });
        it('listByRange', () => {
            system.enterTimeLoop('d', 'hour');
            system.enterTimeLoop('d', 'day');
            expect(system.listByRange('hour').length).toBe(1);
        });
        it('listByDream', () => {
            system.enterTimeLoop('d1', 'hour');
            expect(system.listByDream('d1').length).toBe(1);
        });
        it('listBroken', () => {
            const { loop } = system.enterTimeLoop('d', 'hour');
            system.breakLoop(loop.id, 'realization');
            expect(system.listBroken().length).toBe(1);
        });
        it('listActive', () => {
            const { loop } = system.enterTimeLoop('d', 'hour');
            system.breakLoop(loop.id, 'realization');
            expect(system.listActive().length).toBe(0);
        });
    });

    describe('deleteLoop', () => {
        it('should delete', () => {
            const { loop } = system.enterTimeLoop('d', 'hour');
            expect(system.deleteLoop(loop.id).success).toBe(true);
        });
        it('should reject missing', () => {
            expect(system.deleteLoop('ghost').error).toBe('LOOP_NOT_FOUND');
        });
        it('should trigger hook', () => {
            const { loop } = system.enterTimeLoop('d', 'hour');
            let called = false;
            system.registerHook('loopDeleted', () => { called = true; });
            system.deleteLoop(loop.id);
            expect(called).toBe(true);
        });
    });

    describe('tools and hooks', () => {
        it('should execute default tool', () => {
            const { loop } = system.enterTimeLoop('d', 'hour');
            const r = system.executeTool('getLoop', { loopId: loop.id });
            expect(r.success).toBe(true);
        });
        it('should handle missing tool', () => {
            expect(system.executeTool('ghost').error).toBe('TOOL_NOT_FOUND');
        });
        it('should handle exception', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            expect(system.executeTool('bad').error).toBe('x');
        });
        it('should handle missing context for default tool', () => {
            const r = system.executeTool('getLoop');
            expect(r.success).toBe(true);
            expect(r.result).toBeNull();
        });
        it('should list tools', () => {
            expect(system.listTools().length).toBe(2);
        });
        it('should unregister hook', () => {
            let count = 0;
            const off = system.registerHook('loopEntered', () => { count++; });
            system.enterTimeLoop('d', 'hour');
            off();
            system.enterTimeLoop('d', 'hour');
            expect(count).toBe(1);
        });
        it('should catch handler errors', () => {
            system.registerHook('loopEntered', () => { throw new Error('x'); });
            expect(() => system.enterTimeLoop('d', 'hour')).not.toThrow();
        });
    });

    describe('toJSON/fromJSON', () => {
        it('should round trip', () => {
            system.enterTimeLoop('d', 'hour');
            const json = system.toJSON();
            const s2 = new CultivationDreamTimeLoop();
            expect(s2.fromJSON(json).success).toBe(true);
        });
        it('should handle empty fromJSON', () => {
            const s2 = new CultivationDreamTimeLoop();
            expect(s2.fromJSON({}).success).toBe(true);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.enterTimeLoop('d', 'hour');
            const stats = system.getStats();
            expect(stats.totalEntered).toBe(1);
            expect(stats.loopCount).toBe(1);
        });
    });
});
