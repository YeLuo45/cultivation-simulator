/**
 * MemoryBank.test.js - 记忆存储系统测试
 * V342 Iteration 3/9 Round 7 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryBank } from '../../../systems/ai/MemoryBank.js';

describe('MemoryBank', () => {
    let system;
    beforeEach(() => { system = new MemoryBank(); });

    describe('storeMemory', () => {
        it('should store', () => {
            const { memory } = system.storeMemory({ content: 'x' });
            expect(memory.content).toBe('x');
        });

        it('should trigger memoryStored hook', () => {
            let called = false;
            system.registerHook('memoryStored', () => { called = true; });
            system.storeMemory({});
            expect(called).toBe(true);
        });

        it('should increment totalMemories', () => {
            system.storeMemory({});
            expect(system.stats.totalMemories).toBe(1);
        });
    });

    describe('getMemory', () => {
        it('should return', () => {
            const { memory } = system.storeMemory({});
            expect(system.getMemory(memory.memoryId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMemory('ghost')).toBeNull(); });
    });

    describe('listMemories', () => {
        it('should list all', () => {
            system.storeMemory({});
            expect(system.listMemories().length).toBe(1);
        });
    });

    describe('listByOwner', () => {
        it('should filter', () => {
            system.storeMemory({ ownerId: 'o1' });
            system.storeMemory({ ownerId: 'o2' });
            expect(system.listByOwner('o1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.storeMemory({ type: 'event' });
            system.storeMemory({ type: 'skill' });
            expect(system.listByType('event').length).toBe(1);
        });
    });

    describe('listByTag', () => {
        it('should filter', () => {
            system.storeMemory({ tags: ['important'] });
            system.storeMemory({ tags: ['trivial'] });
            expect(system.listByTag('important').length).toBe(1);
        });
    });

    describe('listByMinStrength', () => {
        it('should filter', () => {
            system.storeMemory({ strength: 0.3 });
            system.storeMemory({ strength: 0.9 });
            expect(system.listByMinStrength(0.5).length).toBe(1);
        });
    });

    describe('recallMemory', () => {
        it('should recall', () => {
            const { memory } = system.storeMemory({});
            const result = system.recallMemory(memory.memoryId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.recallMemory('ghost');
            expect(result.error).toBe('MEMORY_NOT_FOUND');
        });

        it('should increment access count', () => {
            const { memory } = system.storeMemory({});
            system.recallMemory(memory.memoryId);
            expect(memory.accessed).toBe(1);
        });

        it('should trigger memoryRecalled hook', () => {
            const { memory } = system.storeMemory({});
            let called = false;
            system.registerHook('memoryRecalled', () => { called = true; });
            system.recallMemory(memory.memoryId);
            expect(called).toBe(true);
        });
    });

    describe('strengthenMemory', () => {
        it('should strengthen', () => {
            const { memory } = system.storeMemory({ strength: 0.3 });
            const result = system.strengthenMemory(memory.memoryId, 0.5);
            expect(memory.strength).toBe(0.8);
        });

        it('should reject missing', () => {
            const result = system.strengthenMemory('ghost', 0.1);
            expect(result.error).toBe('MEMORY_NOT_FOUND');
        });

        it('should cap at 1', () => {
            const { memory } = system.storeMemory({ strength: 0.9 });
            system.strengthenMemory(memory.memoryId, 0.5);
            expect(memory.strength).toBe(1);
        });
    });

    describe('forgetMemory', () => {
        it('should forget', () => {
            const { memory } = system.storeMemory({});
            const result = system.forgetMemory(memory.memoryId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.forgetMemory('ghost');
            expect(result.error).toBe('MEMORY_NOT_FOUND');
        });
    });

    describe('Batches', () => {
        it('should create batch', () => {
            const { batch } = system.createBatch('B1');
            expect(batch.name).toBe('B1');
        });

        it('should add to batch', () => {
            const { batch } = system.createBatch('B1');
            const { memory } = system.storeMemory({});
            const result = system.addToBatch(batch.batchId, memory.memoryId);
            expect(result.success).toBe(true);
        });

        it('should reject missing batch', () => {
            const { memory } = system.storeMemory({});
            const result = system.addToBatch('ghost', memory.memoryId);
            expect(result.error).toBe('BATCH_NOT_FOUND');
        });

        it('should reject missing memory', () => {
            const { batch } = system.createBatch('B1');
            const result = system.addToBatch(batch.batchId, 'ghost');
            expect(result.error).toBe('MEMORY_NOT_FOUND');
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

        it('should execute default recallMemory', () => {
            const result = system.executeTool('recallMemory', { memoryId: 'ghost' });
            expect(result.result.error).toBe('MEMORY_NOT_FOUND');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('memoryStored', () => count++);
            unregister();
            system.storeMemory({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('memoryStored', () => { throw new Error('x'); });
            expect(() => system.storeMemory({})).not.toThrow();
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
            system.storeMemory({});
            const json = system.toJSON();
            expect(json.memories.length).toBe(1);
        });
        it('should deserialize', () => {
            system.storeMemory({});
            const json = system.toJSON();
            const newSys = new MemoryBank();
            newSys.fromJSON(json);
            expect(newSys.memories.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.memoryCount).toBe(0);
        });
    });
});