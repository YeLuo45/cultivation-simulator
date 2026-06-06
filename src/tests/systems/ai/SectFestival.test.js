/**
 * SectFestival.test.js - 宗门节日测试
 * V488 Iteration 5/15 Round 19 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectFestival } from '../../../systems/ai/SectFestival.js';

describe('SectFestival', () => {
    let system;
    beforeEach(() => { system = new SectFestival(); });

    describe('scheduleFestival', () => {
        it('should schedule', () => {
            const { festival } = system.scheduleFestival({ sectId: 's1', name: 'Harvest' });
            expect(festival.sectId).toBe('s1');
            expect(festival.name).toBe('Harvest');
        });

        it('should default type to harvest', () => {
            const { festival } = system.scheduleFestival({});
            expect(festival.type).toBe('harvest');
        });

        it('should default duration to baseDuration', () => {
            const { festival } = system.scheduleFestival({});
            expect(festival.duration).toBe(1);
        });

        it('should default status to upcoming', () => {
            const { festival } = system.scheduleFestival({});
            expect(festival.status).toBe('upcoming');
        });

        it('should default attendees to empty array', () => {
            const { festival } = system.scheduleFestival({});
            expect(festival.attendees).toEqual([]);
        });

        it('should trigger festivalScheduled hook', () => {
            let called = false;
            system.registerHook('festivalScheduled', () => { called = true; });
            system.scheduleFestival({});
            expect(called).toBe(true);
        });
    });

    describe('getFestival', () => {
        it('should return', () => {
            const { festival } = system.scheduleFestival({});
            expect(system.getFestival(festival.festivalId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getFestival('ghost')).toBeNull(); });
    });

    describe('listFestivals', () => {
        it('should list all', () => {
            system.scheduleFestival({});
            expect(system.listFestivals().length).toBe(1);
        });
    });

    describe('listBySect', () => {
        it('should filter', () => {
            system.scheduleFestival({ sectId: 's1' });
            system.scheduleFestival({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });
    });

    describe('listActive', () => {
        it('should list active only', () => {
            const { festival: f1 } = system.scheduleFestival({ name: 'active' });
            system.scheduleFestival({ name: 'upcoming' });
            system.startFestival(f1.festivalId);
            expect(system.listActive().length).toBe(1);
        });
    });

    describe('addAttendee', () => {
        it('should add attendee', () => {
            const { festival } = system.scheduleFestival({});
            const result = system.addAttendee(festival.festivalId, { name: 'm1' });
            expect(result.success).toBe(true);
            expect(festival.attendees.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addAttendee('ghost', { name: 'm1' });
            expect(result.error).toBe('FESTIVAL_NOT_FOUND');
        });

        it('should trigger attendeeAdded hook', () => {
            const { festival } = system.scheduleFestival({});
            let called = false;
            system.registerHook('attendeeAdded', () => { called = true; });
            system.addAttendee(festival.festivalId, { name: 'm1' });
            expect(called).toBe(true);
        });
    });

    describe('extendDuration', () => {
        it('should extend by default 2', () => {
            const { festival } = system.scheduleFestival({});
            system.extendDuration(festival.festivalId);
            expect(festival.duration).toBe(3);
        });

        it('should extend by custom amount', () => {
            const { festival } = system.scheduleFestival({});
            system.extendDuration(festival.festivalId, 5);
            expect(festival.duration).toBe(6);
        });

        it('should reject missing', () => {
            const result = system.extendDuration('ghost', 5);
            expect(result.error).toBe('FESTIVAL_NOT_FOUND');
        });

        it('should trigger durationExtended hook', () => {
            const { festival } = system.scheduleFestival({});
            let called = false;
            system.registerHook('durationExtended', () => { called = true; });
            system.extendDuration(festival.festivalId, 4);
            expect(called).toBe(true);
        });
    });

    describe('startFestival', () => {
        it('should set status to active', () => {
            const { festival } = system.scheduleFestival({});
            system.startFestival(festival.festivalId);
            expect(festival.status).toBe('active');
        });

        it('should reject missing', () => {
            const result = system.startFestival('ghost');
            expect(result.error).toBe('FESTIVAL_NOT_FOUND');
        });

        it('should trigger festivalStarted hook', () => {
            const { festival } = system.scheduleFestival({});
            let called = false;
            system.registerHook('festivalStarted', () => { called = true; });
            system.startFestival(festival.festivalId);
            expect(called).toBe(true);
        });
    });

    describe('endFestival', () => {
        it('should set status to concluded', () => {
            const { festival } = system.scheduleFestival({});
            system.endFestival(festival.festivalId);
            expect(festival.status).toBe('concluded');
        });

        it('should reject missing', () => {
            const result = system.endFestival('ghost');
            expect(result.error).toBe('FESTIVAL_NOT_FOUND');
        });

        it('should trigger festivalEnded hook', () => {
            const { festival } = system.scheduleFestival({});
            let called = false;
            system.registerHook('festivalEnded', () => { called = true; });
            system.endFestival(festival.festivalId);
            expect(called).toBe(true);
        });
    });

    describe('calculateFestivalJoy', () => {
        it('should calculate', () => {
            const { festival } = system.scheduleFestival({ duration: 3 });
            festival.attendees = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
            // 3 * 5 + 3 = 18
            expect(system.calculateFestivalJoy(festival.festivalId)).toBe(18);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateFestivalJoy('ghost')).toBe(0);
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

        it('should execute default getFestival', () => {
            const result = system.executeTool('getFestival', { festivalId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('festivalScheduled', () => count++);
            unregister();
            system.scheduleFestival({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('festivalScheduled', () => { throw new Error('x'); });
            expect(() => system.scheduleFestival({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalFestivals = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalFestivals = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.scheduleFestival({});
            const json = system.toJSON();
            expect(json.festivals.length).toBe(1);
        });
        it('should deserialize', () => {
            system.scheduleFestival({});
            const json = system.toJSON();
            const newSys = new SectFestival();
            newSys.fromJSON(json);
            expect(newSys.festivals.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.festivalCount).toBe(0);
        });
    });
});
