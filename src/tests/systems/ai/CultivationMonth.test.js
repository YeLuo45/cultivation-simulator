/**
 * CultivationMonth.test.js - 修真月系统测试
 * V823 Iteration 26/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMonth } from '../../../systems/ai/CultivationMonth.js';

describe('CultivationMonth', () => {
    let system;
    beforeEach(() => { system = new CultivationMonth(); });

    describe('recruitMonth', () => {
        it('should create', () => {
            const { month } = system.recruitMonth({ masterId: 'm1' });
            expect(month.masterId).toBe('m1');
        });

        it('should use defaults', () => {
            const { month } = system.recruitMonth({});
            expect(month.type).toBe('lunar');
            expect(month.status).toBe('novice');
            expect(month.level).toBe(1);
            expect(month.phases).toBe(20);
        });

        it('should accept custom values', () => {
            const { month } = system.recruitMonth({ name: 'Foo', type: 'divine', phases: 50 });
            expect(month.name).toBe('Foo');
            expect(month.type).toBe('divine');
            expect(month.phases).toBe(50);
        });

        it('should trigger monthRecruited hook', () => {
            let called = false;
            system.registerHook('monthRecruited', () => { called = true; });
            system.recruitMonth({});
            expect(called).toBe(true);
        });
    });

    describe('getMonth', () => {
        it('should return', () => {
            const { month } = system.recruitMonth({});
            expect(system.getMonth(month.monthId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMonth('ghost')).toBeNull(); });
    });

    describe('listMonths', () => {
        it('should list all', () => {
            system.recruitMonth({});
            expect(system.listMonths().length).toBe(1);
        });
        it('should return empty when none', () => {
            expect(system.listMonths().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitMonth({ masterId: 'm1' });
            system.recruitMonth({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { month } = system.recruitMonth({});
            system.legendMonth(month.monthId);
            system.recruitMonth({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addWeek', () => {
        it('should add week (string)', () => {
            const { month } = system.recruitMonth({});
            system.addWeek(month.monthId, 'first-week-meditation');
            expect(month.weeks.length).toBe(1);
        });

        it('should add week (object)', () => {
            const { month } = system.recruitMonth({});
            system.addWeek(month.monthId, { name: 'second-week-practice', addedAt: 100 });
            expect(month.weeks[0].name).toBe('second-week-practice');
        });

        it('should reject missing', () => {
            const result = system.addWeek('ghost', 'first');
            expect(result.error).toBe('MONTH_NOT_FOUND');
        });

        it('should trigger weekAdded hook', () => {
            const { month } = system.recruitMonth({});
            let called = false;
            system.registerHook('weekAdded', () => { called = true; });
            system.addWeek(month.monthId, 'first');
            expect(called).toBe(true);
        });
    });

    describe('raisePhase', () => {
        it('should raise phases', () => {
            const { month } = system.recruitMonth({});
            system.raisePhase(month.monthId, 10);
            expect(month.phases).toBe(30);
        });

        it('should use default amount', () => {
            const { month } = system.recruitMonth({});
            system.raisePhase(month.monthId);
            expect(month.phases).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raisePhase('ghost', 5);
            expect(result.error).toBe('MONTH_NOT_FOUND');
        });

        it('should trigger phaseRaised hook', () => {
            const { month } = system.recruitMonth({});
            let called = false;
            system.registerHook('phaseRaised', () => { called = true; });
            system.raisePhase(month.monthId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMonth', () => {
        it('should level up', () => {
            const { month } = system.recruitMonth({});
            system.levelUpMonth(month.monthId);
            expect(month.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpMonth('ghost');
            expect(result.error).toBe('MONTH_NOT_FOUND');
        });

        it('should trigger monthLeveledUp hook', () => {
            const { month } = system.recruitMonth({});
            let called = false;
            system.registerHook('monthLeveledUp', () => { called = true; });
            system.levelUpMonth(month.monthId);
            expect(called).toBe(true);
        });
    });

    describe('legendMonth', () => {
        it('should legendize', () => {
            const { month } = system.recruitMonth({});
            system.legendMonth(month.monthId);
            expect(month.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendMonth('ghost');
            expect(result.error).toBe('MONTH_NOT_FOUND');
        });

        it('should trigger monthLegendized hook', () => {
            const { month } = system.recruitMonth({});
            let called = false;
            system.registerHook('monthLegendized', () => { called = true; });
            system.legendMonth(month.monthId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMonthValue', () => {
        it('should calculate', () => {
            const { month } = system.recruitMonth({});
            system.addWeek(month.monthId, 'first');
            system.levelUpMonth(month.monthId);
            // level=2, phases=20, weeks=1: 200 + 40 + 30 = 270
            expect(system.calculateMonthValue(month.monthId)).toBe(270);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMonthValue('ghost')).toBe(0);
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

        it('should execute default getMonth', () => {
            const result = system.executeTool('getMonth', { monthId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('monthRecruited', () => count++);
            unregister();
            system.recruitMonth({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('monthRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitMonth({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMonths = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMonths = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitMonth({});
            const json = system.toJSON();
            expect(json.months.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitMonth({});
            const json = system.toJSON();
            const newSys = new CultivationMonth();
            newSys.fromJSON(json);
            expect(newSys.months.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.monthCount).toBe(0);
        });
    });
});
