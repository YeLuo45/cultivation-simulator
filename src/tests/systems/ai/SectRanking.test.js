/**
 * SectRanking.test.js - 宗门排行系统测试
 * V462 Iteration 9/15 Round 17 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectRanking } from '../../../systems/ai/SectRanking.js';

describe('SectRanking', () => {
    let system;
    beforeEach(() => { system = new SectRanking(); });

    describe('constructor', () => {
        it('should initialize with defaults', () => {
            expect(system.config.maxRankings).toBe(200);
            expect(system.config.baseScore).toBe(1000);
        });

        it('should accept custom config', () => {
            const s = new SectRanking({ maxRankings: 50, baseScore: 500 });
            expect(s.config.maxRankings).toBe(50);
            expect(s.config.baseScore).toBe(500);
        });
    });

    describe('registerRanking', () => {
        it('should register', () => {
            const { ranking } = system.registerRanking({ sectId: 's1' });
            expect(ranking.sectId).toBe('s1');
        });

        it('should set defaults', () => {
            const { ranking } = system.registerRanking({ sectId: 's1' });
            expect(ranking.rank).toBe(1);
            expect(ranking.score).toBe(1000);
            expect(ranking.achievements).toEqual([]);
            expect(ranking.victories).toBe(0);
            expect(ranking.status).toBe('stable');
        });

        it('should accept custom score', () => {
            const { ranking } = system.registerRanking({ sectId: 's1', score: 2000 });
            expect(ranking.score).toBe(2000);
        });

        it('should trigger rankingRegistered hook', () => {
            let called = false;
            system.registerHook('rankingRegistered', () => { called = true; });
            system.registerRanking({});
            expect(called).toBe(true);
        });

        it('should increment totalRankings', () => {
            system.registerRanking({});
            expect(system.stats.totalRankings).toBe(1);
        });
    });

    describe('getRanking', () => {
        it('should return', () => {
            const { ranking } = system.registerRanking({});
            expect(system.getRanking(ranking.rankingId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getRanking('ghost')).toBeNull(); });
    });

    describe('listRankings', () => {
        it('should list all', () => {
            system.registerRanking({});
            system.registerRanking({});
            expect(system.listRankings().length).toBe(2);
        });

        it('should return empty array when none', () => {
            expect(system.listRankings()).toEqual([]);
        });
    });

    describe('listBySect', () => {
        it('should filter by sect', () => {
            system.registerRanking({ sectId: 's1' });
            system.registerRanking({ sectId: 's2' });
            system.registerRanking({ sectId: 's1' });
            expect(system.listBySect('s1').length).toBe(2);
        });

        it('should return empty for unknown sect', () => {
            system.registerRanking({ sectId: 's1' });
            expect(system.listBySect('s9')).toEqual([]);
        });
    });

    describe('listTop', () => {
        it('should return top n by score', () => {
            const r1 = system.registerRanking({ sectId: 's1', score: 500 });
            const r2 = system.registerRanking({ sectId: 's2', score: 2000 });
            const r3 = system.registerRanking({ sectId: 's3', score: 1000 });
            const top = system.listTop(2);
            expect(top.length).toBe(2);
            expect(top[0].score).toBe(2000);
        });

        it('should use default n=10', () => {
            for (let i = 0; i < 12; i++) system.registerRanking({ score: i * 100 });
            expect(system.listTop().length).toBe(10);
        });

        it('should return all if fewer than n', () => {
            system.registerRanking({});
            system.registerRanking({});
            expect(system.listTop(10).length).toBe(2);
        });
    });

    describe('listRising', () => {
        it('should filter rising', () => {
            const r1 = system.registerRanking({ sectId: 's1' }).ranking;
            system.registerRanking({ sectId: 's2' });
            system.gainScore(r1.rankingId);
            expect(system.listRising().length).toBe(1);
        });

        it('should return empty when none rising', () => {
            system.registerRanking({});
            expect(system.listRising()).toEqual([]);
        });
    });

    describe('gainScore', () => {
        it('should gain score', () => {
            const { ranking } = system.registerRanking({});
            system.gainScore(ranking.rankingId, 50);
            expect(ranking.score).toBe(1050);
        });

        it('should use default amount', () => {
            const { ranking } = system.registerRanking({});
            system.gainScore(ranking.rankingId);
            expect(ranking.score).toBe(1010);
        });

        it('should set status to rising', () => {
            const { ranking } = system.registerRanking({});
            system.gainScore(ranking.rankingId);
            expect(ranking.status).toBe('rising');
        });

        it('should reject missing', () => {
            const result = system.gainScore('ghost', 10);
            expect(result.error).toBe('RANKING_NOT_FOUND');
        });

        it('should trigger scoreGained hook', () => {
            const { ranking } = system.registerRanking({});
            let called = false;
            system.registerHook('scoreGained', () => { called = true; });
            system.gainScore(ranking.rankingId, 10);
            expect(called).toBe(true);
        });

        it('should recompute ranks', () => {
            const r1 = system.registerRanking({ sectId: 's1' }).ranking;
            const r2 = system.registerRanking({ sectId: 's2' }).ranking;
            system.gainScore(r2.rankingId, 500);
            expect(r2.rank).toBe(1);
            expect(r1.rank).toBe(2);
        });
    });

    describe('addAchievement', () => {
        it('should add achievement', () => {
            const { ranking } = system.registerRanking({});
            system.addAchievement(ranking.rankingId, 'first-blood');
            expect(ranking.achievements).toContain('first-blood');
        });

        it('should support multiple achievements', () => {
            const { ranking } = system.registerRanking({});
            system.addAchievement(ranking.rankingId, 'a1');
            system.addAchievement(ranking.rankingId, 'a2');
            expect(ranking.achievements.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addAchievement('ghost', 'x');
            expect(result.error).toBe('RANKING_NOT_FOUND');
        });

        it('should trigger achievementAdded hook', () => {
            const { ranking } = system.registerRanking({});
            let called = false;
            system.registerHook('achievementAdded', () => { called = true; });
            system.addAchievement(ranking.rankingId, 'a1');
            expect(called).toBe(true);
        });
    });

    describe('declareVictory', () => {
        it('should declare victory', () => {
            const { ranking } = system.registerRanking({});
            system.declareVictory(ranking.rankingId, 3);
            expect(ranking.victories).toBe(3);
        });

        it('should use default amount', () => {
            const { ranking } = system.registerRanking({});
            system.declareVictory(ranking.rankingId);
            expect(ranking.victories).toBe(5);
        });

        it('should set status to rising', () => {
            const { ranking } = system.registerRanking({});
            system.declareVictory(ranking.rankingId);
            expect(ranking.status).toBe('rising');
        });

        it('should reject missing', () => {
            const result = system.declareVictory('ghost', 1);
            expect(result.error).toBe('RANKING_NOT_FOUND');
        });

        it('should trigger victoryDeclared hook', () => {
            const { ranking } = system.registerRanking({});
            let called = false;
            system.registerHook('victoryDeclared', () => { called = true; });
            system.declareVictory(ranking.rankingId, 1);
            expect(called).toBe(true);
        });
    });

    describe('calculateRankScore', () => {
        it('should calculate base score', () => {
            const { ranking } = system.registerRanking({});
            expect(system.calculateRankScore(ranking.rankingId)).toBe(1000);
        });

        it('should add achievements weight', () => {
            const { ranking } = system.registerRanking({});
            system.addAchievement(ranking.rankingId, 'a1');
            system.addAchievement(ranking.rankingId, 'a2');
            expect(system.calculateRankScore(ranking.rankingId)).toBe(1100);
        });

        it('should add victories weight', () => {
            const { ranking } = system.registerRanking({});
            system.declareVictory(ranking.rankingId, 2);
            expect(system.calculateRankScore(ranking.rankingId)).toBe(1060);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateRankScore('ghost')).toBe(0);
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
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should list default tools', () => {
            const tools = system.listTools();
            expect(tools).toContain('getRanking');
            expect(tools).toContain('registerRanking');
        });

        it('should execute default getRanking', () => {
            const result = system.executeTool('getRanking', { rankingId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('rankingRegistered', () => count++);
            unregister();
            system.registerRanking({});
            expect(count).toBe(0);
        });

        it('should handle hook errors silently', () => {
            system.registerHook('rankingRegistered', () => { throw new Error('x'); });
            expect(() => system.registerRanking({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalRankings = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(system.config.maxRankings).toBe(230);
        });
        it('should not double evolve', () => {
            system.stats.totalRankings = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerRanking({});
            const json = system.toJSON();
            expect(json.rankings.length).toBe(1);
            expect(json.stats.totalRankings).toBe(1);
        });
        it('should deserialize', () => {
            system.registerRanking({});
            const json = system.toJSON();
            const newSys = new SectRanking();
            newSys.fromJSON(json);
            expect(newSys.rankings.size).toBe(1);
        });

        it('should handle partial deserialize', () => {
            const newSys = new SectRanking();
            newSys.fromJSON({});
            expect(newSys.rankings.size).toBe(0);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.registerRanking({});
            const stats = system.getStats();
            expect(stats.rankingCount).toBe(1);
            expect(stats.totalRankings).toBe(1);
        });
    });
});
