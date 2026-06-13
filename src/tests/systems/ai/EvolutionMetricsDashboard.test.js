/**
 * EvolutionMetricsDashboard.test.js - 进化指标仪表板测试
 * V292 Iteration 7/9
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EvolutionMetricsDashboard } from '../../../systems/ai/EvolutionMetricsDashboard.js';

describe('EvolutionMetricsDashboard', () => {
    let dashboard, mockExperienceTracker, mockSkillCrystallization, mockNpcLearningMesh, mockEvolutionDashboard;

    beforeEach(() => {
        mockExperienceTracker = {
            getStats: (npcId) => ({ evolutionLevel: 2, totalInteractions: 10, adaptationLevel: 0.7, successRate: 0.8, lastInteraction: Date.now() }),
            getRecords: (npcId) => [
                { outcome: { success: true, satisfaction: 0.8 } },
                { outcome: { success: true, satisfaction: 0.9 } },
                { outcome: { success: false, satisfaction: 0.3 } }
            ]
        };
        mockSkillCrystallization = {
            getSkillLibrary: (npcId) => [{ id: 'skill1' }, { id: 'skill2' }],
            getAllSkills: () => [{ id: 'skill1' }, { id: 'skill2' }, { id: 'skill3' }]
        };
        mockNpcLearningMesh = {
            getPeers: (npcId) => ({ peers: ['npc2', 'npc3'] })
        };
        mockEvolutionDashboard = {
            getNPCStatus: (npcId) => ({ npcId, evolutionLevel: 2 }),
            getSectOverview: () => ({ totalNPCs: 5, avgEvolutionLevel: 1.5 })
        };
        dashboard = new EvolutionMetricsDashboard(
            mockExperienceTracker, mockSkillCrystallization, mockNpcLearningMesh, mockEvolutionDashboard
        );
    });

    it('should get NPC metrics', () => {
        const metrics = dashboard.getNPCMetrics('npc1');
        expect(metrics.npcId).toBe('npc1');
        expect(metrics.evolutionLevel).toBe(2);
        expect(metrics.skillCount).toBe(2);
        expect(metrics.meshConnections).toBe(2);
    });

    it('should get sect metrics', () => {
        const sectMetrics = dashboard.getSectMetrics();
        expect(sectMetrics.totalNPCs).toBe(5);
        expect(sectMetrics.totalSkills).toBe(3);
    });

    it('should generate trend report', () => {
        const report = dashboard.generateTrendReport('npc1', 10);
        expect(report.npcId).toBe('npc1');
        expect(report.timeRange).toBe(10);
        expect(report.recordCount).toBeLessThanOrEqual(3);
    });

    it('should get milestones', () => {
        const milestones = dashboard.getMilestones('npc1');
        expect(Array.isArray(milestones)).toBe(true);
    });

    it('should handle missing data gracefully', () => {
        const emptyTracker = { getStats: () => ({}), getRecords: () => [] };
        const emptyDash = new EvolutionMetricsDashboard(emptyTracker, { getSkillLibrary: () => [] }, { getPeers: () => [] }, {});
        const metrics = emptyDash.getNPCMetrics('unknown');
        expect(metrics.npcId).toBe('unknown');
        expect(metrics.evolutionLevel).toBe(1);
    });

    it('should calculate trend correctly', () => {
        const records = Array(10).fill(null).map((_, i) => ({
            outcome: { success: i < 5, satisfaction: 0.5 }
        }));
        const result = dashboard.generateTrendReport('trend_npc', 10);
        expect(result.trend).toBeDefined();
    });

    it('should count mesh connections', () => {
        const metrics = dashboard.getNPCMetrics('npc1');
        expect(typeof metrics.meshConnections).toBe('number');
    });

    it('should return valid metrics structure', () => {
        const metrics = dashboard.getNPCMetrics('test_npc');
        expect(metrics).toHaveProperty('npcId');
        expect(metrics).toHaveProperty('evolutionLevel');
        expect(metrics).toHaveProperty('totalInteractions');
        expect(metrics).toHaveProperty('adaptationScore');
        expect(metrics).toHaveProperty('skillCount');
        expect(metrics).toHaveProperty('meshConnections');
        expect(metrics).toHaveProperty('successRate');
    });

    it('should work with empty skill library', () => {
        const emptySkills = new EvolutionMetricsDashboard(
            mockExperienceTracker, { getSkillLibrary: () => [] }, mockNpcLearningMesh, mockEvolutionDashboard
        );
        const metrics = emptySkills.getNPCMetrics('empty_skill_npc');
        expect(metrics.skillCount).toBe(0);
    });

    it('should work with empty mesh peers', () => {
        const emptyMesh = new EvolutionMetricsDashboard(
            mockExperienceTracker, mockSkillCrystallization, { getPeers: () => [] }, mockEvolutionDashboard
        );
        const metrics = emptyMesh.getNPCMetrics('empty_mesh_npc');
        expect(metrics.meshConnections).toBe(0);
    });

    it('should generate trend report with no records', () => {
        const emptyTracker = { getStats: () => ({}), getRecords: () => [] };
        const emptyDash = new EvolutionMetricsDashboard(emptyTracker, { getSkillLibrary: () => [] }, { getPeers: () => [] }, {});
        const report = emptyDash.generateTrendReport('no_records', 10);
        expect(report.recordCount).toBe(0);
        expect(report.successRate).toBe(0);
    });

    it('should handle null evolution dashboard', () => {
        const noDash = new EvolutionMetricsDashboard(
            mockExperienceTracker, mockSkillCrystallization, mockNpcLearningMesh, null
        );
        const metrics = noDash.getNPCMetrics('no_dash_npc');
        expect(metrics.npcId).toBe('no_dash_npc');
    });

    it('should get milestones with high interaction', () => {
        const mockWithHighInteractions = {
            getStats: (npcId) => ({ totalInteractions: 15, evolutionLevel: 3, adaptationLevel: 0.8 }),
            getRecords: () => []
        };
        const mockWithSkills = {
            getSkillLibrary: () => [{ id: 's1' }, { id: 's2' }, { id: 's3' }, { id: 's4' }]
        };
        const dash = new EvolutionMetricsDashboard(mockWithHighInteractions, mockWithSkills, { getPeers: () => ({ peers: [] }) }, {});
        const milestones = dash.getMilestones('milestone_npc');
        expect(milestones.length).toBeGreaterThan(0);
    });

    it('should calculate improving trend', () => {
        const records = [
            { outcome: { success: false, satisfaction: 0.2 } },
            { outcome: { success: false, satisfaction: 0.2 } },
            { outcome: { success: true, satisfaction: 0.9 } },
            { outcome: { success: true, satisfaction: 0.9 } }
        ];
        const mock = { getStats: () => ({}), getRecords: () => records };
        const dash = new EvolutionMetricsDashboard(mock, { getSkillLibrary: () => [] }, { getPeers: () => [] }, {});
        const report = dash.generateTrendReport('improve_npc', 10);
        expect(report.trend).toBeDefined();
    });

    it('should calculate declining trend', () => {
        const records = [
            { outcome: { success: true, satisfaction: 0.9 } },
            { outcome: { success: true, satisfaction: 0.9 } },
            { outcome: { success: false, satisfaction: 0.2 } },
            { outcome: { success: false, satisfaction: 0.2 } }
        ];
        const mock = { getStats: () => ({}), getRecords: () => records };
        const dash = new EvolutionMetricsDashboard(mock, { getSkillLibrary: () => [] }, { getPeers: () => [] }, {});
        const report = dash.generateTrendReport('decline_npc', 10);
        expect(report.trend).toBeDefined();
    });

    it('should calculate stable trend', () => {
        const records = [
            { outcome: { success: true, satisfaction: 0.6 } },
            { outcome: { success: true, satisfaction: 0.6 } },
            { outcome: { success: true, satisfaction: 0.6 } },
            { outcome: { success: true, satisfaction: 0.6 } }
        ];
        const mock = { getStats: () => ({}), getRecords: () => records };
        const dash = new EvolutionMetricsDashboard(mock, { getSkillLibrary: () => [] }, { getPeers: () => [] }, {});
        const report = dash.generateTrendReport('stable_npc', 10);
        expect(report.trend).toBe('stable');
    });

    it('should handle sect overview missing data', () => {
        const noDash = new EvolutionMetricsDashboard(
            mockExperienceTracker, mockSkillCrystallization, mockNpcLearningMesh, { getSectOverview: () => ({}) }
        );
        const sectMetrics = noDash.getSectMetrics();
        expect(sectMetrics.totalNPCs).toBe(0);
    });

    it('should get metrics with array peers', () => {
        const arrayMesh = new EvolutionMetricsDashboard(
            mockExperienceTracker, mockSkillCrystallization, { getPeers: (npcId) => ['npc2', 'npc3'] }, mockEvolutionDashboard
        );
        const metrics = arrayMesh.getNPCMetrics('array_mesh_npc');
        expect(metrics.meshConnections).toBe(2);
    });

    it('should handle undefined skill crystallization all skills', () => {
        const noAllSkills = new EvolutionMetricsDashboard(
            mockExperienceTracker, { getSkillLibrary: () => [] }, mockNpcLearningMesh, mockEvolutionDashboard
        );
        const sectMetrics = noAllSkills.getSectMetrics();
        expect(sectMetrics.totalSkills).toBe(0);
    });

    it('should track last active time', () => {
        const metrics = dashboard.getNPCMetrics('last_active_npc');
        expect(metrics.lastActive).toBeDefined();
    });

    it('should return numeric evolution level', () => {
        const metrics = dashboard.getNPCMetrics('numeric_level_npc');
        expect(typeof metrics.evolutionLevel).toBe('number');
    });

    it('should handle zero interactions', () => {
        const zeroTracker = { getStats: () => ({ totalInteractions: 0 }), getRecords: () => [] };
        const dash = new EvolutionMetricsDashboard(zeroTracker, { getSkillLibrary: () => [] }, { getPeers: () => [] }, {});
        const metrics = dash.getNPCMetrics('zero_npc');
        expect(metrics.totalInteractions).toBe(0);
    });

    it('should work with large time range', () => {
        const report = dashboard.generateTrendReport('large_range_npc', 100);
        expect(report.timeRange).toBe(100);
    });
});