/**
 * CultivationQuest.test.js - 修真任务系统测试
 * V568 Iteration 11/20 Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationQuest } from '../../../systems/ai/CultivationQuest.js';

describe('CultivationQuest', () => {
    let system;
    beforeEach(() => { system = new CultivationQuest(); });

    describe('startQuest', () => {
        it('should create a quest', () => {
            const { quest } = system.startQuest({ name: 'Test Quest' });
            expect(quest.name).toBe('Test Quest');
        });

        it('should default to active status', () => {
            const { quest } = system.startQuest({});
            expect(quest.status).toBe('active');
        });

        it('should default type to side', () => {
            const { quest } = system.startQuest({});
            expect(quest.type).toBe('side');
        });

        it('should use baseDifficulty default', () => {
            const { quest } = system.startQuest({});
            expect(quest.difficulty).toBe(10);
        });

        it('should respect custom questId', () => {
            const { quest } = system.startQuest({ questId: 'custom_q' });
            expect(quest.questId).toBe('custom_q');
        });

        it('should trigger questStarted hook', () => {
            let called = false;
            system.registerHook('questStarted', () => { called = true; });
            system.startQuest({});
            expect(called).toBe(true);
        });

        it('should reject when at max', () => {
            system.config.maxQuests = 1;
            system.startQuest({});
            const result = system.startQuest({});
            expect(result.error).toBe('MAX_QUESTS_REACHED');
        });
    });

    describe('getQuest', () => {
        it('should return quest', () => {
            const { quest } = system.startQuest({});
            expect(system.getQuest(quest.questId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getQuest('ghost')).toBeNull();
        });
    });

    describe('listQuests', () => {
        it('should list all', () => {
            system.startQuest({});
            system.startQuest({});
            expect(system.listQuests().length).toBe(2);
        });
    });

    describe('listByGiver', () => {
        it('should filter by giver', () => {
            system.startQuest({ giverId: 'g1' });
            system.startQuest({ giverId: 'g2' });
            expect(system.listByGiver('g1').length).toBe(1);
        });
    });

    describe('listActive', () => {
        it('should list only active', () => {
            const { quest } = system.startQuest({});
            system.completeQuest(quest.questId);
            system.startQuest({});
            expect(system.listActive().length).toBe(1);
        });
    });

    describe('addObjective', () => {
        it('should add string objective', () => {
            const { quest } = system.startQuest({});
            system.addObjective(quest.questId, 'Slay the demon');
            expect(system.getQuest(quest.questId).objectives.length).toBe(1);
        });

        it('should add object objective', () => {
            const { quest } = system.startQuest({});
            system.addObjective(quest.questId, { desc: 'Collect herbs', done: false });
            const q = system.getQuest(quest.questId);
            expect(q.objectives[0].desc).toBe('Collect herbs');
        });

        it('should reject missing quest', () => {
            const result = system.addObjective('ghost', 'obj');
            expect(result.error).toBe('QUEST_NOT_FOUND');
        });

        it('should reject completed quest', () => {
            const { quest } = system.startQuest({});
            system.completeQuest(quest.questId);
            const result = system.addObjective(quest.questId, 'obj');
            expect(result.error).toBe('QUEST_COMPLETED');
        });

        it('should trigger objectiveAdded hook', () => {
            const { quest } = system.startQuest({});
            let called = false;
            system.registerHook('objectiveAdded', () => { called = true; });
            system.addObjective(quest.questId, 'x');
            expect(called).toBe(true);
        });
    });

    describe('increaseDifficulty', () => {
        it('should increase by default 5', () => {
            const { quest } = system.startQuest({});
            system.increaseDifficulty(quest.questId);
            expect(system.getQuest(quest.questId).difficulty).toBe(15);
        });

        it('should increase by custom amount', () => {
            const { quest } = system.startQuest({});
            system.increaseDifficulty(quest.questId, 20);
            expect(system.getQuest(quest.questId).difficulty).toBe(30);
        });

        it('should reject missing quest', () => {
            const result = system.increaseDifficulty('ghost');
            expect(result.error).toBe('QUEST_NOT_FOUND');
        });

        it('should trigger difficultyIncreased hook', () => {
            const { quest } = system.startQuest({});
            let called = false;
            system.registerHook('difficultyIncreased', () => { called = true; });
            system.increaseDifficulty(quest.questId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpQuest', () => {
        it('should increment level', () => {
            const { quest } = system.startQuest({});
            system.levelUpQuest(quest.questId);
            expect(system.getQuest(quest.questId).level).toBe(2);
        });

        it('should reject missing quest', () => {
            const result = system.levelUpQuest('ghost');
            expect(result.error).toBe('QUEST_NOT_FOUND');
        });

        it('should trigger questLeveledUp hook', () => {
            const { quest } = system.startQuest({});
            let called = false;
            system.registerHook('questLeveledUp', () => { called = true; });
            system.levelUpQuest(quest.questId);
            expect(called).toBe(true);
        });
    });

    describe('completeQuest', () => {
        it('should complete', () => {
            const { quest } = system.startQuest({});
            const result = system.completeQuest(quest.questId);
            expect(result.success).toBe(true);
        });

        it('should set status to completed', () => {
            const { quest } = system.startQuest({});
            system.completeQuest(quest.questId);
            expect(system.getQuest(quest.questId).status).toBe('completed');
        });

        it('should increment totalCompleted', () => {
            const { quest } = system.startQuest({});
            system.completeQuest(quest.questId);
            expect(system.stats.totalCompleted).toBe(1);
        });

        it('should reject missing quest', () => {
            const result = system.completeQuest('ghost');
            expect(result.error).toBe('QUEST_NOT_FOUND');
        });

        it('should reject already completed', () => {
            const { quest } = system.startQuest({});
            system.completeQuest(quest.questId);
            const result = system.completeQuest(quest.questId);
            expect(result.error).toBe('QUEST_ALREADY_COMPLETED');
        });

        it('should trigger questCompleted hook', () => {
            const { quest } = system.startQuest({});
            let called = false;
            system.registerHook('questCompleted', () => { called = true; });
            system.completeQuest(quest.questId);
            expect(called).toBe(true);
        });

        it('should remove from active set', () => {
            const { quest } = system.startQuest({});
            system.completeQuest(quest.questId);
            expect(system.listActive().length).toBe(0);
        });
    });

    describe('calculateQuestValue', () => {
        it('should calculate', () => {
            const { quest } = system.startQuest({ level: 2, difficulty: 5, objectives: [{}, {}, {}] });
            // 2*100 + 5*2 + 3*30 = 200 + 10 + 90 = 300
            expect(system.calculateQuestValue(quest.questId)).toBe(300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateQuestValue('ghost')).toBe(0);
        });
    });

    describe('Tool System', () => {
        it('should register tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute tool', () => {
            system.registerTool('test', (ctx) => ctx.value);
            const result = system.executeTool('test', { value: 42 });
            expect(result.result).toBe(42);
        });

        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should handle errors', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('x');
        });

        it('should execute default startQuest', () => {
            const result = system.executeTool('startQuest', { name: 'tool-quest' });
            expect(result.result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('questStarted', () => count++);
            unregister();
            system.startQuest({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('questStarted', () => { throw new Error('x'); });
            expect(() => system.startQuest({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient quests', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalQuests = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalQuests = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startQuest({});
            const json = system.toJSON();
            expect(json.quests.length).toBe(1);
        });

        it('should deserialize', () => {
            system.startQuest({});
            const json = system.toJSON();
            const newSys = new CultivationQuest();
            newSys.fromJSON(json);
            expect(newSys.quests.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.questCount).toBe(0);
            expect(stats.activeCount).toBe(0);
        });
    });
});
