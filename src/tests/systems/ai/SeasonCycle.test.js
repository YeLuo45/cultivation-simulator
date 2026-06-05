/**
 * SeasonCycle.test.js - 季节循环测试
 * V351 Iteration 3/9 Round 8 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SeasonCycle } from '../../../systems/ai/SeasonCycle.js';

describe('SeasonCycle', () => {
    let system;
    beforeEach(() => { system = new SeasonCycle(); });

    describe('listSeasons', () => {
        it('should list all', () => { expect(system.listSeasons().length).toBe(4); });
    });

    describe('getCurrentSeason', () => {
        it('should return', () => { expect(system.getCurrentSeason()).toBe('spring'); });
    });

    describe('advanceSeason', () => {
        it('should advance to summer', () => {
            const result = system.advanceSeason();
            expect(result.to).toBe('summer');
        });

        it('should wrap around from winter', () => {
            system.currentSeason = 'winter';
            const result = system.advanceSeason();
            expect(result.to).toBe('spring');
        });

        it('should trigger seasonChanged hook', () => {
            let called = false;
            system.registerHook('seasonChanged', () => { called = true; });
            system.advanceSeason();
            expect(called).toBe(true);
        });

        it('should increment totalChanges', () => {
            system.advanceSeason();
            expect(system.stats.totalChanges).toBe(1);
        });
    });

    describe('setRegionSeason', () => {
        it('should set', () => {
            const result = system.setRegionSeason('r1', 'summer');
            expect(result.success).toBe(true);
        });

        it('should reject invalid', () => {
            const result = system.setRegionSeason('r1', 'invalid');
            expect(result.error).toBe('INVALID_SEASON');
        });
    });

    describe('getRegionSeason', () => {
        it('should return region', () => {
            system.setRegionSeason('r1', 'summer');
            expect(system.getRegionSeason('r1')).toBe('summer');
        });

        it('should return global when no region', () => {
            expect(system.getRegionSeason('ghost')).toBe('spring');
        });
    });

    describe('getSeasonLog', () => {
        it('should return log', () => {
            system.advanceSeason();
            expect(system.getSeasonLog().length).toBe(1);
        });
    });

    describe('getSeasonEffect', () => {
        it('should return for spring', () => {
            const effect = system.getSeasonEffect('spring');
            expect(effect.growth).toBe(0.2);
        });

        it('should return empty for unknown', () => {
            const effect = system.getSeasonEffect('unknown');
            expect(Object.keys(effect).length).toBe(0);
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

        it('should execute default getSeason', () => {
            const result = system.executeTool('getSeason', {});
            expect(result.result).toBe('spring');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('seasonChanged', () => count++);
            unregister();
            system.advanceSeason();
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('seasonChanged', () => { throw new Error('x'); });
            expect(() => system.advanceSeason()).not.toThrow();
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
            system.advanceSeason();
            const json = system.toJSON();
            expect(json.seasonLog.length).toBe(1);
        });
        it('should deserialize', () => {
            system.advanceSeason();
            const json = system.toJSON();
            const newSys = new SeasonCycle();
            newSys.fromJSON(json);
            expect(newSys.seasonLog.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.currentSeason).toBe('spring');
        });
    });
});