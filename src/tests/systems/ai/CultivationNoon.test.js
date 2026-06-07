/**
 * CultivationNoon.test.js - 修真正午测试
 * V819 Iteration 22/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationNoon } from '../../../systems/ai/CultivationNoon.js';

describe('CultivationNoon', () => {
    let system;
    beforeEach(() => { system = new CultivationNoon(); });

    describe('recruitNoon', () => {
        it('should recruit a noon', () => {
            const { noon } = system.recruitNoon({ masterId: 'm1', name: 'Solar Apex', type: 'solar' });
            expect(noon.masterId).toBe('m1');
            expect(noon.name).toBe('Solar Apex');
            expect(noon.type).toBe('solar');
            expect(noon.status).toBe('novice');
            expect(noon.level).toBe(1);
        });

        it('should use defaults when not provided', () => {
            const { noon } = system.recruitNoon({});
            expect(noon.name).toBe('Unnamed Noon');
            expect(noon.type).toBe('midday');
            expect(noon.brightness).toBe(20);
            expect(noon.heats).toEqual([]);
        });

        it('should generate id if not provided', () => {
            const { noon } = system.recruitNoon({});
            expect(noon.noonId).toBeTruthy();
            expect(typeof noon.noonId).toBe('string');
        });

        it('should use provided noonId', () => {
            const { noon } = system.recruitNoon({ noonId: 'custom-noon-1' });
            expect(noon.noonId).toBe('custom-noon-1');
        });

        it('should trigger noonRecruited hook', () => {
            let called = false;
            system.registerHook('noonRecruited', () => { called = true; });
            system.recruitNoon({});
            expect(called).toBe(true);
        });

        it('should increment totalNoons stat', () => {
            expect(system.stats.totalNoons).toBe(0);
            system.recruitNoon({});
            expect(system.stats.totalNoons).toBe(1);
            system.recruitNoon({});
            expect(system.stats.totalNoons).toBe(2);
        });

        it('should accept divine type', () => {
            const { noon } = system.recruitNoon({ type: 'divine' });
            expect(noon.type).toBe('divine');
        });
    });

    describe('getNoon', () => {
        it('should return a noon', () => {
            const { noon } = system.recruitNoon({});
            expect(system.getNoon(noon.noonId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getNoon('ghost')).toBeNull();
        });
    });

    describe('listNoons', () => {
        it('should list all', () => {
            system.recruitNoon({});
            system.recruitNoon({});
            expect(system.listNoons().length).toBe(2);
        });

        it('should return empty list when empty', () => {
            expect(system.listNoons().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitNoon({ masterId: 'm1' });
            system.recruitNoon({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty when no match', () => {
            system.recruitNoon({ masterId: 'm1' });
            expect(system.listByMaster('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { noon: n1 } = system.recruitNoon({});
            system.recruitNoon({});
            system.legendNoon(n1.noonId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendary', () => {
            system.recruitNoon({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addHeat', () => {
        it('should add heat', () => {
            const { noon } = system.recruitNoon({});
            system.addHeat(noon.noonId, 'solar-heat-1');
            expect(noon.heats.length).toBe(1);
            expect(noon.heats[0]).toBe('solar-heat-1');
        });

        it('should reject missing', () => {
            const result = system.addHeat('ghost', 'x');
            expect(result.error).toBe('NOON_NOT_FOUND');
        });

        it('should trigger heatAdded hook', () => {
            const { noon } = system.recruitNoon({});
            let called = false;
            system.registerHook('heatAdded', () => { called = true; });
            system.addHeat(noon.noonId, 'corona-heat');
            expect(called).toBe(true);
        });
    });

    describe('raiseBrightness', () => {
        it('should raise brightness', () => {
            const { noon } = system.recruitNoon({});
            system.raiseBrightness(noon.noonId, 10);
            expect(noon.brightness).toBe(30);
        });

        it('should use default amount of 5', () => {
            const { noon } = system.recruitNoon({});
            system.raiseBrightness(noon.noonId);
            expect(noon.brightness).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseBrightness('ghost', 5);
            expect(result.error).toBe('NOON_NOT_FOUND');
        });

        it('should trigger brightnessRaised hook', () => {
            const { noon } = system.recruitNoon({});
            let called = false;
            system.registerHook('brightnessRaised', () => { called = true; });
            system.raiseBrightness(noon.noonId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpNoon', () => {
        it('should level up', () => {
            const { noon } = system.recruitNoon({});
            system.levelUpNoon(noon.noonId);
            expect(noon.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpNoon('ghost');
            expect(result.error).toBe('NOON_NOT_FOUND');
        });

        it('should trigger noonLeveledUp hook', () => {
            const { noon } = system.recruitNoon({});
            let called = false;
            system.registerHook('noonLeveledUp', () => { called = true; });
            system.levelUpNoon(noon.noonId);
            expect(called).toBe(true);
        });
    });

    describe('legendNoon', () => {
        it('should set status to legendary', () => {
            const { noon } = system.recruitNoon({});
            system.legendNoon(noon.noonId);
            expect(noon.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendNoon('ghost');
            expect(result.error).toBe('NOON_NOT_FOUND');
        });

        it('should trigger noonLegendized hook', () => {
            const { noon } = system.recruitNoon({});
            let called = false;
            system.registerHook('noonLegendized', () => { called = true; });
            system.legendNoon(noon.noonId);
            expect(called).toBe(true);
        });
    });

    describe('calculateNoonValue', () => {
        it('should calculate value', () => {
            const { noon } = system.recruitNoon({});
            system.addHeat(noon.noonId, 'heat-1');
            // level=1, brightness=20 (default baseBrightness), heats=1
            // 1*100 + 20*2 + 1*30 = 100 + 40 + 30 = 170
            expect(system.calculateNoonValue(noon.noonId)).toBe(170);
        });

        it('should reflect level and brightness changes', () => {
            const { noon } = system.recruitNoon({});
            system.levelUpNoon(noon.noonId);
            system.raiseBrightness(noon.noonId, 10);
            // level=2, brightness=30, heats=0
            // 2*100 + 30*2 + 0*30 = 200 + 60 + 0 = 260
            expect(system.calculateNoonValue(noon.noonId)).toBe(260);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateNoonValue('ghost')).toBe(0);
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

        it('should default context to empty object', () => {
            system.registerTool('test', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('test', null);
            expect(result.result).toBe(0);
        });

        it('should execute default getNoon', () => {
            const result = system.executeTool('getNoon', { noonId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitNoon', () => {
            const result = system.executeTool('recruitNoon', { name: 'ToolNoon' });
            expect(result.success).toBe(true);
            expect(result.result.noon.name).toBe('ToolNoon');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('noonRecruited', () => count++);
            unregister();
            system.recruitNoon({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('noonRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitNoon({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalNoons = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalNoons = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitNoon({});
            const json = system.toJSON();
            expect(json.noons.length).toBe(1);
            expect(json.stats.totalNoons).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitNoon({});
            const json = system.toJSON();
            const newSys = new CultivationNoon();
            newSys.fromJSON(json);
            expect(newSys.noons.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.noonCount).toBe(0);
            expect(stats.totalNoons).toBe(0);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
