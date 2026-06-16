/**
 * CultivationEnchanter.test.js - 修真附魔师系统测试
 * V605 Iteration 8/20 Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationEnchanter } from '../../../systems/ai/CultivationEnchanter.js';

describe('CultivationEnchanter', () => {
    let system;
    beforeEach(() => { system = new CultivationEnchanter(); });

    describe('recruitEnchanter', () => {
        it('should recruit with given fields', () => {
            const { enchanter } = system.recruitEnchanter({ teacherId: 't1', name: 'Master Enchanter', type: 'blessing' });
            expect(enchanter.teacherId).toBe('t1');
            expect(enchanter.name).toBe('Master Enchanter');
            expect(enchanter.type).toBe('blessing');
        });

        it('should default type to rune and enchantment to 20', () => {
            const { enchanter } = system.recruitEnchanter({ teacherId: 't1' });
            expect(enchanter.type).toBe('rune');
            expect(enchanter.enchantment).toBe(20);
            expect(enchanter.level).toBe(1);
            expect(enchanter.status).toBe('novice');
            expect(enchanter.runes).toEqual([]);
        });

        it('should generate an enchanterId when not provided', () => {
            const { enchanter } = system.recruitEnchanter({});
            expect(enchanter.enchanterId).toBeTruthy();
            expect(typeof enchanter.enchanterId).toBe('string');
        });

        it('should trigger enchanterRecruited hook', () => {
            let called = false;
            system.registerHook('enchanterRecruited', () => { called = true; });
            system.recruitEnchanter({});
            expect(called).toBe(true);
        });
    });

    describe('getEnchanter', () => {
        it('should return enchanter copy', () => {
            const { enchanter } = system.recruitEnchanter({});
            const found = system.getEnchanter(enchanter.enchanterId);
            expect(found).not.toBeNull();
            expect(found.enchanterId).toBe(enchanter.enchanterId);
        });
        it('should return null for missing', () => { expect(system.getEnchanter('ghost')).toBeNull(); });
    });

    describe('listEnchanters', () => {
        it('should list all enchanters', () => {
            system.recruitEnchanter({});
            system.recruitEnchanter({});
            system.recruitEnchanter({});
            expect(system.listEnchanters().length).toBe(3);
        });
    });

    describe('listByTeacher', () => {
        it('should filter by teacher', () => {
            system.recruitEnchanter({ teacherId: 't1' });
            system.recruitEnchanter({ teacherId: 't2' });
            system.recruitEnchanter({ teacherId: 't1' });
            expect(system.listByTeacher('t1').length).toBe(2);
            expect(system.listByTeacher('t2').length).toBe(1);
            expect(system.listByTeacher('t3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary enchanters', () => {
            const { enchanter: a } = system.recruitEnchanter({});
            const { enchanter: b } = system.recruitEnchanter({});
            system.legendEnchanter(a.enchanterId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].enchanterId).toBe(a.enchanterId);
            expect(b.status).toBe('novice');
        });
    });

    describe('addRune', () => {
        it('should add a rune to enchanter', () => {
            const { enchanter } = system.recruitEnchanter({});
            const result = system.addRune(enchanter.enchanterId, 'flame_rune');
            expect(result.success).toBe(true);
            expect(enchanter.runes).toContain('flame_rune');
        });

        it('should reject missing enchanter', () => {
            const result = system.addRune('ghost', 'x');
            expect(result.error).toBe('ENCHANTER_NOT_FOUND');
        });

        it('should trigger runeAdded hook', () => {
            const { enchanter } = system.recruitEnchanter({});
            let called = false;
            system.registerHook('runeAdded', () => { called = true; });
            system.addRune(enchanter.enchanterId, 'ice_rune');
            expect(called).toBe(true);
        });
    });

    describe('improveEnchantment', () => {
        it('should improve by default 5', () => {
            const { enchanter } = system.recruitEnchanter({});
            system.improveEnchantment(enchanter.enchanterId);
            expect(enchanter.enchantment).toBe(25);
        });

        it('should improve by custom amount', () => {
            const { enchanter } = system.recruitEnchanter({});
            system.improveEnchantment(enchanter.enchanterId, 30);
            expect(enchanter.enchantment).toBe(50);
        });

        it('should reject missing enchanter', () => {
            const result = system.improveEnchantment('ghost', 10);
            expect(result.error).toBe('ENCHANTER_NOT_FOUND');
        });

        it('should trigger enchantmentImproved hook', () => {
            const { enchanter } = system.recruitEnchanter({});
            let called = false;
            system.registerHook('enchantmentImproved', () => { called = true; });
            system.improveEnchantment(enchanter.enchanterId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpEnchanter', () => {
        it('should level up', () => {
            const { enchanter } = system.recruitEnchanter({});
            system.levelUpEnchanter(enchanter.enchanterId);
            expect(enchanter.level).toBe(2);
        });

        it('should reject missing enchanter', () => {
            const result = system.levelUpEnchanter('ghost');
            expect(result.error).toBe('ENCHANTER_NOT_FOUND');
        });

        it('should trigger enchanterLeveledUp hook', () => {
            const { enchanter } = system.recruitEnchanter({});
            let called = false;
            system.registerHook('enchanterLeveledUp', () => { called = true; });
            system.levelUpEnchanter(enchanter.enchanterId);
            expect(called).toBe(true);
        });
    });

    describe('legendEnchanter', () => {
        it('should set status to legendary', () => {
            const { enchanter } = system.recruitEnchanter({});
            system.legendEnchanter(enchanter.enchanterId);
            expect(enchanter.status).toBe('legendary');
        });

        it('should reject missing enchanter', () => {
            const result = system.legendEnchanter('ghost');
            expect(result.error).toBe('ENCHANTER_NOT_FOUND');
        });

        it('should trigger enchanterLegendized hook', () => {
            const { enchanter } = system.recruitEnchanter({});
            let called = false;
            system.registerHook('enchanterLegendized', () => { called = true; });
            system.legendEnchanter(enchanter.enchanterId);
            expect(called).toBe(true);
        });
    });

    describe('calculateEnchanterValue', () => {
        it('should calculate value with no runes', () => {
            const { enchanter } = system.recruitEnchanter({ enchantment: 10 });
            // 1 * 100 + 10 * 2 + 0 * 30 = 120
            expect(system.calculateEnchanterValue(enchanter.enchanterId)).toBe(120);
        });

        it('should calculate value with runes and level', () => {
            const { enchanter } = system.recruitEnchanter({ enchantment: 10 });
            system.levelUpEnchanter(enchanter.enchanterId);
            system.addRune(enchanter.enchanterId, 'a');
            system.addRune(enchanter.enchanterId, 'b');
            // 2 * 100 + 10 * 2 + 2 * 30 = 200 + 20 + 60 = 280
            expect(system.calculateEnchanterValue(enchanter.enchanterId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateEnchanterValue('ghost')).toBe(0);
        });
    });

    describe('Tool System', () => {
        it('should register and list tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute custom tool', () => {
            system.registerTool('test', (ctx) => ctx.value);
            const result = system.executeTool('test', { value: 42 });
            expect(result.success).toBe(true);
            expect(result.result).toBe(42);
        });

        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should handle tool execution errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.success).toBe(false);
            expect(result.error).toBe('boom');
        });

        it('should default context to empty object when null', () => {
            system.registerTool('test', (ctx) => ctx);
            const result = system.executeTool('test', null);
            expect(result.success).toBe(true);
            expect(result.result).toEqual({});
        });

        it('should execute default recruitEnchanter tool', () => {
            const result = system.executeTool('recruitEnchanter', { teacherId: 't1', name: 'X', type: 'curse' });
            expect(result.success).toBe(true);
            expect(result.result.enchanter.teacherId).toBe('t1');
        });

        it('should execute default getEnchanter tool', () => {
            const { enchanter } = system.recruitEnchanter({});
            const result = system.executeTool('getEnchanter', { enchanterId: enchanter.enchanterId });
            expect(result.success).toBe(true);
            expect(result.result.enchanterId).toBe(enchanter.enchanterId);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('enchanterRecruited', () => count++);
            unregister();
            system.recruitEnchanter({});
            expect(count).toBe(0);
        });

        it('should handle errors silently in hooks', () => {
            system.registerHook('enchanterRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitEnchanter({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient enchanters', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when threshold met', () => {
            system.stats.totalEnchanters = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxEnchanters).toBe(70);
        });
        it('should not double evolve', () => {
            system.stats.totalEnchanters = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitEnchanter({});
            system.recruitEnchanter({});
            const json = system.toJSON();
            expect(json.enchanters.length).toBe(2);
            expect(json.stats.totalEnchanters).toBe(2);
        });

        it('should deserialize from JSON', () => {
            system.recruitEnchanter({ name: 'A' });
            const json = system.toJSON();
            const newSys = new CultivationEnchanter();
            newSys.fromJSON(json);
            expect(newSys.enchanters.size).toBe(1);
            expect(newSys.stats.totalEnchanters).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with count', () => {
            system.recruitEnchanter({});
            const stats = system.getStats();
            expect(stats.enchanterCount).toBe(1);
            expect(stats.totalEnchanters).toBe(1);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
