/**
 * DreamSyncScheduler.test.js - 梦境同步调度器测试
 * V288 Iteration 3/9
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DreamSyncScheduler } from '../../../systems/ai/DreamSyncScheduler.js';
import { DreamCollaborationProtocol } from '../../../systems/ai/DreamCollaborationProtocol.js';
import { NPCLearningMesh } from '../../../systems/ai/NPCLearningMesh.js';

// Mock DreamMemoryStore
class MockDreamMemoryStore {
    constructor() {
        this.memories = new Map();
    }

    async saveWithSession(npcId, playerId, content, emotion, keywords, sessionId) {
        const key = `${npcId}::${playerId}`;
        if (!this.memories.has(key)) this.memories.set(key, []);
        this.memories.get(key).push({ npcId, playerId, content, sessionId, timestamp: Date.now() });
        return `mem_${Date.now()}`;
    }

    async clearAll() {
        this.memories.clear();
    }
}

describe('DreamSyncScheduler', () => {
    let scheduler;
    let dreamCollaboration;
    let npcLearningMesh;
    let dreamMemoryStore;

    beforeEach(() => {
        npcLearningMesh = new NPCLearningMesh();
        dreamMemoryStore = new MockDreamMemoryStore();
        dreamCollaboration = new DreamCollaborationProtocol(npcLearningMesh, dreamMemoryStore);
        scheduler = new DreamSyncScheduler(dreamCollaboration, npcLearningMesh);

        // 注册 NPC 并建立连接
        npcLearningMesh.register('npc_1');
        npcLearningMesh.register('npc_2');
        npcLearningMesh.register('npc_3');
        npcLearningMesh.connect('npc_1', 'npc_2');
        npcLearningMesh.connect('npc_1', 'npc_3');
        npcLearningMesh.connect('npc_2', 'npc_3');
    });

    afterEach(() => {
        scheduler.clearAll();
        dreamCollaboration.clearAll();
        npcLearningMesh.reset();
        dreamMemoryStore.clearAll();
    });

    describe('scheduleSync', () => {
        it('should schedule sync successfully', () => {
            const result = scheduler.scheduleSync('npc_1', ['npc_2'], 1000, 'test_dream');
            expect(result.success).toBe(true);
            expect(result.syncId).toBeDefined();
            expect(result.npcId).toBe('npc_1');
            expect(result.peers).toContain('npc_2');
        });

        it('should reject invalid npcId', () => {
            const result = scheduler.scheduleSync('', ['npc_2']);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invalid npcId');
        });

        it('should reject empty peer list', () => {
            const result = scheduler.scheduleSync('npc_1', []);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('peerNpcIds must be a non-empty array');
        });

        it('should filter out self from peers', () => {
            const result = scheduler.scheduleSync('npc_1', ['npc_1', 'npc_2']);
            expect(result.success).toBe(true);
            expect(result.peers).not.toContain('npc_1');
            expect(result.peers).toContain('npc_2');
        });

        it('should filter out unregistered peers', () => {
            const result = scheduler.scheduleSync('npc_1', ['npc_2', 'npc_unknown']);
            expect(result.success).toBe(true);
            expect(result.peers).toContain('npc_2');
            expect(result.peers).not.toContain('npc_unknown');
        });

        it('should reject if no valid peers', () => {
            const result = scheduler.scheduleSync('npc_1', ['npc_unknown', 'another_unknown']);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('No valid peers found');
        });

        it('should set correct scheduled time', () => {
            const delayMs = 5000;
            const before = Date.now();
            const result = scheduler.scheduleSync('npc_1', ['npc_2'], delayMs);
            const after = Date.now();
            
            expect(result.scheduledTime).toBeGreaterThanOrEqual(before + delayMs);
            expect(result.scheduledTime).toBeLessThanOrEqual(after + delayMs);
        });

        it('should allow immediate scheduling with 0 delay', () => {
            const result = scheduler.scheduleSync('npc_1', ['npc_2'], 0);
            expect(result.success).toBe(true);
            expect(result.scheduledTime).toBeLessThanOrEqual(Date.now());
        });

        it('should schedule for multiple peers', () => {
            const result = scheduler.scheduleSync('npc_1', ['npc_2', 'npc_3']);
            expect(result.success).toBe(true);
            expect(result.peers).toHaveLength(2);
            expect(result.peers).toContain('npc_2');
            expect(result.peers).toContain('npc_3');
        });
    });

    describe('scheduleBatchSync', () => {
        it('should batch schedule successfully', () => {
            const schedules = [
                { npcId: 'npc_1', peerNpcIds: ['npc_2'], delayMs: 0, theme: 'dream1' },
                { npcId: 'npc_2', peerNpcIds: ['npc_3'], delayMs: 0, theme: 'dream2' }
            ];

            const result = scheduler.scheduleBatchSync(schedules);
            expect(result.success).toBe(true);
            expect(result.total).toBe(2);
            expect(result.scheduled).toBe(2);
        });

        it('should reject empty batch', () => {
            const result = scheduler.scheduleBatchSync([]);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('schedules must be a non-empty array');
        });

        it('should handle partial failures', () => {
            // npc_1 is registered and has valid peer npc_2, so it succeeds
            // npc_unknown has no valid peers (neither npc_unknown nor npc_unknown_friend are registered)
            const schedules = [
                { npcId: 'npc_1', peerNpcIds: ['npc_2'] },
                { npcId: 'npc_unknown', peerNpcIds: ['npc_unknown_friend'] }
            ];

            const result = scheduler.scheduleBatchSync(schedules);
            expect(result.success).toBe(true);
            // Only npc_1 succeeds because npc_unknown has no valid peers
            expect(result.scheduled).toBe(1);
        });
    });

    describe('cancelScheduledSync', () => {
        it('should cancel scheduled sync', () => {
            scheduler.scheduleSync('npc_1', ['npc_2'], 10000);
            const result = scheduler.cancelScheduledSync('npc_1');
            expect(result.success).toBe(true);
        });

        it('should reject if no scheduled sync', () => {
            const result = scheduler.cancelScheduledSync('npc_1');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('No scheduled sync found for NPC');
        });

        it('should reject already executed sync', () => {
            scheduler.scheduleSync('npc_1', ['npc_2'], 0);
            scheduler.executeScheduledSyncs();
            const result = scheduler.cancelScheduledSync('npc_1');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Sync already executed or cancelled');
        });
    });

    describe('executeScheduledSyncs', () => {
        beforeEach(() => {
            // 先建立协作关系
            const inviteResult = dreamCollaboration.inviteToDream('npc_1', 'npc_2', 'shared_dream');
            dreamCollaboration.handleDreamInvitation('npc_2', inviteResult.invitationId, 'accept');
        });

        it('should execute due syncs', () => {
            scheduler.scheduleSync('npc_1', ['npc_2'], 0);
            const result = scheduler.executeScheduledSyncs();
            expect(result.success).toBe(true);
            expect(result.executed).toBe(1);
        });

        it('should not execute future syncs', () => {
            scheduler.scheduleSync('npc_1', ['npc_2'], 10000);
            const result = scheduler.executeScheduledSyncs();
            expect(result.success).toBe(true);
            expect(result.executed).toBe(0);
        });

        it('should use default dream data provider', () => {
            scheduler.scheduleSync('npc_1', ['npc_2'], 0);
            const result = scheduler.executeScheduledSyncs();
            expect(result.success).toBe(true);
            expect(result.results[0].results[0].success).toBe(true);
        });

        it('should use custom dream data provider', () => {
            scheduler.scheduleSync('npc_1', ['npc_2'], 0);
            
            const customData = {
                theme: 'custom_dream',
                content: 'Custom content',
                emotion: 'custom',
                keywords: ['custom']
            };

            const result = scheduler.executeScheduledSyncs((npcId, peerId) => customData);
            expect(result.success).toBe(true);
            expect(result.results[0].results[0].success).toBe(true);
        });

        it('should execute multiple syncs at once', () => {
            scheduler.scheduleSync('npc_1', ['npc_2'], 0);
            scheduler.scheduleSync('npc_2', ['npc_3'], 0);
            
            const result = scheduler.executeScheduledSyncs();
            expect(result.executed).toBe(2);
        });

        it('should return empty when no syncs due', () => {
            const result = scheduler.executeScheduledSyncs();
            expect(result.success).toBe(true);
            expect(result.executed).toBe(0);
            expect(result.message).toBe('No scheduled syncs due for execution');
        });
    });

    describe('getSchedulerStatus', () => {
        it('should return status for specific NPC', () => {
            scheduler.scheduleSync('npc_1', ['npc_2'], 5000);
            const status = scheduler.getSchedulerStatus('npc_1');
            expect(status.success).toBe(true);
            expect(status.npcId).toBe('npc_1');
            expect(status.schedule.status).toBe('scheduled');
        });

        it('should return error for unknown NPC', () => {
            const status = scheduler.getSchedulerStatus('npc_unknown');
            expect(status.success).toBe(false);
            expect(status.reason).toBe('No schedule found for NPC');
        });

        it('should return all schedules when no NPC specified', () => {
            scheduler.scheduleSync('npc_1', ['npc_2'], 0);
            scheduler.scheduleSync('npc_2', ['npc_3'], 0);
            
            const status = scheduler.getSchedulerStatus();
            expect(status.success).toBe(true);
            expect(status.totalScheduled).toBe(2);
        });

        it('should include time until next sync', () => {
            scheduler.scheduleSync('npc_1', ['npc_2'], 5000);
            const status = scheduler.getSchedulerStatus('npc_1');
            expect(status.timeUntilNextSync).toBeGreaterThan(0);
        });

        it('should track executed syncs count', () => {
            scheduler.scheduleSync('npc_1', ['npc_2'], 0);
            scheduler.executeScheduledSyncs();
            
            const status = scheduler.getSchedulerStatus();
            expect(status.executed).toBe(1);
        });
    });

    describe('getSyncHistory', () => {
        beforeEach(() => {
            const inviteResult = dreamCollaboration.inviteToDream('npc_1', 'npc_2', 'dream');
            dreamCollaboration.handleDreamInvitation('npc_2', inviteResult.invitationId, 'accept');
        });

        it('should return sync history', () => {
            scheduler.scheduleSync('npc_1', ['npc_2'], 0);
            scheduler.executeScheduledSyncs();
            
            const history = scheduler.getSyncHistory();
            expect(history.length).toBeGreaterThan(0);
        });

        it('should respect limit parameter', () => {
            scheduler.scheduleSync('npc_1', ['npc_2'], 0);
            scheduler.scheduleSync('npc_2', ['npc_3'], 0);
            scheduler.executeScheduledSyncs();
            
            const history = scheduler.getSyncHistory(1);
            expect(history.length).toBeLessThanOrEqual(1);
        });
    });

    describe('getNextScheduledSync', () => {
        it('should return next sync', () => {
            scheduler.scheduleSync('npc_1', ['npc_2'], 5000);
            scheduler.scheduleSync('npc_2', ['npc_3'], 1000);
            
            const next = scheduler.getNextScheduledSync();
            expect(next).not.toBeNull();
            expect(next.npcId).toBe('npc_2'); // Earlier scheduled time
        });

        it('should return null when no scheduled syncs', () => {
            const next = scheduler.getNextScheduledSync();
            expect(next).toBeNull();
        });

        it('should not return cancelled syncs', () => {
            scheduler.scheduleSync('npc_1', ['npc_2'], 1000);
            scheduler.cancelScheduledSync('npc_1');
            
            const next = scheduler.getNextScheduledSync();
            expect(next).toBeNull();
        });
    });

    describe('clearAll', () => {
        it('should clear all scheduled syncs', () => {
            scheduler.scheduleSync('npc_1', ['npc_2'], 0);
            scheduler.scheduleSync('npc_2', ['npc_3'], 0);
            
            scheduler.clearAll();
            
            const status = scheduler.getSchedulerStatus();
            expect(status.totalScheduled).toBe(0);
        });

        it('should clear sync history', () => {
            scheduler.scheduleSync('npc_1', ['npc_2'], 0);
            scheduler.executeScheduledSyncs();
            
            scheduler.clearAll();
            
            const history = scheduler.getSyncHistory();
            expect(history.length).toBe(0);
        });
    });

    describe('integration with DreamCollaborationProtocol', () => {
        it('should create collaboration when scheduling sync with peers', () => {
            // 不需要预先建立协作，调度器会通过协作协议执行
            scheduler.scheduleSync('npc_1', ['npc_2'], 0);
            
            // 先接受邀请
            const status = dreamCollaboration.getCollaborationStatus('npc_1');
            // 如果没有建立协作，sync 会失败，但 schedule 应该成功
            expect(status.success).toBe(true);
        });

        it('should update collaboration sync count after execution', () => {
            // 建立协作
            const inviteResult = dreamCollaboration.inviteToDream('npc_1', 'npc_2', 'dream');
            dreamCollaboration.handleDreamInvitation('npc_2', inviteResult.invitationId, 'accept');
            
            // 调度并执行
            scheduler.scheduleSync('npc_1', ['npc_2'], 0);
            scheduler.executeScheduledSyncs();
            
            const collabStatus = dreamCollaboration.getCollaborationStatus('npc_1');
            expect(collabStatus.collaborations[0].syncCount).toBe(1);
        });
    });

    describe('edge cases', () => {
        it('should handle peer disconnection gracefully', () => {
            // 注册但不连接
            npcLearningMesh.register('npc_isolated');
            npcLearningMesh.register('npc_target');
            
            const result = scheduler.scheduleSync('npc_isolated', ['npc_target'], 0);
            // 即使没有连接，调度也应该成功（调度器只检查注册）
            expect(result.success).toBe(true);
        });

        it('should handle rapid scheduling', () => {
            for (let i = 0; i < 10; i++) {
                scheduler.scheduleSync('npc_1', ['npc_2'], i * 100);
            }
            
            const status = scheduler.getSchedulerStatus();
            expect(status.totalScheduled).toBeLessThanOrEqual(1); // 同一个 NPC 只能有一个调度
        });

        it('should track sync results after execution', () => {
            scheduler.scheduleSync('npc_1', ['npc_2'], 0);
            
            // 先建立协作
            const inviteResult = dreamCollaboration.inviteToDream('npc_1', 'npc_2', 'dream');
            dreamCollaboration.handleDreamInvitation('npc_2', inviteResult.invitationId, 'accept');
            
            const result = scheduler.executeScheduledSyncs();
            expect(result.results[0].results[0].success).toBe(true);
        });
    });
});