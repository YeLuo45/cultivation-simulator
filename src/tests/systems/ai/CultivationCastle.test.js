/**
 * CultivationCastle.test.js - 修真城堡测试
 * V713 Iteration 6/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationCastle } from '../../../systems/ai/CultivationCastle.js';

describe('CultivationCastle', () => {
    let system;
    beforeEach(() => { system = new CultivationCastle(); });

    describe('recruitCastle', () => {
        it('should recruit', () => {
            const { castle } = system.recruitCastle({ masterId: 'm1', name: 'Dragonspire', type: 'royal' });
            expect(castle.masterId).toBe('m1');
            expect(castle.name).toBe('Dragonspire');
            expect(castle.type).toBe('royal');
        });

        it('should default to fortress type and novice status', () => {
            const { castle } = system.recruitCastle({ masterId: 'm1', name: 'Haven' });
            expect(castle.type).toBe('fortress');
            expect(castle.status).toBe('novice');
            expect(castle.defense).toBe(20);
            expect(castle.level).toBe(1);
        });

        it('should accept custom defense and walls', () => {
            const { castle } = system.recruitCastle({ masterId: 'm1', name: 'Port', type: 'grand', defense: 50, walls: ['w1', 'w2'] });
            expect(castle.defense).toBe(50);
            expect(castle.walls.length).toBe(2);
        });

        it('should trigger castleRecruited hook', () => {
            let called = false;
            system.registerHook('castleRecruited', () => { called = true; });
            system.recruitCastle({ masterId: 'm1', name: 'X' });
            expect(called).toBe(true);
        });
    });

    describe('getCastle', () => {
        it('should return', () => {
            const { castle } = system.recruitCastle({ masterId: 'm1', name: 'X' });
            expect(system.getCastle(castle.castleId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCastle('ghost')).toBeNull(); });
    });

    describe('listCastles', () => {
        it('should list all', () => {
            system.recruitCastle({ masterId: 'm1', name: 'A' });
            system.recruitCastle({ masterId: 'm2', name: 'B' });
            expect(system.listCastles().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitCastle({ masterId: 'm1', name: 'A' });
            system.recruitCastle({ masterId: 'm2', name: 'B' });
            system.recruitCastle({ masterId: 'm1', name: 'C' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter by legendary status', () => {
            const { castle } = system.recruitCastle({ masterId: 'm1', name: 'A' });
            system.recruitCastle({ masterId: 'm2', name: 'B' });
            system.legendCastle(castle.castleId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addWall', () => {
        it('should add wall', () => {
            const { castle } = system.recruitCastle({ masterId: 'm1', name: 'A' });
            system.addWall(castle.castleId, 'Outer Wall');
            expect(castle.walls.length).toBe(1);
            expect(castle.walls[0]).toBe('Outer Wall');
        });

        it('should reject missing', () => {
            const result = system.addWall('ghost', 'w');
            expect(result.error).toBe('CASTLE_NOT_FOUND');
        });

        it('should trigger wallAdded hook', () => {
            const { castle } = system.recruitCastle({ masterId: 'm1', name: 'A' });
            let called = false;
            system.registerHook('wallAdded', () => { called = true; });
            system.addWall(castle.castleId, 'Inner Wall');
            expect(called).toBe(true);
        });
    });

    describe('raiseDefense', () => {
        it('should raise by amount', () => {
            const { castle } = system.recruitCastle({ masterId: 'm1', name: 'A' });
            system.raiseDefense(castle.castleId, 15);
            expect(castle.defense).toBe(35);
        });

        it('should use default amount of 5', () => {
            const { castle } = system.recruitCastle({ masterId: 'm1', name: 'A' });
            system.raiseDefense(castle.castleId);
            expect(castle.defense).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseDefense('ghost', 100);
            expect(result.error).toBe('CASTLE_NOT_FOUND');
        });

        it('should trigger defenseRaised hook', () => {
            const { castle } = system.recruitCastle({ masterId: 'm1', name: 'A' });
            let called = false;
            system.registerHook('defenseRaised', () => { called = true; });
            system.raiseDefense(castle.castleId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpCastle', () => {
        it('should level up', () => {
            const { castle } = system.recruitCastle({ masterId: 'm1', name: 'A' });
            system.levelUpCastle(castle.castleId);
            expect(castle.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpCastle('ghost');
            expect(result.error).toBe('CASTLE_NOT_FOUND');
        });

        it('should trigger castleLeveledUp hook', () => {
            const { castle } = system.recruitCastle({ masterId: 'm1', name: 'A' });
            let called = false;
            system.registerHook('castleLeveledUp', () => { called = true; });
            system.levelUpCastle(castle.castleId);
            expect(called).toBe(true);
        });
    });

    describe('legendCastle', () => {
        it('should set status to legendary', () => {
            const { castle } = system.recruitCastle({ masterId: 'm1', name: 'A' });
            system.legendCastle(castle.castleId);
            expect(castle.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendCastle('ghost');
            expect(result.error).toBe('CASTLE_NOT_FOUND');
        });

        it('should trigger castleLegendized hook', () => {
            const { castle } = system.recruitCastle({ masterId: 'm1', name: 'A' });
            let called = false;
            system.registerHook('castleLegendized', () => { called = true; });
            system.legendCastle(castle.castleId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCastleValue', () => {
        it('should calculate value', () => {
            const { castle } = system.recruitCastle({ masterId: 'm1', name: 'A' });
            system.levelUpCastle(castle.castleId);
            system.levelUpCastle(castle.castleId);
            system.raiseDefense(castle.castleId, 5);
            system.addWall(castle.castleId, 'w1');
            system.addWall(castle.castleId, 'w2');
            system.addWall(castle.castleId, 'w3');
            // level=3, defense=25, walls.length=3 => 3*100 + 25*2 + 3*30 = 300 + 50 + 90 = 440
            expect(system.calculateCastleValue(castle.castleId)).toBe(440);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCastleValue('ghost')).toBe(0);
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

        it('should execute default getCastle', () => {
            const result = system.executeTool('getCastle', { castleId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('castleRecruited', () => count++);
            unregister();
            system.recruitCastle({ masterId: 'm1', name: 'X' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('castleRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitCastle({ masterId: 'm1', name: 'X' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCastles = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCastles = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitCastle({ masterId: 'm1', name: 'A' });
            const json = system.toJSON();
            expect(json.castles.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitCastle({ masterId: 'm1', name: 'A' });
            const json = system.toJSON();
            const newSys = new CultivationCastle();
            newSys.fromJSON(json);
            expect(newSys.castles.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.castleCount).toBe(0);
        });
    });
});
