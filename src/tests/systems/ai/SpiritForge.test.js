/**
 * SpiritForge.test.js - 灵器锻造测试
 * V499 Iteration 1/20 Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SpiritForge } from '../../../systems/ai/SpiritForge.js';

describe('SpiritForge', () => {
    let system;
    beforeEach(() => { system = new SpiritForge(); });

    describe('createForge', () => {
        it('should create', () => {
            const { forge } = system.createForge({ blacksmithId: 'bs1', name: 'Flame Forge', type: 'sword' });
            expect(forge.type).toBe('sword');
            expect(forge.blacksmithId).toBe('bs1');
        });

        it('should default name/type/heat', () => {
            const { forge } = system.createForge({});
            expect(forge.name).toBe('unnamed-forge');
            expect(forge.type).toBe('sword');
            expect(forge.heat).toBe(50);
        });

        it('should trigger forgeCreated hook', () => {
            let called = false;
            system.registerHook('forgeCreated', () => { called = true; });
            system.createForge({});
            expect(called).toBe(true);
        });
    });

    describe('getForge', () => {
        it('should return', () => {
            const { forge } = system.createForge({});
            expect(system.getForge(forge.forgeId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getForge('ghost')).toBeNull(); });
    });

    describe('listForges', () => {
        it('should list all', () => {
            system.createForge({});
            system.createForge({});
            expect(system.listForges().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listForges().length).toBe(0);
        });
    });

    describe('listByBlacksmith', () => {
        it('should filter', () => {
            system.createForge({ blacksmithId: 'bs1' });
            system.createForge({ blacksmithId: 'bs2' });
            expect(system.listByBlacksmith('bs1').length).toBe(1);
        });
    });

    describe('listWorking', () => {
        it('should filter working forges', () => {
            const { forge: f1 } = system.createForge({});
            const { forge: f2 } = system.createForge({});
            system.craftItem(f1.forgeId, { name: 'sword' });
            expect(system.listWorking().length).toBe(1);
            expect(system.listWorking()[0].forgeId).toBe(f1.forgeId);
        });

        it('should return empty when none working', () => {
            system.createForge({});
            expect(system.listWorking().length).toBe(0);
        });
    });

    describe('addMaterial', () => {
        it('should add material', () => {
            const { forge } = system.createForge({});
            system.addMaterial(forge.forgeId, { name: 'iron' });
            expect(forge.materials.length).toBe(1);
            expect(forge.materials[0].name).toBe('iron');
        });

        it('should reject missing', () => {
            const result = system.addMaterial('ghost', { name: 'iron' });
            expect(result.error).toBe('FORGE_NOT_FOUND');
        });

        it('should trigger materialAdded hook', () => {
            const { forge } = system.createForge({});
            let called = false;
            system.registerHook('materialAdded', () => { called = true; });
            system.addMaterial(forge.forgeId, { name: 'iron' });
            expect(called).toBe(true);
        });
    });

    describe('increaseHeat', () => {
        it('should increase heat by default', () => {
            const { forge } = system.createForge({});
            system.increaseHeat(forge.forgeId);
            expect(forge.heat).toBe(60);
        });

        it('should increase heat by custom amount', () => {
            const { forge } = system.createForge({});
            system.increaseHeat(forge.forgeId, 25);
            expect(forge.heat).toBe(75);
        });

        it('should set status to heating', () => {
            const { forge } = system.createForge({});
            system.increaseHeat(forge.forgeId);
            expect(forge.status).toBe('heating');
        });

        it('should reject missing', () => {
            const result = system.increaseHeat('ghost');
            expect(result.error).toBe('FORGE_NOT_FOUND');
        });
    });

    describe('craftItem', () => {
        it('should craft item', () => {
            const { forge } = system.createForge({});
            system.craftItem(forge.forgeId, { name: 'spirit-sword' });
            expect(forge.items.length).toBe(1);
        });

        it('should set status to working', () => {
            const { forge } = system.createForge({});
            system.craftItem(forge.forgeId, { name: 'spirit-sword' });
            expect(forge.status).toBe('working');
        });

        it('should reject missing', () => {
            const result = system.craftItem('ghost', { name: 'x' });
            expect(result.error).toBe('FORGE_NOT_FOUND');
        });

        it('should trigger itemCrafted hook', () => {
            const { forge } = system.createForge({});
            let called = false;
            system.registerHook('itemCrafted', () => { called = true; });
            system.craftItem(forge.forgeId, { name: 'sword' });
            expect(called).toBe(true);
        });
    });

    describe('coolForge', () => {
        it('should set status to cold', () => {
            const { forge } = system.createForge({});
            system.craftItem(forge.forgeId, { name: 'sword' });
            system.coolForge(forge.forgeId);
            expect(forge.status).toBe('cold');
        });

        it('should reject missing', () => {
            const result = system.coolForge('ghost');
            expect(result.error).toBe('FORGE_NOT_FOUND');
        });

        it('should trigger forgeCooled hook', () => {
            const { forge } = system.createForge({});
            let called = false;
            system.registerHook('forgeCooled', () => { called = true; });
            system.coolForge(forge.forgeId);
            expect(called).toBe(true);
        });
    });

    describe('calculateForgePower', () => {
        it('should calculate', () => {
            const { forge } = system.createForge({ heat: 100 });
            system.addMaterial(forge.forgeId, { name: 'iron' });
            system.addMaterial(forge.forgeId, { name: 'silver' });
            system.craftItem(forge.forgeId, { name: 'sword' });
            // heat=100 -> 200, materials=2 -> 10, items=1 -> 20; total=230
            expect(system.calculateForgePower(forge.forgeId)).toBe(230);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateForgePower('ghost')).toBe(0);
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

        it('should execute default getForge', () => {
            const result = system.executeTool('getForge', { forgeId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('forgeCreated', () => count++);
            unregister();
            system.createForge({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('forgeCreated', () => { throw new Error('x'); });
            expect(() => system.createForge({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalForges = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalForges = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createForge({});
            const json = system.toJSON();
            expect(json.forges.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createForge({});
            const json = system.toJSON();
            const newSys = new SpiritForge();
            newSys.fromJSON(json);
            expect(newSys.forges.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.forgeCount).toBe(0);
        });
    });
});
