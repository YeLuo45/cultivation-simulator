/**
 * CultivationTime.test.js - 修真时系统测试
 * V578 Iteration 1/20 Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTime } from '../../../systems/ai/CultivationTime.js';

describe('CultivationTime', () => {
    let system;
    beforeEach(() => { system = new CultivationTime(); });

    describe('openTime', () => {
        it('should create with default values', () => {
            const { time } = system.openTime({ keeperId: 'k1' });
            expect(time.keeperId).toBe('k1');
            expect(time.name).toBe('Cultivation Time');
            expect(time.type).toBe('present');
            expect(time.flow).toBe(20);
            expect(time.events).toEqual([]);
            expect(time.level).toBe(1);
            expect(time.status).toBe('moving');
        });

        it('should create with custom values', () => {
            const { time } = system.openTime({ keeperId: 'k1', name: 'Past Era', type: 'past', flow: 50 });
            expect(time.name).toBe('Past Era');
            expect(time.type).toBe('past');
            expect(time.flow).toBe(50);
            expect(time.level).toBe(1);
        });

        it('should support future type', () => {
            const { time } = system.openTime({ keeperId: 'k1', type: 'future' });
            expect(time.type).toBe('future');
        });

        it('should generate a unique timeId', () => {
            const { time: t1 } = system.openTime({});
            const { time: t2 } = system.openTime({});
            expect(t1.timeId).not.toBe(t2.timeId);
        });

        it('should accept custom id', () => {
            const { time } = system.openTime({ id: 'custom_42' });
            expect(time.timeId).toBe('custom_42');
        });

        it('should trigger timeOpened hook', () => {
            let called = false;
            system.registerHook('timeOpened', () => { called = true; });
            system.openTime({});
            expect(called).toBe(true);
        });
    });

    describe('getTime', () => {
        it('should return time', () => {
            const { time } = system.openTime({});
            expect(system.getTime(time.timeId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getTime('ghost')).toBeNull();
        });
    });

    describe('listTimes', () => {
        it('should list all', () => {
            system.openTime({});
            system.openTime({});
            expect(system.listTimes().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listTimes().length).toBe(0);
        });

        it('should return clones with events arrays', () => {
            const { time } = system.openTime({});
            system.addEvent(time.timeId, 'e1');
            const listed = system.listTimes();
            expect(listed[0].events).toEqual([{ name: 'e1', timestamp: listed[0].events[0].timestamp }]);
        });
    });

    describe('listByKeeper', () => {
        it('should filter by keeper', () => {
            system.openTime({ keeperId: 'k1' });
            system.openTime({ keeperId: 'k2' });
            system.openTime({ keeperId: 'k1' });
            expect(system.listByKeeper('k1').length).toBe(2);
        });

        it('should return empty for unknown keeper', () => {
            system.openTime({ keeperId: 'k1' });
            expect(system.listByKeeper('unknown').length).toBe(0);
        });
    });

    describe('listEternal', () => {
        it('should only list eternal times', () => {
            const { time: t1 } = system.openTime({});
            const { time: t2 } = system.openTime({});
            system.eternizeTime(t1.timeId);
            const eternal = system.listEternal();
            expect(eternal.length).toBe(1);
            expect(eternal[0].timeId).toBe(t1.timeId);
            expect(eternal[0].timeId).not.toBe(t2.timeId);
        });

        it('should return empty when none eternal', () => {
            system.openTime({});
            expect(system.listEternal().length).toBe(0);
        });
    });

    describe('addEvent', () => {
        it('should add string event', () => {
            const { time } = system.openTime({});
            system.addEvent(time.timeId, 'awakening');
            expect(time.events.length).toBe(1);
            expect(time.events[0].name).toBe('awakening');
        });

        it('should add object event', () => {
            const { time } = system.openTime({});
            system.addEvent(time.timeId, { name: 'meditation', detail: 'deep' });
            expect(time.events.length).toBe(1);
            expect(time.events[0].name).toBe('meditation');
            expect(time.events[0].detail).toBe('deep');
        });

        it('should preserve provided timestamp', () => {
            const { time } = system.openTime({});
            system.addEvent(time.timeId, { name: 'm', timestamp: 12345 });
            expect(time.events[0].timestamp).toBe(12345);
        });

        it('should reject missing', () => {
            const result = system.addEvent('ghost', 'e');
            expect(result.error).toBe('TIME_NOT_FOUND');
        });

        it('should trigger eventAdded hook', () => {
            const { time } = system.openTime({});
            let received = null;
            system.registerHook('eventAdded', (d) => { received = d; });
            system.addEvent(time.timeId, 'eventA');
            expect(received).not.toBeNull();
            expect(received.timeId).toBe(time.timeId);
            expect(received.event.name).toBe('eventA');
            expect(received.eventCount).toBe(1);
        });
    });

    describe('increaseFlow', () => {
        it('should increase flow by default 5', () => {
            const { time } = system.openTime({});
            const initial = time.flow;
            system.increaseFlow(time.timeId);
            expect(time.flow).toBe(initial + 5);
        });

        it('should increase flow by custom amount', () => {
            const { time } = system.openTime({});
            system.increaseFlow(time.timeId, 25);
            expect(time.flow).toBe(45);
        });

        it('should reject missing', () => {
            const result = system.increaseFlow('ghost', 5);
            expect(result.error).toBe('TIME_NOT_FOUND');
        });

        it('should trigger flowIncreased hook', () => {
            const { time } = system.openTime({});
            let received = null;
            system.registerHook('flowIncreased', (d) => { received = d; });
            system.increaseFlow(time.timeId, 10);
            expect(received).not.toBeNull();
            expect(received.timeId).toBe(time.timeId);
            expect(received.amount).toBe(10);
            expect(received.newFlow).toBe(30);
        });
    });

    describe('levelUpTime', () => {
        it('should level up by 1', () => {
            const { time } = system.openTime({});
            system.levelUpTime(time.timeId);
            expect(time.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { time } = system.openTime({});
            system.levelUpTime(time.timeId);
            system.levelUpTime(time.timeId);
            system.levelUpTime(time.timeId);
            expect(time.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpTime('ghost');
            expect(result.error).toBe('TIME_NOT_FOUND');
        });

        it('should trigger timeLeveledUp hook', () => {
            const { time } = system.openTime({});
            let received = null;
            system.registerHook('timeLeveledUp', (d) => { received = d; });
            system.levelUpTime(time.timeId);
            expect(received).not.toBeNull();
            expect(received.timeId).toBe(time.timeId);
            expect(received.newLevel).toBe(2);
        });
    });

    describe('eternizeTime', () => {
        it('should set status to eternal', () => {
            const { time } = system.openTime({});
            system.eternizeTime(time.timeId);
            expect(time.status).toBe('eternal');
        });

        it('should reject missing', () => {
            const result = system.eternizeTime('ghost');
            expect(result.error).toBe('TIME_NOT_FOUND');
        });

        it('should trigger timeEternalized hook', () => {
            const { time } = system.openTime({});
            let called = false;
            system.registerHook('timeEternalized', () => { called = true; });
            system.eternizeTime(time.timeId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTimeValue', () => {
        it('should calculate level * 100 + flow * 2 + events.length * 30', () => {
            const { time } = system.openTime({ flow: 50 });
            system.addEvent(time.timeId, 'e1');
            system.addEvent(time.timeId, 'e2');
            system.levelUpTime(time.timeId);
            // level=2, flow=50, events=2 -> 200 + 100 + 60 = 360
            expect(system.calculateTimeValue(time.timeId)).toBe(360);
        });

        it('should handle fresh time', () => {
            const { time } = system.openTime({});
            // level=1, flow=20, events=0 -> 100 + 40 + 0 = 140
            expect(system.calculateTimeValue(time.timeId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTimeValue('ghost')).toBe(0);
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

        it('should execute default getTime and openTime', () => {
            const openResult = system.executeTool('openTime', { keeperId: 'k1' });
            expect(openResult.success).toBe(true);
            const t = openResult.result.time;
            const getResult = system.executeTool('getTime', { timeId: t.timeId });
            expect(getResult.result).not.toBeNull();
        });

        it('should execute tool without context', () => {
            system.registerTool('test', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('test');
            expect(result.result).toBe(0);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('timeOpened', () => count++);
            unregister();
            system.openTime({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('timeOpened', () => { throw new Error('x'); });
            expect(() => system.openTime({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when totalTimes >= 5', () => {
            system.stats.totalTimes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalTimes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openTime({});
            const json = system.toJSON();
            expect(json.times.length).toBe(1);
        });

        it('should deserialize', () => {
            system.openTime({});
            const json = system.toJSON();
            const newSys = new CultivationTime();
            newSys.fromJSON(json);
            expect(newSys.times.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with timeCount', () => {
            system.openTime({});
            const stats = system.getStats();
            expect(stats.timeCount).toBe(1);
            expect(stats.totalTimes).toBe(1);
        });
    });
});
