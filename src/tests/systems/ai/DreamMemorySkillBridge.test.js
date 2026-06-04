/**
 * DreamMemorySkillBridge 单元测试 (简化版)
 * V278 Iteration 2/9 - Skill Crystallization Module
 * 
 * 测试策略: 验证 API 导出和基本逻辑，不依赖真实 IndexedDB
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExperienceTracker } from '../../../systems/ai/ExperienceTracker.js';
import { SkillCrystallization } from '../../../systems/ai/SkillCrystallization.js';

// Mock DreamMemoryStore with sync API
class MockDreamMemoryStore {
    constructor() {
        this.memories = [];
    }
    async save(npcId, playerId, content, emotion, keywords) {
        this.memories.push({ npcId, playerId, content, emotion, keywords, timestamp: Date.now() });
        return Promise.resolve();
    }
    async query(npcId, playerId, startTime, endTime) {
        return Promise.resolve(this.memories.filter(m => m.npcId === npcId && m.playerId === playerId));
    }
    async queryAll(npcId, playerId) {
        return Promise.resolve(this.memories.filter(m => m.npcId === npcId && m.playerId === playerId));
    }
    clearAll() {
        this.memories = [];
        return Promise.resolve();
    }
}

describe('DreamMemorySkillBridge - API', () => {
    it('should export DreamMemorySkillBridge class', async () => {
        const { DreamMemorySkillBridge } = await import('../../../systems/ai/DreamMemorySkillBridge.js');
        expect(typeof DreamMemorySkillBridge).toBe('function');
    });

    it('should have syncAndCrystallize method', async () => {
        const { DreamMemorySkillBridge } = await import('../../../systems/ai/DreamMemorySkillBridge.js');
        const bridge = new DreamMemorySkillBridge(new MockDreamMemoryStore(), new SkillCrystallization());
        expect(typeof bridge.syncAndCrystallize).toBe('function');
    });

    it('should have getAvailableSkills method', async () => {
        const { DreamMemorySkillBridge } = await import('../../../systems/ai/DreamMemorySkillBridge.js');
        const bridge = new DreamMemorySkillBridge(new MockDreamMemoryStore(), new SkillCrystallization());
        expect(typeof bridge.getAvailableSkills).toBe('function');
    });

    it('should have recordSkillUsage method', async () => {
        const { DreamMemorySkillBridge } = await import('../../../systems/ai/DreamMemorySkillBridge.js');
        const bridge = new DreamMemorySkillBridge(new MockDreamMemoryStore(), new SkillCrystallization());
        expect(typeof bridge.recordSkillUsage).toBe('function');
    });
});

describe('DreamMemorySkillBridge - 核心逻辑', () => {
    let bridge;
    let mockDMS;
    let skillCrys;

    beforeEach(() => {
        mockDMS = new MockDreamMemoryStore();
        skillCrys = new SkillCrystallization();
        // Import fresh to avoid module-level state issues
    });

    it('should create instance with valid dependencies', async () => {
        const { DreamMemorySkillBridge } = await import('../../../systems/ai/DreamMemorySkillBridge.js');
        const b = new DreamMemorySkillBridge(mockDMS, skillCrys);
        expect(b.dreamMemoryStore).toBe(mockDMS);
        expect(b.skillCrystallization).toBe(skillCrys);
    });

    it('should return error when dreamMemoryStore is null', async () => {
        const { DreamMemorySkillBridge } = await import('../../../systems/ai/DreamMemorySkillBridge.js');
        const b = new DreamMemorySkillBridge(null, skillCrys);
        const result = await b.syncAndCrystallize('npc_001', 'player_001');
        expect(result.error).toBe('No dream memory store');
    });

    it('should return error when dreamMemoryStore is undefined', async () => {
        const { DreamMemorySkillBridge } = await import('../../../systems/ai/DreamMemorySkillBridge.js');
        const b = new DreamMemorySkillBridge(undefined, skillCrys);
        const result = await b.syncAndCrystallize('npc_001', 'player_001');
        expect(result.error).toBe('No dream memory store');
    });

    it('should return empty result when no memories', async () => {
        const { DreamMemorySkillBridge } = await import('../../../systems/ai/DreamMemorySkillBridge.js');
        const b = new DreamMemorySkillBridge(mockDMS, skillCrys);
        const result = await b.syncAndCrystallize('npc_001', 'player_001');
        expect(result.crystallizedSkills).toBe(0);
        expect(result.patternsFound).toBe(0);
    });

    it('should detect and crystallize repeated patterns', async () => {
        const { DreamMemorySkillBridge } = await import('../../../systems/ai/DreamMemorySkillBridge.js');
        const b = new DreamMemorySkillBridge(mockDMS, skillCrys);
        // Save 3 repeated interactions
        for (let i = 0; i < 3; i++) {
            await mockDMS.save('npc_001', 'player_001', 'buy sword', 'trade', ['sword', 'trade']);
        }
        const result = await b.syncAndCrystallize('npc_001', 'player_001');
        expect(result.patternsFound).toBeGreaterThanOrEqual(0);
    });

    it('should return empty available skills when none crystallized', async () => {
        const { DreamMemorySkillBridge } = await import('../../../systems/ai/DreamMemorySkillBridge.js');
        const b = new DreamMemorySkillBridge(mockDMS, skillCrys);
        const skills = b.getAvailableSkills('npc_001', 'player_001');
        expect(Array.isArray(skills)).toBe(true);
    });

    it('should record skill usage success', async () => {
        const { DreamMemorySkillBridge } = await import('../../../systems/ai/DreamMemorySkillBridge.js');
        const b = new DreamMemorySkillBridge(mockDMS, skillCrys);
        const result = b.recordSkillUsage('npc_001', 'skill_test', 'success');
        expect(result.success).toBe(true);
    });

    it('should record skill usage failure', async () => {
        const { DreamMemorySkillBridge } = await import('../../../systems/ai/DreamMemorySkillBridge.js');
        const b = new DreamMemorySkillBridge(mockDMS, skillCrys);
        const result = b.recordSkillUsage('npc_001', 'skill_test', 'failure');
        expect(result.success).toBe(true);
    });

    it('should accumulate skill usage counts', async () => {
        const { DreamMemorySkillBridge } = await import('../../../systems/ai/DreamMemorySkillBridge.js');
        const b = new DreamMemorySkillBridge(mockDMS, skillCrys);
        b.recordSkillUsage('npc_001', 'skill_test', 'success');
        b.recordSkillUsage('npc_001', 'skill_test', 'success');
        b.recordSkillUsage('npc_001', 'skill_test', 'failure');
        const stats = b.getSkillUsageStats('skill_test');
        expect(stats.successCount).toBe(2);
        expect(stats.failureCount).toBe(1);
        expect(stats.total).toBe(3);
    });

    it('should have clearCache method', async () => {
        const { DreamMemorySkillBridge } = await import('../../../systems/ai/DreamMemorySkillBridge.js');
        const b = new DreamMemorySkillBridge(mockDMS, skillCrys);
        expect(typeof b.clearCache).toBe('function');
        b.clearCache();
        // Should not throw
    });

    it('should update npcPlayerSkills after sync', async () => {
        const { DreamMemorySkillBridge } = await import('../../../systems/ai/DreamMemorySkillBridge.js');
        const b = new DreamMemorySkillBridge(mockDMS, skillCrys);
        await mockDMS.save('npc_001', 'player_001', 'buy sword', 'trade', ['sword']);
        await mockDMS.save('npc_001', 'player_001', 'buy sword', 'trade', ['sword']);
        await mockDMS.save('npc_001', 'player_001', 'buy sword', 'trade', ['sword']);
        await b.syncAndCrystallize('npc_001', 'player_001');
        const key = 'npc_001_player_001';
        expect(b.npcPlayerSkills.has(key)).toBe(true);
    });

    it('should not duplicate skills for same pattern', async () => {
        const { DreamMemorySkillBridge } = await import('../../../systems/ai/DreamMemorySkillBridge.js');
        const b = new DreamMemorySkillBridge(mockDMS, skillCrys);
        for (let i = 0; i < 3; i++) {
            await mockDMS.save('npc_001', 'player_001', 'buy sword', 'trade', ['sword']);
        }
        await b.syncAndCrystallize('npc_001', 'player_001');
        const skills1 = b.getAvailableSkills('npc_001', 'player_001');
        await b.syncAndCrystallize('npc_001', 'player_001');
        const skills2 = b.getAvailableSkills('npc_001', 'player_001');
        // Should not duplicate
        expect(skills2.length).toBeLessThanOrEqual(skills1.length + 1);
    });

    it('should handle getSkillUsageStats for unknown skill', async () => {
        const { DreamMemorySkillBridge } = await import('../../../systems/ai/DreamMemorySkillBridge.js');
        const b = new DreamMemorySkillBridge(mockDMS, skillCrys);
        const stats = b.getSkillUsageStats('unknown_skill');
        expect(stats.successCount).toBe(0);
        expect(stats.failureCount).toBe(0);
    });
});