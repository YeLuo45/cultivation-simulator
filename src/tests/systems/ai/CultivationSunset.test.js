/**
 * CultivationSunset.test.js - 修真日落系统测试
 * V814 Iteration 17/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSunset } from '../../../systems/ai/CultivationSunset.js';

describe('CultivationSunset', () => {
    let system;
    beforeEach(() => { system = new CultivationSunset(); });

    describe('recruitSunset', () => {
        it('should recruit', () => {
            const { sunset } = system.recruitSunset({ masterId: 'm1', name: 'Dusk' });
            expect(sunset.masterId).toBe('m1');
            expect(sunset.name).toBe('Dusk');
        });

        it('should default name to Unnamed Sunset', () => {
            const { sunset } = system.recruitSunset({});
            expect(sunset.name).toBe('Unnamed Sunset');
        });

        it('should default type to golden', () => {
            const { sunset } = system.recruitSunset({});
            expect(sunset.type).toBe('golden');
        });

        it('should initialize level 1', () => {
            const { sunset } = system.recruitSunset({});
            expect(sunset.level).toBe(1);
        });

        it('should initialize status novice', () => {
            const { sunset } = system.recruitSunset({});
            expect(sunset.status).toBe('novice');
        });

        it('should trigger sunsetRecruited hook', () => {
            let called = false;
            system.registerHook('sunsetRecruited', () => { called = true; });
            system.recruitSunset({});
            expect(called).toBe(true);
        });
    });

    describe('getSunset', () => {
        it('should return', () => {
            const { sunset } = system.recruitSunset({});
            expect(system.getSunset(sunset.sunsetId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSunset('ghost')).toBeNull(); });
    });

    describe('listSunsets', () => {
        it('should list all', () => {
            system.recruitSunset({});
            expect(system.listSunsets().length).toBe(1);
        });

        it('should be empty initially', () => {
            expect(system.listSunsets().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitSunset({ masterId: 'm1' });
            system.recruitSunset({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitSunset({ masterId: 'm1' });
            expect(system.listByMaster('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list legendary sunsets', () => {
            const { sunset: s1 } = system.recruitSunset({});
            const { sunset: s2 } = system.recruitSunset({});
            system.legendSunset(s1.sunsetId);
            system.legendSunset(s2.sunsetId);
            expect(system.listLegendary().length).toBe(2);
        });

        it('should return empty when no legendary', () => {
            system.recruitSunset({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addHue', () => {
        it('should add hue', () => {
            const { sunset } = system.recruitSunset({});
            system.addHue(sunset.sunsetId, 'crimson');
            expect(sunset.hues).toContain('crimson');
        });

        it('should reject missing', () => {
            const result = system.addHue('ghost', 'red');
            expect(result.error).toBe('SUNSET_NOT_FOUND');
        });

        it('should trigger hueAdded hook', () => {
            const { sunset } = system.recruitSunset({});
            let called = false;
            system.registerHook('hueAdded', () => { called = true; });
            system.addHue(sunset.sunsetId, 'amber');
            expect(called).toBe(true);
        });
    });

    describe('raiseWarmth', () => {
        it('should raise warmth by 5 default', () => {
            const { sunset } = system.recruitSunset({});
            system.raiseWarmth(sunset.sunsetId);
            expect(sunset.warmth).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { sunset } = system.recruitSunset({});
            system.raiseWarmth(sunset.sunsetId, 30);
            expect(sunset.warmth).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.raiseWarmth('ghost', 10);
            expect(result.error).toBe('SUNSET_NOT_FOUND');
        });

        it('should trigger warmthRaised hook', () => {
            const { sunset } = system.recruitSunset({});
            let called = false;
            system.registerHook('warmthRaised', () => { called = true; });
            system.raiseWarmth(sunset.sunsetId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSunset', () => {
        it('should level up', () => {
            const { sunset } = system.recruitSunset({});
            system.levelUpSunset(sunset.sunsetId);
            expect(sunset.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpSunset('ghost');
            expect(result.error).toBe('SUNSET_NOT_FOUND');
        });

        it('should trigger sunsetLeveledUp hook', () => {
            const { sunset } = system.recruitSunset({});
            let called = false;
            system.registerHook('sunsetLeveledUp', () => { called = true; });
            system.levelUpSunset(sunset.sunsetId);
            expect(called).toBe(true);
        });
    });

    describe('legendSunset', () => {
        it('should set status legendary', () => {
            const { sunset } = system.recruitSunset({});
            system.legendSunset(sunset.sunsetId);
            expect(sunset.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSunset('ghost');
            expect(result.error).toBe('SUNSET_NOT_FOUND');
        });

        it('should trigger sunsetLegendized hook', () => {
            const { sunset } = system.recruitSunset({});
            let called = false;
            system.registerHook('sunsetLegendized', () => { called = true; });
            system.legendSunset(sunset.sunsetId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSunsetValue', () => {
        it('should calculate', () => {
            const { sunset } = system.recruitSunset({});
            system.levelUpSunset(sunset.sunsetId);
            system.addHue(sunset.sunsetId, 'crimson');
            system.addHue(sunset.sunsetId, 'amber');
            // level=2 => 200, warmth=20 => 40, hues=2 => 60, total=300
            expect(system.calculateSunsetValue(sunset.sunsetId)).toBe(300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSunsetValue('ghost')).toBe(0);
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

        it('should execute default getSunset', () => {
            const result = system.executeTool('getSunset', { sunsetId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitSunset', () => {
            const result = system.executeTool('recruitSunset', { masterId: 'mX' });
            expect(result.success).toBe(true);
            expect(result.result.sunset.masterId).toBe('mX');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('sunsetRecruited', () => count++);
            unregister();
            system.recruitSunset({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('sunsetRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSunset({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSunsets = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(system.config.maxSunsets).toBe(50);
        });
        it('should not double evolve', () => {
            system.stats.totalSunsets = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSunset({});
            const json = system.toJSON();
            expect(json.sunsets.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSunset({});
            const json = system.toJSON();
            const newSys = new CultivationSunset();
            newSys.fromJSON(json);
            expect(newSys.sunsets.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.sunsetCount).toBe(0);
            expect(stats.totalSunsets).toBe(0);
        });
    });
});
