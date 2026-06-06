/**
 * ArmorSmithing.test.js - 护甲锻造系统测试
 * V501 Iteration 3/20 Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ArmorSmithing } from '../../../systems/ai/ArmorSmithing.js';

describe('ArmorSmithing', () => {
    let system;
    beforeEach(() => { system = new ArmorSmithing(); });

    describe('forgeArmor', () => {
        it('should forge with defaults', () => {
            const { armor } = system.forgeArmor({});
            expect(armor.type).toBe('plate');
            expect(armor.defense).toBe(20);
            expect(armor.durability).toBe(100);
            expect(armor.runes).toEqual([]);
            expect(armor.status).toBe('raw');
        });

        it('should forge with custom data', () => {
            const { armor } = system.forgeArmor({ name: 'DragonPlate', smithId: 's1', type: 'leather', defense: 60, durability: 150, runes: ['flame'] });
            expect(armor.name).toBe('DragonPlate');
            expect(armor.smithId).toBe('s1');
            expect(armor.type).toBe('leather');
            expect(armor.defense).toBe(60);
            expect(armor.durability).toBe(150);
            expect(armor.runes).toEqual(['flame']);
        });

        it('should trigger armorForged hook', () => {
            let called = false;
            system.registerHook('armorForged', () => { called = true; });
            system.forgeArmor({});
            expect(called).toBe(true);
        });
    });

    describe('getArmor', () => {
        it('should return armor', () => {
            const { armor } = system.forgeArmor({});
            expect(system.getArmor(armor.armorId)).not.toBeNull();
            expect(system.getArmor(armor.armorId).armorId).toBe(armor.armorId);
        });
        it('should return null for missing', () => { expect(system.getArmor('ghost')).toBeNull(); });
    });

    describe('listArmors', () => {
        it('should list all', () => {
            system.forgeArmor({});
            system.forgeArmor({});
            system.forgeArmor({});
            expect(system.listArmors().length).toBe(3);
        });

        it('should return empty list when no armors', () => {
            expect(system.listArmors().length).toBe(0);
        });
    });

    describe('listBySmith', () => {
        it('should filter by smith', () => {
            system.forgeArmor({ smithId: 's1' });
            system.forgeArmor({ smithId: 's2' });
            system.forgeArmor({ smithId: 's1' });
            expect(system.listBySmith('s1').length).toBe(2);
            expect(system.listBySmith('s2').length).toBe(1);
        });

        it('should return empty when no match', () => {
            system.forgeArmor({ smithId: 's1' });
            expect(system.listBySmith('s9').length).toBe(0);
        });
    });

    describe('listMastered', () => {
        it('should return empty when none mastered', () => {
            system.forgeArmor({});
            expect(system.listMastered().length).toBe(0);
        });

        it('should filter only mastered', () => {
            const { armor: a1 } = system.forgeArmor({});
            const { armor: a2 } = system.forgeArmor({});
            system.masterArmor(a1.armorId);
            const mastered = system.listMastered();
            expect(mastered.length).toBe(1);
            expect(mastered[0].armorId).toBe(a1.armorId);
        });
    });

    describe('reinforceArmor', () => {
        it('should reinforce by default amount', () => {
            const { armor } = system.forgeArmor({});
            system.reinforceArmor(armor.armorId);
            expect(armor.defense).toBe(25);
        });

        it('should reinforce by custom amount', () => {
            const { armor } = system.forgeArmor({});
            system.reinforceArmor(armor.armorId, 30);
            expect(armor.defense).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.reinforceArmor('ghost', 5);
            expect(result.error).toBe('ARMOR_NOT_FOUND');
        });

        it('should trigger armorReinforced hook', () => {
            const { armor } = system.forgeArmor({});
            let called = false;
            system.registerHook('armorReinforced', () => { called = true; });
            system.reinforceArmor(armor.armorId, 5);
            expect(called).toBe(true);
        });
    });

    describe('addRune', () => {
        it('should add rune to empty list', () => {
            const { armor } = system.forgeArmor({});
            system.addRune(armor.armorId, 'flame');
            expect(armor.runes).toEqual(['flame']);
        });

        it('should append rune to existing list', () => {
            const { armor } = system.forgeArmor({ runes: ['frost'] });
            system.addRune(armor.armorId, 'lightning');
            expect(armor.runes).toEqual(['frost', 'lightning']);
        });

        it('should reject missing', () => {
            const result = system.addRune('ghost', 'flame');
            expect(result.error).toBe('ARMOR_NOT_FOUND');
        });

        it('should trigger runeAdded hook', () => {
            const { armor } = system.forgeArmor({});
            let called = false;
            system.registerHook('runeAdded', () => { called = true; });
            system.addRune(armor.armorId, 'flame');
            expect(called).toBe(true);
        });
    });

    describe('masterArmor', () => {
        it('should set status to mastered', () => {
            const { armor } = system.forgeArmor({});
            system.masterArmor(armor.armorId);
            expect(armor.status).toBe('mastered');
        });

        it('should reject missing', () => {
            const result = system.masterArmor('ghost');
            expect(result.error).toBe('ARMOR_NOT_FOUND');
        });

        it('should trigger armorMastered hook', () => {
            const { armor } = system.forgeArmor({});
            let called = false;
            system.registerHook('armorMastered', () => { called = true; });
            system.masterArmor(armor.armorId);
            expect(called).toBe(true);
        });
    });

    describe('calculateArmorValue', () => {
        it('should calculate default value', () => {
            const { armor } = system.forgeArmor({});
            // defense=20, durability=100, runes=0 => 20*2 + 100 + 0 = 140
            expect(system.calculateArmorValue(armor.armorId)).toBe(140);
        });

        it('should increase with defense', () => {
            const { armor } = system.forgeArmor({ defense: 50 });
            // 50*2 + 100 + 0 = 200
            expect(system.calculateArmorValue(armor.armorId)).toBe(200);
        });

        it('should account for runes', () => {
            const { armor } = system.forgeArmor({ runes: ['a', 'b', 'c'] });
            // 20*2 + 100 + 3*30 = 230
            expect(system.calculateArmorValue(armor.armorId)).toBe(230);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateArmorValue('ghost')).toBe(0);
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

        it('should execute default getArmor', () => {
            const result = system.executeTool('getArmor', { armorId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('armorForged', () => count++);
            unregister();
            system.forgeArmor({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('armorForged', () => { throw new Error('x'); });
            expect(() => system.forgeArmor({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalArmors = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalArmors = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.forgeArmor({});
            const json = system.toJSON();
            expect(json.armors.length).toBe(1);
            expect(json.stats.totalArmors).toBe(1);
        });
        it('should deserialize', () => {
            system.forgeArmor({ name: 'a' });
            const json = system.toJSON();
            const newSys = new ArmorSmithing();
            newSys.fromJSON(json);
            expect(newSys.armors.size).toBe(1);
            expect(newSys.stats.totalArmors).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.armorCount).toBe(0);
            expect(stats.totalArmors).toBe(0);
            system.forgeArmor({});
            expect(system.getStats().armorCount).toBe(1);
        });
    });
});
