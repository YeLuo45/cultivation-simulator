/**
 * CultivationAlgorithm.test.js - 修真算法系统测试
 * V575 Iteration 18/20 Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationAlgorithm } from '../../../systems/ai/CultivationAlgorithm.js';

describe('CultivationAlgorithm', () => {
    let system;
    beforeEach(() => { system = new CultivationAlgorithm(); });

    describe('designAlgorithm', () => {
        it('should design with given fields', () => {
            const { algorithm } = system.designAlgorithm({ authorId: 'a1', name: 'Quicksort', type: 'sort' });
            expect(algorithm.authorId).toBe('a1');
            expect(algorithm.name).toBe('Quicksort');
            expect(algorithm.type).toBe('sort');
        });

        it('should default type to sort and complexity to 20', () => {
            const { algorithm } = system.designAlgorithm({ authorId: 'a1' });
            expect(algorithm.type).toBe('sort');
            expect(algorithm.complexity).toBe(20);
            expect(algorithm.status).toBe('draft');
            expect(algorithm.steps).toEqual([]);
            expect(algorithm.level).toBe(1);
        });

        it('should generate an algorithmId when not provided', () => {
            const { algorithm } = system.designAlgorithm({});
            expect(algorithm.algorithmId).toBeTruthy();
            expect(typeof algorithm.algorithmId).toBe('string');
        });

        it('should use custom config baseComplexity', () => {
            const customSystem = new CultivationAlgorithm({ baseComplexity: 50 });
            const { algorithm } = customSystem.designAlgorithm({ authorId: 'a1' });
            expect(algorithm.complexity).toBe(50);
        });

        it('should trigger algorithmDesigned hook', () => {
            let called = false;
            system.registerHook('algorithmDesigned', () => { called = true; });
            system.designAlgorithm({});
            expect(called).toBe(true);
        });
    });

    describe('getAlgorithm', () => {
        it('should return algorithm copy', () => {
            const { algorithm } = system.designAlgorithm({});
            const found = system.getAlgorithm(algorithm.algorithmId);
            expect(found).not.toBeNull();
            expect(found.algorithmId).toBe(algorithm.algorithmId);
        });
        it('should return null for missing', () => { expect(system.getAlgorithm('ghost')).toBeNull(); });
    });

    describe('listAlgorithms', () => {
        it('should list all algorithms', () => {
            system.designAlgorithm({});
            system.designAlgorithm({});
            system.designAlgorithm({});
            expect(system.listAlgorithms().length).toBe(3);
        });
    });

    describe('listByAuthor', () => {
        it('should filter by author', () => {
            system.designAlgorithm({ authorId: 'a1' });
            system.designAlgorithm({ authorId: 'a2' });
            system.designAlgorithm({ authorId: 'a1' });
            expect(system.listByAuthor('a1').length).toBe(2);
            expect(system.listByAuthor('a2').length).toBe(1);
            expect(system.listByAuthor('a3').length).toBe(0);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.designAlgorithm({ type: 'sort' });
            system.designAlgorithm({ type: 'search' });
            system.designAlgorithm({ type: 'sort' });
            expect(system.listByType('sort').length).toBe(2);
            expect(system.listByType('search').length).toBe(1);
            expect(system.listByType('optimize').length).toBe(0);
        });
    });

    describe('listOptimal', () => {
        it('should list only optimal algorithms', () => {
            const { algorithm: a } = system.designAlgorithm({});
            const { algorithm: b } = system.designAlgorithm({});
            system.optimalAlgorithm(a.algorithmId);
            expect(system.listOptimal().length).toBe(1);
            expect(system.listOptimal()[0].algorithmId).toBe(a.algorithmId);
            expect(b.status).toBe('draft');
        });
    });

    describe('addStep', () => {
        it('should add a step to algorithm', () => {
            const { algorithm } = system.designAlgorithm({});
            const result = system.addStep(algorithm.algorithmId, 'partition');
            expect(result.success).toBe(true);
            expect(algorithm.steps).toContain('partition');
        });

        it('should add multiple steps', () => {
            const { algorithm } = system.designAlgorithm({});
            system.addStep(algorithm.algorithmId, 'step1');
            system.addStep(algorithm.algorithmId, 'step2');
            expect(algorithm.steps.length).toBe(2);
            expect(algorithm.steps[0]).toBe('step1');
            expect(algorithm.steps[1]).toBe('step2');
        });

        it('should reject missing algorithm', () => {
            const result = system.addStep('ghost', 'x');
            expect(result.error).toBe('ALGORITHM_NOT_FOUND');
        });

        it('should trigger stepAdded hook', () => {
            const { algorithm } = system.designAlgorithm({});
            let called = false;
            system.registerHook('stepAdded', () => { called = true; });
            system.addStep(algorithm.algorithmId, 'partition');
            expect(called).toBe(true);
        });
    });

    describe('increaseComplexity', () => {
        it('should increase by default 5', () => {
            const { algorithm } = system.designAlgorithm({});
            system.increaseComplexity(algorithm.algorithmId);
            expect(algorithm.complexity).toBe(25);
        });

        it('should increase by custom amount', () => {
            const { algorithm } = system.designAlgorithm({});
            system.increaseComplexity(algorithm.algorithmId, 30);
            expect(algorithm.complexity).toBe(50);
        });

        it('should reject missing algorithm', () => {
            const result = system.increaseComplexity('ghost', 10);
            expect(result.error).toBe('ALGORITHM_NOT_FOUND');
        });

        it('should trigger complexityIncreased hook', () => {
            const { algorithm } = system.designAlgorithm({});
            let called = false;
            system.registerHook('complexityIncreased', () => { called = true; });
            system.increaseComplexity(algorithm.algorithmId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpAlgorithm', () => {
        it('should level up', () => {
            const { algorithm } = system.designAlgorithm({});
            system.levelUpAlgorithm(algorithm.algorithmId);
            expect(algorithm.level).toBe(2);
        });

        it('should promote status to tested on level up from draft', () => {
            const { algorithm } = system.designAlgorithm({});
            system.levelUpAlgorithm(algorithm.algorithmId);
            expect(algorithm.status).toBe('tested');
        });

        it('should not demote status from tested/optimal on further level ups', () => {
            const { algorithm } = system.designAlgorithm({});
            system.levelUpAlgorithm(algorithm.algorithmId);
            expect(algorithm.status).toBe('tested');
            system.levelUpAlgorithm(algorithm.algorithmId);
            expect(algorithm.status).toBe('tested');
        });

        it('should reject missing algorithm', () => {
            const result = system.levelUpAlgorithm('ghost');
            expect(result.error).toBe('ALGORITHM_NOT_FOUND');
        });

        it('should trigger algorithmLeveledUp hook', () => {
            const { algorithm } = system.designAlgorithm({});
            let called = false;
            system.registerHook('algorithmLeveledUp', () => { called = true; });
            system.levelUpAlgorithm(algorithm.algorithmId);
            expect(called).toBe(true);
        });
    });

    describe('optimalAlgorithm', () => {
        it('should set status to optimal', () => {
            const { algorithm } = system.designAlgorithm({});
            system.optimalAlgorithm(algorithm.algorithmId);
            expect(algorithm.status).toBe('optimal');
        });

        it('should reject missing algorithm', () => {
            const result = system.optimalAlgorithm('ghost');
            expect(result.error).toBe('ALGORITHM_NOT_FOUND');
        });

        it('should trigger algorithmOptimized hook', () => {
            const { algorithm } = system.designAlgorithm({});
            let called = false;
            system.registerHook('algorithmOptimized', () => { called = true; });
            system.optimalAlgorithm(algorithm.algorithmId);
            expect(called).toBe(true);
        });
    });

    describe('calculateAlgorithmValue', () => {
        it('should calculate value with no steps', () => {
            const { algorithm } = system.designAlgorithm({ complexity: 20 });
            // 1 * 100 + 20 * 2 + 0 * 30 = 100 + 40 + 0 = 140
            expect(system.calculateAlgorithmValue(algorithm.algorithmId)).toBe(140);
        });

        it('should calculate value with steps and level', () => {
            const { algorithm } = system.designAlgorithm({ complexity: 20 });
            system.addStep(algorithm.algorithmId, 's1');
            system.addStep(algorithm.algorithmId, 's2');
            system.levelUpAlgorithm(algorithm.algorithmId);
            // 2 * 100 + 20 * 2 + 2 * 30 = 200 + 40 + 60 = 300
            expect(system.calculateAlgorithmValue(algorithm.algorithmId)).toBe(300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateAlgorithmValue('ghost')).toBe(0);
        });
    });

    describe('Tool System', () => {
        it('should register and list tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute custom tool', () => {
            system.registerTool('test', (ctx) => ctx.value);
            const result = system.executeTool('test', { value: 42 });
            expect(result.success).toBe(true);
            expect(result.result).toBe(42);
        });

        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should handle tool execution errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.success).toBe(false);
            expect(result.error).toBe('boom');
        });

        it('should handle tool execution with no context', () => {
            system.registerTool('test', (ctx) => ctx);
            const result = system.executeTool('test');
            expect(result.success).toBe(true);
            expect(result.result).toEqual({});
        });

        it('should handle tool execution with null context', () => {
            system.registerTool('test', (ctx) => ctx);
            const result = system.executeTool('test', null);
            expect(result.success).toBe(true);
            expect(result.result).toEqual({});
        });

        it('should execute default getAlgorithm tool', () => {
            const { algorithm } = system.designAlgorithm({});
            const result = system.executeTool('getAlgorithm', { algorithmId: algorithm.algorithmId });
            expect(result.success).toBe(true);
            expect(result.result.algorithmId).toBe(algorithm.algorithmId);
        });

        it('should execute default designAlgorithm tool', () => {
            const result = system.executeTool('designAlgorithm', { authorId: 'a1', name: 'X', type: 'search' });
            expect(result.success).toBe(true);
            expect(result.result.algorithm.authorId).toBe('a1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('algorithmDesigned', () => count++);
            unregister();
            system.designAlgorithm({});
            expect(count).toBe(0);
        });

        it('should handle unregister when event no longer exists', () => {
            const unregister = system.registerHook('algorithmDesigned', () => {});
            system.hooks.delete('algorithmDesigned');
            expect(() => unregister()).not.toThrow();
        });

        it('should handle unregister when handler already removed', () => {
            const handler = () => {};
            const unregister = system.registerHook('algorithmDesigned', handler);
            unregister();
            expect(() => unregister()).not.toThrow();
        });

        it('should handle errors silently in hooks', () => {
            system.registerHook('algorithmDesigned', () => { throw new Error('x'); });
            expect(() => system.designAlgorithm({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient algorithms', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when threshold met', () => {
            system.stats.totalAlgorithms = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxAlgorithms).toBe(70);
        });
        it('should not double evolve', () => {
            system.stats.totalAlgorithms = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.designAlgorithm({});
            system.designAlgorithm({});
            const json = system.toJSON();
            expect(json.algorithms.length).toBe(2);
            expect(json.stats.totalAlgorithms).toBe(2);
        });

        it('should deserialize from JSON', () => {
            system.designAlgorithm({ name: 'A' });
            const json = system.toJSON();
            const newSys = new CultivationAlgorithm();
            newSys.fromJSON(json);
            expect(newSys.algorithms.size).toBe(1);
            expect(newSys.stats.totalAlgorithms).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with count', () => {
            system.designAlgorithm({});
            const stats = system.getStats();
            expect(stats.algorithmCount).toBe(1);
            expect(stats.totalAlgorithms).toBe(1);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
