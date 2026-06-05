/**
 * DayNightCycle.test.js - 昼夜循环测试
 * V354 Iteration 6/9 Round 8 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DayNightCycle } from '../../../systems/ai/DayNightCycle.js';

describe('DayNightCycle', () => {
    let system;
    beforeEach(() => { system = new DayNightCycle(); });

    describe('listPhases', () => {
        it('should list all', () => { expect(system.listPhases().length).toBe(4); });
    });

    describe('getPhase', () => {
        it('should return initial', () => { expect(system.getPhase()).toBe('day'); });
    });

    describe('getTime', () => {
        it('should return initial', () => { expect(system.getTime()).toBe(0); });
    });

    describe('advance', () => {
        it('should advance', () => {
            system.advance(1000);
            expect(system.currentTime).toBe(1000);
        });

        it('should set phase to dawn at quarter', () => {
            system.advance(1000);
            expect(system.phase).toBe('dawn');
        });

        it('should set phase to day at half', () => {
            system.advance(8000);
            expect(system.phase).toBe('day');
        });

        it('should set phase to dusk at three-quarter', () => {
            system.advance(15000);
            expect(system.phase).toBe('dusk');
        });

        it('should set phase to night at full', () => {
            system.advance(20000);
            expect(system.phase).toBe('night');
        });

        it('should trigger phaseChanged on full cycle', () => {
            let called = false;
            system.registerHook('phaseChanged', () => { called = true; });
            system.advance(24000);
            expect(called).toBe(true);
        });
    });

    describe('setTime', () => {
        it('should set', () => {
            const result = system.setTime(12000);
            expect(system.currentTime).toBe(12000);
        });

        it('should set phase', () => {
            system.setTime(8000);
            expect(system.phase).toBe('day');
        });
    });

    describe('getPhaseEffect', () => {
        it('should return for day', () => {
            const effect = system.getPhaseEffect('day');
            expect(effect.visibility).toBe(1.0);
        });

        it('should return empty for unknown', () => {
            const effect = system.getPhaseEffect('unknown');
            expect(Object.keys(effect).length).toBe(0);
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

        it('should execute default getPhase', () => {
            const result = system.executeTool('getPhase', {});
            expect(result.result).toBe('day');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('phaseChanged', () => count++);
            unregister();
            system.advance(24000);
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('phaseChanged', () => { throw new Error('x'); });
            expect(() => system.advance(24000)).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTransitions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTransitions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.advance(24000);
            const json = system.toJSON();
            expect(json.currentTime).toBe(24000);
        });
        it('should deserialize', () => {
            system.advance(24000);
            const json = system.toJSON();
            const newSys = new DayNightCycle();
            newSys.fromJSON(json);
            expect(newSys.currentTime).toBe(24000);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.phase).toBe('day');
        });
    });
});