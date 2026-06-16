/**
 * IEREngine 单元测试
 * V280 Iteration 4/9 - IER Experience Refinement Engine
 * 
 * 测试策略: 验证IER引擎的IE循环（评估→反思→改进）
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IEREngine } from '../../../systems/ai/IEREngine.js';
import { ExperienceTracker } from '../../../systems/ai/ExperienceTracker.js';
import { SkillCrystallization } from '../../../systems/ai/SkillCrystallization.js';

describe('IEREngine', () => {
    let ierEngine;
    let experienceTracker;
    let skillCrystallization;

    beforeEach(() => {
        experienceTracker = new ExperienceTracker(100);
        skillCrystallization = new SkillCrystallization();
        skillCrystallization.setExperienceTracker(experienceTracker);
        ierEngine = new IEREngine(experienceTracker, skillCrystallization);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('应该使用提供的ExperienceTracker和SkillCrystallization创建实例', () => {
            expect(ierEngine.experienceTracker).toBe(experienceTracker);
            expect(ierEngine.skillCrystallization).toBe(skillCrystallization);
        });

        it('应该初始化refinementHistory Map为空', () => {
            expect(ierEngine.refinementHistory).toBeInstanceOf(Map);
            expect(ierEngine.refinementHistory.size).toBe(0);
        });

        it('应该初始化strategies Map为空', () => {
            expect(ierEngine.strategies).toBeInstanceOf(Map);
            expect(ierEngine.strategies.size).toBe(0);
        });

        it('应该初始化consecutiveFailures Map', () => {
            expect(ierEngine.consecutiveFailures).toBeInstanceOf(Map);
        });

        it('应该设置maxConsecutiveFailures为3', () => {
            expect(ierEngine.maxConsecutiveFailures).toBe(3);
        });
    });

    describe('refine - IE循环核心', () => {
        it('应该对成功交互返回refined=false', async () => {
            const interactionRecord = {
                type: 'trade',
                playerAction: 'buy sword',
                npcResponse: 'Here is your sword',
                outcome: { success: true, satisfaction: 0.9 }
            };

            const result = await ierEngine.refine('npc_001', interactionRecord);

            expect(result.refined).toBe(false);
            expect(result.reason).toBe('interaction_successful_no_refinement_needed');
        });

        it('应该对失败交互进行分析', async () => {
            const interactionRecord = {
                type: 'trade',
                playerAction: 'buy sword',
                npcResponse: 'No sword available',
                outcome: { success: false, satisfaction: 0.2 }
            };

            const result = await ierEngine.refine('npc_001', interactionRecord);

            expect(result.refined).toBe(false);
            expect(result.reason).toContain('analysis_needed');
        });

        it('应该对连续3次失败触发技能重构', async () => {
            const failedInteraction = {
                type: 'trade',
                playerAction: 'buy rare item',
                npcResponse: 'Item not available',
                outcome: { success: false, satisfaction: 0.2 }
            };

            // 连续3次失败
            await ierEngine.refine('npc_001', failedInteraction);
            await ierEngine.refine('npc_001', failedInteraction);
            const result = await ierEngine.refine('npc_001', failedInteraction);

            expect(result.refined).toBe(true);
            expect(result.reason).toBe('consecutive_failures_triggered_refinement');
            expect(result.newStrategy).not.toBeNull();
        });

        it('成功交互后应该重置连续失败计数', async () => {
            const failedInteraction = {
                type: 'trade',
                playerAction: 'buy item',
                npcResponse: 'Not available',
                outcome: { success: false, satisfaction: 0.2 }
            };
            const successInteraction = {
                type: 'trade',
                playerAction: 'buy item',
                npcResponse: 'Here you go',
                outcome: { success: true, satisfaction: 0.8 }
            };

            await ierEngine.refine('npc_001', failedInteraction);
            await ierEngine.refine('npc_001', failedInteraction);
            expect(ierEngine.getConsecutiveFailures('npc_001')).toBe(2);

            await ierEngine.refine('npc_001', successInteraction);
            expect(ierEngine.getConsecutiveFailures('npc_001')).toBe(0);
        });

        it('应该记录优化历史', async () => {
            const interactionRecord = {
                type: 'chat',
                playerAction: 'hello',
                npcResponse: 'Hi there',
                outcome: { success: true, satisfaction: 0.8 }
            };

            await ierEngine.refine('npc_001', interactionRecord);
            const history = ierEngine.getRefinementHistory('npc_001');

            expect(history.length).toBe(1);
            expect(history[0].npcId).toBe('npc_001');
        });
    });

    describe('getRefinementHistory', () => {
        it('应该返回指定NPC的优化历史', async () => {
            const interaction = {
                type: 'trade',
                playerAction: 'buy',
                npcResponse: 'Done',
                outcome: { success: true, satisfaction: 0.8 }
            };

            await ierEngine.refine('npc_001', interaction);
            await ierEngine.refine('npc_001', interaction);
            await ierEngine.refine('npc_002', interaction);

            const history1 = ierEngine.getRefinementHistory('npc_001');
            const history2 = ierEngine.getRefinementHistory('npc_002');

            expect(history1.length).toBe(2);
            expect(history2.length).toBe(1);
        });

        it('应该对不存在的NPC返回空数组', () => {
            const history = ierEngine.getRefinementHistory('npc_unknown');
            expect(history).toEqual([]);
        });
    });

    describe('getSuggestions', () => {
        it('应该基于失败记录生成建议', async () => {
            const failedInteraction = {
                type: 'trade',
                playerAction: 'buy item',
                npcResponse: 'Not available',
                outcome: { success: false, satisfaction: 0.2 }
            };

            // 添加3次失败以生成建议
            await ierEngine.refine('npc_001', failedInteraction);
            await ierEngine.refine('npc_001', failedInteraction);
            await ierEngine.refine('npc_001', failedInteraction);

            const suggestions = ierEngine.getSuggestions('npc_001');

            expect(suggestions.length).toBeGreaterThan(0);
            expect(suggestions[0]).toHaveProperty('type');
            expect(suggestions[0]).toHaveProperty('reason');
        });

        it('应该对成功NPC返回空建议', () => {
            const suggestions = ierEngine.getSuggestions('npc_new');
            expect(suggestions).toEqual([]);
        });
    });

    describe('getConsecutiveFailures', () => {
        it('应该返回初始0', () => {
            expect(ierEngine.getConsecutiveFailures('npc_new')).toBe(0);
        });

        it('应该返回累积的连续失败次数', async () => {
            const failedInteraction = {
                type: 'trade',
                playerAction: 'buy',
                npcResponse: 'fail',
                outcome: { success: false, satisfaction: 0.2 }
            };

            await ierEngine.refine('npc_001', failedInteraction);
            await ierEngine.refine('npc_001', failedInteraction);

            expect(ierEngine.getConsecutiveFailures('npc_001')).toBe(2);
        });
    });

    describe('resetConsecutiveFailures', () => {
        it('应该重置连续失败计数', async () => {
            const failedInteraction = {
                type: 'trade',
                playerAction: 'buy',
                npcResponse: 'fail',
                outcome: { success: false, satisfaction: 0.2 }
            };

            await ierEngine.refine('npc_001', failedInteraction);
            await ierEngine.refine('npc_001', failedInteraction);
            ierEngine.resetConsecutiveFailures('npc_001');

            expect(ierEngine.getConsecutiveFailures('npc_001')).toBe(0);
        });
    });

    describe('applyStrategy', () => {
        it('应该应用新创建的策略', async () => {
            // 先触发策略创建
            const failedInteraction = {
                type: 'trade',
                playerAction: 'buy rare item',
                npcResponse: 'Not available',
                outcome: { success: false, satisfaction: 0.2 }
            };

            await ierEngine.refine('npc_001', failedInteraction);
            await ierEngine.refine('npc_001', failedInteraction);
            await ierEngine.refine('npc_001', failedInteraction);

            const strategies = ierEngine.getStrategies('npc_001');
            expect(strategies.length).toBe(1);

            const applyResult = ierEngine.applyStrategy('npc_001', strategies[0].id);
            expect(applyResult.success).toBe(true);
            expect(applyResult.strategy.useCount).toBe(1);
        });

        it('应该对不存在的策略返回错误', () => {
            const result = ierEngine.applyStrategy('npc_001', 'strategy_unknown');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Strategy not found');
        });
    });

    describe('getStrategies', () => {
        it('应该返回NPC的所有策略', async () => {
            const failedInteraction = {
                type: 'trade',
                playerAction: 'buy item',
                npcResponse: 'fail',
                outcome: { success: false, satisfaction: 0.2 }
            };

            await ierEngine.refine('npc_001', failedInteraction);
            await ierEngine.refine('npc_001', failedInteraction);
            await ierEngine.refine('npc_001', failedInteraction);

            const strategies = ierEngine.getStrategies('npc_001');
            expect(strategies.length).toBe(1);
            expect(strategies[0]).toHaveProperty('type', 'new_approach');
        });

        it('应该对没有策略的NPC返回空数组', () => {
            const strategies = ierEngine.getStrategies('npc_new');
            expect(strategies).toEqual([]);
        });
    });

    describe('clear', () => {
        it('应该清除NPC的所有优化数据', async () => {
            const interaction = {
                type: 'trade',
                playerAction: 'buy',
                npcResponse: 'done',
                outcome: { success: true, satisfaction: 0.8 }
            };

            await ierEngine.refine('npc_001', interaction);
            const result = ierEngine.clear('npc_001');

            expect(result.success).toBe(true);
            expect(result.cleared.refinementHistory).toBe(true);
            // 没有策略被创建（因为成功交互不会创建策略）
            expect(result.cleared.consecutiveFailures).toBe(true);
            expect(ierEngine.getRefinementHistory('npc_001')).toEqual([]);
        });
    });

    describe('技能重构集成', () => {
        it('应该将检测到的模式结晶化为技能', async () => {
            // 先记录一些成功的交互用于检测模式
            const successInteraction = {
                type: 'trade',
                playerAction: 'buy potion',
                npcResponse: 'Here is your potion',
                outcome: { success: true, satisfaction: 0.9 }
            };

            // 记录3次相同的成功交互以触发模式检测
            await experienceTracker.track('npc_001', successInteraction);
            await experienceTracker.track('npc_001', successInteraction);
            await experienceTracker.track('npc_001', successInteraction);

            // 触发自动结晶化
            const result = skillCrystallization.autoTrigger('npc_001', {});
            expect(result.success).toBe(true);

            // 验证技能已创建
            const skills = skillCrystallization.getSkillLibrary('npc_001');
            expect(skills.length).toBe(1);
        });

        it('应该集成SkillCrystallization检测模式', async () => {
            // 准备模式检测数据
            const interactions = [
                { type: 'trade', playerAction: 'buy gem', outcome: { success: true } },
                { type: 'trade', playerAction: 'buy gem', outcome: { success: true } },
                { type: 'trade', playerAction: 'buy gem', outcome: { success: true } }
            ];

            const pattern = skillCrystallization.detectPattern(interactions);
            expect(pattern).not.toBeNull();
            expect(pattern.type).toBe('trade');
            expect(pattern.consecutiveCount).toBe(3);
        });
    });
});