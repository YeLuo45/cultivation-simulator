/**
 * PillBrewing.test.js - 丹药酿造系统测试
 * V503 Iteration 5/20 Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PillBrewing } from '../../../systems/ai/PillBrewing.js';

describe('PillBrewing', () => {
    let system;
    beforeEach(() => { system = new PillBrewing(); });

    describe('brewPill', () => {
        it('should brew', () => {
            const { pill } = system.brewPill({ alchemistId: 'a1', name: 'qi_pill' });
            expect(pill.name).toBe('qi_pill');
        });

        it('should default type to healing', () => {
            const { pill } = system.brewPill({ alchemistId: 'a1' });
            expect(pill.type).toBe('healing');
        });

        it('should set status to brewed', () => {
            const { pill } = system.brewPill({ alchemistId: 'a1' });
            expect(pill.status).toBe('brewed');
        });

        it('should trigger pillBrewed hook', () => {
            let called = false;
            system.registerHook('pillBrewed', () => { called = true; });
            system.brewPill({});
            expect(called).toBe(true);
        });
    });

    describe('getPill', () => {
        it('should return', () => {
            const { pill } = system.brewPill({});
            expect(system.getPill(pill.pillId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPill('ghost')).toBeNull(); });
    });

    describe('listPills', () => {
        it('should list all', () => {
            system.brewPill({});
            expect(system.listPills().length).toBe(1);
        });
        it('should return empty when none', () => {
            expect(system.listPills().length).toBe(0);
        });
    });

    describe('listByAlchemist', () => {
        it('should filter', () => {
            system.brewPill({ alchemistId: 'a1' });
            system.brewPill({ alchemistId: 'a2' });
            expect(system.listByAlchemist('a1').length).toBe(1);
        });
    });

    describe('listMastered', () => {
        it('should filter mastered', () => {
            const { pill: p1 } = system.brewPill({ alchemistId: 'a1' });
            system.brewPill({ alchemistId: 'a1' });
            system.masterPill(p1.pillId);
            expect(system.listMastered().length).toBe(1);
        });

        it('should return empty when none mastered', () => {
            system.brewPill({});
            expect(system.listMastered().length).toBe(0);
        });
    });

    describe('addIngredient', () => {
        it('should add ingredient', () => {
            const { pill } = system.brewPill({});
            system.addIngredient(pill.pillId, 'ginseng');
            expect(pill.ingredients).toContain('ginseng');
        });

        it('should reject missing', () => {
            const result = system.addIngredient('ghost', 'ginseng');
            expect(result.error).toBe('PILL_NOT_FOUND');
        });

        it('should trigger ingredientAdded hook', () => {
            const { pill } = system.brewPill({});
            let called = false;
            system.registerHook('ingredientAdded', () => { called = true; });
            system.addIngredient(pill.pillId, 'ginseng');
            expect(called).toBe(true);
        });
    });

    describe('agePill', () => {
        it('should age', () => {
            const { pill } = system.brewPill({});
            system.agePill(pill.pillId, 10);
            expect(pill.potency).toBe(30);
        });

        it('should set status to aged', () => {
            const { pill } = system.brewPill({});
            system.agePill(pill.pillId);
            expect(pill.status).toBe('aged');
        });

        it('should use default amount', () => {
            const { pill } = system.brewPill({});
            system.agePill(pill.pillId);
            expect(pill.potency).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.agePill('ghost', 10);
            expect(result.error).toBe('PILL_NOT_FOUND');
        });

        it('should trigger pillAged hook', () => {
            const { pill } = system.brewPill({});
            let called = false;
            system.registerHook('pillAged', () => { called = true; });
            system.agePill(pill.pillId);
            expect(called).toBe(true);
        });
    });

    describe('masterPill', () => {
        it('should master', () => {
            const { pill } = system.brewPill({});
            system.masterPill(pill.pillId);
            expect(pill.status).toBe('mastered');
        });

        it('should reject missing', () => {
            const result = system.masterPill('ghost');
            expect(result.error).toBe('PILL_NOT_FOUND');
        });

        it('should trigger pillMastered hook', () => {
            const { pill } = system.brewPill({});
            let called = false;
            system.registerHook('pillMastered', () => { called = true; });
            system.masterPill(pill.pillId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePillValue', () => {
        it('should calculate', () => {
            const { pill } = system.brewPill({});
            system.addIngredient(pill.pillId, 'ginseng');
            system.addIngredient(pill.pillId, 'lotus');
            // potency=20, ingredients=2 -> 20*10 + 2*5 = 210
            expect(system.calculatePillValue(pill.pillId)).toBe(210);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePillValue('ghost')).toBe(0);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.brewPill({ type: 'healing' });
            system.brewPill({ type: 'poison' });
            expect(system.listByType('healing').length).toBe(1);
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

        it('should execute default getPill', () => {
            const result = system.executeTool('getPill', { pillId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('pillBrewed', () => count++);
            unregister();
            system.brewPill({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('pillBrewed', () => { throw new Error('x'); });
            expect(() => system.brewPill({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPills = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPills = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.brewPill({});
            const json = system.toJSON();
            expect(json.pills.length).toBe(1);
        });
        it('should deserialize', () => {
            system.brewPill({});
            const json = system.toJSON();
            const newSys = new PillBrewing();
            newSys.fromJSON(json);
            expect(newSys.pills.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.pillCount).toBe(0);
        });
    });
});
