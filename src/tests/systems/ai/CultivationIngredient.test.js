/**
 * CultivationIngredient.test.js - 修真药材测试
 * V701 Iteration 24/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationIngredient } from '../../../systems/ai/CultivationIngredient.js';

describe('CultivationIngredient', () => {
    let system;
    beforeEach(() => { system = new CultivationIngredient(); });

    describe('recruitIngredient', () => {
        it('should recruit with masterId', () => {
            const { ingredient } = system.recruitIngredient({ masterId: 'm1' });
            expect(ingredient.masterId).toBe('m1');
        });

        it('should assign id automatically', () => {
            const { ingredient } = system.recruitIngredient({});
            expect(ingredient.ingredientId).toBeTruthy();
        });

        it('should accept custom id', () => {
            const { ingredient } = system.recruitIngredient({ id: 'custom_ing' });
            expect(ingredient.ingredientId).toBe('custom_ing');
        });

        it('should use default name', () => {
            const { ingredient } = system.recruitIngredient({});
            expect(ingredient.name).toBe('Mystic Herb');
        });

        it('should use default type herb', () => {
            const { ingredient } = system.recruitIngredient({});
            expect(ingredient.type).toBe('herb');
        });

        it('should accept custom type mineral', () => {
            const { ingredient } = system.recruitIngredient({ type: 'mineral' });
            expect(ingredient.type).toBe('mineral');
        });

        it('should accept custom type animal', () => {
            const { ingredient } = system.recruitIngredient({ type: 'animal' });
            expect(ingredient.type).toBe('animal');
        });

        it('should use default freshness', () => {
            const { ingredient } = system.recruitIngredient({});
            expect(ingredient.freshness).toBe(20);
        });

        it('should use default status novice', () => {
            const { ingredient } = system.recruitIngredient({});
            expect(ingredient.status).toBe('novice');
        });

        it('should use default level 1', () => {
            const { ingredient } = system.recruitIngredient({});
            expect(ingredient.level).toBe(1);
        });

        it('should increment stats', () => {
            system.recruitIngredient({});
            expect(system.stats.totalIngredients).toBe(1);
        });

        it('should trigger ingredientRecruited hook', () => {
            let called = false;
            system.registerHook('ingredientRecruited', () => { called = true; });
            system.recruitIngredient({});
            expect(called).toBe(true);
        });
    });

    describe('getIngredient', () => {
        it('should return ingredient', () => {
            const { ingredient } = system.recruitIngredient({});
            expect(system.getIngredient(ingredient.ingredientId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getIngredient('ghost')).toBeNull();
        });
    });

    describe('listIngredients', () => {
        it('should return empty array initially', () => {
            expect(system.listIngredients().length).toBe(0);
        });

        it('should list all', () => {
            system.recruitIngredient({});
            system.recruitIngredient({});
            expect(system.listIngredients().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter by masterId', () => {
            system.recruitIngredient({ masterId: 'm1' });
            system.recruitIngredient({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown', () => {
            system.recruitIngredient({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { ingredient } = system.recruitIngredient({});
            system.legendIngredient(ingredient.ingredientId);
            system.recruitIngredient({});
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitIngredient({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addPreparation', () => {
        it('should add preparation', () => {
            const { ingredient } = system.recruitIngredient({});
            const result = system.addPreparation(ingredient.ingredientId, 'grind');
            expect(result.success).toBe(true);
            expect(ingredient.preparations.length).toBe(1);
        });

        it('should add multiple preparations', () => {
            const { ingredient } = system.recruitIngredient({});
            system.addPreparation(ingredient.ingredientId, 'grind');
            system.addPreparation(ingredient.ingredientId, 'boil');
            expect(ingredient.preparations.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addPreparation('ghost', 'grind');
            expect(result.error).toBe('INGREDIENT_NOT_FOUND');
        });

        it('should trigger preparationAdded hook', () => {
            const { ingredient } = system.recruitIngredient({});
            let called = false;
            system.registerHook('preparationAdded', () => { called = true; });
            system.addPreparation(ingredient.ingredientId, 'grind');
            expect(called).toBe(true);
        });
    });

    describe('raiseFreshness', () => {
        it('should raise default amount', () => {
            const { ingredient } = system.recruitIngredient({});
            system.raiseFreshness(ingredient.ingredientId);
            expect(ingredient.freshness).toBe(25);
        });

        it('should raise custom amount', () => {
            const { ingredient } = system.recruitIngredient({});
            system.raiseFreshness(ingredient.ingredientId, 10);
            expect(ingredient.freshness).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raiseFreshness('ghost', 5);
            expect(result.error).toBe('INGREDIENT_NOT_FOUND');
        });

        it('should trigger freshnessRaised hook', () => {
            const { ingredient } = system.recruitIngredient({});
            let called = false;
            system.registerHook('freshnessRaised', () => { called = true; });
            system.raiseFreshness(ingredient.ingredientId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpIngredient', () => {
        it('should increment level', () => {
            const { ingredient } = system.recruitIngredient({});
            system.levelUpIngredient(ingredient.ingredientId);
            expect(ingredient.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { ingredient } = system.recruitIngredient({});
            system.levelUpIngredient(ingredient.ingredientId);
            system.levelUpIngredient(ingredient.ingredientId);
            expect(ingredient.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpIngredient('ghost');
            expect(result.error).toBe('INGREDIENT_NOT_FOUND');
        });

        it('should trigger ingredientLeveledUp hook', () => {
            const { ingredient } = system.recruitIngredient({});
            let called = false;
            system.registerHook('ingredientLeveledUp', () => { called = true; });
            system.levelUpIngredient(ingredient.ingredientId);
            expect(called).toBe(true);
        });
    });

    describe('legendIngredient', () => {
        it('should set status to legendary', () => {
            const { ingredient } = system.recruitIngredient({});
            system.legendIngredient(ingredient.ingredientId);
            expect(ingredient.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendIngredient('ghost');
            expect(result.error).toBe('INGREDIENT_NOT_FOUND');
        });

        it('should trigger ingredientLegendized hook', () => {
            const { ingredient } = system.recruitIngredient({});
            let called = false;
            system.registerHook('ingredientLegendized', () => { called = true; });
            system.legendIngredient(ingredient.ingredientId);
            expect(called).toBe(true);
        });
    });

    describe('calculateIngredientValue', () => {
        it('should calculate basic value', () => {
            const { ingredient } = system.recruitIngredient({});
            const value = system.calculateIngredientValue(ingredient.ingredientId);
            // level=1 * 100 + freshness=20 * 2 + 0 preparations * 30 = 100 + 40 = 140
            expect(value).toBe(140);
        });

        it('should account for level and preparations', () => {
            const { ingredient } = system.recruitIngredient({});
            system.levelUpIngredient(ingredient.ingredientId);
            system.levelUpIngredient(ingredient.ingredientId);
            system.addPreparation(ingredient.ingredientId, 'grind');
            system.addPreparation(ingredient.ingredientId, 'boil');
            // level=3 * 100 + freshness=20 * 2 + 2 preparations * 30 = 300 + 40 + 60 = 400
            expect(system.calculateIngredientValue(ingredient.ingredientId)).toBe(400);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateIngredientValue('ghost')).toBe(0);
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

        it('should execute default getIngredient', () => {
            const result = system.executeTool('getIngredient', { ingredientId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitIngredient', () => {
            const result = system.executeTool('recruitIngredient', { masterId: 'm1' });
            expect(result.result.ingredient.masterId).toBe('m1');
        });

        it('should handle undefined context', () => {
            system.registerTool('noop', (ctx) => ctx);
            const result = system.executeTool('noop');
            expect(result.result).toEqual({});
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('ingredientRecruited', () => count++);
            unregister();
            system.recruitIngredient({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('ingredientRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitIngredient({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when threshold met', () => {
            system.stats.totalIngredients = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalIngredients = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitIngredient({});
            const json = system.toJSON();
            expect(json.ingredients.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitIngredient({});
            const json = system.toJSON();
            const newSys = new CultivationIngredient();
            newSys.fromJSON(json);
            expect(newSys.ingredients.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with ingredient count', () => {
            system.recruitIngredient({});
            const stats = system.getStats();
            expect(stats.ingredientCount).toBe(1);
            expect(stats.totalIngredients).toBe(1);
        });
    });

    describe('Configuration', () => {
        it('should accept custom config', () => {
            const custom = new CultivationIngredient({ maxIngredients: 50, baseFreshness: 10 });
            expect(custom.config.maxIngredients).toBe(50);
            expect(custom.config.baseFreshness).toBe(10);
        });
    });
});
