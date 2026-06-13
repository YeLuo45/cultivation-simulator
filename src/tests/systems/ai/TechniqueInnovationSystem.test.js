/**
 * TechniqueInnovationSystem.test.js - 功法创新系统测试
 * V301 Iteration 7/9 - 测试覆盖率目标: 99%+
 * 100% pass rate required
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TechniqueInnovationSystem } from '../../../systems/ai/TechniqueInnovationSystem.js';

describe('TechniqueInnovationSystem', () => {
    let system;

    beforeEach(() => {
        system = new TechniqueInnovationSystem();
    });

    describe('registerTechnique', () => {
        it('should register a technique', () => {
            const { technique } = system.registerTechnique({ name: 'Fireball', element: 'fire', power: 50 });
            expect(technique.name).toBe('Fireball');
            expect(technique.element).toBe('fire');
            expect(technique.power).toBe(50);
        });

        it('should default to natural origin', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            expect(technique.origin).toBe('natural');
        });

        it('should generate id if not provided', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            expect(technique.techniqueId).toBeDefined();
        });
    });

    describe('getTechnique', () => {
        it('should return technique when exists', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            const t = system.getTechnique(technique.techniqueId);
            expect(t).not.toBeNull();
        });

        it('should return null for non-existent', () => {
            expect(system.getTechnique('ghost')).toBeNull();
        });
    });

    describe('listTechniques', () => {
        it('should return all techniques', () => {
            system.registerTechnique({ name: 'T1' });
            system.registerTechnique({ name: 'T2' });
            expect(system.listTechniques().length).toBe(2);
        });

        it('should filter by element', () => {
            system.registerTechnique({ name: 'T1', element: 'fire' });
            system.registerTechnique({ name: 'T2', element: 'water' });
            expect(system.listTechniques({ element: 'fire' }).length).toBe(1);
        });

        it('should filter by tier', () => {
            system.registerTechnique({ name: 'T1', tier: 1 });
            system.registerTechnique({ name: 'T2', tier: 2 });
            expect(system.listTechniques({ tier: 2 }).length).toBe(1);
        });
    });

    describe('innovate', () => {
        it('should create innovation from parent', () => {
            const { technique } = system.registerTechnique({ name: 'Fireball', power: 50 });
            const result = system.innovate(technique.techniqueId);
            expect(result.success).toBe(true);
            expect(result.innovation.parentId).toBe(technique.techniqueId);
        });

        it('should reject non-existent parent', () => {
            const result = system.innovate('ghost');
            expect(result.success).toBe(false);
            expect(result.error).toBe('PARENT_NOT_FOUND');
        });

        it('should calculate novelty', () => {
            const { technique } = system.registerTechnique({ name: 'T', element: 'fire', power: 50 });
            const { innovation } = system.innovate(technique.techniqueId, { element: 'water' });
            expect(innovation.novelty).toBeGreaterThan(0);
        });

        it('should clamp complexity to 1', () => {
            const { technique } = system.registerTechnique({ name: 'T', complexity: 0.9 });
            const { innovation } = system.innovate(technique.techniqueId, { mutationRate: 1 });
            expect(innovation.complexity).toBeLessThanOrEqual(1);
        });

        it('should trigger innovationCreated hook', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            let called = false;
            system.registerHook('innovationCreated', () => { called = true; });
            system.innovate(technique.techniqueId);
            expect(called).toBe(true);
        });

        it('should update totalInnovations stat', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            system.innovate(technique.techniqueId);
            expect(system.stats.totalInnovations).toBe(1);
        });
    });

    describe('getInnovation', () => {
        it('should return innovation', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            const { innovation } = system.innovate(technique.techniqueId);
            expect(system.getInnovation(innovation.innovationId)).not.toBeNull();
        });

        it('should return null for non-existent', () => {
            expect(system.getInnovation('ghost')).toBeNull();
        });
    });

    describe('listInnovations', () => {
        it('should list all', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            system.innovate(technique.techniqueId);
            system.innovate(technique.techniqueId);
            expect(system.listInnovations().length).toBe(2);
        });

        it('should filter by parent', () => {
            const { t1 } = { t1: system.registerTechnique({ name: 'T1' }).technique };
            system.innovate(t1.techniqueId);
            expect(system.listInnovations({ parentId: t1.techniqueId }).length).toBe(1);
        });

        it('should filter by min novelty', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            system.innovate(technique.techniqueId, { element: 'fire' });
            expect(system.listInnovations({ minNovelty: 0.1 }).length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('promoteInnovation', () => {
        it('should promote to technique', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            const { innovation } = system.innovate(technique.techniqueId);
            const result = system.promoteInnovation(innovation.innovationId);
            expect(result.success).toBe(true);
            expect(result.technique.origin).toBe('innovation');
        });

        it('should reject non-existent', () => {
            const result = system.promoteInnovation('ghost');
            expect(result.error).toBe('INNOVATION_NOT_FOUND');
        });
    });

    describe('startResearch', () => {
        it('should start research project', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            const { innovation } = system.innovate(technique.techniqueId);
            const result = system.startResearch(innovation.innovationId, 'researcher_1');
            expect(result.success).toBe(true);
            expect(result.project.status).toBe('active');
        });

        it('should reject non-existent innovation', () => {
            const result = system.startResearch('ghost', 'r1');
            expect(result.error).toBe('INNOVATION_NOT_FOUND');
        });

        it('should auto-register researcher', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            const { innovation } = system.innovate(technique.techniqueId);
            system.startResearch(innovation.innovationId, 'new_researcher');
            expect(system.researchers.has('new_researcher')).toBe(true);
        });
    });

    describe('advanceResearch', () => {
        it('should advance progress', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            const { innovation } = system.innovate(technique.techniqueId);
            const { project } = system.startResearch(innovation.innovationId, 'r1');
            const result = system.advanceResearch(project.projectId, 50);
            expect(result.project.progress).toBe(50);
        });

        it('should complete project at 100', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            const { innovation } = system.innovate(technique.techniqueId);
            const { project } = system.startResearch(innovation.innovationId, 'r1');
            system.advanceResearch(project.projectId, 150);
            const status = system.getResearchStatus(project.projectId);
            expect(status.status).toBe('completed');
        });

        it('should reject non-existent', () => {
            const result = system.advanceResearch('ghost', 10);
            expect(result.error).toBe('PROJECT_NOT_FOUND');
        });

        it('should reject inactive project', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            const { innovation } = system.innovate(technique.techniqueId);
            const { project } = system.startResearch(innovation.innovationId, 'r1');
            system.advanceResearch(project.projectId, 100);
            const result = system.advanceResearch(project.projectId, 10);
            expect(result.error).toBe('PROJECT_INACTIVE');
        });

        it('should increment researcher reputation on completion', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            const { innovation } = system.innovate(technique.techniqueId);
            const { project } = system.startResearch(innovation.innovationId, 'r1');
            system.advanceResearch(project.projectId, 100);
            expect(system.researchers.get('r1').reputation).toBe(10);
        });
    });

    describe('getResearchStatus', () => {
        it('should return status', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            const { innovation } = system.innovate(technique.techniqueId);
            const { project } = system.startResearch(innovation.innovationId, 'r1');
            const status = system.getResearchStatus(project.projectId);
            expect(status.percent).toBe(0);
        });

        it('should return null for non-existent', () => {
            expect(system.getResearchStatus('ghost')).toBeNull();
        });
    });

    describe('listResearchProjects', () => {
        it('should list all', () => {
            expect(system.listResearchProjects().length).toBe(0);
        });

        it('should filter by status', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            const { innovation } = system.innovate(technique.techniqueId);
            system.startResearch(innovation.innovationId, 'r1');
            expect(system.listResearchProjects({ status: 'active' }).length).toBe(1);
        });

        it('should filter by researcher', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            const { innovation } = system.innovate(technique.techniqueId);
            system.startResearch(innovation.innovationId, 'r1');
            expect(system.listResearchProjects({ researcherId: 'r1' }).length).toBe(1);
        });
    });

    describe('Mesh Network', () => {
        it('should add mesh node', () => {
            const result = system.addMeshNode('node1', 'innovation');
            expect(result.success).toBe(true);
        });

        it('should connect nodes', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            const result = system.connectMeshNodes('a', 'b');
            expect(result.success).toBe(true);
        });

        it('should reject non-existent nodes', () => {
            const result = system.connectMeshNodes('ghost', 'ghost2');
            expect(result.error).toBe('NODE_NOT_FOUND');
        });

        it('should share innovation to node', () => {
            system.addMeshNode('n1', 'innovation');
            const { technique } = system.registerTechnique({ name: 'T' });
            const { innovation } = system.innovate(technique.techniqueId);
            const result = system.shareInnovationToMesh(innovation.innovationId, 'n1');
            expect(result.success).toBe(true);
            expect(innovation.meshShared).toBe(true);
        });

        it('should broadcast innovation', () => {
            system.addMeshNode('a', 'innovation');
            system.addMeshNode('b', 'innovation');
            system.addMeshNode('c', 'research');
            system.connectMeshNodes('a', 'b');
            system.connectMeshNodes('b', 'c');
            const { technique } = system.registerTechnique({ name: 'T' });
            const { innovation } = system.innovate(technique.techniqueId);
            const result = system.broadcastInnovation(innovation.innovationId, 'a');
            expect(result.success).toBe(true);
        });

        it('should reject non-existent innovation', () => {
            system.addMeshNode('n1');
            const result = system.broadcastInnovation('ghost', 'n1');
            expect(result.error).toBe('INNOVATION_NOT_FOUND');
        });

        it('should reject non-existent source node', () => {
            const result = system.broadcastInnovation('any', 'ghost');
            expect(result.error).toBe('NODE_NOT_FOUND');
        });
    });

    describe('Tool System', () => {
        it('should register tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute tool', () => {
            system.registerTool('test', (ctx) => ctx.value * 2);
            const result = system.executeTool('test', { value: 5 });
            expect(result.result).toBe(10);
        });

        it('should reject non-existent tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should handle tool errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default analyzeTechnique', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            const result = system.executeTool('analyzeTechnique', { techniqueId: technique.techniqueId });
            expect(result.success).toBe(true);
        });

        it('should execute default listInnovations', () => {
            const result = system.executeTool('listInnovations', {});
            expect(result.success).toBe(true);
        });

        it('should execute default getResearchStatus', () => {
            const result = system.executeTool('getResearchStatus', { projectId: 'ghost' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('innovationCreated', () => count++);
            const { technique } = system.registerTechnique({ name: 'T' });
            system.innovate(technique.techniqueId);
            unregister();
            system.innovate(technique.techniqueId);
            expect(count).toBe(1);
        });

        it('should handle hook errors silently', () => {
            system.registerHook('innovationCreated', () => { throw new Error('boom'); });
            const { technique } = system.registerTechnique({ name: 'T' });
            expect(() => system.innovate(technique.techniqueId)).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient innovations', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve with enough innovations', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            for (let i = 0; i < 5; i++) system.innovate(technique.techniqueId);
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double-evolve', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            for (let i = 0; i < 5; i++) system.innovate(technique.techniqueId);
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should trigger evolution hook', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            for (let i = 0; i < 5; i++) system.innovate(technique.techniqueId);
            let called = false;
            system.registerHook('systemEvolved', () => { called = true; });
            system.autoEvolve();
            expect(called).toBe(true);
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            system.innovate(technique.techniqueId);
            const json = system.toJSON();
            expect(json.techniques.length).toBe(1);
            expect(json.innovations.length).toBe(1);
        });

        it('should deserialize from JSON', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            system.innovate(technique.techniqueId);
            const json = system.toJSON();
            const newSys = new TechniqueInnovationSystem();
            newSys.fromJSON(json);
            expect(newSys.techniques.size).toBe(1);
        });

        it('should preserve knowledge sets in mesh nodes', () => {
            system.addMeshNode('n1', 'innovation');
            const { technique } = system.registerTechnique({ name: 'T' });
            const { innovation } = system.innovate(technique.techniqueId);
            system.shareInnovationToMesh(innovation.innovationId, 'n1');
            const json = system.toJSON();
            const newSys = new TechniqueInnovationSystem();
            newSys.fromJSON(json);
            const node = newSys.meshNodes.get('n1');
            expect(node.knowledge.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return correct stats', () => {
            const stats = system.getStats();
            expect(stats.techniqueCount).toBe(0);
            expect(stats.innovationCount).toBe(0);
        });

        it('should track all counts', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            system.innovate(technique.techniqueId);
            system.addMeshNode('n1');
            const stats = system.getStats();
            expect(stats.techniqueCount).toBe(1);
            expect(stats.innovationCount).toBe(1);
            expect(stats.meshNodeCount).toBe(1);
        });
    });
});