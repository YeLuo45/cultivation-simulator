/**
 * NPCBudgetController.test.js - NPC预算控制器测试
 * V291 Iteration 6/9 - NPC Budget Control Integration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NPCBudgetController } from '../../../systems/ai/NPCBudgetController.js';
import { ExperienceTracker } from '../../../systems/ai/ExperienceTracker.js';
import { SkillCrystallization } from '../../../systems/ai/SkillCrystallization.js';

describe('NPCBudgetController - 预算控制器测试', () => {
    let controller, experienceTracker, skillCrystallization;

    beforeEach(() => {
        experienceTracker = new ExperienceTracker();
        skillCrystallization = new SkillCrystallization();
        controller = new NPCBudgetController(experienceTracker, skillCrystallization);
    });

    describe('allocateBudget - 分配预算', () => {
        it('should allocate budget to new NPC and category', () => {
            const result = controller.allocateBudget('npc_001', 'training', 100);
            expect(result.success).toBe(true);
            expect(result.allocated).toBe(100);
            expect(result.spent).toBe(0);
            expect(result.remaining).toBe(100);
        });

        it('should add to existing budget', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            const result = controller.allocateBudget('npc_001', 'training', 50);
            expect(result.success).toBe(true);
            expect(result.allocated).toBe(150);
            expect(result.remaining).toBe(150);
        });

        it('should handle multiple categories', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.allocateBudget('npc_001', 'skill', 200);
            const status = controller.getBudgetStatus('npc_001');
            expect(status.categories.length).toBe(2);
        });

        it('should reject invalid amount', () => {
            const result = controller.allocateBudget('npc_001', 'training', -10);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invalid amount');
        });

        it('should reject non-number amount', () => {
            const result = controller.allocateBudget('npc_001', 'training', 'abc');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invalid amount');
        });

        it('should allow zero amount', () => {
            const result = controller.allocateBudget('npc_001', 'training', 0);
            expect(result.success).toBe(true);
            expect(result.allocated).toBe(0);
        });
    });

    describe('getBudgetStatus - 获取预算状态', () => {
        it('should return budget status for existing NPC', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.spendBudget('npc_001', 'training', 30);
            const status = controller.getBudgetStatus('npc_001');
            expect(status.success).toBe(true);
            expect(status.npcId).toBe('npc_001');
            expect(status.categories[0].spent).toBe(30);
            expect(status.categories[0].remaining).toBe(70);
        });

        it('should return NPC not found for unknown NPC', () => {
            const status = controller.getBudgetStatus('unknown_npc');
            expect(status.success).toBe(false);
            expect(status.reason).toBe('NPC not found');
        });

        it('should calculate utilization rate correctly', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.spendBudget('npc_001', 'training', 60);
            const status = controller.getBudgetStatus('npc_001');
            expect(status.categories[0].utilizationRate).toBe(0.6);
        });

        it('should return total summary', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.allocateBudget('npc_001', 'skill', 200);
            const status = controller.getBudgetStatus('npc_001');
            expect(status.summary.totalAllocated).toBe(300);
        });
    });

    describe('reallocateBudget - 重新分配预算', () => {
        it('should reallocate existing budget', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            const result = controller.reallocateBudget('npc_001', 'training', 150);
            expect(result.success).toBe(true);
            expect(result.oldAllocated).toBe(100);
            expect(result.newAllocated).toBe(150);
            expect(result.difference).toBe(50);
        });

        it('should create category if not exists', () => {
            const result = controller.reallocateBudget('npc_001', 'new_category', 100);
            expect(result.success).toBe(true);
            expect(result.newAllocated).toBe(100);
        });

        it('should reject invalid amount', () => {
            const result = controller.reallocateBudget('npc_001', 'training', -50);
            expect(result.success).toBe(false);
        });
    });

    describe('spendBudget - 支出预算', () => {
        it('should record budget spending', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            const result = controller.spendBudget('npc_001', 'training', 30);
            expect(result.success).toBe(true);
            expect(result.spent).toBe(30);
            expect(result.remaining).toBe(70);
        });

        it('should reject insufficient budget', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            const result = controller.spendBudget('npc_001', 'training', 150);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Insufficient budget');
        });

        it('should reject NPC not found', () => {
            const result = controller.spendBudget('unknown', 'training', 50);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not found');
        });

        it('should reject category not found', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            const result = controller.spendBudget('npc_001', 'unknown', 50);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Category not found');
        });

        it('should reject invalid amount', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            const result = controller.spendBudget('npc_001', 'training', -10);
            expect(result.success).toBe(false);
        });
    });

    describe('checkBudget - 检查预算', () => {
        it('should return sufficient true when budget is enough', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.spendBudget('npc_001', 'training', 30);
            const result = controller.checkBudget('npc_001', 'training', 70);
            expect(result.success).toBe(true);
            expect(result.sufficient).toBe(true);
            expect(result.available).toBe(70);
        });

        it('should return sufficient false when budget is not enough', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            const result = controller.checkBudget('npc_001', 'training', 150);
            expect(result.success).toBe(true);
            expect(result.sufficient).toBe(false);
        });

        it('should return NPC not found for unknown NPC', () => {
            const result = controller.checkBudget('unknown', 'training', 50);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not found');
        });

        it('should return category not found', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            const result = controller.checkBudget('npc_001', 'unknown', 50);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Category not found');
        });

        it('should handle zero required amount', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            const result = controller.checkBudget('npc_001', 'training', 0);
            expect(result.success).toBe(true);
            expect(result.sufficient).toBe(true);
        });
    });

    describe('getAllBudgets - 获取所有预算', () => {
        it('should return all NPCs budgets', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.allocateBudget('npc_002', 'training', 200);
            const all = controller.getAllBudgets();
            expect(all.success).toBe(true);
            expect(all.totalNPCs).toBe(2);
        });

        it('should return empty when no budgets', () => {
            const all = controller.getAllBudgets();
            expect(all.success).toBe(true);
            expect(all.totalNPCs).toBe(0);
        });
    });

    describe('clearBudget - 清空预算', () => {
        it('should clear NPC budget', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            const result = controller.clearBudget('npc_001');
            expect(result.success).toBe(true);
            const status = controller.getBudgetStatus('npc_001');
            expect(status.success).toBe(false);
        });

        it('should return NPC not found', () => {
            const result = controller.clearBudget('unknown');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not found');
        });
    });

    describe('clearCategory - 清空类别', () => {
        it('should clear specific category', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.allocateBudget('npc_001', 'skill', 200);
            const result = controller.clearCategory('npc_001', 'training');
            expect(result.success).toBe(true);
            const status = controller.getBudgetStatus('npc_001');
            expect(status.categories.length).toBe(1);
            expect(status.categories[0].category).toBe('skill');
        });

        it('should return category not found', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            const result = controller.clearCategory('npc_001', 'unknown');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Category not found');
        });
    });

    describe('multiple NPCs - 多NPC测试', () => {
        it('should handle multiple NPCs independently', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.allocateBudget('npc_002', 'training', 200);
            controller.spendBudget('npc_001', 'training', 50);
            
            const status1 = controller.getBudgetStatus('npc_001');
            const status2 = controller.getBudgetStatus('npc_002');
            
            expect(status1.categories[0].remaining).toBe(50);
            expect(status2.categories[0].remaining).toBe(200);
        });

        it('should track spending correctly across NPCs', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.allocateBudget('npc_002', 'training', 100);
            controller.spendBudget('npc_001', 'training', 50);
            controller.spendBudget('npc_002', 'training', 75);
            
            const all = controller.getAllBudgets();
            expect(all.npcs[0].totalSpent).toBe(50);
            expect(all.npcs[1].totalSpent).toBe(75);
        });
    });

    describe('utilization edge cases', () => {
        it('should handle full utilization', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.spendBudget('npc_001', 'training', 100);
            const status = controller.getBudgetStatus('npc_001');
            expect(status.categories[0].utilizationRate).toBe(1);
            expect(status.categories[0].remaining).toBe(0);
        });

        it('should handle zero utilization', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            const status = controller.getBudgetStatus('npc_001');
            expect(status.categories[0].utilizationRate).toBe(0);
            expect(status.categories[0].remaining).toBe(100);
        });

        it('should calculate overall utilization correctly', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.allocateBudget('npc_001', 'skill', 100);
            controller.spendBudget('npc_001', 'training', 50);
            controller.spendBudget('npc_001', 'skill', 100);
            
            const status = controller.getBudgetStatus('npc_001');
            expect(status.summary.overallUtilizationRate).toBe(0.75);
        });
    });
});