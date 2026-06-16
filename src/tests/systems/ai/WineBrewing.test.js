/**
 * WineBrewing.test.js - 灵酒酿造系统测试
 * V441 Iteration 3/15 Round 16 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WineBrewing } from '../../../systems/ai/WineBrewing.js';

describe('WineBrewing', () => {
    let system;
    beforeEach(() => { system = new WineBrewing(); });

    describe('brewWine', () => {
        it('should brew', () => {
            const { wine } = system.brewWine({ brewerId: 'b1', base: 'fruit', name: 'Peach Wine' });
            expect(wine.brewerId).toBe('b1');
            expect(wine.base).toBe('fruit');
            expect(wine.name).toBe('Peach Wine');
        });

        it('should trigger wineBrewed hook', () => {
            let called = false;
            system.registerHook('wineBrewed', () => { called = true; });
            system.brewWine({});
            expect(called).toBe(true);
        });
    });

    describe('getWine', () => {
        it('should return', () => {
            const { wine } = system.brewWine({});
            expect(system.getWine(wine.wineId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getWine('ghost')).toBeNull(); });
    });

    describe('listWines', () => {
        it('should list all', () => {
            system.brewWine({});
            system.brewWine({});
            expect(system.listWines().length).toBe(2);
        });
    });

    describe('listByBase', () => {
        it('should filter', () => {
            system.brewWine({ base: 'fruit' });
            system.brewWine({ base: 'grain' });
            system.brewWine({ base: 'herb' });
            expect(system.listByBase('fruit').length).toBe(1);
            expect(system.listByBase('grain').length).toBe(1);
            expect(system.listByBase('herb').length).toBe(1);
        });
    });

    describe('listByBrewer', () => {
        it('should filter', () => {
            system.brewWine({ brewerId: 'b1' });
            system.brewWine({ brewerId: 'b2' });
            expect(system.listByBrewer('b1').length).toBe(1);
        });
    });

    describe('fermentWine', () => {
        it('should ferment', () => {
            const { wine } = system.brewWine({});
            system.fermentWine(wine.wineId, 10);
            expect(wine.alcohol).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.fermentWine('ghost', 10);
            expect(result.error).toBe('WINE_NOT_FOUND');
        });

        it('should trigger wineFermented hook', () => {
            const { wine } = system.brewWine({});
            let called = false;
            system.registerHook('wineFermented', () => { called = true; });
            system.fermentWine(wine.wineId, 10);
            expect(called).toBe(true);
        });
    });

    describe('ageWine', () => {
        it('should age', () => {
            const { wine } = system.brewWine({});
            system.ageWine(wine.wineId, 20);
            expect(wine.age).toBe(20);
            expect(wine.status).toBe('aged');
        });

        it('should reject missing', () => {
            const result = system.ageWine('ghost', 20);
            expect(result.error).toBe('WINE_NOT_FOUND');
        });

        it('should trigger wineAged hook', () => {
            const { wine } = system.brewWine({});
            let called = false;
            system.registerHook('wineAged', () => { called = true; });
            system.ageWine(wine.wineId, 10);
            expect(called).toBe(true);
        });
    });

    describe('serveWine', () => {
        it('should serve', () => {
            const { wine } = system.brewWine({});
            system.serveWine(wine.wineId);
            expect(wine.status).toBe('served');
        });

        it('should reject missing', () => {
            const result = system.serveWine('ghost');
            expect(result.error).toBe('WINE_NOT_FOUND');
        });
    });

    describe('calculateWineQuality', () => {
        it('should calculate', () => {
            const { wine } = system.brewWine({ alcohol: 20, age: 50, aroma: 10 });
            // quality = 20 * (1 + 50/100) + 10 = 20 * 1.5 + 10 = 30 + 10 = 40
            expect(system.calculateWineQuality(wine.wineId)).toBeCloseTo(40, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateWineQuality('ghost')).toBe(0);
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

        it('should execute default getWine', () => {
            const result = system.executeTool('getWine', { wineId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('wineBrewed', () => count++);
            unregister();
            system.brewWine({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('wineBrewed', () => { throw new Error('x'); });
            expect(() => system.brewWine({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalWines = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalWines = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.brewWine({});
            const json = system.toJSON();
            expect(json.wines.length).toBe(1);
        });
        it('should deserialize', () => {
            system.brewWine({});
            const json = system.toJSON();
            const newSys = new WineBrewing();
            newSys.fromJSON(json);
            expect(newSys.wines.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.wineCount).toBe(0);
        });
    });
});
