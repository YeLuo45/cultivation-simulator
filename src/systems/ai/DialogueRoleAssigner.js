/**
 * DialogueRoleAssigner.js - NPC 对话角色分配器
 * V290 Iteration 5/9 - NPC Collaborative Dialogue Engine
 * 
 * 核心机制：
 * 1. 基于对话类型自动分配角色
 * 2. 支持角色切换
 * 3. 基于 NPCLearningMesh 获取 NPC 特长
 */

// ===== 角色类型定义 =====

/**
 * 对话角色类型
 */
export const DIALOGUE_ROLES = {
    LEAD: 'lead',           // 主导者 - 引导对话方向
    SUPPORTER: 'supporter', // 支持者 - 提供补充信息
    MODERATOR: 'moderator', // 主持人 - 协调多方对话
    EXPERT: 'expert',       // 专家 - 提供专业知识
    LISTENER: 'listener'   // 倾听者 - 观察和回应
};

/**
 * 对话类型定义
 */
export const DIALOGUE_TYPES = {
    TRADE: 'trade',           // 交易对话
    COMBAT: 'combat',         // 战斗对话
    SOCIAL: 'social',         // 社交对话
    QUEST: 'quest',           // 任务对话
    TRAINING: 'training',     // 训练对话
    EXPLORATION: 'exploration' // 探索对话
};

/**
 * 角色分配优先级
 */
const ROLE_PRIORITY = {
    [DIALOGUE_ROLES.LEAD]: 1,
    [DIALOGUE_ROLES.MODERATOR]: 2,
    [DIALOGUE_ROLES.EXPERT]: 3,
    [DIALOGUE_ROLES.SUPPORTER]: 4,
    [DIALOGUE_ROLES.LISTENER]: 5
};

/**
 * DialogueRoleAssigner - NPC 对话角色分配器
 * 根据对话类型和 NPC 特性自动分配和管理对话角色
 */
export class DialogueRoleAssigner {
    /**
     * @param {NPCLearningMesh} npcLearningMesh - NPC学习网格实例
     */
    constructor(npcLearningMesh) {
        this.npcLearningMesh = npcLearningMesh;
        this.roleAssignments = new Map(); // dialogueId -> { npcId -> role }
        this.npcSpecialties = new Map(); // npcId -> { role -> score }
    }

    /**
     * 根据对话类型获取默认角色配置
     * @param {string} dialogueType - 对话类型
     * @returns {Object} 角色配置
     */
    getDefaultRoleConfig(dialogueType) {
        const configs = {
            [DIALOGUE_TYPES.TRADE]: {
                roles: [DIALOGUE_ROLES.LEAD, DIALOGUE_ROLES.SUPPORTER],
                leadRatio: 0.4
            },
            [DIALOGUE_TYPES.COMBAT]: {
                roles: [DIALOGUE_ROLES.LEAD, DIALOGUE_ROLES.SUPPORTER, DIALOGUE_ROLES.EXPERT],
                leadRatio: 0.5
            },
            [DIALOGUE_TYPES.SOCIAL]: {
                roles: [DIALOGUE_ROLES.MODERATOR, DIALOGUE_ROLES.SUPPORTER, DIALOGUE_ROLES.LISTENER],
                leadRatio: 0.33
            },
            [DIALOGUE_TYPES.QUEST]: {
                roles: [DIALOGUE_ROLES.LEAD, DIALOGUE_ROLES.EXPERT, DIALOGUE_ROLES.SUPPORTER],
                leadRatio: 0.4
            },
            [DIALOGUE_TYPES.TRAINING]: {
                roles: [DIALOGUE_ROLES.EXPERT, DIALOGUE_ROLES.SUPPORTER, DIALOGUE_ROLES.LISTENER],
                leadRatio: 0.5
            },
            [DIALOGUE_TYPES.EXPLORATION]: {
                roles: [DIALOGUE_ROLES.LEAD, DIALOGUE_ROLES.EXPERT, DIALOGUE_ROLES.SUPPORTER],
                leadRatio: 0.4
            }
        };

        return configs[dialogueType] || configs[DIALOGUE_TYPES.SOCIAL];
    }

