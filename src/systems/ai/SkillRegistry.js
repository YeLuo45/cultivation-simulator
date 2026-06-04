/**
 * SkillRegistry.js - 全局技能注册表
 * V282 Iteration 6/9 - NPC Collaborative Learning Mesh
 * 
 * 核心机制：
 * 1. 管理所有 NPC 共享技能
 * 2. 技能模式匹配与发现
 * 3. 技能使用追踪与置信度更新
 */

/**
 * SkillRegistry - 全局技能注册表
 * 管理所有 NPC 共享技能，支持模式匹配和置信度追踪
 */
export class SkillRegistry {
    /**
     * @param {number} defaultConfidence - 默认置信度，默认0.5
     */
    constructor(defaultConfidence = 0.5) {
        this.defaultConfidence = defaultConfidence;
        this.skills = new Map(); // skillId -> { id, pattern, owner, usage, confidence }
    }

    /**
     * 注册技能到注册表
     * @param {Object} skill - 技能对象 { id, pattern, owner, usage?, confidence? }
     * @returns {Object} 注册结果
     */
    register(skill) {
        if (!skill.id || !skill.pattern) {
            return { success: false, reason: 'Missing required fields: id, pattern' };
        }

        if (this.skills.has(skill.id)) {
            return { success: false, reason: 'Skill already registered', skillId: skill.id };
        }

        const skillEntry = {
            id: skill.id,
            pattern: skill.pattern,
            owner: skill.owner || null,
            usage: skill.usage || 0,
            confidence: skill.confidence ?? this.defaultConfidence,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.skills.set(skill.id, skillEntry);
        return { success: true, skill: skillEntry };
    }

    /**
     * 获取技能信息
     * @param {string} skillId - 技能ID
     * @returns {Object|null} 技能信息
     */
    get(skillId) {
        return this.skills.get(skillId) || null;
    }

    /**
     * 检查技能是否存在
     * @param {string} skillId - 技能ID
     * @returns {boolean}
     */
    has(skillId) {
        return this.skills.has(skillId);
    }

    /**
     * 根据模式查找技能（模糊匹配）
     * @param {string} pattern - 模式字符串
     * @returns {Object[]} 匹配技能数组
     */
    findByPattern(pattern) {
        const results = [];
        const patternLower = pattern.toLowerCase();

        for (const skill of this.skills.values()) {
            if (skill.pattern.toLowerCase().includes(patternLower)) {
                results.push(skill);
            }
        }

        return results;
    }

    /**
     * 获取所有注册技能
     * @returns {Object[]} 所有技能数组
     */
    getAll() {
        return Array.from(this.skills.values());
    }

    /**
     * 更新技能使用次数
     * @param {string} skillId - 技能ID
     * @param {number} usage - 增加的使用次数，默认1
     * @returns {Object} 更新结果
     */
    updateUsage(skillId, usage = 1) {
        const skill = this.skills.get(skillId);

        if (!skill) {
            return { success: false, reason: 'Skill not found' };
        }

        skill.usage += usage;
        skill.updatedAt = Date.now();
        return { success: true, skill };
    }

    /**
     * 更新技能置信度
     * @param {string} skillId - 技能ID
     * @param {number} confidence - 新置信度值 (0-1)
     * @returns {Object} 更新结果
     */
    updateConfidence(skillId, confidence) {
        const skill = this.skills.get(skillId);

        if (!skill) {
            return { success: false, reason: 'Skill not found' };
        }

        const clampedConfidence = Math.max(0, Math.min(1, confidence));
        skill.confidence = clampedConfidence;
        skill.updatedAt = Date.now();
        return { success: true, skill };
    }

    /**
     * 删除技能
     * @param {string} skillId - 技能ID
     * @returns {Object} 删除结果
     */
    unregister(skillId) {
        if (!this.skills.has(skillId)) {
            return { success: false, reason: 'Skill not found' };
        }

        const skill = this.skills.get(skillId);
        this.skills.delete(skillId);
        return { success: true, removed: skill };
    }

    /**
     * 获取技能数量
     * @returns {number}
     */
    size() {
        return this.skills.size;
    }

    /**
     * 清空注册表
     * @returns {Object} 清空结果
     */
    clear() {
        const count = this.skills.size;
        this.skills.clear();
        return { success: true, cleared: count };
    }

    /**
     * 获取注册技能数量统计
     * @returns {Object} 统计信息
     */
    getStats() {
        const skills = this.getAll();
        const totalUsage = skills.reduce((sum, s) => sum + s.usage, 0);
        const avgConfidence = skills.length > 0
            ? skills.reduce((sum, s) => sum + s.confidence, 0) / skills.length
            : 0;

        return {
            totalSkills: skills.length,
            totalUsage,
            avgConfidence: Math.round(avgConfidence * 100) / 100,
            byOwner: this.getOwnerDistribution()
        };
    }

    /**
     * 获取按所有者分布的技能统计
     * @returns {Map} owner -> count
     */
    getOwnerDistribution() {
        const distribution = new Map();

        for (const skill of this.skills.values()) {
            const owner = skill.owner || 'anonymous';
            distribution.set(owner, (distribution.get(owner) || 0) + 1);
        }

        return distribution;
    }

    /**
     * 获取最高使用的技能
     * @param {number} limit - 返回数量限制，默认1
     * @returns {Object[]} 按使用次数排序的技能数组
     */
    getMostUsed(limit = 1) {
        return this.getAll()
            .sort((a, b) => b.usage - a.usage)
            .slice(0, limit);
    }

    /**
     * 获取最高置信度的技能
     * @param {number} limit - 返回数量限制，默认1
     * @returns {Object[]} 按置信度排序的技能数组
     */
    getMostConfident(limit = 1) {
        return this.getAll()
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, limit);
    }
}

export default SkillRegistry;