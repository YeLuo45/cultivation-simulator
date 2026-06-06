/**
 * Astrology.test.js - 占星系统测试
 * V428 Iteration 5/15 Round 15 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Astrology } from '../../../systems/ai/Astrology.js';

describe('Astrology', () => {
    let system;
    beforeEach(() => { system = new Astrology(); });

    describe('castChart', () => {
        it('should cast chart', () => {
            const { chart } = system.castChart({ cultivatorId: 'c1' });
            expect(chart.cultivatorId).toBe('c1');
            expect(chart.status).toBe('cast');
        });

        it('should use default sun and moon', () => {
            const { chart } = system.castChart({});
            expect(chart.sun).toBe('Sun');
            expect(chart.moon).toBe('Moon');
        });

        it('should use baseStars by default', () => {
            const { chart } = system.castChart({});
            expect(chart.stars).toBe(108);
        });

        it('should accept custom stars', () => {
            const { chart } = system.castChart({ stars: 200 });
            expect(chart.stars).toBe(200);
        });

        it('should trigger chartCast hook', () => {
            let called = false;
            system.registerHook('chartCast', () => { called = true; });
            system.castChart({});
            expect(called).toBe(true);
        });
    });

    describe('getChart', () => {
        it('should return chart', () => {
            const { chart } = system.castChart({});
            expect(system.getChart(chart.chartId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getChart('ghost')).toBeNull(); });
    });

    describe('listCharts', () => {
        it('should list all', () => {
            system.castChart({});
            system.castChart({});
            expect(system.listCharts().length).toBe(2);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.castChart({ cultivatorId: 'c1' });
            system.castChart({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('addPlanet', () => {
        it('should add planet', () => {
            const { chart } = system.castChart({});
            system.addPlanet(chart.chartId, 'Mars');
            expect(chart.planets).toContain('Mars');
        });

        it('should trigger planetAdded hook', () => {
            const { chart } = system.castChart({});
            let called = false;
            system.registerHook('planetAdded', () => { called = true; });
            system.addPlanet(chart.chartId, 'Venus');
            expect(called).toBe(true);
        });

        it('should reject missing chart', () => {
            const result = system.addPlanet('ghost', 'Mars');
            expect(result.error).toBe('CHART_NOT_FOUND');
        });
    });

    describe('calculateAspects', () => {
        it('should calculate aspects', () => {
            const { chart } = system.castChart({});
            system.addPlanet(chart.chartId, 'Mars');
            system.addPlanet(chart.chartId, 'Venus');
            const result = system.calculateAspects(chart.chartId);
            expect(result.aspects.length).toBe(1);
        });

        it('should trigger aspectsCalculated hook', () => {
            const { chart } = system.castChart({});
            system.addPlanet(chart.chartId, 'Mars');
            system.addPlanet(chart.chartId, 'Venus');
            let called = false;
            system.registerHook('aspectsCalculated', () => { called = true; });
            system.calculateAspects(chart.chartId);
            expect(called).toBe(true);
        });

        it('should reject missing chart', () => {
            const result = system.calculateAspects('ghost');
            expect(result.error).toBe('CHART_NOT_FOUND');
        });
    });

    describe('interpretChart', () => {
        it('should set status to interpreted', () => {
            const { chart } = system.castChart({});
            system.interpretChart(chart.chartId);
            expect(chart.status).toBe('interpreted');
        });

        it('should trigger chartInterpreted hook', () => {
            const { chart } = system.castChart({});
            let called = false;
            system.registerHook('chartInterpreted', () => { called = true; });
            system.interpretChart(chart.chartId);
            expect(called).toBe(true);
        });

        it('should reject missing chart', () => {
            const result = system.interpretChart('ghost');
            expect(result.error).toBe('CHART_NOT_FOUND');
        });
    });

    describe('calculateCelestialPower', () => {
        it('should calculate', () => {
            const { chart } = system.castChart({});
            system.addPlanet(chart.chartId, 'Mars');
            system.addPlanet(chart.chartId, 'Venus');
            system.calculateAspects(chart.chartId);
            // stars*2 + planets.length*5 + aspects.length*3 = 108*2 + 2*5 + 1*3 = 216+10+3 = 229
            expect(system.calculateCelestialPower(chart.chartId)).toBe(229);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCelestialPower('ghost')).toBe(0);
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

        it('should execute default getChart', () => {
            const result = system.executeTool('getChart', { chartId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('chartCast', () => count++);
            unregister();
            system.castChart({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('chartCast', () => { throw new Error('x'); });
            expect(() => system.castChart({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCharts = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCharts = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.castChart({});
            const json = system.toJSON();
            expect(json.charts.length).toBe(1);
        });
        it('should deserialize', () => {
            system.castChart({});
            const json = system.toJSON();
            const newSys = new Astrology();
            newSys.fromJSON(json);
            expect(newSys.charts.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.chartCount).toBe(0);
        });
    });
});
