/**
 * DreamCollaborationProtocol.js - NPC 梦境协作协议
 * V288 Iteration 3/9 - NPC Dream Collaboration
 * 
 * 核心机制:
 * 1. NPC 之间发起梦境协作邀请
 * 2. 处理邀请 (accept/reject)
 * 3. 执行梦境同步
 * 4. 追踪协作状态
 */

export class DreamCollaborationProtocol {
    /**
     * @param {NPCLearningMesh} npcLearningMesh - NPC 学习网络
     * @param {DreamMemoryStore} dreamMemoryStore - 梦境记忆存储
     */
    constructor(npcLearningMesh, dreamMemoryStore) {
        this.npcLearningMesh = npcLearningMesh;
        this.dreamMemoryStore = dreamMemoryStore;
        this.invitations = new Map(); // npcId -> invitations[]
        this.collaborations = new Map(); // npcId -> active collaborations
        this.invitationCounter = 0;
    }

    /**
     * 生成邀请 ID
     * @returns {string}
     */
    _generateInvitationId() {
        this.invitationCounter += 1;
        return `inv_dream_${Date.now()}_${this.invitationCounter}`;
    }

    /**
     * 发起梦境协作邀请
     * @param {string} npcId - 发起方 NPC ID
     * @param {string} targetNpcId - 目标 NPC ID
     * @param {string} dreamTheme - 梦境主题
     * @returns {Object} { success: boolean, invitationId: string }
     */
    inviteToDream(npcId, targetNpcId, dreamTheme) {
        if (!npcId || !targetNpcId) {
            return { success: false, reason: 'Invalid npcId or targetNpcId' };
        }

        if (npcId === targetNpcId) {
            return { success: false, reason: 'Cannot invite self to dream' };
        }

        if (!this.npcLearningMesh.isRegistered(npcId)) {
            return { success: false, reason: 'NPC not registered in mesh' };
        }

        if (!this.npcLearningMesh.isRegistered(targetNpcId)) {
            return { success: false, reason: 'Target NPC not registered in mesh' };
        }

        const invitationId = this._generateInvitationId();
        const invitation = {
            id: invitationId,
            from: npcId,
            to: targetNpcId,
            theme: dreamTheme || 'shared_dream',
            status: 'pending',
            createdAt: Date.now(),
            respondedAt: null
        };

        // 保存邀请到目标 NPC
        if (!this.invitations.has(targetNpcId)) {
            this.invitations.set(targetNpcId, []);
        }
        this.invitations.get(targetNpcId).push(invitation);

        // 保存邀请到发起方
        if (!this.invitations.has(npcId)) {
            this.invitations.set(npcId, []);
        }
        this.invitations.get(npcId).push(invitation);

        return { success: true, invitationId };
    }

    /**
     * 处理梦境协作邀请
     * @param {string} npcId - 处理方 NPC ID
     * @param {Object} invitation - 邀请对象或邀请 ID
     * @param {string} response - 'accept' | 'reject'
     * @returns {Object} 处理结果
     */
    handleDreamInvitation(npcId, invitation, response) {
        // 支持通过 ID 查找或直接传入邀请对象
        let invitationObj = invitation;
        
        if (typeof invitation === 'string') {
            // 遍历所有 NPC 的邀请列表来找到这个邀请
            invitationObj = null;
            for (const invitations of this.invitations.values()) {
                const found = invitations.find(inv => inv.id === invitation);
                if (found) {
                    invitationObj = found;
                    break;
                }
            }
            if (!invitationObj) {
                return { success: false, reason: 'Invitation not found' };
            }
        }

        if (invitationObj.to !== npcId) {
            return { success: false, reason: 'Invitation not for this NPC' };
        }

        if (invitationObj.status !== 'pending') {
            return { success: false, reason: 'Invitation already processed' };
        }

        if (response !== 'accept' && response !== 'reject') {
            return { success: false, reason: 'Invalid response, must be accept or reject' };
        }

        invitationObj.status = response;
        invitationObj.respondedAt = Date.now();

        if (response === 'accept') {
            // 建立协作关系
            this._establishCollaboration(invitationObj.from, npcId, invitationObj.theme);
        }

        return { 
            success: true, 
            response,
            invitationId: invitationObj.id,
            collaboration: response === 'accept' ? this._getCollaboration(invitationObj.from, npcId) : null
        };
    }

