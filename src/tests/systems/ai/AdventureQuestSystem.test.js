/**
 * AdventureQuestSystem.test.js - 冒险任务系统测试
 * V332 Iteration 2/9 Round 6 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AdventureQuestSystem } from '../../../systems/ai/AdventureQuestSystem.js';

describe('AdventureQuestSystem', () => {
    let system;
    beforeEach(() => { system = new AdventureQuestSystem(); });

    describe('Default Templates', () => {
        it('should have templates', () => { expect(system.questTemplates.size).toBe(4); });
        it('should contain hunt_demon', () => { expect(system.getTemplate('hunt_demon')).not.toBeNull(); });
    });

    describe('createQuest', () => {
        it('should create', () => {
            const { quest } = system.createQuest({ name: 'Q1' });
            expect(quest.name).toBe('Q1');
        });

        it('should default to available', () => {
            const { quest } = system.createQuest({});
            expect(quest.status).toBe('available');
        });

        it('should use template difficulty', () => {
            const { quest } = system.createQuest({ templateId: 'hunt_demon' });
            expect(quest.difficulty).toBe(3);
        });

        it('should trigger questCreated hook', () => {
            let called = false;
            system.registerHook('questCreated', () => { called = true; });
            system.createQuest({});
            expect(called).toBe(true);
        });
    });

    describe('getQuest', () => {
        it('should return', () => {
            const { quest } = system.createQuest({});
            expect(system.getQuest(quest.questId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getQuest('ghost')).toBeNull(); });
    });

    describe('listQuests', () => {
        it('should list all', () => {
            system.createQuest({});
            expect(system.listQuests().length).toBe(1);
        });
    });

    describe('listQuestsByStatus', () => {
        it('should filter', () => {
            system.createQuest({});
            expect(system.listQuestsByStatus('available').length).toBe(1);
        });
    });

    describe('listQuestsByDifficulty', () => {
        it('should filter by range', () => {
            system.createQuest({ difficulty: 1 });
            system.createQuest({ difficulty: 5 });
            expect(system.listQuestsByDifficulty(3, 10).length).toBe(1);
        });
    });

    describe('getTemplate', () => {
        it('should return', () => { expect(system.getTemplate('hunt_demon')).not.toBeNull(); });
        it('should return null for missing', () => { expect(system.getTemplate('ghost')).toBeNull(); });
    });

    describe('listTemplates', () => {
        it('should list all', () => { expect(system.listTemplates().length).toBe(4); });
    });

    describe('acceptQuest', () => {
        it('should accept', () => {
            const { quest } = system.createQuest({});
            const result = system.acceptQuest(quest.questId, 'a1');
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.acceptQuest('ghost', 'a1');
            expect(result.error).toBe('QUEST_NOT_FOUND');
        });

        it('should reject unavailable', () => {
            const { quest } = system.createQuest({});
            system.acceptQuest(quest.questId, 'a1');
            const result = system.acceptQuest(quest.questId, 'a2');
            expect(result.error).toBe('QUEST_UNAVAILABLE');
        });

        it('should set adventurerId', () => {
            const { quest } = system.createQuest({});
            system.acceptQuest(quest.questId, 'a1');
            expect(quest.adventurerId).toBe('a1');
        });

        it('should trigger questAccepted hook', () => {
            const { quest } = system.createQuest({});
            let called = false;
            system.registerHook('questAccepted', () => { called = true; });
            system.acceptQuest(quest.questId, 'a1');
            expect(called).toBe(true);
        });
    });

    describe('completeQuest', () => {
        it('should complete', () => {
            const { quest } = system.createQuest({});
            system.acceptQuest(quest.questId, 'a1');
            const result = system.completeQuest(quest.questId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.completeQuest('ghost');
            expect(result.error).toBe('QUEST_NOT_FOUND');
        });

        it('should reject not active', () => {
            const { quest } = system.createQuest({});
            const result = system.completeQuest(quest.questId);
            expect(result.error).toBe('QUEST_NOT_ACTIVE');
        });

        it('should increment totalCompleted', () => {
            const { quest } = system.createQuest({});
            system.acceptQuest(quest.questId, 'a1');
            system.completeQuest(quest.questId);
            expect(system.stats.totalCompleted).toBe(1);
        });

        it('should remove from active', () => {
            const { quest } = system.createQuest({});
            system.acceptQuest(quest.questId, 'a1');
            system.completeQuest(quest.questId);
            expect(system.getActiveQuests('a1').length).toBe(0);
        });

        it('should add to completed', () => {
            const { quest } = system.createQuest({});
            system.acceptQuest(quest.questId, 'a1');
            system.completeQuest(quest.questId);
            expect(system.getCompletedQuests('a1').length).toBe(1);
        });

        it('should trigger questCompleted hook', () => {
            const { quest } = system.createQuest({});
            system.acceptQuest(quest.questId, 'a1');
            let called = false;
            system.registerHook('questCompleted', () => { called = true; });
            system.completeQuest(quest.questId);
            expect(called).toBe(true);
        });
    });

    describe('failQuest', () => {
        it('should fail', () => {
            const { quest } = system.createQuest({});
            system.acceptQuest(quest.questId, 'a1');
            const result = system.failQuest(quest.questId, 'died');
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.failQuest('ghost');
            expect(result.error).toBe('QUEST_NOT_FOUND');
        });

        it('should reject not active', () => {
            const { quest } = system.createQuest({});
            const result = system.failQuest(quest.questId);
            expect(result.error).toBe('QUEST_NOT_ACTIVE');
        });

        it('should set failure reason', () => {
            const { quest } = system.createQuest({});
            system.acceptQuest(quest.questId, 'a1');
            system.failQuest(quest.questId, 'died');
            expect(quest.failureReason).toBe('died');
        });

        it('should trigger questFailed hook', () => {
            const { quest } = system.createQuest({});
            system.acceptQuest(quest.questId, 'a1');
            let called = false;
            system.registerHook('questFailed', () => { called = true; });
            system.failQuest(quest.questId, 'x');
            expect(called).toBe(true);
        });
    });

    describe('getActiveQuests', () => {
        it('should return active', () => {
            const { quest } = system.createQuest({});
            system.acceptQuest(quest.questId, 'a1');
            expect(system.getActiveQuests('a1').length).toBe(1);
        });

        it('should return empty for missing', () => {
            expect(system.getActiveQuests('ghost').length).toBe(0);
        });
    });

    describe('getCompletedQuests', () => {
        it('should return completed', () => {
            const { quest } = system.createQuest({});
            system.acceptQuest(quest.questId, 'a1');
            system.completeQuest(quest.questId);
            expect(system.getCompletedQuests('a1').length).toBe(1);
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

        it('should execute default getQuest', () => {
            const result = system.executeTool('getQuest', { questId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('questCreated', () => count++);
            unregister();
            system.createQuest({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('questCreated', () => { throw new Error('x'); });
            expect(() => system.createQuest({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCompleted = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCompleted = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createQuest({});
            const json = system.toJSON();
            expect(json.quests.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createQuest({});
            const json = system.toJSON();
            const newSys = new AdventureQuestSystem();
            newSys.fromJSON(json);
            expect(newSys.quests.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.templateCount).toBe(4);
        });
    });
});