    /**
     * 评估 NPC 适合特定角色的分数
     * @param {string} npcId - NPC ID
     * @param {string} role - 角色类型
     * @param {string} dialogueType - 对话类型
     * @returns {number} 适合分数 (0-1)
     */
    evaluateNPCForRole(npcId, role, dialogueType) {
        // 从 mesh 获取 NPC 的共享技能
        const sharedSkills = this.npcLearningMesh.querySharedSkills(npcId);
        let baseScore = 0.5;

        if (sharedSkills.success && sharedSkills.skills.length > 0) {
            // 根据技能数量调整基础分数
            baseScore += Math.min(sharedSkills.skills.length * 0.05, 0.3);
        }

        // 检查 NPC 是否已分配了特长
        if (this.npcSpecialties.has(npcId)) {
            const specialties = this.npcSpecialties.get(npcId);
            if (specialties[role]) {
                baseScore += specialties[role] * 0.2;
            }
        }

        // 根据对话类型调整分数
        const typeBonuses = {
            [DIALOGUE_TYPES.TRADE]: {
                [DIALOGUE_ROLES.EXPERT]: 0.2,
                [DIALOGUE_ROLES.LEAD]: 0.1
            },
            [DIALOGUE_TYPES.COMBAT]: {
                [DIALOGUE_ROLES.EXPERT]: 0.3,
                [DIALOGUE_ROLES.LEAD]: 0.2
            },
            [DIALOGUE_TYPES.SOCIAL]: {
                [DIALOGUE_ROLES.LISTENER]: 0.2,
                [DIALOGUE_ROLES.MODERATOR]: 0.2
            },
            [DIALOGUE_TYPES.QUEST]: {
                [DIALOGUE_ROLES.LEAD]: 0.3,
                [DIALOGUE_ROLES.SUPPORTER]: 0.1
            },
            [DIALOGUE_TYPES.TRAINING]: {
                [DIALOGUE_ROLES.EXPERT]: 0.4,
                [DIALOGUE_ROLES.LEAD]: 0.1
            },
            [DIALOGUE_TYPES.EXPLORATION]: {
                [DIALOGUE_ROLES.LEAD]: 0.2,
                [DIALOGUE_ROLES.EXPERT]: 0.2
            }
        };

        const bonus = typeBonuses[dialogueType]?.[role] || 0;
        return Math.min(baseScore + bonus, 1.0);
    }

