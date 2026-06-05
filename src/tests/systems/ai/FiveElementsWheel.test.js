/**
 * FiveElementsWheel.test.js - 五行相生相克测试
 * V360 Iteration 3/9 Round 9 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FiveElementsWheel } from '../../../systems/ai/FiveElementsWheel.js';

describe('FiveElementsWheel', () => {
    let wheel;
    beforeEach(() => { wheel = new FiveElementsWheel(); });

    describe('listElements', () => {
        it('should list 5', () => { expect(wheel.listElements().length).toBe(5); });
    });

    describe('getRelation', () => {
        it('should return generates', () => { expect(wheel.getRelation('metal', 'water')).toBe('generates'); });
        it('should return overcomes', () => { expect(wheel.getRelation('metal', 'wood')).toBe('overcomes'); });
        it('should return generated_by', () => { expect(wheel.getRelation('water', 'metal')).toBe('generated_by'); });
        it('should return overcome_by', () => { expect(wheel.getRelation('wood', 'metal')).toBe('overcome_by'); });
        it('should return neutral only for invalid', () => { expect(wheel.getRelation('metal', 'fire')).toBe('overcome_by'); expect(wheel.getRelation('fire', 'metal')).toBe('overcomes'); });
        it('should return null for invalid', () => { expect(wheel.getRelation('ghost', 'fire')).toBeNull(); });
    });

    describe('getGenerates', () => {
        it('should return', () => { expect(wheel.getGenerates('metal')).toBe('water'); });
        it('should return null for invalid', () => { expect(wheel.getGenerates('ghost')).toBeNull(); });
    });

    describe('getOvercomes', () => {
        it('should return', () => { expect(wheel.getOvercomes('metal')).toBe('wood'); });
        it('should return null for invalid', () => { expect(wheel.getOvercomes('ghost')).toBeNull(); });
    });

    describe('getGeneratedBy', () => {
        it('should return', () => { expect(wheel.getGeneratedBy('water')).toBe('metal'); });
        it('should return null for invalid', () => { expect(wheel.getGeneratedBy('ghost')).toBeNull(); });
    });

    describe('getOvercomeBy', () => {
        it('should return', () => { expect(wheel.getOvercomeBy('wood')).toBe('metal'); });
        it('should return null for invalid', () => { expect(wheel.getOvercomeBy('ghost')).toBeNull(); });
    });

    describe('calculatePowerBonus', () => {
        it('should give 1.5 for overcomes', () => { expect(wheel.calculatePowerBonus('metal', 'wood')).toBe(1.5); });
        it('should give 0.5 for overcome_by', () => { expect(wheel.calculatePowerBonus('wood', 'metal')).toBe(0.5); });
        it('should give 1.2 for generates', () => { expect(wheel.calculatePowerBonus('metal', 'water')).toBe(1.2); });
        it('should give 0.8 for generated_by', () => { expect(wheel.calculatePowerBonus('water', 'metal')).toBe(0.8); });
        it('should give 1.0 for self', () => { expect(wheel.calculatePowerBonus('metal', 'metal')).toBe(1.0); });
    });

    describe('findStrongAgainst', () => {
        it('should return', () => { expect(wheel.findStrongAgainst('metal')).toBe('wood'); });
        it('should return null for invalid', () => { expect(wheel.findStrongAgainst('ghost')).toBeNull(); });
    });

    describe('findWeakTo', () => {
        it('should return', () => { expect(wheel.findWeakTo('metal')).toBe('water'); });
        it('should return null for invalid', () => { expect(wheel.findWeakTo('ghost')).toBeNull(); });
    });

    describe('analyzeBalance', () => {
        it('should detect balanced', () => {
            const result = wheel.analyzeBalance({ metal: 1, wood: 1, water: 1, fire: 1, earth: 1 });
            expect(result.balanced).toBe(true);
        });

        it('should detect dominant', () => {
            const result = wheel.analyzeBalance({ metal: 5, wood: 1, water: 0, fire: 0, earth: 0 });
            expect(result.dominant).toBe('metal');
        });

        it('should return unbalanced for empty', () => {
            const result = wheel.analyzeBalance({});
            expect(result.balanced).toBe(false);
        });
    });

    describe('Tool System', () => {
        it('should register tool', () => {
            wheel.registerTool('test', () => 'ok');
            expect(wheel.listTools()).toContain('test');
        });

        it('should execute tool', () => {
            wheel.registerTool('test', (ctx) => ctx.value);
            const result = wheel.executeTool('test', { value: 42 });
            expect(result.result).toBe(42);
        });

        it('should reject missing tool', () => {
            const result = wheel.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should handle errors', () => {
            wheel.registerTool('bad', () => { throw new Error('x'); });
            const result = wheel.executeTool('bad', {});
            expect(result.error).toBe('x');
        });

        it('should execute default listElements', () => {
            const result = wheel.executeTool('listElements', {});
            expect(result.result.length).toBe(5);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = wheel.registerHook('systemEvolved', () => count++);
            unregister();
            wheel.autoEvolve();
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            wheel.registerHook('systemEvolved', () => { throw new Error('x'); });
            expect(() => wheel.autoEvolve()).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = wheel.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            wheel.stats.totalChecks = 10;
            const result = wheel.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            wheel.stats.totalChecks = 10;
            wheel.autoEvolve();
            const result = wheel.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            const json = wheel.toJSON();
            expect(json.config).toBeDefined();
        });
        it('should deserialize', () => {
            const json = wheel.toJSON();
            const newWheel = new FiveElementsWheel();
            newWheel.fromJSON(json);
            expect(newWheel.elements.length).toBe(5);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = wheel.getStats();
            expect(stats.elementCount).toBe(5);
        });
    });
});