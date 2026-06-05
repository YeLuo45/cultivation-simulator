/**
 * TimeFlowEngine.test.js - 时间流动引擎测试
 * V349 Iteration 1/9 Round 8 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TimeFlowEngine } from '../../../systems/ai/TimeFlowEngine.js';

describe('TimeFlowEngine', () => {
    let system;
    beforeEach(() => { system = new TimeFlowEngine(); });

    describe('advance', () => {
        it('should advance', () => {
            const before = system.currentTime;
            const result = system.advance(1000);
            expect(system.currentTime).toBe(before + 1000);
        });

        it('should apply timeScale', () => {
            const sys = new TimeFlowEngine({ timeScale: 2 });
            const before = sys.currentTime;
            sys.advance(1000);
            expect(sys.currentTime).toBe(before + 2000);
        });

        it('should increment totalAdvances', () => {
            system.advance(1000);
            expect(system.stats.totalAdvances).toBe(1);
        });

        it('should trigger timeAdvanced hook', () => {
            let called = false;
            system.registerHook('timeAdvanced', () => { called = true; });
            system.advance(1000);
            expect(called).toBe(true);
        });

        it('should process timers', () => {
            system.createEvent({});
            system.scheduleTimer('event_1', system.currentTime + 500);
            const result = system.advance(1000);
            expect(result.triggered.length).toBeGreaterThan(0);
        });
    });

    describe('setTime', () => {
        it('should set', () => {
            system.setTime(99999);
            expect(system.currentTime).toBe(99999);
        });

        it('should trigger timeSet hook', () => {
            let called = false;
            system.registerHook('timeSet', () => { called = true; });
            system.setTime(100);
            expect(called).toBe(true);
        });
    });

    describe('createEvent', () => {
        it('should create', () => {
            const { event } = system.createEvent({ name: 'E1' });
            expect(event.name).toBe('E1');
        });

        it('should default duration to 1000', () => {
            const { event } = system.createEvent({});
            expect(event.duration).toBe(1000);
        });

        it('should trigger eventCreated hook', () => {
            let called = false;
            system.registerHook('eventCreated', () => { called = true; });
            system.createEvent({});
            expect(called).toBe(true);
        });
    });

    describe('getEvent', () => {
        it('should return', () => {
            const { event } = system.createEvent({});
            expect(system.getEvent(event.eventId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getEvent('ghost')).toBeNull(); });
    });

    describe('listEvents', () => {
        it('should list all', () => {
            system.createEvent({});
            expect(system.listEvents().length).toBe(1);
        });
    });

    describe('listActiveEvents', () => {
        it('should filter active', () => {
            system.createEvent({ startTime: 0, duration: 99999 });
            system.createEvent({ startTime: 99999, duration: 1 });
            expect(system.listActiveEvents().length).toBe(1);
        });
    });

    describe('scheduleTimer', () => {
        it('should schedule', () => {
            system.createEvent({});
            const result = system.scheduleTimer('event_1', system.currentTime + 1000);
            expect(result.success).toBe(true);
        });

        it('should reject max reached', () => {
            const sys = new TimeFlowEngine({ maxTimers: 1 });
            sys.createEvent({});
            sys.scheduleTimer('event_1', 1000);
            const result = sys.scheduleTimer('event_2', 2000);
            expect(result.error).toBe('MAX_TIMERS_REACHED');
        });

        it('should trigger timerScheduled hook', () => {
            system.createEvent({});
            let called = false;
            system.registerHook('timerScheduled', () => { called = true; });
            system.scheduleTimer('event_1', 1000);
            expect(called).toBe(true);
        });
    });

    describe('cancelTimer', () => {
        it('should cancel', () => {
            system.createEvent({});
            const { timer } = system.scheduleTimer('event_1', 1000);
            const result = system.cancelTimer(timer.timerId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.cancelTimer('ghost');
            expect(result.error).toBe('TIMER_NOT_FOUND');
        });

        it('should trigger timerCancelled hook', () => {
            system.createEvent({});
            const { timer } = system.scheduleTimer('event_1', 1000);
            let called = false;
            system.registerHook('timerCancelled', () => { called = true; });
            system.cancelTimer(timer.timerId);
            expect(called).toBe(true);
        });
    });

    describe('getTimer', () => {
        it('should return', () => {
            system.createEvent({});
            const { timer } = system.scheduleTimer('event_1', 1000);
            expect(system.getTimer(timer.timerId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTimer('ghost')).toBeNull(); });
    });

    describe('listTimers', () => {
        it('should list all', () => {
            system.createEvent({});
            system.scheduleTimer('event_1', 1000);
            expect(system.listTimers().length).toBe(1);
        });
    });

    describe('listActiveTimers', () => {
        it('should filter active', () => {
            system.createEvent({});
            const { timer } = system.scheduleTimer('event_1', 1000);
            timer.active = false;
            expect(system.listActiveTimers().length).toBe(0);
        });
    });

    describe('snapshot', () => {
        it('should snapshot', () => {
            const snap = system.snapshot();
            expect(snap.time).toBe(system.currentTime);
        });

        it('should trigger snapshotTaken hook', () => {
            let called = false;
            system.registerHook('snapshotTaken', () => { called = true; });
            system.snapshot();
            expect(called).toBe(true);
        });
    });

    describe('getHistory', () => {
        it('should return history', () => {
            system.snapshot();
            expect(system.getHistory().length).toBe(1);
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

        it('should execute default getCurrentTime', () => {
            const result = system.executeTool('getCurrentTime', {});
            expect(result.result).toBe(system.currentTime);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('timeAdvanced', () => count++);
            unregister();
            system.advance(1000);
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('timeAdvanced', () => { throw new Error('x'); });
            expect(() => system.advance(1000)).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalAdvances = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalAdvances = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createEvent({});
            const json = system.toJSON();
            expect(json.events.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createEvent({});
            const json = system.toJSON();
            const newSys = new TimeFlowEngine();
            newSys.fromJSON(json);
            expect(newSys.events.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.eventCount).toBe(0);
        });
    });
});