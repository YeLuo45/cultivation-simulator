/**
 * WorldCalendar.test.js - 世界日历测试
 * V352 Iteration 4/9 Round 8 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WorldCalendar } from '../../../systems/ai/WorldCalendar.js';

describe('WorldCalendar', () => {
    let system;
    beforeEach(() => { system = new WorldCalendar(); });

    describe('yearToDay', () => {
        it('should convert', () => {
            expect(system.yearToDay(2)).toBe(360);
        });
    });

    describe('dayToYear', () => {
        it('should convert', () => {
            expect(system.dayToYear(720)).toBe(3);
        });
    });

    describe('addEvent', () => {
        it('should add', () => {
            const { event } = system.addEvent({ name: 'E1' });
            expect(event.name).toBe('E1');
        });

        it('should trigger eventAdded hook', () => {
            let called = false;
            system.registerHook('eventAdded', () => { called = true; });
            system.addEvent({});
            expect(called).toBe(true);
        });
    });

    describe('getEvent', () => {
        it('should return', () => {
            const { event } = system.addEvent({});
            expect(system.getEvent(event.eventId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getEvent('ghost')).toBeNull(); });
    });

    describe('listEvents', () => {
        it('should list all', () => {
            system.addEvent({});
            expect(system.listEvents().length).toBe(1);
        });
    });

    describe('listByYear', () => {
        it('should filter', () => {
            system.addEvent({ year: 1 });
            system.addEvent({ year: 2 });
            expect(system.listByYear(1).length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.addEvent({ type: 'festival' });
            system.addEvent({ type: 'war' });
            expect(system.listByType('festival').length).toBe(1);
        });
    });

    describe('listByDayRange', () => {
        it('should filter', () => {
            system.addEvent({ day: 5 });
            system.addEvent({ day: 50 });
            system.addEvent({ day: 500 });
            expect(system.listByDayRange(1, 100).length).toBe(2);
        });
    });

    describe('removeEvent', () => {
        it('should remove', () => {
            const { event } = system.addEvent({});
            const result = system.removeEvent(event.eventId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.removeEvent('ghost');
            expect(result.error).toBe('EVENT_NOT_FOUND');
        });
    });

    describe('addHoliday', () => {
        it('should add', () => {
            const { holiday } = system.addHoliday({ name: 'H1' });
            expect(holiday.name).toBe('H1');
        });

        it('should trigger holidayAdded hook', () => {
            let called = false;
            system.registerHook('holidayAdded', () => { called = true; });
            system.addHoliday({});
            expect(called).toBe(true);
        });
    });

    describe('getHoliday', () => {
        it('should return', () => {
            const { holiday } = system.addHoliday({});
            expect(system.getHoliday(holiday.holidayId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getHoliday('ghost')).toBeNull(); });
    });

    describe('listHolidays', () => {
        it('should list all', () => {
            system.addHoliday({});
            expect(system.listHolidays().length).toBe(1);
        });
    });

    describe('listHolidaysByMonth', () => {
        it('should filter', () => {
            system.addHoliday({ month: 1 });
            system.addHoliday({ month: 5 });
            expect(system.listHolidaysByMonth(1).length).toBe(1);
        });
    });

    describe('isHoliday', () => {
        it('should return true', () => {
            system.addHoliday({ day: 1, month: 1 });
            expect(system.isHoliday(1, 1)).toBe(true);
        });

        it('should return false', () => {
            expect(system.isHoliday(99, 99)).toBe(false);
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

        it('should execute default getEvent', () => {
            const result = system.executeTool('getEvent', { eventId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('eventAdded', () => count++);
            unregister();
            system.addEvent({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('eventAdded', () => { throw new Error('x'); });
            expect(() => system.addEvent({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalEvents = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalEvents = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.addEvent({});
            const json = system.toJSON();
            expect(json.events.length).toBe(1);
        });
        it('should deserialize', () => {
            system.addEvent({});
            const json = system.toJSON();
            const newSys = new WorldCalendar();
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