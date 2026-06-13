/**
 * EvolutionMetricsDashboard.js - NPC 进化指标仪表板
 * V292 Iteration 7/9 - NPC Evolution Metrics Dashboard
 * 
 * 来源: claude-code dashboard design
 */

import { EvolutionDashboard } from './EvolutionDashboard.js';
import { NPCLearningMesh } from './NPCLearningMesh.js';

export class EvolutionMetricsDashboard {
    constructor(experienceTracker, skillCrystallization, npcLearningMesh, evolutionDashboard) {
        this.experienceTracker = experienceTracker;
        this.skillCrystallization = skillCrystallization;
        this.npcLearningMesh = npcLearningMesh;
        this.evolutionDashboard = evolutionDashboard;
    }

    getNPCMetrics(npcId) {
        const stats = this.experienceTracker.getStats(npcId);
        const skills = this.skillCrystallization.getSkillLibrary(npcId);
        const status = (this.evolutionDashboard && typeof this.evolutionDashboard.getNPCStatus === 'function')
            ? this.evolutionDashboard.getNPCStatus(npcId) : {};
        const meshPeers = this.npcLearningMesh.getPeers(npcId);
        const peerList = (typeof meshPeers === 'object' && meshPeers != null && Array.isArray(meshPeers.peers))
            ? meshPeers.peers : (Array.isArray(meshPeers) ? meshPeers : []);
        
        return {
            npcId,
            evolutionLevel: stats.evolutionLevel || 1,
            totalInteractions: stats.totalInteractions || 0,
            adaptationScore: stats.adaptationLevel || 0,
            skillCount: Array.isArray(skills) ? skills.length : 0,
            meshConnections: Array.isArray(peerList) ? peerList.length : 0,
            successRate: stats.successRate || 0,
            lastActive: stats.lastInteraction || null
        };
    }

    getSectMetrics() {
        const overview = (this.evolutionDashboard && typeof this.evolutionDashboard.getSectOverview === 'function')
            ? this.evolutionDashboard.getSectOverview() : { totalNPCs: 0 };
        const allSkills = this.skillCrystallization.getAllSkills ? this.skillCrystallization.getAllSkills() : [];
        
        return {
            totalNPCs: overview.totalNPCs || 0,
            avgEvolutionLevel: overview.avgEvolutionLevel || 0,
            totalSkills: Array.isArray(allSkills) ? allSkills.length : 0,
            totalMeshConnections: this._countTotalMeshConnections()
        };
    }

    generateTrendReport(npcId, timeRange) {
        const records = this.experienceTracker.getRecords(npcId) || [];
        const recentRecords = records.slice(-timeRange);
        
        let successCount = 0;
        let totalSatisfaction = 0;
        
        recentRecords.forEach(r => {
            if (r.outcome && r.outcome.success) successCount++;
            if (r.outcome && r.outcome.satisfaction) totalSatisfaction += r.outcome.satisfaction;
        });
        
        return {
            npcId,
            timeRange,
            recordCount: recentRecords.length,
            successRate: recentRecords.length > 0 ? successCount / recentRecords.length : 0,
            avgSatisfaction: recentRecords.length > 0 ? totalSatisfaction / recentRecords.length : 0,
            trend: recentRecords.length >= 2 ? this._calculateTrend(recentRecords) : 'stable'
        };
    }

    getMilestones(npcId) {
        const stats = this.experienceTracker.getStats(npcId);
        const milestones = [];
        
        if (stats.totalInteractions >= 10) milestones.push({ type: 'active', count: stats.totalInteractions });
        if (stats.adaptationLevel >= 5) milestones.push({ type: 'adapted', level: stats.adaptationLevel });
        
        const skills = this.skillCrystallization.getSkillLibrary(npcId);
        if (Array.isArray(skills) && skills.length >= 3) {
            milestones.push({ type: 'skillful', count: skills.length });
        }
        
        return milestones;
    }

    _countTotalMeshConnections() {
        return 0;
    }

    _calculateTrend(records) {
        if (records.length < 2) return 'stable';
        const half = Math.floor(records.length / 2);
        const firstHalf = records.slice(0, half);
        const secondHalf = records.slice(half);
        
        let firstSuccess = 0, secondSuccess = 0;
        firstHalf.forEach(r => { if (r.outcome && r.outcome.success) firstSuccess++; });
        secondHalf.forEach(r => { if (r.outcome && r.outcome.success) secondSuccess++; });
        
        const firstRate = firstHalf.length > 0 ? firstSuccess / firstHalf.length : 0;
        const secondRate = secondHalf.length > 0 ? secondSuccess / secondHalf.length : 0;
        
        if (secondRate > firstRate + 0.1) return 'improving';
        if (secondRate < firstRate - 0.1) return 'declining';
        return 'stable';
    }
}