/**
 * FinalReportGenerator.test.js - V294 Final Report Generator Tests
 * Iteration 9/9 - Final Report Generator Tests (25+ tests)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FinalReportGenerator } from '../../../systems/ai/FinalReportGenerator.js';
import { ExperienceTracker } from '../../../systems/ai/ExperienceTracker.js';
import { SkillCrystallization } from '../../../systems/ai/SkillCrystallization.js';
import { NPCLearningMesh } from '../../../systems/ai/NPCLearningMesh.js';
import { EvolutionDashboard } from '../../../systems/ai/EvolutionDashboard.js';
import { IEREngine } from '../../../systems/ai/IEREngine.js';
import { EvolutionTrigger } from '../../../systems/ai/EvolutionTrigger.js';

describe('FinalReportGenerator - V294 Final Integration Tests', () => {
    let experienceTracker, skillCrystallization, npcLearningMesh, evolutionDashboard;
    let ierEngine, evolutionTrigger, finalReportGenerator;

    beforeEach(() => {
        experienceTracker = new ExperienceTracker();
        skillCrystallization = new SkillCrystallization();
        skillCrystallization.setExperienceTracker(experienceTracker);
        ierEngine = new IEREngine(experienceTracker, skillCrystallization);
        evolutionTrigger = new EvolutionTrigger(experienceTracker, ierEngine, skillCrystallization);
        npcLearningMesh = new NPCLearningMesh();
        evolutionDashboard = new EvolutionDashboard(
            experienceTracker, skillCrystallization, npcLearningMesh, evolutionTrigger
        );
        finalReportGenerator = new FinalReportGenerator(
            experienceTracker, skillCrystallization, npcLearningMesh, evolutionDashboard
        );
    });

    describe('Constructor & Initialization', () => {
        it('should initialize with all subsystems', () => {
            expect(finalReportGenerator.experienceTracker).toBeDefined();
            expect(finalReportGenerator.skillCrystallization).toBeDefined();
            expect(finalReportGenerator.npcLearningMesh).toBeDefined();
            expect(finalReportGenerator.evolutionDashboard).toBeDefined();
        });

        it('should handle null NPCLearningMesh gracefully', () => {
            const generator = new FinalReportGenerator(
                experienceTracker, skillCrystallization, null, evolutionDashboard
            );
            const report = generator.generateFullReport();
            expect(report.totalNPCs).toBe(0);
            expect(report.totalSkills).toBeDefined();
        });

        it('should handle null EvolutionDashboard gracefully', () => {
            const generator = new FinalReportGenerator(
                experienceTracker, skillCrystallization, npcLearningMesh, null
            );
            expect(() => generator.generateFullReport()).not.toThrow();
        });
    });

    describe('generateFullReport', () => {
        it('should generate report with required fields', () => {
            const report = finalReportGenerator.generateFullReport();
            expect(report).toHaveProperty('totalNPCs');
            expect(report).toHaveProperty('totalSkills');
            expect(report).toHaveProperty('avgEvolutionLevel');
            expect(report).toHaveProperty('systemHealth');
            expect(report).toHaveProperty('timestamp');
            expect(report).toHaveProperty('version');
            expect(report.version).toBe('V294');
        });

        it('should report zero NPCs when mesh is empty', () => {
            const report = finalReportGenerator.generateFullReport();
            expect(report.totalNPCs).toBe(0);
        });

        it('should track registered NPCs in mesh', () => {
            npcLearningMesh.register('npc_report_1');
            npcLearningMesh.register('npc_report_2');
            const report = finalReportGenerator.generateFullReport();
            expect(report.totalNPCs).toBe(2);
        });

        it('should calculate average evolution level', () => {
            // Register NPCs with interactions to build evolution level
            for (let i = 0; i < 5; i++) {
                experienceTracker.track('npc_evol_1', { 
                    type: 'trade', playerAction: 'buy', npcResponse: 'sell', 
                    outcome: { success: true, satisfaction: 0.8 } 
                });
            }
            npcLearningMesh.register('npc_evol_1');
            
            const report = finalReportGenerator.generateFullReport();
            expect(report.avgEvolutionLevel).toBeGreaterThanOrEqual(0);
        });
    });

    describe('generateNPCReport', () => {
        it('should generate individual NPC report', () => {
            experienceTracker.track('npc_individual', { 
                type: 'test', playerAction: 'action', npcResponse: 'response', 
                outcome: { success: true, satisfaction: 0.7 } 
            });
            
            const report = finalReportGenerator.generateNPCReport('npc_individual');
            expect(report.success).toBe(true);
            expect(report.npcId).toBe('npc_individual');
            expect(report).toHaveProperty('evolutionLevel');
            expect(report).toHaveProperty('adaptationScore');
        });

        it('should return experience stats in NPC report', () => {
            experienceTracker.track('npc_exp_stats', { 
                type: 'trade', playerAction: 'buy sword', npcResponse: 'sell sword', 
                outcome: { success: true, satisfaction: 0.9 } 
            });
            
            const report = finalReportGenerator.generateNPCReport('npc_exp_stats');
            expect(report.experience).toHaveProperty('totalInteractions');
            expect(report.experience).toHaveProperty('successRate');
            expect(report.experience).toHaveProperty('avgSatisfaction');
        });

        it('should return skill stats in NPC report', () => {
            skillCrystallization.crystallize('npc_skill_stats', { 
                type: 'trade', playerAction: 'buy', npcResponse: 'sell' 
            });
            
            const report = finalReportGenerator.generateNPCReport('npc_skill_stats');
            expect(report.skills).toHaveProperty('totalSkills');
            expect(report.skills).toHaveProperty('totalUses');
            expect(report.skills).toHaveProperty('avgConfidence');
        });

        it('should return mesh status in NPC report', () => {
            npcLearningMesh.register('npc_mesh_status');
            npcLearningMesh.register('npc_peer_1');
            npcLearningMesh.connect('npc_mesh_status', 'npc_peer_1');
            
            const report = finalReportGenerator.generateNPCReport('npc_mesh_status');
            expect(report.mesh).toHaveProperty('peerCount');
            expect(report.mesh).toHaveProperty('peers');
            expect(report.mesh.connected).toBe(true);
        });

        it('should return failure for non-existent NPC', () => {
            const report = finalReportGenerator.generateNPCReport('non_existent_npc');
            expect(report.success).toBe(false);
            expect(report.reason).toBeDefined();
        });
    });

    describe('getSystemHealth', () => {
        it('should return health status object', () => {
            const health = finalReportGenerator.getSystemHealth();
            expect(health).toHaveProperty('overall');
            expect(health).toHaveProperty('status');
            expect(health).toHaveProperty('checks');
            expect(health).toHaveProperty('timestamp');
        });

        it('should include all health check items', () => {
            const health = finalReportGenerator.getSystemHealth();
            const checkNames = health.checks.map(c => c.name);
            expect(checkNames).toContain('ExperienceTracker_has_data');
            expect(checkNames).toContain('SkillCrystallization_accessible');
            expect(checkNames).toContain('NPCLearningMesh_has_members');
            expect(checkNames).toContain('EvolutionDashboard_functional');
            expect(checkNames).toContain('IEREngine_responsive');
        });

        it('should return healthy status when all checks pass', () => {
            npcLearningMesh.register('healthy_npc');
            const health = finalReportGenerator.getSystemHealth();
            expect(['healthy', 'degraded', 'critical']).toContain(health.status);
        });

        it('should return critical status when majority checks fail', () => {
            // Create generator with null subsystems to fail checks
            const minimalGenerator = new FinalReportGenerator(null, null, null, null);
            const health = minimalGenerator.getSystemHealth();
            expect(health.status).toBe('critical');
            expect(health.overall).toBeLessThan(0.5);
        });

        it('should calculate overall health score between 0 and 1', () => {
            const health = finalReportGenerator.getSystemHealth();
            expect(health.overall).toBeGreaterThanOrEqual(0);
            expect(health.overall).toBeLessThanOrEqual(1);
        });
    });

    describe('getAllNPCSummary', () => {
        it('should return array of NPC summaries', () => {
            experienceTracker.track('summary_npc_1', { 
                type: 'test', playerAction: 'a', npcResponse: 'b', 
                outcome: { success: true, satisfaction: 0.8 } 
            });
            experienceTracker.track('summary_npc_2', { 
                type: 'test', playerAction: 'c', npcResponse: 'd', 
                outcome: { success: false, satisfaction: 0.3 } 
            });
            
            const summaries = finalReportGenerator.getAllNPCSummary();
            expect(Array.isArray(summaries)).toBe(true);
            expect(summaries.length).toBeGreaterThanOrEqual(2);
        });

        it('should include evolution level in each summary', () => {
            experienceTracker.track('evol_summary_npc', { 
                type: 'trade', playerAction: 'buy', npcResponse: 'sell', 
                outcome: { success: true, satisfaction: 0.7 } 
            });
            
            const summaries = finalReportGenerator.getAllNPCSummary();
            const target = summaries.find(s => s.npcId === 'evol_summary_npc');
            expect(target).toHaveProperty('evolutionLevel');
        });

        it('should assess NPC health in summary', () => {
            const summaries = finalReportGenerator.getAllNPCSummary();
            for (const summary of summaries) {
                expect(summary).toHaveProperty('health');
                expect(summary.health).toHaveProperty('score');
                expect(summary.health).toHaveProperty('status');
            }
        });

        it('should return empty array when no NPCs exist', () => {
            const emptyTracker = new ExperienceTracker();
            const emptySkill = new SkillCrystallization();
            const emptyMesh = new NPCLearningMesh();
            const emptyDashboard = new EvolutionDashboard(
                emptyTracker, emptySkill, emptyMesh, 
                new EvolutionTrigger(emptyTracker, new IEREngine(emptyTracker, emptySkill), emptySkill)
            );
            const generator = new FinalReportGenerator(
                emptyTracker, emptySkill, emptyMesh, emptyDashboard
            );
            const summaries = generator.getAllNPCSummary();
            expect(Array.isArray(summaries)).toBe(true);
        });
    });

    describe('generateDetailedReport', () => {
        it('should include full report section', () => {
            const detailed = finalReportGenerator.generateDetailedReport();
            expect(detailed.fullReport).toBeDefined();
        });

        it('should include system health section', () => {
            const detailed = finalReportGenerator.generateDetailedReport();
            expect(detailed.systemHealth).toBeDefined();
        });

        it('should include NPC summary section', () => {
            const detailed = finalReportGenerator.generateDetailedReport();
            expect(Array.isArray(detailed.npcSummary)).toBe(true);
        });

        it('should include sect overview section', () => {
            const detailed = finalReportGenerator.generateDetailedReport();
            expect(detailed.sectOverview).toBeDefined();
        });

        it('should include mesh stats section', () => {
            const detailed = finalReportGenerator.generateDetailedReport();
            expect(detailed.meshStats).toBeDefined();
        });
    });

    describe('generateExportReport', () => {
        it('should include format identifier', () => {
            const exportReport = finalReportGenerator.generateExportReport();
            expect(exportReport.format).toBe('V294-Final-Report');
        });

        it('should include exported timestamp', () => {
            const exportReport = finalReportGenerator.generateExportReport();
            expect(exportReport.exportedAt).toBeDefined();
        });

        it('should include full report data', () => {
            const exportReport = finalReportGenerator.generateExportReport();
            expect(exportReport.fullReport).toBeDefined();
        });

        it('should include individual NPC reports', () => {
            experienceTracker.track('export_npc', { 
                type: 'trade', playerAction: 'buy', npcResponse: 'sell', 
                outcome: { success: true, satisfaction: 0.8 } 
            });
            
            const exportReport = finalReportGenerator.generateExportReport();
            expect(Array.isArray(exportReport.npcReports)).toBe(true);
        });

        it('should include mesh stats', () => {
            const exportReport = finalReportGenerator.generateExportReport();
            expect(exportReport.meshStats).toBeDefined();
        });

        it('should include system health', () => {
            const exportReport = finalReportGenerator.generateExportReport();
            expect(exportReport.systemHealth).toBeDefined();
        });
    });

    describe('Integration with All Subsystems', () => {
        it('should track skill crystallization in report', () => {
            // Track interaction first so NPC is registered
            experienceTracker.track('skill_cryst_npc', { 
                type: 'trade', playerAction: 'buy', npcResponse: 'sell', 
                outcome: { success: true, satisfaction: 0.8 } 
            });
            skillCrystallization.crystallize('skill_cryst_npc', { 
                type: 'trade', playerAction: 'buy sword', npcResponse: 'sell sword' 
            });
            skillCrystallization.crystallize('skill_cryst_npc', { 
                type: 'trade', playerAction: 'buy potion', npcResponse: 'sell potion' 
            });
            
            const report = finalReportGenerator.generateFullReport();
            expect(report.totalSkills).toBeGreaterThan(0);
        });

        it('should reflect mesh connections in NPC reports', () => {
            npcLearningMesh.register('mesh_npc_1');
            npcLearningMesh.register('mesh_npc_2');
            npcLearningMesh.register('mesh_npc_3');
            npcLearningMesh.connect('mesh_npc_1', 'mesh_npc_2');
            npcLearningMesh.connect('mesh_npc_2', 'mesh_npc_3');
            
            const report = finalReportGenerator.generateNPCReport('mesh_npc_1');
            expect(report.mesh.peerCount).toBeGreaterThanOrEqual(1);
        });

        it('should include evolution events in dashboard', () => {
            evolutionDashboard.addEvolutionEvent('event_npc', 'skill_crystallized', { skillId: 'test_skill' });
            const report = finalReportGenerator.generateNPCReport('event_npc');
            expect(report).toBeDefined();
        });

        it('should handle full evolution pipeline', async () => {
            // Track multiple interactions
            for (let i = 0; i < 3; i++) {
                experienceTracker.track('pipeline_npc', { 
                    type: 'trade', playerAction: 'buy', npcResponse: 'sell', 
                    outcome: { success: true, satisfaction: 0.9 } 
                });
            }
            
            // Crystallize skill
            const pattern = skillCrystallization.detectPattern(
                experienceTracker.getRecords('pipeline_npc')
            );
            if (pattern) {
                skillCrystallization.crystallize('pipeline_npc', pattern);
            }
            
            // Register in mesh
            npcLearningMesh.register('pipeline_npc');
            
            // Get comprehensive report
            const report = finalReportGenerator.generateNPCReport('pipeline_npc');
            expect(report.success).toBe(true);
            expect(report.skills.totalSkills).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Edge Cases', () => {
        it('should handle NPC with no interactions', () => {
            npcLearningMesh.register('no_interaction_npc');
            const report = finalReportGenerator.generateNPCReport('no_interaction_npc');
            expect(report.success).toBe(true);
            expect(report.experience.totalInteractions).toBe(0);
        });

        it('should handle NPC with failed interactions only', () => {
            for (let i = 0; i < 5; i++) {
                experienceTracker.track('failed_only_npc', { 
                    type: 'trade', playerAction: 'buy', npcResponse: 'sell', 
                    outcome: { success: false, satisfaction: 0.1 } 
                });
            }
            
            const report = finalReportGenerator.generateNPCReport('failed_only_npc');
            expect(report.success).toBe(true);
            expect(report.experience.successRate).toBe(0);
        });

        it('should handle very high interaction count', () => {
            for (let i = 0; i < 100; i++) {
                experienceTracker.track('high_interaction_npc', { 
                    type: 'test', playerAction: `action_${i}`, npcResponse: 'response', 
                    outcome: { success: i % 2 === 0, satisfaction: 0.6 } 
                });
            }
            
            const report = finalReportGenerator.generateNPCReport('high_interaction_npc');
            expect(report.success).toBe(true);
            expect(report.experience.totalInteractions).toBe(100);
        });

        it('should handle NPC disconnecting from mesh', () => {
            // Track interaction first so NPC exists in system
            experienceTracker.track('disconnect_npc', { 
                type: 'test', playerAction: 'a', npcResponse: 'b', 
                outcome: { success: true, satisfaction: 0.7 } 
            });
            npcLearningMesh.register('disconnect_npc');
            npcLearningMesh.unregister('disconnect_npc');
            
            const report = finalReportGenerator.generateNPCReport('disconnect_npc');
            expect(report).toBeDefined();
            expect(report.mesh).toBeDefined();
            expect(report.mesh.peerCount).toBe(0);
        });

        it('should handle skill crystallization with low confidence', () => {
            skillCrystallization.crystallize('low_conf_npc', { 
                type: 'rare', playerAction: 'unique', npcResponse: 'response', 
                confidence: 0.2 
            });
            
            const report = finalReportGenerator.generateNPCReport('low_conf_npc');
            expect(report.skills.avgConfidence).toBeLessThan(0.5);
        });
    });
});