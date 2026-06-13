/**
 * NPCBudgetController.js - NPC资源预算控制器
 * V291 Iteration 6/9 - NPC Budget Control Integration
 * 
 * 核心机制：
 * 1. 为每个NPC的每个类别分配预算
 * 2. 追踪预算使用情况
 * 3. 支持预算重新分配
 * 4. 检查预算是否足够
 */

import { ExperienceTracker } from './ExperienceTracker.js';
import { SkillCrystallization } from './SkillCrystallization.js';

/**
 * NPCBudgetController - NPC资源预算控制器
 * 自动资源分配，追踪预算使用效率
 */
export class NPCBudgetController {
    /**
     * @param {ExperienceTracker} experienceTracker - 经验追踪器
     * @param {SkillCrystallization} skillCrystallization - 技能结晶化系统
     */
    constructor(experienceTracker, skillCrystallization) {
        this.experienceTracker = experienceTracker;
        this.skillCrystallization = skillCrystallization;
        this.budgets = new Map(); // npcId -> { category -> { allocated, spent, remaining } }
    }

    /**
     * 分配预算给NPC的指定类别
     * @param {string} npcId - NPC ID
     * @param {string} category - 预算类别 (e.g., 'training', 'skill', 'evolution')
     * @param {number} amount - 分配金额
     * @returns {Object} 分配结果
     */
    allocateBudget(npcId, category, amount) {
        if (typeof amount !== 'number' || amount < 0) {
            return { success: false, reason: 'Invalid amount' };
        }

        if (!this.budgets.has(npcId)) {
            this.budgets.set(npcId, new Map());
        }

        const npcBudgets = this.budgets.get(npcId);
        
        if (!npcBudgets.has(category)) {
            npcBudgets.set(category, { allocated: 0, spent: 0, remaining: 0 });
        }

        const budget = npcBudgets.get(category);
        budget.allocated += amount;
        budget.remaining = budget.allocated - budget.spent;

        return {
            success: true,
            npcId,
            category,
            allocated: budget.allocated,
            spent: budget.spent,
            remaining: budget.remaining
        };
    }

    /**
     * 获取NPC的预算状态
     * @param {string} npcId - NPC ID
     * @returns {Object} 预算状态
     */
    getBudgetStatus(npcId) {
        if (!this.budgets.has(npcId)) {
            return { success: false, reason: 'NPC not found', categories: [] };
        }

        const npcBudgets = this.budgets.get(npcId);
        const categories = [];

        npcBudgets.forEach((budget, category) => {
            categories.push({
                category,
                allocated: budget.allocated,
                spent: budget.spent,
                remaining: budget.remaining,
                utilizationRate: budget.allocated > 0 
                    ? Math.round((budget.spent / budget.allocated) * 100) / 100 
                    : 0
            });
        });

        const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0);
        const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
        const totalRemaining = categories.reduce((sum, c) => sum + c.remaining, 0);

