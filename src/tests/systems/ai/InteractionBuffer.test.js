/**
 * InteractionBuffer.test.js
 * V279 Iteration 3/9 - NPC Interaction Memory Bridge Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { InteractionBuffer } from '../../../systems/ai/InteractionBuffer.js';

// Mock DreamMemoryStore
class MockDreamMemoryStore {
    constructor() {
        this.memories = [];
        this.saveCalls = 0;
    }
    async save(npcId, playerId, content, emotion, keywords) {
        this.saveCalls++;
        const id = `mock_dream_${Date.now()}_${this.memories.length}`;
        this.memories.push({ id, npcId, playerId, content, emotion, keywords, timestamp: Date.now() });
        return id;
    }
    async query() { return []; }
    async clearAll() { this.memories = []; }
}

describe('InteractionBuffer', () => {
    let store;

    beforeEach(() => {
        store = new MockDreamMemoryStore();
    });

    afterEach(() => {
        // Clean up timers
    });

    // --- Constructor & Init ---
    it('01 - constructor sets default flushIntervalMs to 5000', () => {
        const buffer = new InteractionBuffer();
        expect(buffer.flushIntervalMs).toBe(5000);
        expect(buffer.buffer).toBeInstanceOf(Map);
        expect(buffer.buffer.size).toBe(0);
        expect(buffer.flushTimer).toBeNull();
    });

    it('02 - constructor accepts custom flushIntervalMs', () => {
        const buffer = new InteractionBuffer(10000);
        expect(buffer.flushIntervalMs).toBe(10000);
    });

    // --- push ---
    it('03 - push adds interaction to buffer', () => {
        const buffer = new InteractionBuffer();
        const entry = buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Hello', emotion: 'happy', keywords: ['greet'] });
        expect(entry.id).toBeDefined();
        expect(entry.npcId).toBe('npc1');
        expect(entry.content).toBe('Hello');
        expect(buffer.buffer.get('npc1_player1').length).toBe(1);
    });

    it('04 - push generates id if not provided', () => {
        const buffer = new InteractionBuffer();
        const entry = buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Test' });
        expect(entry.id).toMatch(/^ibuf_/);
    });

    it('05 - push uses provided id', () => {
        const buffer = new InteractionBuffer();
        const entry = buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Test', id: 'custom_id' });
        expect(entry.id).toBe('custom_id');
    });

    it('06 - push appends to existing key', () => {
        const buffer = new InteractionBuffer();
        buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Msg1' });
        buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Msg2' });
        expect(buffer.buffer.get('npc1_player1').length).toBe(2);
    });

    it('07 - push sets timestamp if not provided', () => {
        const buffer = new InteractionBuffer();
        const before = Date.now();
        const entry = buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Test' });
        const after = Date.now();
        expect(entry.timestamp).toBeGreaterThanOrEqual(before);
        expect(entry.timestamp).toBeLessThanOrEqual(after);
    });

    it('08 - push uses provided timestamp', () => {
        const buffer = new InteractionBuffer();
        const ts = 1234567890;
        const entry = buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Test', timestamp: ts });
        expect(entry.timestamp).toBe(ts);
    });

    // --- flush ---
    it('09 - flush without DreamMemoryStore returns error', async () => {
        const buffer = new InteractionBuffer();
        buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Test' });
        const result = await buffer.flush(null);
        expect(result.success).toBe(false);
        expect(result.reason).toBe('No DreamMemoryStore provided');
    });

    it('10 - flush with empty buffer returns success with flushed=0', async () => {
        const buffer = new InteractionBuffer();
        const result = await buffer.flush(store);
        expect(result.success).toBe(true);
        expect(result.flushed).toBe(0);
    });

    it('11 - flush writes all buffered interactions to DreamMemoryStore', async () => {
        const buffer = new InteractionBuffer();
        buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Msg1' });
        buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Msg2' });
        buffer.push({ npcId: 'npc2', playerId: 'player2', content: 'Msg3' });
        const result = await buffer.flush(store);
        expect(result.success).toBe(true);
        expect(result.flushed).toBe(3);
        expect(store.memories.length).toBe(3);
        expect(buffer.buffer.size).toBe(0); // buffer cleared
    });

    it('12 - flush clears buffer after successful write', async () => {
        const buffer = new InteractionBuffer();
        buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Test' });
        await buffer.flush(store);
        expect(buffer.buffer.size).toBe(0);
    });

    it('13 - flush handles DreamMemoryStore save errors', async () => {
        const failingStore = new MockDreamMemoryStore();
        let callCount = 0;
        failingStore.save = async () => {
            callCount++;
            if (callCount > 1) throw new Error('Save error');
            return 'id';
        };
        const buffer = new InteractionBuffer();
        buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Msg1' });
        buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Msg2' });
        const result = await buffer.flush(failingStore);
        expect(result.errors).toBeGreaterThan(0);
        expect(result.success).toBe(false);
    });

    // --- getBuffer ---
    it('14 - getBuffer returns array for known npc-player', () => {
        const buffer = new InteractionBuffer();
        buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Msg1' });
        buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Msg2' });
        const result = buffer.getBuffer('npc1', 'player1');
        expect(result.length).toBe(2);
    });

    it('15 - getBuffer returns empty array for unknown npc-player', () => {
        const buffer = new InteractionBuffer();
        const result = buffer.getBuffer('npc_unknown', 'player_unknown');
        expect(result).toEqual([]);
    });

    // --- clear ---
    it('16 - clear removes specific npc-player buffer', () => {
        const buffer = new InteractionBuffer();
        buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Msg1' });
        buffer.push({ npcId: 'npc2', playerId: 'player2', content: 'Msg2' });
        buffer.clear('npc1', 'player1');
        expect(buffer.buffer.get('npc1_player1')).toBeUndefined();
        expect(buffer.buffer.get('npc2_player2').length).toBe(1);
    });

    it('17 - clear on unknown npc-player does not throw', () => {
        const buffer = new InteractionBuffer();
        expect(() => buffer.clear('npc_unknown', 'player_unknown')).not.toThrow();
    });

    // --- clearAll ---
    it('18 - clearAll removes all buffers', () => {
        const buffer = new InteractionBuffer();
        buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Msg1' });
        buffer.push({ npcId: 'npc2', playerId: 'player2', content: 'Msg2' });
        buffer.clearAll();
        expect(buffer.buffer.size).toBe(0);
    });

    // --- startAutoFlush / stopAutoFlush ---
    it('19 - startAutoFlush sets an interval timer', () => {
        const buffer = new InteractionBuffer(100);
        buffer.startAutoFlush(store);
        expect(buffer.flushTimer).not.toBeNull();
        buffer.stopAutoFlush();
    });

    it('20 - stopAutoFlush clears the timer', () => {
        const buffer = new InteractionBuffer(100);
        buffer.startAutoFlush(store);
        buffer.stopAutoFlush();
        expect(buffer.flushTimer).toBeNull();
    });

    it('21 - stopAutoFlush when not running does not throw', () => {
        const buffer = new InteractionBuffer();
        expect(() => buffer.stopAutoFlush()).not.toThrow();
    });

    // --- getStats ---
    it('22 - getStats returns correct statistics', () => {
        const buffer = new InteractionBuffer(5000);
        buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Msg1' });
        buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Msg2' });
        buffer.push({ npcId: 'npc2', playerId: 'player2', content: 'Msg3' });
        const stats = buffer.getStats();
        expect(stats.flushIntervalMs).toBe(5000);
        expect(stats.keyCount).toBe(2);
        expect(stats.totalEntries).toBe(3);
    });

    it('23 - getStats returns empty stats when buffer is empty', () => {
        const buffer = new InteractionBuffer();
        const stats = buffer.getStats();
        expect(stats.keyCount).toBe(0);
        expect(stats.totalEntries).toBe(0);
    });

    // --- hasPendingData ---
    it('24 - hasPendingData returns true when buffer has entries', () => {
        const buffer = new InteractionBuffer();
        buffer.push({ npcId: 'npc1', playerId: 'player1', content: 'Msg1' });
        expect(buffer.hasPendingData()).toBe(true);
    });

    it('25 - hasPendingData returns false when buffer is empty', () => {
        const buffer = new InteractionBuffer();
        expect(buffer.hasPendingData()).toBe(false);
    });
});