    /**
     * 建立梦境协作关系
     * @param {string} npcId1 - NPC 1
     * @param {string} npcId2 - NPC 2
     * @param {string} theme - 梦境主题
     */
    _establishCollaboration(npcId1, npcId2, theme) {
        const key1 = `${npcId1}::${npcId2}`;
        const key2 = `${npcId2}::${npcId1}`;
        
        const collaboration = {
            id: `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            participants: [npcId1, npcId2],
            theme,
            status: 'active',
            establishedAt: Date.now(),
            lastSyncAt: null,
            syncCount: 0
        };

        if (!this.collaborations.has(npcId1)) {
            this.collaborations.set(npcId1, new Map());
        }
        if (!this.collaborations.has(npcId2)) {
            this.collaborations.set(npcId2, new Map());
        }

        this.collaborations.get(npcId1).set(key1, collaboration);
        this.collaborations.get(npcId2).set(key2, collaboration);
    }

    /**
     * 获取协作关系
     * @param {string} npcId1 
     * @param {string} npcId2 
     * @returns {Object|null}
     */
    _getCollaboration(npcId1, npcId2) {
        const key = `${npcId1}::${npcId2}`;
        const collabs = this.collaborations.get(npcId1);
        if (!collabs) return null;
        return collabs.get(key) || null;
    }

    /**
     * 执行梦境同步
     * @param {string} npcId - 同步发起方 NPC ID
     * @param {string} peerNpcId - 对等 NPC ID
     * @param {Object} sharedDreamData - 共享的梦境数据
     * @returns {Object} 同步结果
     */
    syncDream(npcId, peerNpcId, sharedDreamData) {
        if (!npcId || !peerNpcId) {
            return { success: false, reason: 'Invalid npcId or peerNpcId' };
        }

        if (!this._hasActiveCollaboration(npcId, peerNpcId)) {
            return { success: false, reason: 'No active collaboration with peer' };
        }

        if (!sharedDreamData || typeof sharedDreamData !== 'object') {
            return { success: false, reason: 'Invalid dream data' };
        }

        // 将梦境数据存入 DreamMemoryStore (两个 NPC 都记录)
        const sessionId = sharedDreamData.sessionId || `dream_sync_${Date.now()}`;
        
        const savePromises = [];
        
        // 保存到 npcId 的梦境记忆
        if (this.dreamMemoryStore) {
            const dreamContent = sharedDreamData.content || JSON.stringify(sharedDreamData);
            const dreamEmotion = sharedDreamData.emotion || 'collaborative';
            const dreamKeywords = sharedDreamData.keywords || ['collaboration', 'dream', 'shared'];

            savePromises.push(
                this.dreamMemoryStore.saveWithSession(
                    npcId, 
                    peerNpcId, 
                    dreamContent,
                    dreamEmotion,
                    dreamKeywords,
                    sessionId
                ).then(id1 => ({ npcId, memoryId: id1 }))
            );

            // 保存到 peerNpcId 的梦境记忆
            savePromises.push(
                this.dreamMemoryStore.saveWithSession(
                    peerNpcId,
                    npcId,
                    dreamContent,
                    dreamEmotion,
                    dreamKeywords,
                    sessionId
                ).then(id2 => ({ npcId: peerNpcId, memoryId: id2 }))
            );
        }

        // 更新协作状态
        const key = `${npcId}::${peerNpcId}`;
        const collab = this._getCollaboration(npcId, peerNpcId);
        if (collab) {
            collab.lastSyncAt = Date.now();
            collab.syncCount += 1;
        }

        return {
            success: true,
            sessionId,
            syncedAt: Date.now(),
            participants: [npcId, peerNpcId],
            dreamTheme: sharedDreamData.theme || collab?.theme || 'shared_dream'
        };
    }

    /**
     * 检查是否存在活跃协作
     * @param {string} npcId1 
     * @param {string} npcId2 
     * @returns {boolean}
     */
    _hasActiveCollaboration(npcId1, npcId2) {
        const collab = this._getCollaboration(npcId1, npcId2);
        return collab && collab.status === 'active';
    }

    /**
     * 获取梦境协作状态
     * @param {string} npcId - NPC ID
     * @returns {Object} 协作状态
     */
    getCollaborationStatus(npcId) {
        if (!this.npcLearningMesh.isRegistered(npcId)) {
            return { success: false, reason: 'NPC not registered' };
        }

        const invitations = this.invitations.get(npcId) || [];
        const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
        const sentInvitations = invitations.filter(inv => inv.from === npcId);
        const receivedInvitations = invitations.filter(inv => inv.to === npcId);

        const collaborations = this.collaborations.get(npcId) || new Map();
        const activeCollaborations = Array.from(collaborations.values())
            .filter(c => c.status === 'active');

        return {
            success: true,
            npcId,
            pendingInvitations: pendingInvitations.length,
            sentInvitations: sentInvitations.length,
            receivedInvitations: receivedInvitations.length,
            activeCollaborations: activeCollaborations.length,
            collaborations: activeCollaborations.map(c => ({
                id: c.id,
                participants: c.participants,
                theme: c.theme,
                establishedAt: c.establishedAt,
                lastSyncAt: c.lastSyncAt,
                syncCount: c.syncCount
            })),
            invitations: {
                pending: pendingInvitations,
                sent: sentInvitations,
                received: receivedInvitations
            }
        };
    }

    /**
     * 结束梦境协作
     * @param {string} npcId - NPC ID
     * @param {string} peerNpcId - 对等 NPC ID
     * @returns {Object} 结束结果
     */
    endCollaboration(npcId, peerNpcId) {
        const key1 = `${npcId}::${peerNpcId}`;
        const key2 = `${peerNpcId}::${npcId}`;

        const collab1 = this._getCollaboration(npcId, peerNpcId);
        if (!collab1) {
            return { success: false, reason: 'No active collaboration with peer' };
        }

        // 标记协作为已结束
        collab1.status = 'ended';
        collab1.endedAt = Date.now();

        // 从 Map 中移除
        const collabs1 = this.collaborations.get(npcId);
        const collabs2 = this.collaborations.get(peerNpcId);

        if (collabs1) collabs1.delete(key1);
        if (collabs2) collabs2.delete(key2);

        return {
            success: true,
            ended: { npcId, peerNpcId },
            endedAt: collab1.endedAt
        };
    }

    /**
     * 获取所有待处理的邀请
     * @param {string} npcId - NPC ID
     * @returns {Object[]} 待处理邀请列表
     */
    getPendingInvitations(npcId) {
        const invitations = this.invitations.get(npcId) || [];
        // 只返回发给此 NPC 的邀请（不包含自己作为发送方的邀请）
        return invitations.filter(inv => inv.status === 'pending' && inv.to === npcId);
    }

    /**
     * 清除所有数据（测试用）
     */
    clearAll() {
        this.invitations.clear();
        this.collaborations.clear();
        this.invitationCounter = 0;
    }
}

export default DreamCollaborationProtocol;