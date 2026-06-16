/**
 * MemoryConsolidationScheduler.test.js - NPC 记忆巩固调度器测试
 * V289 Iteration 4/9 - NPC Memory Consolidation Scheduler
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryConsolidationScheduler } from '../../../systems/ai/MemoryConsolidationScheduler.js';
import { ExperienceTracker } from '../../../systems/ai/ExperienceTracker.js';

// Mock DreamMemoryStore
class MockDreamMemoryStore {
    constructor() {
        this.memories = new Map();
        this.saveCounter = 0;
    }

    async save(npcId, playerId, content, emotion = '', keywords = []) {
        const id = `memory_${++this.saveCounter}`;
        const key = `${npcId}::${playerId}`;
        if (!this.memories.has(key)) this.memories.set(key, []);
        this.memories.get(key).push({ id, npcId, playerId, content, emotion, keywords, timestamp: Date.now() });
        return id;
    }

    async saveWithSession(npcId, playerId, content, emotion = '', keywords = [], sessionId) {
        return this.save(npcId, playerId, content, emotion, keywords);
    }

    async queryAll(npcId, playerId) {
        const key = `${npcId}::${playerId}`;
        return this.memories.get(key) || [];
    }

    async clearAll() {
        this.memories.clear();
        this.saveCounter = 0;
    }
}

describe('MemoryConsolidationScheduler', () => {
    let scheduler;
    let experienceTracker;
    let dreamMemoryStore;

    beforeEach(() => {
        experienceTracker = new ExperienceTracker(100);
        dreamMemoryStore = new MockDreamMemoryStore();
        scheduler = new MemoryConsolidationScheduler(experienceTracker, dreamMemoryStore);
    });

    afterEach(() => {
        scheduler.clearAll();
        experienceTracker = null;
        dreamMemoryStore.clearAll();
    });

    describe('constructor', () => {
        it('should create scheduler with empty tasks', () => {
            const status = scheduler.getSchedulerStatus();
            expect(status.totalScheduled).toBe(0);
            expect(status.totalRunning).toBe(0);
            expect(status.queueSize).toBe(0);
        });

        it('should initialize with provided trackers', () => {
            expect(scheduler.experienceTracker).toBe(experienceTracker);
            expect(scheduler.dreamMemoryStore).toBe(dreamMemoryStore);
        });
    });

    describe('scheduleConsolidation', () => {
        it('should schedule consolidation successfully', () => {
            const result = scheduler.scheduleConsolidation('npc_1', 60000);
            expect(result.success).toBe(true);
            expect(result.npcId).toBe('npc_1');
            expect(result.interval).toBe(60000);
            expect(result.nextRun).toBeDefined();
        });

        it('should reject invalid npcId', () => {
            const result = scheduler.scheduleConsolidation('', 60000);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invalid npcId');
        });

        it('should reject invalid interval', () => {
            const result = scheduler.scheduleConsolidation('npc_1', -100);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invalid interval');
        });

        it('should reject non-numeric interval', () => {
            const result = scheduler.scheduleConsolidation('npc_1', 'bad');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invalid interval');
        });

        it('should use default interval when not specified', () => {
            const result = scheduler.scheduleConsolidation('npc_1');
            expect(result.success).toBe(true);
            expect(result.interval).toBe(60000);
        });

        it('should allow multiple NPCs to be scheduled', () => {
            scheduler.scheduleConsolidation('npc_1', 60000);
            scheduler.scheduleConsolidation('npc_2', 120000);
            const status = scheduler.getSchedulerStatus();
            expect(status.totalScheduled).toBe(2);
        });
    });

    describe('cancelConsolidation', () => {
        it('should cancel scheduled consolidation', () => {
            scheduler.scheduleConsolidation('npc_1', 60000);
            const result = scheduler.cancelConsolidation('npc_1');
            expect(result.success).toBe(true);
            expect(scheduler.getSchedulerStatus().totalScheduled).toBe(0);
        });

        it('should reject cancel for non-scheduled NPC', () => {
            const result = scheduler.cancelConsolidation('npc_unknown');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not scheduled');
        });
    });

    describe('updateInterval', () => {
        it('should update interval successfully', () => {
            scheduler.scheduleConsolidation('npc_1', 60000);
            const result = scheduler.updateInterval('npc_1', 120000);
            expect(result.success).toBe(true);
            expect(result.interval).toBe(120000);
        });

        it('should reject update for non-scheduled NPC', () => {
            const result = scheduler.updateInterval('npc_unknown', 60000);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not scheduled');
        });

        it('should reject invalid new interval', () => {
            scheduler.scheduleConsolidation('npc_1', 60000);
            const result = scheduler.updateInterval('npc_1', -100);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invalid interval');
        });
    });

    describe('executeConsolidation', () => {
        it('should reject execution for non-scheduled NPC', async () => {
            const result = await scheduler.executeConsolidation('npc_unknown');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not scheduled');
        });

        it('should consolidate experience records to dream memories', async () => {
            // Register NPC and add experience
            scheduler.scheduleConsolidation('npc_1', 60000);
            experienceTracker.track('npc_1', {
                type: 'dialogue',
                playerAction: 'greet',
                npcResponse: 'hello',
                outcome: { success: true, satisfaction: 0.8 }
            });
            experienceTracker.track('npc_1', {
                type: 'trade',
                playerAction: 'buy sword',
                npcResponse: 'here you go',
                outcome: { success: true, satisfaction: 0.9 }
            });

            const result = await scheduler.executeConsolidation('npc_1', 'player_1');
            expect(result.success).toBe(true);
            expect(result.processed).toBe(2);
            expect(result.written).toBe(2);
            expect(result.failed).toBe(0);
        });

        it('should return early when no experience records', async () => {
            scheduler.scheduleConsolidation('npc_1', 60000);
            const result = await scheduler.executeConsolidation('npc_1');
            expect(result.success).toBe(true);
            expect(result.processed).toBe(0);
            expect(result.message).toContain('No experience records');
        });

        it('should prevent concurrent execution for same NPC', async () => {
            scheduler.scheduleConsolidation('npc_1', 60000);
            experienceTracker.track('npc_1', {
                type: 'dialogue',
                playerAction: 'test',
                npcResponse: 'test',
                outcome: { success: true, satisfaction: 0.5 }
            });

            // Start first execution
            const p1 = scheduler.executeConsolidation('npc_1');
            // Try second execution immediately
            const p2 = scheduler.executeConsolidation('npc_1');
            const [r1, r2] = await Promise.all([p1, p2]);
            // One should fail with "already in progress"
            const successes = [r1, r2].filter(r => r.success);
            expect(successes.length).toBe(1);
        });

        it('should update lastRun and nextRun after execution', async () => {
            scheduler.scheduleConsolidation('npc_1', 60000);
            experienceTracker.track('npc_1', {
                type: 'test',
                playerAction: 'action',
                npcResponse: 'response',
                outcome: { success: true, satisfaction: 0.5 }
            });

            const before = Date.now();
            await scheduler.executeConsolidation('npc_1');
            const status = scheduler.getTaskStatus('npc_1');

            expect(status.lastRun).toBeDefined();
            expect(status.lastRun).toBeGreaterThanOrEqual(before);
            expect(status.nextRun).toBeGreaterThan(before);
        });
    });

    describe('executeAllScheduled', () => {
        it('should skip tasks not yet due', async () => {
            scheduler.scheduleConsolidation('npc_1', 99999999); // Very long interval
            experienceTracker.track('npc_1', {
                type: 'test',
                playerAction: 'a',
                npcResponse: 'b',
                outcome: { success: true, satisfaction: 0.5 }
            });

            const results = await scheduler.executeAllScheduled();
            expect(results.length).toBe(0);
        });

        it('should execute tasks triggered via triggerNow', async () => {
            scheduler.scheduleConsolidation('npc_1', 99999999); // Long interval
            scheduler.scheduleConsolidation('npc_2', 99999999);
            experienceTracker.track('npc_1', {
                type: 'test',
                playerAction: 'a',
                npcResponse: 'b',
                outcome: { success: true, satisfaction: 0.5 }
            });
            experienceTracker.track('npc_2', {
                type: 'test',
                playerAction: 'c',
                npcResponse: 'd',
                outcome: { success: true, satisfaction: 0.5 }
            });

            // Trigger consolidation for npc_1
            await scheduler.triggerNow('npc_1');
            const results = await scheduler.executeAllScheduled();
            // npc_2 is not due, npc_1 was just triggered (nextRun reset)
            expect(results.length).toBe(0);
            // But npc_1 should have processed its records
            const memories = await dreamMemoryStore.queryAll('npc_1', 'default_player');
            expect(memories.length).toBe(1);
        });
    });

    describe('getSchedulerStatus', () => {
        it('should return correct status', () => {
            scheduler.scheduleConsolidation('npc_1', 60000);
            scheduler.scheduleConsolidation('npc_2', 120000);

            const status = scheduler.getSchedulerStatus();
            expect(status.totalScheduled).toBe(2);
            expect(status.taskStatuses.length).toBe(2);
            expect(status.queueSize).toBe(0);
        });

        it('should show isDue based on current time vs nextRun', () => {
            scheduler.scheduleConsolidation('npc_1', 60000);
            const status = scheduler.getSchedulerStatus();
            // With 60000ms interval, nextRun is in the future, so isDue should be false
            expect(status.taskStatuses[0].isDue).toBe(false);
        });

        it('should show isDue true when task is overdue', () => {
            scheduler.scheduleConsolidation('npc_1', 60000);
            // Force nextRun to the past
            const task = scheduler.scheduledTasks.get('npc_1');
            task.nextRun = Date.now() - 1000;
            const status = scheduler.getSchedulerStatus();
            expect(status.taskStatuses[0].isDue).toBe(true);
        });
    });

    describe('getTaskStatus', () => {
        it('should return task status for scheduled NPC', () => {
            scheduler.scheduleConsolidation('npc_1', 60000);
            const status = scheduler.getTaskStatus('npc_1');
            expect(status.npcId).toBe('npc_1');
            expect(status.interval).toBe(60000);
        });

        it('should return null for non-scheduled NPC', () => {
            expect(scheduler.getTaskStatus('npc_unknown')).toBe(null);
        });
    });

    describe('setEnabled', () => {
        it('should enable/disable tasks', () => {
            scheduler.scheduleConsolidation('npc_1', 60000);
            scheduler.setEnabled('npc_1', false);
            expect(scheduler.getTaskStatus('npc_1').enabled).toBe(false);

            scheduler.setEnabled('npc_1', true);
            expect(scheduler.getTaskStatus('npc_1').enabled).toBe(true);
        });

        it('should reject for non-scheduled NPC', () => {
            const result = scheduler.setEnabled('npc_unknown', true);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not scheduled');
        });
    });

    describe('triggerNow', () => {
        it('should trigger immediate consolidation', async () => {
            scheduler.scheduleConsolidation('npc_1', 99999999); // Long interval
            experienceTracker.track('npc_1', {
                type: 'test',
                playerAction: 'a',
                npcResponse: 'b',
                outcome: { success: true, satisfaction: 0.5 }
            });

            const result = await scheduler.triggerNow('npc_1');
            expect(result.success).toBe(true);
            expect(result.processed).toBe(1);
        });

        it('should reject for non-scheduled NPC', async () => {
            const result = await scheduler.triggerNow('npc_unknown');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not scheduled');
        });
    });

    describe('clearAll', () => {
        it('should clear all scheduled tasks', () => {
            scheduler.scheduleConsolidation('npc_1', 60000);
            scheduler.scheduleConsolidation('npc_2', 120000);
            scheduler.clearAll();
            expect(scheduler.getSchedulerStatus().totalScheduled).toBe(0);
        });
    });

    describe('priority calculation in consolidation', () => {
        it('should calculate priority based on success factor', async () => {
            scheduler.scheduleConsolidation('npc_1', 60000);
            experienceTracker.track('npc_1', {
                type: 'test',
                playerAction: 'a',
                npcResponse: 'b',
                outcome: { success: true, satisfaction: 0.8 }
            });

            await scheduler.executeConsolidation('npc_1');
            // Check that memories were written to store
            const memories = await dreamMemoryStore.queryAll('npc_1', 'default_player');
            expect(memories.length).toBeGreaterThan(0);
        });

        it('should include keywords from experience records', async () => {
            scheduler.scheduleConsolidation('npc_1', 60000);
            experienceTracker.track('npc_1', {
                type: 'combat',
                playerAction: 'attack monster',
                npcResponse: 'defeated',
                outcome: { success: true, satisfaction: 0.9 }
            });

            await scheduler.executeConsolidation('npc_1');
            const memories = await dreamMemoryStore.queryAll('npc_1', 'default_player');
            expect(memories[0].keywords).toContain('combat');
        });
    });

    describe('history tracking', () => {
        it('should track consolidation history', async () => {
            scheduler.scheduleConsolidation('npc_1', 60000);
            experienceTracker.track('npc_1', {
                type: 'test',
                playerAction: 'a',
                npcResponse: 'b',
                outcome: { success: true, satisfaction: 0.5 }
            });

            await scheduler.executeConsolidation('npc_1');
            const status = scheduler.getTaskStatus('npc_1');
            expect(status.history.consolidatedCount).toBe(1);
            expect(status.history.totalProcessed).toBe(1);
        });
    });
});