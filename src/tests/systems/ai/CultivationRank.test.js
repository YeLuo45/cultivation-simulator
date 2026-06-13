/**
 * CultivationRank.test.js - 修真榜系统测试
 * V547 Iteration 10/20 Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationRank } from '../../../systems/ai/CultivationRank.js';

describe('CultivationRank', () => {
    let system;
    beforeEach(() => { system = new CultivationRank(); });

    describe('createRank', () => {
        it('should create', () => {
            const { rank } = system.createRank({ holderId: 'h1', name: 'Sage Monk' });
            expect(rank.holderId).toBe('h1');
            expect(rank.name).toBe('Sage Monk');
        });

        it('should default to combat type', () => {
            const { rank } = system.createRank({});
            expect(rank.type).toBe('combat');
        });

        it('should default to active status', () => {
            const { rank } = system.createRank({});
            expect(rank.status).toBe('active');
        });

        it('should trigger rankCreated hook', () => {
            let called = false;
            system.registerHook('rankCreated', () => { called = true; });
            system.createRank({});
            expect(called).toBe(true);
        });
    });

    describe('getRank', () => {
        it('should return', () => {
            const { rank } = system.createRank({});
            expect(system.getRank(rank.rankId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getRank('ghost')).toBeNull(); });
    });

    describe('listRanks', () => {
        it('should list all', () => {
            system.createRank({});
            system.createRank({});
            expect(system.listRanks().length).toBe(2);
        });
    });

    describe('listByHolder', () => {
        it('should filter', () => {
            system.createRank({ holderId: 'h1' });
            system.createRank({ holderId: 'h2' });
            expect(system.listByHolder('h1').length).toBe(1);
        });
    });

    describe('listActive', () => {
        it('should list only active', () => {
            const { rank: r1 } = system.createRank({});
            system.createRank({});
            system.retireRank(r1.rankId);
            expect(system.listActive().length).toBe(1);
        });
    });

    describe('addAchievement', () => {
        it('should add', () => {
            const { rank } = system.createRank({});
            system.addAchievement(rank.rankId, 'Won Tournament');
            expect(rank.achievements.length).toBe(1);
            expect(rank.achievements[0]).toBe('Won Tournament');
        });

        it('should reject missing', () => {
            const result = system.addAchievement('ghost', 'x');
            expect(result.error).toBe('RANK_NOT_FOUND');
        });

        it('should trigger achievementAdded hook', () => {
            const { rank } = system.createRank({});
            let called = false;
            system.registerHook('achievementAdded', () => { called = true; });
            system.addAchievement(rank.rankId, 'Champion');
            expect(called).toBe(true);
        });
    });

    describe('increaseScore', () => {
        it('should increase', () => {
            const { rank } = system.createRank({});
            system.increaseScore(rank.rankId, 50);
            expect(rank.score).toBe(1050);
        });

        it('should default to amount 5', () => {
            const { rank } = system.createRank({});
            system.increaseScore(rank.rankId);
            expect(rank.score).toBe(1005);
        });

        it('should reject missing', () => {
            const result = system.increaseScore('ghost', 10);
            expect(result.error).toBe('RANK_NOT_FOUND');
        });

        it('should trigger scoreIncreased hook', () => {
            const { rank } = system.createRank({});
            let called = false;
            system.registerHook('scoreIncreased', () => { called = true; });
            system.increaseScore(rank.rankId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpRank', () => {
        it('should level up', () => {
            const { rank } = system.createRank({});
            system.levelUpRank(rank.rankId);
            expect(rank.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpRank('ghost');
            expect(result.error).toBe('RANK_NOT_FOUND');
        });

        it('should trigger rankLeveledUp hook', () => {
            const { rank } = system.createRank({});
            let called = false;
            system.registerHook('rankLeveledUp', () => { called = true; });
            system.levelUpRank(rank.rankId);
            expect(called).toBe(true);
        });
    });

    describe('retireRank', () => {
        it('should retire', () => {
            const { rank } = system.createRank({});
            system.retireRank(rank.rankId);
            expect(rank.status).toBe('retired');
        });

        it('should reject missing', () => {
            const result = system.retireRank('ghost');
            expect(result.error).toBe('RANK_NOT_FOUND');
        });

        it('should trigger rankRetired hook', () => {
            const { rank } = system.createRank({});
            let called = false;
            system.registerHook('rankRetired', () => { called = true; });
            system.retireRank(rank.rankId);
            expect(called).toBe(true);
        });
    });

    describe('calculateRankValue', () => {
        it('should calculate', () => {
            const { rank } = system.createRank({});
            system.addAchievement(rank.rankId, 'a1');
            system.addAchievement(rank.rankId, 'a2');
            system.increaseScore(rank.rankId, 10);
            system.levelUpRank(rank.rankId);
            // level=2*100 + score=1010*2 + achievements=2*30 = 200 + 2020 + 60 = 2280
            expect(system.calculateRankValue(rank.rankId)).toBe(2280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateRankValue('ghost')).toBe(0);
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

        it('should handle undefined context', () => {
            system.registerTool('test', (ctx) => typeof ctx);
            const result = system.executeTool('test', undefined);
            expect(result.result).toBe('object');
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

        it('should execute default getRank', () => {
            const result = system.executeTool('getRank', { rankId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('rankCreated', () => count++);
            unregister();
            system.createRank({});
            expect(count).toBe(0);
        });

        it('should handle double unregister safely', () => {
            let count = 0;
            const unregister = system.registerHook('rankCreated', () => count++);
            unregister();
            unregister();
            system.createRank({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('rankCreated', () => { throw new Error('x'); });
            expect(() => system.createRank({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalRanks = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalRanks = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createRank({});
            const json = system.toJSON();
            expect(json.ranks.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createRank({});
            const json = system.toJSON();
            const newSys = new CultivationRank();
            newSys.fromJSON(json);
            expect(newSys.ranks.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.rankCount).toBe(0);
        });
    });
});
