/**
 * FormationCore.test.js - 阵法核心管理系统测试
 * V313 Iteration 1/9 Round 4 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FormationCore } from '../../../systems/ai/FormationCore.js';

describe('FormationCore', () => {
    let system;

    beforeEach(() => { system = new FormationCore(); });

    describe('Default Types', () => {
        it('should have default formation types', () => {
            expect(system.formationTypes.size).toBe(6);
        });
    });

    describe('createFormation', () => {
        it('should create formation', () => {
            const { formation } = system.createFormation({ name: 'Test' });
            expect(formation.name).toBe('Test');
        });

        it('should default to three_talent type', () => {
            const { formation } = system.createFormation({});
            expect(formation.typeId).toBe('three_talent');
        });

        it('should generate id', () => {
            const { formation } = system.createFormation({});
            expect(formation.formationId).toBeDefined();
        });

        it('should generate positionMap for three_talent', () => {
            const { formation } = system.createFormation({ typeId: 'three_talent' });
            expect(formation.positionMap.length).toBe(3);
        });

        it('should generate positionMap for nine_palaces', () => {
            const { formation } = system.createFormation({ typeId: 'nine_palaces' });
            expect(formation.positionMap.length).toBe(9);
        });

        it('should reject invalid type', () => {
            const result = system.createFormation({ typeId: 'ghost' });
            expect(result.error).toBe('TYPE_NOT_FOUND');
        });

        it('should compute initial power', () => {
            const { formation } = system.createFormation({ typeId: 'three_talent' });
            expect(formation.power).toBeGreaterThan(0);
        });

        it('should increment totalFormations', () => {
            system.createFormation({});
            expect(system.stats.totalFormations).toBe(1);
        });

        it('should trigger formationCreated hook', () => {
            let called = false;
            system.registerHook('formationCreated', () => { called = true; });
            system.createFormation({});
            expect(called).toBe(true);
        });
    });

    describe('getFormation', () => {
        it('should return formation', () => {
            const { formation } = system.createFormation({});
            expect(system.getFormation(formation.formationId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getFormation('ghost')).toBeNull();
        });
    });

    describe('listFormations', () => {
        it('should list all', () => {
            system.createFormation({});
            system.createFormation({});
            expect(system.listFormations().length).toBe(2);
        });
    });

    describe('assignMember', () => {
        it('should assign', () => {
            const { formation } = system.createFormation({});
            const result = system.assignMember(formation.formationId, 0, 'm1');
            expect(result.success).toBe(true);
        });

        it('should reject missing formation', () => {
            const result = system.assignMember('ghost', 0, 'm1');
            expect(result.error).toBe('FORMATION_NOT_FOUND');
        });

        it('should reject invalid position', () => {
            const { formation } = system.createFormation({});
            const result = system.assignMember(formation.formationId, 99, 'm1');
            expect(result.error).toBe('INVALID_POSITION');
        });

        it('should set position occupant', () => {
            const { formation } = system.createFormation({});
            system.assignMember(formation.formationId, 0, 'm1');
            expect(formation.positionMap[0].occupant).toBe('m1');
        });

        it('should track assignments', () => {
            const { formation } = system.createFormation({});
            system.assignMember(formation.formationId, 0, 'm1');
            expect(system.assignments.get('m1')).toContain(formation.formationId);
        });

        it('should remove previous occupant from assignments', () => {
            const { formation } = system.createFormation({});
            system.assignMember(formation.formationId, 0, 'm1');
            system.assignMember(formation.formationId, 0, 'm2');
            expect(system.assignments.has('m1')).toBe(false);
            expect(system.assignments.get('m2')).toContain(formation.formationId);
        });

        it('should not duplicate assignments', () => {
            const { formation } = system.createFormation({});
            system.assignMember(formation.formationId, 0, 'm1');
            system.assignMember(formation.formationId, 0, 'm1');
            expect(system.assignments.get('m1').length).toBe(1);
        });

        it('should increment totalAssignments', () => {
            const { formation } = system.createFormation({});
            system.assignMember(formation.formationId, 0, 'm1');
            expect(system.stats.totalAssignments).toBe(1);
        });

        it('should trigger memberAssigned hook', () => {
            const { formation } = system.createFormation({});
            let called = false;
            system.registerHook('memberAssigned', () => { called = true; });
            system.assignMember(formation.formationId, 0, 'm1');
            expect(called).toBe(true);
        });
    });

    describe('unassignMember', () => {
        it('should unassign', () => {
            const { formation } = system.createFormation({});
            system.assignMember(formation.formationId, 0, 'm1');
            const result = system.unassignMember(formation.formationId, 0);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.unassignMember('ghost', 0);
            expect(result.error).toBe('FORMATION_NOT_FOUND');
        });

        it('should reject invalid position', () => {
            const { formation } = system.createFormation({});
            const result = system.unassignMember(formation.formationId, 99);
            expect(result.error).toBe('INVALID_POSITION');
        });

        it('should clear position', () => {
            const { formation } = system.createFormation({});
            system.assignMember(formation.formationId, 0, 'm1');
            system.unassignMember(formation.formationId, 0);
            expect(formation.positionMap[0].occupant).toBeNull();
        });

        it('should remove from assignments', () => {
            const { formation } = system.createFormation({});
            system.assignMember(formation.formationId, 0, 'm1');
            system.unassignMember(formation.formationId, 0);
            expect(system.assignments.has('m1')).toBe(false);
        });

        it('should trigger memberUnassigned hook', () => {
            const { formation } = system.createFormation({});
            system.assignMember(formation.formationId, 0, 'm1');
            let called = false;
            system.registerHook('memberUnassigned', () => { called = true; });
            system.unassignMember(formation.formationId, 0);
            expect(called).toBe(true);
        });
    });

    describe('getMemberFormations', () => {
        it('should return formations for member', () => {
            const { formation } = system.createFormation({});
            system.assignMember(formation.formationId, 0, 'm1');
            expect(system.getMemberFormations('m1').length).toBe(1);
        });

        it('should return empty for unknown', () => {
            expect(system.getMemberFormations('ghost').length).toBe(0);
        });
    });

    describe('analyzeFormation', () => {
        it('should analyze', () => {
            const { formation } = system.createFormation({});
            const result = system.analyzeFormation(formation.formationId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.analyzeFormation('ghost');
            expect(result.error).toBe('FORMATION_NOT_FOUND');
        });

        it('should compute completeness', () => {
            const { formation } = system.createFormation({ typeId: 'three_talent' });
            system.assignMember(formation.formationId, 0, 'm1');
            const result = system.analyzeFormation(formation.formationId);
            expect(result.analysis.completeness).toBeCloseTo(0.333, 2);
        });

        it('should detect leader', () => {
            const { formation } = system.createFormation({});
            system.assignMember(formation.formationId, 0, 'm1');
            const result = system.analyzeFormation(formation.formationId);
            expect(result.analysis.leader).toBe('m1');
        });

        it('should detect no leader when empty', () => {
            const { formation } = system.createFormation({});
            const result = system.analyzeFormation(formation.formationId);
            expect(result.analysis.leader).toBeNull();
        });
    });

    describe('addExp', () => {
        it('should add exp', () => {
            const { formation } = system.createFormation({});
            const result = system.addExp(formation.formationId, 50);
            expect(formation.exp).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.addExp('ghost', 50);
            expect(result.error).toBe('FORMATION_NOT_FOUND');
        });

        it('should level up at threshold', () => {
            const { formation } = system.createFormation({});
            system.addExp(formation.formationId, 1000);
            expect(formation.level).toBeGreaterThan(0);
        });

        it('should trigger formationLeveledUp hook', () => {
            const { formation } = system.createFormation({});
            let called = false;
            system.registerHook('formationLeveledUp', () => { called = true; });
            system.addExp(formation.formationId, 1000);
            expect(called).toBe(true);
        });

        it('should increase power on level up', () => {
            const { formation } = system.createFormation({});
            const before = formation.power;
            system.addExp(formation.formationId, 1000);
            expect(formation.power).toBeGreaterThan(before);
        });
    });

    describe('deleteFormation', () => {
        it('should delete', () => {
            const { formation } = system.createFormation({});
            const result = system.deleteFormation(formation.formationId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteFormation('ghost');
            expect(result.error).toBe('FORMATION_NOT_FOUND');
        });

        it('should clean up assignments', () => {
            const { formation } = system.createFormation({});
            system.assignMember(formation.formationId, 0, 'm1');
            system.deleteFormation(formation.formationId);
            expect(system.assignments.has('m1')).toBe(false);
        });

        it('should trigger formationDeleted hook', () => {
            const { formation } = system.createFormation({});
            let called = false;
            system.registerHook('formationDeleted', () => { called = true; });
            system.deleteFormation(formation.formationId);
            expect(called).toBe(true);
        });
    });

    describe('Mesh Network', () => {
        it('should add node', () => {
            const result = system.addMeshNode('n1');
            expect(result.success).toBe(true);
        });

        it('should connect nodes', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            const result = system.connectMeshNodes('a', 'b');
            expect(result.success).toBe(true);
        });

        it('should reject missing nodes', () => {
            const result = system.connectMeshNodes('ghost', 'ghost2');
            expect(result.error).toBe('NODE_NOT_FOUND');
        });
    });

    describe('Tool System', () => {
        it('should register tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute tool', () => {
            system.registerTool('test', (ctx) => ctx.value);
            const result = system.executeTool('test', { value: 42 });
            expect(result.result).toBe(42);
        });

        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should handle errors', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('x');
        });

        it('should execute default getFormation', () => {
            const result = system.executeTool('getFormation', { formationId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default listFormations', () => {
            const result = system.executeTool('listFormations', {});
            expect(result.result.length).toBe(0);
        });

        it('should execute default analyzeFormation', () => {
            const result = system.executeTool('analyzeFormation', { formationId: 'ghost' });
            expect(result.result.success).toBe(false);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('formationCreated', () => count++);
            unregister();
            system.createFormation({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('formationCreated', () => { throw new Error('x'); });
            expect(() => system.createFormation({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalFormations = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalFormations = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createFormation({});
            const json = system.toJSON();
            expect(json.formations.length).toBe(1);
        });

        it('should deserialize', () => {
            system.createFormation({});
            const json = system.toJSON();
            const newSys = new FormationCore();
            newSys.fromJSON(json);
            expect(newSys.formations.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.formationCount).toBe(0);
        });
    });
});