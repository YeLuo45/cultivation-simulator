/**
 * LearningPolicy 单元测试
 * V281 Iteration 5/9 - Self-Evolution Trigger & Learning Policy
 * 
 * 测试策略: 验证自适应学习策略引擎的策略管理、反馈更新和模式切换机制
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LearningPolicy } from '../../../systems/ai/LearningPolicy.js';
import { ExperienceTracker } from '../../../systems/ai/ExperienceTracker.js';
import { IEREngine } from '../../../systems/ai/IEREngine.js';
import { SkillCrystallization } from '../../../systems/ai/SkillCrystallization.js';

describe('LearningPolicy', () => {
    let learningPolicy;
    let experienceTracker;
    let ierEngine;
    let skillCrystallization;

    beforeEach(() => {
        experienceTracker = new ExperienceTracker(100);
        skillCrystallization = new SkillCrystallization();
        skillCrystallization.setExperienceTracker(experienceTracker);
        ierEngine = new IEREngine(experienceTracker, skillCrystallization);
        learningPolicy = new LearningPolicy({
            experienceTracker,
            ierEngine,
            skillCrystallization
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('应该使用提供的配置创建实例', () => {
            expect(learningPolicy.experienceTracker).toBe(experienceTracker);
            expect(learningPolicy.ierEngine).toBe(ierEngine);
            expect(learningPolicy.skillCrystallization).toBe(skillCrystallization);
        });

        it('应该初始化policies Map为空', () => {
            expect(learningPolicy.policies).toBeInstanceOf(Map);
            expect(learningPolicy.policies.size).toBe(0);
        });

        it('应该初始化feedbackHistory Map为空', () => {
            expect(learningPolicy.feedbackHistory).toBeInstanceOf(Map);
            expect(learningPolicy.feedbackHistory.size).toBe(0);
        });

        it('应该设置默认模式为BALANCED', () => {
            expect(learningPolicy.defaultMode).toBe('BALANCED');
        });

        it('应该接受自定义默认模式', () => {
            const customPolicy = new LearningPolicy({ mode: 'AGGRESSIVE' });
            
            expect(customPolicy.defaultMode).toBe('AGGRESSIVE');
        });
    });

    describe('MODES 静态属性', () => {
        it('应该包含所有预定义的策略模式', () => {
            expect(LearningPolicy.MODES.EXPLORATIVE).toBe('EXPLORATIVE');
            expect(LearningPolicy.MODES.CONSERVATIVE).toBe('CONSERVATIVE');
            expect(LearningPolicy.MODES.AGGRESSIVE).toBe('AGGRESSIVE');
            expect(LearningPolicy.MODES.BALANCED).toBe('BALANCED');
        });
    });

    describe('MODE_CONFIGS 静态属性', () => {
        it('应该包含所有模式对应的配置', () => {
            expect(LearningPolicy.MODE_CONFIGS.EXPLORATIVE).toBeDefined();
            expect(LearningPolicy.MODE_CONFIGS.CONSERVATIVE).toBeDefined();
            expect(LearningPolicy.MODE_CONFIGS.AGGRESSIVE).toBeDefined();
            expect(LearningPolicy.MODE_CONFIGS.BALANCED).toBeDefined();
        });

        it('EXPLORATIVE模式应该有高explorationRate', () => {
            const config = LearningPolicy.MODE_CONFIGS.EXPLORATIVE;
            
            expect(config.explorationRate).toBeGreaterThan(0.3);
            expect(config.learningRate).toBeGreaterThan(0.1);
        });

        it('CONSERVATIVE模式应该有低explorationRate', () => {
            const config = LearningPolicy.MODE_CONFIGS.CONSERVATIVE;
            
            expect(config.explorationRate).toBeLessThan(0.2);
            expect(config.confidenceThreshold).toBeGreaterThan(0.7);
        });

        it('AGGRESSIVE模式应该有高learningRate', () => {
            const config = LearningPolicy.MODE_CONFIGS.AGGRESSIVE;
            
            expect(config.learningRate).toBeGreaterThan(0.2);
            expect(config.failureWeight).toBeGreaterThan(config.successWeight);
        });

        it('BALANCED模式应该有平衡的配置', () => {
            const config = LearningPolicy.MODE_CONFIGS.BALANCED;
            
            expect(config.learningRate).toBeGreaterThan(0.05);
            expect(config.learningRate).toBeLessThan(0.2);
            expect(config.explorationRate).toBeGreaterThan(0.1);
            expect(config.explorationRate).toBeLessThan(0.3);
        });
    });

    describe('getPolicy', () => {
        it('应该返回新NPC的默认策略', () => {
            const policy = learningPolicy.getPolicy('npc_new');
            
            expect(policy).toBeDefined();
            expect(policy.mode).toBe('BALANCED');
            expect(policy.learningRate).toBeDefined();
            expect(policy.explorationRate).toBeDefined();
        });

        it('应该返回已存在NPC的策略', () => {
            learningPolicy.getPolicy('npc_001');
            learningPolicy.setPolicyMode('npc_001', 'AGGRESSIVE');
            
            const policy = learningPolicy.getPolicy('npc_001');
            
            expect(policy.mode).toBe('AGGRESSIVE');
        });
    });

    describe('getPolicyMode', () => {
        it('应该返回NPC的当前策略模式', () => {
            learningPolicy.setPolicyMode('npc_001', 'CONSERVATIVE');
            
            const mode = learningPolicy.getPolicyMode('npc_001');
            
            expect(mode).toBe('CONSERVATIVE');
        });

        it('对新NPC应返回默认模式', () => {
            const mode = learningPolicy.getPolicyMode('npc_unknown');
            
            expect(mode).toBe('BALANCED');
        });
    });

    describe('setPolicyMode', () => {
        it('应该成功设置策略模式', () => {
            const result = learningPolicy.setPolicyMode('npc_001', 'AGGRESSIVE');
            
            expect(result.success).toBe(true);
            expect(result.mode).toBe('AGGRESSIVE');
            expect(result.policy.mode).toBe('AGGRESSIVE');
        });

        it('应该拒绝无效模式', () => {
            const result = learningPolicy.setPolicyMode('npc_001', 'INVALID_MODE');
            
            expect(result.success).toBe(false);
            expect(result.reason).toContain('Invalid mode');
        });

        it('模式切换后getPolicy应返回新模式', () => {
            learningPolicy.setPolicyMode('npc_001', 'EXPLORATIVE');
            
            const policy = learningPolicy.getPolicy('npc_001');
            
            expect(policy.mode).toBe('EXPLORATIVE');
        });
    });

    describe('updatePolicy', () => {
        it('应该成功更新策略并返回更新结果', () => {
            const result = learningPolicy.updatePolicy('npc_001', {
                type: 'success',
                value: 0.8
            });
            
            expect(result.success).toBe(true);
            expect(result.feedbackId).toBeDefined();
            expect(result.updates).toBeDefined();
        });

        it('成功反馈应降低explorationRate', () => {
            const initialPolicy = learningPolicy.getPolicy('npc_001');
            const initialExploration = initialPolicy.explorationRate;
            
            learningPolicy.updatePolicy('npc_001', { type: 'success', value: 0.9 });
            
            const updatedPolicy = learningPolicy.getPolicy('npc_001');
            
            expect(updatedPolicy.explorationRate).toBeLessThan(initialExploration);
        });

        it('失败反馈应增加explorationRate', () => {
            const initialPolicy = learningPolicy.getPolicy('npc_001');
            const initialExploration = initialPolicy.explorationRate;
            
            learningPolicy.updatePolicy('npc_001', { type: 'failure', value: 0.3 });
            
            const updatedPolicy = learningPolicy.getPolicy('npc_001');
            
            expect(updatedPolicy.explorationRate).toBeGreaterThan(initialExploration);
        });

        it('plateau反馈应增加explorationRate', () => {
            const initialPolicy = learningPolicy.getPolicy('npc_001');
            const initialExploration = initialPolicy.explorationRate;
            
            learningPolicy.updatePolicy('npc_001', { type: 'plateau', value: 0.5 });
            
            const updatedPolicy = learningPolicy.getPolicy('npc_001');
            
            expect(updatedPolicy.explorationRate).toBeGreaterThan(initialExploration);
        });

        it('breakthrough反馈应大幅增加learningRate', () => {
            const initialPolicy = learningPolicy.getPolicy('npc_001');
            const initialLearningRate = initialPolicy.learningRate;
            
            learningPolicy.updatePolicy('npc_001', { type: 'breakthrough', value: 0.9 });
            
            const updatedPolicy = learningPolicy.getPolicy('npc_001');
            
            expect(updatedPolicy.learningRate).toBeGreaterThan(initialLearningRate);
        });

        it('应该拒绝无效反馈类型', () => {
            const result = learningPolicy.updatePolicy('npc_001', {
                type: 'invalid_type',
                value: 0.5
            });
            
            expect(result.success).toBe(false);
            expect(result.reason).toContain('Unknown feedback type');
        });

        it('应该记录反馈到历史', () => {
            learningPolicy.updatePolicy('npc_001', { type: 'success', value: 0.8 });
            
            const history = learningPolicy.getFeedbackHistory('npc_001');
            
            expect(history.length).toBe(1);
            expect(history[0].type).toBe('success');
        });
    });

    describe('resetPolicy', () => {
        it('应该重置策略到默认模式', () => {
            learningPolicy.setPolicyMode('npc_001', 'AGGRESSIVE');
            learningPolicy.updatePolicy('npc_001', { type: 'failure', value: 0.3 });
            
            const result = learningPolicy.resetPolicy('npc_001');
            
            expect(result.success).toBe(true);
            expect(result.mode).toBe('BALANCED');
            expect(result.policy.mode).toBe('BALANCED');
        });

        it('应该支持重置到指定模式', () => {
            learningPolicy.setPolicyMode('npc_001', 'EXPLORATIVE');
            
            const result = learningPolicy.resetPolicy('npc_001', 'CONSERVATIVE');
            
            expect(result.success).toBe(true);
            expect(result.mode).toBe('CONSERVATIVE');
        });

        it('重置后策略应恢复到初始参数', () => {
            learningPolicy.setPolicyMode('npc_001', 'AGGRESSIVE');
            
            // 修改策略
            learningPolicy.updatePolicy('npc_001', { type: 'failure', value: 0.3 });
            learningPolicy.updatePolicy('npc_001', { type: 'failure', value: 0.3 });
            
            // 重置
            learningPolicy.resetPolicy('npc_001', 'AGGRESSIVE');
            
            const policy = learningPolicy.getPolicy('npc_001');
            const template = LearningPolicy.MODE_CONFIGS.AGGRESSIVE;
            
            expect(policy.learningRate).toBeCloseTo(template.learningRate, 2);
        });
    });

    describe('getFeedbackHistory', () => {
        it('应该返回NPC的反馈历史', () => {
            learningPolicy.updatePolicy('npc_001', { type: 'success', value: 0.8 });
            learningPolicy.updatePolicy('npc_001', { type: 'failure', value: 0.3 });
            
            const history = learningPolicy.getFeedbackHistory('npc_001');
            
            expect(history.length).toBe(2);
        });

        it('应该支持limit参数', () => {
            for (let i = 0; i < 10; i++) {
                learningPolicy.updatePolicy('npc_001', { type: 'success', value: 0.8 });
            }
            
            const history = learningPolicy.getFeedbackHistory('npc_001', 5);
            
            expect(history.length).toBeLessThanOrEqual(5);
        });

        it('对新NPC应返回空数组', () => {
            const history = learningPolicy.getFeedbackHistory('npc_unknown');
            
            expect(history).toEqual([]);
        });
    });

    describe('generateAutoFeedback', () => {
        it('当交互次数<10时应返回null', () => {
            for (let i = 0; i < 5; i++) {
                experienceTracker.track('npc_001', {
                    type: 'trade',
                    playerAction: 'buy sword',
                    npcResponse: 'Here you go',
                    outcome: { success: true, satisfaction: 0.9 }
                });
            }
            
            const feedback = learningPolicy.generateAutoFeedback('npc_001');
            
            expect(feedback).toBeNull();
        });

        it('当成功率显著提升时应返回breakthrough', () => {
            // 添加20次老记录（低成功率）
            for (let i = 0; i < 20; i++) {
                experienceTracker.track('npc_001', {
                    type: 'trade',
                    playerAction: 'buy sword',
                    npcResponse: 'No sword',
                    outcome: { success: false, satisfaction: 0.2 }
                });
            }
            
            // 添加20次新记录（高成功率）
            for (let i = 0; i < 20; i++) {
                experienceTracker.track('npc_001', {
                    type: 'trade',
                    playerAction: 'buy sword',
                    npcResponse: 'Here you go',
                    outcome: { success: true, satisfaction: 0.9 }
                });
            }
            
            const feedback = learningPolicy.generateAutoFeedback('npc_001');
            
            expect(feedback).not.toBeNull();
            expect(['breakthrough', 'success']).toContain(feedback.type);
        });

        it('当成功率显著下降时应返回failure', () => {
            // 添加20次老记录（高成功率）
            for (let i = 0; i < 20; i++) {
                experienceTracker.track('npc_001', {
                    type: 'trade',
                    playerAction: 'buy sword',
                    npcResponse: 'Here you go',
                    outcome: { success: true, satisfaction: 0.9 }
                });
            }
            
            // 添加20次新记录（低成功率）
            for (let i = 0; i < 20; i++) {
                experienceTracker.track('npc_001', {
                    type: 'trade',
                    playerAction: 'buy sword',
                    npcResponse: 'No sword',
                    outcome: { success: false, satisfaction: 0.2 }
                });
            }
            
            const feedback = learningPolicy.generateAutoFeedback('npc_001');
            
            expect(feedback).not.toBeNull();
            expect(feedback.type).toBe('failure');
        });
    });

    describe('suggestModeChange', () => {
        it('低成功率应建议AGGRESSIVE模式', () => {
            // 添加大量失败记录
            for (let i = 0; i < 30; i++) {
                experienceTracker.track('npc_001', {
                    type: 'trade',
                    playerAction: 'buy sword',
                    npcResponse: 'No sword',
                    outcome: { success: false, satisfaction: 0.2 }
                });
            }
            
            const suggestion = learningPolicy.suggestModeChange('npc_001');
            
            expect(suggestion.suggested).toBe(true);
            expect(suggestion.mode).toBe('AGGRESSIVE');
        });

        it('高成功率和高满意度应建议CONSERVATIVE模式', () => {
            // 添加大量成功记录
            for (let i = 0; i < 30; i++) {
                experienceTracker.track('npc_001', {
                    type: 'trade',
                    playerAction: 'buy sword',
                    npcResponse: 'Here you go',
                    outcome: { success: true, satisfaction: 0.9 }
                });
            }
            
            const suggestion = learningPolicy.suggestModeChange('npc_001');
            
            expect(suggestion.suggested).toBe(true);
            expect(suggestion.mode).toBe('CONSERVATIVE');
        });

        it('低满意度应建议EXPLORATIVE模式', () => {
            // 添加大量高成功率但低满意度记录（成功但满意度低）
            for (let i = 0; i < 30; i++) {
                experienceTracker.track('npc_001', {
                    type: 'trade',
                    playerAction: 'buy sword',
                    npcResponse: 'Here you go',
                    outcome: { success: true, satisfaction: 0.25 }
                });
            }

            const suggestion = learningPolicy.suggestModeChange('npc_001');

            expect(suggestion.suggested).toBe(true);
            expect(suggestion.mode).toBe('EXPLORATIVE');
        });

        it('当前模式合适时应返回not suggested', () => {
            // 对于新NPC且无经验数据，suggestModeChange基于默认统计
            // 由于totalInteractions=0, stats全是0，会先命中successRate<0.3 -> AGGRESSIVE
            // 这是合理行为，因为没有任何交互数据
            // 测试这个场景：先用AGGRESSIVE积累一些正面经验再测试
            learningPolicy.setPolicyMode('npc_001', 'AGGRESSIVE');
            // 添加一些成功记录但不满足任何建议条件
            for (let i = 0; i < 10; i++) {
                experienceTracker.track('npc_001', {
                    type: 'chat',
                    playerAction: 'greet',
                    npcResponse: 'Hello',
                    outcome: { success: true, satisfaction: 0.6 }
                });
            }

            const suggestion = learningPolicy.suggestModeChange('npc_001');

            // 此时 successRate=1.0 >= 0.3, avgSatisfaction=0.6 >= 0.4, 不满足任何建议条件
            expect(suggestion.suggested).toBe(false);
        });
    });

    describe('getAllPoliciesSummary', () => {
        it('应返回所有NPC的策略摘要', () => {
            learningPolicy.setPolicyMode('npc_001', 'AGGRESSIVE');
            learningPolicy.setPolicyMode('npc_002', 'CONSERVATIVE');
            learningPolicy.updatePolicy('npc_001', { type: 'success', value: 0.8 });
            
            const summaries = learningPolicy.getAllPoliciesSummary();
            
            expect(summaries.length).toBe(2);
            
            const npc001Summary = summaries.find(s => s.npcId === 'npc_001');
            expect(npc001Summary.mode).toBe('AGGRESSIVE');
            expect(npc001Summary.feedbackCount).toBe(1);
        });
    });

    describe('clearPolicy', () => {
        it('应清除指定NPC的策略和反馈', () => {
            learningPolicy.setPolicyMode('npc_001', 'AGGRESSIVE');
            learningPolicy.updatePolicy('npc_001', { type: 'success', value: 0.8 });
            
            const result = learningPolicy.clearPolicy('npc_001');
            
            expect(result.success).toBe(true);
            expect(result.cleared.policy).toBe(true);
            expect(result.cleared.feedback).toBe(true);
            
            // 重新获取策略应该使用默认模式
            const policy = learningPolicy.getPolicy('npc_001');
            expect(policy.mode).toBe('BALANCED');
        });

        it('对不存在的NPC应返回cleared=false', () => {
            const result = learningPolicy.clearPolicy('npc_unknown');
            
            expect(result.success).toBe(true);
            expect(result.cleared.policy).toBe(false);
            expect(result.cleared.feedback).toBe(false);
        });
    });

    describe('getAvailableModes', () => {
        it('应返回所有可用的策略模式', () => {
            const modes = learningPolicy.getAvailableModes();
            
            expect(Array.isArray(modes)).toBe(true);
            expect(modes).toContain('EXPLORATIVE');
            expect(modes).toContain('CONSERVATIVE');
            expect(modes).toContain('AGGRESSIVE');
            expect(modes).toContain('BALANCED');
        });
    });

    describe('batchApplySuggestions', () => {
        it('应批量应用建议的策略切换', () => {
            // npc_001: 高成功率 -> CONSERVATIVE
            for (let i = 0; i < 30; i++) {
                experienceTracker.track('npc_001', {
                    type: 'trade',
                    playerAction: 'buy sword',
                    npcResponse: 'Here you go',
                    outcome: { success: true, satisfaction: 0.9 }
                });
            }
            
            // npc_002: 低成功率 -> AGGRESSIVE
            for (let i = 0; i < 30; i++) {
                experienceTracker.track('npc_002', {
                    type: 'trade',
                    playerAction: 'buy sword',
                    npcResponse: 'No sword',
                    outcome: { success: false, satisfaction: 0.2 }
                });
            }
            
            const result = learningPolicy.batchApplySuggestions(['npc_001', 'npc_002']);
            
            expect(result.success).toBe(true);
            expect(result.applied).toBe(2);
        });
    });

    describe('Feedback权重调整', () => {
        it('多次成功反馈应增加successWeight', () => {
            // 使用AGGRESSIVE模式，其successWeight初始值更低
            learningPolicy.setPolicyMode('npc_001', 'AGGRESSIVE');
            
            const initialPolicy = learningPolicy.getPolicy('npc_001');
            const initialSuccessWeight = initialPolicy.successWeight;
            
            for (let i = 0; i < 3; i++) {
                learningPolicy.updatePolicy('npc_001', { type: 'success', value: 0.9 });
            }
            
            const updatedPolicy = learningPolicy.getPolicy('npc_001');
            
            expect(updatedPolicy.successWeight).toBeGreaterThan(initialSuccessWeight);
        });

        it('多次失败反馈应增加failureWeight', () => {
            const initialPolicy = learningPolicy.getPolicy('npc_001');
            const initialFailureWeight = initialPolicy.failureWeight;
            
            for (let i = 0; i < 3; i++) {
                learningPolicy.updatePolicy('npc_001', { type: 'failure', value: 0.2 });
            }
            
            const updatedPolicy = learningPolicy.getPolicy('npc_001');
            
            expect(updatedPolicy.failureWeight).toBeGreaterThan(initialFailureWeight);
        });
    });
});