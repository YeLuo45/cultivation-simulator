/**
 * TacticalCoordination.test.js - 战术协调系统测试
 * V314 Iteration 2/9 Round 4 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TacticalCoordination } from '../../../systems/ai/TacticalCoordination.js';

describe('TacticalCoordination', () => {
    let system;

    beforeEach(() => { system = new TacticalCoordination(); });

    describe('Default Tactics', () => {
        it('should have default tactics', () => {
            expect(system.tactics.size).toBe(5);
        });

        it('should contain flank', () => {
            expect(system.getTactic('flank')).not.toBeNull();
        });
    });

    describe('registerTactic', () => {
        it('should register tactic', () => {
            const { tactic } = system.registerTactic({ name: 'Custom' });
            expect(tactic.name).toBe('Custom');
        });

        it('should default power to 10', () => {
            const { tactic } = system.registerTactic({});
            expect(tactic.power).toBe(10);
        });

        it('should default category to general', () => {
            const { tactic } = system.registerTactic({});
            expect(tactic.category).toBe('general');
        });

        it('should increment totalTactics', () => {
            system.registerTactic({});
            expect(system.stats.totalTactics).toBe(1);
        });

        it('should trigger tacticRegistered hook', () => {
            let called = false;
            system.registerHook('tacticRegistered', () => { called = true; });
            system.registerTactic({});
            expect(called).toBe(true);
        });
    });

    describe('getTactic', () => {
        it('should return tactic', () => {
            expect(system.getTactic('flank')).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getTactic('ghost')).toBeNull();
        });
    });

    describe('listTactics', () => {
        it('should list all', () => {
            expect(system.listTactics().length).toBe(5);
        });

        it('should filter by category', () => {
            expect(system.listTactics({ category: 'offense' }).length).toBe(3);
        });
    });

    describe('createBattle', () => {
        it('should create battle', () => {
            const { battle } = system.createBattle({ name: 'Test Battle' });
            expect(battle.name).toBe('Test Battle');
        });

        it('should default status to active', () => {
            const { battle } = system.createBattle({});
            expect(battle.status).toBe('active');
        });

        it('should increment totalBattles', () => {
            system.createBattle({});
            expect(system.stats.totalBattles).toBe(1);
        });

        it('should trigger battleCreated hook', () => {
            let called = false;
            system.registerHook('battleCreated', () => { called = true; });
            system.createBattle({});
            expect(called).toBe(true);
        });
    });

    describe('getBattle', () => {
        it('should return battle', () => {
            const { battle } = system.createBattle({});
            expect(system.getBattle(battle.battleId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getBattle('ghost')).toBeNull();
        });
    });

    describe('addTeamToBattle', () => {
        it('should add team', () => {
            const { battle } = system.createBattle({});
            const result = system.addTeamToBattle(battle.battleId, 't1');
            expect(result.success).toBe(true);
        });

        it('should reject missing battle', () => {
            const result = system.addTeamToBattle('ghost', 't1');
            expect(result.error).toBe('BATTLE_NOT_FOUND');
        });

        it('should not duplicate', () => {
            const { battle } = system.createBattle({});
            system.addTeamToBattle(battle.battleId, 't1');
            system.addTeamToBattle(battle.battleId, 't1');
            expect(battle.teams.length).toBe(1);
        });
    });

    describe('addMemberToTeam', () => {
        it('should add member', () => {
            const { battle } = system.createBattle({});
            system.addTeamToBattle(battle.battleId, 't1');
            const result = system.addMemberToTeam('t1', 'm1');
            expect(result.success).toBe(true);
        });

        it('should reject missing team', () => {
            const result = system.addMemberToTeam('ghost', 'm1');
            expect(result.error).toBe('TEAM_NOT_FOUND');
        });

        it('should not duplicate', () => {
            const { battle } = system.createBattle({});
            system.addTeamToBattle(battle.battleId, 't1');
            system.addMemberToTeam('t1', 'm1');
            system.addMemberToTeam('t1', 'm1');
            expect(system.teams.get('t1').members.length).toBe(1);
        });
    });

    describe('calculateCoordination', () => {
        it('should calculate', () => {
            const { battle } = system.createBattle({});
            system.addTeamToBattle(battle.battleId, 't1');
            system.addMemberToTeam('t1', 'm1');
            const result = system.calculateCoordination('t1');
            expect(result.coordination).toBeGreaterThan(0);
        });

        it('should reject missing team', () => {
            const result = system.calculateCoordination('ghost');
            expect(result.error).toBe('TEAM_NOT_FOUND');
        });

        it('should increase with members', () => {
            const { battle } = system.createBattle({});
            system.addTeamToBattle(battle.battleId, 't1');
            const r1 = system.calculateCoordination('t1');
            system.addMemberToTeam('t1', 'm1');
            system.addMemberToTeam('t1', 'm2');
            const r2 = system.calculateCoordination('t1');
            expect(r2.coordination).toBeGreaterThan(r1.coordination);
        });
    });

    describe('executeTactic', () => {
        it('should execute', () => {
            const { battle } = system.createBattle({});
            system.addTeamToBattle(battle.battleId, 't1');
            const result = system.executeTactic(battle.battleId, 'flank', 't1');
            expect(result.success).toBe(true);
        });

        it('should reject missing battle', () => {
            const result = system.executeTactic('ghost', 'flank', 't1');
            expect(result.error).toBe('BATTLE_NOT_FOUND');
        });

        it('should reject inactive battle', () => {
            const { battle } = system.createBattle({});
            battle.status = 'ended';
            const result = system.executeTactic(battle.battleId, 'flank', 't1');
            expect(result.error).toBe('BATTLE_INACTIVE');
        });

        it('should reject missing tactic', () => {
            const { battle } = system.createBattle({});
            system.addTeamToBattle(battle.battleId, 't1');
            const result = system.executeTactic(battle.battleId, 'ghost', 't1');
            expect(result.error).toBe('TACTIC_NOT_FOUND');
        });

        it('should reject missing team', () => {
            const { battle } = system.createBattle({});
            const result = system.executeTactic(battle.battleId, 'flank', 'ghost');
            expect(result.error).toBe('TEAM_NOT_FOUND');
        });

        it('should multiply power by coordination', () => {
            const { battle } = system.createBattle({});
            system.addTeamToBattle(battle.battleId, 't1');
            system.addMemberToTeam('t1', 'm1');
            system.calculateCoordination('t1');
            const result = system.executeTactic(battle.battleId, 'flank', 't1');
            expect(result.event.effectivePower).toBeGreaterThan(0);
        });

        it('should record in log', () => {
            const { battle } = system.createBattle({});
            system.addTeamToBattle(battle.battleId, 't1');
            system.executeTactic(battle.battleId, 'flank', 't1');
            expect(system.coordinationLog.length).toBe(1);
        });

        it('should trigger tacticExecuted hook', () => {
            const { battle } = system.createBattle({});
            system.addTeamToBattle(battle.battleId, 't1');
            let called = false;
            system.registerHook('tacticExecuted', () => { called = true; });
            system.executeTactic(battle.battleId, 'flank', 't1');
            expect(called).toBe(true);
        });
    });

    describe('endBattle', () => {
        it('should end', () => {
            const { battle } = system.createBattle({});
            const result = system.endBattle(battle.battleId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.endBattle('ghost');
            expect(result.error).toBe('BATTLE_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { battle } = system.createBattle({});
            battle.status = 'ended';
            const result = system.endBattle(battle.battleId);
            expect(result.error).toBe('BATTLE_INACTIVE');
        });

        it('should set endedAt', () => {
            const { battle } = system.createBattle({});
            system.endBattle(battle.battleId);
            expect(battle.endedAt).toBeGreaterThan(0);
        });

        it('should trigger battleEnded hook', () => {
            const { battle } = system.createBattle({});
            let called = false;
            system.registerHook('battleEnded', () => { called = true; });
            system.endBattle(battle.battleId);
            expect(called).toBe(true);
        });
    });

    describe('getCoordinationLog', () => {
        it('should return log', () => {
            const { battle } = system.createBattle({});
            system.addTeamToBattle(battle.battleId, 't1');
            system.executeTactic(battle.battleId, 'flank', 't1');
            expect(system.getCoordinationLog().length).toBe(1);
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

        it('should execute default getTactic', () => {
            const result = system.executeTool('getTactic', { tacticId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('tacticRegistered', () => count++);
            unregister();
            system.registerTactic({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('tacticRegistered', () => { throw new Error('x'); });
            expect(() => system.registerTactic({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalBattles = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalBattles = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createBattle({});
            const json = system.toJSON();
            expect(json.battles.length).toBe(1);
        });

        it('should deserialize', () => {
            system.createBattle({});
            const json = system.toJSON();
            const newSys = new TacticalCoordination();
            newSys.fromJSON(json);
            expect(newSys.battles.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.tacticCount).toBe(5);
        });
    });
});