/**
 * ElementalAffinity.test.js - 灵根亲和系统测试
 * V359 Iteration 2/9 Round 9 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ElementalAffinity } from '../../../systems/ai/ElementalAffinity.js';

describe('ElementalAffinity', () => {
    let system;
    beforeEach(() => { system = new ElementalAffinity(); });

    describe('registerCultivator', () => {
        it('should register', () => {
            const { cultivator } = system.registerCultivator({ name: 'C1' });
            expect(cultivator.name).toBe('C1');
        });
    });

    describe('getCultivator', () => {
        it('should return', () => {
            const { cultivator } = system.registerCultivator({});
            expect(system.getCultivator(cultivator.cultivatorId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCultivator('ghost')).toBeNull(); });
    });

    describe('getAffinities', () => {
        it('should return', () => {
            const { cultivator } = system.registerCultivator({});
            expect(system.getAffinities(cultivator.cultivatorId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getAffinities('ghost')).toBeNull(); });
    });

    describe('growAffinity', () => {
        it('should grow', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.growAffinity(cultivator.cultivatorId, 'fire', 0.3);
            expect(result.value).toBe(0.3);
        });

        it('should reject missing', () => {
            const result = system.growAffinity('ghost', 'fire', 0.1);
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should reject invalid', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.growAffinity(cultivator.cultivatorId, 'ghost', 0.1);
            expect(result.error).toBe('INVALID_ELEMENT');
        });

        it('should cap at max', () => {
            const { cultivator } = system.registerCultivator({});
            system.growAffinity(cultivator.cultivatorId, 'fire', 99);
            expect(system.getAffinities(cultivator.cultivatorId).fire).toBe(1);
        });

        it('should trigger affinityGrew hook', () => {
            const { cultivator } = system.registerCultivator({});
            let called = false;
            system.registerHook('affinityGrew', () => { called = true; });
            system.growAffinity(cultivator.cultivatorId, 'fire', 0.1);
            expect(called).toBe(true);
        });
    });

    describe('decayAffinity', () => {
        it('should decay', () => {
            const { cultivator } = system.registerCultivator({});
            system.growAffinity(cultivator.cultivatorId, 'fire', 0.5);
            const result = system.decayAffinity(cultivator.cultivatorId, 'fire', 0.2);
            expect(result.value).toBeCloseTo(0.3, 5);
        });

        it('should floor at 0', () => {
            const { cultivator } = system.registerCultivator({});
            system.decayAffinity(cultivator.cultivatorId, 'fire', 0.5);
            expect(system.getAffinities(cultivator.cultivatorId).fire).toBe(0);
        });

        it('should reject missing', () => {
            const result = system.decayAffinity('ghost', 'fire', 0.1);
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should trigger affinityDecayed hook', () => {
            const { cultivator } = system.registerCultivator({});
            let called = false;
            system.registerHook('affinityDecayed', () => { called = true; });
            system.decayAffinity(cultivator.cultivatorId, 'fire', 0.1);
            expect(called).toBe(true);
        });
    });

    describe('transferAffinity', () => {
        it('should transfer', () => {
            const { cultivator: c1 } = system.registerCultivator({});
            const { cultivator: c2 } = system.registerCultivator({});
            system.growAffinity(c1.cultivatorId, 'fire', 0.8);
            const result = system.transferAffinity(c1.cultivatorId, c2.cultivatorId, 'fire');
            expect(result.transferred).toBeCloseTo(0.4, 5);
        });

        it('should reject missing', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.transferAffinity('ghost', cultivator.cultivatorId, 'fire');
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should reject invalid', () => {
            const { cultivator: c1 } = system.registerCultivator({});
            const { cultivator: c2 } = system.registerCultivator({});
            const result = system.transferAffinity(c1.cultivatorId, c2.cultivatorId, 'ghost');
            expect(result.error).toBe('INVALID_ELEMENT');
        });

        it('should trigger affinityTransferred hook', () => {
            const { cultivator: c1 } = system.registerCultivator({});
            const { cultivator: c2 } = system.registerCultivator({});
            system.growAffinity(c1.cultivatorId, 'fire', 0.8);
            let called = false;
            system.registerHook('affinityTransferred', () => { called = true; });
            system.transferAffinity(c1.cultivatorId, c2.cultivatorId, 'fire');
            expect(called).toBe(true);
        });
    });

    describe('calculateTotalAffinity', () => {
        it('should calculate', () => {
            const { cultivator } = system.registerCultivator({});
            system.growAffinity(cultivator.cultivatorId, 'fire', 0.5);
            system.growAffinity(cultivator.cultivatorId, 'water', 0.3);
            expect(system.calculateTotalAffinity(cultivator.cultivatorId)).toBeCloseTo(0.8, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTotalAffinity('ghost')).toBe(0);
        });
    });

    describe('findDominant', () => {
        it('should find', () => {
            const { cultivator } = system.registerCultivator({});
            system.growAffinity(cultivator.cultivatorId, 'water', 0.8);
            expect(system.findDominant(cultivator.cultivatorId)).toBe('water');
        });

        it('should return null for missing', () => {
            expect(system.findDominant('ghost')).toBeNull();
        });
    });

    describe('listByElement', () => {
        it('should filter', () => {
            const { cultivator: c1 } = system.registerCultivator({});
            const { cultivator: c2 } = system.registerCultivator({});
            system.growAffinity(c1.cultivatorId, 'fire', 0.7);
            system.growAffinity(c2.cultivatorId, 'fire', 0.3);
            expect(system.listByElement('fire', 0.5).length).toBe(1);
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

        it('should execute default getCultivator', () => {
            const result = system.executeTool('getCultivator', { cultivatorId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('affinityGrew', () => count++);
            unregister();
            const { cultivator } = system.registerCultivator({});
            system.growAffinity(cultivator.cultivatorId, 'fire', 0.1);
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('affinityGrew', () => { throw new Error('x'); });
            const { cultivator } = system.registerCultivator({});
            expect(() => system.growAffinity(cultivator.cultivatorId, 'fire', 0.1)).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalGrowths = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalGrowths = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerCultivator({});
            const json = system.toJSON();
            expect(json.cultivators.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerCultivator({});
            const json = system.toJSON();
            const newSys = new ElementalAffinity();
            newSys.fromJSON(json);
            expect(newSys.cultivators.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.cultivatorCount).toBe(0);
        });
    });
});