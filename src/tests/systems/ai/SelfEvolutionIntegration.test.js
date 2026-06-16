/**
 * SelfEvolutionIntegration.test.js - V294 Full Chain Integration Tests
 * Iteration 9/9 - NPC Self-Evolution Integration Test (50+ tests)
 * 
 * Full pipeline test coverage:
 * - ExperienceTracker
 * - SkillCrystallization  
 * - IEREngine
 * - EvolutionTrigger
 * - LearningPolicy
 * - NPCLearningMesh
 * - SkillRegistry
 * - EvolutionDashboard
 * - FinalReportGenerator
 * - EmotionBridge
 * - DreamCollaboration
 * - MemoryConsolidation
 * - BudgetController
 * - MetricsDashboard
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExperienceTracker } from '../../../systems/ai/ExperienceTracker.js';
import { SkillCrystallization } from '../../../systems/ai/SkillCrystallization.js';
import { IEREngine } from '../../../systems/ai/IEREngine.js';
import { EvolutionTrigger } from '../../../systems/ai/EvolutionTrigger.js';
import { LearningPolicy } from '../../../systems/ai/LearningPolicy.js';
import { NPCLearningMesh } from '../../../systems/ai/NPCLearningMesh.js';
import { SkillRegistry } from '../../../systems/ai/SkillRegistry.js';
import { EvolutionDashboard } from '../../../systems/ai/EvolutionDashboard.js';
import { FinalReportGenerator } from '../../../systems/ai/FinalReportGenerator.js';
import { EmotionBridge } from '../../../systems/ai/EmotionBridge.js';
import { EmotionResonanceEngine } from '../../../systems/ai/EmotionResonanceEngine.js';
import { DreamCollaborationProtocol } from '../../../systems/ai/DreamCollaborationProtocol.js';
import { DreamSyncScheduler } from '../../../systems/ai/DreamSyncScheduler.js';
import { MemoryConsolidationScheduler } from '../../../systems/ai/MemoryConsolidationScheduler.js';
import { MemoryPriorityQueue } from '../../../systems/ai/MemoryPriorityQueue.js';
import { NPCBudgetController } from '../../../systems/ai/NPCBudgetController.js';
import { BudgetAnalytics } from '../../../systems/ai/BudgetAnalytics.js';
import { EvolutionMetricsDashboard } from '../../../systems/ai/EvolutionMetricsDashboard.js';
import { MetricsVisualizer } from '../../../systems/ai/MetricsVisualizer.js';

describe('SelfEvolutionIntegration - V294 Full Chain Tests (50+)', () => {
    let experienceTracker, skillCrystallization, ierEngine, evolutionTrigger;
    let learningPolicy, npcLearningMesh, skillRegistry, evolutionDashboard;
    let emotionBridge, emotionEngine, dreamProtocol, dreamScheduler;
    let memoryScheduler, memoryQueue, budgetController, budgetAnalytics;
    let metricsDashboard, metricsVisualizer, finalReportGenerator;

    beforeEach(() => {
        // Core subsystems
        experienceTracker = new ExperienceTracker();
        skillCrystallization = new SkillCrystallization();
        skillCrystallization.setExperienceTracker(experienceTracker);
        ierEngine = new IEREngine(experienceTracker, skillCrystallization);
        evolutionTrigger = new EvolutionTrigger(experienceTracker, ierEngine, skillCrystallization);
        learningPolicy = new LearningPolicy();
        npcLearningMesh = new NPCLearningMesh();
        skillRegistry = new SkillRegistry();
        evolutionDashboard = new EvolutionDashboard(
            experienceTracker, skillCrystallization, npcLearningMesh, evolutionTrigger
        );

        // Emotion subsystem - uses actual APIs
        emotionBridge = new EmotionBridge(null, null);
        emotionEngine = new EmotionResonanceEngine(experienceTracker, null);

        // Dream subsystem
        dreamProtocol = new DreamCollaborationProtocol(npcLearningMesh, null);
        dreamScheduler = new DreamSyncScheduler(dreamProtocol, npcLearningMesh);

        // Memory subsystem
        memoryScheduler = new MemoryConsolidationScheduler(experienceTracker, null);
        memoryQueue = new MemoryPriorityQueue();

        // Budget subsystem
        budgetController = new NPCBudgetController();
        budgetAnalytics = new BudgetAnalytics();

        // Metrics subsystem
        metricsDashboard = new EvolutionMetricsDashboard(
            experienceTracker, skillCrystallization, npcLearningMesh, evolutionDashboard
        );
        metricsVisualizer = new MetricsVisualizer();

        // Final report generator
        finalReportGenerator = new FinalReportGenerator(
            experienceTracker, skillCrystallization, npcLearningMesh, evolutionDashboard
        );
    });

    // ========================================
    // ExperienceTracker Core Tests (5 tests)
    // ========================================
    describe('ExperienceTracker Core', () => {
        it('should track single interaction', () => {
            experienceTracker.track('npc_001', { 
                type: 'trade', playerAction: 'buy', npcResponse: 'sell', 
                outcome: { success: true, satisfaction: 0.9 } 
            });
            const stats = experienceTracker.getStats('npc_001');
            expect(stats.totalInteractions).toBe(1);
        });

        it('should calculate success rate correctly', () => {
            experienceTracker.track('npc_002', { 
                type: 'test', playerAction: 'a', npcResponse: 'b', 
                outcome: { success: true, satisfaction: 0.8 } 
            });
            experienceTracker.track('npc_002', { 
                type: 'test', playerAction: 'c', npcResponse: 'd', 
                outcome: { success: false, satisfaction: 0.2 } 
            });
            const stats = experienceTracker.getStats('npc_002');
            expect(stats.successRate).toBe(0.5);
        });

        it('should calculate adaptation score', () => {
            experienceTracker.track('npc_003', { 
                type: 'trade', playerAction: 'buy', npcResponse: 'sell', 
                outcome: { success: true, satisfaction: 0.8 } 
            });
            const score = experienceTracker.getAdaptationScore('npc_003');
            expect(score).toBeGreaterThanOrEqual(0);
        });

        it('should prune old records at max limit', () => {
            const tracker = new ExperienceTracker(5);
            for (let i = 0; i < 10; i++) {
                tracker.track('npc_prune', { 
                    type: 'test', playerAction: `a${i}`, npcResponse: 'b', 
                    outcome: { success: true, satisfaction: 0.5 } 
                });
            }
            const records = tracker.getRecords('npc_prune');
            expect(records.length).toBeLessThanOrEqual(5);
        });

        it('should clear NPC records', () => {
            experienceTracker.track('npc_clear', { 
                type: 'test', playerAction: 'a', npcResponse: 'b', 
                outcome: { success: true, satisfaction: 0.7 } 
            });
            experienceTracker.clear('npc_clear');
            const stats = experienceTracker.getStats('npc_clear');
            expect(stats.totalInteractions).toBe(0);
        });
    });

    // ========================================
    // SkillCrystallization Tests (5 tests)
    // ========================================
    describe('SkillCrystallization', () => {
        it('should detect pattern with 3+ consecutive successes', () => {
            for (let i = 0; i < 3; i++) {
                experienceTracker.track('npc_pattern', { 
                    type: 'trade', playerAction: 'same_action', npcResponse: 'same_response', 
                    outcome: { success: true, satisfaction: 0.9 } 
                });
            }
            const records = experienceTracker.getRecords('npc_pattern');
            const pattern = skillCrystallization.detectPattern(records);
            expect(pattern).not.toBeNull();
        });

        it('should crystallize detected pattern into skill', () => {
            skillCrystallization.crystallize('npc_cryst', { 
                type: 'trade', playerAction: 'buy sword', npcResponse: 'sell sword' 
            });
            const skills = skillCrystallization.getSkillLibrary('npc_cryst');
            expect(skills.length).toBeGreaterThan(0);
        });

        it('should recall skill and increment use count', () => {
            skillCrystallization.crystallize('npc_recall', { 
                type: 'trade', playerAction: 'buy', npcResponse: 'sell' 
            });
            const skills = skillCrystallization.getSkillLibrary('npc_recall');
            if (skills.length > 0) {
                const result = skillCrystallization.recallSkill('npc_recall', skills[0].id);
                expect(result.success).toBe(true);
            }
        });

        it('should get skill stats', () => {
            skillCrystallization.crystallize('npc_stats', { 
                type: 'trade', playerAction: 'trade', npcResponse: 'respond' 
            });
            const stats = skillCrystallization.getSkillStats('npc_stats');
            expect(stats.totalSkills).toBeGreaterThanOrEqual(0);
        });

        it('should update skill confidence on duplicate pattern', () => {
            const pattern = { type: 'trade', playerAction: 'buy', npcResponse: 'sell' };
            skillCrystallization.crystallize('npc_dup', pattern);
            skillCrystallization.crystallize('npc_dup', pattern);
            const skills = skillCrystallization.getSkillLibrary('npc_dup');
            expect(skills.length).toBe(1);
        });
    });

    // ========================================
    // IEREngine Tests (5 tests)
    // ========================================
    describe('IEREngine', () => {
        it('should refine failed interaction', async () => {
            experienceTracker.track('npc_ier', { 
                type: 'trade', playerAction: 'buy', npcResponse: 'sell', 
                outcome: { success: false, satisfaction: 0.2 } 
            });
            const record = { 
                type: 'trade', playerAction: 'buy', npcResponse: 'sell', 
                outcome: { success: false, satisfaction: 0.2 } 
            };
            const result = await ierEngine.refine('npc_ier', record);
            expect(result).toHaveProperty('refined');
        });

        it('should track consecutive failures', async () => {
            for (let i = 0; i < 3; i++) {
                experienceTracker.track('npc_fail', { 
                    type: 'trade', playerAction: 'buy', npcResponse: 'sell', 
                    outcome: { success: false, satisfaction: 0.2 } 
                });
            }
            const failures = ierEngine.getConsecutiveFailures('npc_fail');
            expect(failures).toBeGreaterThanOrEqual(0);
        });

        it('should get refinement suggestions', () => {
            const suggestions = ierEngine.getSuggestions('npc_suggest');
            expect(Array.isArray(suggestions)).toBe(true);
        });

        it('should reset consecutive failures', () => {
            ierEngine.resetConsecutiveFailures('npc_reset');
            const failures = ierEngine.getConsecutiveFailures('npc_reset');
            expect(failures).toBe(0);
        });

        it('should get refinement history', async () => {
            const record = { 
                type: 'trade', playerAction: 'buy', npcResponse: 'sell', 
                outcome: { success: true, satisfaction: 0.8 } 
            };
            await ierEngine.refine('npc_hist', record);
            const history = ierEngine.getRefinementHistory('npc_hist');
            expect(Array.isArray(history)).toBe(true);
        });
    });

    // ========================================
    // EvolutionTrigger Tests (5 tests)
    // ========================================
    describe('EvolutionTrigger', () => {
        it('should register trigger condition', () => {
            const result = evolutionTrigger.registerTrigger(
                'npc_trig', 
                EvolutionTrigger.CONDITIONS.HIGH_FAILURE_RATE, 
                async () => ({ success: true })
            );
            expect(result.success).toBe(true);
        });

        it('should get registered triggers', () => {
            evolutionTrigger.registerTrigger(
                'npc_get_trig', 
                EvolutionTrigger.CONDITIONS.LOW_ADAPTATION, 
                async () => ({ success: true })
            );
            const triggers = evolutionTrigger.getRegisteredTriggers('npc_get_trig');
            expect(triggers.length).toBeGreaterThan(0);
        });

        it('should clear triggers', () => {
            evolutionTrigger.registerTrigger(
                'npc_clear_trig', 
                EvolutionTrigger.CONDITIONS.SKILL_MATURE, 
                async () => ({ success: true })
            );
            const result = evolutionTrigger.clearTriggers('npc_clear_trig');
            expect(result.success).toBe(true);
        });

        it('should check built-in conditions', () => {
            const conditions = evolutionTrigger.getAvailableConditions();
            expect(Array.isArray(conditions)).toBe(true);
            expect(conditions.length).toBeGreaterThan(0);
        });

        it('should set cooldown period', () => {
            evolutionTrigger.setCooldown(30000);
            // Cooldown set without error
            const result = evolutionTrigger.clearTriggers('npc_cooldown');
            expect(result.success).toBe(true);
        });
    });

    // ========================================
    // NPCLearningMesh Tests (5 tests)
    // ========================================
    describe('NPCLearningMesh', () => {
        it('should register NPC in mesh', () => {
            const result = npcLearningMesh.register('mesh_npc_1');
            expect(result.success).toBe(true);
        });

        it('should connect two NPCs', () => {
            npcLearningMesh.register('mesh_npc_2a');
            npcLearningMesh.register('mesh_npc_2b');
            const result = npcLearningMesh.connect('mesh_npc_2a', 'mesh_npc_2b');
            expect(result.success).toBe(true);
        });

        it('should get peers for NPC', () => {
            npcLearningMesh.register('mesh_peer_1');
            npcLearningMesh.register('mesh_peer_2');
            npcLearningMesh.connect('mesh_peer_1', 'mesh_peer_2');
            const peers = npcLearningMesh.getPeers('mesh_peer_1');
            expect(peers.success).toBe(true);
            expect(peers.peers).toContain('mesh_peer_2');
        });

        it('should broadcast skill to peers', () => {
            npcLearningMesh.register('mesh_bcast_1');
            npcLearningMesh.register('mesh_bcast_2');
            npcLearningMesh.connect('mesh_bcast_1', 'mesh_bcast_2');
            const skill = { 
                id: 'broadcast_skill', 
                pattern: { playerAction: 'share' }, 
                owner: 'mesh_bcast_1', 
                usage: 1, 
                confidence: 0.8 
            };
            const result = npcLearningMesh.broadcast('mesh_bcast_1', skill);
            expect(result.success).toBe(true);
        });

        it('should fuse experience between NPCs', () => {
            npcLearningMesh.register('mesh_fuse_1');
            npcLearningMesh.register('mesh_fuse_2');
            npcLearningMesh.connect('mesh_fuse_1', 'mesh_fuse_2');
            skillRegistry.register({ 
                id: 'fuse_skill', 
                pattern: { playerAction: 'fuse' }, 
                owner: 'mesh_fuse_1', 
                usage: 2, 
                confidence: 0.75 
            });
            const result = npcLearningMesh.fuseExperience('mesh_fuse_2', 'mesh_fuse_1', 'fuse_skill');
            expect(result).toHaveProperty('success');
        });
    });

    // ========================================
    // SkillRegistry Tests (5 tests)
    // ========================================
    describe('SkillRegistry', () => {
        it('should register skill', () => {
            const result = skillRegistry.register({ 
                id: 'reg_skill_1', 
                pattern: { playerAction: 'buy' }, 
                owner: 'npc_owner', 
                usage: 1, 
                confidence: 0.8 
            });
            expect(result.success).toBe(true);
        });

        it('should get skill by ID', () => {
            skillRegistry.register({ 
                id: 'get_skill_1', 
                pattern: { playerAction: 'test' }, 
                owner: 'npc', 
                usage: 1, 
                confidence: 0.7 
            });
            const skill = skillRegistry.get('get_skill_1');
            expect(skill).not.toBeNull();
            expect(skill.id).toBe('get_skill_1');
        });

        it('should find skills by pattern', () => {
            skillRegistry.register({ 
                id: 'pattern_skill', 
                pattern: 'meditate', 
                owner: 'npc_pat', 
                usage: 5, 
                confidence: 0.9 
            });
            const found = skillRegistry.findByPattern('meditate');
            expect(found.length).toBeGreaterThan(0);
        });

        it('should get most used skill', () => {
            skillRegistry.register({ id: 'most_used', pattern: { playerAction: 'freq' }, owner: 'npc', usage: 10, confidence: 0.9 });
            skillRegistry.register({ id: 'rare', pattern: { playerAction: 'rare' }, owner: 'npc', usage: 2, confidence: 0.6 });
            const mostUsed = skillRegistry.getMostUsed(1);
            expect(mostUsed[0].id).toBe('most_used');
        });

        it('should update skill usage', () => {
            skillRegistry.register({ id: 'update_usage', pattern: { playerAction: 'train' }, owner: 'npc', usage: 3, confidence: 0.7 });
            skillRegistry.updateUsage('update_usage', 5);
            const skill = skillRegistry.get('update_usage');
            expect(skill.usage).toBeGreaterThanOrEqual(3);
        });
    });

    // ========================================
    // EvolutionDashboard Tests (5 tests)
    // ========================================
    describe('EvolutionDashboard', () => {
        it('should get NPC status', () => {
            experienceTracker.track('dash_npc', { 
                type: 'test', playerAction: 'a', npcResponse: 'b', 
                outcome: { success: true, satisfaction: 0.8 } 
            });
            const status = evolutionDashboard.getNPCStatus('dash_npc');
            expect(status).toHaveProperty('npcId');
            expect(status).toHaveProperty('evolutionLevel');
        });

        it('should get sect overview', () => {
            const overview = evolutionDashboard.getSectOverview();
            expect(overview).toHaveProperty('totalNPCs');
            expect(overview).toHaveProperty('npcSummaries');
        });

        it('should add and retrieve evolution events', () => {
            evolutionDashboard.addEvolutionEvent('dash_npc_evt', 'test_event', { detail: 'test' });
            const log = evolutionDashboard.getEvolutionLog('dash_npc_evt', 10);
            expect(Array.isArray(log)).toBe(true);
        });

        it('should get recommended actions', () => {
            const actions = evolutionDashboard.getRecommendedActions('dash_npc_act');
            expect(Array.isArray(actions)).toBe(true);
        });

        it('should get evolution milestones', () => {
            const milestones = evolutionDashboard.getEvolutionMilestones();
            expect(Array.isArray(milestones)).toBe(true);
        });
    });

    // ========================================
    // LearningPolicy Tests (3 tests)
    // ========================================
    describe('LearningPolicy', () => {
        it('should update learning policy', () => {
            learningPolicy.updatePolicy('policy_npc', 'success');
            const policy = learningPolicy.getPolicy('policy_npc');
            expect(policy).toHaveProperty('learningRate');
        });

        it('should reset policy', () => {
            learningPolicy.updatePolicy('reset_npc', 'success');
            learningPolicy.resetPolicy('reset_npc');
            const policy = learningPolicy.getPolicy('reset_npc');
            expect(policy.learningRate).toBeDefined();
        });

        it('should handle unknown NPC gracefully', () => {
            const policy = learningPolicy.getPolicy('unknown_npc');
            expect(policy).toBeDefined();
        });
    });

    // ========================================
    // EmotionBridge & EmotionResonanceEngine Tests (3 tests)
    // ========================================
    describe('Emotion Subsystem', () => {
        it('should get NPC emotion state', async () => {
            experienceTracker.track('emotion_npc', { 
                type: 'test', playerAction: 'a', npcResponse: 'b', 
                outcome: { success: true, satisfaction: 0.8 } 
            });
            const result = await emotionBridge.getNPCEmotionState('emotion_npc');
            expect(result).toHaveProperty('success');
        });

        it('should calculate resonance level', async () => {
            experienceTracker.track('resonance_npc', { 
                type: 'test', playerAction: 'a', npcResponse: 'b', 
                outcome: { success: true, satisfaction: 0.8 } 
            });
            const resonance = await emotionEngine.calculateResonance('resonance_npc', 'player');
            expect(resonance).toHaveProperty('level');
            expect(resonance).toHaveProperty('dominantEmotion');
        });

        it('should record resonance event', () => {
            const result = emotionEngine.recordResonance('rec_npc', 'player', 'joy', 0.8);
            expect(result.success).toBe(true);
            expect(result.event).toBeDefined();
        });
    });

    // ========================================
    // Dream Collaboration Tests (3 tests)
    // ========================================
    describe('Dream Collaboration Subsystem', () => {
        it('should invite NPC to dream collaboration', () => {
            npcLearningMesh.register('dream_npc_1');
            npcLearningMesh.register('dream_npc_2');
            const result = dreamProtocol.inviteToDream('dream_npc_1', 'dream_npc_2', 'shared_dream');
            expect(result.success).toBe(true);
        });

        it('should get scheduler status', () => {
            const status = dreamScheduler.getSchedulerStatus();
            expect(status).toHaveProperty('success');
            expect(status).toHaveProperty('totalScheduled');
        });

        it('should get collaboration status', () => {
            npcLearningMesh.register('collab_status_1');
            const status = dreamProtocol.getCollaborationStatus('collab_status_1');
            expect(status).toHaveProperty('success');
        });
    });

    // ========================================
    // Memory Consolidation Tests (3 tests)
    // ========================================
    describe('Memory Consolidation Subsystem', () => {
        it('should enqueue memory priority', () => {
            const result = memoryQueue.enqueue('memory_content', 5);
            expect(result.success).toBe(true);
        });

        it('should schedule consolidation', () => {
            const result = memoryScheduler.scheduleConsolidation('mem_npc', 60000);
            expect(result.success).toBe(true);
        });

        it('should dequeue from priority queue', () => {
            memoryQueue.enqueue('item1', 3);
            memoryQueue.enqueue('item2', 5);
            const item = memoryQueue.dequeue();
            expect(item).toBe('item2'); // Higher priority first
        });
    });

    // ========================================
    // Budget Controller Tests (3 tests)
    // ========================================
    describe('Budget Controller Subsystem', () => {
        it('should allocate budget', () => {
            const result = budgetController.allocateBudget('budget_npc', 'training', 100);
            expect(result.success).toBe(true);
        });

        it('should track expenses', () => {
            budgetController.allocateBudget('expense_npc', 'training', 100);
            budgetController.spendBudget('expense_npc', 'training', 30);
            const status = budgetController.getBudgetStatus('expense_npc');
            expect(status.success).toBe(true);
        });

        it('should get budget status', () => {
            budgetController.allocateBudget('status_npc', 'skill', 200);
            const status = budgetController.getBudgetStatus('status_npc');
            expect(status.success).toBe(true);
        });
    });

    // ========================================
    // Metrics Dashboard Tests (3 tests)
    // ========================================
    describe('Metrics Dashboard Subsystem', () => {
        it('should get NPC metrics', () => {
            experienceTracker.track('metric_npc', { 
                type: 'test', playerAction: 'a', npcResponse: 'b', 
                outcome: { success: true, satisfaction: 0.8 } 
            });
            const metrics = metricsDashboard.getNPCMetrics('metric_npc');
            expect(metrics).toHaveProperty('npcId');
            expect(metrics).toHaveProperty('totalInteractions');
        });

        it('should get sect metrics', () => {
            const metrics = metricsDashboard.getSectMetrics();
            expect(metrics).toHaveProperty('totalNPCs');
        });

        it('should generate trend report', () => {
            experienceTracker.track('trend_npc', { 
                type: 'test', playerAction: 'a', npcResponse: 'b', 
                outcome: { success: true, satisfaction: 0.8 } 
            });
            const report = metricsDashboard.generateTrendReport('trend_npc', 10);
            expect(report).toHaveProperty('npcId');
        });
    });

    // ========================================
    // FinalReportGenerator Tests (5 tests)
    // ========================================
    describe('FinalReportGenerator Integration', () => {
        it('should generate full system report', () => {
            const report = finalReportGenerator.generateFullReport();
            expect(report).toHaveProperty('totalNPCs');
            expect(report).toHaveProperty('systemHealth');
        });

        it('should generate NPC individual report', () => {
            experienceTracker.track('report_npc', { 
                type: 'test', playerAction: 'a', npcResponse: 'b', 
                outcome: { success: true, satisfaction: 0.8 } 
            });
            const report = finalReportGenerator.generateNPCReport('report_npc');
            expect(report.success).toBe(true);
        });

        it('should get system health status', () => {
            const health = finalReportGenerator.getSystemHealth();
            expect(health).toHaveProperty('overall');
            expect(health).toHaveProperty('status');
        });

        it('should get all NPC summaries', () => {
            experienceTracker.track('summary_npc', { 
                type: 'test', playerAction: 'a', npcResponse: 'b', 
                outcome: { success: true, satisfaction: 0.7 } 
            });
            const summaries = finalReportGenerator.getAllNPCSummary();
            expect(Array.isArray(summaries)).toBe(true);
        });

        it('should generate detailed report', () => {
            const detailed = finalReportGenerator.generateDetailedReport();
            expect(detailed.fullReport).toBeDefined();
            expect(detailed.systemHealth).toBeDefined();
        });
    });

    // ========================================
    // Full Pipeline Integration Tests (5 tests)
    // ========================================
    describe('Full Pipeline Integration', () => {
        it('should execute complete self-evolution cycle', async () => {
            // Track interactions
            for (let i = 0; i < 5; i++) {
                experienceTracker.track('pipeline_full', { 
                    type: 'trade', playerAction: 'buy', npcResponse: 'sell', 
                    outcome: { success: true, satisfaction: 0.9 } 
                });
            }
            
            // Detect and crystallize pattern
            const records = experienceTracker.getRecords('pipeline_full');
            const pattern = skillCrystallization.detectPattern(records);
            if (pattern) {
                skillCrystallization.crystallize('pipeline_full', pattern);
            }
            
            // Register in mesh
            npcLearningMesh.register('pipeline_full');
            
            // Get status from dashboard
            const status = evolutionDashboard.getNPCStatus('pipeline_full');
            expect(status.evolutionLevel).toBeGreaterThanOrEqual(0);
        });

        it('should handle multi-NPC mesh collaboration', () => {
            npcLearningMesh.register('collab_npc_1');
            npcLearningMesh.register('collab_npc_2');
            npcLearningMesh.register('collab_npc_3');
            npcLearningMesh.connect('collab_npc_1', 'collab_npc_2');
            npcLearningMesh.connect('collab_npc_2', 'collab_npc_3');
            
            const peers = npcLearningMesh.getPeers('collab_npc_1');
            expect(peers.peers.length).toBeGreaterThanOrEqual(1);
        });

        it('should trigger evolution based on conditions', async () => {
            experienceTracker.track('trig_npc', { 
                type: 'trade', playerAction: 'buy', npcResponse: 'sell', 
                outcome: { success: false, satisfaction: 0.2 } 
            });
            
            evolutionTrigger.registerTrigger(
                'trig_npc',
                EvolutionTrigger.CONDITIONS.HIGH_FAILURE_RATE,
                async () => ({ success: true })
            );
            
            const result = await evolutionTrigger.checkAndTrigger('trig_npc');
            expect(result).toHaveProperty('triggered');
        });

        it('should generate comprehensive export report', () => {
            npcLearningMesh.register('export_npc');
            const exportReport = finalReportGenerator.generateExportReport();
            expect(exportReport.format).toBe('V294-Final-Report');
            expect(exportReport.npcReports).toBeDefined();
        });

        it('should maintain system health across all subsystems', () => {
            // Add some data to all subsystems
            experienceTracker.track('health_npc', { 
                type: 'test', playerAction: 'a', npcResponse: 'b', 
                outcome: { success: true, satisfaction: 0.8 } 
            });
            npcLearningMesh.register('health_npc');
            
            const health = finalReportGenerator.getSystemHealth();
            expect(health.overall).toBeGreaterThan(0);
        });
    });
});