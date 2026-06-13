/**
 * NPCLearningMesh.js - 分布式 NPC 协作学习网络
 * V282 Iteration 6/9 - NPC Collaborative Learning Mesh
 * 
 * 核心机制：
 * 1. NPC 之间建立对等网络 (mesh topology)
 * 2. NPC 之间可以广播共享技能/经验
 * 3. 查询其他 NPC 共享的技能
 * 4. 融合其他 NPC 的经验到本地
 */

import { SkillRegistry } from './SkillRegistry.js';

/**
 * NPCLearningMesh - 分布式 NPC 协作学习网络
 * 实现 NPC 之间共享学习成果的分布式网络
 */
export class NPCLearningMesh {
    /**
     * @param {SkillRegistry} skillRegistry - 可选的技能注册表实例
     */
    constructor(skillRegistry = null) {
        this.mesh = new Map(); // npcId -> Set of peer npcIds
        this.sharedSkills = new Map(); // npcId -> shared skills
        this.skillRegistry = skillRegistry || new SkillRegistry();
    }

    /**
     * 注册 NPC 到网络，建立自己的共享空间
     * @param {string} npcId - NPC ID
     * @returns {Object} 注册结果
     */
    register(npcId) {
        if (!npcId) {
            return { success: false, reason: 'Invalid npcId' };
        }

        if (this.mesh.has(npcId)) {
            return { success: false, reason: 'NPC already registered', npcId };
        }

        this.mesh.set(npcId, new Set());
        this.sharedSkills.set(npcId, new Map());
        return { success: true, npcId, peers: 0 };
    }

    /**
     * 注销 NPC，从网络中移除
     * @param {string} npcId - NPC ID
     * @returns {Object} 注销结果
     */
    unregister(npcId) {
        if (!this.mesh.has(npcId)) {
            return { success: false, reason: 'NPC not found' };
        }

        // 从所有对等方的列表中移除
        for (const peers of this.mesh.values()) {
            peers.delete(npcId);
        }

        this.mesh.delete(npcId);
        this.sharedSkills.delete(npcId);
        return { success: true, removed: npcId };
    }

    /**
     * 连接两个 NPC，建立对等关系
     * @param {string} npcId1 - NPC ID 1
     * @param {string} npcId2 - NPC ID 2
     * @returns {Object} 连接结果
     */
    connect(npcId1, npcId2) {
        if (npcId1 === npcId2) {
            return { success: false, reason: 'Cannot connect NPC to itself' };
        }

        if (!this.mesh.has(npcId1)) {
            return { success: false, reason: 'NPC not found', npcId: npcId1 };
        }

        if (!this.mesh.has(npcId2)) {
            return { success: false, reason: 'NPC not found', npcId: npcId2 };
        }

        this.mesh.get(npcId1).add(npcId2);
        this.mesh.get(npcId2).add(npcId1);

        return { success: true, peer1: npcId1, peer2: npcId2 };
    }

    /**
     * 断开两个 NPC 的对等关系
     * @param {string} npcId1 - NPC ID 1
     * @param {string} npcId2 - NPC ID 2
     * @returns {Object} 断开结果
     */
    disconnect(npcId1, npcId2) {
        if (!this.mesh.has(npcId1) || !this.mesh.has(npcId2)) {
            return { success: false, reason: 'NPC not found' };
        }

        this.mesh.get(npcId1).delete(npcId2);
        this.mesh.get(npcId2).delete(npcId1);
        return { success: true, disconnected: `${npcId1} <-> ${npcId2}` };
    }

    /**
     * 广播技能/经验给所有对等 NPC
     * @param {string} npcId - 广播者 NPC ID
     * @param {Object} skill - 技能对象 { id, pattern, owner?, usage?, confidence? }
     * @returns {Object} 广播结果
     */
    broadcast(npcId, skill) {
        if (!this.mesh.has(npcId)) {
            return { success: false, reason: 'NPC not registered' };
        }

        if (!skill.id || !skill.pattern) {
            return { success: false, reason: 'Invalid skill format' };
        }

        // 注册到全局技能注册表
        const regResult = this.skillRegistry.register(skill);
        if (!regResult.success && regResult.reason !== 'Skill already registered') {
            return { success: false, reason: regResult.reason };
        }

        // 广播给所有对等方
        const peers = this.mesh.get(npcId);
        let broadcastCount = 0;

        for (const peerId of peers) {
            if (!this.sharedSkills.has(peerId)) {
                this.sharedSkills.set(peerId, new Map());
            }

            const peerSkills = this.sharedSkills.get(peerId);
            peerSkills.set(skill.id, {
                ...skill,
                sharedBy: npcId,
                sharedAt: Date.now()
            });
            broadcastCount++;
        }

        return {
            success: true,
            broadcaster: npcId,
            broadcastCount,
            skillId: skill.id
        };
    }

