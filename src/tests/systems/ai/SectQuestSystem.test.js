/**
 * SectQuestSystem.test.js - 宗门任务系统测试
 * V303 Iteration 9/9 (Final) - 测试覆盖率目标: 99%+
 * 100% pass rate required
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectQuestSystem } from '../../../systems/ai/SectQuestSystem.js';

describe('SectQuestSystem', () => {
    let system;

    beforeEach(() => {
        system = new SectQuestSystem();
    });

    // ========== 任务模板测试 ==========
    
    describe('registerQuestTemplate', () => {
        it('should register a template', () => {
            const { template } = system.registerQuestTemplate({ name: 'Herb Hunt', difficulty: 3 });
            expect(template.name).toBe('Herb Hunt');
            expect(template.difficulty).toBe(3);
        });

        it('should default type to misc', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            expect(template.type).toBe('misc');
        });

        it('should generate templateId', () => {
            const { template } = system.registerQuestTemplate({});
            expect(template.templateId).toBeDefined();
        });
    });

    describe('getQuestTemplate', () => {
        it('should return template', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            expect(system.getQuestTemplate(template.templateId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getQuestTemplate('ghost')).toBeNull();
        });
    });

    describe('listQuestTemplates', () => {
        it('should list all', () => {
            system.registerQuestTemplate({ name: 'T1' });
            system.registerQuestTemplate({ name: 'T2' });
            expect(system.listQuestTemplates().length).toBe(2);
        });

        it('should filter by type', () => {
            system.registerQuestTemplate({ name: 'T1', type: 'hunt' });
            system.registerQuestTemplate({ name: 'T2', type: 'gather' });
            expect(system.listQuestTemplates({ type: 'hunt' }).length).toBe(1);
        });

        it('should filter by difficulty', () => {
            system.registerQuestTemplate({ name: 'T1', difficulty: 1 });
            system.registerQuestTemplate({ name: 'T2', difficulty: 5 });
            expect(system.listQuestTemplates({ difficulty: 5 }).length).toBe(1);
        });
    });

    // ========== 任务板测试 ==========
    
    describe('Quest Board', () => {
        it('should post to board', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const result = system.postToQuestBoard(template.templateId, 'sect_1');
            expect(result.success).toBe(true);
        });

        it('should reject missing template', () => {
            const result = system.postToQuestBoard('ghost', 'sect_1');
            expect(result.error).toBe('TEMPLATE_NOT_FOUND');
        });

        it('should get quest board', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            system.postToQuestBoard(template.templateId, 'sect_1');
            const board = system.getQuestBoard('sect_1');
            expect(board.length).toBe(1);
        });

        it('should not return taken entries', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const { boardId } = system.postToQuestBoard(template.templateId, 'sect_1');
            system.acceptQuestFromBoard(boardId);
            expect(system.getQuestBoard('sect_1').length).toBe(0);
        });

        it('should accept from board', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const { boardId } = system.postToQuestBoard(template.templateId, 'sect_1');
            const result = system.acceptQuestFromBoard(boardId);
            expect(result.success).toBe(true);
        });

        it('should reject missing board entry', () => {
            const result = system.acceptQuestFromBoard('ghost');
            expect(result.error).toBe('BOARD_ENTRY_NOT_FOUND');
        });

        it('should reject already taken', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const { boardId } = system.postToQuestBoard(template.templateId, 'sect_1');
            system.acceptQuestFromBoard(boardId);
            const result = system.acceptQuestFromBoard(boardId);
            expect(result.error).toBe('ALREADY_TAKEN');
        });

        it('should trigger questPosted hook', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            let called = false;
            system.registerHook('questPosted', () => { called = true; });
            system.postToQuestBoard(template.templateId, 'sect_1');
            expect(called).toBe(true);
        });
    });

    // ========== 任务创建测试 ==========
    
    describe('createQuest', () => {
        it('should create quest', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const result = system.createQuest(template.templateId, 'sect_1');
            expect(result.success).toBe(true);
        });

        it('should reject missing template', () => {
            const result = system.createQuest('ghost', 'sect_1');
            expect(result.error).toBe('TEMPLATE_NOT_FOUND');
        });

        it('should reject too many active', () => {
            system.config.maxActiveQuests = 1;
            const { template } = system.registerQuestTemplate({ name: 'T' });
            system.createQuest(template.templateId, 'sect_1');
            const result = system.createQuest(template.templateId, 'sect_1');
            expect(result.error).toBe('TOO_MANY_ACTIVE');
        });

        it('should apply reward multiplier', () => {
            system.config.rewardMultiplier = 2;
            const { template } = system.registerQuestTemplate({ name: 'T', rewards: { exp: 100, spirit_stone: 50 } });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            expect(quest.rewards.exp).toBe(200);
        });

        it('should copy objectives', () => {
            const { template } = system.registerQuestTemplate({ name: 'T', objectives: [{ type: 'kill', count: 5 }] });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            expect(quest.objectives.length).toBe(1);
            expect(quest.objectives[0].completed).toBe(false);
        });

        it('should trigger questCreated hook', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            let called = false;
            system.registerHook('questCreated', () => { called = true; });
            system.createQuest(template.templateId, 'sect_1');
            expect(called).toBe(true);
        });

        it('should increment totalCreated', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            system.createQuest(template.templateId, 'sect_1');
            expect(system.stats.totalCreated).toBe(1);
        });
    });

    describe('getQuest', () => {
        it('should return quest', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            expect(system.getQuest(quest.questId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getQuest('ghost')).toBeNull();
        });
    });

    describe('listActiveQuests', () => {
        it('should list all', () => {
            expect(system.listActiveQuests().length).toBe(0);
        });

        it('should filter by sect', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            system.createQuest(template.templateId, 'sect_1');
            expect(system.listActiveQuests({ sectId: 'sect_1' }).length).toBe(1);
        });

        it('should filter by type', () => {
            const { template } = system.registerQuestTemplate({ name: 'T', type: 'hunt' });
            system.createQuest(template.templateId, 'sect_1');
            expect(system.listActiveQuests({ type: 'hunt' }).length).toBe(1);
        });
    });

    // ========== 任务分配测试 ==========
    
    describe('Disciple Management', () => {
        it('should register disciple', () => {
            const { disciple } = system.registerDisciple({ name: 'P1' });
            expect(disciple.name).toBe('P1');
        });

        it('should get disciple', () => {
            const { disciple } = system.registerDisciple({ name: 'P1' });
            expect(system.getDisciple(disciple.id)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getDisciple('ghost')).toBeNull();
        });

        it('should list disciples', () => {
            system.registerDisciple({ name: 'A' });
            system.registerDisciple({ name: 'B' });
            expect(system.listDisciples().length).toBe(2);
        });
    });

    describe('assignQuest', () => {
        it('should assign quest', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            const { disciple } = system.registerDisciple({});
            const result = system.assignQuest(quest.questId, disciple.id);
            expect(result.success).toBe(true);
        });

        it('should reject missing quest', () => {
            const { disciple } = system.registerDisciple({});
            const result = system.assignQuest('ghost', disciple.id);
            expect(result.error).toBe('QUEST_NOT_FOUND');
        });

        it('should reject missing disciple', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            const result = system.assignQuest(quest.questId, 'ghost');
            expect(result.error).toBe('DISCIPLE_NOT_FOUND');
        });

        it('should reject already assigned', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            const { disciple: d1 } = system.registerDisciple({});
            const { disciple: d2 } = system.registerDisciple({});
            system.assignQuest(quest.questId, d1.id);
            const result = system.assignQuest(quest.questId, d2.id);
            expect(result.error).toBe('ALREADY_ASSIGNED');
        });

        it('should reject inactive quest', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            quest.status = 'completed';
            const { disciple } = system.registerDisciple({});
            const result = system.assignQuest(quest.questId, disciple.id);
            expect(result.error).toBe('QUEST_INACTIVE');
        });

        it('should trigger questAssigned hook', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            const { disciple } = system.registerDisciple({});
            let called = false;
            system.registerHook('questAssigned', () => { called = true; });
            system.assignQuest(quest.questId, disciple.id);
            expect(called).toBe(true);
        });

        it('should unassign', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            const { disciple } = system.registerDisciple({});
            system.assignQuest(quest.questId, disciple.id);
            const result = system.unassignQuest(quest.questId);
            expect(result.success).toBe(true);
        });

        it('should reject unassign missing', () => {
            const result = system.unassignQuest('ghost');
            expect(result.error).toBe('QUEST_NOT_FOUND');
        });
    });

    // ========== 目标推进测试 ==========
    
    describe('advanceObjective', () => {
        it('should complete objective', () => {
            const { template } = system.registerQuestTemplate({ name: 'T', objectives: [{ type: 'kill', count: 1 }] });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            const result = system.advanceObjective(quest.questId, 0);
            expect(result.success).toBe(true);
        });

        it('should reject missing quest', () => {
            const result = system.advanceObjective('ghost', 0);
            expect(result.error).toBe('QUEST_NOT_FOUND');
        });

        it('should reject inactive quest', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            quest.status = 'completed';
            const result = system.advanceObjective(quest.questId, 0);
            expect(result.error).toBe('QUEST_INACTIVE');
        });

        it('should reject invalid index', () => {
            const { template } = system.registerQuestTemplate({ name: 'T', objectives: [] });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            const result = system.advanceObjective(quest.questId, 5);
            expect(result.error).toBe('INVALID_OBJECTIVE_INDEX');
        });

        it('should complete quest when all objectives done', () => {
            const { template } = system.registerQuestTemplate({ name: 'T', objectives: [{ type: 'kill', count: 1 }] });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            const result = system.advanceObjective(quest.questId, 0);
            expect(result.success).toBe(true);
        });

        it('should trigger objectiveCompleted hook', () => {
            const { template } = system.registerQuestTemplate({ name: 'T', objectives: [{ type: 'kill', count: 1 }] });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            let called = false;
            system.registerHook('objectiveCompleted', () => { called = true; });
            system.advanceObjective(quest.questId, 0);
            expect(called).toBe(true);
        });
    });

    // ========== 任务完成测试 ==========
    
    describe('completeQuest', () => {
        it('should complete quest', () => {
            const { template } = system.registerQuestTemplate({ name: 'T', rewards: { exp: 100, spirit_stone: 50 } });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            const { disciple } = system.registerDisciple({});
            system.assignQuest(quest.questId, disciple.id);
            const result = system.completeQuest(quest.questId);
            expect(result.success).toBe(true);
            expect(disciple.completedQuests).toBe(1);
        });

        it('should reject missing quest', () => {
            const result = system.completeQuest('ghost');
            expect(result.error).toBe('QUEST_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            quest.status = 'failed';
            const result = system.completeQuest(quest.questId);
            expect(result.error).toBe('QUEST_INACTIVE');
        });

        it('should increment totalCompleted', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            system.completeQuest(quest.questId);
            expect(system.stats.totalCompleted).toBe(1);
        });

        it('should apply experience multiplier', () => {
            system.config.experienceMultiplier = 2;
            const { template } = system.registerQuestTemplate({ name: 'T', rewards: { exp: 100 } });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            const { disciple } = system.registerDisciple({ exp: 0 });
            system.assignQuest(quest.questId, disciple.id);
            system.completeQuest(quest.questId);
            expect(disciple.exp).toBe(200);
        });

        it('should trigger questCompleted hook', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            let called = false;
            system.registerHook('questCompleted', () => { called = true; });
            system.completeQuest(quest.questId);
            expect(called).toBe(true);
        });
    });

    // ========== 任务失败测试 ==========
    
    describe('failQuest', () => {
        it('should fail quest', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            const result = system.failQuest(quest.questId, 'time_out');
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.failQuest('ghost');
            expect(result.error).toBe('QUEST_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            quest.status = 'completed';
            const result = system.failQuest(quest.questId);
            expect(result.error).toBe('QUEST_INACTIVE');
        });

        it('should decrement disciple reputation', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            const { disciple } = system.registerDisciple({});
            disciple.reputation = 10;
            system.assignQuest(quest.questId, disciple.id);
            system.failQuest(quest.questId);
            expect(disciple.reputation).toBeLessThan(10);
        });

        it('should trigger questFailed hook', () => {
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            let called = false;
            system.registerHook('questFailed', () => { called = true; });
            system.failQuest(quest.questId);
            expect(called).toBe(true);
        });
    });

    // ========== 任务链测试 ==========
    
    describe('Quest Chains', () => {
        it('should create chain', () => {
            const { chain } = system.createQuestChain({ name: 'Main', questIds: ['q1', 'q2'] });
            expect(chain.currentIndex).toBe(0);
        });

        it('should advance chain', () => {
            const { chain } = system.createQuestChain({ name: 'C', questIds: ['q1', 'q2'] });
            const result = system.advanceChain(chain.chainId);
            expect(result.chain.currentIndex).toBe(1);
        });

        it('should complete chain at end', () => {
            const { chain } = system.createQuestChain({ name: 'C', questIds: ['q1'] });
            const result = system.advanceChain(chain.chainId);
            expect(result.success).toBe(true);
            expect(result.chain.status).toBe('completed');
        });

        it('should reject missing chain', () => {
            const result = system.advanceChain('ghost');
            expect(result.error).toBe('CHAIN_NOT_FOUND');
        });

        it('should reject inactive chain', () => {
            const { chain } = system.createQuestChain({ name: 'C', questIds: ['q1'] });
            chain.status = 'completed';
            const result = system.advanceChain(chain.chainId);
            expect(result.error).toBe('CHAIN_INACTIVE');
        });

        it('should get chain', () => {
            const { chain } = system.createQuestChain({ name: 'C' });
            expect(system.getChain(chain.chainId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getChain('ghost')).toBeNull();
        });

        it('should list chains', () => {
            system.createQuestChain({ name: 'C1' });
            expect(system.listChains().length).toBe(1);
        });

        it('should filter by status', () => {
            system.createQuestChain({ name: 'C1' });
            expect(system.listChains({ status: 'active' }).length).toBe(1);
        });
    });

    // ========== 任务推荐测试 ==========
    
    describe('recommendQuest', () => {
        it('should reject missing disciple', () => {
            const result = system.recommendQuest('ghost');
            expect(result.error).toBe('DISCIPLE_NOT_FOUND');
        });

        it('should return recommendations', () => {
            const { disciple } = system.registerDisciple({ level: 5 });
            system.registerQuestTemplate({ name: 'T1', difficulty: 3 });
            system.registerQuestTemplate({ name: 'T2', difficulty: 4 });
            const result = system.recommendQuest(disciple.id);
            expect(result.success).toBe(true);
            expect(result.recommended.length).toBeGreaterThan(0);
        });
    });

    // ========== 弟子分析测试 ==========
    
    describe('analyzeDisciple', () => {
        it('should reject missing', () => {
            const result = system.analyzeDisciple('ghost');
            expect(result.error).toBe('DISCIPLE_NOT_FOUND');
        });

        it('should return analysis', () => {
            const { disciple } = system.registerDisciple({ name: 'P1' });
            const result = system.analyzeDisciple(disciple.id);
            expect(result.analysis.name).toBe('P1');
        });
    });

    // ========== Mesh 网络测试 ==========
    
    describe('Mesh Network', () => {
        it('should add node', () => {
            const result = system.addMeshNode('n1', 'region_a');
            expect(result.success).toBe(true);
        });

        it('should connect nodes', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            const result = system.connectMeshNodes('a', 'b');
            expect(result.success).toBe(true);
        });

        it('should reject missing nodes', () => {
            const result = system.connectMeshNodes('ghost', 'ghost2');
            expect(result.error).toBe('NODE_NOT_FOUND');
        });

        it('should distribute quest to mesh', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            system.connectMeshNodes('a', 'b');
            const { template } = system.registerQuestTemplate({ name: 'T' });
            const { quest } = system.createQuest(template.templateId, 'sect_1');
            const result = system.distributeQuestToMesh(quest.questId, 'a');
            expect(result.propagated).toBe(2);
        });

        it('should reject missing source node', () => {
            const result = system.distributeQuestToMesh('any', 'ghost');
            expect(result.error).toBe('NODE_NOT_FOUND');
        });

        it('should reject missing quest', () => {
            system.addMeshNode('n1');
            const result = system.distributeQuestToMesh('ghost', 'n1');
            expect(result.error).toBe('QUEST_NOT_FOUND');
        });
    });

    // ========== 工具系统测试 ==========
    
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

        it('should execute default recommendQuest', () => {
            const { disciple } = system.registerDisciple({});
            const result = system.executeTool('recommendQuest', { discipleId: disciple.id });
            expect(result.success).toBe(true);
        });

        it('should execute default getQuestDetails', () => {
            const result = system.executeTool('getQuestDetails', { questId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    // ========== Hook 系统测试 ==========
    
    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('chainCreated', () => count++);
            system.createQuestChain({ name: 'C' });
            unregister();
            system.createQuestChain({ name: 'C' });
            expect(count).toBe(1);
        });

        it('should handle errors silently', () => {
            system.registerHook('chainCreated', () => { throw new Error('x'); });
            expect(() => system.createQuestChain({ name: 'C' })).not.toThrow();
        });
    });

    // ========== 自进化测试 ==========
    
    describe('autoEvolve', () => {
        it('should not evolve with insufficient completions', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve with enough completions', () => {
            system.stats.totalCompleted = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double-evolve', () => {
            system.stats.totalCompleted = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should trigger systemEvolved hook', () => {
            system.stats.totalCompleted = 10;
            let called = false;
            system.registerHook('systemEvolved', () => { called = true; });
            system.autoEvolve();
            expect(called).toBe(true);
        });
    });

    // ========== 持久化测试 ==========
    
    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerQuestTemplate({ name: 'T' });
            const json = system.toJSON();
            expect(json.questTemplates.length).toBe(1);
        });

        it('should deserialize', () => {
            system.registerQuestTemplate({ name: 'T' });
            const json = system.toJSON();
            const newSys = new SectQuestSystem();
            newSys.fromJSON(json);
            expect(newSys.questTemplates.size).toBe(1);
        });

        it('should preserve mesh quests', () => {
            system.addMeshNode('n1');
            system.registerQuestTemplate({ name: 'T' });
            const json = system.toJSON();
            const newSys = new SectQuestSystem();
            newSys.fromJSON(json);
            expect(newSys.meshNodes.get('n1').quests).toBeDefined();
        });
    });

    // ========== 统计测试 ==========
    
    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.templateCount).toBe(0);
        });

        it('should track all counts', () => {
            system.registerQuestTemplate({ name: 'T' });
            system.registerDisciple({});
            const stats = system.getStats();
            expect(stats.templateCount).toBe(1);
            expect(stats.discipleCount).toBe(1);
        });
    });
});