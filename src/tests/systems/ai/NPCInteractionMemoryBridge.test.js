/**
 * NPCInteractionMemoryBridge.test.js
 * V279 Iteration 3/9 - NPC Interaction Memory Bridge Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NPCInteractionMemoryBridge } from '../../../systems/ai/NPCInteractionMemoryBridge.js';

// Mock classes
class MockDreamMemoryStore {
    constructor() {
        this.memories = [];
    }
    async save(npcId, playerId, content, emotion, keywords) {
        const id = `mock_dream_${Date.now()}_${this.memories.length}`;
        this.memories.push({ id, npcId, playerId, content, emotion, keywords, timestamp: Date.now() });
        return id;
    }
    async query(npcId, playerId, since = 0, until = Date.now()) {
        return this.memories.filter(m =>
            m.npcId === npcId && m.playerId === playerId &&
            m.timestamp >= since && m.timestamp <= until
        );
    }
    async clearAll() {
        this.memories = [];
    }
}

class MockExperienceTracker {
    constructor() {
        this.records = new Map();
    }
    track(npcId, interaction) {
        if (!this.records.has(npcId)) this.records.set(npcId, []);
        const record = { id: `exp_${Date.now()}`, npcId, ...interaction, timestamp: Date.now() };
        this.records.get(npcId).push(record);
        return { success: true, record };
    }
    getStats(npcId) {
        const records = this.records.get(npcId) || [];
        return {
            totalInteractions: records.length,
            successRate: 0,
            avgSatisfaction: 0.5,
            adaptationLevel: 1,
            lastInteraction: records[records.length - 1] || null
        };
    }
    getRecentRecords(npcId, n = 10) {
        const records = this.records.get(npcId) || [];
        return records.slice(-n);
    }
}

describe('NPCInteractionMemoryBridge', () => {
    let bridge, dreamStore, expTracker;

    beforeEach(() => {
        dreamStore = new MockDreamMemoryStore();
        expTracker = new MockExperienceTracker();
        bridge = new NPCInteractionMemoryBridge(dreamStore, expTracker);
    });

    // --- Constructor & Init ---
    it('01 - constructor sets dreamMemoryStore and experienceTracker', () => {
        expect(bridge.dreamMemoryStore).toBe(dreamStore);
        expect(bridge.experienceTracker).toBe(expTracker);
        expect(bridge.recentBuffer).toBeInstanceOf(Map);
        expect(bridge.recentBuffer.size).toBe(0);
    });

    it('02 - constructor with null trackers does not throw', () => {
        expect(() => new NPCInteractionMemoryBridge(null, null)).not.toThrow();
    });

    // --- recordInteraction ---
    it('03 - recordInteraction stores interaction in recentBuffer', async () => {
        const result = await bridge.recordInteraction('npc1', 'player1', 'Hello', 'happy', ['greeting']);
        expect(result.success).toBe(true);
        expect(result.interaction).toBeDefined();
        expect(result.interaction.npcId).toBe('npc1');
        expect(result.interaction.playerId).toBe('player1');
        expect(result.interaction.content).toBe('Hello');
        expect(result.interaction.emotion).toBe('happy');
        expect(result.interaction.keywords).toEqual(['greeting']);
        expect(result.interaction.source).toBe('interaction');
    });

    it('04 - recordInteraction saves to DreamMemoryStore', async () => {
        await bridge.recordInteraction('npc1', 'player1', 'Test content', 'neutral', []);
        expect(dreamStore.memories.length).toBe(1);
        expect(dreamStore.memories[0].content).toBe('Test content');
    });

    it('05 - recordInteraction tracks via ExperienceTracker', async () => {
        await bridge.recordInteraction('npc1', 'player1', 'Test', 'neutral', []);
        const stats = expTracker.getStats('npc1');
        expect(stats.totalInteractions).toBe(1);
    });

    it('06 - recordInteraction handles DreamMemoryStore failure gracefully', async () => {
        const failingStore = new MockDreamMemoryStore();
        failingStore.save = vi.fn().mockRejectedValue(new Error('DB error'));
        const failingBridge = new NPCInteractionMemoryBridge(failingStore, expTracker);
        const result = await failingBridge.recordInteraction('npc1', 'player1', 'Test', 'neutral', []);
        expect(result.success).toBe(true);
        expect(result.memoryId).toBeNull();
    });

    it('07 - recordInteraction handles ExperienceTracker failure gracefully', async () => {
        const failingTracker = { track: vi.fn().mockImplementation(() => { throw new Error('Tracker error'); }) };
        const failingBridge = new NPCInteractionMemoryBridge(dreamStore, failingTracker);
        const result = await failingBridge.recordInteraction('npc1', 'player1', 'Test', 'neutral', []);
        expect(result.success).toBe(true);
        expect(result.trackResult).toBeNull();
    });

    it('08 - recordInteraction multiple calls append to buffer', async () => {
        await bridge.recordInteraction('npc1', 'player1', 'Msg1', 'neutral', []);
        await bridge.recordInteraction('npc1', 'player1', 'Msg2', 'neutral', []);
        const recent = bridge.queryRecent('npc1', 'player1');
        expect(recent.length).toBe(2);
        expect(recent[0].content).toBe('Msg1');
        expect(recent[1].content).toBe('Msg2');
    });

    // --- queryRecent ---
    it('09 - queryRecent returns empty array when no interactions', () => {
        const result = bridge.queryRecent('npc1', 'player1');
        expect(result).toEqual([]);
    });

    it('10 - queryRecent returns recent interactions with default limit 10', async () => {
        for (let i = 0; i < 15; i++) {
            await bridge.recordInteraction('npc1', 'player1', `Msg${i}`, 'neutral', []);
        }
        const result = bridge.queryRecent('npc1', 'player1');
        // slice(-10) returns last 10 of 15: Msg5 through Msg14
        expect(result.length).toBe(10);
        expect(result[0].content).toBe('Msg5');
        expect(result[9].content).toBe('Msg14');
    });

    it('11 - queryRecent respects custom limit', async () => {
        for (let i = 0; i < 5; i++) {
            await bridge.recordInteraction('npc1', 'player1', `Msg${i}`, 'neutral', []);
        }
        const result = bridge.queryRecent('npc1', 'player1', 3);
        expect(result.length).toBe(3);
    });

    it('12 - queryRecent returns empty for unknown npc-player pair', async () => {
        await bridge.recordInteraction('npc1', 'player1', 'Test', 'neutral', []);
        const result = bridge.queryRecent('npc2', 'player2');
        expect(result).toEqual([]);
    });

    // --- getMixedMemories ---
    it('13 - getMixedMemories returns dream memories and recent interactions merged', async () => {
        await bridge.recordInteraction('npc1', 'player1', 'Realtime msg', 'happy', []);
        const mixed = await bridge.getMixedMemories('npc1', 'player1');
        expect(mixed.length).toBe(2); // 1 dream + 1 recent
        expect(mixed[0].source).toBeDefined();
        expect(mixed[1].source).toBeDefined();
    });

    it('14 - getMixedMemories returns results sorted by timestamp descending', async () => {
        // Record First, wait a bit, then record Second (Second will have later timestamp)
        await bridge.recordInteraction('npc1', 'player1', 'First', 'neutral', []);
        await new Promise(r => setTimeout(r, 20));
        await bridge.recordInteraction('npc1', 'player1', 'Second', 'neutral', []);

        // Get dreams from store (both saved) and recent (both buffered)
        const dreams = await dreamStore.query('npc1', 'player1', 0, Date.now());
        const recent = bridge.queryRecent('npc1', 'player1');

        // Combined should be 4 entries (2 dream + 2 recent), sorted desc by timestamp
        const mixed = await bridge.getMixedMemories('npc1', 'player1');
        // All entries sorted descending by timestamp
        for (let i = 0; i < mixed.length - 1; i++) {
            expect(mixed[i].timestamp).toBeGreaterThanOrEqual(mixed[i + 1].timestamp);
        }
    });

    it('15 - getMixedMemories filters by time range', async () => {
        const now = Date.now();
        const oldTime = now - 10000;
        const recentTime = now;
        // Manually add to buffer with old timestamp
        const key = bridge._key('npc1', 'player1');
        bridge.recentBuffer.set(key, [
            { id: 'old1', npcId: 'npc1', playerId: 'player1', content: 'Old', timestamp: oldTime, source: 'interaction' }
        ]);
        const mixed = await bridge.getMixedMemories('npc1', 'player1', oldTime, recentTime);
        expect(mixed.length).toBe(1);
    });

    it('16 - getMixedMemories returns empty when no data', async () => {
        const result = await bridge.getMixedMemories('npc_unknown', 'player_unknown');
        expect(result).toEqual([]);
    });

    // --- autoSyncAndCrystallize ---
    it('17 - autoSyncAndCrystallize returns stats when experienceTracker exists', async () => {
        const result = bridge.autoSyncAndCrystallize('npc1', 'player1');
        expect(result.success).toBe(true);
        expect(result.stats).toBeDefined();
        expect(result.recentCount).toBe(0);
    });

    it('18 - autoSyncAndCrystallize returns error when no experienceTracker', () => {
        const noTrackerBridge = new NPCInteractionMemoryBridge(dreamStore, null);
        const result = noTrackerBridge.autoSyncAndCrystallize('npc1', 'player1');
        expect(result.success).toBe(false);
        expect(result.reason).toBeDefined();
    });

    // --- clearRecentBuffer ---
    it('19 - clearRecentBuffer removes specific npc-player buffer', async () => {
        await bridge.recordInteraction('npc1', 'player1', 'Test', 'neutral', []);
        await bridge.recordInteraction('npc2', 'player1', 'Test2', 'neutral', []);
        expect(bridge.queryRecent('npc1', 'player1').length).toBe(1);
        expect(bridge.queryRecent('npc2', 'player1').length).toBe(1);
        bridge.clearRecentBuffer('npc1', 'player1');
        expect(bridge.queryRecent('npc1', 'player1').length).toBe(0);
        expect(bridge.queryRecent('npc2', 'player1').length).toBe(1);
    });

    // --- clearAll ---
    it('20 - clearAll removes all buffers', async () => {
        await bridge.recordInteraction('npc1', 'player1', 'Test', 'neutral', []);
        await bridge.recordInteraction('npc2', 'player2', 'Test2', 'neutral', []);
        bridge.clearAll();
        expect(bridge.queryRecent('npc1', 'player1').length).toBe(0);
        expect(bridge.queryRecent('npc2', 'player2').length).toBe(0);
    });

    // --- getBufferStats ---
    it('21 - getBufferStats returns correct statistics', async () => {
        await bridge.recordInteraction('npc1', 'player1', 'Msg1', 'neutral', []);
        await bridge.recordInteraction('npc1', 'player1', 'Msg2', 'neutral', []);
        await bridge.recordInteraction('npc2', 'player2', 'Msg3', 'neutral', []);
        const stats = bridge.getBufferStats();
        expect(stats.keyCount).toBe(2);
        expect(stats.totalEntries).toBe(3);
    });

    it('22 - getBufferStats returns empty stats when buffer is empty', () => {
        const stats = bridge.getBufferStats();
        expect(stats.keyCount).toBe(0);
        expect(stats.totalEntries).toBe(0);
    });
});