/**
 * BudgetAnalytics.js - 预算分析器
 * V291 Iteration 6/9 - NPC Budget Control Integration
 * 
 * 核心机制：
 * 1. 分析预算使用效率
 * 2. 生成预算优化建议
 * 3. 维护预算历史记录
 */

import { NPCBudgetController } from './NPCBudgetController.js';

/**
 * BudgetAnalytics - 预算分析器
 * 分析NPC预算使用效率并生成优化建议
 */
export class BudgetAnalytics {
    /**
     * @param {NPCBudgetController} npcBudgetController - NPC预算控制器
     */
    constructor(npcBudgetController) {
        this.npcBudgetController = npcBudgetController;
        this.history = new Map(); // npcId -> budget history entries
    }

    /**
     * 记录预算状态到历史
     * @param {string} npcId - NPC ID
     * @param {string} category - 预算类别
     * @param {Object} status - 预算状态
     */
    _recordHistory(npcId, category, status) {
        if (!this.history.has(npcId)) {
            this.history.set(npcId, []);
        }

        const history = this.history.get(npcId);
        history.push({
            timestamp: Date.now(),
            category,
            allocated: status.allocated,
            spent: status.spent,
            remaining: status.remaining,
            utilizationRate: status.utilizationRate || 0
        });

        // 保持历史记录不超过1000条
        if (history.length > 1000) {
            history.shift();
        }
    }

    /**
     * 分析预算使用效率
     * @param {string} npcId - NPC ID
     * @returns {Object} 效率分析结果
     */
    analyzeEfficiency(npcId) {
        const status = this.npcBudgetController.getBudgetStatus(npcId);
        
        if (!status.success) {
            return { success: false, reason: status.reason };
        }

        const analysis = {
            success: true,
            npcId,
            categories: [],
            overallScore: 0
        };

        let totalEfficiencyScore = 0;
        let categoryCount = 0;

        status.categories.forEach(cat => {
            const efficiencyScore = this._calculateEfficiencyScore(cat);
            totalEfficiencyScore += efficiencyScore;
            categoryCount++;

            analysis.categories.push({
                category: cat.category,
                utilizationRate: cat.utilizationRate,
                efficiencyScore,
                status: this._getEfficiencyStatus(efficiencyScore),
                spent: cat.spent,
                allocated: cat.allocated
            });
        });

        analysis.overallScore = categoryCount > 0 
            ? Math.round((totalEfficiencyScore / categoryCount) * 100) / 100 
            : 0;

        return analysis;
    }

    /**
     * 计算效率分数 (0-1)
     * @private
     */
    _calculateEfficiencyScore(category) {
        const utilization = category.utilizationRate;
        
        // 理想使用率在60%-90%之间，效率最高
        if (utilization >= 0.6 && utilization <= 0.9) {
            return 1.0;
        }
        
        // 使用率超过90%，效率良好但可能资源不足
        if (utilization > 0.9) {
            return Math.max(0.5, 1.0 - (utilization - 0.9) * 2);
        }
        
        // 使用率低于60%，效率较低
        if (utilization < 0.6) {
            return utilization + 0.4; // 最低0.4分
        }
        
        return 0.5;
    }

    /**
     * 获取效率状态描述
     * @private
     */
    _getEfficiencyStatus(score) {
        if (score >= 0.9) return 'excellent';
        if (score >= 0.7) return 'good';
        if (score >= 0.5) return 'fair';
        return 'poor';
    }

    /**
     * 生成预算优化建议
     * @param {string} npcId - NPC ID
     * @returns {Object[]} 优化建议列表
     */
    generateOptimizationSuggestions(npcId) {
        const efficiency = this.analyzeEfficiency(npcId);
        const suggestions = [];

        if (!efficiency.success) {
            return suggestions;
        }

        efficiency.categories.forEach(cat => {
            if (cat.utilizationRate > 0.95) {
                suggestions.push({
                    category: cat.category,
                    priority: 'high',
                    type: 'increase_budget',
                    reason: `Utilization rate is very high (${(cat.utilizationRate * 100).toFixed(1)}%), consider increasing budget`,
                    currentAllocation: cat.allocated,
                    suggestedIncrease: Math.ceil(cat.allocated * 0.2)
                });
            }

            if (cat.utilizationRate < 0.3 && cat.allocated > 100) {
                suggestions.push({
                    category: cat.category,
                    priority: 'medium',
                    type: 'decrease_budget',
                    reason: `Utilization rate is very low (${(cat.utilizationRate * 100).toFixed(1)}%), consider reducing budget`,
                    currentAllocation: cat.allocated,
                    suggestedDecrease: Math.floor(cat.allocated * 0.3)
                });
            }

            if (cat.allocated === 0) {
                suggestions.push({
                    category: cat.category,
                    priority: 'low',
                    type: 'allocate_budget',
                    reason: 'No budget allocated for this category',
                    suggestedAllocation: 100
                });
            }
        });

        // 按优先级排序
        suggestions.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        return suggestions;
    }

