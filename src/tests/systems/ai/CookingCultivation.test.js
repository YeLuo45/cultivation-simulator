/**
 * CookingCultivation.test.js - 食修系统测试
 * V426 Iteration 3/15 Round 15 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CookingCultivation } from '../../../systems/ai/CookingCultivation.js';

describe('CookingCultivation', () => {
    let system;
    beforeEach(() => { system = new CookingCultivation(); });

    describe('prepareRecipe', () => {
        it('should prepare', () => {
            const { recipe } = system.prepareRecipe({ cultivatorId: 'c1', name: 'Phoenix Soup', cuisine: 'sichuan', flavor: 'spicy' });
            expect(recipe.cultivatorId).toBe('c1');
            expect(recipe.name).toBe('Phoenix Soup');
            expect(recipe.cuisine).toBe('sichuan');
            expect(recipe.flavor).toBe('spicy');
        });

        it('should set default cooking', () => {
            const { recipe } = system.prepareRecipe({ name: 'Test', cuisine: 'cantonese', flavor: 'sweet' });
            expect(recipe.cooking).toBe(10);
        });

        it('should set status raw', () => {
            const { recipe } = system.prepareRecipe({ name: 'Test', cuisine: 'cantonese', flavor: 'sweet' });
            expect(recipe.status).toBe('raw');
        });

        it('should increment totalRecipes', () => {
            system.prepareRecipe({ name: 'Test', cuisine: 'c', flavor: 'sweet' });
            expect(system.stats.totalRecipes).toBe(1);
        });

        it('should trigger recipePrepared hook', () => {
            let called = false;
            system.registerHook('recipePrepared', () => { called = true; });
            system.prepareRecipe({ name: 'Test', cuisine: 'c', flavor: 'sweet' });
            expect(called).toBe(true);
        });
    });

    describe('getRecipe', () => {
        it('should return', () => {
            const { recipe } = system.prepareRecipe({ name: 'Test', cuisine: 'c', flavor: 'sweet' });
            expect(system.getRecipe(recipe.recipeId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getRecipe('ghost')).toBeNull(); });
    });

    describe('listRecipes', () => {
        it('should list all', () => {
            system.prepareRecipe({ name: 'A', cuisine: 'c', flavor: 'sweet' });
            system.prepareRecipe({ name: 'B', cuisine: 'c', flavor: 'sour' });
            expect(system.listRecipes().length).toBe(2);
        });

        it('should return empty list when no recipes', () => {
            expect(system.listRecipes().length).toBe(0);
        });
    });

    describe('listByCuisine', () => {
        it('should filter by cuisine', () => {
            system.prepareRecipe({ name: 'A', cuisine: 'sichuan', flavor: 'spicy' });
            system.prepareRecipe({ name: 'B', cuisine: 'cantonese', flavor: 'sweet' });
            expect(system.listByCuisine('sichuan').length).toBe(1);
        });

        it('should return empty for no match', () => {
            system.prepareRecipe({ name: 'A', cuisine: 'sichuan', flavor: 'spicy' });
            expect(system.listByCuisine('unknown').length).toBe(0);
        });
    });

    describe('listByFlavor', () => {
        it('should filter by flavor', () => {
            system.prepareRecipe({ name: 'A', cuisine: 'c', flavor: 'sweet' });
            system.prepareRecipe({ name: 'B', cuisine: 'c', flavor: 'sour' });
            system.prepareRecipe({ name: 'C', cuisine: 'c', flavor: 'spicy' });
            expect(system.listByFlavor('spicy').length).toBe(1);
        });
    });

    describe('addIngredient', () => {
        it('should add ingredient', () => {
            const { recipe } = system.prepareRecipe({ name: 'T', cuisine: 'c', flavor: 'sweet' });
            system.addIngredient(recipe.recipeId, 'ginseng');
            expect(recipe.ingredients).toContain('ginseng');
        });

        it('should reject missing recipe', () => {
            const result = system.addIngredient('ghost', 'ginseng');
            expect(result.error).toBe('RECIPE_NOT_FOUND');
        });

        it('should trigger ingredientAdded hook', () => {
            const { recipe } = system.prepareRecipe({ name: 'T', cuisine: 'c', flavor: 'sweet' });
            let called = false;
            system.registerHook('ingredientAdded', () => { called = true; });
            system.addIngredient(recipe.recipeId, 'ginseng');
            expect(called).toBe(true);
        });

        it('should accumulate multiple ingredients', () => {
            const { recipe } = system.prepareRecipe({ name: 'T', cuisine: 'c', flavor: 'sweet' });
            system.addIngredient(recipe.recipeId, 'ginseng');
            system.addIngredient(recipe.recipeId, 'tumeric');
            system.addIngredient(recipe.recipeId, 'basil');
            expect(recipe.ingredients.length).toBe(3);
        });
    });

    describe('cookRecipe', () => {
        it('should cook', () => {
            const { recipe } = system.prepareRecipe({ name: 'T', cuisine: 'c', flavor: 'sweet' });
            system.cookRecipe(recipe.recipeId, 10);
            expect(recipe.cooking).toBe(20);
        });

        it('should use default amount', () => {
            const { recipe } = system.prepareRecipe({ name: 'T', cuisine: 'c', flavor: 'sweet' });
            system.cookRecipe(recipe.recipeId);
            expect(recipe.cooking).toBe(15);
        });

        it('should set status to cooked', () => {
            const { recipe } = system.prepareRecipe({ name: 'T', cuisine: 'c', flavor: 'sweet' });
            system.cookRecipe(recipe.recipeId, 5);
            expect(recipe.status).toBe('cooked');
        });

        it('should reject missing', () => {
            const result = system.cookRecipe('ghost', 10);
            expect(result.error).toBe('RECIPE_NOT_FOUND');
        });

        it('should trigger recipeCooked hook', () => {
            const { recipe } = system.prepareRecipe({ name: 'T', cuisine: 'c', flavor: 'sweet' });
            let called = false;
            system.registerHook('recipeCooked', () => { called = true; });
            system.cookRecipe(recipe.recipeId, 5);
            expect(called).toBe(true);
        });
    });

    describe('serveRecipe', () => {
        it('should serve', () => {
            const { recipe } = system.prepareRecipe({ name: 'T', cuisine: 'c', flavor: 'sweet' });
            system.serveRecipe(recipe.recipeId);
            expect(recipe.status).toBe('served');
        });

        it('should reject missing', () => {
            const result = system.serveRecipe('ghost');
            expect(result.error).toBe('RECIPE_NOT_FOUND');
        });

        it('should trigger recipeServed hook', () => {
            const { recipe } = system.prepareRecipe({ name: 'T', cuisine: 'c', flavor: 'sweet' });
            let called = false;
            system.registerHook('recipeServed', () => { called = true; });
            system.serveRecipe(recipe.recipeId);
            expect(called).toBe(true);
        });
    });

    describe('calculateNutritionalValue', () => {
        it('should calculate', () => {
            const { recipe } = system.prepareRecipe({ name: 'T', cuisine: 'c', flavor: 'spicy' });
            system.addIngredient(recipe.recipeId, 'ginseng');
            system.addIngredient(recipe.recipeId, 'basil');
            // 2 ingredients * 10 + 10 cooking * (5/2) = 20 + 25 = 45
            expect(system.calculateNutritionalValue(recipe.recipeId)).toBe(45);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateNutritionalValue('ghost')).toBe(0);
        });

        it('should compute based on flavor length', () => {
            const { recipe } = system.prepareRecipe({ name: 'T', cuisine: 'c', flavor: 'sour' });
            // 0 ingredients * 10 + 10 cooking * (4/2) = 0 + 20 = 20
            expect(system.calculateNutritionalValue(recipe.recipeId)).toBe(20);
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
            const result = system.executeTool('getRecipe', { recipeId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('recipePrepared', () => count++);
            unregister();
            system.prepareRecipe({ name: 'T', cuisine: 'c', flavor: 'sweet' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('recipePrepared', () => { throw new Error('x'); });
            expect(() => system.prepareRecipe({ name: 'T', cuisine: 'c', flavor: 'sweet' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalRecipes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalRecipes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.prepareRecipe({ name: 'T', cuisine: 'c', flavor: 'sweet' });
            const json = system.toJSON();
            expect(json.recipes.length).toBe(1);
        });
        it('should deserialize', () => {
            system.prepareRecipe({ name: 'T', cuisine: 'c', flavor: 'sweet' });
            const json = system.toJSON();
            const newSys = new CookingCultivation();
            newSys.fromJSON(json);
            expect(newSys.recipes.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.recipeCount).toBe(0);
        });
    });
});
