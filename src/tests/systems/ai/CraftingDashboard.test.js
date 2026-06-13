/**
 * CraftingDashboard.test.js - 工匠仪表盘测试
 * V518 Iteration 20/20 FINAL Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CraftingDashboard } from '../../../systems/ai/CraftingDashboard.js';

describe('CraftingDashboard', () => {
    let system;
    beforeEach(() => { system = new CraftingDashboard(); });

    describe('registerCraft', () => {
        it('should register', () => {
            const { craft } = system.registerCraft({ name: 'Smith' });
            expect(craft.name).toBe('Smith');
        });

        it('should set initial metrics', () => {
            const { craft } = system.registerCraft({});
            expect(system.getMetrics(craft.craftId)).not.toBeNull();
        });

        it('should trigger craftRegistered hook', () => {
            let called = false;
            system.registerHook('craftRegistered', () => { called = true; });
            system.registerCraft({});
            expect(called).toBe(true);
        });
    });

    describe('getCraft', () => {
        it('should return', () => {
            const { craft } = system.registerCraft({});
            expect(system.getCraft(craft.craftId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCraft('ghost')).toBeNull(); });
    });

    describe('listCrafts', () => {
        it('should list all', () => {
            system.registerCraft({});
            expect(system.listCrafts().length).toBe(1);
        });
    });

    describe('listByCraftsman', () => {
        it('should filter', () => {
            system.registerCraft({ craftsman: 'c1' });
            system.registerCraft({ craftsman: 'c2' });
            expect(system.listByCraftsman('c1').length).toBe(1);
        });
    });

    describe('listByCategory', () => {
        it('should filter', () => {
            system.registerCraft({ category: 'weapon' });
            system.registerCraft({ category: 'armor' });
            expect(system.listByCategory('weapon').length).toBe(1);
        });
    });

    describe('listByQuality', () => {
        it('should filter', () => {
            system.registerCraft({});
            system.registerCraft({ quality: 200 });
            expect(system.listByQuality(100).length).toBe(1);
        });
    });

    describe('listTop', () => {
        it('should return top', () => {
            system.registerCraft({});
            system.registerCraft({});
            expect(system.listTop(2).length).toBe(2);
        });
    });

    describe('setMetrics', () => {
        it('should set', () => {
            const { craft } = system.registerCraft({});
            const result = system.setMetrics(craft.craftId, { proficiency: 90 });
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.setMetrics('ghost', {});
            expect(result.error).toBe('CRAFT_NOT_FOUND');
        });
    });

    describe('getMetrics', () => {
        it('should return', () => {
            const { craft } = system.registerCraft({});
            expect(system.getMetrics(craft.craftId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getMetrics('ghost')).toBeNull();
        });
    });

    describe('refreshCraft', () => {
        it('should refresh', () => {
            const { craft } = system.registerCraft({});
            const result = system.refreshCraft(craft.craftId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.refreshCraft('ghost');
            expect(result.error).toBe('CRAFT_NOT_FOUND');
        });

        it('should trigger craftRefreshed hook', () => {
            const { craft } = system.registerCraft({});
            let called = false;
            system.registerHook('craftRefreshed', () => { called = true; });
            system.refreshCraft(craft.craftId);
            expect(called).toBe(true);
        });
    });

    describe('gainExperience', () => {
        it('should gain', () => {
            const { craft } = system.registerCraft({});
            system.gainExperience(craft.craftId, 50);
            expect(craft.experience).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.gainExperience('ghost', 5);
            expect(result.error).toBe('CRAFT_NOT_FOUND');
        });

        it('should trigger experienceGained hook', () => {
            const { craft } = system.registerCraft({});
            let called = false;
            system.registerHook('experienceGained', () => { called = true; });
            system.gainExperience(craft.craftId, 5);
            expect(called).toBe(true);
        });
    });

    describe('promoteCraft', () => {
        it('should promote', () => {
            const { craft } = system.registerCraft({});
            system.promoteCraft(craft.craftId, 20);
            expect(craft.quality).toBe(70);
        });

        it('should reject missing', () => {
            const result = system.promoteCraft('ghost', 5);
            expect(result.error).toBe('CRAFT_NOT_FOUND');
        });

        it('should trigger craftPromoted hook', () => {
            const { craft } = system.registerCraft({});
            let called = false;
            system.registerHook('craftPromoted', () => { called = true; });
            system.promoteCraft(craft.craftId, 5);
            expect(called).toBe(true);
        });
    });

    describe('gainMaster', () => {
        it('should gain', () => {
            const { craft } = system.registerCraft({});
            system.gainMaster(craft.craftId);
            expect(craft.masters).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.gainMaster('ghost');
            expect(result.error).toBe('CRAFT_NOT_FOUND');
        });

        it('should trigger masterGained hook', () => {
            const { craft } = system.registerCraft({});
            let called = false;
            system.registerHook('masterGained', () => { called = true; });
            system.gainMaster(craft.craftId);
            expect(called).toBe(true);
        });
    });

    describe('changeCategory', () => {
        it('should change', () => {
            const { craft } = system.registerCraft({});
            system.changeCategory(craft.craftId, 'weapon');
            expect(craft.category).toBe('weapon');
        });

        it('should reject missing', () => {
            const result = system.changeCategory('ghost', 'armor');
            expect(result.error).toBe('CRAFT_NOT_FOUND');
        });

        it('should trigger categoryChanged hook', () => {
            const { craft } = system.registerCraft({});
            let called = false;
            system.registerHook('categoryChanged', () => { called = true; });
            system.changeCategory(craft.craftId, 'armor');
            expect(called).toBe(true);
        });
    });

    describe('retireCraft', () => {
        it('should retire', () => {
            const { craft } = system.registerCraft({});
            system.retireCraft(craft.craftId);
            expect(craft.status).toBe('retired');
        });

        it('should reject missing', () => {
            const result = system.retireCraft('ghost');
            expect(result.error).toBe('CRAFT_NOT_FOUND');
        });

        it('should trigger craftRetired hook', () => {
            const { craft } = system.registerCraft({});
            let called = false;
            system.registerHook('craftRetired', () => { called = true; });
            system.retireCraft(craft.craftId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCraftingPower', () => {
        it('should calculate', () => {
            const { craft } = system.registerCraft({});
            expect(system.calculateCraftingPower(craft.craftId)).toBe(100);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCraftingPower('ghost')).toBe(0);
        });
    });

    describe('deleteCraft', () => {
        it('should delete', () => {
            const { craft } = system.registerCraft({});
            const result = system.deleteCraft(craft.craftId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteCraft('ghost');
            expect(result.error).toBe('CRAFT_NOT_FOUND');
        });

        it('should trigger craftDeleted hook', () => {
            const { craft } = system.registerCraft({});
            let called = false;
            system.registerHook('craftDeleted', () => { called = true; });
            system.deleteCraft(craft.craftId);
            expect(called).toBe(true);
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

        it('should execute default getCraft', () => {
            const result = system.executeTool('getCraft', { craftId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('craftRegistered', () => count++);
            unregister();
            system.registerCraft({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('craftRegistered', () => { throw new Error('x'); });
            expect(() => system.registerCraft({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCrafts = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCrafts = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerCraft({});
            const json = system.toJSON();
            expect(json.crafts.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerCraft({});
            const json = system.toJSON();
            const newSys = new CraftingDashboard();
            newSys.fromJSON(json);
            expect(newSys.crafts.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.craftCount).toBe(0);
        });
    });
});