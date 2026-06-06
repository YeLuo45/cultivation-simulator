/**
 * PoisonRefining.test.js - 毒术测试
 * V456 Iteration 3/15 Round 17 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PoisonRefining } from '../../../systems/ai/PoisonRefining.js';

describe('PoisonRefining', () => {
    let system;
    beforeEach(() => { system = new PoisonRefining(); });

    describe('brewPoison', () => {
        it('should brew', () => {
            const { poison } = system.brewPoison({ refinerId: 'r1', name: 'Venom Mist', type: 'paralysis' });
            expect(poison.refinerId).toBe('r1');
            expect(poison.name).toBe('Venom Mist');
            expect(poison.type).toBe('paralysis');
        });

        it('should default to baseToxicity when not provided', () => {
            const { poison } = system.brewPoison({ refinerId: 'r1' });
            expect(poison.toxicity).toBe(20);
        });

        it('should default type to paralysis', () => {
            const { poison } = system.brewPoison({ refinerId: 'r1' });
            expect(poison.type).toBe('paralysis');
        });

        it('should default status to brewed', () => {
            const { poison } = system.brewPoison({ refinerId: 'r1' });
            expect(poison.status).toBe('brewed');
        });

        it('should initialize empty antidotes array', () => {
            const { poison } = system.brewPoison({ refinerId: 'r1' });
            expect(poison.antidotes).toEqual([]);
        });

        it('should preserve provided antidotes', () => {
            const { poison } = system.brewPoison({ refinerId: 'r1', antidotes: ['moly', 'garlic'] });
            expect(poison.antidotes).toEqual(['moly', 'garlic']);
        });

        it('should respect custom id', () => {
            const { poison } = system.brewPoison({ id: 'custom_id', refinerId: 'r1' });
            expect(poison.poisonId).toBe('custom_id');
        });

        it('should trigger poisonBrewed hook', () => {
            let called = false;
            system.registerHook('poisonBrewed', () => { called = true; });
            system.brewPoison({ refinerId: 'r1' });
            expect(called).toBe(true);
        });
    });

    describe('getPoison', () => {
        it('should return poison', () => {
            const { poison } = system.brewPoison({ refinerId: 'r1' });
            expect(system.getPoison(poison.poisonId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPoison('ghost')).toBeNull(); });
        it('should return a copy with cloned antidotes array', () => {
            const { poison } = system.brewPoison({ refinerId: 'r1' });
            const fetched = system.getPoison(poison.poisonId);
            fetched.antidotes.push('tampered');
            const fetched2 = system.getPoison(poison.poisonId);
            expect(fetched2.antidotes).not.toContain('tampered');
        });
    });

    describe('listPoisons', () => {
        it('should list all', () => {
            system.brewPoison({ refinerId: 'r1' });
            system.brewPoison({ refinerId: 'r2' });
            expect(system.listPoisons().length).toBe(2);
        });
        it('should return empty array when no poisons', () => {
            expect(system.listPoisons()).toEqual([]);
        });
    });

    describe('listByRefiner', () => {
        it('should filter', () => {
            system.brewPoison({ refinerId: 'r1' });
            system.brewPoison({ refinerId: 'r2' });
            system.brewPoison({ refinerId: 'r1' });
            expect(system.listByRefiner('r1').length).toBe(2);
        });
        it('should return empty for unknown refiner', () => {
            system.brewPoison({ refinerId: 'r1' });
            expect(system.listByRefiner('ghost')).toEqual([]);
        });
    });

    describe('listByType', () => {
        it('should filter by paralysis', () => {
            system.brewPoison({ refinerId: 'r1', type: 'paralysis' });
            system.brewPoison({ refinerId: 'r1', type: 'erosion' });
            system.brewPoison({ refinerId: 'r1', type: 'paralysis' });
            expect(system.listByType('paralysis').length).toBe(2);
        });
        it('should filter by erosion', () => {
            system.brewPoison({ refinerId: 'r1', type: 'erosion' });
            system.brewPoison({ refinerId: 'r1', type: 'madness' });
            expect(system.listByType('erosion').length).toBe(1);
        });
        it('should filter by madness', () => {
            system.brewPoison({ refinerId: 'r1', type: 'madness' });
            expect(system.listByType('madness').length).toBe(1);
        });
    });

    describe('addAntidote', () => {
        it('should add antidote', () => {
            const { poison } = system.brewPoison({ refinerId: 'r1' });
            system.addAntidote(poison.poisonId, 'moly');
            expect(poison.antidotes).toContain('moly');
        });

        it('should add multiple antidotes', () => {
            const { poison } = system.brewPoison({ refinerId: 'r1' });
            system.addAntidote(poison.poisonId, 'moly');
            system.addAntidote(poison.poisonId, 'garlic');
            expect(poison.antidotes.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addAntidote('ghost', 'moly');
            expect(result.error).toBe('POISON_NOT_FOUND');
        });

        it('should trigger antidoteAdded hook', () => {
            const { poison } = system.brewPoison({ refinerId: 'r1' });
            let called = false;
            system.registerHook('antidoteAdded', () => { called = true; });
            system.addAntidote(poison.poisonId, 'moly');
            expect(called).toBe(true);
        });
    });

    describe('intensifyPoison', () => {
        it('should intensify with default amount', () => {
            const { poison } = system.brewPoison({ refinerId: 'r1' });
            system.intensifyPoison(poison.poisonId);
            expect(poison.toxicity).toBe(25);
        });

        it('should intensify with custom amount', () => {
            const { poison } = system.brewPoison({ refinerId: 'r1' });
            system.intensifyPoison(poison.poisonId, 10);
            expect(poison.toxicity).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.intensifyPoison('ghost', 5);
            expect(result.error).toBe('POISON_NOT_FOUND');
        });

        it('should trigger poisonIntensified hook', () => {
            const { poison } = system.brewPoison({ refinerId: 'r1' });
            let called = false;
            system.registerHook('poisonIntensified', () => { called = true; });
            system.intensifyPoison(poison.poisonId, 5);
            expect(called).toBe(true);
        });
    });

    describe('applyPoison', () => {
        it('should apply poison setting status to applied', () => {
            const { poison } = system.brewPoison({ refinerId: 'r1' });
            system.applyPoison(poison.poisonId);
            expect(poison.status).toBe('applied');
        });

        it('should reject missing', () => {
            const result = system.applyPoison('ghost');
            expect(result.error).toBe('POISON_NOT_FOUND');
        });

        it('should trigger poisonApplied hook', () => {
            const { poison } = system.brewPoison({ refinerId: 'r1' });
            let called = false;
            system.registerHook('poisonApplied', () => { called = true; });
            system.applyPoison(poison.poisonId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePoisonStrength', () => {
        it('should calculate strength with no antidotes', () => {
            const { poison } = system.brewPoison({ refinerId: 'r1', toxicity: 30 });
            // 30 * (1 + 0/3) = 30
            expect(system.calculatePoisonStrength(poison.poisonId)).toBe(30);
        });

        it('should calculate strength with antidotes boosting factor', () => {
            const { poison } = system.brewPoison({ refinerId: 'r1', toxicity: 30, antidotes: ['a', 'b', 'c'] });
            // 30 * (1 + 3/3) = 60
            expect(system.calculatePoisonStrength(poison.poisonId)).toBe(60);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePoisonStrength('ghost')).toBe(0);
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

        it('should execute default getPoison tool', () => {
            const result = system.executeTool('getPoison', { poisonId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default brewPoison tool', () => {
            const result = system.executeTool('brewPoison', { refinerId: 'r1', name: 'TestPoison' });
            expect(result.success).toBe(true);
            expect(result.result.poison.name).toBe('TestPoison');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('poisonBrewed', () => count++);
            unregister();
            system.brewPoison({ refinerId: 'r1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('poisonBrewed', () => { throw new Error('x'); });
            expect(() => system.brewPoison({ refinerId: 'r1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPoisons = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPoisons = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.brewPoison({ refinerId: 'r1' });
            const json = system.toJSON();
            expect(json.poisons.length).toBe(1);
        });
        it('should deserialize', () => {
            system.brewPoison({ refinerId: 'r1' });
            const json = system.toJSON();
            const newSys = new PoisonRefining();
            newSys.fromJSON(json);
            expect(newSys.poisons.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.poisonCount).toBe(0);
        });
        it('should update poisonCount after brewing', () => {
            system.brewPoison({ refinerId: 'r1' });
            system.brewPoison({ refinerId: 'r2' });
            const stats = system.getStats();
            expect(stats.poisonCount).toBe(2);
        });
    });
});
