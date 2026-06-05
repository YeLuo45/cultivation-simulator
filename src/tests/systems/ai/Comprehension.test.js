/**
 * Comprehension.test.js - 悟性系统测试
 * V343 Iteration 4/9 Round 7 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Comprehension } from '../../../systems/ai/Comprehension.js';

describe('Comprehension', () => {
    let system;
    beforeEach(() => { system = new Comprehension(); });

    describe('registerCultivator', () => {
        it('should register', () => {
            const { cultivator } = system.registerCultivator({ name: 'C1' });
            expect(cultivator.name).toBe('C1');
        });

        it('should start at level 1', () => {
            const { cultivator } = system.registerCultivator({});
            expect(cultivator.level).toBe(1);
        });
    });

    describe('getCultivator', () => {
        it('should return', () => {
            const { cultivator } = system.registerCultivator({});
            expect(system.getCultivator(cultivator.cultivatorId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCultivator('ghost')).toBeNull(); });
    });

    describe('listCultivators', () => {
        it('should list all', () => {
            system.registerCultivator({});
            expect(system.listCultivators().length).toBe(1);
        });
    });

    describe('trainComprehension', () => {
        it('should train', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.trainComprehension(cultivator.cultivatorId, 50);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.trainComprehension('ghost', 50);
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should increase exp', () => {
            const { cultivator } = system.registerCultivator({});
            system.trainComprehension(cultivator.cultivatorId, 50);
            expect(cultivator.exp).toBe(50);
        });

        it('should level up at threshold', () => {
            const { cultivator } = system.registerCultivator({});
            system.trainComprehension(cultivator.cultivatorId, 200);
            expect(cultivator.level).toBeGreaterThan(1);
        });

        it('should trigger levelUp hook', () => {
            const { cultivator } = system.registerCultivator({});
            let called = false;
            system.registerHook('levelUp', () => { called = true; });
            system.trainComprehension(cultivator.cultivatorId, 200);
            expect(called).toBe(true);
        });

        it('should trigger comprehensionTrained hook', () => {
            const { cultivator } = system.registerCultivator({});
            let called = false;
            system.registerHook('comprehensionTrained', () => { called = true; });
            system.trainComprehension(cultivator.cultivatorId, 50);
            expect(called).toBe(true);
        });
    });

    describe('realizeTruth', () => {
        it('should realize', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.realizeTruth(cultivator.cultivatorId, 'the void');
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.realizeTruth('ghost', 'x');
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should add to cultivator truths', () => {
            const { cultivator } = system.registerCultivator({});
            system.realizeTruth(cultivator.cultivatorId, 'x');
            expect(cultivator.realizedTruths.length).toBe(1);
        });

        it('should trigger truthRealized hook', () => {
            const { cultivator } = system.registerCultivator({});
            let called = false;
            system.registerHook('truthRealized', () => { called = true; });
            system.realizeTruth(cultivator.cultivatorId, 'x');
            expect(called).toBe(true);
        });
    });

    describe('listRealizations', () => {
        it('should filter by cultivator', () => {
            const { cultivator: c1 } = system.registerCultivator({});
            const { cultivator: c2 } = system.registerCultivator({});
            system.realizeTruth(c1.cultivatorId, 'x');
            system.realizeTruth(c2.cultivatorId, 'y');
            expect(system.listRealizations(c1.cultivatorId).length).toBe(1);
        });
    });

    describe('calculateLearningRate', () => {
        it('should calculate', () => {
            const { cultivator } = system.registerCultivator({});
            const rate = system.calculateLearningRate(cultivator.cultivatorId);
            expect(rate).toBeGreaterThan(0);
        });

        it('should return null for missing', () => {
            expect(system.calculateLearningRate('ghost')).toBeNull();
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

        it('should execute default getCultivator', () => {
            const result = system.executeTool('getCultivator', { cultivatorId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('comprehensionTrained', () => count++);
            unregister();
            const { cultivator } = system.registerCultivator({});
            system.trainComprehension(cultivator.cultivatorId, 50);
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('comprehensionTrained', () => { throw new Error('x'); });
            const { cultivator } = system.registerCultivator({});
            expect(() => system.trainComprehension(cultivator.cultivatorId, 50)).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalRealizations = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalRealizations = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerCultivator({});
            const json = system.toJSON();
            expect(json.cultivators.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerCultivator({});
            const json = system.toJSON();
            const newSys = new Comprehension();
            newSys.fromJSON(json);
            expect(newSys.cultivators.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.cultivatorCount).toBe(0);
        });
    });
});