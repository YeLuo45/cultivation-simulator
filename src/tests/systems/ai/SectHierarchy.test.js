/**
 * SectHierarchy.test.js - 宗门等级系统测试
 * V490 Iteration 7/15 Round 19 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectHierarchy } from '../../../systems/ai/SectHierarchy.js';

describe('SectHierarchy', () => {
    let system;
    beforeEach(() => { system = new SectHierarchy(); });

    describe('defineRank', () => {
        it('should define rank', () => {
            const { rank } = system.defineRank({ sectId: 's1', name: 'Elder' });
            expect(rank.sectId).toBe('s1');
            expect(rank.name).toBe('Elder');
        });

        it('should default name to Unnamed Rank', () => {
            const { rank } = system.defineRank({});
            expect(rank.name).toBe('Unnamed Rank');
        });

        it('should default level from baseLevel', () => {
            const { rank } = system.defineRank({});
            expect(rank.level).toBe(1);
        });

        it('should accept custom level', () => {
            const { rank } = system.defineRank({ level: 5 });
            expect(rank.level).toBe(5);
        });

        it('should initialize requirements to empty array', () => {
            const { rank } = system.defineRank({});
            expect(rank.requirements).toEqual([]);
        });

        it('should initialize members to empty array', () => {
            const { rank } = system.defineRank({});
            expect(rank.members).toEqual([]);
        });

        it('should set status to active', () => {
            const { rank } = system.defineRank({});
            expect(rank.status).toBe('active');
        });

        it('should accept custom requirements', () => {
            const { rank } = system.defineRank({ requirements: ['qi_refining', 'dao_heart'] });
            expect(rank.requirements).toEqual(['qi_refining', 'dao_heart']);
        });

        it('should accept custom members', () => {
            const { rank } = system.defineRank({ members: ['m1', 'm2'] });
            expect(rank.members).toEqual(['m1', 'm2']);
        });

        it('should accept custom rankId', () => {
            const { rank } = system.defineRank({ rankId: 'rnk_custom_1' });
            expect(rank.rankId).toBe('rnk_custom_1');
        });

        it('should trigger rankDefined hook', () => {
            let called = false;
            system.registerHook('rankDefined', () => { called = true; });
            system.defineRank({});
            expect(called).toBe(true);
        });
    });

    describe('getRank', () => {
        it('should return rank', () => {
            const { rank } = system.defineRank({});
            expect(system.getRank(rank.rankId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getRank('ghost')).toBeNull();
        });
    });

    describe('listRanks', () => {
        it('should list all', () => {
            system.defineRank({});
            system.defineRank({});
            expect(system.listRanks().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listRanks().length).toBe(0);
        });
    });

    describe('listBySect', () => {
        it('should filter by sect', () => {
            system.defineRank({ sectId: 's1' });
            system.defineRank({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });

        it('should return empty for unknown sect', () => {
            system.defineRank({});
            expect(system.listBySect('ghost').length).toBe(0);
        });
    });

    describe('listActive', () => {
        it('should filter active', () => {
            const { rank } = system.defineRank({});
            system.defineRank({});
            system.abolishRank(rank.rankId);
            expect(system.listActive().length).toBe(1);
        });

        it('should return all when none abolished', () => {
            system.defineRank({});
            system.defineRank({});
            expect(system.listActive().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listActive().length).toBe(0);
        });
    });

    describe('addMember', () => {
        it('should add member', () => {
            const { rank } = system.defineRank({});
            system.addMember(rank.rankId, 'm1');
            expect(rank.members).toContain('m1');
        });

        it('should add multiple members', () => {
            const { rank } = system.defineRank({});
            system.addMember(rank.rankId, 'm1');
            system.addMember(rank.rankId, 'm2');
            expect(rank.members.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addMember('ghost', 'm1');
            expect(result.error).toBe('RANK_NOT_FOUND');
        });

        it('should trigger memberAdded hook', () => {
            const { rank } = system.defineRank({});
            let called = false;
            system.registerHook('memberAdded', () => { called = true; });
            system.addMember(rank.rankId, 'm1');
            expect(called).toBe(true);
        });
    });

    describe('increaseLevel', () => {
        it('should increase level', () => {
            const { rank } = system.defineRank({});
            system.increaseLevel(rank.rankId);
            expect(rank.level).toBe(2);
        });

        it('should increase multiple times', () => {
            const { rank } = system.defineRank({});
            system.increaseLevel(rank.rankId);
            system.increaseLevel(rank.rankId);
            system.increaseLevel(rank.rankId);
            expect(rank.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.increaseLevel('ghost');
            expect(result.error).toBe('RANK_NOT_FOUND');
        });

        it('should trigger levelIncreased hook', () => {
            const { rank } = system.defineRank({});
            let called = false;
            system.registerHook('levelIncreased', () => { called = true; });
            system.increaseLevel(rank.rankId);
            expect(called).toBe(true);
        });
    });

    describe('abolishRank', () => {
        it('should set status to abolished', () => {
            const { rank } = system.defineRank({});
            system.abolishRank(rank.rankId);
            expect(rank.status).toBe('abolished');
        });

        it('should reject missing', () => {
            const result = system.abolishRank('ghost');
            expect(result.error).toBe('RANK_NOT_FOUND');
        });

        it('should trigger rankAbolished hook', () => {
            const { rank } = system.defineRank({});
            let called = false;
            system.registerHook('rankAbolished', () => { called = true; });
            system.abolishRank(rank.rankId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHierarchyPower', () => {
        it('should calculate base power', () => {
            const { rank } = system.defineRank({});
            // level 1 * 100 + 0 * 5 = 100
            expect(system.calculateHierarchyPower(rank.rankId)).toBe(100);
        });

        it('should factor in members', () => {
            const { rank } = system.defineRank({});
            system.addMember(rank.rankId, 'm1');
            system.addMember(rank.rankId, 'm2');
            // level 1 * 100 + 2 * 5 = 110
            expect(system.calculateHierarchyPower(rank.rankId)).toBe(110);
        });

        it('should factor in level', () => {
            const { rank } = system.defineRank({});
            system.increaseLevel(rank.rankId);
            system.increaseLevel(rank.rankId);
            // level 3 * 100 + 0 * 5 = 300
            expect(system.calculateHierarchyPower(rank.rankId)).toBe(300);
        });

        it('should combine level and members', () => {
            const { rank } = system.defineRank({});
            system.increaseLevel(rank.rankId);
            system.addMember(rank.rankId, 'm1');
            // level 2 * 100 + 1 * 5 = 205
            expect(system.calculateHierarchyPower(rank.rankId)).toBe(205);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHierarchyPower('ghost')).toBe(0);
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

        it('should execute default getRank', () => {
            const result = system.executeTool('getRank', { rankId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('rankDefined', () => count++);
            unregister();
            system.defineRank({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('rankDefined', () => { throw new Error('x'); });
            expect(() => system.defineRank({})).not.toThrow();
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
            system.defineRank({});
            const json = system.toJSON();
            expect(json.ranks.length).toBe(1);
        });
        it('should deserialize', () => {
            system.defineRank({});
            const json = system.toJSON();
            const newSys = new SectHierarchy();
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
