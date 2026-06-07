/**
 * CultivationWeek.test.js - 修真周系统测试
 * V822 Iteration 25/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationWeek } from '../../../systems/ai/CultivationWeek.js';

describe('CultivationWeek', () => {
    let system;
    beforeEach(() => { system = new CultivationWeek(); });

    describe('recruitWeek', () => {
        it('should create', () => {
            const { week } = system.recruitWeek({ masterId: 'm1' });
            expect(week.masterId).toBe('m1');
        });

        it('should use defaults', () => {
            const { week } = system.recruitWeek({});
            expect(week.type).toBe('planetary');
            expect(week.status).toBe('novice');
            expect(week.level).toBe(1);
            expect(week.flow).toBe(20);
        });

        it('should accept custom values', () => {
            const { week } = system.recruitWeek({ name: 'Foo', type: 'cosmic', flow: 50 });
            expect(week.name).toBe('Foo');
            expect(week.type).toBe('cosmic');
            expect(week.flow).toBe(50);
        });

        it('should trigger weekRecruited hook', () => {
            let called = false;
            system.registerHook('weekRecruited', () => { called = true; });
            system.recruitWeek({});
            expect(called).toBe(true);
        });
    });

    describe('getWeek', () => {
        it('should return', () => {
            const { week } = system.recruitWeek({});
            expect(system.getWeek(week.weekId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getWeek('ghost')).toBeNull(); });
    });

    describe('listWeeks', () => {
        it('should list all', () => {
            system.recruitWeek({});
            expect(system.listWeeks().length).toBe(1);
        });
        it('should return empty when none', () => {
            expect(system.listWeeks().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitWeek({ masterId: 'm1' });
            system.recruitWeek({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { week } = system.recruitWeek({});
            system.legendWeek(week.weekId);
            system.recruitWeek({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addDay', () => {
        it('should add day (string)', () => {
            const { week } = system.recruitWeek({});
            system.addDay(week.weekId, 'monday-meditation');
            expect(week.days.length).toBe(1);
        });

        it('should add day (object)', () => {
            const { week } = system.recruitWeek({});
            system.addDay(week.weekId, { name: 'friday-practice', addedAt: 100 });
            expect(week.days[0].name).toBe('friday-practice');
        });

        it('should add day (object without addedAt)', () => {
            const { week } = system.recruitWeek({});
            system.addDay(week.weekId, { name: 'saturday-ritual' });
            expect(week.days[0].name).toBe('saturday-ritual');
            expect(week.days[0].addedAt).toBeGreaterThan(0);
        });

        it('should reject missing', () => {
            const result = system.addDay('ghost', 'monday');
            expect(result.error).toBe('WEEK_NOT_FOUND');
        });

        it('should trigger dayAdded hook', () => {
            const { week } = system.recruitWeek({});
            let called = false;
            system.registerHook('dayAdded', () => { called = true; });
            system.addDay(week.weekId, 'monday');
            expect(called).toBe(true);
        });
    });

    describe('raiseFlow', () => {
        it('should raise flow', () => {
            const { week } = system.recruitWeek({});
            system.raiseFlow(week.weekId, 10);
            expect(week.flow).toBe(30);
        });

        it('should use default amount', () => {
            const { week } = system.recruitWeek({});
            system.raiseFlow(week.weekId);
            expect(week.flow).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseFlow('ghost', 5);
            expect(result.error).toBe('WEEK_NOT_FOUND');
        });

        it('should trigger flowRaised hook', () => {
            const { week } = system.recruitWeek({});
            let called = false;
            system.registerHook('flowRaised', () => { called = true; });
            system.raiseFlow(week.weekId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpWeek', () => {
        it('should level up', () => {
            const { week } = system.recruitWeek({});
            system.levelUpWeek(week.weekId);
            expect(week.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpWeek('ghost');
            expect(result.error).toBe('WEEK_NOT_FOUND');
        });

        it('should trigger weekLeveledUp hook', () => {
            const { week } = system.recruitWeek({});
            let called = false;
            system.registerHook('weekLeveledUp', () => { called = true; });
            system.levelUpWeek(week.weekId);
            expect(called).toBe(true);
        });
    });

    describe('legendWeek', () => {
        it('should legendize', () => {
            const { week } = system.recruitWeek({});
            system.legendWeek(week.weekId);
            expect(week.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendWeek('ghost');
            expect(result.error).toBe('WEEK_NOT_FOUND');
        });

        it('should trigger weekLegendized hook', () => {
            const { week } = system.recruitWeek({});
            let called = false;
            system.registerHook('weekLegendized', () => { called = true; });
            system.legendWeek(week.weekId);
            expect(called).toBe(true);
        });
    });

    describe('calculateWeekValue', () => {
        it('should calculate', () => {
            const { week } = system.recruitWeek({});
            system.addDay(week.weekId, 'monday');
            system.levelUpWeek(week.weekId);
            // level=2, flow=20, days=1: 200 + 40 + 30 = 270
            expect(system.calculateWeekValue(week.weekId)).toBe(270);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateWeekValue('ghost')).toBe(0);
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

        it('should execute default getWeek', () => {
            const result = system.executeTool('getWeek', { weekId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle missing context', () => {
            system.registerTool('ctxless', () => 'ok');
            const result = system.executeTool('ctxless');
            expect(result.result).toBe('ok');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('weekRecruited', () => count++);
            unregister();
            system.recruitWeek({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('weekRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitWeek({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalWeeks = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalWeeks = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitWeek({});
            const json = system.toJSON();
            expect(json.weeks.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitWeek({});
            const json = system.toJSON();
            const newSys = new CultivationWeek();
            newSys.fromJSON(json);
            expect(newSys.weeks.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.weekCount).toBe(0);
        });
    });
});