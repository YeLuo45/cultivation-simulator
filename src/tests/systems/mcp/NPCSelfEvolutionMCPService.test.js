/**
 * NPCSelfEvolutionMCPService 单元测试
 * V284 Iteration 8/9 - MCP Tools for Self-Evolution
 * 
 * 测试策略：验证 MCP 服务将 NPC 自进化能力正确暴露
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NPCSelfEvolutionMCPService } from '../../../systems/mcp/NPCSelfEvolutionMCPService.js';
import { EvolutionDashboard } from '../../../systems/ai/EvolutionDashboard.js';
import { ExperienceTracker } from '../../../systems/ai/ExperienceTracker.js';
import { SkillCrystallization } from '../../../systems/ai/SkillCrystallization.js';
import { NPCLearningMesh } from '../../../systems/ai/NPCLearningMesh.js';
import { EvolutionTrigger } from '../../../systems/ai/EvolutionTrigger.js';
import { IEREngine } from '../../../systems/ai/IEREngine.js';

describe('NPCSelfEvolutionMCPService', () => {
    let service;
    let experienceTracker;
    let skillCrystallization;
    let npcLearningMesh;
    let evolutionTrigger;
    let ierEngine;
    let dashboard;
    
    const createTestNPCs = (count = 3) => {
        const npcIds = [];
        for (let i = 1; i <= count; i++) {
            const npcId = `npc_${String(i).padStart(3, '0')}`;
            npcIds.push(npcId);
            
            // 注册到 mesh
            npcLearningMesh.register(npcId);
            
            // 记录一些交互
            for (let j = 0; j < 15; j++) {
                experienceTracker.track(npcId, {
                    type: 'trade',
                    playerAction: 'buy item',
                    npcResponse: 'Here you go',
                    outcome: { 
                        success: j % 3 !== 0,
                        satisfaction: 0.5 + (j % 5) * 0.1
                    }
                });
            }
            
            // 注册触发器
            evolutionTrigger.registerBuiltInTrigger(npcId, 'HIGH_FAILURE_RATE');
        }
        
        // 建立 mesh 连接
        if (count >= 2) {
            npcLearningMesh.connect('npc_001', 'npc_002');
        }
        if (count >= 3) {
            npcLearningMesh.connect('npc_002', 'npc_003');
        }
        
        // 广播技能
        npcLearningMesh.broadcast('npc_001', {
            id: 'skill_001',
            pattern: { type: 'trade', playerAction: 'buy item' }
        });
        
        return npcIds;
    };
    
    beforeEach(() => {
        experienceTracker = new ExperienceTracker(100);
        skillCrystallization = new SkillCrystallization();
        skillCrystallization.setExperienceTracker(experienceTracker);
        ierEngine = new IEREngine(experienceTracker, skillCrystallization);
        evolutionTrigger = new EvolutionTrigger(experienceTracker, ierEngine, skillCrystallization);
        npcLearningMesh = new NPCLearningMesh();
        
        dashboard = new EvolutionDashboard(
            experienceTracker,
            skillCrystallization,
            npcLearningMesh,
            evolutionTrigger
        );
        
        service = new NPCSelfEvolutionMCPService(
            { dashboard },
            dashboard
        );
    });
    
    afterEach(() => {
        vi.restoreAllMocks();
    });
    
    describe('constructor', () => {
        it('应该使用提供的引擎和仪表板创建实例', () => {
            expect(service.npcEvolutionEngine).toBeDefined();
            expect(service.evolutionDashboard).toBe(dashboard);
        });
        
        it('应该初始化工具注册表', () => {
            expect(service.toolsRegistry).toBeDefined();
            expect(service.toolsRegistry.namespace).toBe('npc-self-evolution');
        });
        
        it('应该初始化空的已注册 NPC 集合', () => {
            expect(service.getRegisteredNPCs()).toEqual([]);
        });
        
        it('应该在构造时注册所有工具', () => {
            // 服务已经注册了工具
            const tools = service.getToolDefinitions();
            expect(tools.length).toBeGreaterThan(0);
        });
    });
    
    describe('registerTools', () => {
        it('应该注册 getNPCStatus 工具', () => {
            const tool = service.toolsRegistry.getTool('getNPCStatus');
            expect(tool).toBeDefined();
            expect(tool.description).toContain('NPC 自进化状态');
        });
        
        it('应该注册 triggerNPCLearn 工具', () => {
            const tool = service.toolsRegistry.getTool('triggerNPCLearn');
            expect(tool).toBeDefined();
            expect(tool.description).toContain('触发 NPC 学习');
        });
        
        it('应该注册 querySkillLibrary 工具', () => {
            const tool = service.toolsRegistry.getTool('querySkillLibrary');
            expect(tool).toBeDefined();
            expect(tool.description).toContain('技能库');
        });
        
        it('should register getSectOverview tool', () => {
            const tool = service.toolsRegistry.getTool('getSectOverview');
            expect(tool).toBeDefined();
            expect(tool.description).toContain('宗门');
        });
        
        it('应该注册所有 8 个工具', () => {
            const tools = service.getToolDefinitions();
            expect(tools.length).toBe(8);
        });
    });
    
    describe('getNPCStatus', () => {
        it('应该返回 NPC 状态', async () => {
            createTestNPCs(1);
            
            const result = await service.getNPCStatus({ npcId: 'npc_001' });
            
            expect(result.success).toBe(true);
            expect(result.npcId).toBe('npc_001');
            expect(result.evolutionLevel).toBeDefined();
            expect(result.experience).toBeDefined();
            expect(result.skills).toBeDefined();
        });
        
        it('应该返回错误当 npcId 缺失时', async () => {
            const result = await service.getNPCStatus({});
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('npcId');
        });
        
        it('应该自动注册未注册的 NPC', async () => {
            const result = await service.getNPCStatus({ npcId: 'new_npc' });
            
            expect(result.success).toBe(true);
            expect(service.getRegisteredNPCs()).toContain('new_npc');
        });
    });
    
    describe('triggerNPCLearn', () => {
        it('应该触发技能结晶化', async () => {
            createTestNPCs(1);
            
            const result = await service.triggerNPCLearn({
                npcId: 'npc_001',
                learningType: 'skill_crystallization'
            });
            
            expect(result.success).toBe(true);
            expect(result.learningType).toBe('skill_crystallization');
            expect(result.triggered).toBe(true);
        });
        
        it('应该触发网络同步', async () => {
            createTestNPCs(2);
            
            const result = await service.triggerNPCLearn({
                npcId: 'npc_001',
                learningType: 'mesh_sync'
            });
            
            expect(result.success).toBe(true);
            expect(result.learningType).toBe('mesh_sync');
            expect(result.peerCount).toBe(1);
        });
        
        it('应该触发进化评估', async () => {
            createTestNPCs(1);
            
            const result = await service.triggerNPCLearn({
                npcId: 'npc_001',
                learningType: 'trigger_evolution'
            });
            
            expect(result.success).toBe(true);
            expect(result.type).toBe('trigger_evolution');
            expect(result.currentLevel).toBeDefined();
        });
        
        it('应该拒绝未知学习类型', async () => {
            createTestNPCs(1);
            
            const result = await service.triggerNPCLearn({
                npcId: 'npc_001',
                learningType: 'unknown_type'
            });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('Unknown learning type');
        });
        
        it('应该返回错误当参数缺失时', async () => {
            const result = await service.triggerNPCLearn({});
            
            expect(result.success).toBe(false);
        });
    });
    
    describe('querySkillLibrary', () => {
        it('应该返回技能库', async () => {
            createTestNPCs(1);
            
            const result = await service.querySkillLibrary({ npcId: 'npc_001' });
            
            expect(result.success).toBe(true);
            expect(result.npcId).toBe('npc_001');
            expect(result.skills).toBeDefined();
            expect(Array.isArray(result.skills)).toBe(true);
        });
        
        it('应该支持置信度过滤', async () => {
            createTestNPCs(1);
            
            const result = await service.querySkillLibrary({
                npcId: 'npc_001',
                filter: { minConfidence: 0.9 }
            });
            
            expect(result.success).toBe(true);
            for (const skill of result.skills) {
                expect(skill.confidence).toBeGreaterThanOrEqual(0.9);
            }
        });
        
        it('应该支持数量限制', async () => {
            createTestNPCs(1);
            
            const result = await service.querySkillLibrary({
                npcId: 'npc_001',
                limit: 2
            });
            
            expect(result.success).toBe(true);
            expect(result.returnedSkills).toBeLessThanOrEqual(2);
        });
        
        it('应该返回错误当 npcId 缺失时', async () => {
            const result = await service.querySkillLibrary({});
            
            expect(result.success).toBe(false);
        });
    });
    
    describe('getSectOverview', () => {
        it('应该返回宗门总览', async () => {
            createTestNPCs(3);
            
            const result = await service.getSectOverview({});
            
            expect(result.success).toBe(true);
            expect(result.totalNPCs).toBe(3);
            expect(result.networkStatus).toBeDefined();
        });
        
        it('应该支持 NPC 列表', async () => {
            createTestNPCs(3);
            
            const result = await service.getSectOverview({ includeNPCs: true });
            
            expect(result.success).toBe(true);
            expect(result.npcSummaries).toBeDefined();
            expect(result.npcSummaries.length).toBe(3);
        });
        
        it('应该支持排序', async () => {
            createTestNPCs(3);
            
            const result = await service.getSectOverview({
                sortBy: 'totalInteractions'
            });
            
            expect(result.success).toBe(true);
        });
        
        it('应该默认包含 NPC 列表', async () => {
            createTestNPCs(2);
            
            const result = await service.getSectOverview({});
            
            expect(result.includeNPCs).toBe(true);
        });
    });
    
    describe('getEvolutionLog', () => {
        it('应该返回进化日志', async () => {
            createTestNPCs(1);
            
            const result = await service.getEvolutionLog({ npcId: 'npc_001' });
            
            expect(result.success).toBe(true);
            expect(result.logs).toBeDefined();
            expect(Array.isArray(result.logs)).toBe(true);
        });
        
        it('应该支持 null npcId', async () => {
            createTestNPCs(2);
            
            const result = await service.getEvolutionLog({ npcId: null });
            
            expect(result.success).toBe(true);
        });
        
        it('应该支持数量限制', async () => {
            createTestNPCs(1);
            
            const result = await service.getEvolutionLog({ limit: 5 });
            
            expect(result.success).toBe(true);
            expect(result.totalLogs).toBeLessThanOrEqual(5);
        });
    });
    
    describe('getRecommendedActions', () => {
        it('应该返回推荐行动', async () => {
            createTestNPCs(1);
            
            const result = await service.getRecommendedActions({ npcId: 'npc_001' });
            
            expect(result.success).toBe(true);
            expect(result.recommendations).toBeDefined();
            expect(Array.isArray(result.recommendations)).toBe(true);
        });
        
        it('应该支持优先级过滤', async () => {
            createTestNPCs(1);
            
            const result = await service.getRecommendedActions({
                npcId: 'npc_001',
                priorityFilter: 'high'
            });
            
            expect(result.success).toBe(true);
            for (const rec of result.recommendations) {
                expect(rec.priority).toBe('high');
            }
        });
        
        it('应该返回错误当 npcId 缺失时', async () => {
            const result = await service.getRecommendedActions({});
            
            expect(result.success).toBe(false);
        });
    });
    
    describe('connectNPCs', () => {
        it('应该连接两个 NPC', async () => {
            createTestNPCs(2);
            
            const result = await service.connectNPCs({
                npcId1: 'npc_001',
                npcId2: 'npc_002'
            });
            
            expect(result.success).toBe(true);
            expect(result.npcId1).toBe('npc_001');
            expect(result.npcId2).toBe('npc_002');
        });
        
        it('应该返回错误当参数缺失时', async () => {
            const result = await service.connectNPCs({});
            
            expect(result.success).toBe(false);
        });
    });
    
    describe('broadcastSkill', () => {
        it('应该广播技能', async () => {
            createTestNPCs(2);
            
            const result = await service.broadcastSkill({
                npcId: 'npc_001',
                skill: {
                    id: 'new_skill',
                    pattern: 'test pattern'
                }
            });
            
            expect(result.success).toBe(true);
            expect(result.broadcaster).toBe('npc_001');
            expect(result.skillId).toBe('new_skill');
        });
        
        it('应该返回错误当参数缺失时', async () => {
            const result = await service.broadcastSkill({});
            
            expect(result.success).toBe(false);
        });
    });
    
    describe('registerNPC', () => {
        it('应该注册 NPC', () => {
            const result = service.registerNPC('new_npc_123');
            
            expect(result.success).toBe(true);
            expect(service.getRegisteredNPCs()).toContain('new_npc_123');
        });
        
        it('不应该重复注册', () => {
            service.registerNPC('duplicate_npc');
            const result = service.registerNPC('duplicate_npc');
            
            expect(result.success).toBe(false);
        });
    });
    
    describe('registerNPCs', () => {
        it('应该批量注册 NPC', () => {
            const result = service.registerNPCs(['batch_1', 'batch_2', 'batch_3']);
            
            expect(result.success).toBe(true);
            expect(result.registered.length).toBe(3);
            expect(service.getRegisteredNPCs()).toContain('batch_1');
        });
        
        it('应该处理部分失败', () => {
            service.registerNPC('partial_1');
            const result = service.registerNPCs(['partial_1', 'partial_2']);
            
            expect(result.success).toBe(false);
            expect(result.registered).toContain('partial_2');
            expect(result.failed.length).toBe(1);
        });
    });
    
    describe('executeTool', () => {
        it('应该执行工具', async () => {
            createTestNPCs(1);
            
            const result = await service.executeTool('getNPCStatus', { npcId: 'npc_001' });
            
            expect(result.success).toBe(true);
            expect(result.result.npcId).toBe('npc_001');
        });
        
        it('应该返回错误当工具不存在时', async () => {
            const result = await service.executeTool('non_existent_tool', {});
            
            expect(result.success).toBe(false);
        });
    });
    
    describe('reset', () => {
        it('应该重置已注册的 NPC', () => {
            service.registerNPC('reset_npc');
            service.reset();
            
            expect(service.getRegisteredNPCs()).toEqual([]);
        });
    });
});