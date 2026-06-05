/**
 * PillRecipeRegistry.test.js - 丹药配方注册系统测试
 * V323 Iteration 2/9 Round 5 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PillRecipeRegistry } from '../../../systems/ai/PillRecipeRegistry.js';

describe('PillRecipeRegistry', () => {
    let system;
    beforeEach(() => { system = new PillRecipeRegistry(); });

    describe('registerRecipe', () => {
        it('should register', () => {
            const { recipe } = system.registerRecipe({ name: 'Test' });
            expect(recipe.name).toBe('Test');
        });

        it('should default grade to 1', () => {
            const { recipe } = system.registerRecipe({});
            expect(recipe.grade).toBe(1);
        });

        it('should start at version 1', () => {
            const { recipe } = system.registerRecipe({});
            expect(recipe.version).toBe(1);
        });

        it('should track version history', () => {
            const { recipe } = system.registerRecipe({});
            expect(system.getRecipeHistory(recipe.recipeId).length).toBe(1);
        });

        it('should trigger recipeRegistered hook', () => {
            let called = false;
            system.registerHook('recipeRegistered', () => { called = true; });
            system.registerRecipe({});
            expect(called).toBe(true);
        });

        it('should increment totalRecipes', () => {
            system.registerRecipe({});
            expect(system.stats.totalRecipes).toBe(1);
        });
    });

    describe('getRecipe', () => {
        it('should return', () => {
            const { recipe } = system.registerRecipe({});
            expect(system.getRecipe(recipe.recipeId)).not.toBeNull();
        });

        it('should return null for missing', () => { expect(system.getRecipe('ghost')).toBeNull(); });
    });

    describe('listRecipes', () => {
        it('should list all', () => {
            system.registerRecipe({});
            expect(system.listRecipes().length).toBe(1);
        });
    });

    describe('updateRecipe', () => {
        it('should update', () => {
            const { recipe } = system.registerRecipe({ name: 'Old' });
            const result = system.updateRecipe(recipe.recipeId, { name: 'New' });
            expect(recipe.name).toBe('New');
        });

        it('should increment version', () => {
            const { recipe } = system.registerRecipe({});
            system.updateRecipe(recipe.recipeId, { name: 'X' });
            expect(recipe.version).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.updateRecipe('ghost', {});
            expect(result.error).toBe('RECIPE_NOT_FOUND');
        });

        it('should track version history', () => {
            const { recipe } = system.registerRecipe({});
            system.updateRecipe(recipe.recipeId, { name: 'X' });
            expect(system.getRecipeHistory(recipe.recipeId).length).toBe(2);
        });

        it('should trigger recipeUpdated hook', () => {
            const { recipe } = system.registerRecipe({});
            let called = false;
            system.registerHook('recipeUpdated', () => { called = true; });
            system.updateRecipe(recipe.recipeId, { name: 'X' });
            expect(called).toBe(true);
        });
    });

    describe('deleteRecipe', () => {
        it('should delete', () => {
            const { recipe } = system.registerRecipe({});
            const result = system.deleteRecipe(recipe.recipeId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteRecipe('ghost');
            expect(result.error).toBe('RECIPE_NOT_FOUND');
        });

        it('should clean version history', () => {
            const { recipe } = system.registerRecipe({});
            system.deleteRecipe(recipe.recipeId);
            expect(system.recipeVersions.has(recipe.recipeId)).toBe(false);
        });

        it('should trigger recipeDeleted hook', () => {
            const { recipe } = system.registerRecipe({});
            let called = false;
            system.registerHook('recipeDeleted', () => { called = true; });
            system.deleteRecipe(recipe.recipeId);
            expect(called).toBe(true);
        });
    });

    describe('getRecipeHistory', () => {
        it('should return empty for missing', () => {
            expect(system.getRecipeHistory('ghost').length).toBe(0);
        });
    });

    describe('searchRecipes', () => {
        it('should filter by grade', () => {
            system.registerRecipe({ grade: 1 });
            system.registerRecipe({ grade: 2 });
            expect(system.searchRecipes({ grade: 1 }).length).toBe(1);
        });

        it('should filter by tag', () => {
            system.registerRecipe({ tags: ['common'] });
            system.registerRecipe({ tags: ['rare'] });
            expect(system.searchRecipes({ tag: 'common' }).length).toBe(1);
        });

        it('should filter by min quality', () => {
            system.registerRecipe({ quality: 50 });
            system.registerRecipe({ quality: 90 });
            expect(system.searchRecipes({ minQuality: 80 }).length).toBe(1);
        });

        it('should filter by ingredient', () => {
            system.registerRecipe({ ingredients: { herb: 5 } });
            system.registerRecipe({ ingredients: { iron: 3 } });
            expect(system.searchRecipes({ ingredient: 'herb' }).length).toBe(1);
        });

        it('should filter by author', () => {
            system.registerRecipe({ author: 'alice' });
            system.registerRecipe({ author: 'bob' });
            expect(system.searchRecipes({ author: 'alice' }).length).toBe(1);
        });

        it('should filter by keyword', () => {
            system.registerRecipe({ name: 'Healing Pill' });
            system.registerRecipe({ name: 'Attack Pill' });
            expect(system.searchRecipes({ keyword: 'heal' }).length).toBe(1);
        });
    });

    describe('Collections', () => {
        it('should create', () => {
            const { collection } = system.createCollection('Beginner');
            expect(collection.name).toBe('Beginner');
        });

        it('should trigger collectionCreated hook', () => {
            let called = false;
            system.registerHook('collectionCreated', () => { called = true; });
            system.createCollection('X');
            expect(called).toBe(true);
        });

        it('should add to collection', () => {
            const { recipe } = system.registerRecipe({});
            const { collection } = system.createCollection('X');
            const result = system.addToCollection(collection.collectionId, recipe.recipeId);
            expect(result.success).toBe(true);
        });

        it('should reject missing collection', () => {
            const { recipe } = system.registerRecipe({});
            const result = system.addToCollection('ghost', recipe.recipeId);
            expect(result.error).toBe('COLLECTION_NOT_FOUND');
        });

        it('should reject missing recipe', () => {
            const { collection } = system.createCollection('X');
            const result = system.addToCollection(collection.collectionId, 'ghost');
            expect(result.error).toBe('RECIPE_NOT_FOUND');
        });

        it('should not duplicate', () => {
            const { recipe } = system.registerRecipe({});
            const { collection } = system.createCollection('X');
            system.addToCollection(collection.collectionId, recipe.recipeId);
            system.addToCollection(collection.collectionId, recipe.recipeId);
            expect(collection.recipeIds.length).toBe(1);
        });

        it('should remove from collection', () => {
            const { recipe } = system.registerRecipe({});
            const { collection } = system.createCollection('X');
            system.addToCollection(collection.collectionId, recipe.recipeId);
            const result = system.removeFromCollection(collection.collectionId, recipe.recipeId);
            expect(result.success).toBe(true);
        });

        it('should reject remove from missing', () => {
            const result = system.removeFromCollection('ghost', 'any');
            expect(result.error).toBe('COLLECTION_NOT_FOUND');
        });

        it('should list all', () => {
            system.createCollection('X');
            expect(system.listCollections().length).toBe(1);
        });

        it('should get collection', () => {
            const { collection } = system.createCollection('X');
            expect(system.getCollection(collection.collectionId)).not.toBeNull();
        });

        it('should return null for missing collection', () => { expect(system.getCollection('ghost')).toBeNull(); });
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

        it('should execute default searchRecipes', () => {
            const result = system.executeTool('searchRecipes', { filter: {} });
            expect(Array.isArray(result.result)).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('recipeRegistered', () => count++);
            unregister();
            system.registerRecipe({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('recipeRegistered', () => { throw new Error('x'); });
            expect(() => system.registerRecipe({})).not.toThrow();
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
            system.registerRecipe({});
            const json = system.toJSON();
            expect(json.recipes.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerRecipe({});
            const json = system.toJSON();
            const newSys = new PillRecipeRegistry();
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