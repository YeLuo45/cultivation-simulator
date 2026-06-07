/**
 * CultivationPearl.test.js - 修真珍珠测试
 * V830 Iteration 3/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationPearl } from '../../../systems/ai/CultivationPearl.js';

describe('CultivationPearl', () => {
    let system;
    beforeEach(() => { system = new CultivationPearl(); });

    describe('recruitPearl', () => {
        it('should create a pearl', () => {
            const { pearl } = system.recruitPearl({ name: 'Moon Pearl' });
            expect(pearl.name).toBe('Moon Pearl');
        });

        it('should default type to salt', () => {
            const { pearl } = system.recruitPearl({});
            expect(pearl.type).toBe('salt');
        });

        it('should default luster to baseLuster (20)', () => {
            const { pearl } = system.recruitPearl({});
            expect(pearl.luster).toBe(20);
        });

        it('should default status to novice', () => {
            const { pearl } = system.recruitPearl({});
            expect(pearl.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { pearl } = system.recruitPearl({});
            expect(pearl.level).toBe(1);
        });

        it('should default layers to empty array', () => {
            const { pearl } = system.recruitPearl({});
            expect(pearl.layers).toEqual([]);
        });

        it('should trigger pearlRecruited hook', () => {
            let called = false;
            system.registerHook('pearlRecruited', () => { called = true; });
            system.recruitPearl({});
            expect(called).toBe(true);
        });

        it('should increment totalPearls stat', () => {
            system.recruitPearl({});
            expect(system.stats.totalPearls).toBe(1);
        });

        it('should accept custom type fresh', () => {
            const { pearl } = system.recruitPearl({ type: 'fresh' });
            expect(pearl.type).toBe('fresh');
        });

        it('should accept custom type divine', () => {
            const { pearl } = system.recruitPearl({ type: 'divine' });
            expect(pearl.type).toBe('divine');
        });

        it('should accept custom masterId', () => {
            const { pearl } = system.recruitPearl({ masterId: 'master-1' });
            expect(pearl.masterId).toBe('master-1');
        });
    });

    describe('getPearl', () => {
        it('should return pearl by id', () => {
            const { pearl } = system.recruitPearl({});
            expect(system.getPearl(pearl.pearlId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPearl('ghost')).toBeNull(); });
    });

    describe('listPearls', () => {
        it('should list all pearls', () => {
            system.recruitPearl({});
            system.recruitPearl({});
            expect(system.listPearls().length).toBe(2);
        });
        it('should return empty list when no pearls', () => {
            expect(system.listPearls().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by masterId', () => {
            system.recruitPearl({ masterId: 'm1' });
            system.recruitPearl({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary pearls', () => {
            system.recruitPearl({});
            const { pearl } = system.recruitPearl({});
            system.legendPearl(pearl.pearlId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none are legendary', () => {
            system.recruitPearl({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addLayer', () => {
        it('should add a layer to the array', () => {
            const { pearl } = system.recruitPearl({});
            system.addLayer(pearl.pearlId, 'nacre-layer');
            expect(pearl.layers.length).toBe(1);
            expect(pearl.layers[0]).toBe('nacre-layer');
        });

        it('should reject missing pearl', () => {
            const result = system.addLayer('ghost', 'layer');
            expect(result.error).toBe('PEARL_NOT_FOUND');
        });

        it('should trigger layerAdded hook', () => {
            const { pearl } = system.recruitPearl({});
            let called = false;
            system.registerHook('layerAdded', () => { called = true; });
            system.addLayer(pearl.pearlId, 'gold-layer');
            expect(called).toBe(true);
        });
    });

    describe('raiseLuster', () => {
        it('should raise luster by default 5', () => {
            const { pearl } = system.recruitPearl({});
            system.raiseLuster(pearl.pearlId);
            expect(pearl.luster).toBe(25);
        });

        it('should raise luster by custom amount', () => {
            const { pearl } = system.recruitPearl({});
            system.raiseLuster(pearl.pearlId, 15);
            expect(pearl.luster).toBe(35);
        });

        it('should reject missing pearl', () => {
            const result = system.raiseLuster('ghost', 5);
            expect(result.error).toBe('PEARL_NOT_FOUND');
        });

        it('should trigger lusterRaised hook', () => {
            const { pearl } = system.recruitPearl({});
            let called = false;
            system.registerHook('lusterRaised', () => { called = true; });
            system.raiseLuster(pearl.pearlId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpPearl', () => {
        it('should increment level', () => {
            const { pearl } = system.recruitPearl({});
            system.levelUpPearl(pearl.pearlId);
            expect(pearl.level).toBe(2);
        });

        it('should reject missing pearl', () => {
            const result = system.levelUpPearl('ghost');
            expect(result.error).toBe('PEARL_NOT_FOUND');
        });

        it('should trigger pearlLeveledUp hook', () => {
            const { pearl } = system.recruitPearl({});
            let called = false;
            system.registerHook('pearlLeveledUp', () => { called = true; });
            system.levelUpPearl(pearl.pearlId);
            expect(called).toBe(true);
        });
    });

    describe('legendPearl', () => {
        it('should set status to legendary', () => {
            const { pearl } = system.recruitPearl({});
            system.legendPearl(pearl.pearlId);
            expect(pearl.status).toBe('legendary');
        });

        it('should reject missing pearl', () => {
            const result = system.legendPearl('ghost');
            expect(result.error).toBe('PEARL_NOT_FOUND');
        });

        it('should trigger pearlLegendized hook', () => {
            const { pearl } = system.recruitPearl({});
            let called = false;
            system.registerHook('pearlLegendized', () => { called = true; });
            system.legendPearl(pearl.pearlId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePearlValue', () => {
        it('should calculate value: level*100 + luster*2 + layers.length*30', () => {
            const { pearl } = system.recruitPearl({});
            pearl.level = 3;
            pearl.luster = 40;
            pearl.layers = ['a', 'b', 'c'];
            // 3*100 + 40*2 + 3*30 = 300 + 80 + 90 = 470
            expect(system.calculatePearlValue(pearl.pearlId)).toBe(470);
        });

        it('should return 0 for missing pearl', () => {
            expect(system.calculatePearlValue('ghost')).toBe(0);
        });

        it('should calculate correctly with default values', () => {
            const { pearl } = system.recruitPearl({});
            // 1*100 + 20*2 + 0*30 = 100 + 40 + 0 = 140
            expect(system.calculatePearlValue(pearl.pearlId)).toBe(140);
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

        it('should execute default getPearl tool', () => {
            const result = system.executeTool('getPearl', { pearlId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('pearlRecruited', () => count++);
            unregister();
            system.recruitPearl({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('pearlRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitPearl({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient pearls', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when totalPearls >= 5', () => {
            system.stats.totalPearls = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPearls = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitPearl({});
            const json = system.toJSON();
            expect(json.pearls.length).toBe(1);
        });
        it('should deserialize from JSON', () => {
            system.recruitPearl({});
            const json = system.toJSON();
            const newSys = new CultivationPearl();
            newSys.fromJSON(json);
            expect(newSys.pearls.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with pearlCount', () => {
            const stats = system.getStats();
            expect(stats.pearlCount).toBe(0);
        });
    });
});
