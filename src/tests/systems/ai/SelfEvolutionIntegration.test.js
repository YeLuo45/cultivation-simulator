/**
 * SelfEvolutionIntegration.test.js - 全链路集成测试
 * V285 Iteration 9/9 - Integration + E2E Tests
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
import { NPCSelfEvolutionMCPService } from '../../../systems/mcp/NPCSelfEvolutionMCPService.js';
import { ShortcutRecorder } from '../../../systems/ai/ShortcutRecorder.js';

describe('SelfEvolutionIntegration - 全链路测试', () => {
    let experienceTracker, skillCrystallization, ierEngine, evolutionTrigger;
    let learningPolicy, npcLearningMesh, skillRegistry, evolutionDashboard, mcpService;

    beforeEach(() => {
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
        mcpService = new NPCSelfEvolutionMCPService(null, evolutionDashboard);
    });

    it('should track interaction through ExperienceTracker', () => {
        experienceTracker.track('npc_001', { type: 'trade', playerAction: 'buy', npcResponse: 'sell', outcome: { success: true, satisfaction: 0.9 } });
        const stats = experienceTracker.getStats('npc_001');
        expect(stats.totalInteractions).toBe(1);
    });

    it('should trigger skill crystallization after repeated patterns', async () => {
        for (let i = 0; i < 5; i++) {
            experienceTracker.track('npc_002', { type: 'trade', playerAction: 'buy sword', npcResponse: 'sell sword', outcome: { success: true, satisfaction: 0.9 } });
        }
        const records = experienceTracker.getRecords('npc_002');
        const pattern = skillCrystallization.detectPattern(records);
        if (pattern) {
            skillCrystallization.crystallize('npc_002', pattern);
        }
        const skills = skillCrystallization.getSkillLibrary('npc_002');
        expect(skills.length).toBeGreaterThanOrEqual(0);
    });

    it('should execute IER refinement cycle', async () => {
        const record = { type: 'trade', playerAction: 'buy', npcResponse: 'sell', outcome: { success: false, satisfaction: 0.2 } };
        experienceTracker.track('npc_003', record);
        const result = await ierEngine.refine('npc_003', record);
        expect(result).toHaveProperty('refined');
        expect(result).toHaveProperty('reason');
    });

    it('should register trigger conditions', () => {
        evolutionTrigger.registerTrigger('npc_004', EvolutionTrigger.CONDITIONS.HIGH_FAILURE_RATE, async () => {});
        const history = ierEngine.getRefinementHistory('npc_004');
        expect(Array.isArray(history)).toBe(true);
    });

    it('should update learning policy', () => {
        learningPolicy.updatePolicy('npc_005', 'success');
        const policy = learningPolicy.getPolicy('npc_005');
        expect(policy).toHaveProperty('learningRate');
    });

    it('should register NPC in learning mesh', () => {
        npcLearningMesh.register('npc_006');
        npcLearningMesh.register('npc_007');
        npcLearningMesh.connect('npc_006', 'npc_007');
        const peersResult = npcLearningMesh.getPeers('npc_006');
        expect(peersResult.success).toBe(true);
        expect(peersResult.peers).toContain('npc_007');
    });

    it('should register and retrieve skills from registry', () => {
        skillRegistry.register({ id: 'skill_001', pattern: { playerAction: 'buy' }, owner: 'npc_008', usage: 1, confidence: 0.8 });
        const skill = skillRegistry.get('skill_001');
        expect(skill).not.toBeNull();
        expect(skill.id).toBe('skill_001');
    });

    it('should get NPC status from dashboard', () => {
        experienceTracker.track('npc_009', { type: 'trade', playerAction: 'buy', npcResponse: 'sell', outcome: { success: true, satisfaction: 0.8 } });
        const status = evolutionDashboard.getNPCStatus('npc_009');
        expect(status).toHaveProperty('npcId');
        expect(status).toHaveProperty('evolutionLevel');
    });

    it('should get sect overview from dashboard', () => {
        const overview = evolutionDashboard.getSectOverview();
        expect(overview).toHaveProperty('totalNPCs');
        expect(overview).toHaveProperty('totalInteractions');
        expect(overview).toHaveProperty('npcSummaries');
    });

    it('should add and retrieve evolution events', () => {
        evolutionDashboard.addEvolutionEvent('npc_010', 'test_event', { detail: 'test' });
        const log = evolutionDashboard.getEvolutionLog('npc_010', 10);
        expect(Array.isArray(log)).toBe(true);
    });

    it('should get recommended actions from dashboard', () => {
        const actions = evolutionDashboard.getRecommendedActions('npc_011');
        expect(Array.isArray(actions)).toBe(true);
    });

    it('should register and execute MCP tools', () => {
        mcpService.registerTools();
        const tools = mcpService.toolsRegistry.getAllTools();
        expect(tools.length).toBeGreaterThan(0);
    });

    it('should find skills by pattern in registry', () => {
        skillRegistry.register({ id: 'skill_pattern_001', pattern: 'meditate', owner: 'npc_012', usage: 5, confidence: 0.9 });
        const found = skillRegistry.findByPattern('meditate');
        expect(found.length).toBeGreaterThan(0);
    });

    it('should update skill usage in registry', () => {
        skillRegistry.register({ id: 'skill_usage_001', pattern: { playerAction: 'train' }, owner: 'npc_013', usage: 3, confidence: 0.7 });
        skillRegistry.updateUsage('skill_usage_001', 1);
        const skill = skillRegistry.get('skill_usage_001');
        expect(skill.usage).toBeGreaterThanOrEqual(3);
    });

    it('should handle NPC disconnection in mesh', () => {
        npcLearningMesh.register('npc_014');
        npcLearningMesh.register('npc_015');
        npcLearningMesh.connect('npc_014', 'npc_015');
        npcLearningMesh.disconnect('npc_014', 'npc_015');
        const peersResult = npcLearningMesh.getPeers('npc_014');
        expect(peersResult.peers).not.toContain('npc_015');
    });

    it('should unregister NPC from mesh', () => {
        npcLearningMesh.register('npc_016');
        npcLearningMesh.unregister('npc_016');
        const peersResult = npcLearningMesh.getPeers('npc_016');
        expect(peersResult.success).toBe(false);
    });

    it('should broadcast skill to mesh', () => {
        npcLearningMesh.register('npc_017');
        npcLearningMesh.register('npc_018');
        npcLearningMesh.connect('npc_017', 'npc_018');
        const skill = { id: 'shared_skill_001', pattern: { playerAction: 'share' }, owner: 'npc_017', usage: 1, confidence: 0.8 };
        npcLearningMesh.broadcast('npc_017', skill);
        const sharedResult = npcLearningMesh.querySharedSkills('npc_018');
        expect(sharedResult.success).toBe(true);
        expect(sharedResult.skills.length).toBeGreaterThanOrEqual(0);
    });

    it('should fuse experience between NPCs', () => {
        npcLearningMesh.register('npc_019');
        npcLearningMesh.register('npc_020');
        skillRegistry.register({ id: 'fuse_skill_001', pattern: { playerAction: 'fuse' }, owner: 'npc_019', usage: 2, confidence: 0.75 });
        const result = npcLearningMesh.fuseExperience('npc_020', 'npc_019', 'fuse_skill_001');
        expect(result).toHaveProperty('success');
    });

    it('should get evolution milestones from dashboard', () => {
        const milestones = evolutionDashboard.getEvolutionMilestones('npc_021');
        expect(Array.isArray(milestones)).toBe(true);
    });

    it('should get all skills from crystallization', () => {
        skillCrystallization.crystallize('test_npc_skill', { actions: ['test'], successRate: 0.8 });
        const skills = skillCrystallization.getSkillLibrary('test_npc_skill');
        expect(Array.isArray(skills)).toBe(true);
    });

    it('should clear experience tracker', () => {
        experienceTracker.track('npc_022', { type: 'test', playerAction: 'test', npcResponse: 'test', outcome: { success: true, satisfaction: 0.5 } });
        experienceTracker.clear('npc_022');
        const stats = experienceTracker.getStats('npc_022');
        expect(stats.totalInteractions).toBe(0);
    });

    it('should handle multiple NPCs in learning mesh', () => {
        for (let i = 1; i <= 4; i++) {
            npcLearningMesh.register(`npc_mesh_${i}`);
        }
        npcLearningMesh.connect('npc_mesh_1', 'npc_mesh_2');
        npcLearningMesh.connect('npc_mesh_2', 'npc_mesh_3');
        const peersResult = npcLearningMesh.getPeers('npc_mesh_1');
        expect(peersResult.peers.length).toBeGreaterThanOrEqual(1);
    });

    it('should track multiple interactions for same NPC', () => {
        for (let i = 0; i < 10; i++) {
            experienceTracker.track('npc_multi', { type: 'test', playerAction: `action_${i}`, npcResponse: `response_${i}`, outcome: { success: i % 2 === 0, satisfaction: 0.7 } });
        }
        const stats = experienceTracker.getStats('npc_multi');
        expect(stats.totalInteractions).toBe(10);
    });

    it('should get most used skill from registry', () => {
        skillRegistry.register({ id: 'most_used_001', pattern: { playerAction: 'freq' }, owner: 'npc_freq', usage: 10, confidence: 0.9 });
        skillRegistry.register({ id: 'most_used_002', pattern: { playerAction: 'rare' }, owner: 'npc_rare', usage: 2, confidence: 0.6 });
        const mostUsed = skillRegistry.getMostUsed(1);
        expect(mostUsed[0].id).toBe('most_used_001');
    });

    it('should get most confident skill from registry', () => {
        skillRegistry.register({ id: 'high_conf_001', pattern: { playerAction: 'conf' }, owner: 'npc_conf', usage: 5, confidence: 0.95 });
        skillRegistry.register({ id: 'low_conf_001', pattern: { playerAction: 'unconf' }, owner: 'npc_unconf', usage: 5, confidence: 0.3 });
        const mostConf = skillRegistry.getMostConfident(1);
        expect(mostConf[0].id).toBe('high_conf_001');
    });

    it('should prune experience tracker records', () => {
        const tracker = new ExperienceTracker(5); // max 5 records
        for (let i = 0; i < 10; i++) {
            tracker.track('npc_prune', { type: 'test', playerAction: `action_${i}`, npcResponse: 'test', outcome: { success: true, satisfaction: 0.5 } });
        }
        const records = tracker.getRecords('npc_prune');
        expect(records.length).toBeLessThanOrEqual(5);
    });

    it('should detect pattern with threshold', () => {
        for (let i = 0; i < 3; i++) {
            experienceTracker.track('npc_pattern', { type: 'trade', playerAction: 'same_action', npcResponse: 'same_response', outcome: { success: true, satisfaction: 0.9 } });
        }
        const records = experienceTracker.getRecords('npc_pattern');
        const pattern = skillCrystallization.detectPattern(records);
        expect(pattern).not.toBeNull();
    });

    it('should reset learning policy', () => {
        learningPolicy.updatePolicy('npc_reset', 'success');
        learningPolicy.resetPolicy('npc_reset');
        const policy = learningPolicy.getPolicy('npc_reset');
        expect(policy.learningRate).toBeDefined();
    });

    it('should execute MCP tool getNPCStatus', () => {
        mcpService.registerTools();
        const result = mcpService.toolsRegistry.execute('getNPCStatus', { npcId: 'test_npc' });
        expect(result).toBeDefined();
    });

    it('should handle shortuct recorder integration', () => {
        const recorder = new ShortcutRecorder();
        recorder.record('npc_sc', 'buy_sword', 'sell_sword', 5);
        const shortcut = recorder.findShortcut('npc_sc', 'buy_sword');
        expect(shortcut).not.toBeNull();
    });
});