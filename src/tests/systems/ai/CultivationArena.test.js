/**
 * CultivationArena.test.js - 修真竞技场测试
 * V543 Iteration 6/20 Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationArena } from '../../../systems/ai/CultivationArena.js';

describe('CultivationArena', () => {
    let system;
    beforeEach(() => { system = new CultivationArena(); });

    describe('openArena', () => {
        it('should open an arena with default values', () => {
            const { arena } = system.openArena({ ownerId: 'o1', name: 'Sky Coliseum' });
            expect(arena.arenaId).toBeDefined();
            expect(arena.ownerId).toBe('o1');
            expect(arena.name).toBe('Sky Coliseum');
            expect(arena.type).toBe('pvp');
            expect(arena.rating).toBe(1000);
            expect(arena.matches).toEqual([]);
            expect(arena.level).toBe(1);
            expect(arena.status).toBe('active');
        });

        it('should accept pve type', () => {
            const { arena } = system.openArena({ ownerId: 'o1', type: 'pve' });
            expect(arena.type).toBe('pve');
        });

        it('should accept boss type', () => {
            const { arena } = system.openArena({ ownerId: 'o1', type: 'boss' });
            expect(arena.type).toBe('boss');
        });

        it('should respect custom rating', () => {
            const { arena } = system.openArena({ ownerId: 'o1', rating: 1500 });
            expect(arena.rating).toBe(1500);
        });

        it('should increment totalArenas', () => {
            system.openArena({ ownerId: 'o1' });
            expect(system.stats.totalArenas).toBe(1);
        });

        it('should trigger arenaOpened hook', () => {
            let called = false;
            system.registerHook('arenaOpened', () => { called = true; });
            system.openArena({ ownerId: 'o1' });
            expect(called).toBe(true);
        });

        it('should use provided arenaId when given', () => {
            const { arena } = system.openArena({ arenaId: 'arena_custom_42', ownerId: 'o1' });
            expect(arena.arenaId).toBe('arena_custom_42');
        });
    });

    describe('getArena', () => {
        it('should return arena', () => {
            const { arena } = system.openArena({ ownerId: 'o1' });
            expect(system.getArena(arena.arenaId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getArena('ghost')).toBeNull(); });
    });

    describe('listArenas', () => {
        it('should list all', () => {
            system.openArena({ ownerId: 'o1' });
            system.openArena({ ownerId: 'o2' });
            expect(system.listArenas().length).toBe(2);
        });

        it('should return empty list when no arenas', () => {
            expect(system.listArenas().length).toBe(0);
        });
    });

    describe('listByOwner', () => {
        it('should filter by owner', () => {
            system.openArena({ ownerId: 'o1' });
            system.openArena({ ownerId: 'o2' });
            system.openArena({ ownerId: 'o1' });
            expect(system.listByOwner('o1').length).toBe(2);
            expect(system.listByOwner('o2').length).toBe(1);
        });

        it('should return empty for unknown owner', () => {
            system.openArena({ ownerId: 'o1' });
            expect(system.listByOwner('ghost').length).toBe(0);
        });
    });

    describe('listActive', () => {
        it('should return only active arenas', () => {
            const { arena: a1 } = system.openArena({ ownerId: 'o1' });
            system.openArena({ ownerId: 'o1' });
            system.closeArena(a1.arenaId);
            const active = system.listActive();
            expect(active.length).toBe(1);
            expect(active[0].status).toBe('active');
        });
    });

    describe('addMatch', () => {
        it('should add a match', () => {
            const { arena } = system.openArena({ ownerId: 'o1' });
            const result = system.addMatch(arena.arenaId, { opponentId: 'p1', result: 'win', score: 100 });
            expect(result.success).toBe(true);
            expect(arena.matches.length).toBe(1);
            expect(arena.matches[0].opponentId).toBe('p1');
            expect(arena.matches[0].result).toBe('win');
            expect(arena.matches[0].score).toBe(100);
        });

        it('should use default result pending', () => {
            const { arena } = system.openArena({ ownerId: 'o1' });
            const { match } = system.addMatch(arena.arenaId, { opponentId: 'p1' });
            expect(match.result).toBe('pending');
        });

        it('should reject missing arena', () => {
            const result = system.addMatch('ghost', { opponentId: 'p1' });
            expect(result.error).toBe('ARENA_NOT_FOUND');
        });

        it('should trigger matchAdded hook', () => {
            const { arena } = system.openArena({ ownerId: 'o1' });
            let called = false;
            system.registerHook('matchAdded', () => { called = true; });
            system.addMatch(arena.arenaId, { opponentId: 'p1' });
            expect(called).toBe(true);
        });

        it('should increment totalMatches', () => {
            const { arena } = system.openArena({ ownerId: 'o1' });
            system.addMatch(arena.arenaId, { opponentId: 'p1' });
            expect(system.stats.totalMatches).toBe(1);
        });

        it('should use provided matchId when given', () => {
            const { arena } = system.openArena({ ownerId: 'o1' });
            const { match } = system.addMatch(arena.arenaId, { matchId: 'm_custom', opponentId: 'p1' });
            expect(match.matchId).toBe('m_custom');
        });
    });

    describe('increaseRating', () => {
        it('should increase by default amount', () => {
            const { arena } = system.openArena({ ownerId: 'o1' });
            system.increaseRating(arena.arenaId);
            expect(arena.rating).toBe(1005);
        });

        it('should increase by custom amount', () => {
            const { arena } = system.openArena({ ownerId: 'o1' });
            system.increaseRating(arena.arenaId, 50);
            expect(arena.rating).toBe(1050);
        });

        it('should reject missing arena', () => {
            const result = system.increaseRating('ghost', 10);
            expect(result.error).toBe('ARENA_NOT_FOUND');
        });

        it('should trigger ratingIncreased hook', () => {
            const { arena } = system.openArena({ ownerId: 'o1' });
            let called = false;
            system.registerHook('ratingIncreased', () => { called = true; });
            system.increaseRating(arena.arenaId, 10);
            expect(called).toBe(true);
        });

        it('should mark arena as legendary at high rating', () => {
            const { arena } = system.openArena({ ownerId: 'o1' });
            system.increaseRating(arena.arenaId, 1100);
            expect(arena.status).toBe('legendary');
        });
    });

    describe('levelUpArena', () => {
        it('should level up', () => {
            const { arena } = system.openArena({ ownerId: 'o1' });
            system.levelUpArena(arena.arenaId);
            expect(arena.level).toBe(2);
        });

        it('should reject missing arena', () => {
            const result = system.levelUpArena('ghost');
            expect(result.error).toBe('ARENA_NOT_FOUND');
        });

        it('should trigger arenaLeveledUp hook', () => {
            const { arena } = system.openArena({ ownerId: 'o1' });
            let called = false;
            system.registerHook('arenaLeveledUp', () => { called = true; });
            system.levelUpArena(arena.arenaId);
            expect(called).toBe(true);
        });
    });

    describe('closeArena', () => {
        it('should close arena', () => {
            const { arena } = system.openArena({ ownerId: 'o1' });
            system.closeArena(arena.arenaId);
            expect(arena.status).toBe('closed');
        });

        it('should reject missing arena', () => {
            const result = system.closeArena('ghost');
            expect(result.error).toBe('ARENA_NOT_FOUND');
        });

        it('should trigger arenaClosed hook', () => {
            const { arena } = system.openArena({ ownerId: 'o1' });
            let called = false;
            system.registerHook('arenaClosed', () => { called = true; });
            system.closeArena(arena.arenaId);
            expect(called).toBe(true);
        });
    });

    describe('calculateArenaPower', () => {
        it('should calculate for new arena', () => {
            const { arena } = system.openArena({ ownerId: 'o1' });
            // level=1, rating=1000, matches=0 -> 100 + 2000 + 0 = 2100
            expect(system.calculateArenaPower(arena.arenaId)).toBe(2100);
        });

        it('should factor in matches', () => {
            const { arena } = system.openArena({ ownerId: 'o1' });
            system.addMatch(arena.arenaId, { opponentId: 'p1' });
            system.addMatch(arena.arenaId, { opponentId: 'p2' });
            // level=1, rating=1000, matches=2 -> 100 + 2000 + 60 = 2160
            expect(system.calculateArenaPower(arena.arenaId)).toBe(2160);
        });

        it('should factor in level', () => {
            const { arena } = system.openArena({ ownerId: 'o1' });
            system.levelUpArena(arena.arenaId);
            system.levelUpArena(arena.arenaId);
            // level=3, rating=1000, matches=0 -> 300 + 2000 + 0 = 2300
            expect(system.calculateArenaPower(arena.arenaId)).toBe(2300);
        });

        it('should factor in rating', () => {
            const { arena } = system.openArena({ ownerId: 'o1' });
            system.increaseRating(arena.arenaId, 100);
            // level=1, rating=1100, matches=0 -> 100 + 2200 + 0 = 2300
            expect(system.calculateArenaPower(arena.arenaId)).toBe(2300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateArenaPower('ghost')).toBe(0);
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
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default getArena', () => {
            const result = system.executeTool('getArena', { arenaId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle missing context with default', () => {
            system.registerTool('noctx', (ctx) => ctx);
            const result = system.executeTool('noctx');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('arenaOpened', () => count++);
            unregister();
            system.openArena({ ownerId: 'o1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('arenaOpened', () => { throw new Error('x'); });
            expect(() => system.openArena({ ownerId: 'o1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient arenas', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve after threshold', () => {
            for (let i = 0; i < 5; i++) system.openArena({ ownerId: `o${i}` });
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });

        it('should not double evolve', () => {
            for (let i = 0; i < 5; i++) system.openArena({ ownerId: `o${i}` });
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openArena({ ownerId: 'o1' });
            const json = system.toJSON();
            expect(json.arenas.length).toBe(1);
            expect(json.stats.totalArenas).toBe(1);
        });

        it('should deserialize', () => {
            system.openArena({ ownerId: 'o1' });
            const json = system.toJSON();
            const newSys = new CultivationArena();
            newSys.fromJSON(json);
            expect(newSys.arenas.size).toBe(1);
            expect(newSys.stats.totalArenas).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.arenaCount).toBe(0);
            expect(stats.totalArenas).toBe(0);
        });

        it('should reflect added arenas', () => {
            system.openArena({ ownerId: 'o1' });
            expect(system.getStats().arenaCount).toBe(1);
        });
    });
});
