/**
 * NPCDialogueService TDD Tests
 * V228 Direction N续: NPC自主进化引擎 - 对话生成
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    NPCDialogueService,
    npcDialogueService,
    DialogueContext,
    NPCMemoryEntry,
    DIALOGUE_TEMPLATES,
    DEFAULT_TEMPLATES
} from '../../../systems/ai/NPCDialogueService.js';

describe('NPCDialogueService - V228: NPC对话生成服务', () => {
    let service;
    let mockGameState;

    beforeEach(() => {
        service = new NPCDialogueService();
        mockGameState = {
            player: { name: '测试修士', level: 5, reputation: 100 },
            realm: 2,
            stage: 1,
            npcEvolution: null
        };
        service.init(mockGameState);
    });

    describe('Basic Operations', () => {
        it('should initialize correctly', () => {
            expect(service.initialized).toBe(true);
            expect(service.contexts).toBeDefined();
            expect(service.memories).toBeDefined();
            expect(service.toneSettings).toBeDefined();
        });

        it('should return service status', () => {
            const status = service.getStatus();
            
            expect(status.initialized).toBe(true);
            expect(status.activeContexts).toBe(0);
            expect(status.totalMemories).toBe(0);
            expect(status.toneSettings).toBe(0);
        });

        it('should init with gameState', () => {
            const result = service.init(mockGameState);
            expect(result.success).toBe(true);
        });
    });

    describe('DialogueContext', () => {
        it('should create new context for NPC', () => {
            const ctx = service.getOrCreateContext('master_001');
            
            expect(ctx).toBeDefined();
            expect(ctx.npcId).toBe('master_001');
            expect(ctx.conversationHistory).toHaveLength(0);
            expect(ctx.turnCount).toBe(0);
            expect(ctx.tone).toBe('formal');
        });

        it('should return existing context', () => {
            const ctx1 = service.getOrCreateContext('master_001');
            ctx1.turnCount = 5;
            
            const ctx2 = service.getOrCreateContext('master_001');
            
            expect(ctx2).toBe(ctx1);
            expect(ctx2.turnCount).toBe(5);
        });

        it('should add to history', () => {
            const ctx = service.getOrCreateContext('master_001');
            ctx.addToHistory('师父好', '徒儿好');
            ctx.addToHistory('今天修炼什么', '修炼五行功法');
            
            expect(ctx.conversationHistory).toHaveLength(2);
            expect(ctx.turnCount).toBe(2);
            expect(ctx.lastPlayerMessage).toBe('今天修炼什么');
            expect(ctx.lastGeneratedDialogue).toBe('修炼五行功法');
        });

        it('should reset context', () => {
            const ctx = service.getOrCreateContext('master_001');
            ctx.addToHistory('师父好', '徒儿好');
            ctx.currentTopic = 'cultivation';
            ctx.emotion = 'positive';
            
            ctx.reset();
            
            expect(ctx.conversationHistory).toHaveLength(0);
            expect(ctx.turnCount).toBe(0);
            expect(ctx.currentTopic).toBeNull();
            expect(ctx.emotion).toBe('neutral');
        });
    });

    describe('NPCMemoryEntry', () => {
        it('should create memory entry', () => {
            const memory = new NPCMemoryEntry('interaction', { message: 'test' }, { importance: 0.8 });
            
            expect(memory.id).toBeDefined();
            expect(memory.type).toBe('interaction');
            expect(memory.content.message).toBe('test');
            expect(memory.importance).toBe(0.8);
            expect(memory.accessCount).toBe(0);
        });

        it('should track access', () => {
            const memory = new NPCMemoryEntry('interaction', { message: 'test' });
            
            memory.access();
            memory.access();
            
            expect(memory.accessCount).toBe(2);
            expect(memory.lastAccessedAt).toBeGreaterThanOrEqual(memory.createdAt);
        });
    });

    describe('npc.dialogue.generate', () => {
        it('should generate dialogue for registered NPC', () => {
            const result = service.mcpGenerateDialogue({
                npcId: 'master_001',
                playerMessage: '师父，修炼之事有何指教？'
            });
            
            expect(result.success).toBe(true);
            expect(result.tool).toBe('npc.dialogue.generate');
            expect(result.dialogue).toBeDefined();
            expect(result.dialogue.text).toBeDefined();
            expect(result.dialogue.tone).toBe('formal');
        });

        it('should fail if npcId is missing', () => {
            const result = service.mcpGenerateDialogue({
                playerMessage: 'Hello'
            });
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing npcId parameter');
        });

        it('should fail if playerMessage is missing', () => {
            const result = service.mcpGenerateDialogue({
                npcId: 'master_001'
            });
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing playerMessage parameter');
        });

        it('should increment turn count', () => {
            service.mcpGenerateDialogue({
                npcId: 'master_001',
                playerMessage: '师父好'
            });
            service.mcpGenerateDialogue({
                npcId: 'master_001',
                playerMessage: '今天修炼什么'
            });
            
            const result = service.mcpGetContext({ npcId: 'master_001' });
            
            expect(result.context.turnCount).toBe(2);
        });

        it('should record memory after dialogue', () => {
            service.mcpGenerateDialogue({
                npcId: 'master_001',
                playerMessage: '师父，关于灵根之道'
            });
            
            const memoryResult = service.mcpRetrieveMemory({
                npcId: 'master_001'
            });
            
            expect(memoryResult.totalMemories).toBeGreaterThan(0);
        });

        it('should use tone setting when set', () => {
            service.mcpSetTone({ npcId: 'merchant_001', tone: 'casual' });
            
            const result = service.mcpGenerateDialogue({
                npcId: 'merchant_001',
                playerMessage: '有什么好东西？'
            });
            
            expect(result.dialogue.tone).toBe('casual');
        });

        it('should work with different roles', () => {
            const roles = ['master', 'merchant', 'fellow', 'monster'];
            
            for (const role of roles) {
                const result = service.mcpGenerateDialogue({
                    npcId: `${role}_001`,
                    playerMessage: '你好'
                });
                
                expect(result.success).toBe(true);
                expect(result.dialogue.text).toBeDefined();
            }
        });

        it('should track current topic', () => {
            service.mcpGenerateDialogue({
                npcId: 'master_001',
                playerMessage: '师父，关于突破之事'
            });
            
            const ctxResult = service.mcpGetContext({ npcId: 'master_001' });
            
            expect(ctxResult.context.currentTopic).toBe('breakthrough');
        });
    });

    describe('npc.dialogue.context', () => {
        it('should return context for active NPC', () => {
            service.mcpGenerateDialogue({
                npcId: 'master_001',
                playerMessage: '师父好'
            });
            
            const result = service.mcpGetContext({ npcId: 'master_001' });
            
            expect(result.success).toBe(true);
            expect(result.tool).toBe('npc.dialogue.context');
            expect(result.exists).toBe(true);
            expect(result.context).toBeDefined();
            expect(result.context.turnCount).toBe(1);
        });

        it('should return exists: false for new NPC', () => {
            const result = service.mcpGetContext({ npcId: 'new_npc' });
            
            expect(result.success).toBe(true);
            expect(result.exists).toBe(false);
        });

        it('should fail if npcId is missing', () => {
            const result = service.mcpGetContext({});
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing npcId parameter');
        });

        it('should return conversation history', () => {
            service.mcpGenerateDialogue({
                npcId: 'master_001',
                playerMessage: '第一条消息'
            });
            service.mcpGenerateDialogue({
                npcId: 'master_001',
                playerMessage: '第二条消息'
            });
            
            const result = service.mcpGetContext({ npcId: 'master_001' });
            
            expect(result.context.conversationHistory).toHaveLength(2);
            expect(result.context.conversationHistory[0].playerMessage).toBe('第一条消息');
            expect(result.context.conversationHistory[1].playerMessage).toBe('第二条消息');
        });
    });

    describe('npc.memory.retrieve', () => {
        it('should retrieve memories for NPC', () => {
            service.mcpGenerateDialogue({
                npcId: 'master_001',
                playerMessage: '师父好'
            });
            
            const result = service.mcpRetrieveMemory({ npcId: 'master_001' });
            
            expect(result.success).toBe(true);
            expect(result.tool).toBe('npc.memory.retrieve');
            expect(result.memories).toBeDefined();
            expect(result.totalMemories).toBeGreaterThan(0);
        });

        it('should fail if npcId is missing', () => {
            const result = service.mcpRetrieveMemory({});
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing npcId parameter');
        });

        it('should filter memories by type', () => {
            service.recordMemory('master_001', 'interaction', { test: '1' });
            service.recordMemory('master_001', 'preference', { test: '2' });
            service.recordMemory('master_001', 'event', { test: '3' });
            
            const result = service.mcpRetrieveMemory({
                npcId: 'master_001',
                type: 'interaction'
            });
            
            expect(result.memories.every(m => m.type === 'interaction')).toBe(true);
        });

        it('should respect limit parameter', () => {
            for (let i = 0; i < 20; i++) {
                service.recordMemory('master_001', 'interaction', { index: i });
            }
            
            const result = service.mcpRetrieveMemory({
                npcId: 'master_001',
                limit: 5
            });
            
            expect(result.memories).toHaveLength(5);
        });

        it('should return learning status from evolution engine', () => {
            // 注册NPC到evolution engine
            npcEvolutionEngine.mcpRegister({ npcId: 'master_001', role: 'master' });
            npcEvolutionEngine.mcpRecord({
                npcId: 'master_001',
                type: 'chat',
                outcome: { success: true, satisfaction: 0.8 }
            });
            
            const result = service.mcpRetrieveMemory({ npcId: 'master_001' });
            
            expect(result.learningStatus).toBeDefined();
            expect(result.learningStatus.adaptationLevel).toBeDefined();
        });
    });

    describe('npc.context.update', () => {
        it('should update context fields', () => {
            service.getOrCreateContext('master_001');
            
            const result = service.mcpUpdateContext({
                npcId: 'master_001',
                updates: {
                    currentTopic: 'cultivation',
                    emotion: 'positive',
                    goal: 'teach'
                }
            });
            
            expect(result.success).toBe(true);
            expect(result.tool).toBe('npc.context.update');
            expect(result.context.currentTopic).toBe('cultivation');
            expect(result.context.emotion).toBe('positive');
            expect(result.context.goal).toBe('teach');
        });

        it('should update tone setting', () => {
            const result = service.mcpUpdateContext({
                npcId: 'master_001',
                updates: {
                    tone: 'mysterious'
                }
            });
            
            expect(result.success).toBe(true);
            expect(result.context.tone).toBe('mysterious');
            expect(service.toneSettings.get('master_001')).toBe('mysterious');
        });

        it('should fail if npcId is missing', () => {
            const result = service.mcpUpdateContext({
                updates: { currentTopic: 'test' }
            });
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing npcId parameter');
        });

        it('should fail if updates is missing', () => {
            const result = service.mcpUpdateContext({
                npcId: 'master_001'
            });
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing updates parameter');
        });

        it('should create context if not exists', () => {
            const result = service.mcpUpdateContext({
                npcId: 'new_npc',
                updates: { currentTopic: 'test' }
            });
            
            expect(result.success).toBe(true);
        });
    });

    describe('npc.dialogue.reset', () => {
        it('should reset NPC dialogue state', () => {
            service.mcpGenerateDialogue({
                npcId: 'master_001',
                playerMessage: '师父好'
            });
            
            const result = service.mcpResetDialogue({ npcId: 'master_001' });
            
            expect(result.success).toBe(true);
            expect(result.tool).toBe('npc.dialogue.reset');
            expect(result.hadContext).toBe(true);
            
            const ctxResult = service.mcpGetContext({ npcId: 'master_001' });
            expect(ctxResult.context.turnCount).toBe(0);
        });

        it('should clear memories when specified', () => {
            service.mcpGenerateDialogue({
                npcId: 'master_001',
                playerMessage: '师父好'
            });
            
            const result = service.mcpResetDialogue({
                npcId: 'master_001',
                clearMemories: true
            });
            
            expect(result.memoriesCleared).toBe(true);
            
            const memoryResult = service.mcpRetrieveMemory({ npcId: 'master_001' });
            expect(memoryResult.totalMemories).toBe(0);
        });

        it('should clear tone settings', () => {
            service.mcpSetTone({ npcId: 'master_001', tone: 'casual' });
            
            service.mcpResetDialogue({ npcId: 'master_001' });
            
            expect(service.toneSettings.has('master_001')).toBe(false);
        });

        it('should fail if npcId is missing', () => {
            const result = service.mcpResetDialogue({});
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing npcId parameter');
        });

        it('should handle reset for non-existent NPC', () => {
            const result = service.mcpResetDialogue({ npcId: 'non_existent' });
            
            expect(result.success).toBe(true);
            expect(result.hadContext).toBe(false);
        });
    });

    describe('npc.tone.set', () => {
        it('should set tone for NPC', () => {
            const result = service.mcpSetTone({
                npcId: 'master_001',
                tone: 'casual'
            });
            
            expect(result.success).toBe(true);
            expect(result.tool).toBe('npc.tone.set');
            expect(result.tone).toBe('casual');
            expect(service.toneSettings.get('master_001')).toBe('casual');
        });

        it('should fail if npcId is missing', () => {
            const result = service.mcpSetTone({ tone: 'formal' });
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing npcId parameter');
        });

        it('should fail if tone is missing', () => {
            const result = service.mcpSetTone({ npcId: 'master_001' });
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing tone parameter');
        });

        it('should fail for invalid tone', () => {
            const result = service.mcpSetTone({
                npcId: 'master_001',
                tone: 'invalid_tone'
            });
            
            expect(result.success).toBe(false);
            expect(result.reason).toContain('Invalid tone');
        });

        it('should accept all valid tones', () => {
            const validTones = ['formal', 'casual', 'mysterious'];
            
            for (const tone of validTones) {
                const result = service.mcpSetTone({
                    npcId: 'master_001',
                    tone
                });
                
                expect(result.success).toBe(true);
                expect(result.tone).toBe(tone);
            }
        });
    });

    describe('Helper Methods', () => {
        it('should extract role correctly', () => {
            expect(service.extractRole('master_001')).toBe('master');
            expect(service.extractRole('merchant_test')).toBe('merchant');
            expect(service.extractRole('fellow')).toBe('fellow');
            expect(service.extractRole('monster_boss')).toBe('monster');
            expect(service.extractRole('unknown')).toBe('fellow'); // default
        });

        it('should extract topic correctly', () => {
            expect(service.extractTopic('关于修炼之事')).toBe('cultivation');
            expect(service.extractTopic('突破的时机')).toBe('breakthrough');
            expect(service.extractTopic('灵根如何')).toBe('spirit_root');
            expect(service.extractTopic('丹药配方')).toBe('pill');
            expect(service.extractTopic('普通对话')).toBe('general');
        });

        it('should find relevant memories', () => {
            service.recordMemory('master_001', 'interaction', { key: '修炼' });
            service.recordMemory('master_001', 'preference', { key: '丹药' });
            service.recordMemory('master_001', 'event', { key: '战斗' });
            
            const memories = service.getMemories('master_001');
            const relevant = service.findRelevantMemories(memories, '修炼');
            
            expect(relevant.length).toBeGreaterThan(0);
            expect(relevant[0].content.key).toBe('修炼');
        });

        it('should get player context', () => {
            const context = service.getPlayerContext();
            
            expect(context).toBeDefined();
            expect(context.name).toBe('测试修士');
            expect(context.level).toBe(5);
            expect(context.realm).toBe(2);
        });

        it('should handle missing gameState for player context', () => {
            const serviceNoState = new NPCDialogueService();
            const context = serviceNoState.getPlayerContext();
            
            expect(context).toBeNull();
        });
    });

    describe('Template System', () => {
        it('should have templates for all roles', () => {
            const roles = ['master', 'merchant', 'fellow', 'monster'];
            
            for (const role of roles) {
                expect(DIALOGUE_TEMPLATES[role]).toBeDefined();
                expect(DIALOGUE_TEMPLATES[role].formal).toBeDefined();
                expect(DIALOGUE_TEMPLATES[role].casual).toBeDefined();
                expect(DIALOGUE_TEMPLATES[role].mysterious).toBeDefined();
            }
        });

        it('should have default templates', () => {
            expect(DEFAULT_TEMPLATES).toBeDefined();
            expect(DEFAULT_TEMPLATES.formal).toBeDefined();
            expect(DEFAULT_TEMPLATES.casual).toBeDefined();
            expect(DEFAULT_TEMPLATES.mysterious).toBeDefined();
        });

        it('should generate dialogue with template replacement', () => {
            const result = service.mcpGenerateDialogue({
                npcId: 'master_001',
                playerMessage: '关于修炼的事情'
            });
            
            expect(result.dialogue.text).toContain('修炼');
            expect(result.dialogue.source).toBe('template');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty player message', () => {
            const result = service.mcpGenerateDialogue({
                npcId: 'master_001',
                playerMessage: ''
            });
            
            // Empty message should still generate dialogue (with default topic)
            expect(result.success).toBe(true);
        });

        it('should handle special characters in message', () => {
            const result = service.mcpGenerateDialogue({
                npcId: 'master_001',
                playerMessage: 'Hello! @#$%^&*()'
            });
            
            expect(result.success).toBe(true);
        });

        it('should handle unicode in message', () => {
            const result = service.mcpGenerateDialogue({
                npcId: 'master_001',
                playerMessage: '道友，你好！道友辛苦了！修仙之路漫漫'
            });
            
            expect(result.success).toBe(true);
        });

        it('should maintain separate contexts for different NPCs', () => {
            service.mcpGenerateDialogue({
                npcId: 'master_001',
                playerMessage: '师父好'
            });
            service.mcpGenerateDialogue({
                npcId: 'merchant_001',
                playerMessage: '你好'
            });
            
            const masterCtx = service.mcpGetContext({ npcId: 'master_001' });
            const merchantCtx = service.mcpGetContext({ npcId: 'merchant_001' });
            
            expect(masterCtx.context.turnCount).toBe(1);
            expect(merchantCtx.context.turnCount).toBe(1);
            expect(masterCtx.context).not.toEqual(merchantCtx.context);
        });

        it('should limit memory count per NPC', () => {
            // 默认 maxMemoriesPerNPC = 100
            for (let i = 0; i < 150; i++) {
                service.recordMemory('master_001', 'interaction', { index: i });
            }
            
            const memories = service.getMemories('master_001');
            expect(memories.length).toBeLessThanOrEqual(100);
        });
    });

    describe('Integration with NPCEvolutionEngine', () => {
        it('should retrieve learning status from evolution engine', () => {
            npcEvolutionEngine.mcpRegister({
                npcId: 'test_npc',
                role: 'master',
                dialogueBase: [
                    { text: '徒儿好', metadata: {} }
                ]
            });
            
            npcEvolutionEngine.mcpRecord({
                npcId: 'test_npc',
                type: 'chat',
                playerAction: 'greet',
                npcResponse: 'greet_response',
                outcome: { success: true, satisfaction: 0.7 }
            });
            
            const result = service.mcpRetrieveMemory({ npcId: 'test_npc' });
            
            expect(result.learningStatus).toBeDefined();
            expect(result.learningStatus.stats).toBeDefined();
            expect(result.learningStatus.stats.totalInteractions).toBe(1);
        });
    });
});
