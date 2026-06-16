/**
 * BudgetAnalytics.test.js - 预算分析器测试
 * V291 Iteration 6/9 - NPC Budget Control Integration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BudgetAnalytics } from '../../../systems/ai/BudgetAnalytics.js';
import { NPCBudgetController } from '../../../systems/ai/NPCBudgetController.js';
import { ExperienceTracker } from '../../../systems/ai/ExperienceTracker.js';
import { SkillCrystallization } from '../../../systems/ai/SkillCrystallization.js';

describe('BudgetAnalytics - 预算分析器测试', () => {
    let analytics, controller, experienceTracker, skillCrystallization;

    beforeEach(() => {
        experienceTracker = new ExperienceTracker();
        skillCrystallization = new SkillCrystallization();
        controller = new NPCBudgetController(experienceTracker, skillCrystallization);
        analytics = new BudgetAnalytics(controller);
    });

    describe('analyzeEfficiency - 分析效率', () => {
        it('should return efficiency analysis', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.spendBudget('npc_001', 'training', 60);
            const result = analytics.analyzeEfficiency('npc_001');
            expect(result.success).toBe(true);
            expect(result.npcId).toBe('npc_001');
            expect(result.categories.length).toBe(1);
        });

        it('should return NPC not found', () => {
            const result = analytics.analyzeEfficiency('unknown');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not found');
        });

        it('should calculate efficiency score for ideal utilization', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.spendBudget('npc_001', 'training', 75);
            const result = analytics.analyzeEfficiency('npc_001');
            expect(result.categories[0].efficiencyScore).toBe(1);
            expect(result.categories[0].status).toBe('excellent');
        });

        it('should calculate lower score for low utilization', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.spendBudget('npc_001', 'training', 10);
            const result = analytics.analyzeEfficiency('npc_001');
            expect(result.categories[0].efficiencyScore).toBeLessThan(1);
        });

        it('should calculate overall score', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.spendBudget('npc_001', 'training', 80);
            const result = analytics.analyzeEfficiency('npc_001');
            expect(typeof result.overallScore).toBe('number');
        });
    });

    describe('generateOptimizationSuggestions - 生成优化建议', () => {
        it('should generate increase budget suggestion for high utilization', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.spendBudget('npc_001', 'training', 96);
            const suggestions = analytics.generateOptimizationSuggestions('npc_001');
            expect(suggestions.length).toBeGreaterThan(0);
            expect(suggestions[0].type).toBe('increase_budget');
            expect(suggestions[0].priority).toBe('high');
        });

        it('should generate decrease budget suggestion for low utilization', () => {
            controller.allocateBudget('npc_001', 'training', 200);
            controller.spendBudget('npc_001', 'training', 10);
            const suggestions = analytics.generateOptimizationSuggestions('npc_001');
            expect(suggestions.length).toBeGreaterThan(0);
            expect(suggestions[0].type).toBe('decrease_budget');
        });

        it('should generate allocate suggestion for zero budget', () => {
            controller.reallocateBudget('npc_001', 'new_category', 0);
            const suggestions = analytics.generateOptimizationSuggestions('npc_001');
            const allocateSuggestion = suggestions.find(s => s.type === 'allocate_budget');
            expect(allocateSuggestion).toBeDefined();
        });

        it('should return empty for NPC not found', () => {
            const suggestions = analytics.generateOptimizationSuggestions('unknown');
            expect(suggestions.length).toBe(0);
        });

        it('should sort suggestions by priority', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.spendBudget('npc_001', 'training', 96);
            controller.reallocateBudget('npc_001', 'skill', 0);
            const suggestions = analytics.generateOptimizationSuggestions('npc_001');
            expect(suggestions[0].priority).toBe('high');
        });
    });

    describe('getBudgetHistory - 获取历史', () => {
        it('should record and retrieve history', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.spendBudget('npc_001', 'training', 50);
            analytics.snapshot('npc_001');
            const history = analytics.getBudgetHistory('npc_001');
            expect(history.length).toBe(1);
            expect(history[0].spent).toBe(50);
        });

        it('should return empty for unknown NPC', () => {
            const history = analytics.getBudgetHistory('unknown');
            expect(history.length).toBe(0);
        });

        it('should respect limit parameter', () => {
            for (let i = 0; i < 10; i++) {
                controller.reallocateBudget('npc_001', 'training', 100 + i);
                analytics.snapshot('npc_001');
            }
            const history = analytics.getBudgetHistory('npc_001', 5);
            expect(history.length).toBe(5);
        });
    });

    describe('snapshot - 快照', () => {
        it('should create snapshot of current state', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.spendBudget('npc_001', 'training', 30);
            const result = analytics.snapshot('npc_001');
            expect(result.success).toBe(true);
            expect(result.snapshotCount).toBe(1);
        });

        it('should return error for unknown NPC', () => {
            const result = analytics.snapshot('unknown');
            expect(result.success).toBe(false);
        });
    });

    describe('getEfficiencyTrend - 效率趋势', () => {
        it('should analyze efficiency trend', () => {
            for (let i = 0; i < 5; i++) {
                controller.reallocateBudget('npc_001', 'training', 100);
                controller.spendBudget('npc_001', 'training', 20 + i * 10);
                analytics.snapshot('npc_001');
            }
            const trend = analytics.getEfficiencyTrend('npc_001', 'training', 5);
            expect(trend.success).toBe(true);
            expect(trend).toHaveProperty('trend');
        });

        it('should return error for no history', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            const trend = analytics.getEfficiencyTrend('npc_001', 'training', 5);
            expect(trend.success).toBe(false);
            expect(trend.reason).toBe('No history available');
        });

        it('should return error for insufficient data', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.spendBudget('npc_001', 'training', 50);
            analytics.snapshot('npc_001');
            const trend = analytics.getEfficiencyTrend('npc_001', 'training', 5);
            expect(trend.success).toBe(false);
            expect(trend.reason).toBe('Insufficient history data');
        });

        it('should return error for no history', () => {
            const trend = analytics.getEfficiencyTrend('unknown', 'training', 5);
            expect(trend.success).toBe(false);
            expect(trend.reason).toBe('No history available');
        });
    });

    describe('clearHistory - 清空历史', () => {
        it('should clear NPC history', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            analytics.snapshot('npc_001');
            const result = analytics.clearHistory('npc_001');
            expect(result.success).toBe(true);
            const history = analytics.getBudgetHistory('npc_001');
            expect(history.length).toBe(0);
        });

        it('should return error for unknown NPC', () => {
            const result = analytics.clearHistory('unknown');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not found');
        });
    });

    describe('getAllAnalysis - 全部分析', () => {
        it('should analyze all NPCs', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.allocateBudget('npc_002', 'training', 200);
            const result = analytics.getAllAnalysis();
            expect(result.success).toBe(true);
            expect(result.totalNPCs).toBe(2);
        });

        it('should return zero NPCs when empty', () => {
            const result = analytics.getAllAnalysis();
            expect(result.success).toBe(true);
            expect(result.totalNPCs).toBe(0);
        });
    });

    describe('efficiency scoring edge cases', () => {
        it('should score excellent for 60-90% utilization', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.spendBudget('npc_001', 'training', 75);
            const result = analytics.analyzeEfficiency('npc_001');
            expect(result.categories[0].status).toBe('excellent');
        });

        it('should score good for close to 90%', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.spendBudget('npc_001', 'training', 93);
            const result = analytics.analyzeEfficiency('npc_001');
            expect(['excellent', 'good']).toContain(result.categories[0].status);
        });

        it('should handle empty categories', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            const result = analytics.analyzeEfficiency('npc_001');
            expect(result.overallScore).toBeGreaterThan(0);
        });
    });

    describe('multiple categories', () => {
        it('should analyze multiple categories', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.allocateBudget('npc_001', 'skill', 200);
            controller.spendBudget('npc_001', 'training', 60);
            controller.spendBudget('npc_001', 'skill', 180);
            const result = analytics.analyzeEfficiency('npc_001');
            expect(result.categories.length).toBe(2);
        });

        it('should track history for each category separately', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.allocateBudget('npc_001', 'skill', 200);
            analytics.snapshot('npc_001');
            const history = analytics.getBudgetHistory('npc_001');
            expect(history.length).toBe(2);
        });
    });

    describe('integration with BudgetController', () => {
        it('should work with clearBudget', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            analytics.snapshot('npc_001');
            controller.clearBudget('npc_001');
            const history = analytics.getBudgetHistory('npc_001');
            expect(history.length).toBe(1); // 历史保留
            const status = controller.getBudgetStatus('npc_001');
            expect(status.success).toBe(false);
        });

        it('should reflect reallocation in analysis', () => {
            controller.allocateBudget('npc_001', 'training', 100);
            controller.spendBudget('npc_001', 'training', 50);
            analytics.snapshot('npc_001');
            controller.reallocateBudget('npc_001', 'training', 200);
            analytics.snapshot('npc_001');
            const history = analytics.getBudgetHistory('npc_001', 2);
            expect(history[1].allocated).toBe(200);
        });
    });
});