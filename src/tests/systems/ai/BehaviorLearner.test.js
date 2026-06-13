/**
 * BehaviorLearner 单元测试
 * V277 Iteration 1/9 - NPC Self-Evolution Engine Core
 * 
 * 测试策略: 验证行为学习器的各项功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ExperienceTracker } from '../../../systems/ai/ExperienceTracker.js';
import { BehaviorLearner } from '../../../systems/ai/BehaviorLearner.js';

describe('BehaviorLearner', () => {
    let tracker;
    let learner;

    beforeEach(() => {
        tracker = new ExperienceTracker(100);
        learner = new BehaviorLearner(tracker);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('应该使用提供的ExperienceTracker创建实例', () => {
            const customTracker = new ExperienceTracker(50);
            const customLearner = new BehaviorLearner(customTracker);
            
            expect(customLearner.experienceTracker).toBe(customTracker);
        });

        it('应该在没有提供tracker时创建新的ExperienceTracker', () => {
            const newLearner = new BehaviorLearner();
            expect(newLearner.experienceTracker).toBeInstanceOf(ExperienceTracker);
        });

        it('应该初始化空的learningPatterns Map', () => {
            expect(learner.learningPatterns).toBeInstanceOf(Map);
            expect(learner.learningPatterns.size).toBe(0);
        });

        it('应该初始化空的responseCache Map', () => {
            expect(learner.responseCache).toBeInstanceOf(Map);
            expect(learner.responseCache.size).toBe(0);
        });
    });

    describe('learn', () => {
        it('应该返回默认行为模式当没有记录时', () => {
            const pattern = learner.learn('npc_001');

            expect(pattern).toEqual({
                friendliness: 0.5,
                taskSuccessRate: 0.5,
                dialoguePreference: 'neutral',
                adaptationScore: 0
            });
        });

        it('应该学习并返回调整后的行为模式', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, {
                type: 'trade',
                playerAction: 'buy sword',
                outcome: { success: true, satisfaction: 0.8 }
            });

            const pattern = learner.learn(npcId);

            expect(pattern).toBeDefined();
            expect(pattern.friendliness).toBeGreaterThan(0);
            expect(pattern.taskSuccessRate).toBe(1);
            expect(pattern.adaptationScore).toBeGreaterThan(0);
        });

        it('应该增加learnCount', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { type: 'trade' });
            
            learner.learn(npcId);
            learner.learn(npcId);

            const learningPattern = learner.getLearningPattern(npcId);
            expect(learningPattern.learnCount).toBe(2);
        });

        it('应该分析玩家偏好', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { type: 'trade', playerAction: 'buy item' });
            tracker.track(npcId, { type: 'trade', playerAction: 'sell item' });
            tracker.track(npcId, { type: 'trade', playerAction: 'buy item' });

            const pattern = learner.learn(npcId);

            expect(pattern.preferredInteractionType).toBe('trade');
        });

        it('应该识别成功的交互类型', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { type: 'trade', outcome: { success: true } });
            tracker.track(npcId, { type: 'trade', outcome: { success: true } });
            tracker.track(npcId, { type: 'chat', outcome: { success: false } });

            const pattern = learner.learn(npcId);

            expect(pattern.preferredInteractionType).toBe('trade');
            expect(pattern.taskSuccessRate).toBeCloseTo(0.67, 1);
        });
    });

    describe('suggestResponse', () => {
        it('应该返回默认响应当没有记录时', () => {
            const response = learner.suggestResponse('npc_001', { type: 'trade' });

            expect(typeof response).toBe('string');
            expect(response.length).toBeGreaterThan(0);
        });

        it('应该基于历史成功响应生成建议', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, {
                type: 'trade',
                playerAction: 'buy sword',
                npcResponse: 'Here is your sword',
                outcome: { success: true, satisfaction: 0.9 }
            });

            const response = learner.suggestResponse(npcId, { type: 'trade', playerAction: 'buy sword' });

            expect(typeof response).toBe('string');
        });

        it('应该为不同类型返回不同的默认响应', () => {
            const npcId = 'npc_001';
            
            const tradeResponse = learner.suggestResponse(npcId, { type: 'trade' });
            const chatResponse = learner.suggestResponse(npcId, { type: 'chat' });
            const combatResponse = learner.suggestResponse(npcId, { type: 'combat' });

            expect(tradeResponse).toContain('交易');
            expect(chatResponse).toContain('聊天');
            expect(combatResponse).toContain('战斗');
        });

        it('应该查找相似上下文的成功响应', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, {
                type: 'trade',
                playerAction: 'buy potion',
                npcResponse: 'Here is your potion',
                outcome: { success: true, satisfaction: 0.8 }
            });

            const response = learner.suggestResponse(npcId, {
                type: 'trade',
                playerAction: 'buy potion'
            });

            expect(response).toBeDefined();
        });
    });

    describe('getAdaptationScore', () => {
        it('应该返回0当没有记录时', () => {
            const score = learner.getAdaptationScore('npc_empty');
            expect(score).toBe(0);
        });

        it('应该返回基于tracker计算的适应度分数', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { outcome: { success: true, satisfaction: 0.8 } });

            const score = learner.getAdaptationScore(npcId);

            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThanOrEqual(1);
        });
    });

    describe('reset', () => {
        it('应该重置指定NPC的学习状态', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { type: 'trade' });
            learner.learn(npcId);
            learner.suggestResponse(npcId, { type: 'trade' });

            const result = learner.reset(npcId);

            expect(result.success).toBe(true);
            expect(learner.getLearningPattern(npcId)).toBeNull();
        });

        it('应该清除learningPatterns和responseCache', () => {
            const npcId = 'npc_001';
            learner.learn(npcId);
            
            learner.reset(npcId);

            expect(learner.learningPatterns.has(npcId)).toBe(false);
            expect(learner.responseCache.has(npcId)).toBe(false);
        });
    });

    describe('getLearningPattern', () => {
        it('应该返回null当没有学习模式时', () => {
            const pattern = learner.getLearningPattern('npc_001');
            expect(pattern).toBeNull();
        });

        it('应该返回学习后的模式', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { type: 'trade' });
            learner.learn(npcId);

            const pattern = learner.getLearningPattern(npcId);

            expect(pattern).not.toBeNull();
            expect(pattern.playerPreferences).toBeDefined();
            expect(pattern.successPatterns).toBeDefined();
        });

        it('应该包含lastLearned时间戳', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { type: 'trade' });
            learner.learn(npcId);

            const pattern = learner.getLearningPattern(npcId);

            expect(pattern.lastLearned).toBeDefined();
            expect(typeof pattern.lastLearned).toBe('number');
        });
    });

    describe('_analyzePlayerPreferences', () => {
        it('应该分析并返回玩家偏好', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { type: 'trade', playerAction: 'buy sword', outcome: { success: true, satisfaction: 0.9 } });
            tracker.track(npcId, { type: 'trade', playerAction: 'buy sword', outcome: { success: true, satisfaction: 0.7 } });
            tracker.track(npcId, { type: 'chat', playerAction: 'hello', outcome: { success: false, satisfaction: 0.2 } });

            learner.learn(npcId);
            const pattern = learner.getLearningPattern(npcId);

            expect(pattern.playerPreferences.preferredType).toBe('trade');
            expect(pattern.playerPreferences.preferredAction).toBe('buy sword');
            expect(pattern.playerPreferences.likedTypes).toHaveProperty('trade');
            expect(pattern.playerPreferences.likedTypes).toHaveProperty('chat');
        });
    });

    describe('_analyzeSuccessPatterns', () => {
        it('应该分析成功模式', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { type: 'trade', outcome: { success: true } });
            tracker.track(npcId, { type: 'trade', outcome: { success: true } });
            tracker.track(npcId, { type: 'chat', outcome: { success: false } });

            learner.learn(npcId);
            const pattern = learner.getLearningPattern(npcId);

            expect(pattern.successPatterns.avgSuccessRate).toBeCloseTo(0.67, 1);
            expect(pattern.successPatterns.successfulTypes).toContain('trade');
        });
    });

    describe('_generateBehaviorPattern', () => {
        it('应该生成包含所有必要属性的行为模式', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { type: 'trade', outcome: { success: true, satisfaction: 0.8 } });

            const behaviorPattern = learner.learn(npcId);

            expect(behaviorPattern).toHaveProperty('friendliness');
            expect(behaviorPattern).toHaveProperty('taskSuccessRate');
            expect(behaviorPattern).toHaveProperty('dialoguePreference');
            expect(behaviorPattern).toHaveProperty('adaptationScore');
            expect(behaviorPattern).toHaveProperty('preferredInteractionType');
            expect(behaviorPattern).toHaveProperty('recommendedResponseStyle');
        });

        it('友好度应该在0-1之间', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { outcome: { success: true, satisfaction: 0.8 } });

            const behaviorPattern = learner.learn(npcId);

            expect(behaviorPattern.friendliness).toBeGreaterThanOrEqual(0);
            expect(behaviorPattern.friendliness).toBeLessThanOrEqual(1);
        });
    });

    describe('_findSimilarRecords', () => {
        it('应该找到相似的记录', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { type: 'trade', playerAction: 'buy sword' });
            tracker.track(npcId, { type: 'chat', playerAction: 'hello' });

            const records = tracker.getRecords(npcId);
            const similar = learner._findSimilarRecords(records, { type: 'trade' });

            expect(similar.length).toBe(1);
            expect(similar[0].type).toBe('trade');
        });

        it('应该基于playerAction过滤记录', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { type: 'trade', playerAction: 'buy sword' });
            tracker.track(npcId, { type: 'trade', playerAction: 'sell sword' });

            const records = tracker.getRecords(npcId);
            const similar = learner._findSimilarRecords(records, { playerAction: 'buy' });

            expect(similar.length).toBe(1);
        });
    });

    describe('_selectBestResponse', () => {
        it('应该选择最佳响应', () => {
            const records = [
                { npcResponse: 'Response A', outcome: { success: false, satisfaction: 0.5 } },
                { npcResponse: 'Response B', outcome: { success: true, satisfaction: 0.8 } }
            ];

            const best = learner._selectBestResponse(records);

            expect(best.npcResponse).toBe('Response B');
        });

        it('当成功率相同时应该选择满意度更高的', () => {
            const records = [
                { npcResponse: 'Response A', outcome: { success: true, satisfaction: 0.6 } },
                { npcResponse: 'Response B', outcome: { success: true, satisfaction: 0.9 } }
            ];

            const best = learner._selectBestResponse(records);

            expect(best.npcResponse).toBe('Response B');
        });
    });
});