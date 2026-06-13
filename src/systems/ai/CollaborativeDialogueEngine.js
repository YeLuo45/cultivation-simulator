/**
 * CollaborativeDialogueEngine.js - NPC 多方协作对话引擎
 * V290 Iteration 5/9 - NPC Collaborative Dialogue Engine
 * 
 * 核心机制：
 * 1. 管理多方对话 (multi-party dialogue)
 * 2. 基于 NPCLearningMesh 同步对话记忆
 * 3. 生成 NPC 协作响应
 */

import { NPCDialogueService } from './NPCDialogueService.js';

/**
 * CollaborativeDialogueEngine - NPC 多方协作对话引擎
 * 支持多个 NPC 参与同一对话主题的协作式对话
 */
export class CollaborativeDialogueEngine {
    /**
     * @param {NPCDialogueService} npcDialogueService - NPC对话服务实例
     * @param {NPCLearningMesh} npcLearningMesh - NPC学习网格实例
     */
    constructor(npcDialogueService, npcLearningMesh) {
        this.npcDialogueService = npcDialogueService;
        this.npcLearningMesh = npcLearningMesh;
        this.activeDialogues = new Map(); // dialogueId -> { npcIds, topic, history, createdAt, updatedAt }
        this.dialogueCounter = 0;
    }

    /**
     * 生成唯一对话ID
     * @returns {string}
     */
    generateDialogueId() {
        this.dialogueCounter++;
        return `dialogue_${Date.now()}_${this.dialogueCounter}`;
    }

    /**
     * 发起多方对话
     * @param {string[]} npcIds - 参与对话的NPC ID数组
     * @param {string} topic - 对话主题
     * @returns {Object} 发起结果
     */
    initiateMultiPartyDialogue(npcIds, topic) {
        if (!npcIds || npcIds.length === 0) {
            return { success: false, reason: 'No NPC IDs provided' };
        }

        if (!topic || typeof topic !== 'string') {
            return { success: false, reason: 'Invalid topic' };
        }

        // 检查所有 NPC 是否注册到 mesh
        const unregisteredNPCs = npcIds.filter(id => !this.npcLearningMesh.isRegistered(id));
        if (unregisteredNPCs.length > 0) {
            return { 
                success: false, 
                reason: 'Some NPCs not registered in learning mesh',
                unregisteredNPCs 
            };
        }

        const dialogueId = this.generateDialogueId();
        const dialogue = {
            dialogueId,
            npcIds: [...npcIds],
            topic,
            history: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: 'active'
        };

        this.activeDialogues.set(dialogueId, dialogue);

        // 初始化每个 NPC 的对话上下文
        for (const npcId of npcIds) {
            const context = this.npcDialogueService.getOrCreateContext(npcId);
            context.currentTopic = topic;
            context.dialogueId = dialogueId;
        }

        return {
            success: true,
            dialogueId,
            npcIds,
            topic,
            participantCount: npcIds.length
        };
    }

