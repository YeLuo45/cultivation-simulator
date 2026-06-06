/**
 * QiCombat.test.js - 剑气战斗测试
 * V410 Iteration 2/15 Round 14 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { QiCombat } from '../../../systems/ai/QiCombat.js';

describe('QiCombat', () => {
    let system;
    beforeEach(() => { system = new QiCombat(); });

    describe('startCombat', () => {
        it('should start', () => {
            const { combat } = system.startCombat({ attackerId: 'a1', defenderId: 'd1' });
            expect(combat.attackerId).toBe('a1');
        });

        it('should trigger combatStarted hook', () => {
            let called = false;
            system.registerHook('combatStarted', () => { called = true; });
            system.startCombat({});
            expect(called).toBe(true);
        });
    });

    describe('getCombat', () => {
        it('should return', () => {
            const { combat } = system.startCombat({});
            expect(system.getCombat(combat.combatId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCombat('ghost')).toBeNull(); });
    });

    describe('listCombats', () => {
        it('should list all', () => {
            system.startCombat({});
            expect(system.listCombats().length).toBe(1);
        });
    });

    describe('listOngoing', () => {
        it('should filter', () => {
            const { combat } = system.startCombat({});
            combat.status = 'ended';
            system.startCombat({});
            expect(system.listOngoing().length).toBe(1);
        });
    });

    describe('listByAttacker', () => {
        it('should filter', () => {
            system.startCombat({ attackerId: 'a1' });
            system.startCombat({ attackerId: 'a2' });
            expect(system.listByAttacker('a1').length).toBe(1);
        });
    });

    describe('listByDefender', () => {
        it('should filter', () => {
            system.startCombat({ defenderId: 'd1' });
            system.startCombat({ defenderId: 'd2' });
            expect(system.listByDefender('d1').length).toBe(1);
        });
    });

    describe('attack', () => {
        it('should attack', () => {
            const { combat } = system.startCombat({});
            system.attack(combat.combatId, 50);
            expect(combat.damage).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.attack('ghost', 50);
            expect(result.error).toBe('COMBAT_NOT_FOUND');
        });

        it('should reject ended', () => {
            const { combat } = system.startCombat({});
            combat.status = 'ended';
            const result = system.attack(combat.combatId, 50);
            expect(result.error).toBe('COMBAT_OVER');
        });

        it('should trigger attackExecuted hook', () => {
            const { combat } = system.startCombat({});
            let called = false;
            system.registerHook('attackExecuted', () => { called = true; });
            system.attack(combat.combatId, 50);
            expect(called).toBe(true);
        });
    });

    describe('defend', () => {
        it('should defend', () => {
            const { combat } = system.startCombat({});
            system.defend(combat.combatId);
            expect(combat.rounds).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.defend('ghost');
            expect(result.error).toBe('COMBAT_NOT_FOUND');
        });

        it('should trigger defenseExecuted hook', () => {
            const { combat } = system.startCombat({});
            let called = false;
            system.registerHook('defenseExecuted', () => { called = true; });
            system.defend(combat.combatId);
            expect(called).toBe(true);
        });
    });

    describe('endCombat', () => {
        it('should end', () => {
            const { combat } = system.startCombat({});
            system.endCombat(combat.combatId, 'a1');
            expect(combat.winner).toBe('a1');
        });

        it('should reject missing', () => {
            const result = system.endCombat('ghost', 'a1');
            expect(result.error).toBe('COMBAT_NOT_FOUND');
        });

        it('should trigger combatEnded hook', () => {
            const { combat } = system.startCombat({});
            let called = false;
            system.registerHook('combatEnded', () => { called = true; });
            system.endCombat(combat.combatId, 'a1');
            expect(called).toBe(true);
        });
    });

    describe('calculateAverageDamage', () => {
        it('should calculate', () => {
            const { combat: c1 } = system.startCombat({});
            const { combat: c2 } = system.startCombat({});
            system.attack(c1.combatId, 100);
            system.attack(c2.combatId, 200);
            expect(system.calculateAverageDamage()).toBe(150);
        });

        it('should return 0 for no damage', () => {
            system.startCombat({});
            expect(system.calculateAverageDamage()).toBe(0);
        });
    });

    describe('listWinners', () => {
        it('should filter', () => {
            const { combat } = system.startCombat({});
            system.endCombat(combat.combatId, 'a1');
            system.startCombat({});
            expect(system.listWinners().length).toBe(1);
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

        it('should execute default getCombat', () => {
            const result = system.executeTool('getCombat', { combatId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('combatStarted', () => count++);
            unregister();
            system.startCombat({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('combatStarted', () => { throw new Error('x'); });
            expect(() => system.startCombat({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCombats = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCombats = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startCombat({});
            const json = system.toJSON();
            expect(json.combats.length).toBe(1);
        });
        it('should deserialize', () => {
            system.startCombat({});
            const json = system.toJSON();
            const newSys = new QiCombat();
            newSys.fromJSON(json);
            expect(newSys.combats.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.combatCount).toBe(0);
        });
    });
});