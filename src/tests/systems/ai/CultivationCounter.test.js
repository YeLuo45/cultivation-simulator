/**
 * CultivationCounter.test.js - 修真反击测试
 * V736 Iteration 29/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationCounter } from '../../../systems/ai/CultivationCounter.js';

describe('CultivationCounter', () => {
    let system;
    beforeEach(() => { system = new CultivationCounter(); });

    describe('recruitCounter', () => {
        it('should recruit', () => {
            const { counter } = system.recruitCounter({ masterId: 'm1', name: 'Void Strike' });
            expect(counter.masterId).toBe('m1');
            expect(counter.name).toBe('Void Strike');
        });

        it('should set defaults', () => {
            const { counter } = system.recruitCounter({});
            expect(counter.type).toBe('strike');
            expect(counter.status).toBe('novice');
            expect(counter.level).toBe(1);
            expect(counter.readiness).toBe(20);
            expect(counter.retorts).toEqual([]);
        });

        it('should trigger counterRecruited hook', () => {
            let called = false;
            system.registerHook('counterRecruited', () => { called = true; });
            system.recruitCounter({});
            expect(called).toBe(true);
        });
    });

    describe('getCounter', () => {
        it('should return', () => {
            const { counter } = system.recruitCounter({});
            expect(system.getCounter(counter.counterId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCounter('ghost')).toBeNull(); });
    });

    describe('listCounters', () => {
        it('should list all', () => {
            system.recruitCounter({});
            system.recruitCounter({});
            expect(system.listCounters().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitCounter({ masterId: 'm1' });
            system.recruitCounter({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { counter } = system.recruitCounter({});
            system.legendCounter(counter.counterId);
            system.recruitCounter({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addRetort', () => {
        it('should add retort', () => {
            const { counter } = system.recruitCounter({});
            system.addRetort(counter.counterId, 'retort_1');
            expect(counter.retorts.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addRetort('ghost', 'r');
            expect(result.error).toBe('COUNTER_NOT_FOUND');
        });

        it('should trigger retortAdded hook', () => {
            const { counter } = system.recruitCounter({});
            let called = false;
            system.registerHook('retortAdded', () => { called = true; });
            system.addRetort(counter.counterId, 'r');
            expect(called).toBe(true);
        });
    });

    describe('raiseReadiness', () => {
        it('should raise', () => {
            const { counter } = system.recruitCounter({});
            system.raiseReadiness(counter.counterId, 10);
            expect(counter.readiness).toBe(30);
        });

        it('should use default amount', () => {
            const { counter } = system.recruitCounter({});
            system.raiseReadiness(counter.counterId);
            expect(counter.readiness).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseReadiness('ghost', 5);
            expect(result.error).toBe('COUNTER_NOT_FOUND');
        });

        it('should trigger readinessRaised hook', () => {
            const { counter } = system.recruitCounter({});
            let called = false;
            system.registerHook('readinessRaised', () => { called = true; });
            system.raiseReadiness(counter.counterId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpCounter', () => {
        it('should level up', () => {
            const { counter } = system.recruitCounter({});
            system.levelUpCounter(counter.counterId);
            expect(counter.level).toBe(2);
        });

        it('should set veteran status at level 3', () => {
            const { counter } = system.recruitCounter({});
            system.levelUpCounter(counter.counterId);
            system.levelUpCounter(counter.counterId);
            expect(counter.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.levelUpCounter('ghost');
            expect(result.error).toBe('COUNTER_NOT_FOUND');
        });

        it('should trigger counterLeveledUp hook', () => {
            const { counter } = system.recruitCounter({});
            let called = false;
            system.registerHook('counterLeveledUp', () => { called = true; });
            system.levelUpCounter(counter.counterId);
            expect(called).toBe(true);
        });
    });

    describe('legendCounter', () => {
        it('should set legendary', () => {
            const { counter } = system.recruitCounter({});
            system.legendCounter(counter.counterId);
            expect(counter.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendCounter('ghost');
            expect(result.error).toBe('COUNTER_NOT_FOUND');
        });

        it('should trigger counterLegendized hook', () => {
            const { counter } = system.recruitCounter({});
            let called = false;
            system.registerHook('counterLegendized', () => { called = true; });
            system.legendCounter(counter.counterId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCounterValue', () => {
        it('should calculate', () => {
            const { counter } = system.recruitCounter({});
            system.addRetort(counter.counterId, 'r1');
            system.raiseReadiness(counter.counterId, 5);
            // level=1, readiness=25, retorts=1: 1*100 + 25*2 + 1*30 = 100+50+30 = 180
            expect(system.calculateCounterValue(counter.counterId)).toBe(180);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCounterValue('ghost')).toBe(0);
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

        it('should execute default getCounter', () => {
            const result = system.executeTool('getCounter', { counterId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('counterRecruited', () => count++);
            unregister();
            system.recruitCounter({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('counterRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitCounter({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCounters = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCounters = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitCounter({});
            const json = system.toJSON();
            expect(json.counters.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitCounter({});
            const json = system.toJSON();
            const newSys = new CultivationCounter();
            newSys.fromJSON(json);
            expect(newSys.counters.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.counterCount).toBe(0);
        });
    });
});