    /**
     * 生成 NPC 响应
     * @param {string} npcId - NPC ID
     * @param {Object} context - 附加上下文
     * @param {Array} dialogueHistory - 对话历史
     * @returns {Object} 生成的响应
     */
    generateNPCResponse(npcId, context = {}, dialogueHistory = []) {
        if (!npcId) {
            return { success: false, reason: 'Missing npcId parameter' };
        }

        // 查找该 NPC 参与的活动对话
        let activeDialogue = null;
        for (const [dialogueId, dialogue] of this.activeDialogues.entries()) {
            if (dialogue.npcIds.includes(npcId) && dialogue.status === 'active') {
                activeDialogue = dialogue;
                break;
            }
        }

        // 获取该 NPC 的对话上下文
        const ctx = this.npcDialogueService.getOrCreateContext(npcId);

        // 获取相关记忆以丰富响应
        const memories = this.npcDialogueService.getMemories(npcId);
        const relevantMemories = this.npcDialogueService.findRelevantMemories(
            memories,
            activeDialogue?.topic || context.topic || ''
        );

        // 合并对话历史中的信息
        let enrichedContext = { ...context };
        if (activeDialogue && activeDialogue.history.length > 0) {
            enrichedContext.previousStatements = activeDialogue.history
                .filter(h => h.npcId !== npcId)
                .slice(-3)
                .map(h => h.text);
        }

        // 从 mesh 获取共享技能作为上下文
        const sharedSkills = this.npcLearningMesh.querySharedSkills(npcId);
        if (sharedSkills.success && sharedSkills.skills.length > 0) {
            enrichedContext.sharedKnowledge = sharedSkills.skills
                .slice(0, 3)
                .map(s => s.id);
        }

        // 生成对话响应
        const role = this.npcDialogueService.extractRole(npcId);
        const generated = this.npcDialogueService.generateDialogue(
            npcId,
            role,
            context.playerMessage || enrichedContext.topic || '',
            ctx,
            relevantMemories
        );

        // 如果有活动对话，记录到历史
        if (activeDialogue) {
            activeDialogue.history.push({
                npcId,
                text: generated.text,
                timestamp: Date.now(),
                turn: activeDialogue.history.length + 1
            });
            activeDialogue.updatedAt = Date.now();
        }

        // 更新上下文
        ctx.addToHistory(enrichedContext.playerMessage || '', generated.text);

        return {
            success: true,
            npcId,
            dialogueId: activeDialogue?.dialogueId || null,
            response: generated,
            context: {
                turnCount: ctx.turnCount,
                currentTopic: ctx.currentTopic,
                emotion: ctx.emotion,
                hasDialogue: !!activeDialogue
            }
        };
    }

    /**
     * 同步对话记忆
     * @param {string} npcId - NPC ID
     * @param {string[]} peerNpcIds - 对等 NPC ID 数组
     * @returns {Object} 同步结果
     */
    syncDialogueMemory(npcId, peerNpcIds) {
        if (!npcId) {
            return { success: false, reason: 'Missing npcId parameter' };
        }

        if (!peerNpcIds || peerNpcIds.length === 0) {
            return { success: false, reason: 'No peer NPC IDs provided' };
        }

        // 检查 NPC 是否在 mesh 中
        if (!this.npcLearningMesh.isRegistered(npcId)) {
            return { success: false, reason: 'NPC not registered in learning mesh' };
        }

        const syncedMemories = [];
        const memories = this.npcDialogueService.getMemories(npcId);

        for (const peerId of peerNpcIds) {
            // 检查对等 NPC 是否在 mesh 中
            if (!this.npcLearningMesh.isRegistered(peerId)) {
                continue;
            }

            // 获取当前 NPC 关于对等 NPC 的记忆
            const relevantMemories = memories.filter(m => {
                if (m.type === 'relationship') {
                    return m.content.relatedNpcId === peerId;
                }
                if (m.type === 'interaction') {
                    return m.content.peerNpcId === peerId;
                }
                return false;
            });

            // 广播给对等 NPC
            for (const memory of relevantMemories) {
                const broadcastResult = this.npcLearningMesh.broadcast(npcId, {
                    id: `memory_${memory.id}`,
                    pattern: memory.content,
                    owner: npcId
                });

                if (broadcastResult.success) {
                    syncedMemories.push({
                        memoryId: memory.id,
                        sharedWith: peerId,
                        sharedAt: Date.now()
                    });
                }
            }
        }

        return {
            success: true,
            npcId,
            syncedCount: syncedMemories.length,
            syncedMemories
        };
    }

