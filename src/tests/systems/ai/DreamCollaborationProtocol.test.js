/**
 * DreamCollaborationProtocol.test.js - 梦境协作协议测试
 * V288 Iteration 3/9
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DreamCollaborationProtocol } from '../../../systems/ai/DreamCollaborationProtocol.js';
import { NPCLearningMesh } from '../../../systems/ai/NPCLearningMesh.js';

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

    async query(npcId, playerId) {
        const key = `${npcId}::${playerId}`;
        return this.memories.get(key) || [];
    }

    async clearAll() {
        this.memories.clear();
    }
}

describe('DreamCollaborationProtocol', () => {
    let protocol;
    let npcLearningMesh;
    let dreamMemoryStore;

    beforeEach(() => {
        npcLearningMesh = new NPCLearningMesh();
        dreamMemoryStore = new MockDreamMemoryStore();
        protocol = new DreamCollaborationProtocol(npcLearningMesh, dreamMemoryStore);

        // 注册测试用 NPC
        npcLearningMesh.register('npc_1');
        npcLearningMesh.register('npc_2');
        npcLearningMesh.register('npc_3');
        npcLearningMesh.connect('npc_1', 'npc_2');
        npcLearningMesh.connect('npc_2', 'npc_3');
    });

    afterEach(() => {
        protocol.clearAll();
        npcLearningMesh.reset();
        dreamMemoryStore.clearAll();
    });

    describe('inviteToDream', () => {
        it('should create dream invitation successfully', () => {
            const result = protocol.inviteToDream('npc_1', 'npc_2', 'mystical_forest');
            expect(result.success).toBe(true);
            expect(result.invitationId).toBeDefined();
            expect(result.invitationId).toContain('inv_dream_');
        });

        it('should reject invalid npcId', () => {
            const result = protocol.inviteToDream('', 'npc_2', 'theme');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invalid npcId or targetNpcId');
        });

        it('should reject invalid targetNpcId', () => {
            const result = protocol.inviteToDream('npc_1', '', 'theme');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invalid npcId or targetNpcId');
        });

        it('should reject self invitation', () => {
            const result = protocol.inviteToDream('npc_1', 'npc_1', 'theme');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Cannot invite self to dream');
        });

        it('should reject if NPC not registered', () => {
            const result = protocol.inviteToDream('npc_unknown', 'npc_2', 'theme');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not registered in mesh');
        });

        it('should reject if target NPC not registered', () => {
            const result = protocol.inviteToDream('npc_1', 'npc_unknown', 'theme');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Target NPC not registered in mesh');
        });

        it('should generate unique invitation IDs', () => {
            const result1 = protocol.inviteToDream('npc_1', 'npc_2', 'theme1');
            const result2 = protocol.inviteToDream('npc_1', 'npc_2', 'theme2');
            expect(result1.invitationId).not.toBe(result2.invitationId);
        });

        it('should store invitation for both parties', () => {
            protocol.inviteToDream('npc_1', 'npc_2', 'shared_theme');
            const status1 = protocol.getCollaborationStatus('npc_1');
            const status2 = protocol.getCollaborationStatus('npc_2');
            expect(status1.sentInvitations).toBe(1);
            expect(status2.receivedInvitations).toBe(1);
        });
    });

    describe('handleDreamInvitation', () => {
        it('should accept invitation successfully', () => {
            const inviteResult = protocol.inviteToDream('npc_1', 'npc_2', 'dream_theme');
            const handleResult = protocol.handleDreamInvitation('npc_2', inviteResult.invitationId, 'accept');
            expect(handleResult.success).toBe(true);
            expect(handleResult.response).toBe('accept');
            expect(handleResult.collaboration).toBeDefined();
        });

        it('should reject invitation successfully', () => {
            const inviteResult = protocol.inviteToDream('npc_1', 'npc_2', 'dream_theme');
            const handleResult = protocol.handleDreamInvitation('npc_2', inviteResult.invitationId, 'reject');
            expect(handleResult.success).toBe(true);
            expect(handleResult.response).toBe('reject');
            expect(handleResult.collaboration).toBeNull();
        });

        it('should reject invalid invitation ID', () => {
            const result = protocol.handleDreamInvitation('npc_2', 'invalid_id', 'accept');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invitation not found');
        });

        it('should reject if invitation not for this NPC', () => {
            const inviteResult = protocol.inviteToDream('npc_1', 'npc_2', 'theme');
            const result = protocol.handleDreamInvitation('npc_3', inviteResult.invitationId, 'accept');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invitation not for this NPC');
        });

        it('should reject already processed invitation', () => {
            const inviteResult = protocol.inviteToDream('npc_1', 'npc_2', 'theme');
            protocol.handleDreamInvitation('npc_2', inviteResult.invitationId, 'accept');
            const result = protocol.handleDreamInvitation('npc_2', inviteResult.invitationId, 'reject');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invitation already processed');
        });

        it('should reject invalid response', () => {
            const inviteResult = protocol.inviteToDream('npc_1', 'npc_2', 'theme');
            const result = protocol.handleDreamInvitation('npc_2', inviteResult.invitationId, 'maybe');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invalid response, must be accept or reject');
        });

        it('should establish collaboration on accept', () => {
            const inviteResult = protocol.inviteToDream('npc_1', 'npc_2', 'theme');
            protocol.handleDreamInvitation('npc_2', inviteResult.invitationId, 'accept');
            const status = protocol.getCollaborationStatus('npc_1');
            expect(status.activeCollaborations).toBe(1);
        });
    });

    describe('syncDream', () => {
        beforeEach(() => {
            // 先建立协作关系
            const inviteResult = protocol.inviteToDream('npc_1', 'npc_2', 'shared_theme');
            protocol.handleDreamInvitation('npc_2', inviteResult.invitationId, 'accept');
        });

        it('should sync dream data successfully', () => {
            const dreamData = {
                theme: 'test_dream',
                content: 'Flying through clouds',
                emotion: 'euphoric',
                keywords: ['flying', 'clouds', 'freedom']
            };
            const result = protocol.syncDream('npc_1', 'npc_2', dreamData);
            expect(result.success).toBe(true);
            expect(result.sessionId).toBeDefined();
            expect(result.participants).toContain('npc_1');
            expect(result.participants).toContain('npc_2');
        });

        it('should reject invalid npcId', () => {
            const result = protocol.syncDream('', 'npc_2', { content: 'test' });
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invalid npcId or peerNpcId');
        });

        it('should reject invalid peerNpcId', () => {
            const result = protocol.syncDream('npc_1', '', { content: 'test' });
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invalid npcId or peerNpcId');
        });

        it('should reject if no active collaboration', () => {
            // npc_1 没有与 npc_3 建立协作
            const result = protocol.syncDream('npc_1', 'npc_3', { content: 'test' });
            expect(result.success).toBe(false);
            expect(result.reason).toBe('No active collaboration with peer');
        });

        it('should reject invalid dream data', () => {
            const result = protocol.syncDream('npc_1', 'npc_2', null);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invalid dream data');
        });

        it('should store dream data in DreamMemoryStore', async () => {
            const dreamData = {
                content: 'Collective dream',
                emotion: 'serene',
                keywords: ['peaceful', 'shared']
            };
            protocol.syncDream('npc_1', 'npc_2', dreamData);
            
            const memories1 = await dreamMemoryStore.query('npc_1', 'npc_2');
            const memories2 = await dreamMemoryStore.query('npc_2', 'npc_1');
            expect(memories1.length).toBeGreaterThan(0);
            expect(memories2.length).toBeGreaterThan(0);
        });
    });

    describe('getCollaborationStatus', () => {
        it('should return NPC collaboration status', () => {
            protocol.inviteToDream('npc_1', 'npc_2', 'theme1');
            protocol.inviteToDream('npc_1', 'npc_2', 'theme2');
            protocol.inviteToDream('npc_3', 'npc_1', 'theme3');

            const status = protocol.getCollaborationStatus('npc_1');
            expect(status.success).toBe(true);
            expect(status.npcId).toBe('npc_1');
            expect(status.sentInvitations).toBe(2);
            expect(status.receivedInvitations).toBe(1);
        });

        it('should reject unregistered NPC', () => {
            const status = protocol.getCollaborationStatus('npc_unknown');
            expect(status.success).toBe(false);
            expect(status.reason).toBe('NPC not registered');
        });

        it('should include collaboration details after accept', () => {
            const inviteResult = protocol.inviteToDream('npc_1', 'npc_2', 'dream_theme');
            protocol.handleDreamInvitation('npc_2', inviteResult.invitationId, 'accept');

            const status = protocol.getCollaborationStatus('npc_1');
            expect(status.collaborations.length).toBe(1);
            expect(status.collaborations[0].theme).toBe('dream_theme');
        });
    });

    describe('endCollaboration', () => {
        beforeEach(() => {
            const inviteResult = protocol.inviteToDream('npc_1', 'npc_2', 'theme');
            protocol.handleDreamInvitation('npc_2', inviteResult.invitationId, 'accept');
        });

        it('should end collaboration successfully', () => {
            const result = protocol.endCollaboration('npc_1', 'npc_2');
            expect(result.success).toBe(true);
            expect(result.ended).toBeDefined();
        });

        it('should reject if no active collaboration', () => {
            const result = protocol.endCollaboration('npc_1', 'npc_3');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('No active collaboration with peer');
        });

        it('should reflect ended status in collaboration status', () => {
            protocol.endCollaboration('npc_1', 'npc_2');
            const status = protocol.getCollaborationStatus('npc_1');
            expect(status.activeCollaborations).toBe(0);
        });

        it('should not allow sync after collaboration ended', () => {
            protocol.endCollaboration('npc_1', 'npc_2');
            const result = protocol.syncDream('npc_1', 'npc_2', { content: 'test' });
            expect(result.success).toBe(false);
            expect(result.reason).toBe('No active collaboration with peer');
        });
    });

    describe('getPendingInvitations', () => {
        it('should return pending invitations', () => {
            protocol.inviteToDream('npc_1', 'npc_2', 'theme1');
            protocol.inviteToDream('npc_3', 'npc_1', 'theme2');

            const pending = protocol.getPendingInvitations('npc_1');
            expect(pending.length).toBe(1); // npc_3 -> npc_1
            expect(pending[0].from).toBe('npc_3');
        });

        it('should return empty array if no pending invitations', () => {
            const pending = protocol.getPendingInvitations('npc_2');
            expect(pending.length).toBe(0);
        });
    });

    describe('clearAll', () => {
        it('should clear all invitations and collaborations', () => {
            protocol.inviteToDream('npc_1', 'npc_2', 'theme');
            protocol.inviteToDream('npc_1', 'npc_3', 'theme2');

            protocol.clearAll();

            const status1 = protocol.getCollaborationStatus('npc_1');
            expect(status1.pendingInvitations).toBe(0);
            expect(status1.sentInvitations).toBe(0);
            expect(status1.receivedInvitations).toBe(0);
        });
    });

    describe('collaboration lifecycle', () => {
        it('should handle full collaboration lifecycle', () => {
            // 1. 发送邀请
            const inviteResult = protocol.inviteToDream('npc_1', 'npc_2', 'lucid_dream');
            expect(inviteResult.success).toBe(true);

            // 2. 接受邀请
            const acceptResult = protocol.handleDreamInvitation('npc_2', inviteResult.invitationId, 'accept');
            expect(acceptResult.success).toBe(true);

            // 3. 执行多次同步
            const sync1 = protocol.syncDream('npc_1', 'npc_2', { content: 'Dream sync 1' });
            expect(sync1.success).toBe(true);

            const sync2 = protocol.syncDream('npc_1', 'npc_2', { content: 'Dream sync 2' });
            expect(sync2.success).toBe(true);

            // 4. 验证同步次数
            const status = protocol.getCollaborationStatus('npc_1');
            expect(status.collaborations[0].syncCount).toBe(2);

            // 5. 结束协作
            const endResult = protocol.endCollaboration('npc_1', 'npc_2');
            expect(endResult.success).toBe(true);
        });

        it('should handle multiple NPCs', () => {
            // npc_1 同时与 npc_2 和 npc_3 建立协作
            const invite1 = protocol.inviteToDream('npc_1', 'npc_2', 'theme1');
            const invite2 = protocol.inviteToDream('npc_1', 'npc_3', 'theme2');

            protocol.handleDreamInvitation('npc_2', invite1.invitationId, 'accept');
            protocol.handleDreamInvitation('npc_3', invite2.invitationId, 'accept');

            const status = protocol.getCollaborationStatus('npc_1');
            expect(status.activeCollaborations).toBe(2);

            // 两个同步应该都成功
            const sync1 = protocol.syncDream('npc_1', 'npc_2', { content: 'With npc_2' });
            const sync2 = protocol.syncDream('npc_1', 'npc_3', { content: 'With npc_3' });
            expect(sync1.success).toBe(true);
            expect(sync2.success).toBe(true);
        });
    });
});