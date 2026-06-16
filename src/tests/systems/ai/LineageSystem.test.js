/**
 * LineageSystem.test.js - 血脉传承测试
 * V435 Iteration 12/15 Round 15 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LineageSystem } from '../../../systems/ai/LineageSystem.js';

describe('LineageSystem', () => {
    let system;
    beforeEach(() => { system = new LineageSystem(); });

    describe('establishLineage', () => {
        it('should create with ancestor and name', () => {
            const { lineage } = system.establishLineage({ ancestorId: 'a1', name: 'Dragon Lineage' });
            expect(lineage.ancestorId).toBe('a1');
            expect(lineage.name).toBe('Dragon Lineage');
        });

        it('should default name to "Unnamed Lineage"', () => {
            const { lineage } = system.establishLineage({});
            expect(lineage.name).toBe('Unnamed Lineage');
        });

        it('should default generations to 1', () => {
            const { lineage } = system.establishLineage({});
            expect(lineage.generations).toBe(1);
        });

        it('should default strength to 10', () => {
            const { lineage } = system.establishLineage({});
            expect(lineage.strength).toBe(10);
        });

        it('should default purity to 50', () => {
            const { lineage } = system.establishLineage({});
            expect(lineage.purity).toBe(50);
        });

        it('should default status to "growing"', () => {
            const { lineage } = system.establishLineage({});
            expect(lineage.status).toBe('growing');
        });

        it('should use provided id', () => {
            const { lineage } = system.establishLineage({ id: 'my_lineage' });
            expect(lineage.lineageId).toBe('my_lineage');
        });

        it('should start with empty members array', () => {
            const { lineage } = system.establishLineage({});
            expect(lineage.members).toEqual([]);
        });

        it('should copy provided members', () => {
            const { lineage } = system.establishLineage({ members: ['m1', 'm2'] });
            expect(lineage.members).toEqual(['m1', 'm2']);
        });

        it('should trigger lineageEstablished hook', () => {
            let called = false;
            system.registerHook('lineageEstablished', () => { called = true; });
            system.establishLineage({});
            expect(called).toBe(true);
        });

        it('should respect config baseGenerations', () => {
            const custom = new LineageSystem({ baseGenerations: 5 });
            const { lineage } = custom.establishLineage({});
            expect(lineage.generations).toBe(5);
        });
    });

    describe('getLineage', () => {
        it('should return lineage', () => {
            const { lineage } = system.establishLineage({});
            expect(system.getLineage(lineage.lineageId)).not.toBeNull();
        });

        it('should return a copy with members array', () => {
            const { lineage } = system.establishLineage({});
            const got = system.getLineage(lineage.lineageId);
            expect(got.members).toEqual([]);
        });

        it('should return null for missing', () => {
            expect(system.getLineage('ghost')).toBeNull();
        });
    });

    describe('listLineages', () => {
        it('should list all', () => {
            system.establishLineage({});
            expect(system.listLineages().length).toBe(1);
        });

        it('should return empty when no lineages', () => {
            expect(system.listLineages().length).toBe(0);
        });
    });

    describe('listByAncestor', () => {
        it('should filter by ancestor', () => {
            system.establishLineage({ ancestorId: 'a1' });
            system.establishLineage({ ancestorId: 'a2' });
            expect(system.listByAncestor('a1').length).toBe(1);
        });

        it('should return empty for unknown ancestor', () => {
            system.establishLineage({ ancestorId: 'a1' });
            expect(system.listByAncestor('ghost').length).toBe(0);
        });
    });

    describe('listByGeneration', () => {
        it('should filter by min generations', () => {
            system.establishLineage({ generations: 1 });
            system.establishLineage({ generations: 5 });
            system.establishLineage({ generations: 10 });
            expect(system.listByGeneration(5).length).toBe(2);
        });

        it('should include all when min=1', () => {
            system.establishLineage({ generations: 1 });
            system.establishLineage({ generations: 3 });
            expect(system.listByGeneration(1).length).toBe(2);
        });

        it('should return empty when none match', () => {
            system.establishLineage({ generations: 1 });
            expect(system.listByGeneration(100).length).toBe(0);
        });
    });

    describe('listByStatus', () => {
        it('should filter by status', () => {
            system.establishLineage({});
            system.establishLineage({ status: 'thriving' });
            expect(system.listByStatus('thriving').length).toBe(1);
        });
    });

    describe('addMember', () => {
        it('should add member to lineage', () => {
            const { lineage } = system.establishLineage({});
            system.addMember(lineage.lineageId, 'm1');
            expect(lineage.members).toContain('m1');
        });

        it('should add multiple members', () => {
            const { lineage } = system.establishLineage({});
            system.addMember(lineage.lineageId, 'm1');
            system.addMember(lineage.lineageId, 'm2');
            expect(lineage.members.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addMember('ghost', 'm1');
            expect(result.error).toBe('LINEAGE_NOT_FOUND');
        });

        it('should trigger memberAdded hook', () => {
            const { lineage } = system.establishLineage({});
            let called = false;
            system.registerHook('memberAdded', () => { called = true; });
            system.addMember(lineage.lineageId, 'm1');
            expect(called).toBe(true);
        });
    });

    describe('increaseStrength', () => {
        it('should increase strength', () => {
            const { lineage } = system.establishLineage({});
            system.increaseStrength(lineage.lineageId, 10);
            expect(lineage.strength).toBe(20);
        });

        it('should use default amount of 5', () => {
            const { lineage } = system.establishLineage({});
            system.increaseStrength(lineage.lineageId);
            expect(lineage.strength).toBe(15);
        });

        it('should reject missing', () => {
            const result = system.increaseStrength('ghost', 10);
            expect(result.error).toBe('LINEAGE_NOT_FOUND');
        });

        it('should trigger strengthIncreased hook', () => {
            const { lineage } = system.establishLineage({});
            let called = false;
            system.registerHook('strengthIncreased', () => { called = true; });
            system.increaseStrength(lineage.lineageId, 10);
            expect(called).toBe(true);
        });
    });

    describe('passBloodline', () => {
        it('should pass bloodline and increase purity', () => {
            const { lineage } = system.establishLineage({});
            system.passBloodline(lineage.lineageId, 10);
            expect(lineage.purity).toBe(60);
        });

        it('should use default amount of 5', () => {
            const { lineage } = system.establishLineage({});
            system.passBloodline(lineage.lineageId);
            expect(lineage.purity).toBe(55);
        });

        it('should reject missing', () => {
            const result = system.passBloodline('ghost', 10);
            expect(result.error).toBe('LINEAGE_NOT_FOUND');
        });

        it('should trigger bloodlinePassed hook', () => {
            const { lineage } = system.establishLineage({});
            let called = false;
            system.registerHook('bloodlinePassed', () => { called = true; });
            system.passBloodline(lineage.lineageId, 10);
            expect(called).toBe(true);
        });
    });

    describe('declineLineage', () => {
        it('should set status to declining', () => {
            const { lineage } = system.establishLineage({ status: 'thriving' });
            system.declineLineage(lineage.lineageId);
            expect(lineage.status).toBe('declining');
        });

        it('should reject missing', () => {
            const result = system.declineLineage('ghost');
            expect(result.error).toBe('LINEAGE_NOT_FOUND');
        });
    });

    describe('calculateLineagePower', () => {
        it('should calculate with default values', () => {
            // generations=1, members=0, strength=10, purity=50 => 100+0+10+50=160
            const { lineage } = system.establishLineage({});
            expect(system.calculateLineagePower(lineage.lineageId)).toBe(160);
        });

        it('should include member count', () => {
            const { lineage } = system.establishLineage({});
            system.addMember(lineage.lineageId, 'm1');
            system.addMember(lineage.lineageId, 'm2');
            // generations=1, members=2, strength=10, purity=50 => 100+20+10+50=180
            expect(system.calculateLineagePower(lineage.lineageId)).toBe(180);
        });

        it('should include strength and purity', () => {
            const { lineage } = system.establishLineage({ strength: 50, purity: 100 });
            // generations=1, members=0, strength=50, purity=100 => 100+0+50+100=250
            expect(system.calculateLineagePower(lineage.lineageId)).toBe(250);
        });

        it('should reflect generation count', () => {
            const { lineage } = system.establishLineage({ generations: 3 });
            // generations=3, members=0, strength=10, purity=50 => 300+0+10+50=360
            expect(system.calculateLineagePower(lineage.lineageId)).toBe(360);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateLineagePower('ghost')).toBe(0);
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

        it('should execute default getLineage', () => {
            const result = system.executeTool('getLineage', { lineageId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('lineageEstablished', () => count++);
            unregister();
            system.establishLineage({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('lineageEstablished', () => { throw new Error('x'); });
            expect(() => system.establishLineage({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalLineages = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalLineages = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.establishLineage({});
            const json = system.toJSON();
            expect(json.lineages.length).toBe(1);
        });
        it('should deserialize', () => {
            system.establishLineage({});
            const json = system.toJSON();
            const newSys = new LineageSystem();
            newSys.fromJSON(json);
            expect(newSys.lineages.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.lineageCount).toBe(0);
        });
    });
});