    /**
     * 获取对话协作状态
     * @param {string} npcId - NPC ID
     * @returns {Object} 状态信息
     */
    getDialogueStatus(npcId) {
        if (!npcId) {
            return { success: false, reason: 'Missing npcId parameter' };
        }

        // 查找 NPC 参与的所有对话
        const dialogues = [];
        for (const [dialogueId, dialogue] of this.activeDialogues.entries()) {
            if (dialogue.npcIds.includes(npcId)) {
                dialogues.push({
                    dialogueId,
                    topic: dialogue.topic,
                    status: dialogue.status,
                    participantCount: dialogue.npcIds.length,
                    historyLength: dialogue.history.length,
                    createdAt: dialogue.createdAt,
                    updatedAt: dialogue.updatedAt
                });
            }
        }

        // 获取 NPC 的对话上下文
        const ctx = this.npcDialogueService.contexts.get(npcId);

        // 获取 peer 信息
        const peers = this.npcLearningMesh.getPeers(npcId);

        return {
            success: true,
            npcId,
            activeDialogues: dialogues,
            dialogueCount: dialogues.length,
            context: ctx ? {
                turnCount: ctx.turnCount,
                currentTopic: ctx.currentTopic,
                emotion: ctx.emotion,
                tone: ctx.tone
            } : null,
            peerCount: peers.success ? peers.peerCount : 0,
            meshConnected: peers.success
        };
    }

    /**
     * 结束多方对话
     * @param {string} dialogueId - 对话 ID
     * @returns {Object} 结束结果
     */
    endMultiPartyDialogue(dialogueId) {
        const dialogue = this.activeDialogues.get(dialogueId);
        if (!dialogue) {
            return { success: false, reason: 'Dialogue not found' };
        }

        dialogue.status = 'ended';
        dialogue.endedAt = Date.now();

        return {
            success: true,
            dialogueId,
            topic: dialogue.topic,
            participantCount: dialogue.npcIds.length,
            historyLength: dialogue.history.length
        };
    }

    /**
     * 获取活动对话列表
     * @param {string} npcId - 可选：筛选特定 NPC 的对话
     * @returns {Object} 对话列表
     */
    getActiveDialogues(npcId = null) {
        const dialogues = [];

        for (const [dialogueId, dialogue] of this.activeDialogues.entries()) {
            if (dialogue.status === 'active') {
                if (!npcId || dialogue.npcIds.includes(npcId)) {
                    dialogues.push({
                        dialogueId,
                        topic: dialogue.topic,
                        npcIds: dialogue.npcIds,
                        participantCount: dialogue.npcIds.length,
                        historyLength: dialogue.history.length,
                        createdAt: dialogue.createdAt,
                        updatedAt: dialogue.updatedAt
                    });
                }
            }
        }

        return {
            success: true,
            dialogues,
            count: dialogues.length
        };
    }

    /**
     * 获取对话历史
     * @param {string} dialogueId - 对话 ID
     * @returns {Object} 历史记录
     */
    getDialogueHistory(dialogueId) {
        const dialogue = this.activeDialogues.get(dialogueId);
        if (!dialogue) {
            return { success: false, reason: 'Dialogue not found' };
        }

        return {
            success: true,
            dialogueId,
            topic: dialogue.topic,
            history: dialogue.history,
            npcIds: dialogue.npcIds
        };
    }

    /**
     * 清除已结束的对话
     * @returns {Object} 清理结果
     */
    clearEndedDialogues() {
        let cleared = 0;
        for (const [dialogueId, dialogue] of this.activeDialogues.entries()) {
            if (dialogue.status === 'ended') {
                this.activeDialogues.delete(dialogueId);
                cleared++;
            }
        }

        return {
            success: true,
            cleared
        };
    }

    /**
     * 获取引擎统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        let activeCount = 0;
        let endedCount = 0;
        let totalHistory = 0;

        for (const dialogue of this.activeDialogues.values()) {
            if (dialogue.status === 'active') {
                activeCount++;
            } else {
                endedCount++;
            }
            totalHistory += dialogue.history.length;
        }

        return {
            totalDialogues: this.activeDialogues.size,
            activeDialogues: activeCount,
            endedDialogues: endedCount,
            totalHistoryEntries: totalHistory,
            dialogueCounter: this.dialogueCounter
        };
    }

    /**
     * 重置引擎
     * @returns {Object} 重置结果
     */
    reset() {
        const stats = this.getStats();
        this.activeDialogues.clear();
        this.dialogueCounter = 0;
        return {
            success: true,
            cleared: stats
        };
    }
}

export default CollaborativeDialogueEngine;