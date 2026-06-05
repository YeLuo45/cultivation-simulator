/**
 * WeatherSystem.test.js - 天气系统测试
 * V350 Iteration 2/9 Round 8 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WeatherSystem } from '../../../systems/ai/WeatherSystem.js';

describe('WeatherSystem', () => {
    let system;
    beforeEach(() => { system = new WeatherSystem(); });

    describe('registerRegion', () => {
        it('should register', () => {
            const { region } = system.registerRegion({ name: 'R1' });
            expect(region.name).toBe('R1');
        });

        it('should default to clear weather', () => {
            const { region } = system.registerRegion({});
            expect(region.currentWeather).toBe('clear');
        });
    });

    describe('getRegion', () => {
        it('should return', () => {
            const { region } = system.registerRegion({});
            expect(system.getRegion(region.regionId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getRegion('ghost')).toBeNull(); });
    });

    describe('listRegions', () => {
        it('should list all', () => {
            system.registerRegion({});
            expect(system.listRegions().length).toBe(1);
        });
    });

    describe('listByWeather', () => {
        it('should filter', () => {
            const { region: r1 } = system.registerRegion({});
            const { region: r2 } = system.registerRegion({});
            system.setWeather(r1.regionId, 'rainy');
            expect(system.listByWeather('rainy').length).toBe(1);
        });
    });

    describe('setWeather', () => {
        it('should set', () => {
            const { region } = system.registerRegion({});
            const result = system.setWeather(region.regionId, 'rainy', 0.5);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.setWeather('ghost', 'rainy');
            expect(result.error).toBe('REGION_NOT_FOUND');
        });

        it('should cap intensity at 1', () => {
            const { region } = system.registerRegion({});
            system.setWeather(region.regionId, 'rainy', 99);
            expect(region.weatherIntensity).toBe(1);
        });

        it('should trigger weatherChanged hook', () => {
            const { region } = system.registerRegion({});
            let called = false;
            system.registerHook('weatherChanged', () => { called = true; });
            system.setWeather(region.regionId, 'rainy');
            expect(called).toBe(true);
        });
    });

    describe('getWeatherHistory', () => {
        it('should filter by region', () => {
            const { region: r1 } = system.registerRegion({});
            const { region: r2 } = system.registerRegion({});
            system.setWeather(r1.regionId, 'rainy');
            system.setWeather(r2.regionId, 'sunny');
            expect(system.getWeatherHistory(r1.regionId).length).toBe(1);
        });
    });

    describe('randomChange', () => {
        it('should change', () => {
            const { region } = system.registerRegion({});
            const result = system.randomChange(region.regionId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.randomChange('ghost');
            expect(result.error).toBe('REGION_NOT_FOUND');
        });
    });

    describe('calculateEffect', () => {
        it('should calculate for sunny', () => {
            const effect = system.calculateEffect('sunny', 0.5);
            expect(effect.cultivation).toBe(0.05);
        });

        it('should return clear effect for unknown', () => {
            const effect = system.calculateEffect('unknown', 0.5);
            expect(effect.clarity).toBe(0.05);
        });
    });

    describe('listWeatherTypes', () => {
        it('should list all', () => {
            expect(system.listWeatherTypes().length).toBe(8);
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

        it('should execute default getRegion', () => {
            const result = system.executeTool('getRegion', { regionId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('weatherChanged', () => count++);
            unregister();
            const { region } = system.registerRegion({});
            system.setWeather(region.regionId, 'rainy');
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('weatherChanged', () => { throw new Error('x'); });
            const { region } = system.registerRegion({});
            expect(() => system.setWeather(region.regionId, 'rainy')).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalChanges = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalChanges = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerRegion({});
            const json = system.toJSON();
            expect(json.regions.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerRegion({});
            const json = system.toJSON();
            const newSys = new WeatherSystem();
            newSys.fromJSON(json);
            expect(newSys.regions.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.regionCount).toBe(0);
        });
    });
});