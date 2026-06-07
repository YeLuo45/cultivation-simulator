/**
 * CultivationPill.test.js - 修真丹系统测试
 * V702 Iteration 25/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationPill } from '../../../systems/ai/CultivationPill.js';

describe('CultivationPill', () => {
    let system;
    beforeEach(() => { system = new CultivationPill(); });

    describe('recruitPill', () => {
        it('should recruit', () => {
            const { pill } = system.recruitPill({ masterId: 'm1', name: 'qi_pill' });
            expect(pill.name).toBe('qi_pill');
        });

        it('should default type to qi', () => {
            const { pill } = system.recruitPill({ masterId: 'm1' });
            expect(pill.type).toBe('qi');
        });

        it('should set status to novice', () => {
            const { pill } = system.recruitPill({ masterId: 'm1' });
            expect(pill.status).toBe('novice');
        });

        it('should set initial level to 1', () => {
            const { pill } = system.recruitPill({ masterId: 'm1' });
            expect(pill.level).toBe(1);
        });

        it('should use basePotency by default', () => {
            const { pill } = system.recruitPill({ masterId: 'm1' });
            expect(pill.potency).toBe(20);
        });

        it('should trigger pillRecruited hook', () => {
            let called = false;
            system.registerHook('pillRecruited', () => { called = true; });
            system.recruitPill({});
            expect(called).toBe(true);
        });

        it('should increment totalPills stat', () => {
            system.recruitPill({});
            system.recruitPill({});
            expect(system.stats.totalPills).toBe(2);
        });

        it('should generate id when not provided', () => {
            const { pill } = system.recruitPill({});
            expect(pill.pillId).toBeDefined();
            expect(pill.pillId.length).toBeGreaterThan(0);
        });
    });

    describe('getPill', () => {
        it('should return pill', () => {
            const { pill } = system.recruitPill({ masterId: 'm1' });
            expect(system.getPill(pill.pillId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPill('ghost')).toBeNull(); });
    });

    describe('listPills', () => {
        it('should list all', () => {
            system.recruitPill({});
            expect(system.listPills().length).toBe(1);
        });
        it('should return empty when none', () => {
            expect(system.listPills().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitPill({ masterId: 'm1' });
            system.recruitPill({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitPill({ masterId: 'm1' });
            expect(system.listByMaster('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { pill: p1 } = system.recruitPill({ masterId: 'm1' });
            system.recruitPill({ masterId: 'm1' });
            system.legendPill(p1.pillId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitPill({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addRecipe', () => {
        it('should add recipe', () => {
            const { pill } = system.recruitPill({});
            system.addRecipe(pill.pillId, 'ginseng_recipe');
            expect(pill.recipes).toContain('ginseng_recipe');
        });

        it('should reject missing', () => {
            const result = system.addRecipe('ghost', 'recipe');
            expect(result.error).toBe('PILL_NOT_FOUND');
        });

        it('should trigger recipeAdded hook', () => {
            const { pill } = system.recruitPill({});
            let called = false;
            system.registerHook('recipeAdded', () => { called = true; });
            system.addRecipe(pill.pillId, 'ginseng_recipe');
            expect(called).toBe(true);
        });
    });

    describe('raisePotency', () => {
        it('should raise potency by given amount', () => {
            const { pill } = system.recruitPill({});
            system.raisePotency(pill.pillId, 10);
            expect(pill.potency).toBe(30);
        });

        it('should use default amount of 5', () => {
            const { pill } = system.recruitPill({});
            system.raisePotency(pill.pillId);
            expect(pill.potency).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raisePotency('ghost', 10);
            expect(result.error).toBe('PILL_NOT_FOUND');
        });

        it('should trigger potencyRaised hook', () => {
            const { pill } = system.recruitPill({});
            let called = false;
            system.registerHook('potencyRaised', () => { called = true; });
            system.raisePotency(pill.pillId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpPill', () => {
        it('should level up', () => {
            const { pill } = system.recruitPill({});
            system.levelUpPill(pill.pillId);
            expect(pill.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpPill('ghost');
            expect(result.error).toBe('PILL_NOT_FOUND');
        });

        it('should trigger pillLeveledUp hook', () => {
            const { pill } = system.recruitPill({});
            let called = false;
            system.registerHook('pillLeveledUp', () => { called = true; });
            system.levelUpPill(pill.pillId);
            expect(called).toBe(true);
        });
    });

    describe('legendPill', () => {
        it('should legendize', () => {
            const { pill } = system.recruitPill({});
            system.legendPill(pill.pillId);
            expect(pill.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendPill('ghost');
            expect(result.error).toBe('PILL_NOT_FOUND');
        });

        it('should trigger pillLegendized hook', () => {
            const { pill } = system.recruitPill({});
            let called = false;
            system.registerHook('pillLegendized', () => { called = true; });
            system.legendPill(pill.pillId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePillValue', () => {
        it('should calculate', () => {
            const { pill } = system.recruitPill({});
            system.addRecipe(pill.pillId, 'ginseng_recipe');
            system.addRecipe(pill.pillId, 'lotus_recipe');
            // level=1, potency=20, recipes=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculatePillValue(pill.pillId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePillValue('ghost')).toBe(0);
        });

        it('should reflect level changes', () => {
            const { pill } = system.recruitPill({});
            system.levelUpPill(pill.pillId);
            system.levelUpPill(pill.pillId);
            // level=3, potency=20, recipes=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculatePillValue(pill.pillId)).toBe(340);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitPill({ type: 'healing' });
            system.recruitPill({ type: 'qi' });
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
            const unregister = system.registerHook('pillRecruited', () => count++);
            unregister();
            system.recruitPill({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('pillRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitPill({})).not.toThrow();
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
            system.recruitPill({});
            const json = system.toJSON();
            expect(json.pills.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitPill({});
            const json = system.toJSON();
            const newSys = new CultivationPill();
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
