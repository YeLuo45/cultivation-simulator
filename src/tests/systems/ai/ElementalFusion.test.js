/**
 * ElementalFusion.test.js - 元素融合测试
 * V362 Iteration 5/9 Round 9 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ElementalFusion } from '../../../systems/ai/ElementalFusion.js';

describe('ElementalFusion', () => {
    let system;
    beforeEach(() => { system = new ElementalFusion(); });

    describe('listRecipes', () => {
        it('should list default recipes', () => { expect(system.listRecipes().length).toBe(4); });
    });

    describe('getRecipe', () => {
        it('should return', () => { expect(system.getRecipe('fire_water')).not.toBeNull(); });
        it('should return null for missing', () => { expect(system.getRecipe('ghost')).toBeNull(); });
    });

    describe('findByElements', () => {
        it('should find', () => { expect(system.findByElements(['fire', 'water'])).not.toBeNull(); });
        it('should return null for unknown', () => { expect(system.findByElements(['fire', 'ghost'])).toBeUndefined(); });
    });

    describe('addRecipe', () => {
        it('should add', () => {
            const { recipe } = system.addRecipe({ name: 'Custom' });
            expect(recipe.name).toBe('Custom');
        });

        it('should trigger recipeAdded hook', () => {
            let called = false;
            system.registerHook('recipeAdded', () => { called = true; });
            system.addRecipe({});
            expect(called).toBe(true);
        });
    });

    describe('fuse', () => {
        it('should fuse', () => {
            const result = system.fuse('fire_water');
            expect(result.success).toBe(true);
        });

        it('should reject missing recipe', () => {
            const result = system.fuse('ghost');
            expect(result.error).toBe('RECIPE_NOT_FOUND');
        });

        it('should trigger fusionCreated hook', () => {
            let called = false;
            system.registerHook('fusionCreated', () => { called = true; });
            system.fuse('fire_water');
            expect(called).toBe(true);
        });
    });

    describe('getFusion', () => {
        it('should return', () => {
            const { fusion } = system.fuse('fire_water');
            expect(system.getFusion(fusion.fusionId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getFusion('ghost')).toBeNull(); });
    });

    describe('listFusions', () => {
        it('should list all', () => {
            system.fuse('fire_water');
            expect(system.listFusions().length).toBe(1);
        });
    });

    describe('listByRecipe', () => {
        it('should filter', () => {
            system.fuse('fire_water');
            system.fuse('fire_earth');
            expect(system.listByRecipe('fire_water').length).toBe(1);
        });
    });

    describe('calculateTotalPower', () => {
        it('should calculate', () => {
            system.fuse('fire_water');
            system.fuse('fire_earth');
            expect(system.calculateTotalPower()).toBe(70);
        });

        it('should return 0 for empty', () => {
            expect(system.calculateTotalPower()).toBe(0);
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

        it('should execute default getRecipe', () => {
            const result = system.executeTool('getRecipe', { recipeId: 'fire_water' });
            expect(result.result.name).toBe('Steam');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('fusionCreated', () => count++);
            unregister();
            system.fuse('fire_water');
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('fusionCreated', () => { throw new Error('x'); });
            expect(() => system.fuse('fire_water')).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalFusions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalFusions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.fuse('fire_water');
            const json = system.toJSON();
            expect(json.fusions.length).toBe(1);
        });
        it('should deserialize', () => {
            system.fuse('fire_water');
            const json = system.toJSON();
            const newSys = new ElementalFusion();
            newSys.fromJSON(json);
            expect(newSys.fusions.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.recipeCount).toBe(4);
        });
    });
});