    /**
     * 查询 NPC 从其他 NPC 获取的共享技能
     * @param {string} npcId - NPC ID
     * @returns {Object[]} 共享技能数组
     */
    querySharedSkills(npcId) {
        if (!this.mesh.has(npcId)) {
            return { success: false, reason: 'NPC not registered' };
        }

        const sharedSkills = this.sharedSkills.get(npcId) || new Map();
        const skills = Array.from(sharedSkills.values());

        return {
            success: true,
            npcId,
            skills,
            count: skills.length
        };
    }

    /**
     * 融合其他 NPC 的经验到本地
     * @param {string} targetNpcId - 目标 NPC ID
     * @param {string} sourceNpcId - 源 NPC ID
     * @param {string} skillId - 技能 ID
     * @returns {Object} 融合结果
     */
    fuseExperience(targetNpcId, sourceNpcId, skillId) {
        if (!this.mesh.has(targetNpcId)) {
            return { success: false, reason: 'Target NPC not registered' };
        }

        if (!this.mesh.has(sourceNpcId)) {
            return { success: false, reason: 'Source NPC not registered' };
        }

        // 检查目标 NPC 是否有来自源 NPC 的该技能
        const targetSkills = this.sharedSkills.get(targetNpcId) || new Map();
        const sharedSkill = targetSkills.get(skillId);

        if (!sharedSkill) {
            return { success: false, reason: 'Skill not found in shared skills' };
        }

        // 获取全局注册表中的技能信息
        const skillInfo = this.skillRegistry.get(skillId);
        if (!skillInfo) {
            return { success: false, reason: 'Skill not in registry' };
        }

        // 复制技能到目标 NPC 的本地共享空间
        // 注意：这只是标记融合，实际上只是增加了一个引用
        const fusedSkill = {
            ...sharedSkill,
            fusedAt: Date.now(),
            source: sourceNpcId
        };

        targetSkills.set(skillId, fusedSkill);

        return {
            success: true,
            target: targetNpcId,
            source: sourceNpcId,
            skillId,
            skill: fusedSkill
        };
    }

    /**
     * 获取 NPC 的对等列表
     * @param {string} npcId - NPC ID
     * @returns {Object} 对等信息
     */
    getPeers(npcId) {
        if (!this.mesh.has(npcId)) {
            return { success: false, reason: 'NPC not registered' };
        }

        const peers = this.mesh.get(npcId);
        return {
            success: true,
            npcId,
            peers: Array.from(peers),
            peerCount: peers.size
        };
    }

    /**
     * 检查 NPC 是否已注册
     * @param {string} npcId - NPC ID
     * @returns {boolean}
     */
    isRegistered(npcId) {
        return this.mesh.has(npcId);
    }

    /**
     * 获取网络统计信息
     * @returns {Object} 网络统计
     */
    getStats() {
        let totalPeers = 0;
        let totalSharedSkills = 0;

        for (const peers of this.mesh.values()) {
            totalPeers += peers.size;
        }

        for (const skills of this.sharedSkills.values()) {
            totalSharedSkills += skills.size;
        }

        return {
            totalNPCs: this.mesh.size,
            totalPeerConnections: totalPeers / 2, // 每个连接被计数两次
            totalSharedSkills,
            registryStats: this.skillRegistry.getStats()
        };
    }

    /**
     * 清除所有数据，重置网络
     * @returns {Object} 重置结果
     */
    reset() {
        const stats = this.getStats();
        this.mesh.clear();
        this.sharedSkills.clear();
        this.skillRegistry.clear();
        return { success: true, cleared: stats };
    }
}

export default NPCLearningMesh;