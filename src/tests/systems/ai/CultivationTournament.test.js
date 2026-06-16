/**
 * CultivationTournament.test.js - 修真比武测试
 * V544 Iteration 7/20 Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTournament } from '../../../systems/ai/CultivationTournament.js';

describe('CultivationTournament', () => {
    let system;
    beforeEach(() => { system = new CultivationTournament(); });

    describe('startTournament', () => {
        it('should start a tournament with default values', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1', name: 'Sky Tournament' });
            expect(tournament.tournamentId).toBeDefined();
            expect(tournament.organizerId).toBe('org1');
            expect(tournament.name).toBe('Sky Tournament');
            expect(tournament.type).toBe('elimination');
            expect(tournament.rounds).toBe(5);
            expect(tournament.winners).toEqual([]);
            expect(tournament.level).toBe(1);
            expect(tournament.status).toBe('planned');
        });

        it('should accept round-robin type', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1', type: 'round-robin' });
            expect(tournament.type).toBe('round-robin');
        });

        it('should accept single type', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1', type: 'single' });
            expect(tournament.type).toBe('single');
        });

        it('should respect custom rounds', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1', rounds: 12 });
            expect(tournament.rounds).toBe(12);
        });

        it('should increment totalTournaments', () => {
            system.startTournament({ organizerId: 'org1' });
            expect(system.stats.totalTournaments).toBe(1);
        });

        it('should trigger tournamentStarted hook', () => {
            let called = false;
            system.registerHook('tournamentStarted', () => { called = true; });
            system.startTournament({ organizerId: 'org1' });
            expect(called).toBe(true);
        });

        it('should use provided tournamentId when given', () => {
            const { tournament } = system.startTournament({ tournamentId: 'tnt_custom_42', organizerId: 'org1' });
            expect(tournament.tournamentId).toBe('tnt_custom_42');
        });
    });

    describe('getTournament', () => {
        it('should return tournament', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            expect(system.getTournament(tournament.tournamentId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTournament('ghost')).toBeNull(); });
    });

    describe('listTournaments', () => {
        it('should list all', () => {
            system.startTournament({ organizerId: 'org1' });
            system.startTournament({ organizerId: 'org2' });
            expect(system.listTournaments().length).toBe(2);
        });

        it('should return empty list when no tournaments', () => {
            expect(system.listTournaments().length).toBe(0);
        });
    });

    describe('listByOrganizer', () => {
        it('should filter by organizer', () => {
            system.startTournament({ organizerId: 'org1' });
            system.startTournament({ organizerId: 'org2' });
            system.startTournament({ organizerId: 'org1' });
            expect(system.listByOrganizer('org1').length).toBe(2);
            expect(system.listByOrganizer('org2').length).toBe(1);
        });

        it('should return empty for unknown organizer', () => {
            system.startTournament({ organizerId: 'org1' });
            expect(system.listByOrganizer('ghost').length).toBe(0);
        });
    });

    describe('listActive', () => {
        it('should return only active tournaments', () => {
            const { tournament: t1 } = system.startTournament({ organizerId: 'org1' });
            system.startTournament({ organizerId: 'org1' });
            system.increaseRounds(t1.tournamentId);
            const active = system.listActive();
            expect(active.length).toBe(1);
            expect(active[0].status).toBe('active');
        });
    });

    describe('addWinner', () => {
        it('should add a winner', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            const result = system.addWinner(tournament.tournamentId, { cultivatorId: 'c1', rank: 1, prize: 1000 });
            expect(result.success).toBe(true);
            expect(tournament.winners.length).toBe(1);
            expect(tournament.winners[0].cultivatorId).toBe('c1');
            expect(tournament.winners[0].rank).toBe(1);
            expect(tournament.winners[0].prize).toBe(1000);
        });

        it('should use default rank based on length', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            const { winner } = system.addWinner(tournament.tournamentId, { cultivatorId: 'c1' });
            expect(winner.rank).toBe(1);
        });

        it('should use default prize of 0', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            const { winner } = system.addWinner(tournament.tournamentId, { cultivatorId: 'c1' });
            expect(winner.prize).toBe(0);
        });

        it('should reject missing tournament', () => {
            const result = system.addWinner('ghost', { cultivatorId: 'c1' });
            expect(result.error).toBe('TOURNAMENT_NOT_FOUND');
        });

        it('should trigger winnerAdded hook', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            let called = false;
            system.registerHook('winnerAdded', () => { called = true; });
            system.addWinner(tournament.tournamentId, { cultivatorId: 'c1' });
            expect(called).toBe(true);
        });

        it('should use provided winnerId when given', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            const { winner } = system.addWinner(tournament.tournamentId, { winnerId: 'w_custom', cultivatorId: 'c1' });
            expect(winner.winnerId).toBe('w_custom');
        });

        it('should assign incrementing rank by default', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            const { winner: w1 } = system.addWinner(tournament.tournamentId, { cultivatorId: 'c1' });
            const { winner: w2 } = system.addWinner(tournament.tournamentId, { cultivatorId: 'c2' });
            expect(w1.rank).toBe(1);
            expect(w2.rank).toBe(2);
        });
    });

    describe('increaseRounds', () => {
        it('should increase by default amount', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            system.increaseRounds(tournament.tournamentId);
            expect(tournament.rounds).toBe(10);
        });

        it('should increase by custom amount', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            system.increaseRounds(tournament.tournamentId, 20);
            expect(tournament.rounds).toBe(25);
        });

        it('should reject missing tournament', () => {
            const result = system.increaseRounds('ghost', 10);
            expect(result.error).toBe('TOURNAMENT_NOT_FOUND');
        });

        it('should trigger roundsIncreased hook', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            let called = false;
            system.registerHook('roundsIncreased', () => { called = true; });
            system.increaseRounds(tournament.tournamentId, 10);
            expect(called).toBe(true);
        });

        it('should transition status to active when rounds are added to planned tournament', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            expect(tournament.status).toBe('planned');
            system.increaseRounds(tournament.tournamentId);
            expect(tournament.status).toBe('active');
        });

        it('should not change status when already active', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            system.increaseRounds(tournament.tournamentId);
            system.increaseRounds(tournament.tournamentId);
            expect(tournament.status).toBe('active');
        });
    });

    describe('levelUpTournament', () => {
        it('should level up', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            system.levelUpTournament(tournament.tournamentId);
            expect(tournament.level).toBe(2);
        });

        it('should reject missing tournament', () => {
            const result = system.levelUpTournament('ghost');
            expect(result.error).toBe('TOURNAMENT_NOT_FOUND');
        });

        it('should trigger tournamentLeveledUp hook', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            let called = false;
            system.registerHook('tournamentLeveledUp', () => { called = true; });
            system.levelUpTournament(tournament.tournamentId);
            expect(called).toBe(true);
        });
    });

    describe('finishTournament', () => {
        it('should finish tournament', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            system.finishTournament(tournament.tournamentId);
            expect(tournament.status).toBe('finished');
        });

        it('should reject missing tournament', () => {
            const result = system.finishTournament('ghost');
            expect(result.error).toBe('TOURNAMENT_NOT_FOUND');
        });

        it('should trigger tournamentFinished hook', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            let called = false;
            system.registerHook('tournamentFinished', () => { called = true; });
            system.finishTournament(tournament.tournamentId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTournamentValue', () => {
        it('should calculate for new tournament', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            // level=1, rounds=5, winners=0 -> 100 + 10 + 0 = 110
            expect(system.calculateTournamentValue(tournament.tournamentId)).toBe(110);
        });

        it('should factor in winners', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            system.addWinner(tournament.tournamentId, { cultivatorId: 'c1' });
            system.addWinner(tournament.tournamentId, { cultivatorId: 'c2' });
            // level=1, rounds=5, winners=2 -> 100 + 10 + 60 = 170
            expect(system.calculateTournamentValue(tournament.tournamentId)).toBe(170);
        });

        it('should factor in level', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            system.levelUpTournament(tournament.tournamentId);
            system.levelUpTournament(tournament.tournamentId);
            // level=3, rounds=5, winners=0 -> 300 + 10 + 0 = 310
            expect(system.calculateTournamentValue(tournament.tournamentId)).toBe(310);
        });

        it('should factor in rounds', () => {
            const { tournament } = system.startTournament({ organizerId: 'org1' });
            system.increaseRounds(tournament.tournamentId, 10);
            // level=1, rounds=15, winners=0 -> 100 + 30 + 0 = 130
            expect(system.calculateTournamentValue(tournament.tournamentId)).toBe(130);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTournamentValue('ghost')).toBe(0);
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

        it('should execute default getTournament', () => {
            const result = system.executeTool('getTournament', { tournamentId: 'ghost' });
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
            const unregister = system.registerHook('tournamentStarted', () => count++);
            unregister();
            system.startTournament({ organizerId: 'org1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('tournamentStarted', () => { throw new Error('x'); });
            expect(() => system.startTournament({ organizerId: 'org1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient tournaments', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve after threshold', () => {
            for (let i = 0; i < 5; i++) system.startTournament({ organizerId: `org${i}` });
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });

        it('should not double evolve', () => {
            for (let i = 0; i < 5; i++) system.startTournament({ organizerId: `org${i}` });
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startTournament({ organizerId: 'org1' });
            const json = system.toJSON();
            expect(json.tournaments.length).toBe(1);
            expect(json.stats.totalTournaments).toBe(1);
        });

        it('should deserialize', () => {
            system.startTournament({ organizerId: 'org1' });
            const json = system.toJSON();
            const newSys = new CultivationTournament();
            newSys.fromJSON(json);
            expect(newSys.tournaments.size).toBe(1);
            expect(newSys.stats.totalTournaments).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.tournamentCount).toBe(0);
            expect(stats.totalTournaments).toBe(0);
        });

        it('should reflect added tournaments', () => {
            system.startTournament({ organizerId: 'org1' });
            expect(system.getStats().tournamentCount).toBe(1);
        });
    });
});
