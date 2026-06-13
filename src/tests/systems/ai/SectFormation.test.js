/**
 * SectFormation.test.js - 宗门阵法测试
 * V480 Iteration 12/15 Round 18 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectFormation } from '../../../systems/ai/SectFormation.js';

describe('SectFormation', () => {
    let system;
    beforeEach(() => { system = new SectFormation(); });

    describe('designFormation', () => {
        it('should design', () => {
            const { formation } = system.designFormation({ sectId: 's1', name: 'Iron Wall' });
            expect(formation.name).toBe('Iron Wall');
            expect(formation.sectId).toBe('s1');
            expect(formation.status).toBe('drafted');
            expect(formation.type).toBe('defense');
        });

        it('should trigger formationDesigned hook', () => {
            let called = false;
            system.registerHook('formationDesigned', () => { called = true; });
            system.designFormation({});
            expect(called).toBe(true);
        });
    });

    describe('getFormation', () => {
        it('should return', () => {
            const { formation } = system.designFormation({});
            expect(system.getFormation(formation.formationId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getFormation('ghost')).toBeNull(); });
    });

    describe('listFormations', () => {
        it('should list all', () => {
            system.designFormation({});
            expect(system.listFormations().length).toBe(1);
        });
    });

    describe('listBySect', () => {
        it('should filter', () => {
            system.designFormation({ sectId: 's1' });
            system.designFormation({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.designFormation({ type: 'defense' });
            system.designFormation({ type: 'attack' });
            expect(system.listByType('defense').length).toBe(1);
        });
    });

    describe('empowerFormation', () => {
        it('should empower', () => {
            const { formation } = system.designFormation({});
            system.empowerFormation(formation.formationId, 10);
            expect(formation.power).toBe(10);
        });

        it('should reject missing', () => {
            const result = system.empowerFormation('ghost', 10);
            expect(result.error).toBe('FORMATION_NOT_FOUND');
        });

        it('should trigger formationEmpowered hook', () => {
            const { formation } = system.designFormation({});
            let called = false;
            system.registerHook('formationEmpowered', () => { called = true; });
            system.empowerFormation(formation.formationId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpFormation', () => {
        it('should level up', () => {
            const { formation } = system.designFormation({});
            system.levelUpFormation(formation.formationId);
            expect(formation.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpFormation('ghost');
            expect(result.error).toBe('FORMATION_NOT_FOUND');
        });

        it('should trigger formationLeveled hook', () => {
            const { formation } = system.designFormation({});
            let called = false;
            system.registerHook('formationLeveled', () => { called = true; });
            system.levelUpFormation(formation.formationId);
            expect(called).toBe(true);
        });
    });

    describe('collapseFormation', () => {
        it('should collapse', () => {
            const { formation } = system.designFormation({});
            system.collapseFormation(formation.formationId);
            expect(formation.status).toBe('collapsed');
        });

        it('should reject missing', () => {
            const result = system.collapseFormation('ghost');
            expect(result.error).toBe('FORMATION_NOT_FOUND');
        });

        it('should trigger formationCollapsed hook', () => {
            const { formation } = system.designFormation({});
            let called = false;
            system.registerHook('formationCollapsed', () => { called = true; });
            system.collapseFormation(formation.formationId);
            expect(called).toBe(true);
        });
    });

    describe('calculateFormationPower', () => {
        it('should calculate', () => {
            const { formation } = system.designFormation({});
            expect(system.calculateFormationPower(formation.formationId)).toBe(100);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateFormationPower('ghost')).toBe(0);
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
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('formationDesigned', () => count++);
            unregister();
            system.designFormation({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('formationDesigned', () => { throw new Error('x'); });
            expect(() => system.designFormation({})).not.toThrow();
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
            system.designFormation({});
            const json = system.toJSON();
            expect(json.formations.length).toBe(1);
        });
        it('should deserialize', () => {
            system.designFormation({});
            const json = system.toJSON();
            const newSys = new SectFormation();
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
