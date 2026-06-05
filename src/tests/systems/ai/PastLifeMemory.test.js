/**
 * PastLifeMemory.test.js - 前世记忆测试
 * V370 Iteration 4/9 Round 10 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PastLifeMemory } from '../../../systems/ai/PastLifeMemory.js';

describe('PastLifeMemory', () => {
    let system;
    beforeEach(() => { system = new PastLifeMemory(); });

    describe('registerLife', () => {
        it('should register', () => {
            const { life } = system.registerLife({ soulId: 's1', era: 'ancient' });
            expect(life.era).toBe('ancient');
        });
    });

    describe('getLife', () => {
        it('should return', () => {
            const { life } = system.registerLife({});
            expect(system.getLife(life.lifeId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getLife('ghost')).toBeNull(); });
    });

    describe('listLives', () => {
        it('should list all', () => {
            system.registerLife({});
            expect(system.listLives().length).toBe(1);
        });
    });

    describe('listLivesBySoul', () => {
        it('should filter', () => {
            system.registerLife({ soulId: 's1' });
            system.registerLife({ soulId: 's2' });
            expect(system.listLivesBySoul('s1').length).toBe(1);
        });
    });

    describe('recordMemory', () => {
        it('should record', () => {
            const result = system.recordMemory('s1', { content: 'past life' });
            expect(result.success).toBe(true);
        });

        it('should trigger memoryRecorded hook', () => {
            let called = false;
            system.registerHook('memoryRecorded', () => { called = true; });
            system.recordMemory('s1', {});
            expect(called).toBe(true);
        });
    });

    describe('getMemory', () => {
        it('should return', () => {
            const { memory } = system.recordMemory('s1', {});
            expect(system.getMemory(memory.memoryId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMemory('ghost')).toBeNull(); });
    });

    describe('listMemories', () => {
        it('should list all', () => {
            system.recordMemory('s1', {});
            expect(system.listMemories().length).toBe(1);
        });
    });

    describe('listMemoriesBySoul', () => {
        it('should filter', () => {
            system.recordMemory('s1', {});
            system.recordMemory('s2', {});
            expect(system.listBySoul('s1').length).toBe(1);
        });
    });

    describe('listByLife', () => {
        it('should filter', () => {
            system.recordMemory('s1', { lifeId: 'l1' });
            system.recordMemory('s1', { lifeId: 'l2' });
            expect(system.listByLife('l1').length).toBe(1);
        });
    });

    describe('listByClarity', () => {
        it('should filter', () => {
            system.recordMemory('s1', { clarity: 0.9 });
            system.recordMemory('s1', { clarity: 0.2 });
            expect(system.listByClarity(0.5).length).toBe(1);
        });
    });

    describe('enhanceMemory', () => {
        it('should enhance', () => {
            const { memory } = system.recordMemory('s1', { clarity: 0.5 });
            system.enhanceMemory(memory.memoryId, 0.3);
            expect(memory.clarity).toBeCloseTo(0.8, 5);
        });

        it('should reject missing', () => {
            const result = system.enhanceMemory('ghost', 0.1);
            expect(result.error).toBe('MEMORY_NOT_FOUND');
        });

        it('should cap at 1', () => {
            const { memory } = system.recordMemory('s1', { clarity: 0.9 });
            system.enhanceMemory(memory.memoryId, 0.5);
            expect(memory.clarity).toBe(1);
        });

        it('should trigger memoryEnhanced hook', () => {
            const { memory } = system.recordMemory('s1', {});
            let called = false;
            system.registerHook('memoryEnhanced', () => { called = true; });
            system.enhanceMemory(memory.memoryId, 0.1);
            expect(called).toBe(true);
        });
    });

    describe('clearMemory', () => {
        it('should clear', () => {
            const { memory } = system.recordMemory('s1', {});
            const result = system.clearMemory(memory.memoryId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.clearMemory('ghost');
            expect(result.error).toBe('MEMORY_NOT_FOUND');
        });

        it('should trigger memoryCleared hook', () => {
            const { memory } = system.recordMemory('s1', {});
            let called = false;
            system.registerHook('memoryCleared', () => { called = true; });
            system.clearMemory(memory.memoryId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTotalClarity', () => {
        it('should calculate', () => {
            system.recordMemory('s1', { clarity: 0.5 });
            system.recordMemory('s1', { clarity: 0.3 });
            expect(system.calculateTotalClarity('s1')).toBeCloseTo(0.8, 5);
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

        it('should execute default getMemory', () => {
            const result = system.executeTool('getMemory', { memoryId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('memoryRecorded', () => count++);
            unregister();
            system.recordMemory('s1', {});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('memoryRecorded', () => { throw new Error('x'); });
            expect(() => system.recordMemory('s1', {})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMemories = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMemories = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recordMemory('s1', {});
            const json = system.toJSON();
            expect(json.memories.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recordMemory('s1', {});
            const json = system.toJSON();
            const newSys = new PastLifeMemory();
            newSys.fromJSON(json);
            expect(newSys.memories.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.lifeCount).toBe(0);
        });
    });
});