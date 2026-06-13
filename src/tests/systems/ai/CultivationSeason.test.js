/**
 * CultivationSeason.test.js - 修真季系统测试
 * V582 Iteration 5/20 Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSeason } from '../../../systems/ai/CultivationSeason.js';

describe('CultivationSeason', () => {
    let system;
    beforeEach(() => { system = new CultivationSeason(); });

    describe('openSeason', () => {
        it('should create season', () => {
            const { season } = system.openSeason({ recorderId: 'r1', name: 'Spring Bloom', type: 'spring' });
            expect(season.recorderId).toBe('r1');
            expect(season.name).toBe('Spring Bloom');
            expect(season.type).toBe('spring');
        });

        it('should set default values', () => {
            const { season } = system.openSeason({});
            expect(season.type).toBe('spring');
            expect(season.vitality).toBe(20);
            expect(season.level).toBe(1);
            expect(season.status).toBe('approaching');
            expect(season.blooms).toEqual([]);
        });

        it('should use provided id', () => {
            const { season } = system.openSeason({ id: 'my-id' });
            expect(season.seasonId).toBe('my-id');
        });

        it('should trigger seasonOpened hook', () => {
            let called = false;
            system.registerHook('seasonOpened', () => { called = true; });
            system.openSeason({});
            expect(called).toBe(true);
        });

        it('should increment totalSeasons stat', () => {
            system.openSeason({});
            expect(system.stats.totalSeasons).toBe(1);
        });
    });

    describe('getSeason', () => {
        it('should return season', () => {
            const { season } = system.openSeason({});
            expect(system.getSeason(season.seasonId)).not.toBeNull();
        });

        it('should return null for missing', () => { expect(system.getSeason('ghost')).toBeNull(); });

        it('should return a copy', () => {
            const { season } = system.openSeason({});
            const s = system.getSeason(season.seasonId);
            s.name = 'changed';
            expect(system.seasons.get(season.seasonId).name).not.toBe('changed');
        });
    });

    describe('listSeasons', () => {
        it('should list all', () => {
            system.openSeason({});
            system.openSeason({});
            expect(system.listSeasons().length).toBe(2);
        });

        it('should return empty when no seasons', () => {
            expect(system.listSeasons().length).toBe(0);
        });
    });

    describe('listByRecorder', () => {
        it('should filter by recorder', () => {
            system.openSeason({ recorderId: 'r1' });
            system.openSeason({ recorderId: 'r2' });
            system.openSeason({ recorderId: 'r1' });
            expect(system.listByRecorder('r1').length).toBe(2);
        });

        it('should return empty for unknown recorder', () => {
            system.openSeason({ recorderId: 'r1' });
            expect(system.listByRecorder('unknown').length).toBe(0);
        });
    });

    describe('listActive', () => {
        it('should filter active', () => {
            const { season } = system.openSeason({});
            system.addBloom(season.seasonId, 'rose');
            expect(system.listActive().length).toBe(1);
        });

        it('should not include approaching', () => {
            system.openSeason({});
            expect(system.listActive().length).toBe(0);
        });
    });

    describe('addBloom', () => {
        it('should add bloom', () => {
            const { season } = system.openSeason({});
            const { bloom } = system.addBloom(season.seasonId, 'Peach Blossom');
            expect(bloom.name).toBe('Peach Blossom');
            expect(season.blooms.length).toBe(1);
        });

        it('should reject missing season', () => {
            const result = system.addBloom('ghost', 'rose');
            expect(result.error).toBe('SEASON_NOT_FOUND');
        });

        it('should transition to active', () => {
            const { season } = system.openSeason({});
            system.addBloom(season.seasonId, 'rose');
            expect(season.status).toBe('active');
        });

        it('should trigger bloomAdded hook', () => {
            const { season } = system.openSeason({});
            let called = false;
            system.registerHook('bloomAdded', () => { called = true; });
            system.addBloom(season.seasonId, 'rose');
            expect(called).toBe(true);
        });
    });

    describe('increaseVitality', () => {
        it('should increase vitality', () => {
            const { season } = system.openSeason({});
            system.increaseVitality(season.seasonId, 10);
            expect(season.vitality).toBe(30);
        });

        it('should use default amount', () => {
            const { season } = system.openSeason({});
            system.increaseVitality(season.seasonId);
            expect(season.vitality).toBe(25);
        });

        it('should reject missing season', () => {
            const result = system.increaseVitality('ghost', 5);
            expect(result.error).toBe('SEASON_NOT_FOUND');
        });

        it('should trigger vitalityIncreased hook', () => {
            const { season } = system.openSeason({});
            let called = false;
            system.registerHook('vitalityIncreased', () => { called = true; });
            system.increaseVitality(season.seasonId, 5);
            expect(called).toBe(true);
        });

        it('should transition to active', () => {
            const { season } = system.openSeason({});
            system.increaseVitality(season.seasonId, 5);
            expect(season.status).toBe('active');
        });
    });

    describe('levelUpSeason', () => {
        it('should level up', () => {
            const { season } = system.openSeason({});
            system.levelUpSeason(season.seasonId);
            expect(season.level).toBe(2);
        });

        it('should reject missing season', () => {
            const result = system.levelUpSeason('ghost');
            expect(result.error).toBe('SEASON_NOT_FOUND');
        });

        it('should trigger seasonLeveledUp hook', () => {
            const { season } = system.openSeason({});
            let called = false;
            system.registerHook('seasonLeveledUp', () => { called = true; });
            system.levelUpSeason(season.seasonId);
            expect(called).toBe(true);
        });
    });

    describe('retireSeason', () => {
        it('should set status to ending', () => {
            const { season } = system.openSeason({});
            system.retireSeason(season.seasonId);
            expect(season.status).toBe('ending');
        });

        it('should reject missing season', () => {
            const result = system.retireSeason('ghost');
            expect(result.error).toBe('SEASON_NOT_FOUND');
        });

        it('should trigger seasonRetired hook', () => {
            const { season } = system.openSeason({});
            let called = false;
            system.registerHook('seasonRetired', () => { called = true; });
            system.retireSeason(season.seasonId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSeasonValue', () => {
        it('should calculate value', () => {
            const { season } = system.openSeason({});
            system.addBloom(season.seasonId, 'b1');
            system.addBloom(season.seasonId, 'b2');
            system.levelUpSeason(season.seasonId);
            // level=2, vitality=20, blooms=2 → 2*100 + 20*2 + 2*30 = 200 + 40 + 60 = 300
            expect(system.calculateSeasonValue(season.seasonId)).toBe(300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSeasonValue('ghost')).toBe(0);
        });

        it('should calculate base value with defaults', () => {
            const { season } = system.openSeason({});
            // level=1, vitality=20, blooms=0 → 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateSeasonValue(season.seasonId)).toBe(140);
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

        it('should handle tool errors', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('x');
        });

        it('should execute default getSeason', () => {
            const result = system.executeTool('getSeason', { seasonId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('seasonOpened', () => count++);
            unregister();
            system.openSeason({});
            expect(count).toBe(0);
        });

        it('should handle hook errors silently', () => {
            system.registerHook('seasonOpened', () => { throw new Error('x'); });
            expect(() => system.openSeason({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient seasons', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalSeasons = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalSeasons = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openSeason({});
            const json = system.toJSON();
            expect(json.seasons.length).toBe(1);
        });

        it('should deserialize', () => {
            system.openSeason({});
            const json = system.toJSON();
            const newSys = new CultivationSeason();
            newSys.fromJSON(json);
            expect(newSys.seasons.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.seasonCount).toBe(0);
        });
    });
});