        return {
            success: true,
            npcId,
            categories,
            summary: {
                totalAllocated,
                totalSpent,
                totalRemaining,
                overallUtilizationRate: totalAllocated > 0 
                    ? Math.round((totalSpent / totalAllocated) * 100) / 100 
                    : 0
            }
        };
    }

    /**
     * 重新分配预算（覆盖指定类别的预算）
     * @param {string} npcId - NPC ID
     * @param {string} category - 预算类别
     * @param {number} newAmount - 新的分配金额
     * @returns {Object} 重新分配结果
     */
    reallocateBudget(npcId, category, newAmount) {
        if (typeof newAmount !== 'number' || newAmount < 0) {
            return { success: false, reason: 'Invalid amount' };
        }

        if (!this.budgets.has(npcId)) {
            this.budgets.set(npcId, new Map());
        }

        const npcBudgets = this.budgets.get(npcId);
        
        if (!npcBudgets.has(category)) {
            npcBudgets.set(category, { allocated: 0, spent: 0, remaining: 0 });
        }

        const budget = npcBudgets.get(category);
        const oldAllocated = budget.allocated;
        const diff = newAmount - oldAllocated;
        
        budget.allocated = newAmount;
        budget.remaining = budget.allocated - budget.spent;

        return {
            success: true,
            npcId,
            category,
            oldAllocated,
            newAllocated: newAmount,
            difference: diff,
            remaining: budget.remaining
        };
    }

    /**
     * 记录预算支出
     * @param {string} npcId - NPC ID
     * @param {string} category - 预算类别
     * @param {number} amount - 支出金额
     * @returns {Object} 支出结果
     */
    spendBudget(npcId, category, amount) {
        if (typeof amount !== 'number' || amount <= 0) {
            return { success: false, reason: 'Invalid amount' };
        }

        if (!this.budgets.has(npcId)) {
            return { success: false, reason: 'NPC not found' };
        }

        const npcBudgets = this.budgets.get(npcId);
        
        if (!npcBudgets.has(category)) {
            return { success: false, reason: 'Category not found' };
        }

        const budget = npcBudgets.get(category);
        
        if (budget.remaining < amount) {
            return { 
                success: false, 
                reason: 'Insufficient budget',
                required: amount,
                available: budget.remaining
            };
        }

        budget.spent += amount;
        budget.remaining = budget.allocated - budget.spent;

        return {
            success: true,
            npcId,
            category,
            spent: budget.spent,
            remaining: budget.remaining
        };
    }

    /**
     * 检查预算是否足够
     * @param {string} npcId - NPC ID
     * @param {string} category - 预算类别
     * @param {number} requiredAmount - 所需金额
     * @returns {Object} 检查结果
     */
    checkBudget(npcId, category, requiredAmount) {
        if (typeof requiredAmount !== 'number' || requiredAmount < 0) {
            return { success: false, reason: 'Invalid required amount' };
        }

        if (!this.budgets.has(npcId)) {
            return { success: false, reason: 'NPC not found', sufficient: false, available: 0 };
        }

        const npcBudgets = this.budgets.get(npcId);
        
        if (!npcBudgets.has(category)) {
            return { success: false, reason: 'Category not found', sufficient: false, available: 0 };
        }

        const budget = npcBudgets.get(category);
        const sufficient = budget.remaining >= requiredAmount;

        return {
            success: true,
            npcId,
            category,
            required: requiredAmount,
            available: budget.remaining,
            sufficient
        };
    }

    /**
     * 获取所有NPC的预算概览
     * @returns {Object} 所有NPC预算概览
     */
    getAllBudgets() {
        const overview = [];
        
        this.budgets.forEach((npcBudgets, npcId) => {
            let totalAllocated = 0;
            let totalSpent = 0;
            
            npcBudgets.forEach((budget) => {
                totalAllocated += budget.allocated;
                totalSpent += budget.spent;
            });

            overview.push({
                npcId,
                totalAllocated,
                totalSpent,
                totalRemaining: totalAllocated - totalSpent
            });
        });

        return {
            success: true,
            totalNPCs: overview.length,
            npcs: overview
        };
    }

    /**
     * 清空指定NPC的预算
     * @param {string} npcId - NPC ID
     * @returns {Object} 清除结果
     */
    clearBudget(npcId) {
        if (!this.budgets.has(npcId)) {
            return { success: false, reason: 'NPC not found' };
        }

        this.budgets.delete(npcId);
        return { success: true, cleared: true };
    }

    /**
     * 清空指定NPC指定类别的预算
     * @param {string} npcId - NPC ID
     * @param {string} category - 预算类别
     * @returns {Object} 清除结果
     */
    clearCategory(npcId, category) {
        if (!this.budgets.has(npcId)) {
            return { success: false, reason: 'NPC not found' };
        }

        const npcBudgets = this.budgets.get(npcId);
        
        if (!npcBudgets.has(category)) {
            return { success: false, reason: 'Category not found' };
        }

        npcBudgets.delete(category);
        return { success: true, cleared: true };
    }
}

export default NPCBudgetController;