    /**
     * 分配角色
     * @param {string[]} npcIds - NPC ID 数组
     * @param {string} dialogueType - 对话类型
     * @returns {Object} 分配结果
     */
    assignRoles(npcIds, dialogueType) {
        if (!npcIds || npcIds.length === 0) {
            return { success: false, reason: 'No NPC IDs provided' };
        }

        if (!dialogueType || !DIALOGUE_TYPES[dialogueType.toUpperCase()]) {
            return { success: false, reason: 'Invalid dialogue type' };
        }

        const upperType = dialogueType.toUpperCase();
        const config = this.getDefaultRoleConfig(upperType);
        const dialogueId = `dialogue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // 评估每个 NPC 对每个角色的适合度
        const scores = [];
        for (const npcId of npcIds) {
            for (const role of config.roles) {
                const score = this.evaluateNPCForRole(npcId, role, upperType);
                scores.push({ npcId, role, score });
            }
        }

        // 按分数降序排序
        scores.sort((a, b) => b.score - a.score);

        // 分配角色（确保每个角色分配给不同的 NPC）
        const assignments = new Map();
        const usedNPCs = new Set();
        const usedRoles = new Set();

        for (const { npcId, role, score } of scores) {
            if (!usedNPCs.has(npcId) && !usedRoles.has(role)) {
                assignments.set(npcId, role);
                usedNPCs.add(npcId);
                usedRoles.add(role);
            }
        }

        // 对于未分配的 NPC，分配 listener 角色
        for (const npcId of npcIds) {
            if (!assignments.has(npcId)) {
                assignments.set(npcId, DIALOGUE_ROLES.LISTENER);
            }
        }

        // 存储分配
        this.roleAssignments.set(dialogueId, Object.fromEntries(assignments));

        return {
            success: true,
            dialogueId,
            dialogueType: upperType,
            assignments: Object.fromEntries(assignments),
            participantCount: npcIds.length
        };
    }

    /**
     * 获取 NPC 在特定对话中的角色
     * @param {string} npcId - NPC ID
     * @param {string} dialogueId - 对话 ID
     * @returns {Object} 角色信息
     */
    getNPCRole(npcId, dialogueId) {
        if (!npcId) {
            return { success: false, reason: 'Missing npcId parameter' };
        }

        if (!dialogueId) {
            return { success: false, reason: 'Missing dialogueId parameter' };
        }

        const assignments = this.roleAssignments.get(dialogueId);
        if (!assignments) {
            return { success: false, reason: 'Dialogue not found' };
        }

        const role = assignments[npcId];
        if (!role) {
            return { success: false, reason: 'NPC not part of this dialogue' };
        }

        return {
            success: true,
            npcId,
            dialogueId,
            role,
            rolePriority: ROLE_PRIORITY[role] || 99
        };
    }

    /**
     * 切换 NPC 角色
     * @param {string} npcId - NPC ID
     * @param {string} dialogueId - 对话 ID
     * @param {string} newRole - 新角色
     * @returns {Object} 切换结果
     */
    switchRole(npcId, dialogueId, newRole) {
        if (!npcId) {
            return { success: false, reason: 'Missing npcId parameter' };
        }

        if (!dialogueId) {
            return { success: false, reason: 'Missing dialogueId parameter' };
        }

        if (!newRole || !DIALOGUE_ROLES[newRole.toUpperCase()]) {
            return { success: false, reason: 'Invalid role' };
        }

        const assignments = this.roleAssignments.get(dialogueId);
        if (!assignments) {
            return { success: false, reason: 'Dialogue not found' };
        }

        const currentRole = assignments[npcId];
        if (!currentRole) {
            return { success: false, reason: 'NPC not part of this dialogue' };
        }

        const upperRole = newRole.toUpperCase();
        const oldRole = currentRole;

        // 更新角色
        assignments[npcId] = upperRole;

        return {
            success: true,
            npcId,
            dialogueId,
            oldRole,
            newRole: upperRole,
            message: `Role switched from ${oldRole} to ${upperRole}`
        };
    }

    /**
     * 设置 NPC 特长（用于角色分配参考）
     * @param {string} npcId - NPC ID
     * @param {string} role - 角色类型
     * @param {number} score - 分数 (0-1)
     * @returns {Object} 设置结果
     */
    setNPCSpecialty(npcId, role, score) {
        if (!npcId) {
            return { success: false, reason: 'Missing npcId parameter' };
        }

        if (!role || !DIALOGUE_ROLES[role.toUpperCase()]) {
            return { success: false, reason: 'Invalid role' };
        }

        if (typeof score !== 'number' || score < 0 || score > 1) {
            return { success: false, reason: 'Score must be between 0 and 1' };
        }

        if (!this.npcSpecialties.has(npcId)) {
            this.npcSpecialties.set(npcId, {});
        }

        const specialties = this.npcSpecialties.get(npcId);
        specialties[role.toUpperCase()] = score;

        return {
            success: true,
            npcId,
            role: role.toUpperCase(),
            score
        };
    }

    /**
     * 获取 NPC 特长
     * @param {string} npcId - NPC ID
     * @returns {Object} 特长信息
     */
    getNPCSpecialties(npcId) {
        if (!npcId) {
            return { success: false, reason: 'Missing npcId parameter' };
        }

        const specialties = this.npcSpecialties.get(npcId) || {};

        return {
            success: true,
            npcId,
            specialties,
            specialtyCount: Object.keys(specialties).length
        };
    }

    /**
     * 获取对话的所有角色分配
     * @param {string} dialogueId - 对话 ID
     * @returns {Object} 分配信息
     */
    getDialogueRoles(dialogueId) {
        if (!dialogueId) {
            return { success: false, reason: 'Missing dialogueId parameter' };
        }

        const assignments = this.roleAssignments.get(dialogueId);
        if (!assignments) {
            return { success: false, reason: 'Dialogue not found' };
        }

        // 按优先级排序
        const sortedAssignments = Object.entries(assignments)
            .map(([npcId, role]) => ({ npcId, role, priority: ROLE_PRIORITY[role] || 99 }))
            .sort((a, b) => a.priority - b.priority);

        return {
            success: true,
            dialogueId,
            assignments: Object.fromEntries(sortedAssignments.map(({ npcId, role }) => [npcId, role])),
            roleDistribution: this.getRoleDistribution(sortedAssignments.map(a => a.role))
        };
    }

    /**
     * 获取角色分布统计
     * @param {string[]} roles - 角色数组
     * @returns {Object} 分布统计
     */
    getRoleDistribution(roles) {
        const distribution = {};
        for (const role of roles) {
            distribution[role] = (distribution[role] || 0) + 1;
        }
        return distribution;
    }

    /**
     * 清除对话角色分配
     * @param {string} dialogueId - 对话 ID
     * @returns {Object} 清除结果
     */
    clearDialogueRoles(dialogueId) {
        if (!dialogueId) {
            return { success: false, reason: 'Missing dialogueId parameter' };
        }

        if (!this.roleAssignments.has(dialogueId)) {
            return { success: false, reason: 'Dialogue not found' };
        }

        const assignments = this.roleAssignments.get(dialogueId);
        this.roleAssignments.delete(dialogueId);

        return {
            success: true,
            dialogueId,
            clearedCount: Object.keys(assignments).length
        };
    }

    /**
     * 重置分配器
     * @returns {Object} 重置结果
     */
    reset() {
        const stats = {
            roleAssignmentsCount: this.roleAssignments.size,
            npcSpecialtiesCount: this.npcSpecialties.size
        };

        this.roleAssignments.clear();
        this.npcSpecialties.clear();

        return {
            success: true,
            cleared: stats
        };
    }

    /**
     * 获取统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        let totalAssignments = 0;
        const roleCounts = {};

        for (const assignments of this.roleAssignments.values()) {
            for (const role of Object.values(assignments)) {
                totalAssignments++;
                roleCounts[role] = (roleCounts[role] || 0) + 1;
            }
        }

        return {
            totalDialogues: this.roleAssignments.size,
            totalAssignments,
            roleCounts,
            npcSpecialtiesCount: this.npcSpecialties.size
        };
    }
}

export default DialogueRoleAssigner;