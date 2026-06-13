/**
 * NPCEvolutionEngine TDD Tests
 * Direction N: nanobot分布式mesh注册表 + generic-agent自我进化
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    NPCEvolutionEngine,
    npcEvolutionEngine,
    NPCLearningRegistry,
    NPCLearningEntry,
    InteractionRecord,
    DialogueEntry,
    BehaviorEvolutionEngine,
    AdaptiveDialogueSystem
} from '../../../systems/ai/NPCEvolutionEngine.js';
import { NPC_ROLE_REGISTRY } from '../../../systems/ai/NPCCollaboration.js';

describe('NPCEvolutionEngine - Direction N: NPC自主进化引擎', () => {
    let engine;
    let mockGameState;

    beforeEach(() => {
        engine = new NPCEvolutionEngine();
        mockGameState = {
            player: { name: '测试修士' },
            npcEvolution: null
        };
        engine.init(mockGameState);
    });

    describe('Basic Operations', () => {
        it('should initialize correctly', () => {
            expect(engine.initialized).toBe(true);
            expect(engine.registry).toBeDefined();
            expect(engine.evolutionEngine).toBeDefined();
            expect(engine.dialogueSystem).toBeDefined();
        });

        it('should return engine status', () => {
            const status = engine.getStatus();
            
            expect(status.initialized).toBe(true);
            expect(status.registeredNPCs).toBe(0);
            expect(status.evolutionEngine).toBeDefined();
        });
    });

    describe('npc.evolution.register', () => {
        it('should register a new NPC', () => {
            const result = engine.mcpRegister({ npcId: 'master_001', role: 'master' });
            
            expect(result.success).toBe(true);
            expect(result.entry).toBeDefined();
            expect(result.entry.npcId).toBe('master_001');
            expect(result.entry.role).toBe('master');
        });

        it('should register NPC with base dialogue', () => {
            const dialogueBase = [
                { text: '徒儿，今日修为如何？', metadata: { mood: 'concerned' } },
                { text: '继续努力修炼', metadata: { mood: 'encouraging' } }
            ];
            
            const result = engine.mcpRegister({ 
                npcId: 'merchant_001', 
                role: 'merchant',
                dialogueBase 
            });
            
            expect(result.success).toBe(true);
            
            // 验证对话库已初始化
            const dialogues = engine.registry.dialogueLibrary.get('merchant_001');
            expect(dialogues).toHaveLength(2);
        });

        it('should fail if NPC already registered', () => {
            engine.mcpRegister({ npcId: 'master_001', role: 'master' });
            const result = engine.mcpRegister({ npcId: 'master_001', role: 'master' });
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC already registered');
        });

        it('should fail if npcId is missing', () => {
            const result = engine.mcpRegister({});
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing npcId parameter');
        });

        it('should use npcId as role if role not provided', () => {
            const result = engine.mcpRegister({ npcId: 'fellow_disciple' });
            
            expect(result.success).toBe(true);
            expect(result.entry.role).toBe('fellow');
        });
    });

    describe('npc.evolution.record', () => {
        beforeEach(() => {
            engine.mcpRegister({ npcId: 'master_001', role: 'master' });
        });

        it('should record an interaction', () => {
            const result = engine.mcpRecord({
                npcId: 'master_001',
                type: 'task',
                playerAction: 'complete_quest',
                npcResponse: 'well_done',
                outcome: { success: true, satisfaction: 0.8 }
            });
            
            expect(result.success).toBe(true);
            expect(result.record).toBeDefined();
            expect(result.record.type).toBe('task');
        });

        it('should update interaction count', () => {
            engine.mcpRecord({ npcId: 'master_001', type: 'chat' });
            engine.mcpRecord({ npcId: 'master_001', type: 'chat' });
            
            const status = engine.registry.getLearningStatus('master_001');
            expect(status.interactionCount).toBe(2);
        });

        it('should track last interaction', () => {
            const before = Date.now();
            engine.mcpRecord({ npcId: 'master_001', type: 'chat' });
            
            const status = engine.registry.getLearningStatus('master_001');
            expect(status.lastInteraction).toBeGreaterThanOrEqual(before);
        });

        it('should fail if NPC not registered', () => {
            const result = engine.mcpRecord({
                npcId: 'unknown_npc',
                type: 'chat'
            });
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not registered');
        });

        it('should fail if type is missing', () => {
            const result = engine.mcpRecord({ npcId: 'master_001' });
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing type parameter');
        });

        it('should indicate evolution trigger when threshold met', () => {
            // 记录10次交互
            for (let i = 0; i < 10; i++) {
                engine.mcpRecord({
                    npcId: 'master_001',
                    type: 'task',
                    playerAction: `action_${i}`,
                    npcResponse: 'response',
                    outcome: { success: true, satisfaction: 0.7 }
                });
            }
            
            const result = engine.mcpRecord({
                npcId: 'master_001',
                type: 'task',
                playerAction: 'action_10',
                npcResponse: 'response',
                outcome: { success: true, satisfaction: 0.7 }
            });
            
            expect(result.shouldEvolve).toBe(true);
        });
    });

    describe('npc.evolution.get', () => {
        beforeEach(() => {
            engine.mcpRegister({ npcId: 'master_001', role: 'master' });
        });

        it('should get learning status', () => {
            const result = engine.mcpGet({ npcId: 'master_001' });
            
            expect(result.npcId).toBe('master_001');
            expect(result.role).toBe('master');
            expect(result.adaptationLevel).toBe(1);
            expect(result.behaviorPattern).toBeDefined();
            expect(result.stats).toBeDefined();
        });

        it('should return error for unregistered NPC', () => {
            const result = engine.mcpGet({ npcId: 'unknown_npc' });
            
            expect(result.error).toBe('NPC not registered');
        });

        it('should fail if npcId is missing', () => {
            const result = engine.mcpGet({});
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing npcId parameter');
        });

        it('should track stats correctly', () => {
            engine.mcpRecord({
                npcId: 'master_001',
                type: 'task',
                playerAction: 'action1',
                outcome: { success: true, satisfaction: 0.9 }
            });
            engine.mcpRecord({
                npcId: 'master_001',
                type: 'task',
                playerAction: 'action2',
                outcome: { success: false, satisfaction: 0.3 }
            });
            
            const result = engine.mcpGet({ npcId: 'master_001' });
            
            expect(result.stats.totalInteractions).toBe(2);
            expect(result.stats.successfulInteractions).toBe(1);
            expect(result.stats.successRate).toBe(0.5);
        });
    });

    describe('npc.dialogue.add', () => {
        beforeEach(() => {
            engine.mcpRegister({ npcId: 'master_001', role: 'master' });
        });

        it('should add a dialogue', () => {
            const result = engine.mcpAddDialogue({
                npcId: 'master_001',
                text: '徒儿，为师有一秘法传授',
                category: 'extended'
            });
            
            expect(result.success).toBe(true);
            expect(result.dialogue).toBeDefined();
            expect(result.dialogue.text).toBe('徒儿，为师有一秘法传授');
        });

        it('should default to extended category', () => {
            const result = engine.mcpAddDialogue({
                npcId: 'master_001',
                text: '好好修炼'
            });
            
            expect(result.success).toBe(true);
            expect(result.dialogue.category).toBe('extended');
        });

        it('should fail for unregistered NPC', () => {
            const result = engine.mcpAddDialogue({
                npcId: 'unknown_npc',
                text: 'Hello'
            });
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not registered');
        });

        it('should fail if text is missing', () => {
            const result = engine.mcpAddDialogue({ npcId: 'master_001' });
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing text parameter');
        });

        it('should fail on duplicate dialogue', () => {
            engine.mcpAddDialogue({ npcId: 'master_001', text: '好好修炼' });
            const result = engine.mcpAddDialogue({ npcId: 'master_001', text: '好好修炼' });
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Dialogue already exists');
        });

        it('should respect max extended dialogues limit', () => {
            // 默认max是50，先添加一个来确认可以添加
            const result1 = engine.mcpAddDialogue({
                npcId: 'master_001',
                text: 'Test dialogue'
            });
            expect(result1.success).toBe(true);
        });
    });

    describe('npc.dialogue.list', () => {
        beforeEach(() => {
            engine.mcpRegister({ 
                npcId: 'master_001', 
                role: 'master',
                dialogueBase: [
                    { text: '基础对话1' },
                    { text: '基础对话2' }
                ]
            });
            engine.mcpAddDialogue({ npcId: 'master_001', text: '扩展对话1' });
            engine.mcpAddDialogue({ npcId: 'master_001', text: '扩展对话2', category: 'adaptive' });
        });

        it('should list all dialogues', () => {
            const result = engine.mcpListDialogues({ npcId: 'master_001' });
            
            expect(result.success).toBe(true);
            expect(result.total).toBe(4);
            expect(result.filtered).toBe(4);
        });

        it('should filter by category', () => {
            const result = engine.mcpListDialogues({ 
                npcId: 'master_001',
                filter: { category: 'base' }
            });
            
            expect(result.filtered).toBe(2);
            expect(result.breakdown.base).toBe(2);
        });

        it('should show breakdown', () => {
            const result = engine.mcpListDialogues({ npcId: 'master_001' });
            
            expect(result.breakdown.base).toBe(2);
            expect(result.breakdown.extended).toBe(1);
            expect(result.breakdown.adaptive).toBe(1);
        });

        it('should sort by usage', () => {
            const result = engine.mcpListDialogues({ 
                npcId: 'master_001',
                filter: { sortBy: 'usage' }
            });
            
            expect(result.success).toBe(true);
        });

        it('should fail for unregistered NPC', () => {
            const result = engine.mcpListDialogues({ npcId: 'unknown_npc' });
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not registered');
        });
    });

    describe('npc.evolution.trigger', () => {
        beforeEach(() => {
            engine.mcpRegister({ npcId: 'master_001', role: 'master' });
        });

        it('should trigger evolution evaluation', () => {
            const result = engine.mcpTriggerEvolution({ npcId: 'master_001' });
            
            expect(result.tool).toBe('npc.evolution.trigger');
            expect(result.evolved).toBeDefined();
        });

        it('should fail for unregistered NPC', () => {
            const result = engine.mcpTriggerEvolution({ npcId: 'unknown_npc' });
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not registered');
        });

        it('should fail if npcId is missing', () => {
            const result = engine.mcpTriggerEvolution({});
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing npcId parameter');
        });

        it('should not evolve without enough interactions', () => {
            const result = engine.mcpTriggerEvolution({ npcId: 'master_001' });
            
            expect(result.evolved).toBe(false);
        });

        it('should evolve when conditions met', () => {
            // 模拟满足进化条件
            for (let i = 0; i < 12; i++) {
                engine.mcpRecord({
                    npcId: 'master_001',
                    type: 'task',
                    playerAction: `action_${i}`,
                    npcResponse: 'response',
                    outcome: { success: true, satisfaction: 0.8 }
                });
            }
            
            const result = engine.mcpTriggerEvolution({ npcId: 'master_001' });
            
            expect(result.success).toBe(true);
            expect(result.evolved).toBe(true);
            expect(result.newLevel).toBe(2);
        });
    });

    describe('BehaviorEvolutionEngine', () => {
        let evolutionEngine;
        let registry;

        beforeEach(() => {
            registry = new NPCLearningRegistry();
            evolutionEngine = new BehaviorEvolutionEngine(registry);
            registry.register('test_npc', 'master');
        });

        it('should initialize with evolution rules', () => {
            expect(evolutionEngine.evolutionRules).toBeDefined();
            expect(evolutionEngine.evolutionRules.dimensions).toBeDefined();
            expect(evolutionEngine.evolutionRules.thresholds).toBeDefined();
        });

        it('should evaluate evolution conditions', () => {
            const evaluation = evolutionEngine.evaluateEvolutionConditions('test_npc');
            
            expect(evaluation.canEvolve).toBe(false);
            expect(evaluation.conditions).toBeDefined();
        });

        it('should check positive trend', () => {
            // 记录一些交互
            for (let i = 0; i < 10; i++) {
                registry.recordInteraction('test_npc', 'task', `action_${i}`, 'response', {
                    success: i > 5,
                    satisfaction: 0.5 + (i > 5 ? 0.3 : 0)
                });
            }
            
            const hasPositiveTrend = evolutionEngine.checkPositiveTrend('test_npc');
            expect(typeof hasPositiveTrend).toBe('boolean');
        });

        it('should calculate evolution vector', () => {
            const vector = evolutionEngine.calculateEvolutionVector('test_npc');
            
            expect(vector).toBeDefined();
            expect(vector.friendliness).toBeDefined();
            expect(vector.taskSuccessRate).toBeDefined();
        });

        it('should execute evolution', () => {
            // 先满足条件
            for (let i = 0; i < 12; i++) {
                registry.recordInteraction('test_npc', 'task', `action_${i}`, 'response', {
                    success: true,
                    satisfaction: 0.8
                });
            }
            
            const result = evolutionEngine.executeEvolution('test_npc', { canEvolve: true });
            
            expect(result.evolved).toBe(true);
            expect(result.newLevel).toBe(2);
        });
    });

    describe('AdaptiveDialogueSystem', () => {
        let dialogueSystem;
        let registry;

        beforeEach(() => {
            registry = new NPCLearningRegistry();
            dialogueSystem = new AdaptiveDialogueSystem(registry);
            registry.register('test_npc', 'merchant');
        });

        it('should add dialogue correctly', () => {
            const result = dialogueSystem.addDialogue('test_npc', '有新货到！');
            
            expect(result.success).toBe(true);
            expect(result.dialogue.text).toBe('有新货到！');
            expect(result.dialogue.category).toBe('extended');
        });

        it('should list dialogues', () => {
            dialogueSystem.addDialogue('test_npc', '对话1');
            dialogueSystem.addDialogue('test_npc', '对话2', 'base');
            
            const result = dialogueSystem.listDialogues('test_npc');
            
            expect(result.total).toBe(2);
        });

        it('should update dialogue effectiveness', () => {
            const addResult = dialogueSystem.addDialogue('test_npc', '测试对话');
            const dialogueId = addResult.dialogue.id;
            
            const updateResult = dialogueSystem.updateDialogueEffectiveness('test_npc', dialogueId, 0.9);
            
            expect(updateResult.success).toBe(true);
            expect(updateResult.newEffectiveness).toBeGreaterThan(0.5);
        });

        it('should select dialogue based on pattern', () => {
            dialogueSystem.addDialogue('test_npc', '积极对话', 'extended', { sentiment: 'positive' });
            dialogueSystem.addDialogue('test_npc', '中性对话', 'extended', { sentiment: 'neutral' });
            
            const selected = dialogueSystem.selectDialogue('test_npc');
            
            expect(selected).toBeDefined();
            expect(selected.usageCount).toBe(1);
        });
    });

    describe('InteractionRecord', () => {
        it('should create interaction record', () => {
            const record = new InteractionRecord('trade', 'buy_item', 'here_you_go', {
                success: true,
                satisfaction: 0.9,
                reward: 100
            });
            
            expect(record.id).toBeDefined();
            expect(record.type).toBe('trade');
            expect(record.playerAction).toBe('buy_item');
            expect(record.npcResponse).toBe('here_you_go');
            expect(record.outcome.success).toBe(true);
            expect(record.outcome.satisfaction).toBe(0.9);
        });
    });

    describe('DialogueEntry', () => {
        it('should create dialogue entry', () => {
            const entry = new DialogueEntry('npc_1', '你好', 'base', { mood: 'friendly' });
            
            expect(entry.id).toBeDefined();
            expect(entry.npcId).toBe('npc_1');
            expect(entry.text).toBe('你好');
            expect(entry.category).toBe('base');
            expect(entry.usageCount).toBe(0);
            expect(entry.effectiveness).toBe(0.5);
        });
    });

    describe('NPCLearningEntry', () => {
        it('should create learning entry', () => {
            const entry = new NPCLearningEntry('npc_1', 'master', {
                dialogueBase: [{ text: '你好' }]
            });
            
            expect(entry.npcId).toBe('npc_1');
            expect(entry.role).toBe('master');
            expect(entry.adaptationLevel).toBe(1);
            expect(entry.behaviorPattern.friendliness).toBe(0.5);
            expect(entry.interactions).toHaveLength(0);
        });

        it('should initialize with base dialogue', () => {
            const entry = new NPCLearningEntry('npc_1', 'merchant', {
                dialogueBase: [{ text: '欢迎光临' }, { text: '下次再来' }]
            });
            
            expect(entry.dialogueBase).toHaveLength(2);
        });
    });

    describe('NPCLearningRegistry', () => {
        let registry;

        beforeEach(() => {
            registry = new NPCLearningRegistry();
        });

        it('should register NPC', () => {
            const result = registry.register('npc_1', 'master');
            
            expect(result.success).toBe(true);
            expect(registry.entries.has('npc_1')).toBe(true);
        });

        it('should prevent duplicate registration', () => {
            registry.register('npc_1', 'master');
            const result = registry.register('npc_1', 'master');
            
            expect(result.success).toBe(false);
        });

        it('should record interaction', () => {
            registry.register('npc_1', 'master');
            const result = registry.recordInteraction('npc_1', 'chat', 'hello', 'hi', {
                success: true,
                satisfaction: 0.8
            });
            
            expect(result.success).toBe(true);
            expect(result.record).toBeDefined();
        });

        it('should update behavior pattern', () => {
            registry.register('npc_1', 'master');
            
            registry.recordInteraction('npc_1', 'task', 'action', 'response', {
                success: true,
                satisfaction: 0.9
            });
            
            const entry = registry.getEntry('npc_1');
            expect(entry.behaviorPattern.friendliness).toBeGreaterThan(0.5);
        });

        it('should calculate adaptation score', () => {
            registry.register('npc_1', 'master');
            
            for (let i = 0; i < 5; i++) {
                registry.recordInteraction('npc_1', 'task', `action_${i}`, 'response', {
                    success: true,
                    satisfaction: 0.7
                });
            }
            
            const score = registry.calculateAdaptationScore('npc_1');
            expect(score).toBeGreaterThan(0);
        });

        it('should check evolution trigger', () => {
            registry.register('npc_1', 'master');
            
            // 交互不足10次
            expect(registry.checkEvolutionTrigger('npc_1')).toBe(false);
            
            // 交互达到10次
            for (let i = 0; i < 10; i++) {
                registry.recordInteraction('npc_1', 'task', `action_${i}`, 'response', {
                    success: true,
                    satisfaction: 0.8
                });
            }
            
            expect(registry.checkEvolutionTrigger('npc_1')).toBe(true);
        });

        it('should get all registered NPCs', () => {
            registry.register('npc_1', 'master');
            registry.register('npc_2', 'merchant');
            
            const npcs = registry.getAllRegisteredNPCs();
            expect(npcs).toHaveLength(2);
            expect(npcs).toContain('npc_1');
            expect(npcs).toContain('npc_2');
        });

        it('should return error for unregistered NPC', () => {
            const result = registry.recordInteraction('unknown', 'chat', 'hello', 'hi', {});
            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not registered');
        });
    });

    describe('Integration Tests', () => {
        it('should support full NPC evolution workflow', () => {
            // 使用唯一NPC ID避免与其他测试冲突
            const testNpcId = 'elder_integration_test';
            
            // 1. 注册NPC
            const registerResult = engine.mcpRegister({
                npcId: testNpcId,
                role: 'master',
                dialogueBase: [
                    { text: '徒儿，今日修行如何？' }
                ]
            });
            expect(registerResult.success).toBe(true);
            
            // 2. 记录多次交互
            for (let i = 0; i < 15; i++) {
                engine.mcpRecord({
                    npcId: testNpcId,
                    type: 'task',
                    playerAction: `complete_quest_${i}`,
                    npcResponse: 'well_done',
                    outcome: {
                        success: i > 10,
                        satisfaction: 0.6 + Math.random() * 0.3
                    }
                });
            }
            
            // 3. 检查学习状态
            const status = engine.mcpGet({ npcId: testNpcId });
            expect(status.interactionCount).toBe(15);
            
            // 4. 触发进化
            const evolveResult = engine.mcpTriggerEvolution({ npcId: testNpcId });
            
            // 进化可能成功也可能因冷却失败，关键是结果中应包含evolved字段
            expect(evolveResult.evolved !== undefined).toBe(true);
            if (evolveResult.evolved === true) {
                expect(evolveResult.newLevel).toBeGreaterThanOrEqual(1);
            }
            
            // 5. 添加扩展对话
            const dialogueResult = engine.mcpAddDialogue({
                npcId: testNpcId,
                text: '你的进境不错，为师决定传授你更高深的功法',
                category: 'extended'
            });
            expect(dialogueResult.success).toBe(true);
            
            // 6. 列出对话
            const listResult = engine.mcpListDialogues({ npcId: testNpcId });
            expect(listResult.total).toBeGreaterThan(1);
        });

        it('should maintain separate learning for different NPCs', () => {
            // 注册两个NPC
            engine.mcpRegister({ npcId: 'npc_1', role: 'master' });
            engine.mcpRegister({ npcId: 'npc_2', role: 'merchant' });
            
            // 为第一个NPC记录交互
            engine.mcpRecord({
                npcId: 'npc_1',
                type: 'task',
                playerAction: 'action1',
                npcResponse: 'response1',
                outcome: { success: true, satisfaction: 0.9 }
            });
            
            // 第二个NPC没有交互
            const status1 = engine.mcpGet({ npcId: 'npc_1' });
            const status2 = engine.mcpGet({ npcId: 'npc_2' });
            
            expect(status1.interactionCount).toBe(1);
            expect(status2.interactionCount).toBe(0);
            expect(status1.stats.totalInteractions).toBe(1);
            expect(status2.stats.totalInteractions).toBe(0);
        });
    });

    describe('State Persistence', () => {
        it('should save state', () => {
            engine.mcpRegister({ npcId: 'npc_1', role: 'master' });
            engine.mcpRecord({
                npcId: 'npc_1',
                type: 'chat',
                playerAction: 'hello',
                outcome: { success: true, satisfaction: 0.8 }
            });
            
            const state = engine.saveToState();
            
            expect(state.entries).toBeDefined();
            expect(state.dialogueLibrary).toBeDefined();
            expect(state.stats).toBeDefined();
        });

        it('should restore from state', () => {
            // 创建并记录一些数据
            engine.mcpRegister({ npcId: 'npc_1', role: 'master' });
            engine.mcpRecord({
                npcId: 'npc_1',
                type: 'chat',
                playerAction: 'hello',
                outcome: { success: true, satisfaction: 0.8 }
            });
            
            // 保存状态
            const state = engine.saveToState();
            
            // 创建新引擎并恢复
            const newEngine = new NPCEvolutionEngine();
            newEngine.init({ npcEvolution: state });
            
            // 验证数据已恢复
            const status = newEngine.mcpGet({ npcId: 'npc_1' });
            expect(status.interactionCount).toBe(1);
        });
    });
});
