/**
 * CollaborativeDialogueEngine.test.js - NPC 多方协作对话引擎测试
 * V290 Iteration 5/9 - NPC Collaborative Dialogue Engine
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CollaborativeDialogueEngine } from '../../../systems/ai/CollaborativeDialogueEngine.js';
import { NPCDialogueService } from '../../../systems/ai/NPCDialogueService.js';
import { NPCLearningMesh } from '../../../systems/ai/NPCLearningMesh.js';

// Mock NPCDialogueService
class MockNPCDialogueService {
    constructor() {
        this.contexts = new Map();
    }

    getOrCreateContext(npcId) {
        if (!this.contexts.has(npcId)) {
            this.contexts.set(npcId, {
                npcId,
                currentTopic: null,
                dialogueId: null,
                turnCount: 0,
                emotion: 'neutral',
                tone: 'formal',
                conversationHistory: [],
                addToHistory: (playerMsg, npcResponse) => {
                    this.contexts.get(npcId).turnCount++;
                }
            });
        }
        return this.contexts.get(npcId);
    }

    extractRole(npcId) {
        return 'fellow';
    }

    generateDialogue(npcId, role, playerMessage, context, memories) {
        return {
            text: `Dialogue response from ${npcId}`,
            tone: 'formal',
            template: 'Test template',
            source: 'test'
        };
    }

    getMemories(npcId) {
        return [];
    }

    findRelevantMemories(memories, query) {
        return [];
    }
}

describe('CollaborativeDialogueEngine', () => {
    let engine;
    let dialogueService;
    let learningMesh;

    beforeEach(() => {
        dialogueService = new MockNPCDialogueService();
        learningMesh = new NPCLearningMesh();
        
        // 注册 NPC 到 mesh
        learningMesh.register('npc_001');
        learningMesh.register('npc_002');
        learningMesh.register('npc_003');
        learningMesh.connect('npc_001', 'npc_002');
        learningMesh.connect('npc_002', 'npc_003');
        
        engine = new CollaborativeDialogueEngine(dialogueService, learningMesh);
    });

    describe('constructor', () => {
        it('should create engine with empty active dialogues', () => {
            expect(engine.activeDialogues.size).toBe(0);
            expect(engine.npcDialogueService).toBe(dialogueService);
            expect(engine.npcLearningMesh).toBe(learningMesh);
        });

        it('should initialize dialogue counter to 0', () => {
            expect(engine.dialogueCounter).toBe(0);
        });
    });

    describe('generateDialogueId', () => {
        it('should generate unique dialogue IDs', () => {
            const id1 = engine.generateDialogueId();
            const id2 = engine.generateDialogueId();
            expect(id1).not.toBe(id2);
            expect(id1).toMatch(/^dialogue_\d+_\d+$/);
        });
    });

    describe('initiateMultiPartyDialogue', () => {
        it('should initiate dialogue with valid NPCs and topic', () => {
            const result = engine.initiateMultiPartyDialogue(['npc_001', 'npc_002'], 'cultivation');
            
            expect(result.success).toBe(true);
            expect(result.dialogueId).toBeDefined();
            expect(result.npcIds).toEqual(['npc_001', 'npc_002']);
            expect(result.topic).toBe('cultivation');
            expect(result.participantCount).toBe(2);
        });

        it('should reject empty NPC array', () => {
            const result = engine.initiateMultiPartyDialogue([], 'cultivation');
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('No NPC IDs provided');
        });

        it('should reject invalid topic', () => {
            const result = engine.initiateMultiPartyDialogue(['npc_001', 'npc_002'], '');
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invalid topic');
        });

        it('should reject unregistered NPCs', () => {
            const result = engine.initiateMultiPartyDialogue(['npc_001', 'unregistered_npc'], 'cultivation');
            
            expect(result.success).toBe(false);
            expect(result.reason).toContain('Some NPCs not registered');
            expect(result.unregisteredNPCs).toContain('unregistered_npc');
        });

        it('should create dialogue in active dialogues map', () => {
            const result = engine.initiateMultiPartyDialogue(['npc_001', 'npc_002'], 'training');
            
            expect(engine.activeDialogues.has(result.dialogueId)).toBe(true);
            const dialogue = engine.activeDialogues.get(result.dialogueId);
            expect(dialogue.topic).toBe('training');
            expect(dialogue.status).toBe('active');
        });

        it('should initialize contexts for all NPCs', () => {
            engine.initiateMultiPartyDialogue(['npc_001', 'npc_002'], 'combat');
            
            const ctx1 = dialogueService.getOrCreateContext('npc_001');
            const ctx2 = dialogueService.getOrCreateContext('npc_002');
            expect(ctx1.currentTopic).toBe('combat');
            expect(ctx2.currentTopic).toBe('combat');
        });
    });

    describe('generateNPCResponse', () => {
        it('should generate response for valid NPC', () => {
            const dialogueResult = engine.initiateMultiPartyDialogue(['npc_001', 'npc_002'], 'trade');
            
            const result = engine.generateNPCResponse('npc_001', { topic: 'trade' });
            
            expect(result.success).toBe(true);
            expect(result.npcId).toBe('npc_001');
            expect(result.dialogueId).toBe(dialogueResult.dialogueId);
            expect(result.response).toBeDefined();
            expect(result.response.text).toBeDefined();
        });

        it('should reject missing npcId', () => {
            const result = engine.generateNPCResponse(null, {});
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing npcId parameter');
        });

        it('should record response in dialogue history', () => {
            const dialogueResult = engine.initiateMultiPartyDialogue(['npc_001', 'npc_002'], 'social');
            
            engine.generateNPCResponse('npc_001', { topic: 'social' });
            engine.generateNPCResponse('npc_002', { topic: 'social' });
            
            const dialogue = engine.activeDialogues.get(dialogueResult.dialogueId);
            expect(dialogue.history.length).toBe(2);
        });

        it('should return context info', () => {
            const engine2 = new CollaborativeDialogueEngine(dialogueService, learningMesh);
            engine2.initiateMultiPartyDialogue(['npc_001', 'npc_002'], 'exploration');
            
            const result = engine2.generateNPCResponse('npc_001', {});
            
            expect(result.context).toBeDefined();
            expect(result.context.turnCount).toBeDefined();
            expect(result.context.currentTopic).toBeDefined();
        });
    });

    describe('syncDialogueMemory', () => {
        it('should sync memories with peer NPCs', () => {
            const result = engine.syncDialogueMemory('npc_001', ['npc_002', 'npc_003']);
            
            expect(result.success).toBe(true);
            expect(result.npcId).toBe('npc_001');
            expect(result.syncedCount).toBeDefined();
            expect(Array.isArray(result.syncedMemories)).toBe(true);
        });

        it('should reject missing npcId', () => {
            const result = engine.syncDialogueMemory(null, ['npc_002']);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing npcId parameter');
        });

        it('should reject empty peer array', () => {
            const result = engine.syncDialogueMemory('npc_001', []);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('No peer NPC IDs provided');
        });

        it('should reject NPC not in mesh', () => {
            const result = engine.syncDialogueMemory('unregistered_npc', ['npc_002']);
            
            expect(result.success).toBe(false);
            expect(result.reason).toContain('not registered');
        });
    });

    describe('getDialogueStatus', () => {
        it('should return status for NPC in dialogue', () => {
            engine.initiateMultiPartyDialogue(['npc_001', 'npc_002'], 'training');
            
            const result = engine.getDialogueStatus('npc_001');
            
            expect(result.success).toBe(true);
            expect(result.npcId).toBe('npc_001');
            expect(result.activeDialogues.length).toBeGreaterThan(0);
            expect(result.dialogueCount).toBe(1);
            expect(result.peerCount).toBe(1);
        });

        it('should reject missing npcId', () => {
            const result = engine.getDialogueStatus(null);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing npcId parameter');
        });

        it('should return empty dialogues for NPC not in any dialogue', () => {
            const result = engine.getDialogueStatus('npc_001');
            
            expect(result.success).toBe(true);
            expect(result.dialogueCount).toBe(0);
            expect(result.activeDialogues).toEqual([]);
        });

        it('should include mesh connection status', () => {
            const result = engine.getDialogueStatus('npc_001');
            
            expect(result.meshConnected).toBe(true);
        });
    });

    describe('endMultiPartyDialogue', () => {
        it('should end active dialogue', () => {
            const dialogueResult = engine.initiateMultiPartyDialogue(['npc_001', 'npc_002'], 'quest');
            const dialogueId = dialogueResult.dialogueId;
            
            const result = engine.endMultiPartyDialogue(dialogueId);
            
            expect(result.success).toBe(true);
            expect(result.dialogueId).toBe(dialogueId);
            expect(result.topic).toBe('quest');
            
            const dialogue = engine.activeDialogues.get(dialogueId);
            expect(dialogue.status).toBe('ended');
        });

        it('should reject non-existent dialogue', () => {
            const result = engine.endMultiPartyDialogue('nonexistent_dialogue');
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Dialogue not found');
        });
    });

    describe('getActiveDialogues', () => {
        it('should return all active dialogues', () => {
            engine.initiateMultiPartyDialogue(['npc_001', 'npc_002'], 'trade');
            engine.initiateMultiPartyDialogue(['npc_001', 'npc_003'], 'combat');
            
            const result = engine.getActiveDialogues();
            
            expect(result.success).toBe(true);
            expect(result.count).toBe(2);
            expect(result.dialogues.length).toBe(2);
        });

        it('should filter by NPC ID', () => {
            engine.initiateMultiPartyDialogue(['npc_001', 'npc_002'], 'social');
            engine.initiateMultiPartyDialogue(['npc_003'], 'training');
            
            const result = engine.getActiveDialogues('npc_001');
            
            expect(result.count).toBe(1);
            expect(result.dialogues[0].topic).toBe('social');
        });
    });

    describe('getDialogueHistory', () => {
        it('should return dialogue history', () => {
            const dialogueResult = engine.initiateMultiPartyDialogue(['npc_001', 'npc_002'], 'exploration');
            
            engine.generateNPCResponse('npc_001', {});
            engine.generateNPCResponse('npc_002', {});
            
            const result = engine.getDialogueHistory(dialogueResult.dialogueId);
            
            expect(result.success).toBe(true);
            expect(result.history.length).toBe(2);
            expect(result.topic).toBe('exploration');
        });

        it('should reject non-existent dialogue', () => {
            const result = engine.getDialogueHistory('nonexistent');
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Dialogue not found');
        });
    });

    describe('clearEndedDialogues', () => {
        it('should clear ended dialogues', () => {
            const result1 = engine.initiateMultiPartyDialogue(['npc_001', 'npc_002'], 'trade');
            engine.endMultiPartyDialogue(result1.dialogueId);
            
            const result2 = engine.clearEndedDialogues();
            
            expect(result2.success).toBe(true);
            expect(result2.cleared).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return engine statistics', () => {
            engine.initiateMultiPartyDialogue(['npc_001', 'npc_002'], 'combat');
            engine.initiateMultiPartyDialogue(['npc_001', 'npc_003'], 'social');
            
            const stats = engine.getStats();
            
            expect(stats.totalDialogues).toBe(2);
            expect(stats.activeDialogues).toBe(2);
            expect(stats.endedDialogues).toBe(0);
        });
    });

    describe('reset', () => {
        it('should clear all dialogues and reset counter', () => {
            engine.initiateMultiPartyDialogue(['npc_001', 'npc_002'], 'training');
            engine.generateNPCResponse('npc_001', {});
            
            const result = engine.reset();
            
            expect(result.success).toBe(true);
            expect(engine.activeDialogues.size).toBe(0);
            expect(engine.dialogueCounter).toBe(0);
        });
    });

    describe('multi-party scenario', () => {
        it('should handle complex multi-NPC dialogue', () => {
            // 创建一个三人对话
            const dialogueResult = engine.initiateMultiPartyDialogue(
                ['npc_001', 'npc_002', 'npc_003'],
                'quest'
            );
            
            expect(dialogueResult.success).toBe(true);
            expect(dialogueResult.participantCount).toBe(3);
            
            // 模拟各方发言
            const response1 = engine.generateNPCResponse('npc_001', { topic: 'quest' });
            const response2 = engine.generateNPCResponse('npc_002', { topic: 'quest' });
            const response3 = engine.generateNPCResponse('npc_003', { topic: 'quest' });
            
            expect(response1.success).toBe(true);
            expect(response2.success).toBe(true);
            expect(response3.success).toBe(true);
            
            // 检查历史
            const history = engine.getDialogueHistory(dialogueResult.dialogueId);
            expect(history.history.length).toBe(3);
            
            // 检查状态
            const status1 = engine.getDialogueStatus('npc_001');
            expect(status1.dialogueCount).toBe(1);
            expect(status1.activeDialogues[0].participantCount).toBe(3);
            
            // 结束对话
            const endResult = engine.endMultiPartyDialogue(dialogueResult.dialogueId);
            expect(endResult.success).toBe(true);
            expect(endResult.participantCount).toBe(3);
        });
    });
});