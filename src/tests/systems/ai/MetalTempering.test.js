/**
 * MetalTempering.test.js - 金属淬火系统测试
 * V515 Iteration 17/20 Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MetalTempering } from '../../../systems/ai/MetalTempering.js';

describe('MetalTempering', () => {
    let system;
    beforeEach(() => { system = new MetalTempering(); });

    describe('temperMetal', () => {
        it('should create metal', () => {
            const { metal } = system.temperMetal({ smithId: 's1', name: 'Steel Blade', type: 'steel' });
            expect(metal.smithId).toBe('s1');
            expect(metal.name).toBe('Steel Blade');
            expect(metal.type).toBe('steel');
            expect(metal.hardness).toBe(20);
            expect(metal.status).toBe('raw');
        });

        it('should default type to steel', () => {
            const { metal } = system.temperMetal({});
            expect(metal.type).toBe('steel');
        });

        it('should accept iron type', () => {
            const { metal } = system.temperMetal({ type: 'iron' });
            expect(metal.type).toBe('iron');
        });

        it('should accept mithril type', () => {
            const { metal } = system.temperMetal({ type: 'mithril' });
            expect(metal.type).toBe('mithril');
        });

        it('should use provided metalId', () => {
            const { metal } = system.temperMetal({ metalId: 'custom_id' });
            expect(metal.metalId).toBe('custom_id');
        });

        it('should generate metalId when not provided', () => {
            const { metal } = system.temperMetal({});
            expect(metal.metalId).toMatch(/^mtl_/);
        });

        it('should trigger metalTempered hook', () => {
            let called = false;
            system.registerHook('metalTempered', () => { called = true; });
            system.temperMetal({});
            expect(called).toBe(true);
        });

        it('should accept custom hardness', () => {
            const { metal } = system.temperMetal({ hardness: 75 });
            expect(metal.hardness).toBe(75);
        });
    });

    describe('getMetal', () => {
        it('should return metal', () => {
            const { metal } = system.temperMetal({ name: 'Test' });
            const fetched = system.getMetal(metal.metalId);
            expect(fetched).not.toBeNull();
            expect(fetched.name).toBe('Test');
        });

        it('should return null for missing', () => {
            expect(system.getMetal('ghost')).toBeNull();
        });

        it('should return a copy, not reference', () => {
            const { metal } = system.temperMetal({});
            const fetched = system.getMetal(metal.metalId);
            fetched.name = 'Modified';
            expect(system.metals.get(metal.metalId).name).not.toBe('Modified');
        });
    });

    describe('listMetals', () => {
        it('should list all', () => {
            system.temperMetal({});
            system.temperMetal({});
            expect(system.listMetals().length).toBe(2);
        });

        it('should return empty array when none', () => {
            expect(system.listMetals().length).toBe(0);
        });
    });

    describe('listBySmith', () => {
        it('should filter by smith', () => {
            system.temperMetal({ smithId: 's1' });
            system.temperMetal({ smithId: 's2' });
            system.temperMetal({ smithId: 's1' });
            expect(system.listBySmith('s1').length).toBe(2);
            expect(system.listBySmith('s2').length).toBe(1);
        });

        it('should return empty for unknown smith', () => {
            system.temperMetal({ smithId: 's1' });
            expect(system.listBySmith('unknown').length).toBe(0);
        });
    });

    describe('listTempered', () => {
        it('should filter by tempered status', () => {
            const { metal: m1 } = system.temperMetal({});
            system.temperMetal({});
            system.markTempered(m1.metalId);
            expect(system.listTempered().length).toBe(1);
        });

        it('should return empty when none tempered', () => {
            system.temperMetal({});
            expect(system.listTempered().length).toBe(0);
        });
    });

    describe('addOil', () => {
        it('should add oil', () => {
            const { metal } = system.temperMetal({});
            system.addOil(metal.metalId, 'dragon-oil');
            expect(metal.oils).toContain('dragon-oil');
        });

        it('should reject missing metal', () => {
            const result = system.addOil('ghost', 'oil');
            expect(result.error).toBe('METAL_NOT_FOUND');
        });

        it('should trigger oilAdded hook', () => {
            const { metal } = system.temperMetal({});
            let called = false;
            system.registerHook('oilAdded', () => { called = true; });
            system.addOil(metal.metalId, 'flame-oil');
            expect(called).toBe(true);
        });

        it('should add multiple oils', () => {
            const { metal } = system.temperMetal({});
            system.addOil(metal.metalId, 'oil1');
            system.addOil(metal.metalId, 'oil2');
            expect(metal.oils.length).toBe(2);
        });
    });

    describe('increaseHeat', () => {
        it('should increase heat by default 10', () => {
            const { metal } = system.temperMetal({});
            system.increaseHeat(metal.metalId);
            expect(metal.heat).toBe(10);
        });

        it('should increase heat by custom amount', () => {
            const { metal } = system.temperMetal({});
            system.increaseHeat(metal.metalId, 50);
            expect(metal.heat).toBe(50);
        });

        it('should reject missing metal', () => {
            const result = system.increaseHeat('ghost', 10);
            expect(result.error).toBe('METAL_NOT_FOUND');
        });

        it('should trigger heatIncreased hook', () => {
            const { metal } = system.temperMetal({});
            let called = false;
            system.registerHook('heatIncreased', () => { called = true; });
            system.increaseHeat(metal.metalId, 20);
            expect(called).toBe(true);
        });
    });

    describe('hardenMetal', () => {
        it('should harden by default 5', () => {
            const { metal } = system.temperMetal({});
            system.hardenMetal(metal.metalId);
            expect(metal.hardness).toBe(25);
        });

        it('should harden by custom amount', () => {
            const { metal } = system.temperMetal({});
            system.hardenMetal(metal.metalId, 30);
            expect(metal.hardness).toBe(50);
        });

        it('should reject missing metal', () => {
            const result = system.hardenMetal('ghost', 10);
            expect(result.error).toBe('METAL_NOT_FOUND');
        });

        it('should trigger metalHardened hook', () => {
            const { metal } = system.temperMetal({});
            let called = false;
            system.registerHook('metalHardened', () => { called = true; });
            system.hardenMetal(metal.metalId, 10);
            expect(called).toBe(true);
        });
    });

    describe('markTempered', () => {
        it('should mark as tempered', () => {
            const { metal } = system.temperMetal({});
            system.markTempered(metal.metalId);
            expect(metal.status).toBe('tempered');
        });

        it('should reject missing metal', () => {
            const result = system.markTempered('ghost');
            expect(result.error).toBe('METAL_NOT_FOUND');
        });

        it('should trigger metalTempered hook', () => {
            const { metal } = system.temperMetal({});
            let called = false;
            system.registerHook('metalTempered', () => { called = true; });
            system.markTempered(metal.metalId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMetalValue', () => {
        it('should calculate value', () => {
            const { metal } = system.temperMetal({});
            system.hardenMetal(metal.metalId, 10);
            system.increaseHeat(metal.metalId, 100);
            system.addOil(metal.metalId, 'oil1');
            system.addOil(metal.metalId, 'oil2');
            // hardness=30*2=60 + heat=100/10=10 + oils=2*10=20 = 90
            expect(system.calculateMetalValue(metal.metalId)).toBe(90);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMetalValue('ghost')).toBe(0);
        });

        it('should calculate base value', () => {
            const { metal } = system.temperMetal({});
            // hardness=20*2=40 + heat=0/10=0 + oils=0*10=0 = 40
            expect(system.calculateMetalValue(metal.metalId)).toBe(40);
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

        it('should execute default getMetal tool', () => {
            const result = system.executeTool('getMetal', { metalId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('metalTempered', () => count++);
            unregister();
            system.temperMetal({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('metalTempered', () => { throw new Error('x'); });
            expect(() => system.temperMetal({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalMetals = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });

        it('should not double evolve', () => {
            system.stats.totalMetals = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.temperMetal({});
            const json = system.toJSON();
            expect(json.metals.length).toBe(1);
            expect(json.stats.totalMetals).toBe(1);
        });

        it('should deserialize', () => {
            system.temperMetal({ name: 'Test' });
            const json = system.toJSON();
            const newSys = new MetalTempering();
            newSys.fromJSON(json);
            expect(newSys.metals.size).toBe(1);
            expect(newSys.metals.get(json.metals[0][0]).name).toBe('Test');
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.temperMetal({});
            const stats = system.getStats();
            expect(stats.metalCount).toBe(1);
            expect(stats.totalMetals).toBe(1);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
