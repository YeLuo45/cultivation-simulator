/**
 * EvolutionDashboard 单元测试
 * V283 Iteration 7/9 - Self-Evolution Dashboard UI
 * 
 * 测试策略: 验证仪表板聚合所有子系统数据的功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EvolutionDashboard } from '../../../systems/ai/EvolutionDashboard.js';
import { ExperienceTracker } from '../../../systems/ai/ExperienceTracker.js';
import { SkillCrystallization } from '../../../systems/ai/SkillCrystallization.js';
import { NPCLearningMesh } from '../../../systems/ai/NPCLearningMesh.js';
import { EvolutionTrigger } from '../../../systems/ai/EvolutionTrigger.js';
import { IEREngine } from '../../../systems/ai/IEREngine.js';

describe('EvolutionDashboard', () => {
    let dashboard;
    let experienceTracker;
    let skillCrystallization;
    let npcLearningMesh;
    let evolutionTrigger;
    let ierEngine;
    
    const createTestNPCs = () => {
        const npcIds = ['npc_001', 'npc_002', 'npc_003'];
        
        for (const npcId of npcIds) {
            // 注册到 mesh
            npcLearningMesh.register(npcId);
            
            // 记录一些交互
            for (let i = 0; i < 15; i++) {
                experienceTracker.track(npcId, {
                    type: 'trade',
                    playerAction: 'buy item',
                    npcResponse: 'Here you go',
                    outcome: { 
                        success: i % 3 !== 0, // 2/3 success rate
                        satisfaction: 0.5 + (i % 5) * 0.1
                    }
                });
            }
            
            // 注册触发器
            evolutionTrigger.registerBuiltInTrigger(npcId, 'HIGH_FAILURE_RATE');
            evolutionTrigger.registerBuiltInTrigger(npcId, 'LEARNING_PLATEAU');
        }
        
        // 建立 mesh 连接
        npcLearningMesh.connect('npc_001', 'npc_002');
        npcLearningMesh.connect('npc_002', 'npc_003');
        
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
    });
    
    afterEach(() => {
        vi.restoreAllMocks();
    });
    
    describe('constructor', () => {
        it('应该使用提供的子系统创建实例', () => {
            expect(dashboard.experienceTracker).toBe(experienceTracker);
            expect(dashboard.skillCrystallization).toBe(skillCrystallization);
            expect(dashboard.npcLearningMesh).toBe(npcLearningMesh);
            expect(dashboard.evolutionTrigger).toBe(evolutionTrigger);
        });
        
        it('应该初始化空的evolutionLog', () => {
            expect(dashboard.evolutionLog).toEqual([]);
        });
    });
    
    describe('getNPCStatus', () => {
        it('应该返回NPC综合状态', () => {
            const npcIds = createTestNPCs();
            const status = dashboard.getNPCStatus('npc_001');
            
            expect(status).toBeDefined();
            expect(status.npcId).toBe('npc_001');
            expect(status.evolutionLevel).toBeGreaterThan(0);
            expect(status.adaptationScore).toBeGreaterThanOrEqual(0);
        });
        
        it('应该包含experience字段', () => {
            const npcIds = createTestNPCs();
            const status = dashboard.getNPCStatus('npc_001');
            
            expect(status.experience).toBeDefined();
            expect(status.experience.totalInteractions).toBe(15);
            expect(typeof status.experience.successRate).toBe('number');
            expect(typeof status.experience.avgSatisfaction).toBe('number');
        });
        
        it('应该包含skills字段', () => {
            const npcIds = createTestNPCs();
            const status = dashboard.getNPCStatus('npc_001');
            
            expect(status.skills).toBeDefined();
            expect(typeof status.skills.totalSkills).toBe('number');
            expect(typeof status.skills.totalUses).toBe('number');
            expect(Array.isArray(status.skills.skillLibrary)).toBe(true);
        });
        
        it('应该包含mesh字段 - 已注册的NPC', () => {
            const npcIds = createTestNPCs();
            const status = dashboard.getNPCStatus('npc_001');
            
            expect(status.mesh).toBeDefined();
            expect(status.mesh.peerCount).toBeGreaterThan(0);
            expect(Array.isArray(status.mesh.peers)).toBe(true);
        });
        
        it('应该包含evolution字段', () => {
            const npcIds = createTestNPCs();
            const status = dashboard.getNPCStatus('npc_001');
            
            expect(status.evolution).toBeDefined();
            expect(Array.isArray(status.evolution.registeredTriggers)).toBe(true);
            expect(Array.isArray(status.evolution.availableConditions)).toBe(true);
        });
        
        it('应该正确计算evolutionLevel', () => {
            const npcIds = createTestNPCs();
            const status = dashboard.getNPCStatus('npc_001');
            
            // 15次交互 -> +1 (每10次+1)
            // 1 peer -> +0.5
            // adaptationScore 应该 > 0.5 -> +1
            expect(status.evolutionLevel).toBeGreaterThanOrEqual(2);
            expect(status.evolutionLevel).toBeLessThanOrEqual(10);
        });
    });
    
    describe('getSectOverview', () => {
        it('应该返回宗门总览数据', () => {
            const npcIds = createTestNPCs();
            const overview = dashboard.getSectOverview();
            
            expect(overview).toBeDefined();
            expect(overview.totalNPCs).toBe(3);
            expect(typeof overview.totalInteractions).toBe('number');
            expect(typeof overview.overallSuccessRate).toBe('number');
        });
        
        it('应该包含npcSummaries数组', () => {
            const npcIds = createTestNPCs();
            const overview = dashboard.getSectOverview();
            
            expect(Array.isArray(overview.npcSummaries)).toBe(true);
            expect(overview.npcSummaries.length).toBe(3);
        });
        
        it('npcSummaries应该按evolutionLevel降序排列', () => {
            const npcIds = createTestNPCs();
            const overview = dashboard.getSectOverview();
            
            for (let i = 1; i < overview.npcSummaries.length; i++) {
                expect(overview.npcSummaries[i-1].evolutionLevel)
                    .toBeGreaterThanOrEqual(overview.npcSummaries[i].evolutionLevel);
            }
        });
        
        it('应该包含networkStatus', () => {
            const npcIds = createTestNPCs();
            const overview = dashboard.getSectOverview();
            
            expect(overview.networkStatus).toBeDefined();
            expect(overview.networkStatus.totalNPCs).toBe(3);
            expect(Array.isArray(overview.networkStatus.registeredNPCs)).toBe(true);
        });
        
        it('应该包含timestamp', () => {
            const npcIds = createTestNPCs();
            const overview = dashboard.getSectOverview();
            
            expect(overview.timestamp).toBeDefined();
            expect(typeof overview.timestamp).toBe('number');
        });
    });
    
    describe('getEvolutionLog', () => {
        it('应该返回指定NPC的进化日志', () => {
            const npcIds = createTestNPCs();
            const log = dashboard.getEvolutionLog('npc_001', 10);
            
            expect(Array.isArray(log)).toBe(true);
        });
        
        it('应该支持默认limit=20', () => {
            const npcIds = createTestNPCs();
            const log = dashboard.getEvolutionLog('npc_001');
            
            expect(log.length).toBeLessThanOrEqual(20);
        });
        
        it('应该支持npcId=null返回所有NPC日志', () => {
            const npcIds = createTestNPCs();
            const log = dashboard.getEvolutionLog(null, 30);
            
            expect(Array.isArray(log)).toBe(true);
        });
        
        it('应该按时间戳降序排列', () => {
            const npcIds = createTestNPCs();
            const log = dashboard.getEvolutionLog('npc_001', 20);
            
            for (let i = 1; i < log.length; i++) {
                expect(log[i-1].timestamp || 0).toBeGreaterThanOrEqual(log[i].timestamp || 0);
            }
        });
    });
    
    describe('addEvolutionEvent', () => {
        it('应该添加进化事件到日志', () => {
            dashboard.addEvolutionEvent('npc_001', {
                type: 'skill_crystallized',
                skillId: 'skill_test'
            });
            
            expect(dashboard.evolutionLog.length).toBe(1);
            expect(dashboard.evolutionLog[0].npcId).toBe('npc_001');
        });
        
        it('应该自动添加timestamp', () => {
            const before = Date.now();
            dashboard.addEvolutionEvent('npc_001', { type: 'test' });
            const after = Date.now();
            
            expect(dashboard.evolutionLog[0].timestamp).toBeGreaterThanOrEqual(before);
            expect(dashboard.evolutionLog[0].timestamp).toBeLessThanOrEqual(after);
        });
        
        it('应该保持日志大小在1000以内', () => {
            // 添加1001个事件
            for (let i = 0; i < 1001; i++) {
                dashboard.addEvolutionEvent('npc_001', { type: 'test', index: i });
            }
            
            expect(dashboard.evolutionLog.length).toBeLessThanOrEqual(1000);
        });
    });
    
    describe('getRecommendedActions', () => {
        it('应该返回推荐行动数组', () => {
            const npcIds = createTestNPCs();
            const actions = dashboard.getRecommendedActions('npc_001');
            
            expect(Array.isArray(actions)).toBe(true);
        });
        
        it('应该根据NPC状态生成相关推荐', () => {
            const npcIds = createTestNPCs();
            const actions = dashboard.getRecommendedActions('npc_001');
            
            // 应该有至少一个推荐（因为刚创建，高优先级推荐）
            expect(actions.length).toBeGreaterThan(0);
        });
        
        it('推荐应该包含priority字段', () => {
            const npcIds = createTestNPCs();
            const actions = dashboard.getRecommendedActions('npc_001');
            
            for (const action of actions) {
                expect(['high', 'medium', 'low']).toContain(action.priority);
            }
        });
        
        it('推荐应该按优先级排序', () => {
            const npcIds = createTestNPCs();
            const actions = dashboard.getRecommendedActions('npc_001');
            
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            for (let i = 1; i < actions.length; i++) {
                expect(priorityOrder[actions[i-1].priority])
                    .toBeLessThanOrEqual(priorityOrder[actions[i].priority]);
            }
        });
        
        it('推荐应该包含action、reason、suggestion字段', () => {
            const npcIds = createTestNPCs();
            const actions = dashboard.getRecommendedActions('npc_001');
            
            for (const action of actions) {
                expect(action.action).toBeDefined();
                expect(action.reason).toBeDefined();
                expect(action.suggestion).toBeDefined();
            }
        });
    });
    
    describe('getEvolutionMilestones', () => {
        it('应该返回里程碑数组', () => {
            const npcIds = createTestNPCs();
            const milestones = dashboard.getEvolutionMilestones();
            
            expect(Array.isArray(milestones)).toBe(true);
        });
        
        it('里程碑应该包含npcId、type、description、timestamp', () => {
            const npcIds = createTestNPCs();
            const milestones = dashboard.getEvolutionMilestones();
            
            for (const milestone of milestones) {
                expect(milestone.npcId).toBeDefined();
                expect(milestone.type).toBeDefined();
                expect(milestone.description).toBeDefined();
                expect(milestone.timestamp).toBeDefined();
            }
        });
    });
    
    describe('edge cases', () => {
        it('应该处理不存在的NPC', () => {
            const status = dashboard.getNPCStatus('npc_nonexistent');
            
            expect(status).toBeDefined();
            expect(status.npcId).toBe('npc_nonexistent');
        });
        
        it('应该处理空的experienceTracker', () => {
            const status = dashboard.getNPCStatus('npc_empty');
            
            expect(status).toBeDefined();
            expect(status.experience.totalInteractions).toBe(0);
        });
        
        it('应该处理未注册的NPC', () => {
            experienceTracker.track('npc_unregistered', { type: 'test' });
            
            const status = dashboard.getNPCStatus('npc_unregistered');
            
            expect(status).toBeDefined();
            expect(status.mesh).toBeNull();
        });
        
        it('getSectOverview应该处理空的宗门', () => {
            const overview = dashboard.getSectOverview();
            
            expect(overview.totalNPCs).toBe(0);
            expect(overview.npcSummaries).toEqual([]);
        });
        
        it('getEvolutionLog应该处理不存在的NPC', () => {
            const log = dashboard.getEvolutionLog('npc_nonexistent', 10);
            
            expect(Array.isArray(log)).toBe(true);
        });
        
        it('getRecommendedActions应该处理不存在的NPC', () => {
            const actions = dashboard.getRecommendedActions('npc_nonexistent');
            
            expect(Array.isArray(actions)).toBe(true);
        });
    });
});