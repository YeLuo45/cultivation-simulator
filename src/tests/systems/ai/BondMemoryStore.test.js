/**
 * BondMemoryStore.test.js - 羁绊记忆存储测试
 * V305 Iteration 2/9 - 测试覆盖率目标: 99%+
 * 100% pass rate required
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BondMemoryStore } from '../../../systems/ai/BondMemoryStore.js';

describe('BondMemoryStore', () => {
    let system;

    beforeEach(() => {
        system = new BondMemoryStore();
    });

    // ========== 存储测试 ==========

    describe('storeMemory', () => {
        it('should store a memory', () => {
            const result = system.storeMemory({ companionshipId: 'c1', content: 'First meeting' });
            expect(result.success).toBe(true);
        });

        it('should require companionshipId', () => {
            const result = system.storeMemory({ content: 'Test' });
            expect(result.error).toBe('COMPANIONSHIP_ID_REQUIRED');
        });

        it('should set default emotion to neutral', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1' });
            expect(memory.emotion).toBe('neutral');
        });

        it('should generate id', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1' });
            expect(memory.memoryId).toBeDefined();
        });

        it('should set timestamp', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1' });
            expect(memory.timestamp).toBeGreaterThan(0);
        });

        it('should index by companionship', () => {
            system.storeMemory({ companionshipId: 'c1' });
            expect(system.bondIndex.get('c1').size).toBe(1);
        });

        it('should add to timeline', () => {
            system.storeMemory({ companionshipId: 'c1' });
            expect(system.timeline.length).toBe(1);
        });

        it('should increment emotion map', () => {
            system.storeMemory({ companionshipId: 'c1', emotion: 'joy' });
            expect(system.emotionalMap.get('joy')).toBe(1);
        });

        it('should trigger memoryStored hook', () => {
            let called = false;
            system.registerHook('memoryStored', () => { called = true; });
            system.storeMemory({ companionshipId: 'c1' });
            expect(called).toBe(true);
        });

        it('should increment totalStored', () => {
            system.storeMemory({ companionshipId: 'c1' });
            expect(system.stats.totalStored).toBe(1);
        });
    });

    // ========== 获取测试 ==========

    describe('getMemory', () => {
        it('should return memory', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1', content: 'X' });
            expect(system.getMemory(memory.memoryId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getMemory('ghost')).toBeNull();
        });
    });

    describe('updateMemory', () => {
        it('should update content', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1', content: 'Old' });
            const result = system.updateMemory(memory.memoryId, { content: 'New' });
            expect(result.success).toBe(true);
            expect(memory.content).toBe('New');
        });

        it('should reject missing', () => {
            const result = system.updateMemory('ghost', { content: 'X' });
            expect(result.error).toBe('MEMORY_NOT_FOUND');
        });

        it('should update emotion', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1' });
            system.updateMemory(memory.memoryId, { emotion: 'joy' });
            expect(memory.emotion).toBe('joy');
        });

        it('should update intensity', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1' });
            system.updateMemory(memory.memoryId, { intensity: 0.9 });
            expect(memory.intensity).toBe(0.9);
        });

        it('should update tags', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1' });
            system.updateMemory(memory.memoryId, { tags: ['date', 'first'] });
            expect(memory.tags.length).toBe(2);
        });
    });

    describe('deleteMemory', () => {
        it('should delete', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1' });
            const result = system.deleteMemory(memory.memoryId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteMemory('ghost');
            expect(result.error).toBe('MEMORY_NOT_FOUND');
        });

        it('should remove from bondIndex', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1' });
            system.deleteMemory(memory.memoryId);
            expect(system.bondIndex.get('c1').size).toBe(0);
        });

        it('should remove from timeline', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1' });
            system.deleteMemory(memory.memoryId);
            expect(system.timeline.length).toBe(0);
        });

        it('should decrement emotion count', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1', emotion: 'joy' });
            system.deleteMemory(memory.memoryId);
            expect(system.emotionalMap.get('joy')).toBe(0);
        });

        it('should trigger memoryDeleted hook', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1' });
            let called = false;
            system.registerHook('memoryDeleted', () => { called = true; });
            system.deleteMemory(memory.memoryId);
            expect(called).toBe(true);
        });

        it('should increment totalForgotten', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1' });
            system.deleteMemory(memory.memoryId);
            expect(system.stats.totalForgotten).toBe(1);
        });
    });

    // ========== 回忆测试 ==========

    describe('recallMemory', () => {
        it('should recall', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1' });
            const result = system.recallMemory(memory.memoryId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.recallMemory('ghost');
            expect(result.error).toBe('MEMORY_NOT_FOUND');
        });

        it('should increment recall count', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1' });
            system.recallMemory(memory.memoryId);
            expect(memory.recalled).toBe(1);
        });

        it('should boost strength', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1' });
            const before = memory.strength;
            system.recallMemory(memory.memoryId);
            expect(memory.strength).toBeGreaterThan(before);
        });

        it('should trigger memoryRecalled hook', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1' });
            let called = false;
            system.registerHook('memoryRecalled', () => { called = true; });
            system.recallMemory(memory.memoryId);
            expect(called).toBe(true);
        });

        it('should increment totalRecalled', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1' });
            system.recallMemory(memory.memoryId);
            expect(system.stats.totalRecalled).toBe(1);
        });
    });

    // ========== 查询测试 ==========

    describe('getMemoriesByCompanionship', () => {
        it('should return memories for bond', () => {
            system.storeMemory({ companionshipId: 'c1' });
            system.storeMemory({ companionshipId: 'c1' });
            system.storeMemory({ companionshipId: 'c2' });
            expect(system.getMemoriesByCompanionship('c1').length).toBe(2);
        });

        it('should return empty for unknown', () => {
            expect(system.getMemoriesByCompanionship('ghost').length).toBe(0);
        });
    });

    describe('getMemoriesByEmotion', () => {
        it('should filter by emotion', () => {
            system.storeMemory({ companionshipId: 'c1', emotion: 'joy' });
            system.storeMemory({ companionshipId: 'c1', emotion: 'sad' });
            expect(system.getMemoriesByEmotion('joy').length).toBe(1);
        });
    });

    describe('getMemoriesByTag', () => {
        it('should filter by tag', () => {
            system.storeMemory({ companionshipId: 'c1', tags: ['date'] });
            system.storeMemory({ companionshipId: 'c1', tags: ['fight'] });
            expect(system.getMemoriesByTag('date').length).toBe(1);
        });
    });

    describe('getMemoriesByParticipant', () => {
        it('should filter by participant', () => {
            system.storeMemory({ companionshipId: 'c1', participants: ['p1'] });
            system.storeMemory({ companionshipId: 'c1', participants: ['p2'] });
            expect(system.getMemoriesByParticipant('p1').length).toBe(1);
        });
    });

    // ========== 强度测试 ==========

    describe('getMemoryStrength', () => {
        it('should return strength', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1' });
            expect(system.getMemoryStrength(memory.memoryId)).toBeGreaterThan(0);
        });

        it('should return 0 for missing', () => {
            expect(system.getMemoryStrength('ghost')).toBe(0);
        });
    });

    describe('applyDecay', () => {
        it('should apply decay', () => {
            const { memory } = system.storeMemory({ companionshipId: 'c1' });
            memory.strength = 1.0;
            system.applyDecay();
            expect(memory.strength).toBeLessThan(1.0);
        });

        it('should trigger decayApplied hook', () => {
            let called = false;
            system.registerHook('decayApplied', () => { called = true; });
            system.applyDecay();
            expect(called).toBe(true);
        });
    });

    describe('forgetOldest', () => {
        it('should forget oldest', () => {
            system.storeMemory({ companionshipId: 'c1', content: 'old', timestamp: 1 });
            system.storeMemory({ companionshipId: 'c1', content: 'new', timestamp: 2 });
            const result = system.forgetOldest('c1', 1);
            expect(result.forgotten).toBe(1);
        });
    });

    // ========== 搜索测试 ==========

    describe('searchMemories', () => {
        it('should search by companionship', () => {
            system.storeMemory({ companionshipId: 'c1' });
            system.storeMemory({ companionshipId: 'c2' });
            expect(system.searchMemories({ companionshipId: 'c1' }).length).toBe(1);
        });

        it('should search by emotion', () => {
            system.storeMemory({ companionshipId: 'c1', emotion: 'joy' });
            expect(system.searchMemories({ emotion: 'joy' }).length).toBe(1);
        });

        it('should search by tag', () => {
            system.storeMemory({ companionshipId: 'c1', tags: ['date'] });
            expect(system.searchMemories({ tag: 'date' }).length).toBe(1);
        });

        it('should search by participant', () => {
            system.storeMemory({ companionshipId: 'c1', participants: ['p1'] });
            expect(system.searchMemories({ participant: 'p1' }).length).toBe(1);
        });

        it('should search by min intensity', () => {
            system.storeMemory({ companionshipId: 'c1', intensity: 0.9 });
            system.storeMemory({ companionshipId: 'c1', intensity: 0.1 });
            expect(system.searchMemories({ minIntensity: 0.5 }).length).toBe(1);
        });

        it('should search by keyword', () => {
            system.storeMemory({ companionshipId: 'c1', content: 'first meeting' });
            system.storeMemory({ companionshipId: 'c1', content: 'second meeting' });
            expect(system.searchMemories({ keyword: 'first' }).length).toBe(1);
        });
    });

    describe('getTimeline', () => {
        it('should return recent memories', () => {
            for (let i = 0; i < 5; i++) system.storeMemory({ companionshipId: 'c1' });
            const timeline = system.getTimeline(3);
            expect(timeline.length).toBe(3);
        });

        it('should handle limit larger than available', () => {
            system.storeMemory({ companionshipId: 'c1' });
            expect(system.getTimeline(100).length).toBe(1);
        });
    });

    // ========== 情感分析测试 ==========

    describe('getEmotionalProfile', () => {
        it('should return profile', () => {
            system.storeMemory({ companionshipId: 'c1', emotion: 'joy', intensity: 0.8 });
            system.storeMemory({ companionshipId: 'c1', emotion: 'joy', intensity: 0.6 });
            const profile = system.getEmotionalProfile('c1');
            expect(profile.joy).toBe(1.4);
        });

        it('should be empty for unknown', () => {
            expect(Object.keys(system.getEmotionalProfile('ghost')).length).toBe(0);
        });
    });

    describe('getMostFrequentEmotion', () => {
        it('should return most frequent', () => {
            system.storeMemory({ companionshipId: 'c1', emotion: 'joy', intensity: 0.5 });
            system.storeMemory({ companionshipId: 'c1', emotion: 'joy', intensity: 0.5 });
            system.storeMemory({ companionshipId: 'c1', emotion: 'sad', intensity: 0.3 });
            expect(system.getMostFrequentEmotion('c1')).toBe('joy');
        });

        it('should return null for empty', () => {
            expect(system.getMostFrequentEmotion('ghost')).toBeNull();
        });
    });

    // ========== Mesh 测试 ==========

    describe('Mesh Network', () => {
        it('should add node', () => {
            const result = system.addMeshNode('n1', 'region_a');
            expect(result.success).toBe(true);
        });

        it('should connect nodes', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            const result = system.connectMeshNodes('a', 'b');
            expect(result.success).toBe(true);
        });

        it('should reject missing nodes', () => {
            const result = system.connectMeshNodes('ghost', 'ghost2');
            expect(result.error).toBe('NODE_NOT_FOUND');
        });

        it('should distribute memory to mesh', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            system.connectMeshNodes('a', 'b');
            const { memory } = system.storeMemory({ companionshipId: 'c1' });
            const result = system.distributeMemoryToMesh(memory.memoryId, 'a');
            expect(result.propagated).toBe(2);
        });

        it('should reject missing source node', () => {
            const result = system.distributeMemoryToMesh('any', 'ghost');
            expect(result.error).toBe('NODE_NOT_FOUND');
        });

        it('should reject missing memory', () => {
            system.addMeshNode('n1');
            const result = system.distributeMemoryToMesh('ghost', 'n1');
            expect(result.error).toBe('MEMORY_NOT_FOUND');
        });
    });

    // ========== 工具系统测试 ==========

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

        it('should execute default searchMemories', () => {
            const result = system.executeTool('searchMemories', {});
            expect(result.success).toBe(true);
        });

        it('should execute default getMemoryStrength', () => {
            const result = system.executeTool('getMemoryStrength', { memoryId: 'ghost' });
            expect(result.result).toBe(0);
        });

        it('should execute default forgetOldest', () => {
            const result = system.executeTool('forgetOldest', { companionshipId: 'c1' });
            expect(result.success).toBe(true);
        });
    });

    // ========== Hook 系统测试 ==========

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('memoryStored', () => count++);
            system.storeMemory({ companionshipId: 'c1' });
            unregister();
            system.storeMemory({ companionshipId: 'c1' });
            expect(count).toBe(1);
        });

        it('should handle errors silently', () => {
            system.registerHook('memoryStored', () => { throw new Error('x'); });
            expect(() => system.storeMemory({ companionshipId: 'c1' })).not.toThrow();
        });
    });

    // ========== 自进化测试 ==========

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve with enough', () => {
            system.stats.totalStored = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalStored = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should trigger systemEvolved hook', () => {
            system.stats.totalStored = 10;
            let called = false;
            system.registerHook('systemEvolved', () => { called = true; });
            system.autoEvolve();
            expect(called).toBe(true);
        });
    });

    // ========== 持久化测试 ==========

    describe('Persistence', () => {
        it('should serialize', () => {
            system.storeMemory({ companionshipId: 'c1' });
            const json = system.toJSON();
            expect(json.memories.length).toBe(1);
        });

        it('should deserialize', () => {
            system.storeMemory({ companionshipId: 'c1' });
            const json = system.toJSON();
            const newSys = new BondMemoryStore();
            newSys.fromJSON(json);
            expect(newSys.memories.size).toBe(1);
        });

        it('should preserve bond index', () => {
            system.storeMemory({ companionshipId: 'c1' });
            const json = system.toJSON();
            const newSys = new BondMemoryStore();
            newSys.fromJSON(json);
            expect(newSys.bondIndex.get('c1').size).toBe(1);
        });
    });

    // ========== 统计测试 ==========

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.memoryCount).toBe(0);
        });

        it('should track counts', () => {
            system.storeMemory({ companionshipId: 'c1' });
            const stats = system.getStats();
            expect(stats.memoryCount).toBe(1);
            expect(stats.bondCount).toBe(1);
        });
    });
});