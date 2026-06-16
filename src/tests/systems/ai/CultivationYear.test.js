/**
 * CultivationYear.test.js - 修真年系统测试
 * V824 Iteration 27/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationYear } from '../../../systems/ai/CultivationYear.js';

describe('CultivationYear', () => {
    let system;
    beforeEach(() => { system = new CultivationYear(); });

    describe('recruitYear', () => {
        it('should create with default values', () => {
            const { year } = system.recruitYear({ masterId: 'm1' });
            expect(year.masterId).toBe('m1');
            expect(year.name).toBe('Cultivation Year');
            expect(year.type).toBe('solar');
            expect(year.depth).toBe(20);
            expect(year.months).toEqual([]);
            expect(year.level).toBe(1);
            expect(year.status).toBe('novice');
        });

        it('should create with custom values', () => {
            const { year } = system.recruitYear({ masterId: 'm1', name: 'Year of Fire', type: 'cosmic', depth: 50 });
            expect(year.name).toBe('Year of Fire');
            expect(year.type).toBe('cosmic');
            expect(year.depth).toBe(50);
            expect(year.level).toBe(1);
        });

        it('should support divine type', () => {
            const { year } = system.recruitYear({ masterId: 'm1', type: 'divine' });
            expect(year.type).toBe('divine');
        });

        it('should generate a unique yearId', () => {
            const { year: y1 } = system.recruitYear({});
            const { year: y2 } = system.recruitYear({});
            expect(y1.yearId).not.toBe(y2.yearId);
        });

        it('should accept custom id', () => {
            const { year } = system.recruitYear({ id: 'custom_year_42' });
            expect(year.yearId).toBe('custom_year_42');
        });

        it('should trigger yearRecruited hook', () => {
            let called = false;
            system.registerHook('yearRecruited', () => { called = true; });
            system.recruitYear({});
            expect(called).toBe(true);
        });
    });

    describe('getYear', () => {
        it('should return year', () => {
            const { year } = system.recruitYear({});
            expect(system.getYear(year.yearId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getYear('ghost')).toBeNull();
        });

        it('should return a clone with months array', () => {
            const { year } = system.recruitYear({});
            system.addMonth(year.yearId, 'm1');
            const fetched = system.getYear(year.yearId);
            expect(fetched.months.length).toBe(1);
            expect(fetched.months[0].name).toBe('m1');
        });
    });

    describe('listYears', () => {
        it('should list all', () => {
            system.recruitYear({});
            system.recruitYear({});
            expect(system.listYears().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listYears().length).toBe(0);
        });

        it('should return clones with months arrays', () => {
            const { year } = system.recruitYear({});
            system.addMonth(year.yearId, 'm1');
            const listed = system.listYears();
            expect(listed[0].months).toEqual([{ name: 'm1', timestamp: listed[0].months[0].timestamp }]);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitYear({ masterId: 'm1' });
            system.recruitYear({ masterId: 'm2' });
            system.recruitYear({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitYear({ masterId: 'm1' });
            expect(system.listByMaster('unknown').length).toBe(0);
        });

        it('should return clones with months arrays', () => {
            const { year } = system.recruitYear({ masterId: 'm1' });
            system.addMonth(year.yearId, 'spring');
            const listed = system.listByMaster('m1');
            expect(listed[0].months.length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should only list legendary years', () => {
            const { year: y1 } = system.recruitYear({});
            const { year: y2 } = system.recruitYear({});
            system.legendYear(y1.yearId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].yearId).toBe(y1.yearId);
            expect(legendary[0].yearId).not.toBe(y2.yearId);
        });

        it('should return empty when none legendary', () => {
            system.recruitYear({});
            expect(system.listLegendary().length).toBe(0);
        });

        it('should return clones with months arrays', () => {
            const { year } = system.recruitYear({});
            system.addMonth(year.yearId, 'm1');
            system.legendYear(year.yearId);
            const listed = system.listLegendary();
            expect(listed[0].months.length).toBe(1);
        });
    });

    describe('addMonth', () => {
        it('should add string month', () => {
            const { year } = system.recruitYear({});
            system.addMonth(year.yearId, 'awakening');
            expect(year.months.length).toBe(1);
            expect(year.months[0].name).toBe('awakening');
        });

        it('should add object month', () => {
            const { year } = system.recruitYear({});
            system.addMonth(year.yearId, { name: 'spring', detail: 'bloom' });
            expect(year.months.length).toBe(1);
            expect(year.months[0].name).toBe('spring');
            expect(year.months[0].detail).toBe('bloom');
        });

        it('should preserve provided timestamp', () => {
            const { year } = system.recruitYear({});
            system.addMonth(year.yearId, { name: 'm', timestamp: 12345 });
            expect(year.months[0].timestamp).toBe(12345);
        });

        it('should reject missing', () => {
            const result = system.addMonth('ghost', 'm');
            expect(result.error).toBe('YEAR_NOT_FOUND');
        });

        it('should trigger monthAdded hook', () => {
            const { year } = system.recruitYear({});
            let received = null;
            system.registerHook('monthAdded', (d) => { received = d; });
            system.addMonth(year.yearId, 'monthA');
            expect(received).not.toBeNull();
            expect(received.yearId).toBe(year.yearId);
            expect(received.month.name).toBe('monthA');
            expect(received.monthCount).toBe(1);
        });
    });

    describe('raiseDepth', () => {
        it('should raise depth by default 5', () => {
            const { year } = system.recruitYear({});
            const initial = year.depth;
            system.raiseDepth(year.yearId);
            expect(year.depth).toBe(initial + 5);
        });

        it('should raise depth by custom amount', () => {
            const { year } = system.recruitYear({});
            system.raiseDepth(year.yearId, 25);
            expect(year.depth).toBe(45);
        });

        it('should reject missing', () => {
            const result = system.raiseDepth('ghost', 5);
            expect(result.error).toBe('YEAR_NOT_FOUND');
        });

        it('should trigger depthRaised hook', () => {
            const { year } = system.recruitYear({});
            let received = null;
            system.registerHook('depthRaised', (d) => { received = d; });
            system.raiseDepth(year.yearId, 10);
            expect(received).not.toBeNull();
            expect(received.yearId).toBe(year.yearId);
            expect(received.amount).toBe(10);
            expect(received.newDepth).toBe(30);
        });
    });

    describe('levelUpYear', () => {
        it('should level up by 1', () => {
            const { year } = system.recruitYear({});
            system.levelUpYear(year.yearId);
            expect(year.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { year } = system.recruitYear({});
            system.levelUpYear(year.yearId);
            system.levelUpYear(year.yearId);
            system.levelUpYear(year.yearId);
            expect(year.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpYear('ghost');
            expect(result.error).toBe('YEAR_NOT_FOUND');
        });

        it('should trigger yearLeveledUp hook', () => {
            const { year } = system.recruitYear({});
            let received = null;
            system.registerHook('yearLeveledUp', (d) => { received = d; });
            system.levelUpYear(year.yearId);
            expect(received).not.toBeNull();
            expect(received.yearId).toBe(year.yearId);
            expect(received.newLevel).toBe(2);
        });
    });

    describe('legendYear', () => {
        it('should set status to legendary', () => {
            const { year } = system.recruitYear({});
            system.legendYear(year.yearId);
            expect(year.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendYear('ghost');
            expect(result.error).toBe('YEAR_NOT_FOUND');
        });

        it('should trigger yearLegendized hook', () => {
            const { year } = system.recruitYear({});
            let called = false;
            system.registerHook('yearLegendized', () => { called = true; });
            system.legendYear(year.yearId);
            expect(called).toBe(true);
        });
    });

    describe('calculateYearValue', () => {
        it('should calculate level * 100 + depth * 2 + months.length * 30', () => {
            const { year } = system.recruitYear({ depth: 50 });
            system.addMonth(year.yearId, 'm1');
            system.addMonth(year.yearId, 'm2');
            system.levelUpYear(year.yearId);
            // level=2, depth=50, months=2 -> 200 + 100 + 60 = 360
            expect(system.calculateYearValue(year.yearId)).toBe(360);
        });

        it('should handle fresh year', () => {
            const { year } = system.recruitYear({});
            // level=1, depth=20, months=0 -> 100 + 40 + 0 = 140
            expect(system.calculateYearValue(year.yearId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateYearValue('ghost')).toBe(0);
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

        it('should execute default getYear and recruitYear', () => {
            const recruitResult = system.executeTool('recruitYear', { masterId: 'm1' });
            expect(recruitResult.success).toBe(true);
            const y = recruitResult.result.year;
            const getResult = system.executeTool('getYear', { yearId: y.yearId });
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
            const unregister = system.registerHook('yearRecruited', () => count++);
            unregister();
            system.recruitYear({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('yearRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitYear({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when totalYears >= 5', () => {
            system.stats.totalYears = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalYears = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitYear({});
            const json = system.toJSON();
            expect(json.years.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitYear({});
            const json = system.toJSON();
            const newSys = new CultivationYear();
            newSys.fromJSON(json);
            expect(newSys.years.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with yearCount', () => {
            system.recruitYear({});
            const stats = system.getStats();
            expect(stats.yearCount).toBe(1);
            expect(stats.totalYears).toBe(1);
        });
    });
});
