/**
 * CultivationTown.test.js - 修真镇测试
 * V590 Iteration 13/20 Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTown } from '../../../systems/ai/CultivationTown.js';

describe('CultivationTown', () => {
    let system;
    beforeEach(() => { system = new CultivationTown(); });

    describe('foundTown', () => {
        it('should found', () => {
            const { town } = system.foundTown({ elderId: 'e1', name: 'Mistvale', type: 'trading' });
            expect(town.elderId).toBe('e1');
            expect(town.name).toBe('Mistvale');
            expect(town.type).toBe('trading');
        });

        it('should default to trading type and growing status', () => {
            const { town } = system.foundTown({ elderId: 'e1', name: 'Haven' });
            expect(town.type).toBe('trading');
            expect(town.status).toBe('growing');
            expect(town.economy).toBe(20);
            expect(town.level).toBe(1);
        });

        it('should accept custom economy and shops', () => {
            const { town } = system.foundTown({ elderId: 'e1', name: 'Port', type: 'frontier', economy: 100, shops: ['s1', 's2'] });
            expect(town.economy).toBe(100);
            expect(town.shops.length).toBe(2);
        });

        it('should accept sanctuary type', () => {
            const { town } = system.foundTown({ elderId: 'e1', name: 'Sanctum', type: 'sanctuary' });
            expect(town.type).toBe('sanctuary');
        });

        it('should trigger townFounded hook', () => {
            let called = false;
            system.registerHook('townFounded', () => { called = true; });
            system.foundTown({ elderId: 'e1', name: 'X' });
            expect(called).toBe(true);
        });
    });

    describe('getTown', () => {
        it('should return', () => {
            const { town } = system.foundTown({ elderId: 'e1', name: 'X' });
            expect(system.getTown(town.townId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTown('ghost')).toBeNull(); });
    });

    describe('listTowns', () => {
        it('should list all', () => {
            system.foundTown({ elderId: 'e1', name: 'A' });
            system.foundTown({ elderId: 'e2', name: 'B' });
            expect(system.listTowns().length).toBe(2);
        });
    });

    describe('listByElder', () => {
        it('should filter by elder', () => {
            system.foundTown({ elderId: 'e1', name: 'A' });
            system.foundTown({ elderId: 'e2', name: 'B' });
            system.foundTown({ elderId: 'e1', name: 'C' });
            expect(system.listByElder('e1').length).toBe(2);
        });
    });

    describe('listEternal', () => {
        it('should filter by eternal status', () => {
            const { town } = system.foundTown({ elderId: 'e1', name: 'A' });
            system.foundTown({ elderId: 'e2', name: 'B' });
            system.eternalizeTown(town.townId);
            expect(system.listEternal().length).toBe(1);
        });
    });

    describe('addShop', () => {
        it('should add shop', () => {
            const { town } = system.foundTown({ elderId: 'e1', name: 'A' });
            system.addShop(town.townId, 'Blacksmith');
            expect(town.shops.length).toBe(1);
            expect(town.shops[0]).toBe('Blacksmith');
        });

        it('should reject missing', () => {
            const result = system.addShop('ghost', 's');
            expect(result.error).toBe('TOWN_NOT_FOUND');
        });

        it('should trigger shopAdded hook', () => {
            const { town } = system.foundTown({ elderId: 'e1', name: 'A' });
            let called = false;
            system.registerHook('shopAdded', () => { called = true; });
            system.addShop(town.townId, 'Apothecary');
            expect(called).toBe(true);
        });
    });

    describe('increaseEconomy', () => {
        it('should grow by amount', () => {
            const { town } = system.foundTown({ elderId: 'e1', name: 'A' });
            system.increaseEconomy(town.townId, 50);
            expect(town.economy).toBe(70);
        });

        it('should use default amount of 5', () => {
            const { town } = system.foundTown({ elderId: 'e1', name: 'A' });
            system.increaseEconomy(town.townId);
            expect(town.economy).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.increaseEconomy('ghost', 100);
            expect(result.error).toBe('TOWN_NOT_FOUND');
        });

        it('should trigger economyIncreased hook', () => {
            const { town } = system.foundTown({ elderId: 'e1', name: 'A' });
            let called = false;
            system.registerHook('economyIncreased', () => { called = true; });
            system.increaseEconomy(town.townId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpTown', () => {
        it('should level up', () => {
            const { town } = system.foundTown({ elderId: 'e1', name: 'A' });
            system.levelUpTown(town.townId);
            expect(town.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpTown('ghost');
            expect(result.error).toBe('TOWN_NOT_FOUND');
        });

        it('should trigger townLeveledUp hook', () => {
            const { town } = system.foundTown({ elderId: 'e1', name: 'A' });
            let called = false;
            system.registerHook('townLeveledUp', () => { called = true; });
            system.levelUpTown(town.townId);
            expect(called).toBe(true);
        });
    });

    describe('eternalizeTown', () => {
        it('should set status to eternal', () => {
            const { town } = system.foundTown({ elderId: 'e1', name: 'A' });
            system.eternalizeTown(town.townId);
            expect(town.status).toBe('eternal');
        });

        it('should reject missing', () => {
            const result = system.eternalizeTown('ghost');
            expect(result.error).toBe('TOWN_NOT_FOUND');
        });

        it('should trigger townEternalized hook', () => {
            const { town } = system.foundTown({ elderId: 'e1', name: 'A' });
            let called = false;
            system.registerHook('townEternalized', () => { called = true; });
            system.eternalizeTown(town.townId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTownValue', () => {
        it('should calculate value', () => {
            const { town } = system.foundTown({ elderId: 'e1', name: 'A' });
            system.levelUpTown(town.townId);
            system.levelUpTown(town.townId);
            system.addShop(town.townId, 's1');
            system.addShop(town.townId, 's2');
            system.addShop(town.townId, 's3');
            // level=3, economy=20, shops.length=3 => 3*100 + 20*2 + 3*30 = 300 + 40 + 90 = 430
            expect(system.calculateTownValue(town.townId)).toBe(430);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTownValue('ghost')).toBe(0);
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

        it('should execute default getTown', () => {
            const result = system.executeTool('getTown', { townId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default foundTown', () => {
            const result = system.executeTool('foundTown', { elderId: 'e1', name: 'ToolTown' });
            expect(result.success).toBe(true);
            expect(result.result.town.name).toBe('ToolTown');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('townFounded', () => count++);
            unregister();
            system.foundTown({ elderId: 'e1', name: 'X' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('townFounded', () => { throw new Error('x'); });
            expect(() => system.foundTown({ elderId: 'e1', name: 'X' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTowns = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTowns = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.foundTown({ elderId: 'e1', name: 'A' });
            const json = system.toJSON();
            expect(json.towns.length).toBe(1);
        });
        it('should deserialize', () => {
            system.foundTown({ elderId: 'e1', name: 'A' });
            const json = system.toJSON();
            const newSys = new CultivationTown();
            newSys.fromJSON(json);
            expect(newSys.towns.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.townCount).toBe(0);
        });
    });
});
