/**
 * CultivationDay.test.js - 修真日系统测试
 * V821 Iteration 24/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDay } from '../../../systems/ai/CultivationDay.js';

describe('CultivationDay', () => {
    let system;
    beforeEach(() => { system = new CultivationDay(); });

    describe('recruitDay', () => {
        it('should create', () => {
            const { day } = system.recruitDay({ masterId: 'm1' });
            expect(day.masterId).toBe('m1');
        });

        it('should use defaults', () => {
            const { day } = system.recruitDay({});
            expect(day.type).toBe('solar');
            expect(day.status).toBe('novice');
            expect(day.level).toBe(1);
            expect(day.length).toBe(20);
        });

        it('should accept custom values', () => {
            const { day } = system.recruitDay({ name: 'Foo', type: 'lunar', length: 50 });
            expect(day.name).toBe('Foo');
            expect(day.type).toBe('lunar');
            expect(day.length).toBe(50);
        });

        it('should trigger dayRecruited hook', () => {
            let called = false;
            system.registerHook('dayRecruited', () => { called = true; });
            system.recruitDay({});
            expect(called).toBe(true);
        });
    });

    describe('getDay', () => {
        it('should return', () => {
            const { day } = system.recruitDay({});
            expect(system.getDay(day.dayId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDay('ghost')).toBeNull(); });
    });

    describe('listDays', () => {
        it('should list all', () => {
            system.recruitDay({});
            expect(system.listDays().length).toBe(1);
        });
        it('should return empty when none', () => {
            expect(system.listDays().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitDay({ masterId: 'm1' });
            system.recruitDay({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { day } = system.recruitDay({});
            system.legendDay(day.dayId);
            system.recruitDay({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addHour', () => {
        it('should add hour (string)', () => {
            const { day } = system.recruitDay({});
            system.addHour(day.dayId, 'morning-meditation');
            expect(day.hours.length).toBe(1);
        });

        it('should add hour (object)', () => {
            const { day } = system.recruitDay({});
            system.addHour(day.dayId, { name: 'noon-practice', addedAt: 100 });
            expect(day.hours[0].name).toBe('noon-practice');
        });

        it('should reject missing', () => {
            const result = system.addHour('ghost', 'morning');
            expect(result.error).toBe('DAY_NOT_FOUND');
        });

        it('should trigger hourAdded hook', () => {
            const { day } = system.recruitDay({});
            let called = false;
            system.registerHook('hourAdded', () => { called = true; });
            system.addHour(day.dayId, 'morning');
            expect(called).toBe(true);
        });
    });

    describe('raiseLength', () => {
        it('should raise length', () => {
            const { day } = system.recruitDay({});
            system.raiseLength(day.dayId, 10);
            expect(day.length).toBe(30);
        });

        it('should use default amount', () => {
            const { day } = system.recruitDay({});
            system.raiseLength(day.dayId);
            expect(day.length).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseLength('ghost', 5);
            expect(result.error).toBe('DAY_NOT_FOUND');
        });

        it('should trigger lengthRaised hook', () => {
            const { day } = system.recruitDay({});
            let called = false;
            system.registerHook('lengthRaised', () => { called = true; });
            system.raiseLength(day.dayId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDay', () => {
        it('should level up', () => {
            const { day } = system.recruitDay({});
            system.levelUpDay(day.dayId);
            expect(day.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpDay('ghost');
            expect(result.error).toBe('DAY_NOT_FOUND');
        });

        it('should trigger dayLeveledUp hook', () => {
            const { day } = system.recruitDay({});
            let called = false;
            system.registerHook('dayLeveledUp', () => { called = true; });
            system.levelUpDay(day.dayId);
            expect(called).toBe(true);
        });
    });

    describe('legendDay', () => {
        it('should legendize', () => {
            const { day } = system.recruitDay({});
            system.legendDay(day.dayId);
            expect(day.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendDay('ghost');
            expect(result.error).toBe('DAY_NOT_FOUND');
        });

        it('should trigger dayLegendized hook', () => {
            const { day } = system.recruitDay({});
            let called = false;
            system.registerHook('dayLegendized', () => { called = true; });
            system.legendDay(day.dayId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDayValue', () => {
        it('should calculate', () => {
            const { day } = system.recruitDay({});
            system.addHour(day.dayId, 'morning');
            system.levelUpDay(day.dayId);
            // level=2, length=20, hours=1: 200 + 40 + 30 = 270
            expect(system.calculateDayValue(day.dayId)).toBe(270);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDayValue('ghost')).toBe(0);
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

        it('should execute default getDay', () => {
            const result = system.executeTool('getDay', { dayId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('dayRecruited', () => count++);
            unregister();
            system.recruitDay({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('dayRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDay({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDays = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDays = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitDay({});
            const json = system.toJSON();
            expect(json.days.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitDay({});
            const json = system.toJSON();
            const newSys = new CultivationDay();
            newSys.fromJSON(json);
            expect(newSys.days.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.dayCount).toBe(0);
        });
    });
});
