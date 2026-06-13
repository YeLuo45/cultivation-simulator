/**
 * CultivationFood.test.js - 修真食测试
 * V563 Iteration 6/20 Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationFood } from '../../../systems/ai/CultivationFood.js';

describe('CultivationFood', () => {
    let system;
    beforeEach(() => { system = new CultivationFood(); });

    describe('cookFood', () => {
        it('should cook', () => {
            const { food } = system.cookFood({ chefId: 'c1', name: 'Celestial Dumplings', type: 'immortal' });
            expect(food.chefId).toBe('c1');
            expect(food.name).toBe('Celestial Dumplings');
            expect(food.type).toBe('immortal');
        });

        it('should trigger foodCooked hook', () => {
            let called = false;
            system.registerHook('foodCooked', () => { called = true; });
            system.cookFood({});
            expect(called).toBe(true);
        });

        it('should set default status to raw', () => {
            const { food } = system.cookFood({});
            expect(food.status).toBe('raw');
        });

        it('should set default taste to baseTaste', () => {
            const { food } = system.cookFood({});
            expect(food.taste).toBe(20);
        });

        it('should set default ingredients to empty array', () => {
            const { food } = system.cookFood({});
            expect(food.ingredients).toEqual([]);
        });

        it('should set default level to 1', () => {
            const { food } = system.cookFood({});
            expect(food.level).toBe(1);
        });
    });

    describe('getFood', () => {
        it('should return', () => {
            const { food } = system.cookFood({});
            expect(system.getFood(food.foodId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getFood('ghost')).toBeNull(); });
    });

    describe('listFoods', () => {
        it('should list all', () => {
            system.cookFood({});
            system.cookFood({});
            expect(system.listFoods().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listFoods().length).toBe(0);
        });
    });

    describe('listByChef', () => {
        it('should filter', () => {
            system.cookFood({ chefId: 'c1' });
            system.cookFood({ chefId: 'c2' });
            expect(system.listByChef('c1').length).toBe(1);
        });

        it('should return empty when none match', () => {
            system.cookFood({ chefId: 'c1' });
            expect(system.listByChef('ghost').length).toBe(0);
        });
    });

    describe('listCelestial', () => {
        it('should filter celestial', () => {
            const { food } = system.cookFood({});
            system.celestialFood(food.foodId);
            system.cookFood({});
            expect(system.listCelestial().length).toBe(1);
        });

        it('should return empty when none celestial', () => {
            system.cookFood({});
            expect(system.listCelestial().length).toBe(0);
        });
    });

    describe('addIngredient', () => {
        it('should add ingredient', () => {
            const { food } = system.cookFood({});
            system.addIngredient(food.foodId, 'celestial herbs');
            expect(food.ingredients.length).toBe(1);
            expect(food.ingredients[0]).toBe('celestial herbs');
        });

        it('should add multiple ingredients', () => {
            const { food } = system.cookFood({});
            system.addIngredient(food.foodId, 'celestial herbs');
            system.addIngredient(food.foodId, 'phoenix egg');
            expect(food.ingredients.length).toBe(2);
        });

        it('should change status to cooked on first ingredient', () => {
            const { food } = system.cookFood({});
            system.addIngredient(food.foodId, 'celestial herbs');
            expect(food.status).toBe('cooked');
        });

        it('should reject missing', () => {
            const result = system.addIngredient('ghost', 'celestial herbs');
            expect(result.error).toBe('FOOD_NOT_FOUND');
        });

        it('should trigger ingredientAdded hook', () => {
            const { food } = system.cookFood({});
            let called = false;
            system.registerHook('ingredientAdded', () => { called = true; });
            system.addIngredient(food.foodId, 'celestial herbs');
            expect(called).toBe(true);
        });
    });

    describe('increaseTaste', () => {
        it('should increase taste by default', () => {
            const { food } = system.cookFood({});
            system.increaseTaste(food.foodId);
            expect(food.taste).toBe(25);
        });

        it('should increase taste by amount', () => {
            const { food } = system.cookFood({});
            system.increaseTaste(food.foodId, 10);
            expect(food.taste).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.increaseTaste('ghost', 10);
            expect(result.error).toBe('FOOD_NOT_FOUND');
        });

        it('should trigger tasteIncreased hook', () => {
            const { food } = system.cookFood({});
            let called = false;
            system.registerHook('tasteIncreased', () => { called = true; });
            system.increaseTaste(food.foodId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpFood', () => {
        it('should level up', () => {
            const { food } = system.cookFood({});
            system.levelUpFood(food.foodId);
            expect(food.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { food } = system.cookFood({});
            system.levelUpFood(food.foodId);
            system.levelUpFood(food.foodId);
            system.levelUpFood(food.foodId);
            expect(food.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpFood('ghost');
            expect(result.error).toBe('FOOD_NOT_FOUND');
        });

        it('should trigger foodLeveledUp hook', () => {
            const { food } = system.cookFood({});
            let called = false;
            system.registerHook('foodLeveledUp', () => { called = true; });
            system.levelUpFood(food.foodId);
            expect(called).toBe(true);
        });
    });

    describe('celestialFood', () => {
        it('should mark as celestial', () => {
            const { food } = system.cookFood({});
            system.celestialFood(food.foodId);
            expect(food.status).toBe('celestial');
        });

        it('should reject missing', () => {
            const result = system.celestialFood('ghost');
            expect(result.error).toBe('FOOD_NOT_FOUND');
        });

        it('should trigger foodCelestialized hook', () => {
            const { food } = system.cookFood({});
            let called = false;
            system.registerHook('foodCelestialized', () => { called = true; });
            system.celestialFood(food.foodId);
            expect(called).toBe(true);
        });
    });

    describe('calculateFoodValue', () => {
        it('should calculate', () => {
            const { food } = system.cookFood({});
            // level=1, taste=20, ingredients=0: 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateFoodValue(food.foodId)).toBe(140);
        });

        it('should calculate with ingredients', () => {
            const { food } = system.cookFood({});
            system.addIngredient(food.foodId, 'celestial herbs');
            system.addIngredient(food.foodId, 'phoenix egg');
            // level=1, taste=20, ingredients=2: 100 + 40 + 60 = 200
            expect(system.calculateFoodValue(food.foodId)).toBe(200);
        });

        it('should calculate with level up and taste increased', () => {
            const { food } = system.cookFood({});
            system.levelUpFood(food.foodId);
            system.levelUpFood(food.foodId);
            system.increaseTaste(food.foodId, 30);
            // level=3, taste=50, ingredients=0: 300 + 100 + 0 = 400
            expect(system.calculateFoodValue(food.foodId)).toBe(400);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateFoodValue('ghost')).toBe(0);
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

        it('should execute default getFood', () => {
            const result = system.executeTool('getFood', { foodId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('foodCooked', () => count++);
            unregister();
            system.cookFood({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('foodCooked', () => { throw new Error('x'); });
            expect(() => system.cookFood({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalFoods = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalFoods = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.cookFood({});
            const json = system.toJSON();
            expect(json.foods.length).toBe(1);
        });
        it('should deserialize', () => {
            system.cookFood({});
            const json = system.toJSON();
            const newSys = new CultivationFood();
            newSys.fromJSON(json);
            expect(newSys.foods.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.foodCount).toBe(0);
        });
    });
});