    /**
     * 获取预算历史
     * @param {string} npcId - NPC ID
     * @param {number} limit - 返回记录数量限制
     * @returns {Object[]} 历史记录列表
     */
    getBudgetHistory(npcId, limit = 100) {
        if (!this.history.has(npcId)) {
            return [];
        }

        const history = this.history.get(npcId);
        const limited = history.slice(-limit);

        return limited.map(entry => ({
            timestamp: entry.timestamp,
            category: entry.category,
            allocated: entry.allocated,
            spent: entry.spent,
            remaining: entry.remaining,
            utilizationRate: entry.utilizationRate
        }));
    }

    /**
     * 记录当前预算状态到历史
     * @param {string} npcId - NPC ID
     */
    snapshot(npcId) {
        const status = this.npcBudgetController.getBudgetStatus(npcId);
        
        if (!status.success) {
            return { success: false, reason: status.reason };
        }

        status.categories.forEach(cat => {
            this._recordHistory(npcId, cat.category, cat);
        });

        return { success: true, snapshotCount: status.categories.length };
    }

    /**
     * 获取效率趋势分析
     * @param {string} npcId - NPC ID
     * @param {string} category - 预算类别
     * @param {number} windowSize - 分析窗口大小
     * @returns {Object} 趋势分析结果
     */
    getEfficiencyTrend(npcId, category, windowSize = 10) {
        if (!this.history.has(npcId)) {
            return { success: false, reason: 'No history available' };
        }

        const history = this.history.get(npcId).filter(h => h.category === category);
        
        if (history.length < 2) {
            return { success: false, reason: 'Insufficient history data' };
        }

        const recentHistory = history.slice(-windowSize);
        
        let totalUtilization = 0;
        let increasing = 0;
        let decreasing = 0;

        for (let i = 1; i < recentHistory.length; i++) {
            totalUtilization += recentHistory[i].utilizationRate;
            
            if (recentHistory[i].utilizationRate > recentHistory[i - 1].utilizationRate) {
                increasing++;
            } else if (recentHistory[i].utilizationRate < recentHistory[i - 1].utilizationRate) {
                decreasing++;
            }
        }

        const avgUtilization = totalUtilization / recentHistory.length;
        const trend = increasing > decreasing ? 'increasing' : decreasing > increasing ? 'decreasing' : 'stable';

        return {
            success: true,
            npcId,
            category,
            trend,
            averageUtilization: Math.round(avgUtilization * 100) / 100,
            dataPoints: recentHistory.length
        };
    }

    /**
     * 清空指定NPC的历史记录
     * @param {string} npcId - NPC ID
     * @returns {Object} 清除结果
     */
    clearHistory(npcId) {
        if (!this.history.has(npcId)) {
            return { success: false, reason: 'NPC not found' };
        }

        this.history.delete(npcId);
        return { success: true, cleared: true };
    }

    /**
     * 获取所有NPC的分析概览
     * @returns {Object} 分析概览
     */
    getAllAnalysis() {
        const allBudgets = this.npcBudgetController.getAllBudgets();
        
        if (!allBudgets.success || allBudgets.totalNPCs === 0) {
            return { success: true, totalNPCs: 0, analyses: [] };
        }

        const analyses = allBudgets.npcs.map(npc => {
            const efficiency = this.analyzeEfficiency(npc.npcId);
            return {
                npcId: npc.npcId,
                overallScore: efficiency.overallScore,
                categoryCount: efficiency.categories.length
            };
        });

        return {
            success: true,
            totalNPCs: analyses.length,
            analyses
        };
    }
}

export default BudgetAnalytics;