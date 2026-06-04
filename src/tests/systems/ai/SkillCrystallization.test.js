/**
 * SkillCrystallization 单元测试
 * V277 Iteration 1/9 - NPC Self-Evolution Engine Core
 * 
 * 测试策略: 验证技能结晶化系统的各项功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SkillCrystallization } from '../../../systems/ai/SkillCrystallization.js';
import { ExperienceTracker } from '../../../systems/ai/ExperienceTracker.js';

describe('SkillCrystallization', () => {
    let skillCrystallization;
    let tracker;

    beforeEach(() => {
        skillCrystallization = new SkillCrystallization();
        tracker = new ExperienceTracker(100);
        skillCrystallization.setExperienceTracker(tracker);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('应该初始化skills Map为空', () => {
            expect(skillCrystallization.skills).toBeInstanceOf(Map);
            expect(skillCrystallization.skills.size).toBe(0);
        });

        it('应该初始化experienceTracker为null', () => {
            const newSkill = new SkillCrystallization();
            expect(newSkill.experienceTracker).toBeNull();
        });

        it('应该初始化patternHistory Map', () => {
            expect(skillCrystallization.patternHistory).toBeInstanceOf(Map);
        });
    });

    describe('setExperienceTracker', () => {
        it('应该设置experienceTracker', () => {
            skillCrystallization.setExperienceTracker(tracker);
            expect(skillCrystallization.experienceTracker).toBe(tracker);
        });
    });

    describe('detectPattern', () => {
        it('应该返回null当交互记录少于3条', () => {
            const interactions = [
                { type: 'trade', playerAction: 'buy', outcome: { success: true } }
            ];

            const pattern = skillCrystallization.detectPattern(interactions);

            expect(pattern).toBeNull();
        });

        it('应该返回null当没有足够连续成功模式', () => {
            const interactions = [
                { type: 'trade', playerAction: 'buy', outcome: { success: true } },
                { type: 'trade', playerAction: 'buy', outcome: { success: true } },
                { type: 'chat', playerAction: 'hello', outcome: { success: false } }
            ];

            const pattern = skillCrystallization.detectPattern(interactions);

            expect(pattern).toBeNull();
        });

        it('应该检测到连续3次相同的成功行为模式', () => {
            const interactions = [
                { type: 'trade', playerAction: 'buy sword', outcome: { success: true } },
                { type: 'trade', playerAction: 'buy sword', outcome: { success: true } },
                { type: 'trade', playerAction: 'buy sword', outcome: { success: true } }
            ];

            const pattern = skillCrystallization.detectPattern(interactions);

            expect(pattern).not.toBeNull();
            expect(pattern.type).toBe('trade');
            expect(pattern.playerAction).toBe('buy sword');
            expect(pattern.consecutiveCount).toBe(3);
        });

        it('应该检测到连续3次以上相同的成功模式并返回第一次达到阈值的结果', () => {
            const interactions = [
                { type: 'trade', playerAction: 'buy potion', outcome: { success: true } },
                { type: 'trade', playerAction: 'buy potion', outcome: { success: true } },
                { type: 'trade', playerAction: 'buy potion', outcome: { success: true } },
                { type: 'trade', playerAction: 'buy potion', outcome: { success: true } },
                { type: 'trade', playerAction: 'buy potion', outcome: { success: true } }
            ];

            const pattern = skillCrystallization.detectPattern(interactions);

            expect(pattern).not.toBeNull();
            expect(pattern.consecutiveCount).toBe(3); // Returns when first reaching 3
        });

        it('应该返回null当模式不匹配时', () => {
            const interactions = [
                { type: 'trade', playerAction: 'buy sword', outcome: { success: true } },
                { type: 'trade', playerAction: 'buy sword', outcome: { success: true } },
                { type: 'chat', playerAction: 'hello', outcome: { success: true } }
            ];

            const pattern = skillCrystallization.detectPattern(interactions);

            expect(pattern).toBeNull();
        });

        it('应该只检测连续成功的行为模式', () => {
            const interactions = [
                { type: 'trade', playerAction: 'buy sword', outcome: { success: true } },
                { type: 'trade', playerAction: 'buy sword', outcome: { success: false } },
                { type: 'trade', playerAction: 'buy sword', outcome: { success: true } },
                { type: 'trade', playerAction: 'buy sword', outcome: { success: true } }
            ];

            const pattern = skillCrystallization.detectPattern(interactions);

            expect(pattern).toBeNull();
        });

        it('应该返回包含confidence的模式', () => {
            const interactions = [
                { type: 'trade', playerAction: 'buy', outcome: { success: true } },
                { type: 'trade', playerAction: 'buy', outcome: { success: true } },
                { type: 'trade', playerAction: 'buy', outcome: { success: true } }
            ];

            const pattern = skillCrystallization.detectPattern(interactions);

            expect(pattern.confidence).toBeGreaterThan(0);
            expect(pattern.confidence).toBeLessThanOrEqual(1);
        });

        it('应该处理null/undefined interactions', () => {
            expect(skillCrystallization.detectPattern(null)).toBeNull();
            expect(skillCrystallization.detectPattern(undefined)).toBeNull();
        });
    });

    describe('crystallize', () => {
        it('应该将模式固化为技能', () => {
            const npcId = 'npc_001';
            const pattern = {
                type: 'trade',
                playerAction: 'buy sword',
                npcResponse: 'Here is your sword'
            };

            const result = skillCrystallization.crystallize(npcId, pattern);

            expect(result.success).toBe(true);
            expect(result.skill).toBeDefined();
            expect(result.skill.id).toContain('skill_');
            expect(result.skill.pattern.type).toBe('trade');
            expect(result.skill.useCount).toBe(0);
            expect(result.isUpdate).toBe(false);
        });

        it('应该拒绝无效模式', () => {
            const npcId = 'npc_001';
            const result = skillCrystallization.crystallize(npcId, { playerAction: 'test' });

            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invalid pattern');
        });

        it('应该拒绝空类型模式', () => {
            const npcId = 'npc_001';
            const result = skillCrystallization.crystallize(npcId, { type: null });

            expect(result.success).toBe(false);
        });

        it('应该为不同NPC维护独立的技能库', () => {
            const npc1 = 'npc_001';
            const npc2 = 'npc_002';

            skillCrystallization.crystallize(npc1, { type: 'trade', playerAction: 'buy' });
            skillCrystallization.crystallize(npc2, { type: 'chat', playerAction: 'hello' });

            const skills1 = skillCrystallization.getSkillLibrary(npc1);
            const skills2 = skillCrystallization.getSkillLibrary(npc2);

            expect(skills1.length).toBe(1);
            expect(skills2.length).toBe(1);
            expect(skills1[0].pattern.type).toBe('trade');
            expect(skills2[0].pattern.type).toBe('chat');
        });

        it('应该更新已存在技能的置信度', () => {
            const npcId = 'npc_001';
            const pattern = { type: 'trade', playerAction: 'buy' };

            skillCrystallization.crystallize(npcId, pattern);
            const result = skillCrystallization.crystallize(npcId, pattern);

            expect(result.success).toBe(true);
            expect(result.isUpdate).toBe(true);
            expect(result.skill.confidence).toBeGreaterThan(0.5);
        });

        it('应该为技能生成唯一ID', () => {
            const npcId = 'npc_001';
            const result1 = skillCrystallization.crystallize(npcId, { type: 'trade', playerAction: 'buy1' });
            const result2 = skillCrystallization.crystallize(npcId, { type: 'trade', playerAction: 'buy2' });

            expect(result1.skill.id).not.toBe(result2.skill.id);
        });

        it('应该包含pattern的所有字段', () => {
            const npcId = 'npc_001';
            const pattern = {
                type: 'combat',
                playerAction: 'attack',
                npcResponse: 'Take that!'
            };

            const result = skillCrystallization.crystallize(npcId, pattern);

            expect(result.skill.pattern.type).toBe('combat');
            expect(result.skill.pattern.playerAction).toBe('attack');
            expect(result.skill.pattern.npcResponse).toBe('Take that!');
        });
    });

    describe('recallSkill', () => {
        it('应该正确回忆技能', () => {
            const npcId = 'npc_001';
            const pattern = { type: 'trade', playerAction: 'buy sword' };
            const crystallizeResult = skillCrystallization.crystallize(npcId, pattern);

            const result = skillCrystallization.recallSkill(npcId, crystallizeResult.skill.id);

            expect(result.success).toBe(true);
            expect(result.skill.useCount).toBe(1);
            expect(result.triggered).toBe(true);
        });

        it('应该更新lastUsed时间戳', () => {
            const npcId = 'npc_001';
            const pattern = { type: 'trade', playerAction: 'buy' };
            const crystallizeResult = skillCrystallization.crystallize(npcId, pattern);

            const result = skillCrystallization.recallSkill(npcId, crystallizeResult.skill.id);

            expect(result.skill.lastUsed).toBeDefined();
            expect(result.skill.lastUsed).toBeGreaterThan(0);
        });

        it('应该返回失败当技能不存在', () => {
            const result = skillCrystallization.recallSkill('npc_001', 'nonexistent_skill');

            expect(result.success).toBe(false);
            expect(result.reason).toBe('Skill not found');
        });

        it('应该累加useCount', () => {
            const npcId = 'npc_001';
            const pattern = { type: 'trade', playerAction: 'buy' };
            const crystallizeResult = skillCrystallization.crystallize(npcId, pattern);
            const skillId = crystallizeResult.skill.id;

            skillCrystallization.recallSkill(npcId, skillId);
            skillCrystallization.recallSkill(npcId, skillId);
            const result = skillCrystallization.recallSkill(npcId, skillId);

            expect(result.skill.useCount).toBe(3);
        });
    });

    describe('getSkillLibrary', () => {
        it('应该返回NPC的所有已结晶技能', () => {
            const npcId = 'npc_001';
            skillCrystallization.crystallize(npcId, { type: 'trade', playerAction: 'buy1' });
            skillCrystallization.crystallize(npcId, { type: 'trade', playerAction: 'buy2' });

            const skills = skillCrystallization.getSkillLibrary(npcId);

            expect(skills.length).toBe(2);
        });

        it('应该返回空数组当NPC没有技能时', () => {
            const skills = skillCrystallization.getSkillLibrary('npc_nonexistent');
            expect(skills).toEqual([]);
        });

        it('应该返回技能的完整信息', () => {
            const npcId = 'npc_001';
            skillCrystallization.crystallize(npcId, { type: 'chat', playerAction: 'hello' });

            const skills = skillCrystallization.getSkillLibrary(npcId);

            expect(skills[0]).toHaveProperty('id');
            expect(skills[0]).toHaveProperty('pattern');
            expect(skills[0]).toHaveProperty('useCount');
            expect(skills[0]).toHaveProperty('lastUsed');
            expect(skills[0]).toHaveProperty('confidence');
            expect(skills[0]).toHaveProperty('createdAt');
        });
    });

    describe('autoTrigger', () => {
        it('应该返回失败当没有设置experienceTracker', () => {
            const newSkill = new SkillCrystallization();
            const result = newSkill.autoTrigger('npc_001', {});

            expect(result.success).toBe(false);
            expect(result.reason).toBe('No experience tracker set');
        });

        it('应该返回失败当没有检测到模式时', () => {
            const result = skillCrystallization.autoTrigger('npc_001', {});

            expect(result.success).toBe(false);
            expect(result.triggered).toBe(false);
            expect(result.reason).toBe('No pattern detected');
        });

        it('当检测到模式时应该自动结晶并触发', () => {
            const npcId = 'npc_001';
            
            // 记录3次连续相同成功行为
            tracker.track(npcId, { type: 'trade', playerAction: 'buy sword', outcome: { success: true } });
            tracker.track(npcId, { type: 'trade', playerAction: 'buy sword', outcome: { success: true } });
            tracker.track(npcId, { type: 'trade', playerAction: 'buy sword', outcome: { success: true } });

            const result = skillCrystallization.autoTrigger(npcId, {});

            expect(result.success).toBe(true);
            expect(result.triggered).toBe(true);
            expect(result.autoCrystallized).toBe(true);
        });

        it('当技能已存在时应该回忆技能', () => {
            const npcId = 'npc_001';
            const pattern = { type: 'trade', playerAction: 'buy sword' };
            
            // 先结晶
            skillCrystallization.crystallize(npcId, pattern);
            
            // 记录更多交互
            tracker.track(npcId, { type: 'trade', playerAction: 'buy sword', outcome: { success: true } });
            tracker.track(npcId, { type: 'trade', playerAction: 'buy sword', outcome: { success: true } });
            tracker.track(npcId, { type: 'trade', playerAction: 'buy sword', outcome: { success: true } });

            const result = skillCrystallization.autoTrigger(npcId, {});

            expect(result.success).toBe(true);
            expect(result.triggered).toBe(true);
            expect(result.autoCrystallized).toBeUndefined();
        });
    });

    describe('clearSkills', () => {
        it('应该清除指定NPC的所有技能', () => {
            const npcId = 'npc_001';
            skillCrystallization.crystallize(npcId, { type: 'trade', playerAction: 'buy' });
            skillCrystallization.crystallize(npcId, { type: 'chat', playerAction: 'hello' });

            const result = skillCrystallization.clearSkills(npcId);

            expect(result.success).toBe(true);
            expect(skillCrystallization.getSkillLibrary(npcId).length).toBe(0);
        });

        it('应该返回失败当NPC不存在', () => {
            const result = skillCrystallization.clearSkills('npc_nonexistent');

            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not found');
        });
    });

    describe('getSkillStats', () => {
        it('应该返回正确统计信息 - 空技能库', () => {
            const stats = skillCrystallization.getSkillStats('npc_001');

            expect(stats.totalSkills).toBe(0);
            expect(stats.totalUses).toBe(0);
            expect(stats.avgConfidence).toBe(0);
            expect(stats.mostUsedSkill).toBeNull();
        });

        it('应该返回正确统计信息', () => {
            const npcId = 'npc_001';
            const result1 = skillCrystallization.crystallize(npcId, { type: 'trade', playerAction: 'buy1' });
            const result2 = skillCrystallization.crystallize(npcId, { type: 'trade', playerAction: 'buy2' });

            skillCrystallization.recallSkill(npcId, result1.skill.id);
            skillCrystallization.recallSkill(npcId, result1.skill.id);
            skillCrystallization.recallSkill(npcId, result2.skill.id);

            const stats = skillCrystallization.getSkillStats(npcId);

            expect(stats.totalSkills).toBe(2);
            expect(stats.totalUses).toBe(3);
            expect(stats.avgConfidence).toBeGreaterThan(0);
            expect(stats.mostUsedSkill).toBe(result1.skill.id);
        });
    });

    describe('private methods', () => {
        it('_comparePatterns应该正确比较模式', () => {
            const record1 = { type: 'trade', playerAction: 'buy' };
            const record2 = { type: 'trade', playerAction: 'buy' };
            const record3 = { type: 'chat', playerAction: 'buy' };

            expect(skillCrystallization._comparePatterns(record1, record2)).toBe(true);
            expect(skillCrystallization._comparePatterns(record1, record3)).toBe(false);
        });

        it('_extractPattern应该提取模式字段', () => {
            const record = {
                type: 'combat',
                playerAction: 'attack',
                npcResponse: 'Take that!',
                extra: 'ignored'
            };

            const pattern = skillCrystallization._extractPattern(record);

            expect(pattern).toEqual({
                type: 'combat',
                playerAction: 'attack',
                npcResponse: 'Take that!'
            });
        });
    });
});