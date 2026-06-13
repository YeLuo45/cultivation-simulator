/**
 * CultivationGladiator.test.js - 修真角斗测试
 * V658 Iteration 11/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationGladiator } from '../../../systems/ai/CultivationGladiator.js';

describe('CultivationGladiator', () => {
    let system;
    beforeEach(() => { system = new CultivationGladiator(); });

    describe('recruitGladiator', () => {
        it('should recruit with default values', () => {
            const { gladiator } = system.recruitGladiator({});
            expect(gladiator.gladiatorId).toBeDefined();
            expect(gladiator.name).toBe('Anonymous Gladiator');
            expect(gladiator.type).toBe('murmillo');
            expect(gladiator.ferocity).toBe(20);
            expect(gladiator.level).toBe(1);
            expect(gladiator.status).toBe('novice');
            expect(gladiator.weapons).toEqual([]);
        });

        it('should recruit with custom values', () => {
            const { gladiator } = system.recruitGladiator({
                gladiatorId: 'g1',
                trainerId: 't1',
                name: 'Spartacus',
                type: 'retiarius',
                ferocity: 50,
                weapons: ['Trident', 'Net']
            });
            expect(gladiator.gladiatorId).toBe('g1');
            expect(gladiator.trainerId).toBe('t1');
            expect(gladiator.name).toBe('Spartacus');
            expect(gladiator.type).toBe('retiarius');
            expect(gladiator.ferocity).toBe(50);
            expect(gladiator.weapons).toEqual(['Trident', 'Net']);
        });

        it('should default invalid type to murmillo', () => {
            const { gladiator } = system.recruitGladiator({ type: 'unknown' });
            expect(gladiator.type).toBe('murmillo');
        });

        it('should increment totalGladiators stat', () => {
            system.recruitGladiator({});
            system.recruitGladiator({});
            expect(system.stats.totalGladiators).toBe(2);
        });

        it('should trigger gladiatorRecruited hook', () => {
            let called = false;
            system.registerHook('gladiatorRecruited', () => { called = true; });
            system.recruitGladiator({});
            expect(called).toBe(true);
        });

        it('should reject when at maxGladiators', () => {
            const small = new CultivationGladiator({ maxGladiators: 2 });
            small.recruitGladiator({});
            small.recruitGladiator({});
            const result = small.recruitGladiator({});
            expect(result.success).toBe(false);
            expect(result.error).toBe('MAX_GLADIATORS_REACHED');
        });
    });

    describe('getGladiator', () => {
        it('should return the gladiator', () => {
            const { gladiator } = system.recruitGladiator({ gladiatorId: 'g1' });
            const found = system.getGladiator('g1');
            expect(found.gladiatorId).toBe('g1');
        });
        it('should return a copy not the reference', () => {
            const { gladiator } = system.recruitGladiator({ gladiatorId: 'g1' });
            const found = system.getGladiator('g1');
            expect(found).not.toBe(gladiator);
        });
        it('should return null for missing', () => { expect(system.getGladiator('ghost')).toBeNull(); });
    });

    describe('listGladiators', () => {
        it('should list all', () => {
            system.recruitGladiator({});
            system.recruitGladiator({});
            system.recruitGladiator({});
            expect(system.listGladiators().length).toBe(3);
        });
        it('should return empty list initially', () => {
            expect(system.listGladiators()).toEqual([]);
        });
    });

    describe('listByTrainer', () => {
        it('should filter by trainer', () => {
            system.recruitGladiator({ trainerId: 't1' });
            system.recruitGladiator({ trainerId: 't1' });
            system.recruitGladiator({ trainerId: 't2' });
            expect(system.listByTrainer('t1').length).toBe(2);
            expect(system.listByTrainer('t2').length).toBe(1);
            expect(system.listByTrainer('nonexistent').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter only legendary', () => {
            const { gladiator } = system.recruitGladiator({});
            system.legendGladiator(gladiator.gladiatorId);
            system.recruitGladiator({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addWeapon', () => {
        it('should add weapon to list', () => {
            const { gladiator } = system.recruitGladiator({ gladiatorId: 'g1' });
            const result = system.addWeapon('g1', 'Trident');
            expect(result.success).toBe(true);
            expect(system.getGladiator('g1').weapons).toContain('Trident');
        });

        it('should add multiple weapons', () => {
            const { gladiator } = system.recruitGladiator({ gladiatorId: 'g1' });
            system.addWeapon('g1', 'Trident');
            system.addWeapon('g1', 'Net');
            expect(system.getGladiator('g1').weapons.length).toBe(2);
        });

        it('should reject missing gladiator', () => {
            const result = system.addWeapon('ghost', 'Spear');
            expect(result.success).toBe(false);
            expect(result.error).toBe('GLADIATOR_NOT_FOUND');
        });

        it('should trigger weaponAdded hook', () => {
            const { gladiator } = system.recruitGladiator({ gladiatorId: 'g1' });
            let called = false;
            system.registerHook('weaponAdded', () => { called = true; });
            system.addWeapon('g1', 'Axe');
            expect(called).toBe(true);
        });
    });

    describe('increaseFerocity', () => {
        it('should increase ferocity with given amount', () => {
            const { gladiator } = system.recruitGladiator({ gladiatorId: 'g1' });
            system.increaseFerocity('g1', 10);
            expect(system.getGladiator('g1').ferocity).toBe(30);
        });

        it('should increase ferocity with default amount 5', () => {
            const { gladiator } = system.recruitGladiator({ gladiatorId: 'g1' });
            system.increaseFerocity('g1');
            expect(system.getGladiator('g1').ferocity).toBe(25);
        });

        it('should reject missing gladiator', () => {
            const result = system.increaseFerocity('ghost', 10);
            expect(result.error).toBe('GLADIATOR_NOT_FOUND');
        });

        it('should trigger ferocityIncreased hook', () => {
            const { gladiator } = system.recruitGladiator({ gladiatorId: 'g1' });
            let payload = null;
            system.registerHook('ferocityIncreased', (d) => { payload = d; });
            system.increaseFerocity('g1', 7);
            expect(payload.newFerocity).toBe(27);
        });
    });

    describe('levelUpGladiator', () => {
        it('should increment level', () => {
            const { gladiator } = system.recruitGladiator({ gladiatorId: 'g1' });
            system.levelUpGladiator('g1');
            expect(system.getGladiator('g1').level).toBe(2);
        });

        it('should promote to veteran at level 5', () => {
            const { gladiator } = system.recruitGladiator({ gladiatorId: 'g1' });
            for (let i = 0; i < 4; i++) system.levelUpGladiator('g1');
            expect(system.getGladiator('g1').level).toBe(5);
            expect(system.getGladiator('g1').status).toBe('veteran');
        });

        it('should reject missing gladiator', () => {
            const result = system.levelUpGladiator('ghost');
            expect(result.error).toBe('GLADIATOR_NOT_FOUND');
        });

        it('should trigger gladiatorLeveledUp hook', () => {
            const { gladiator } = system.recruitGladiator({ gladiatorId: 'g1' });
            let called = false;
            system.registerHook('gladiatorLeveledUp', () => { called = true; });
            system.levelUpGladiator('g1');
            expect(called).toBe(true);
        });
    });

    describe('legendGladiator', () => {
        it('should set status to legendary', () => {
            const { gladiator } = system.recruitGladiator({ gladiatorId: 'g1' });
            system.legendGladiator('g1');
            expect(system.getGladiator('g1').status).toBe('legendary');
        });

        it('should reject missing gladiator', () => {
            const result = system.legendGladiator('ghost');
            expect(result.error).toBe('GLADIATOR_NOT_FOUND');
        });

        it('should trigger gladiatorLegendized hook', () => {
            const { gladiator } = system.recruitGladiator({ gladiatorId: 'g1' });
            let called = false;
            system.registerHook('gladiatorLegendized', () => { called = true; });
            system.legendGladiator('g1');
            expect(called).toBe(true);
        });
    });

    describe('calculateGladiatorValue', () => {
        it('should calculate using level*100 + ferocity*2 + weapons*30', () => {
            const { gladiator } = system.recruitGladiator({ gladiatorId: 'g1', ferocity: 25 });
            system.levelUpGladiator('g1');
            system.increaseFerocity('g1', 5); // ferocity 30
            system.addWeapon('g1', 'Axe');
            // level=2, ferocity=30, weapons=1 => 200 + 60 + 30 = 290
            expect(system.calculateGladiatorValue('g1')).toBe(290);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateGladiatorValue('ghost')).toBe(0);
        });
    });

    describe('listVeterans', () => {
        it('should filter only veterans', () => {
            const { gladiator } = system.recruitGladiator({ gladiatorId: 'g1' });
            for (let i = 0; i < 4; i++) system.levelUpGladiator('g1');
            system.recruitGladiator({ gladiatorId: 'g2' });
            expect(system.listVeterans().length).toBe(1);
        });
    });

    describe('Tool System', () => {
        it('should register and list tools', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute a tool', () => {
            system.registerTool('double', (ctx) => ctx.value * 2);
            const result = system.executeTool('double', { value: 21 });
            expect(result.success).toBe(true);
            expect(result.result).toBe(42);
        });

        it('should return TOOL_NOT_FOUND for missing', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should catch tool handler errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.success).toBe(false);
            expect(result.error).toBe('boom');
        });

        it('should execute default getGladiator tool', () => {
            const result = system.executeTool('getGladiator', { gladiatorId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitGladiator tool', () => {
            const result = system.executeTool('recruitGladiator', { name: 'ViaTool' });
            expect(result.success).toBe(true);
            expect(result.result.gladiator.name).toBe('ViaTool');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('gladiatorRecruited', () => count++);
            unregister();
            system.recruitGladiator({});
            expect(count).toBe(0);
        });

        it('should silently swallow handler errors', () => {
            system.registerHook('gladiatorRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitGladiator({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient totalGladiators', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve once threshold met', () => {
            system.stats.totalGladiators = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxGladiators).toBe(45);
        });
        it('should not double evolve', () => {
            system.stats.totalGladiators = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitGladiator({ gladiatorId: 'g1' });
            const json = system.toJSON();
            expect(json.gladiators.length).toBe(1);
            expect(json.config.maxGladiators).toBe(30);
        });
        it('should deserialize from JSON', () => {
            system.recruitGladiator({ gladiatorId: 'g1' });
            const json = system.toJSON();
            const newSys = new CultivationGladiator();
            newSys.fromJSON(json);
            expect(newSys.gladiators.size).toBe(1);
            expect(newSys.getGladiator('g1').gladiatorId).toBe('g1');
        });
        it('should preserve stats and config on deserialize', () => {
            const json = { gladiators: [], stats: { totalGladiators: 7, evolutionCount: 1 }, config: { maxGladiators: 99, baseFerocity: 50 } };
            system.fromJSON(json);
            expect(system.stats.totalGladiators).toBe(7);
            expect(system.config.maxGladiators).toBe(99);
            expect(system.config.baseFerocity).toBe(50);
        });
    });

    describe('getStats', () => {
        it('should return stats with gladiatorCount', () => {
            system.recruitGladiator({});
            system.recruitGladiator({});
            const stats = system.getStats();
            expect(stats.gladiatorCount).toBe(2);
            expect(stats.totalGladiators).toBe(2);
        });
    });
});
