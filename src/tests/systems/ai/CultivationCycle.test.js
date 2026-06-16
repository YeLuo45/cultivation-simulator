/**
 * CultivationCycle.test.js - 修真周期系统测试
 * V581 Iteration 4/20 Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationCycle } from '../../../systems/ai/CultivationCycle.js';

describe('CultivationCycle', () => {
    let system;
    beforeEach(() => { system = new CultivationCycle(); });

    describe('openCycle', () => {
        it('should create with default values', () => {
            const { cycle } = system.openCycle({ observerId: 'o1' });
            expect(cycle.observerId).toBe('o1');
            expect(cycle.name).toBe('Cultivation Cycle');
            expect(cycle.type).toBe('daily');
            expect(cycle.rhythm).toBe(20);
            expect(cycle.phases).toEqual([]);
            expect(cycle.level).toBe(1);
            expect(cycle.status).toBe('active');
        });

        it('should create with custom values', () => {
            const { cycle } = system.openCycle({ observerId: 'o1', name: 'Yearly Wheel', type: 'yearly', rhythm: 50 });
            expect(cycle.name).toBe('Yearly Wheel');
            expect(cycle.type).toBe('yearly');
            expect(cycle.rhythm).toBe(50);
            expect(cycle.level).toBe(1);
        });

        it('should support karmic type', () => {
            const { cycle } = system.openCycle({ observerId: 'o1', type: 'karmic' });
            expect(cycle.type).toBe('karmic');
        });

        it('should generate a unique cycleId', () => {
            const { cycle: c1 } = system.openCycle({});
            const { cycle: c2 } = system.openCycle({});
            expect(c1.cycleId).not.toBe(c2.cycleId);
        });

        it('should accept custom id', () => {
            const { cycle } = system.openCycle({ id: 'custom_42' });
            expect(cycle.cycleId).toBe('custom_42');
        });

        it('should trigger cycleOpened hook', () => {
            let called = false;
            system.registerHook('cycleOpened', () => { called = true; });
            system.openCycle({});
            expect(called).toBe(true);
        });
    });

    describe('getCycle', () => {
        it('should return cycle', () => {
            const { cycle } = system.openCycle({});
            expect(system.getCycle(cycle.cycleId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getCycle('ghost')).toBeNull();
        });
    });

    describe('listCycles', () => {
        it('should list all', () => {
            system.openCycle({});
            system.openCycle({});
            expect(system.listCycles().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listCycles().length).toBe(0);
        });

        it('should return clones with phases arrays', () => {
            const { cycle } = system.openCycle({});
            system.addPhase(cycle.cycleId, 'p1');
            const listed = system.listCycles();
            expect(listed[0].phases).toEqual([{ name: 'p1', timestamp: listed[0].phases[0].timestamp }]);
        });
    });

    describe('listByObserver', () => {
        it('should filter by observer', () => {
            system.openCycle({ observerId: 'o1' });
            system.openCycle({ observerId: 'o2' });
            system.openCycle({ observerId: 'o1' });
            expect(system.listByObserver('o1').length).toBe(2);
        });

        it('should return empty for unknown observer', () => {
            system.openCycle({ observerId: 'o1' });
            expect(system.listByObserver('unknown').length).toBe(0);
        });
    });

    describe('listEternal', () => {
        it('should only list eternal cycles', () => {
            const { cycle: c1 } = system.openCycle({});
            const { cycle: c2 } = system.openCycle({});
            system.eternalizeCycle(c1.cycleId);
            const eternal = system.listEternal();
            expect(eternal.length).toBe(1);
            expect(eternal[0].cycleId).toBe(c1.cycleId);
            expect(eternal[0].cycleId).not.toBe(c2.cycleId);
        });

        it('should return empty when none eternal', () => {
            system.openCycle({});
            expect(system.listEternal().length).toBe(0);
        });
    });

    describe('addPhase', () => {
        it('should add string phase', () => {
            const { cycle } = system.openCycle({});
            system.addPhase(cycle.cycleId, 'awakening');
            expect(cycle.phases.length).toBe(1);
            expect(cycle.phases[0].name).toBe('awakening');
        });

        it('should add object phase', () => {
            const { cycle } = system.openCycle({});
            system.addPhase(cycle.cycleId, { name: 'meditation', detail: 'deep' });
            expect(cycle.phases.length).toBe(1);
            expect(cycle.phases[0].name).toBe('meditation');
            expect(cycle.phases[0].detail).toBe('deep');
        });

        it('should preserve provided timestamp', () => {
            const { cycle } = system.openCycle({});
            system.addPhase(cycle.cycleId, { name: 'm', timestamp: 12345 });
            expect(cycle.phases[0].timestamp).toBe(12345);
        });

        it('should reject missing', () => {
            const result = system.addPhase('ghost', 'p');
            expect(result.error).toBe('CYCLE_NOT_FOUND');
        });

        it('should trigger phaseAdded hook', () => {
            const { cycle } = system.openCycle({});
            let received = null;
            system.registerHook('phaseAdded', (d) => { received = d; });
            system.addPhase(cycle.cycleId, 'phaseA');
            expect(received).not.toBeNull();
            expect(received.cycleId).toBe(cycle.cycleId);
            expect(received.phase.name).toBe('phaseA');
            expect(received.phaseCount).toBe(1);
        });
    });

    describe('increaseRhythm', () => {
        it('should increase rhythm by default 5', () => {
            const { cycle } = system.openCycle({});
            const initial = cycle.rhythm;
            system.increaseRhythm(cycle.cycleId);
            expect(cycle.rhythm).toBe(initial + 5);
        });

        it('should increase rhythm by custom amount', () => {
            const { cycle } = system.openCycle({});
            system.increaseRhythm(cycle.cycleId, 25);
            expect(cycle.rhythm).toBe(45);
        });

        it('should reject missing', () => {
            const result = system.increaseRhythm('ghost', 5);
            expect(result.error).toBe('CYCLE_NOT_FOUND');
        });

        it('should trigger rhythmIncreased hook', () => {
            const { cycle } = system.openCycle({});
            let received = null;
            system.registerHook('rhythmIncreased', (d) => { received = d; });
            system.increaseRhythm(cycle.cycleId, 10);
            expect(received).not.toBeNull();
            expect(received.cycleId).toBe(cycle.cycleId);
            expect(received.amount).toBe(10);
            expect(received.newRhythm).toBe(30);
        });
    });

    describe('levelUpCycle', () => {
        it('should level up by 1', () => {
            const { cycle } = system.openCycle({});
            system.levelUpCycle(cycle.cycleId);
            expect(cycle.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { cycle } = system.openCycle({});
            system.levelUpCycle(cycle.cycleId);
            system.levelUpCycle(cycle.cycleId);
            system.levelUpCycle(cycle.cycleId);
            expect(cycle.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpCycle('ghost');
            expect(result.error).toBe('CYCLE_NOT_FOUND');
        });

        it('should trigger cycleLeveledUp hook', () => {
            const { cycle } = system.openCycle({});
            let received = null;
            system.registerHook('cycleLeveledUp', (d) => { received = d; });
            system.levelUpCycle(cycle.cycleId);
            expect(received).not.toBeNull();
            expect(received.cycleId).toBe(cycle.cycleId);
            expect(received.newLevel).toBe(2);
        });
    });

    describe('eternalizeCycle', () => {
        it('should set status to eternal', () => {
            const { cycle } = system.openCycle({});
            system.eternalizeCycle(cycle.cycleId);
            expect(cycle.status).toBe('eternal');
        });

        it('should reject missing', () => {
            const result = system.eternalizeCycle('ghost');
            expect(result.error).toBe('CYCLE_NOT_FOUND');
        });

        it('should trigger cycleEternalized hook', () => {
            const { cycle } = system.openCycle({});
            let called = false;
            system.registerHook('cycleEternalized', () => { called = true; });
            system.eternalizeCycle(cycle.cycleId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCycleValue', () => {
        it('should calculate level * 100 + rhythm * 2 + phases.length * 30', () => {
            const { cycle } = system.openCycle({ rhythm: 50 });
            system.addPhase(cycle.cycleId, 'p1');
            system.addPhase(cycle.cycleId, 'p2');
            system.levelUpCycle(cycle.cycleId);
            // level=2, rhythm=50, phases=2 -> 200 + 100 + 60 = 360
            expect(system.calculateCycleValue(cycle.cycleId)).toBe(360);
        });

        it('should handle fresh cycle', () => {
            const { cycle } = system.openCycle({});
            // level=1, rhythm=20, phases=0 -> 100 + 40 + 0 = 140
            expect(system.calculateCycleValue(cycle.cycleId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCycleValue('ghost')).toBe(0);
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

        it('should execute default getCycle and openCycle', () => {
            const openResult = system.executeTool('openCycle', { observerId: 'o1' });
            expect(openResult.success).toBe(true);
            const c = openResult.result.cycle;
            const getResult = system.executeTool('getCycle', { cycleId: c.cycleId });
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
            const unregister = system.registerHook('cycleOpened', () => count++);
            unregister();
            system.openCycle({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('cycleOpened', () => { throw new Error('x'); });
            expect(() => system.openCycle({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when totalCycles >= 5', () => {
            system.stats.totalCycles = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalCycles = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openCycle({});
            const json = system.toJSON();
            expect(json.cycles.length).toBe(1);
        });

        it('should deserialize', () => {
            system.openCycle({});
            const json = system.toJSON();
            const newSys = new CultivationCycle();
            newSys.fromJSON(json);
            expect(newSys.cycles.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with cycleCount', () => {
            system.openCycle({});
            const stats = system.getStats();
            expect(stats.cycleCount).toBe(1);
            expect(stats.totalCycles).toBe(1);
        });
    });
});
