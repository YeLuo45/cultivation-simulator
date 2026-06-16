/**
 * CultivationThief.test.js - 修真小偷测试
 * V612 Iteration 15/20 Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationThief } from '../../../systems/ai/CultivationThief.js';

describe('CultivationThief', () => {
    let system;
    beforeEach(() => { system = new CultivationThief(); });

    describe('recruitThief', () => {
        it('should recruit thief', () => {
            const { thief } = system.recruitThief({ contactId: 'c1', name: 'Quickfingers' });
            expect(thief.contactId).toBe('c1');
            expect(thief.name).toBe('Quickfingers');
        });

        it('should default name to Shadow Hand', () => {
            const { thief } = system.recruitThief({});
            expect(thief.name).toBe('Shadow Hand');
        });

        it('should default type to pickpocket', () => {
            const { thief } = system.recruitThief({});
            expect(thief.type).toBe('pickpocket');
        });

        it('should default agility to baseAgility', () => {
            const { thief } = system.recruitThief({});
            expect(thief.agility).toBe(20);
        });

        it('should start at level 1', () => {
            const { thief } = system.recruitThief({});
            expect(thief.level).toBe(1);
        });

        it('should start with novice status', () => {
            const { thief } = system.recruitThief({});
            expect(thief.status).toBe('novice');
        });

        it('should start with empty loot', () => {
            const { thief } = system.recruitThief({});
            expect(thief.loot).toEqual([]);
        });

        it('should generate thiefId', () => {
            const { thief } = system.recruitThief({});
            expect(thief.thiefId).toBeDefined();
            expect(typeof thief.thiefId).toBe('string');
        });

        it('should accept custom thiefId', () => {
            const { thief } = system.recruitThief({ thiefId: 'my-thief' });
            expect(thief.thiefId).toBe('my-thief');
        });

        it('should trigger thiefRecruited hook', () => {
            let called = false;
            system.registerHook('thiefRecruited', () => { called = true; });
            system.recruitThief({});
            expect(called).toBe(true);
        });

        it('should support all types', () => {
            const { thief: t1 } = system.recruitThief({ type: 'pickpocket' });
            const { thief: t2 } = system.recruitThief({ type: 'safe' });
            const { thief: t3 } = system.recruitThief({ type: 'sneak' });
            expect(t1.type).toBe('pickpocket');
            expect(t2.type).toBe('safe');
            expect(t3.type).toBe('sneak');
        });

        it('should accept custom agility', () => {
            const { thief } = system.recruitThief({ agility: 80 });
            expect(thief.agility).toBe(80);
        });
    });

    describe('getThief', () => {
        it('should return thief', () => {
            const { thief } = system.recruitThief({});
            expect(system.getThief(thief.thiefId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getThief('ghost')).toBeNull(); });
    });

    describe('listThieves', () => {
        it('should list all', () => {
            system.recruitThief({});
            system.recruitThief({});
            expect(system.listThieves().length).toBe(2);
        });

        it('should return empty when no thieves', () => {
            expect(system.listThieves().length).toBe(0);
        });
    });

    describe('listByContact', () => {
        it('should filter by contact', () => {
            system.recruitThief({ contactId: 'c1' });
            system.recruitThief({ contactId: 'c2' });
            system.recruitThief({ contactId: 'c1' });
            expect(system.listByContact('c1').length).toBe(2);
        });

        it('should return empty for unknown contact', () => {
            system.recruitThief({ contactId: 'c1' });
            expect(system.listByContact('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { thief: t1 } = system.recruitThief({});
            const { thief: t2 } = system.recruitThief({});
            system.legendThief(t1.thiefId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].thiefId).toBe(t1.thiefId);
            expect(t2.status).toBe('novice');
        });

        it('should return empty when none legendary', () => {
            system.recruitThief({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addLoot', () => {
        it('should add loot', () => {
            const { thief } = system.recruitThief({});
            system.addLoot(thief.thiefId, 'gold-pouch');
            expect(thief.loot).toContain('gold-pouch');
        });

        it('should accumulate loot', () => {
            const { thief } = system.recruitThief({});
            system.addLoot(thief.thiefId, 'l1');
            system.addLoot(thief.thiefId, 'l2');
            system.addLoot(thief.thiefId, 'l3');
            expect(thief.loot.length).toBe(3);
        });

        it('should reject missing thief', () => {
            const result = system.addLoot('ghost', 'item');
            expect(result.error).toBe('THIEF_NOT_FOUND');
        });

        it('should trigger lootAdded hook', () => {
            const { thief } = system.recruitThief({});
            let called = false;
            system.registerHook('lootAdded', () => { called = true; });
            system.addLoot(thief.thiefId, 'item');
            expect(called).toBe(true);
        });
    });

    describe('increaseAgility', () => {
        it('should increase agility by default', () => {
            const { thief } = system.recruitThief({});
            system.increaseAgility(thief.thiefId);
            expect(thief.agility).toBe(25);
        });

        it('should increase agility by custom amount', () => {
            const { thief } = system.recruitThief({});
            system.increaseAgility(thief.thiefId, 100);
            expect(thief.agility).toBe(120);
        });

        it('should reject missing thief', () => {
            const result = system.increaseAgility('ghost');
            expect(result.error).toBe('THIEF_NOT_FOUND');
        });

        it('should trigger agilityIncreased hook', () => {
            const { thief } = system.recruitThief({});
            let called = false;
            system.registerHook('agilityIncreased', () => { called = true; });
            system.increaseAgility(thief.thiefId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpThief', () => {
        it('should level up', () => {
            const { thief } = system.recruitThief({});
            system.levelUpThief(thief.thiefId);
            expect(thief.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { thief } = system.recruitThief({});
            system.levelUpThief(thief.thiefId);
            system.levelUpThief(thief.thiefId);
            system.levelUpThief(thief.thiefId);
            expect(thief.level).toBe(4);
        });

        it('should reject missing thief', () => {
            const result = system.levelUpThief('ghost');
            expect(result.error).toBe('THIEF_NOT_FOUND');
        });

        it('should trigger thiefLeveledUp hook', () => {
            const { thief } = system.recruitThief({});
            let called = false;
            system.registerHook('thiefLeveledUp', () => { called = true; });
            system.levelUpThief(thief.thiefId);
            expect(called).toBe(true);
        });
    });

    describe('legendThief', () => {
        it('should set status to legendary', () => {
            const { thief } = system.recruitThief({});
            system.legendThief(thief.thiefId);
            expect(thief.status).toBe('legendary');
        });

        it('should reject missing thief', () => {
            const result = system.legendThief('ghost');
            expect(result.error).toBe('THIEF_NOT_FOUND');
        });

        it('should trigger thiefLegendized hook', () => {
            const { thief } = system.recruitThief({});
            let called = false;
            system.registerHook('thiefLegendized', () => { called = true; });
            system.legendThief(thief.thiefId);
            expect(called).toBe(true);
        });
    });

    describe('calculateThiefValue', () => {
        it('should calculate base value', () => {
            const { thief } = system.recruitThief({});
            // level=1, agility=20, loot=0 -> 1*100 + 20*2 + 0 = 140
            expect(system.calculateThiefValue(thief.thiefId)).toBe(140);
        });

        it('should include loot in value', () => {
            const { thief } = system.recruitThief({});
            system.addLoot(thief.thiefId, 'l1');
            system.addLoot(thief.thiefId, 'l2');
            // level=1, agility=20, loot=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateThiefValue(thief.thiefId)).toBe(200);
        });

        it('should scale with level', () => {
            const { thief } = system.recruitThief({});
            system.levelUpThief(thief.thiefId);
            system.levelUpThief(thief.thiefId);
            // level=3, agility=20, loot=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculateThiefValue(thief.thiefId)).toBe(340);
        });

        it('should scale with agility', () => {
            const { thief } = system.recruitThief({});
            system.increaseAgility(thief.thiefId, 100);
            // level=1, agility=120, loot=0 -> 1*100 + 120*2 + 0 = 340
            expect(system.calculateThiefValue(thief.thiefId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateThiefValue('ghost')).toBe(0);
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
            system.registerTool('test', (ctx) => ctx);
            const result = system.executeTool('test');
            expect(result.success).toBe(true);
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

        it('should execute default getThief', () => {
            const result = system.executeTool('getThief', { thiefId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitThief', () => {
            const result = system.executeTool('recruitThief', { contactId: 'c1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('thiefRecruited', () => count++);
            unregister();
            system.recruitThief({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('thiefRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitThief({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalThieves = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalThieves = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitThief({});
            const json = system.toJSON();
            expect(json.thieves.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitThief({});
            const json = system.toJSON();
            const newSys = new CultivationThief();
            newSys.fromJSON(json);
            expect(newSys.thieves.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.thiefCount).toBe(0);
        });
    });
});
