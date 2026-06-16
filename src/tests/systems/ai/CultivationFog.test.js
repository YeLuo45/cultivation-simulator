/**
 * CultivationFog.test.js - 修真霾测试
 * V805 Iteration 8/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationFog } from '../../../systems/ai/CultivationFog.js';

describe('CultivationFog', () => {
    let system;
    beforeEach(() => { system = new CultivationFog(); });

    describe('recruitFog', () => {
        it('should create a fog', () => {
            const { fog } = system.recruitFog({ name: 'Shadow Fog' });
            expect(fog.name).toBe('Shadow Fog');
        });

        it('should default type to thick', () => {
            const { fog } = system.recruitFog({});
            expect(fog.type).toBe('thick');
        });

        it('should default opacity to baseOpacity (20)', () => {
            const { fog } = system.recruitFog({});
            expect(fog.opacity).toBe(20);
        });

        it('should default status to novice', () => {
            const { fog } = system.recruitFog({});
            expect(fog.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { fog } = system.recruitFog({});
            expect(fog.level).toBe(1);
        });

        it('should default veils to empty array', () => {
            const { fog } = system.recruitFog({});
            expect(fog.veils).toEqual([]);
        });

        it('should default masterId to unknown', () => {
            const { fog } = system.recruitFog({});
            expect(fog.masterId).toBe('unknown');
        });

        it('should trigger fogRecruited hook', () => {
            let called = false;
            system.registerHook('fogRecruited', () => { called = true; });
            system.recruitFog({});
            expect(called).toBe(true);
        });

        it('should increment totalFogs stat', () => {
            system.recruitFog({});
            expect(system.stats.totalFogs).toBe(1);
        });

        it('should accept custom type and opacity', () => {
            const { fog } = system.recruitFog({ type: 'arcane', opacity: 80 });
            expect(fog.type).toBe('arcane');
            expect(fog.opacity).toBe(80);
        });
    });

    describe('getFog', () => {
        it('should return fog by id', () => {
            const { fog } = system.recruitFog({});
            expect(system.getFog(fog.fogId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getFog('ghost')).toBeNull(); });
    });

    describe('listFogs', () => {
        it('should list all fogs', () => {
            system.recruitFog({});
            system.recruitFog({});
            expect(system.listFogs().length).toBe(2);
        });
        it('should return empty list when no fogs', () => {
            expect(system.listFogs().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by masterId', () => {
            system.recruitFog({ masterId: 'm1' });
            system.recruitFog({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary fogs', () => {
            system.recruitFog({});
            const { fog } = system.recruitFog({});
            system.legendFog(fog.fogId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none are legendary', () => {
            system.recruitFog({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addVeil', () => {
        it('should add a veil to the array', () => {
            const { fog } = system.recruitFog({});
            system.addVeil(fog.fogId, 'mist-veil');
            expect(fog.veils.length).toBe(1);
            expect(fog.veils[0]).toBe('mist-veil');
        });

        it('should reject missing fog', () => {
            const result = system.addVeil('ghost', 'veil');
            expect(result.error).toBe('FOG_NOT_FOUND');
        });

        it('should trigger veilAdded hook', () => {
            const { fog } = system.recruitFog({});
            let called = false;
            system.registerHook('veilAdded', () => { called = true; });
            system.addVeil(fog.fogId, 'dark-veil');
            expect(called).toBe(true);
        });
    });

    describe('raiseOpacity', () => {
        it('should raise opacity by default 5', () => {
            const { fog } = system.recruitFog({});
            system.raiseOpacity(fog.fogId);
            expect(fog.opacity).toBe(25);
        });

        it('should raise opacity by custom amount', () => {
            const { fog } = system.recruitFog({});
            system.raiseOpacity(fog.fogId, 10);
            expect(fog.opacity).toBe(30);
        });

        it('should reject missing fog', () => {
            const result = system.raiseOpacity('ghost', 5);
            expect(result.error).toBe('FOG_NOT_FOUND');
        });

        it('should trigger opacityRaised hook', () => {
            const { fog } = system.recruitFog({});
            let called = false;
            system.registerHook('opacityRaised', () => { called = true; });
            system.raiseOpacity(fog.fogId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpFog', () => {
        it('should increment level', () => {
            const { fog } = system.recruitFog({});
            system.levelUpFog(fog.fogId);
            expect(fog.level).toBe(2);
        });

        it('should reject missing fog', () => {
            const result = system.levelUpFog('ghost');
            expect(result.error).toBe('FOG_NOT_FOUND');
        });

        it('should trigger fogLeveledUp hook', () => {
            const { fog } = system.recruitFog({});
            let called = false;
            system.registerHook('fogLeveledUp', () => { called = true; });
            system.levelUpFog(fog.fogId);
            expect(called).toBe(true);
        });
    });

    describe('legendFog', () => {
        it('should set status to legendary', () => {
            const { fog } = system.recruitFog({});
            system.legendFog(fog.fogId);
            expect(fog.status).toBe('legendary');
        });

        it('should reject missing fog', () => {
            const result = system.legendFog('ghost');
            expect(result.error).toBe('FOG_NOT_FOUND');
        });

        it('should trigger fogLegendized hook', () => {
            const { fog } = system.recruitFog({});
            let called = false;
            system.registerHook('fogLegendized', () => { called = true; });
            system.legendFog(fog.fogId);
            expect(called).toBe(true);
        });
    });

    describe('calculateFogValue', () => {
        it('should calculate value: level*100 + opacity*2 + veils.length*30', () => {
            const { fog } = system.recruitFog({});
            fog.level = 2;
            fog.opacity = 30;
            fog.veils = ['a', 'b'];
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateFogValue(fog.fogId)).toBe(320);
        });

        it('should return 0 for missing fog', () => {
            expect(system.calculateFogValue('ghost')).toBe(0);
        });

        it('should calculate correctly with default values', () => {
            const { fog } = system.recruitFog({});
            // 1*100 + 20*2 + 0*30 = 100 + 40 + 0 = 140
            expect(system.calculateFogValue(fog.fogId)).toBe(140);
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

        it('should execute default getFog tool', () => {
            const result = system.executeTool('getFog', { fogId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('fogRecruited', () => count++);
            unregister();
            system.recruitFog({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('fogRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitFog({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient fogs', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when totalFogs >= 5', () => {
            system.stats.totalFogs = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalFogs = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitFog({});
            const json = system.toJSON();
            expect(json.fogs.length).toBe(1);
        });
        it('should deserialize from JSON', () => {
            system.recruitFog({});
            const json = system.toJSON();
            const newSys = new CultivationFog();
            newSys.fromJSON(json);
            expect(newSys.fogs.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with fogCount', () => {
            const stats = system.getStats();
            expect(stats.fogCount).toBe(0);
        });
    });
});
