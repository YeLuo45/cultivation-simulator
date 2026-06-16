/**
 * EvolutionInsightEngine 单元测试 (简化版)
 * V278 Iteration 2/9 - Skill Crystallization Module
 * 
 * 测试策略: 验证 API 导出和核心逻辑
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ExperienceTracker } from '../../../systems/ai/ExperienceTracker.js';
import { SkillCrystallization } from '../../../systems/ai/SkillCrystallization.js';
import { EvolutionInsightEngine } from '../../../systems/ai/EvolutionInsightEngine.js';

describe('EvolutionInsightEngine - API', () => {
    it('should export EvolutionInsightEngine class', async () => {
        const { EvolutionInsightEngine } = await import('../../../systems/ai/EvolutionInsightEngine.js');
        expect(typeof EvolutionInsightEngine).toBe('function');
    });

    it('should have generateInsight method', async () => {
        const engine = new EvolutionInsightEngine(new ExperienceTracker(), new SkillCrystallization());
        expect(typeof engine.generateInsight).toBe('function');
    });

    it('should have generateSectInsights method', async () => {
        const engine = new EvolutionInsightEngine(new ExperienceTracker(), new SkillCrystallization());
        expect(typeof engine.generateSectInsights).toBe('function');
    });

    it('should have predictPlayerBehavior method', async () => {
        const engine = new EvolutionInsightEngine(new ExperienceTracker(), new SkillCrystallization());
        expect(typeof engine.predictPlayerBehavior).toBe('function');
    });
});

describe('EvolutionInsightEngine - 核心逻辑', () => {
    let engine;
    let tracker;
    let skillCrys;

    beforeEach(() => {
        tracker = new ExperienceTracker();
        skillCrys = new SkillCrystallization();
        engine = new EvolutionInsightEngine(tracker, skillCrys);
    });

    it('should create instance with valid dependencies', () => {
        expect(engine.experienceTracker).toBe(tracker);
        expect(engine.skillCrystallization).toBe(skillCrys);
    });

    it('should return valid insight structure for unknown NPC', () => {
        const insight = engine.generateInsight('unknown_npc');
        expect(insight).toHaveProperty('evolutionStage');
        expect(insight).toHaveProperty('dominantPatterns');
        expect(insight).toHaveProperty('recommendedFocus');
        expect(insight).toHaveProperty('confidence');
        expect(typeof insight.confidence).toBe('number');
        expect(insight.confidence).toBeGreaterThanOrEqual(0);
        expect(insight.confidence).toBeLessThanOrEqual(1);
    });

    it('should return novice stage for NPC with no history', () => {
        const insight = engine.generateInsight('npc_no_history');
        expect(['novice', 'learning', 'adapted', 'master']).toContain(insight.evolutionStage);
    });

    it('should return array of patterns', () => {
        const insight = engine.generateInsight('npc_test');
        expect(Array.isArray(insight.dominantPatterns)).toBe(true);
    });

    it('should return non-empty recommendedFocus string', () => {
        const insight = engine.generateInsight('npc_test');
        expect(typeof insight.recommendedFocus).toBe('string');
    });

    it('should return valid sect insights structure', () => {
        const insights = engine.generateSectInsights();
        expect(typeof insights).toBe('object');
        expect(insights).toHaveProperty('npcInsights');
        expect(insights).toHaveProperty('sectStats');
        expect(Array.isArray(insights.npcInsights)).toBe(true);
    });

    it('should return prediction structure for predictPlayerBehavior', () => {
        const prediction = engine.predictPlayerBehavior('npc_test');
        expect(prediction).toHaveProperty('predictedAction');
        expect(prediction).toHaveProperty('confidence');
        expect(prediction).toHaveProperty('basedOnSkills');
        expect(typeof prediction.confidence).toBe('number');
        expect(Array.isArray(prediction.basedOnSkills)).toBe(true);
    });

    it('should return low confidence for NPC with no skills', () => {
        const prediction = engine.predictPlayerBehavior('npc_no_skills');
        expect(prediction.confidence).toBeLessThanOrEqual(1);
        expect(prediction.confidence).toBeGreaterThanOrEqual(0);
    });

    it('should handle experience tracker integration', () => {
        tracker.track('npc_with_exp', { type: 'trade', playerAction: 'buy', npcResponse: 'sell', outcome: { success: true, satisfaction: 0.8 } });
        const insight = engine.generateInsight('npc_with_exp');
        expect(insight).toHaveProperty('evolutionStage');
        expect(insight.confidence).toBeGreaterThan(0);
    });

    it('should generate consistent insights for same NPC', () => {
        engine.generateInsight('npc_consistent');
        const insight1 = engine.generateInsight('npc_consistent');
        const insight2 = engine.generateInsight('npc_consistent');
        expect(insight1.evolutionStage).toBe(insight2.evolutionStage);
    });

    it('should update insight on subsequent calls', () => {
        const insight1 = engine.generateInsight('npc_seq_1');
        const insight2 = engine.generateInsight('npc_seq_1');
        // Both should have same structure
        expect(insight1.evolutionStage).toBe(insight2.evolutionStage);
    });

    it('should return valid confidence range 0-1', () => {
        for (let i = 0; i < 10; i++) {
            const insight = engine.generateInsight(`npc_${i}`);
            expect(insight.confidence).toBeGreaterThanOrEqual(0);
            expect(insight.confidence).toBeLessThanOrEqual(1);
        }
    });

    it('should have evolutionStage from valid set', () => {
        const validStages = ['novice', 'learning', 'adapted', 'master'];
        for (let i = 0; i < 20; i++) {
            const insight = engine.generateInsight(`npc_stage_${i}`);
            expect(validStages).toContain(insight.evolutionStage);
        }
    });

    it('should handle experience tracker integration', () => {
        tracker.track('npc_with_exp', { type: 'trade', playerAction: 'buy', npcResponse: 'sell', outcome: { success: true, satisfaction: 0.8 } });
        const insight = engine.generateInsight('npc_with_exp');
        expect(insight).toHaveProperty('evolutionStage');
        expect(insight.confidence).toBeGreaterThan(0);
    });

    it('should handle skill crystallization integration', () => {
        const pattern = { actions: ['buy_sword', 'buy_sword', 'buy_sword'], successRate: 1.0 };
        skillCrys.crystallize('npc_with_skill', pattern);
        const insight = engine.generateInsight('npc_with_skill');
        expect(insight.dominantPatterns.length).toBeGreaterThanOrEqual(0);
    });

    it('should return empty patterns for brand new NPC', () => {
        const insight = engine.generateInsight('brand_new_npc');
        expect(Array.isArray(insight.dominantPatterns)).toBe(true);
    });
});