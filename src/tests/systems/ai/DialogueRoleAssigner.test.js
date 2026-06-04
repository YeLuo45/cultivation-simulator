/**
 * DialogueRoleAssigner.test.js - NPC 对话角色分配器测试
 * V290 Iteration 5/9 - NPC Collaborative Dialogue Engine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
    DialogueRoleAssigner, 
    DIALOGUE_ROLES, 
    DIALOGUE_TYPES 
} from '../../../systems/ai/DialogueRoleAssigner.js';
import { NPCLearningMesh } from '../../../systems/ai/NPCLearningMesh.js';

describe('DialogueRoleAssigner', () => {
    let assigner;
    let learningMesh;

    beforeEach(() => {
        learningMesh = new NPCLearningMesh();
        
        // 注册 NPC 到 mesh
        learningMesh.register('npc_001');
        learningMesh.register('npc_002');
        learningMesh.register('npc_003');
        learningMesh.register('npc_004');
        
        learningMesh.connect('npc_001', 'npc_002');
        learningMesh.connect('npc_002', 'npc_003');
        learningMesh.connect('npc_003', 'npc_004');
        
        assigner = new DialogueRoleAssigner(learningMesh);
    });

    describe('constructor', () => {
        it('should create assigner with empty role assignments', () => {
            expect(assigner.roleAssignments.size).toBe(0);
            expect(assigner.npcLearningMesh).toBe(learningMesh);
        });

        it('should initialize empty npc specialties', () => {
            expect(assigner.npcSpecialties.size).toBe(0);
        });
    });

    describe('DIALOGUE_ROLES constant', () => {
        it('should have all required roles defined', () => {
            expect(DIALOGUE_ROLES.LEAD).toBe('lead');
            expect(DIALOGUE_ROLES.SUPPORTER).toBe('supporter');
            expect(DIALOGUE_ROLES.MODERATOR).toBe('moderator');
            expect(DIALOGUE_ROLES.EXPERT).toBe('expert');
            expect(DIALOGUE_ROLES.LISTENER).toBe('listener');
        });
    });

    describe('DIALOGUE_TYPES constant', () => {
        it('should have all required types defined', () => {
            expect(DIALOGUE_TYPES.TRADE).toBe('trade');
            expect(DIALOGUE_TYPES.COMBAT).toBe('combat');
            expect(DIALOGUE_TYPES.SOCIAL).toBe('social');
            expect(DIALOGUE_TYPES.QUEST).toBe('quest');
            expect(DIALOGUE_TYPES.TRAINING).toBe('training');
            expect(DIALOGUE_TYPES.EXPLORATION).toBe('exploration');
        });
    });

    describe('getDefaultRoleConfig', () => {
        it('should return config for TRADE dialogue type', () => {
            const config = assigner.getDefaultRoleConfig(DIALOGUE_TYPES.TRADE);
            
            expect(config.roles).toContain(DIALOGUE_ROLES.LEAD);
            expect(config.roles).toContain(DIALOGUE_ROLES.SUPPORTER);
            expect(config.leadRatio).toBe(0.4);
        });

        it('should return config for COMBAT dialogue type', () => {
            const config = assigner.getDefaultRoleConfig(DIALOGUE_TYPES.COMBAT);
            
            expect(config.roles).toContain(DIALOGUE_ROLES.LEAD);
            expect(config.roles).toContain(DIALOGUE_ROLES.EXPERT);
            expect(config.leadRatio).toBe(0.5);
        });

        it('should return config for SOCIAL dialogue type', () => {
            const config = assigner.getDefaultRoleConfig(DIALOGUE_TYPES.SOCIAL);
            
            expect(config.roles).toContain(DIALOGUE_ROLES.MODERATOR);
            expect(config.roles).toContain(DIALOGUE_ROLES.LISTENER);
        });

        it('should return SOCIAL config for unknown type', () => {
            const config = assigner.getDefaultRoleConfig('unknown_type');
            
            expect(config.roles).toContain(DIALOGUE_ROLES.MODERATOR);
        });
    });

    describe('evaluateNPCForRole', () => {
        it('should return base score for NPC without special data', () => {
            const score = assigner.evaluateNPCForRole('npc_001', DIALOGUE_ROLES.LEAD, DIALOGUE_TYPES.TRADE);
            
            expect(score).toBeGreaterThan(0.5);
            expect(score).toBeLessThanOrEqual(1.0);
        });

        it('should increase score for NPC with shared skills', () => {
            learningMesh.broadcast('npc_001', { id: 'skill_1', pattern: 'test' });
            learningMesh.broadcast('npc_001', { id: 'skill_2', pattern: 'test' });
            
            const score = assigner.evaluateNPCForRole('npc_001', DIALOGUE_ROLES.EXPERT, DIALOGUE_TYPES.COMBAT);
            
            expect(score).toBeGreaterThan(0.5);
        });

        it('should increase score for NPC with specialty', () => {
            assigner.setNPCSpecialty('npc_001', DIALOGUE_ROLES.EXPERT, 0.8);
            
            const score = assigner.evaluateNPCForRole('npc_001', DIALOGUE_ROLES.EXPERT, DIALOGUE_TYPES.COMBAT);
            
            expect(score).toBeGreaterThan(0.7);
        });
    });

    describe('assignRoles', () => {
        it('should assign roles to NPCs', () => {
            const result = assigner.assignRoles(['npc_001', 'npc_002'], DIALOGUE_TYPES.TRADE);
            
            expect(result.success).toBe(true);
            expect(result.dialogueId).toBeDefined();
            expect(result.dialogueType).toBe('TRADE');
            expect(result.assignments).toBeDefined();
            expect(result.participantCount).toBe(2);
        });

        it('should reject empty NPC array', () => {
            const result = assigner.assignRoles([], DIALOGUE_TYPES.SOCIAL);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('No NPC IDs provided');
        });

        it('should reject invalid dialogue type', () => {
            const result = assigner.assignRoles(['npc_001', 'npc_002'], 'invalid_type');
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invalid dialogue type');
        });

        it('should assign different roles to different NPCs', () => {
            const result = assigner.assignRoles(['npc_001', 'npc_002', 'npc_003'], DIALOGUE_TYPES.COMBAT);
            
            const roles = Object.values(result.assignments);
            const uniqueRoles = new Set(roles);
            
            // 至少应该有不同角色
            expect(uniqueRoles.size).toBeGreaterThan(1);
        });

        it('should store assignment in roleAssignments map', () => {
            const result = assigner.assignRoles(['npc_001', 'npc_002'], DIALOGUE_TYPES.QUEST);
            
            expect(assigner.roleAssignments.has(result.dialogueId)).toBe(true);
        });
    });

    describe('getNPCRole', () => {
        it('should return role for valid NPC and dialogue', () => {
            const assignResult = assigner.assignRoles(['npc_001', 'npc_002'], DIALOGUE_TYPES.TRADE);
            
            const result = assigner.getNPCRole('npc_001', assignResult.dialogueId);
            
            expect(result.success).toBe(true);
            expect(result.npcId).toBe('npc_001');
            expect(result.role).toBeDefined();
            expect(result.rolePriority).toBeDefined();
        });

        it('should reject missing npcId', () => {
            const result = assigner.getNPCRole(null, 'some_dialogue');
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing npcId parameter');
        });

        it('should reject missing dialogueId', () => {
            const result = assigner.getNPCRole('npc_001', null);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing dialogueId parameter');
        });

        it('should reject non-existent dialogue', () => {
            const result = assigner.getNPCRole('npc_001', 'nonexistent_dialogue');
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Dialogue not found');
        });

        it('should reject NPC not in dialogue', () => {
            const assignResult = assigner.assignRoles(['npc_001', 'npc_002'], DIALOGUE_TYPES.SOCIAL);
            
            const result = assigner.getNPCRole('npc_003', assignResult.dialogueId);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not part of this dialogue');
        });
    });

    describe('switchRole', () => {
        it('should switch NPC role successfully', () => {
            const assignResult = assigner.assignRoles(['npc_001', 'npc_002'], DIALOGUE_TYPES.TRADE);
            const getResult = assigner.getNPCRole('npc_001', assignResult.dialogueId);
            const oldRole = getResult.role;
            
            const result = assigner.switchRole('npc_001', assignResult.dialogueId, DIALOGUE_ROLES.EXPERT);
            
            expect(result.success).toBe(true);
            expect(result.oldRole).toBe(oldRole);
            expect(result.newRole).toBe('EXPERT');
        });

        it('should reject missing parameters', () => {
            const result = assigner.switchRole(null, 'dialogue', DIALOGUE_ROLES.LEAD);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing npcId parameter');
        });

        it('should reject invalid role', () => {
            const assignResult = assigner.assignRoles(['npc_001', 'npc_002'], DIALOGUE_TYPES.SOCIAL);
            
            const result = assigner.switchRole('npc_001', assignResult.dialogueId, 'invalid_role');
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invalid role');
        });

        it('should reject non-existent dialogue', () => {
            const result = assigner.switchRole('npc_001', 'nonexistent', DIALOGUE_ROLES.LEAD);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Dialogue not found');
        });
    });

    describe('setNPCSpecialty', () => {
        it('should set NPC specialty successfully', () => {
            const result = assigner.setNPCSpecialty('npc_001', DIALOGUE_ROLES.EXPERT, 0.8);
            
            expect(result.success).toBe(true);
            expect(result.npcId).toBe('npc_001');
            expect(result.role).toBe('EXPERT');
            expect(result.score).toBe(0.8);
        });

        it('should reject missing npcId', () => {
            const result = assigner.setNPCSpecialty(null, DIALOGUE_ROLES.LEAD, 0.5);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing npcId parameter');
        });

        it('should reject invalid role', () => {
            const result = assigner.setNPCSpecialty('npc_001', 'invalid', 0.5);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Invalid role');
        });

        it('should reject score out of range', () => {
            const result = assigner.setNPCSpecialty('npc_001', DIALOGUE_ROLES.LEAD, 1.5);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Score must be between 0 and 1');
        });

        it('should reject negative score', () => {
            const result = assigner.setNPCSpecialty('npc_001', DIALOGUE_ROLES.LEAD, -0.1);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Score must be between 0 and 1');
        });
    });

    describe('getNPCSpecialties', () => {
        it('should return specialties for NPC', () => {
            assigner.setNPCSpecialty('npc_001', DIALOGUE_ROLES.EXPERT, 0.8);
            assigner.setNPCSpecialty('npc_001', DIALOGUE_ROLES.LEAD, 0.6);
            
            const result = assigner.getNPCSpecialties('npc_001');
            
            expect(result.success).toBe(true);
            expect(result.npcId).toBe('npc_001');
            expect(result.specialtyCount).toBe(2);
        });

        it('should return empty for NPC without specialties', () => {
            const result = assigner.getNPCSpecialties('npc_001');
            
            expect(result.success).toBe(true);
            expect(result.specialtyCount).toBe(0);
        });

        it('should reject missing npcId', () => {
            const result = assigner.getNPCSpecialties(null);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Missing npcId parameter');
        });
    });

    describe('getDialogueRoles', () => {
        it('should return all roles for dialogue', () => {
            const assignResult = assigner.assignRoles(['npc_001', 'npc_002', 'npc_003'], DIALOGUE_TYPES.EXPLORATION);
            
            const result = assigner.getDialogueRoles(assignResult.dialogueId);
            
            expect(result.success).toBe(true);
            expect(result.dialogueId).toBe(assignResult.dialogueId);
            expect(result.assignments).toBeDefined();
            expect(result.roleDistribution).toBeDefined();
        });

        it('should reject non-existent dialogue', () => {
            const result = assigner.getDialogueRoles('nonexistent');
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Dialogue not found');
        });
    });

    describe('getRoleDistribution', () => {
        it('should count roles correctly', () => {
            const distribution = assigner.getRoleDistribution([
                DIALOGUE_ROLES.LEAD,
                DIALOGUE_ROLES.EXPERT,
                DIALOGUE_ROLES.LEAD
            ]);
            
            expect(distribution[DIALOGUE_ROLES.LEAD]).toBe(2);
            expect(distribution[DIALOGUE_ROLES.EXPERT]).toBe(1);
        });
    });

    describe('clearDialogueRoles', () => {
        it('should clear roles for dialogue', () => {
            const assignResult = assigner.assignRoles(['npc_001', 'npc_002'], DIALOGUE_TYPES.TRADE);
            
            const result = assigner.clearDialogueRoles(assignResult.dialogueId);
            
            expect(result.success).toBe(true);
            expect(result.clearedCount).toBe(2);
            expect(assigner.roleAssignments.has(assignResult.dialogueId)).toBe(false);
        });

        it('should reject non-existent dialogue', () => {
            const result = assigner.clearDialogueRoles('nonexistent');
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Dialogue not found');
        });
    });

    describe('reset', () => {
        it('should clear all role assignments and specialties', () => {
            assigner.assignRoles(['npc_001', 'npc_002'], DIALOGUE_TYPES.COMBAT);
            assigner.setNPCSpecialty('npc_001', DIALOGUE_ROLES.EXPERT, 0.8);
            
            const result = assigner.reset();
            
            expect(result.success).toBe(true);
            expect(assigner.roleAssignments.size).toBe(0);
            expect(assigner.npcSpecialties.size).toBe(0);
        });
    });

    describe('getStats', () => {
        it('should return statistics', () => {
            assigner.assignRoles(['npc_001', 'npc_002'], DIALOGUE_TYPES.TRADE);
            assigner.assignRoles(['npc_001', 'npc_003'], DIALOGUE_TYPES.COMBAT);
            
            const stats = assigner.getStats();
            
            expect(stats.totalDialogues).toBe(2);
            expect(stats.totalAssignments).toBe(4);
            expect(stats.roleCounts).toBeDefined();
        });
    });

    describe('role assignment workflow', () => {
        it('should handle complete role assignment workflow', () => {
            // 1. 设置 NPC 特长
            assigner.setNPCSpecialty('npc_001', DIALOGUE_ROLES.EXPERT, 0.9);
            assigner.setNPCSpecialty('npc_002', DIALOGUE_ROLES.LEAD, 0.8);
            
            // 2. 分配角色
            const assignResult = assigner.assignRoles(
                ['npc_001', 'npc_002', 'npc_003'],
                DIALOGUE_TYPES.TRAINING
            );
            
            expect(assignResult.success).toBe(true);
            expect(assignResult.assignments['npc_001']).toBeDefined();
            expect(assignResult.assignments['npc_002']).toBeDefined();
            expect(assignResult.assignments['npc_003']).toBeDefined();
            
            // 3. 获取角色
            const role1 = assigner.getNPCRole('npc_001', assignResult.dialogueId);
            expect(role1.success).toBe(true);
            
            // 4. 切换角色
            const switchResult = assigner.switchRole(
                'npc_001',
                assignResult.dialogueId,
                DIALOGUE_ROLES.SUPPORTER
            );
            expect(switchResult.success).toBe(true);
            expect(switchResult.newRole).toBe('SUPPORTER');
            
            // 5. 获取对话角色
            const dialogueRoles = assigner.getDialogueRoles(assignResult.dialogueId);
            expect(dialogueRoles.success).toBe(true);
            expect(Object.keys(dialogueRoles.assignments).length).toBe(3);
            
            // 6. 清理
            const clearResult = assigner.clearDialogueRoles(assignResult.dialogueId);
            expect(clearResult.success).toBe(true);
        });
    });
});