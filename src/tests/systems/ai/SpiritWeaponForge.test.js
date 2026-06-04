/**
 * SpiritWeaponForge.test.js - 灵器锻造系统测试
 * V316 Iteration 4/9 Round 4 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SpiritWeaponForge } from '../../../systems/ai/SpiritWeaponForge.js';

describe('SpiritWeaponForge', () => {
    let system;
    beforeEach(() => { system = new SpiritWeaponForge(); });

    describe('Default Recipes', () => {
        it('should have default recipes', () => { expect(system.recipes.size).toBe(3); });
        it('should contain iron_sword', () => { expect(system.getRecipe('iron_sword')).not.toBeNull(); });
    });

    describe('Materials', () => {
        it('should add material', () => {
            const result = system.addMaterial('iron', 10);
            expect(result.total).toBe(10);
        });

        it('should get material', () => {
            system.addMaterial('iron', 5);
            expect(system.getMaterial('iron')).toBe(5);
        });

        it('should return 0 for missing', () => {
            expect(system.getMaterial('ghost')).toBe(0);
        });

        it('should trigger materialAdded hook', () => {
            let called = false;
            system.registerHook('materialAdded', () => { called = true; });
            system.addMaterial('iron', 1);
            expect(called).toBe(true);
        });
    });

    describe('Recipes', () => {
        it('should register recipe', () => {
            const { recipe } = system.registerRecipe({ name: 'Custom' });
            expect(recipe.name).toBe('Custom');
        });

        it('should return null for missing', () => {
            expect(system.getRecipe('ghost')).toBeNull();
        });

        it('should list all', () => {
            expect(system.listRecipes().length).toBe(3);
        });

        it('should increment totalRecipes', () => {
            system.registerRecipe({});
            expect(system.stats.totalRecipes).toBe(1);
        });
    });

    describe('startForge', () => {
        it('should start forge', () => {
            system.addMaterial('iron', 10);
            const result = system.startForge('iron_sword', 'c1');
            expect(result.success).toBe(true);
        });

        it('should reject missing recipe', () => {
            const result = system.startForge('ghost', 'c1');
            expect(result.error).toBe('RECIPE_NOT_FOUND');
        });

        it('should reject insufficient materials', () => {
            const result = system.startForge('iron_sword', 'c1');
            expect(result.error).toBe('INSUFFICIENT_MATERIALS');
        });

        it('should deduct materials', () => {
            system.addMaterial('iron', 10);
            system.startForge('iron_sword', 'c1');
            expect(system.getMaterial('iron')).toBe(5);
        });

        it('should trigger forgeStarted hook', () => {
            system.addMaterial('iron', 10);
            let called = false;
            system.registerHook('forgeStarted', () => { called = true; });
            system.startForge('iron_sword', 'c1');
            expect(called).toBe(true);
        });
    });

    describe('advanceForge', () => {
        it('should advance', () => {
            system.addMaterial('iron', 10);
            const { job } = system.startForge('iron_sword', 'c1');
            const result = system.advanceForge(job.jobId, 10);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.advanceForge('ghost', 10);
            expect(result.error).toBe('JOB_NOT_FOUND');
        });

        it('should reject inactive', () => {
            system.addMaterial('iron', 10);
            const { job } = system.startForge('iron_sword', 'c1');
            job.status = 'completed';
            const result = system.advanceForge(job.jobId, 10);
            expect(result.error).toBe('JOB_INACTIVE');
        });

        it('should complete at 100%', () => {
            system.addMaterial('iron', 10);
            const { job } = system.startForge('iron_sword', 'c1');
            system.advanceForge(job.jobId, 1000);
            expect(job.status).toBe('completed');
        });
    });

    describe('completeForge', () => {
        it('should complete', () => {
            system.addMaterial('iron', 10);
            const { job } = system.startForge('iron_sword', 'c1');
            const result = system.completeForge(job.jobId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.completeForge('ghost');
            expect(result.error).toBe('JOB_NOT_FOUND');
        });

        it('should create weapon', () => {
            system.addMaterial('iron', 10);
            const { job } = system.startForge('iron_sword', 'c1');
            system.completeForge(job.jobId);
            expect(system.weapons.size).toBe(1);
        });

        it('should increment totalForged', () => {
            system.addMaterial('iron', 10);
            const { job } = system.startForge('iron_sword', 'c1');
            system.completeForge(job.jobId);
            expect(system.stats.totalForged).toBe(1);
        });

        it('should trigger forgeCompleted hook', () => {
            system.addMaterial('iron', 10);
            const { job } = system.startForge('iron_sword', 'c1');
            let called = false;
            system.registerHook('forgeCompleted', () => { called = true; });
            system.completeForge(job.jobId);
            expect(called).toBe(true);
        });
    });

    describe('getWeapon', () => {
        it('should return weapon', () => {
            system.addMaterial('iron', 10);
            const { job } = system.startForge('iron_sword', 'c1');
            const { weapon } = system.completeForge(job.jobId);
            expect(system.getWeapon(weapon.weaponId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getWeapon('ghost')).toBeNull();
        });

        it('should list weapons', () => {
            system.addMaterial('iron', 10);
            const { job } = system.startForge('iron_sword', 'c1');
            system.completeForge(job.jobId);
            expect(system.listWeapons().length).toBe(1);
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

        it('should execute default getWeapon', () => {
            const result = system.executeTool('getWeapon', { weaponId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('materialAdded', () => count++);
            unregister();
            system.addMaterial('iron', 1);
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('materialAdded', () => { throw new Error('x'); });
            expect(() => system.addMaterial('iron', 1)).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalForged = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalForged = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.addMaterial('iron', 10);
            const json = system.toJSON();
            expect(json.materials.length).toBe(1);
        });
        it('should deserialize', () => {
            system.addMaterial('iron', 10);
            const json = system.toJSON();
            const newSys = new SpiritWeaponForge();
            newSys.fromJSON(json);
            expect(newSys.getMaterial('iron')).toBe(10);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.recipeCount).toBe(3);
        });
    });
});