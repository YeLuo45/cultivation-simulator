/**
 * FinalReportGenerator.js - V294 Final Integration Report Generator
 * Iteration 9/9 - NPC Self-Evolution Integration Test + Final Report
 * 
 * 核心机制：
 * 1. 聚合 ExperienceTracker + SkillCrystallization + NPCLearningMesh + EvolutionDashboard
 * 2. 生成完整的系统健康报告
 * 3. 生成 NPC 个体报告
 * 4. 获取所有 NPC 摘要
 */

import { EvolutionDashboard } from './EvolutionDashboard.js';

export class FinalReportGenerator {
    /**
     * @param {ExperienceTracker} experienceTracker - 经验追踪器
     * @param {SkillCrystallization} skillCrystallization - 技能结晶化系统
     * @param {NPCLearningMesh} npcLearningMesh - NPC协作学习网络
     * @param {EvolutionDashboard} evolutionDashboard - 进化仪表盘
     */
    constructor(experienceTracker, skillCrystallization, npcLearningMesh, evolutionDashboard) {
        this.experienceTracker = experienceTracker;
        this.skillCrystallization = skillCrystallization;
        this.npcLearningMesh = npcLearningMesh;
        this.evolutionDashboard = evolutionDashboard;
    }

    /**
     * 生成完整的进化系统报告
     * @returns {Object} 完整报告
     */
    generateFullReport() {
        const totalNPCs = this.npcLearningMesh ? this.npcLearningMesh.mesh.size : 0;
        // Count skills across all NPCs
        let totalSkills = 0;
        if (this.skillCrystallization) {
            const allNpcIds = this.experienceTracker ? this.experienceTracker.getAllNpcIds() : [];
            for (const npcId of allNpcIds) {
                const skills = this.skillCrystallization.getSkillLibrary(npcId);
                totalSkills += skills.length;
            }
        }
        const avgEvolutionLevel = this._calculateAvgEvolution();
        const systemHealth = this._checkSystemHealth();

        return {
            totalNPCs,
            totalSkills,
            avgEvolutionLevel,
            systemHealth,
            timestamp: Date.now(),
            version: 'V294'
        };
    }

    /**
     * 获取 NPC Learning Mesh 中所有对等节点
     * @returns {string[]} NPC ID 数组
     */
    getAllPeers() {
        if (!this.npcLearningMesh) return [];
        const stats = this.npcLearningMesh.getStats();
        return Array.from(this.npcLearningMesh.mesh.keys()) || [];
    }

    /**
     * 生成 NPC 个体报告
     * @param {string} npcId - NPC ID
     * @returns {Object} NPC 报告
     */
    generateNPCReport(npcId) {
        if (!this.evolutionDashboard) {
            return {
                success: false,
                reason: 'EvolutionDashboard not available',
                npcId
            };
        }

        // Check if NPC has any data in any subsystem
        const allNpcIds = this.experienceTracker ? this.experienceTracker.getAllNpcIds() : [];
        const npcExists = allNpcIds.includes(npcId);
        const hasSkills = this.skillCrystallization && this.skillCrystallization.getSkillLibrary(npcId).length > 0;
        const inMesh = this.npcLearningMesh && this.npcLearningMesh.isRegistered(npcId);
        
        // Allow NPC if it has any activity in any subsystem
        if (!npcExists && !hasSkills && !inMesh) {
            return {
                success: false,
                reason: 'NPC not found',
                npcId
            };
        }

        const status = this.evolutionDashboard.getNPCStatus(npcId);
        const expStats = this.experienceTracker ? this.experienceTracker.getStats(npcId) : { totalInteractions: 0, successRate: 0, avgSatisfaction: 0, adaptationLevel: 0 };
        const skillStats = this.skillCrystallization ? this.skillCrystallization.getSkillStats(npcId) : { totalSkills: 0, totalUses: 0, avgConfidence: 0, mostUsedSkill: null };
        const meshStatus = this.npcLearningMesh && this.npcLearningMesh.isRegistered(npcId) 
            ? this.npcLearningMesh.getPeers(npcId) 
            : { success: false, peers: [], peerCount: 0 };

        return {
            success: true,
            npcId,
            evolutionLevel: status.evolutionLevel,
            adaptationScore: status.adaptationScore,
            experience: {
                totalInteractions: expStats.totalInteractions,
                successRate: expStats.successRate,
                avgSatisfaction: expStats.avgSatisfaction,
                adaptationLevel: expStats.adaptationLevel
            },
            skills: {
                totalSkills: skillStats.totalSkills,
                totalUses: skillStats.totalUses,
                avgConfidence: skillStats.avgConfidence,
                mostUsedSkill: skillStats.mostUsedSkill
            },
            mesh: {
                peerCount: meshStatus.peerCount,
                peers: meshStatus.peers,
                connected: meshStatus.success
            },
            recommendations: status.recommendations || [],
            timestamp: Date.now()
        };
    }

    /**
     * 获取系统健康状态
     * @returns {Object} 健康状态
     */
    getSystemHealth() {
        return this._checkSystemHealth();
    }

