/**
 * CultivationDuel.test.js - 修真决斗测试
 * V545 Iteration 8/20 Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDuel } from '../../../systems/ai/CultivationDuel.js';

describe('CultivationDuel', () => {
    let system;
    beforeEach(() => { system = new CultivationDuel(); });

    describe('startDuel', () => {
        it('should start a duel with default values', () => {
            const { duel } = system.startDuel({ challengerId: 'c1', name: 'Sky Duel' });
            expect(duel.duelId).toBeDefined();
            expect(duel.challengerId).toBe('c1');
            expect(duel.name).toBe('Sky Duel');
            expect(duel.type).toBe('point');
            expect(duel.stakes).toEqual([]);
            expect(duel.rounds).toBe(3);
            expect(duel.level).toBe(1);
            expect(duel.status).toBe('pending');
        });

        it('should accept death type', () => {
            const { duel } = system.startDuel({ challengerId: 'c1', type: 'death' });
            expect(duel.type).toBe('death');
        });

        it('should accept spirit type', () => {
            const { duel } = system.startDuel({ challengerId: 'c1', type: 'spirit' });
            expect(duel.type).toBe('spirit');
        });

        it('should respect custom rounds', () => {
            const { duel } = system.startDuel({ challengerId: 'c1', rounds: 10 });
            expect(duel.rounds).toBe(10);
        });

        it('should increment totalDuels', () => {
            system.startDuel({ challengerId: 'c1' });
            expect(system.stats.totalDuels).toBe(1);
        });

        it('should trigger duelStarted hook', () => {
            let called = false;
            system.registerHook('duelStarted', () => { called = true; });
            system.startDuel({ challengerId: 'c1' });
            expect(called).toBe(true);
        });

        it('should use provided duelId when given', () => {
            const { duel } = system.startDuel({ duelId: 'duel_custom_42', challengerId: 'c1' });
            expect(duel.duelId).toBe('duel_custom_42');
        });
    });

    describe('getDuel', () => {
        it('should return duel', () => {
            const { duel } = system.startDuel({ challengerId: 'c1' });
            expect(system.getDuel(duel.duelId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDuel('ghost')).toBeNull(); });
    });

    describe('listDuels', () => {
        it('should list all', () => {
            system.startDuel({ challengerId: 'c1' });
            system.startDuel({ challengerId: 'c2' });
            expect(system.listDuels().length).toBe(2);
        });

        it('should return empty list when no duels', () => {
            expect(system.listDuels().length).toBe(0);
        });
    });

    describe('listByChallenger', () => {
        it('should filter by challenger', () => {
            system.startDuel({ challengerId: 'c1' });
            system.startDuel({ challengerId: 'c2' });
            system.startDuel({ challengerId: 'c1' });
            expect(system.listByChallenger('c1').length).toBe(2);
            expect(system.listByChallenger('c2').length).toBe(1);
        });

        it('should return empty for unknown challenger', () => {
            system.startDuel({ challengerId: 'c1' });
            expect(system.listByChallenger('ghost').length).toBe(0);
        });
    });

    describe('listActive', () => {
        it('should return only active and pending duels', () => {
            const { duel: d1 } = system.startDuel({ challengerId: 'c1' });
            system.startDuel({ challengerId: 'c1' });
            system.finishDuel(d1.duelId);
            const active = system.listActive();
            expect(active.length).toBe(1);
            expect(active[0].status).toBe('pending');
        });
    });

    describe('addStake', () => {
        it('should add a stake', () => {
            const { duel } = system.startDuel({ challengerId: 'c1' });
            const result = system.addStake(duel.duelId, { item: 'sword', value: 100, offeredBy: 'c1' });
            expect(result.success).toBe(true);
            expect(duel.stakes.length).toBe(1);
            expect(duel.stakes[0].item).toBe('sword');
            expect(duel.stakes[0].value).toBe(100);
            expect(duel.stakes[0].offeredBy).toBe('c1');
        });

        it('should use default value 0', () => {
            const { duel } = system.startDuel({ challengerId: 'c1' });
            const { stake } = system.addStake(duel.duelId, { item: 'pill' });
            expect(stake.value).toBe(0);
        });

        it('should reject missing duel', () => {
            const result = system.addStake('ghost', { item: 'sword' });
            expect(result.error).toBe('DUEL_NOT_FOUND');
        });

        it('should trigger stakeAdded hook', () => {
            const { duel } = system.startDuel({ challengerId: 'c1' });
            let called = false;
            system.registerHook('stakeAdded', () => { called = true; });
            system.addStake(duel.duelId, { item: 'sword' });
            expect(called).toBe(true);
        });

        it('should use provided stakeId when given', () => {
            const { duel } = system.startDuel({ challengerId: 'c1' });
            const { stake } = system.addStake(duel.duelId, { stakeId: 'stake_custom', item: 'sword' });
            expect(stake.stakeId).toBe('stake_custom');
        });
    });

    describe('increaseRounds', () => {
        it('should increase by default amount', () => {
            const { duel } = system.startDuel({ challengerId: 'c1' });
            system.increaseRounds(duel.duelId);
            expect(duel.rounds).toBe(8);
        });

        it('should increase by custom amount', () => {
            const { duel } = system.startDuel({ challengerId: 'c1' });
            system.increaseRounds(duel.duelId, 10);
            expect(duel.rounds).toBe(13);
        });

        it('should reject missing duel', () => {
            const result = system.increaseRounds('ghost', 10);
            expect(result.error).toBe('DUEL_NOT_FOUND');
        });

        it('should trigger roundsIncreased hook', () => {
            const { duel } = system.startDuel({ challengerId: 'c1' });
            let called = false;
            system.registerHook('roundsIncreased', () => { called = true; });
            system.increaseRounds(duel.duelId, 10);
            expect(called).toBe(true);
        });

        it('should set status to active when pending and rounds increased', () => {
            const { duel } = system.startDuel({ challengerId: 'c1' });
            system.increaseRounds(duel.duelId, 1);
            expect(duel.status).toBe('active');
        });
    });

    describe('levelUpDuel', () => {
        it('should level up', () => {
            const { duel } = system.startDuel({ challengerId: 'c1' });
            system.levelUpDuel(duel.duelId);
            expect(duel.level).toBe(2);
        });

        it('should reject missing duel', () => {
            const result = system.levelUpDuel('ghost');
            expect(result.error).toBe('DUEL_NOT_FOUND');
        });

        it('should trigger duelLeveledUp hook', () => {
            const { duel } = system.startDuel({ challengerId: 'c1' });
            let called = false;
            system.registerHook('duelLeveledUp', () => { called = true; });
            system.levelUpDuel(duel.duelId);
            expect(called).toBe(true);
        });
    });

    describe('finishDuel', () => {
        it('should finish duel', () => {
            const { duel } = system.startDuel({ challengerId: 'c1' });
            system.finishDuel(duel.duelId);
            expect(duel.status).toBe('finished');
        });

        it('should reject missing duel', () => {
            const result = system.finishDuel('ghost');
            expect(result.error).toBe('DUEL_NOT_FOUND');
        });

        it('should trigger duelFinished hook', () => {
            const { duel } = system.startDuel({ challengerId: 'c1' });
            let called = false;
            system.registerHook('duelFinished', () => { called = true; });
            system.finishDuel(duel.duelId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDuelPower', () => {
        it('should calculate for new duel', () => {
            const { duel } = system.startDuel({ challengerId: 'c1' });
            // level=1, rounds=3, stakes=0 -> 100 + 6 + 0 = 106
            expect(system.calculateDuelPower(duel.duelId)).toBe(106);
        });

        it('should factor in stakes', () => {
            const { duel } = system.startDuel({ challengerId: 'c1' });
            system.addStake(duel.duelId, { item: 'sword' });
            system.addStake(duel.duelId, { item: 'pill' });
            // level=1, rounds=3, stakes=2 -> 100 + 6 + 60 = 166
            expect(system.calculateDuelPower(duel.duelId)).toBe(166);
        });

        it('should factor in level', () => {
            const { duel } = system.startDuel({ challengerId: 'c1' });
            system.levelUpDuel(duel.duelId);
            system.levelUpDuel(duel.duelId);
            // level=3, rounds=3, stakes=0 -> 300 + 6 + 0 = 306
            expect(system.calculateDuelPower(duel.duelId)).toBe(306);
        });

        it('should factor in rounds', () => {
            const { duel } = system.startDuel({ challengerId: 'c1' });
            system.increaseRounds(duel.duelId, 10);
            // level=1, rounds=13, stakes=0 -> 100 + 26 + 0 = 126
            expect(system.calculateDuelPower(duel.duelId)).toBe(126);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDuelPower('ghost')).toBe(0);
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

        it('should execute default getDuel', () => {
            const result = system.executeTool('getDuel', { duelId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default startDuel', () => {
            const result = system.executeTool('startDuel', { challengerId: 'c1' });
            expect(result.success).toBe(true);
            expect(result.result.duel.challengerId).toBe('c1');
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
            const unregister = system.registerHook('duelStarted', () => count++);
            unregister();
            system.startDuel({ challengerId: 'c1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('duelStarted', () => { throw new Error('x'); });
            expect(() => system.startDuel({ challengerId: 'c1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient duels', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve after threshold', () => {
            for (let i = 0; i < 5; i++) system.startDuel({ challengerId: `c${i}` });
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });

        it('should not double evolve', () => {
            for (let i = 0; i < 5; i++) system.startDuel({ challengerId: `c${i}` });
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startDuel({ challengerId: 'c1' });
            const json = system.toJSON();
            expect(json.duels.length).toBe(1);
            expect(json.stats.totalDuels).toBe(1);
        });

        it('should deserialize', () => {
            system.startDuel({ challengerId: 'c1' });
            const json = system.toJSON();
            const newSys = new CultivationDuel();
            newSys.fromJSON(json);
            expect(newSys.duels.size).toBe(1);
            expect(newSys.stats.totalDuels).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.duelCount).toBe(0);
            expect(stats.totalDuels).toBe(0);
        });

        it('should reflect added duels', () => {
            system.startDuel({ challengerId: 'c1' });
            expect(system.getStats().duelCount).toBe(1);
        });
    });
});
