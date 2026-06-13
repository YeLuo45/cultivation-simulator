/**
 * AlchemyFurnace.test.js - 丹炉系统测试
 * V326 Iteration 5/9 Round 5 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AlchemyFurnace } from '../../../systems/ai/AlchemyFurnace.js';

describe('AlchemyFurnace', () => {
    let system;
    beforeEach(() => { system = new AlchemyFurnace(); });

    describe('createFurnace', () => {
        it('should create', () => {
            const { furnace } = system.createFurnace({ name: 'F1' });
            expect(furnace.name).toBe('F1');
        });

        it('should default quality to common', () => {
            const { furnace } = system.createFurnace({});
            expect(furnace.quality).toBe('common');
        });

        it('should default durability to 100', () => {
            const { furnace } = system.createFurnace({});
            expect(furnace.durability).toBe(100);
        });

        it('should trigger furnaceCreated hook', () => {
            let called = false;
            system.registerHook('furnaceCreated', () => { called = true; });
            system.createFurnace({});
            expect(called).toBe(true);
        });

        it('should increment totalFurnaces', () => {
            system.createFurnace({});
            expect(system.stats.totalFurnaces).toBe(1);
        });
    });

    describe('getFurnace', () => {
        it('should return', () => {
            const { furnace } = system.createFurnace({});
            expect(system.getFurnace(furnace.furnaceId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getFurnace('ghost')).toBeNull(); });
    });

    describe('listFurnaces', () => {
        it('should list all', () => {
            system.createFurnace({});
            expect(system.listFurnaces().length).toBe(1);
        });
    });

    describe('ignite', () => {
        it('should ignite', () => {
            const { furnace } = system.createFurnace({});
            const result = system.ignite(furnace.furnaceId);
            expect(result.success).toBe(true);
        });

        it('should reject missing furnace', () => {
            const result = system.ignite('ghost');
            expect(result.error).toBe('FURNACE_NOT_FOUND');
        });

        it('should set furnace fire', () => {
            const { furnace } = system.createFurnace({});
            const { fire } = system.ignite(furnace.furnaceId);
            expect(furnace.fire).toBe(fire);
        });

        it('should increment totalIgnitions', () => {
            const { furnace } = system.createFurnace({});
            system.ignite(furnace.furnaceId);
            expect(system.stats.totalIgnitions).toBe(1);
        });

        it('should trigger furnaceIgnited hook', () => {
            const { furnace } = system.createFurnace({});
            let called = false;
            system.registerHook('furnaceIgnited', () => { called = true; });
            system.ignite(furnace.furnaceId);
            expect(called).toBe(true);
        });
    });

    describe('getFire', () => {
        it('should return', () => {
            const { furnace } = system.createFurnace({});
            const { fire } = system.ignite(furnace.furnaceId);
            expect(system.getFire(fire.fireId)).not.toBeNull();
        });

        it('should return null for missing', () => { expect(system.getFire('ghost')).toBeNull(); });
    });

    describe('listFires', () => {
        it('should list all', () => {
            const { furnace } = system.createFurnace({});
            system.ignite(furnace.furnaceId);
            expect(system.listFires().length).toBe(1);
        });
    });

    describe('adjustTemperature', () => {
        it('should adjust', () => {
            const { furnace } = system.createFurnace({});
            const { fire } = system.ignite(furnace.furnaceId);
            const result = system.adjustTemperature(fire.fireId, 500);
            expect(result.success).toBe(true);
        });

        it('should reject missing fire', () => {
            const result = system.adjustTemperature('ghost', 500);
            expect(result.error).toBe('FIRE_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { furnace } = system.createFurnace({});
            const { fire } = system.ignite(furnace.furnaceId);
            fire.status = 'extinguished';
            const result = system.adjustTemperature(fire.fireId, 500);
            expect(result.error).toBe('FIRE_INACTIVE');
        });

        it('should reject too high', () => {
            const { furnace } = system.createFurnace({});
            const { fire } = system.ignite(furnace.furnaceId);
            const result = system.adjustTemperature(fire.fireId, 9999);
            expect(result.error).toBe('TEMPERATURE_TOO_HIGH');
        });

        it('should set temperature', () => {
            const { furnace } = system.createFurnace({});
            const { fire } = system.ignite(furnace.furnaceId);
            system.adjustTemperature(fire.fireId, 500);
            expect(fire.temperature).toBe(500);
        });

        it('should trigger temperatureAdjusted hook', () => {
            const { furnace } = system.createFurnace({});
            const { fire } = system.ignite(furnace.furnaceId);
            let called = false;
            system.registerHook('temperatureAdjusted', () => { called = true; });
            system.adjustTemperature(fire.fireId, 500);
            expect(called).toBe(true);
        });
    });

    describe('extinguish', () => {
        it('should extinguish', () => {
            const { furnace } = system.createFurnace({});
            const { fire } = system.ignite(furnace.furnaceId);
            const result = system.extinguish(fire.fireId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.extinguish('ghost');
            expect(result.error).toBe('FIRE_NOT_FOUND');
        });

        it('should set status to extinguished', () => {
            const { furnace } = system.createFurnace({});
            const { fire } = system.ignite(furnace.furnaceId);
            system.extinguish(fire.fireId);
            expect(fire.status).toBe('extinguished');
        });

        it('should clear furnace fire', () => {
            const { furnace } = system.createFurnace({});
            const { fire } = system.ignite(furnace.furnaceId);
            system.extinguish(fire.fireId);
            expect(furnace.fire).toBeNull();
        });

        it('should trigger fireExtinguished hook', () => {
            const { furnace } = system.createFurnace({});
            const { fire } = system.ignite(furnace.furnaceId);
            let called = false;
            system.registerHook('fireExtinguished', () => { called = true; });
            system.extinguish(fire.fireId);
            expect(called).toBe(true);
        });
    });

    describe('damageFurnace', () => {
        it('should damage', () => {
            const { furnace } = system.createFurnace({});
            const result = system.damageFurnace(furnace.furnaceId, 10);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.damageFurnace('ghost', 10);
            expect(result.error).toBe('FURNACE_NOT_FOUND');
        });

        it('should reduce durability', () => {
            const { furnace } = system.createFurnace({});
            system.damageFurnace(furnace.furnaceId, 10);
            expect(furnace.durability).toBe(90);
        });

        it('should trigger furnaceDestroyed hook at 0', () => {
            const { furnace } = system.createFurnace({});
            let called = false;
            system.registerHook('furnaceDestroyed', () => { called = true; });
            system.damageFurnace(furnace.furnaceId, 100);
            expect(called).toBe(true);
        });
    });

    describe('repairFurnace', () => {
        it('should repair', () => {
            const { furnace } = system.createFurnace({});
            system.damageFurnace(furnace.furnaceId, 50);
            const result = system.repairFurnace(furnace.furnaceId, 20);
            expect(furnace.durability).toBe(70);
        });

        it('should reject missing', () => {
            const result = system.repairFurnace('ghost', 10);
            expect(result.error).toBe('FURNACE_NOT_FOUND');
        });

        it('should cap at maxDurability', () => {
            const { furnace } = system.createFurnace({});
            system.repairFurnace(furnace.furnaceId, 9999);
            expect(furnace.durability).toBe(100);
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

        it('should execute default getFurnace', () => {
            const result = system.executeTool('getFurnace', { furnaceId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('furnaceCreated', () => count++);
            unregister();
            system.createFurnace({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('furnaceCreated', () => { throw new Error('x'); });
            expect(() => system.createFurnace({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalIgnitions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalIgnitions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createFurnace({});
            const json = system.toJSON();
            expect(json.furnaces.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createFurnace({});
            const json = system.toJSON();
            const newSys = new AlchemyFurnace();
            newSys.fromJSON(json);
            expect(newSys.furnaces.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.furnaceCount).toBe(0);
        });
    });
});