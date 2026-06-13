/**
 * MindCore.test.js - 心境核心测试
 * V394 Iteration 1/15 Round 13 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MindCore } from '../../../systems/ai/MindCore.js';

describe('MindCore', () => {
    let system;
    beforeEach(() => { system = new MindCore(); });

    describe('registerMind', () => {
        it('should register', () => {
            const { mind } = system.registerMind({ cultivatorId: 'c1' });
            expect(mind.cultivatorId).toBe('c1');
        });

        it('should trigger mindRegistered hook', () => {
            let called = false;
            system.registerHook('mindRegistered', () => { called = true; });
            system.registerMind({});
            expect(called).toBe(true);
        });
    });

    describe('getMind', () => {
        it('should return', () => {
            const { mind } = system.registerMind({});
            expect(system.getMind(mind.mindId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMind('ghost')).toBeNull(); });
    });

    describe('listMinds', () => {
        it('should list all', () => {
            system.registerMind({});
            expect(system.listMinds().length).toBe(1);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.registerMind({ cultivatorId: 'c1' });
            system.registerMind({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listByClarity', () => {
        it('should filter', () => {
            const { mind: m1 } = system.registerMind({});
            const { mind: m2 } = system.registerMind({});
            m1.clarity = 80;
            m2.clarity = 30;
            expect(system.listByClarity(50).length).toBe(1);
        });
    });

    describe('meditate', () => {
        it('should increase clarity', () => {
            const { mind } = system.registerMind({});
            system.meditate(mind.mindId, 10);
            expect(mind.clarity).toBe(60);
        });

        it('should cap at 100', () => {
            const { mind } = system.registerMind({});
            system.meditate(mind.mindId, 200);
            expect(mind.clarity).toBe(100);
        });

        it('should increase daoHeart', () => {
            const { mind } = system.registerMind({});
            system.meditate(mind.mindId, 10);
            expect(mind.daoHeart).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.meditate('ghost', 10);
            expect(result.error).toBe('MIND_NOT_FOUND');
        });

        it('should trigger meditationDone hook', () => {
            const { mind } = system.registerMind({});
            let called = false;
            system.registerHook('meditationDone', () => { called = true; });
            system.meditate(mind.mindId, 10);
            expect(called).toBe(true);
        });
    });

    describe('disturb', () => {
        it('should decrease clarity', () => {
            const { mind } = system.registerMind({});
            system.disturb(mind.mindId, 20);
            expect(mind.clarity).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.disturb('ghost', 10);
            expect(result.error).toBe('MIND_NOT_FOUND');
        });

        it('should trigger mindDisturbed hook', () => {
            const { mind } = system.registerMind({});
            let called = false;
            system.registerHook('mindDisturbed', () => { called = true; });
            system.disturb(mind.mindId, 10);
            expect(called).toBe(true);
        });
    });

    describe('focusOn', () => {
        it('should increase focus', () => {
            const { mind } = system.registerMind({});
            system.focusOn(mind.mindId, 10);
            expect(mind.focus).toBe(100);
        });

        it('should reject missing', () => {
            const result = system.focusOn('ghost', 10);
            expect(result.error).toBe('MIND_NOT_FOUND');
        });

        it('should trigger mindFocused hook', () => {
            const { mind } = system.registerMind({});
            let called = false;
            system.registerHook('mindFocused', () => { called = true; });
            system.focusOn(mind.mindId, 10);
            expect(called).toBe(true);
        });
    });

    describe('calculatePower', () => {
        it('should calculate', () => {
            const { mind } = system.registerMind({});
            expect(system.calculatePower(mind.mindId)).toBeCloseTo(87.5, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePower('ghost')).toBe(0);
        });
    });

    describe('listStable', () => {
        it('should filter', () => {
            const { mind: m1 } = system.registerMind({});
            const { mind: m2 } = system.registerMind({});
            m1.stability = 90;
            m2.stability = 30;
            expect(system.listStable().length).toBe(1);
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

        it('should execute default getMind', () => {
            const result = system.executeTool('getMind', { mindId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('mindRegistered', () => count++);
            unregister();
            system.registerMind({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('mindRegistered', () => { throw new Error('x'); });
            expect(() => system.registerMind({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMinds = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMinds = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerMind({});
            const json = system.toJSON();
            expect(json.minds.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerMind({});
            const json = system.toJSON();
            const newSys = new MindCore();
            newSys.fromJSON(json);
            expect(newSys.minds.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.mindCount).toBe(0);
        });
    });
});