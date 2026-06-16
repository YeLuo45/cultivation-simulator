/**
 * CultivationFormation.test.js - 道阵测试
 * V535 Iteration 17/20 Round 21 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationFormation } from '../../../systems/ai/CultivationFormation.js';

describe('CultivationFormation', () => {
    let system;
    beforeEach(() => { system = new CultivationFormation(); });

    describe('layFormation', () => {
        it('should lay', () => {
            const { formation } = system.layFormation({ name: 'F1' });
            expect(formation.name).toBe('F1');
        });

        it('should use default values', () => {
            const { formation } = system.layFormation({});
            expect(formation.type).toBe('defensive');
            expect(formation.power).toBe(30);
            expect(formation.level).toBe(1);
            expect(formation.status).toBe('draft');
            expect(formation.nodes).toEqual([]);
        });

        it('should respect custom type and power', () => {
            const { formation } = system.layFormation({ type: 'offensive', power: 100 });
            expect(formation.type).toBe('offensive');
            expect(formation.power).toBe(100);
        });

        it('should trigger formationLaid hook', () => {
            let called = false;
            system.registerHook('formationLaid', () => { called = true; });
            system.layFormation({});
            expect(called).toBe(true);
        });
    });

    describe('getFormation', () => {
        it('should return', () => {
            const { formation } = system.layFormation({});
            expect(system.getFormation(formation.formationId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getFormation('ghost')).toBeNull(); });
    });

    describe('listFormations', () => {
        it('should list all', () => {
            system.layFormation({});
            expect(system.listFormations().length).toBe(1);
        });

        it('should return empty when none', () => {
            expect(system.listFormations().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.layFormation({ cultivatorId: 'c1' });
            system.layFormation({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listActive', () => {
        it('should filter active and perfect', () => {
            const { formation } = system.layFormation({});
            formation.status = 'draft';
            system.layFormation({});
            system.levelUpFormation(system.formations.entries().next().value[0]);
            expect(system.listActive().length).toBe(1);
        });
    });

    describe('addNode', () => {
        it('should add node', () => {
            const { formation } = system.layFormation({});
            system.addNode(formation.formationId, { id: 'n1', pos: { x: 0, y: 0 } });
            expect(formation.nodes.length).toBe(1);
            expect(formation.nodes[0].id).toBe('n1');
        });

        it('should reject missing', () => {
            const result = system.addNode('ghost', { id: 'n1' });
            expect(result.error).toBe('FORMATION_NOT_FOUND');
        });

        it('should trigger nodeAdded hook', () => {
            const { formation } = system.layFormation({});
            let called = false;
            system.registerHook('nodeAdded', () => { called = true; });
            system.addNode(formation.formationId, { id: 'n1' });
            expect(called).toBe(true);
        });
    });

    describe('increasePower', () => {
        it('should increase power with default amount', () => {
            const { formation } = system.layFormation({});
            system.increasePower(formation.formationId);
            expect(formation.power).toBe(35);
        });

        it('should increase power with custom amount', () => {
            const { formation } = system.layFormation({});
            system.increasePower(formation.formationId, 20);
            expect(formation.power).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.increasePower('ghost', 10);
            expect(result.error).toBe('FORMATION_NOT_FOUND');
        });

        it('should trigger powerIncreased hook', () => {
            const { formation } = system.layFormation({});
            let called = false;
            system.registerHook('powerIncreased', () => { called = true; });
            system.increasePower(formation.formationId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpFormation', () => {
        it('should level up', () => {
            const { formation } = system.layFormation({});
            system.levelUpFormation(formation.formationId);
            expect(formation.level).toBe(2);
        });

        it('should set status to active', () => {
            const { formation } = system.layFormation({});
            system.levelUpFormation(formation.formationId);
            expect(formation.status).toBe('active');
        });

        it('should reject missing', () => {
            const result = system.levelUpFormation('ghost');
            expect(result.error).toBe('FORMATION_NOT_FOUND');
        });

        it('should trigger formationLeveledUp hook', () => {
            const { formation } = system.layFormation({});
            let called = false;
            system.registerHook('formationLeveledUp', () => { called = true; });
            system.levelUpFormation(formation.formationId);
            expect(called).toBe(true);
        });
    });

    describe('perfectFormation', () => {
        it('should perfect', () => {
            const { formation } = system.layFormation({});
            system.perfectFormation(formation.formationId);
            expect(formation.status).toBe('perfect');
        });

        it('should reject missing', () => {
            const result = system.perfectFormation('ghost');
            expect(result.error).toBe('FORMATION_NOT_FOUND');
        });

        it('should trigger formationPerfected hook', () => {
            const { formation } = system.layFormation({});
            let called = false;
            system.registerHook('formationPerfected', () => { called = true; });
            system.perfectFormation(formation.formationId);
            expect(called).toBe(true);
        });
    });

    describe('calculateFormationPower', () => {
        it('should calculate', () => {
            const { formation } = system.layFormation({});
            // level=1, power=30, nodes=0: 1*100 + 30*2 + 0*30 = 100+60 = 160
            expect(system.calculateFormationPower(formation.formationId)).toBe(160);
        });

        it('should calculate with nodes and level', () => {
            const { formation } = system.layFormation({});
            system.addNode(formation.formationId, { id: 'n1' });
            system.addNode(formation.formationId, { id: 'n2' });
            system.levelUpFormation(formation.formationId);
            system.increasePower(formation.formationId, 10);
            // level=2, power=40, nodes=2: 2*100 + 40*2 + 2*30 = 200+80+60 = 340
            expect(system.calculateFormationPower(formation.formationId)).toBe(340);
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
            const unregister = system.registerHook('formationLaid', () => count++);
            unregister();
            system.layFormation({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('formationLaid', () => { throw new Error('x'); });
            expect(() => system.layFormation({})).not.toThrow();
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
            system.layFormation({});
            const json = system.toJSON();
            expect(json.formations.length).toBe(1);
        });
        it('should deserialize', () => {
            system.layFormation({});
            const json = system.toJSON();
            const newSys = new CultivationFormation();
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