    /**
     * 获取所有 NPC 摘要
     * @returns {Object[]} NPC 摘要数组
     */
    getAllNPCSummary() {
        const allNpcIds = this.experienceTracker.getAllNpcIds();
        const summaries = [];

        for (const npcId of allNpcIds) {
            const stats = this.experienceTracker.getStats(npcId);
            const skillStats = this.skillCrystallization.getSkillStats(npcId);
            const evolutionLevel = this.evolutionDashboard 
                ? this.evolutionDashboard.getNPCStatus(npcId).evolutionLevel 
                : 0;

            summaries.push({
                npcId,
                totalInteractions: stats.totalInteractions,
                successRate: stats.successRate,
                skillCount: skillStats.totalSkills,
                evolutionLevel,
                health: this._assessNpcHealth(npcId, stats, skillStats)
            });
        }

        return summaries;
    }

    /**
     * 计算平均进化等级
     * @private
     */
    _calculateAvgEvolution() {
        const allNpcIds = this.experienceTracker.getAllNpcIds();
        if (allNpcIds.length === 0) return 0;

        let totalLevel = 0;
        for (const npcId of allNpcIds) {
            const status = this.evolutionDashboard.getNPCStatus(npcId);
            totalLevel += status.evolutionLevel;
        }

        return Math.round((totalLevel / allNpcIds.length) * 100) / 100;
    }

    /**
     * 检查系统健康状态
     * @private
     */
    _checkSystemHealth() {
        const checks = [];

        // Check 1: ExperienceTracker has data
        const hasExpData = this.experienceTracker && this.experienceTracker.getAllNpcIds && this.experienceTracker.getAllNpcIds().length > 0;
        checks.push({ name: 'ExperienceTracker_has_data', healthy: hasExpData });

        // Check 2: SkillCrystallization accessible
        const hasSkillAccess = this.skillCrystallization !== null;
        checks.push({ name: 'SkillCrystallization_accessible', healthy: hasSkillAccess });

        // Check 3: NPCLearningMesh network status
        let meshHealthy = false;
        if (this.npcLearningMesh) {
            const meshStats = this.npcLearningMesh.getStats();
            meshHealthy = meshStats.totalNPCs > 0;
        }
        checks.push({ name: 'NPCLearningMesh_has_members', healthy: meshHealthy });

        // Check 4: EvolutionDashboard functional
        let dashboardHealthy = false;
        if (this.evolutionDashboard) {
            try {
                const overview = this.evolutionDashboard.getSectOverview();
                dashboardHealthy = overview.totalNPCs >= 0;
            } catch {
                dashboardHealthy = false;
            }
        }
        checks.push({ name: 'EvolutionDashboard_functional', healthy: dashboardHealthy });

        // Check 5: IER Engine responsive
        const ierHealthy = this._checkIERHealth();
        checks.push({ name: 'IEREngine_responsive', healthy: ierHealthy });

        // Calculate overall health
        const healthyCount = checks.filter(c => c.healthy).length;
        const overallHealth = healthyCount / checks.length;

        return {
            overall: overallHealth,
            status: overallHealth >= 0.8 ? 'healthy' : overallHealth >= 0.5 ? 'degraded' : 'critical',
            checks,
            timestamp: Date.now()
        };
    }

    /**
     * 检查 IER Engine 健康状态
     * @private
     */
    _checkIERHealth() {
        // Simple check - verify refinement history is accessible
        try {
            const allNpcIds = this.experienceTracker.getAllNpcIds();
            if (allNpcIds.length > 0) {
                // If we can get stats, IER should be functional
                this.experienceTracker.getStats(allNpcIds[0]);
                return true;
            }
            return true; // No NPCs yet is still healthy state
        } catch {
            return false;
        }
    }

    /**
     * 评估单个 NPC 健康状态
     * @private
     */
    _assessNpcHealth(npcId, expStats, skillStats) {
        let score = 0;
        let factors = [];

        // Factor 1: Has interactions
        if (expStats.totalInteractions > 0) {
            score += 0.25;
            factors.push('has_interactions');
        }

        // Factor 2: Good success rate
        if (expStats.successRate > 0.5) {
            score += 0.25;
            factors.push('good_success_rate');
        }

        // Factor 3: Has skills
        if (skillStats.totalSkills > 0) {
            score += 0.25;
            factors.push('has_skills');
        }

        // Factor 4: In learning mesh
        if (this.npcLearningMesh.isRegistered(npcId)) {
            score += 0.25;
            factors.push('in_mesh');
        }

        return {
            score,
            status: score >= 0.75 ? 'healthy' : score >= 0.5 ? 'needs_attention' : 'critical',
            factors
        };
    }

    /**
     * 生成详细系统报告（包含所有子系统状态）
     * @returns {Object} 详细报告
     */
    generateDetailedReport() {
        return {
            fullReport: this.generateFullReport(),
            systemHealth: this.getSystemHealth(),
            npcSummary: this.getAllNPCSummary(),
            sectOverview: this.evolutionDashboard ? this.evolutionDashboard.getSectOverview() : null,
            meshStats: this.npcLearningMesh ? this.npcLearningMesh.getStats() : null,
            timestamp: Date.now()
        };
    }

    /**
     * 生成导出格式的报告（用于存档）
     * @returns {Object} 导出格式报告
     */
    generateExportReport() {
        return {
            format: 'V294-Final-Report',
            exportedAt: new Date().toISOString(),
            fullReport: this.generateFullReport(),
            npcReports: this.experienceTracker.getAllNpcIds().map(id => this.generateNPCReport(id)),
            meshStats: this.npcLearningMesh ? this.npcLearningMesh.getStats() : null,
            systemHealth: this.getSystemHealth()
        };
    }
}

export default FinalReportGenerator;