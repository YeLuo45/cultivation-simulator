/**
 * WeaponForging.test.js - 武器锻造系统测试
 * V500 Iteration 2/20 Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WeaponForging } from '../../../systems/ai/WeaponForging.js';

describe('WeaponForging', () => {
    let system;
    beforeEach(() => { system = new WeaponForging(); });

    describe('forgeWeapon', () => {
        it('should forge with defaults', () => {
            const { weapon } = system.forgeWeapon({});
            expect(weapon.smithId).toBe('unknown_smith');
            expect(weapon.name).toBe('unnamed_weapon');
            expect(weapon.type).toBe('sword');
            expect(weapon.sharpness).toBe(20);
            expect(weapon.durability).toBe(100);
            expect(weapon.enchantments).toEqual([]);
            expect(weapon.status).toBe('raw');
        });

        it('should forge with custom data', () => {
            const { weapon } = system.forgeWeapon({ smithId: 's1', name: 'SkyBlade', type: 'spear', sharpness: 80, durability: 150, enchantments: ['flame'] });
            expect(weapon.smithId).toBe('s1');
            expect(weapon.name).toBe('SkyBlade');
            expect(weapon.type).toBe('spear');
            expect(weapon.sharpness).toBe(80);
            expect(weapon.durability).toBe(150);
            expect(weapon.enchantments).toEqual(['flame']);
        });

        it('should forge with axe type', () => {
            const { weapon } = system.forgeWeapon({ type: 'axe' });
            expect(weapon.type).toBe('axe');
        });

        it('should increment totalWeapons', () => {
            system.forgeWeapon({});
            system.forgeWeapon({});
            expect(system.stats.totalWeapons).toBe(2);
        });

        it('should trigger weaponForged hook', () => {
            let called = false;
            system.registerHook('weaponForged', () => { called = true; });
            system.forgeWeapon({});
            expect(called).toBe(true);
        });
    });

    describe('getWeapon', () => {
        it('should return weapon', () => {
            const { weapon } = system.forgeWeapon({});
            const got = system.getWeapon(weapon.weaponId);
            expect(got).not.toBeNull();
            expect(got.weaponId).toBe(weapon.weaponId);
        });
        it('should return null for missing', () => { expect(system.getWeapon('ghost')).toBeNull(); });
    });

    describe('listWeapons', () => {
        it('should list all', () => {
            system.forgeWeapon({});
            system.forgeWeapon({});
            system.forgeWeapon({});
            expect(system.listWeapons().length).toBe(3);
        });

        it('should return empty list when no weapons', () => {
            expect(system.listWeapons().length).toBe(0);
        });
    });

    describe('listBySmith', () => {
        it('should filter by smith', () => {
            system.forgeWeapon({ smithId: 's1' });
            system.forgeWeapon({ smithId: 's1' });
            system.forgeWeapon({ smithId: 's2' });
            expect(system.listBySmith('s1').length).toBe(2);
            expect(system.listBySmith('s2').length).toBe(1);
            expect(system.listBySmith('s3').length).toBe(0);
        });
    });

    describe('listMastered', () => {
        it('should list only mastered weapons', () => {
            const { weapon: w1 } = system.forgeWeapon({});
            const { weapon: w2 } = system.forgeWeapon({});
            system.masterWeapon(w1.weaponId);
            expect(system.listMastered().length).toBe(1);
            expect(system.listMastered()[0].weaponId).toBe(w1.weaponId);
        });

        it('should return empty when none mastered', () => {
            system.forgeWeapon({});
            system.forgeWeapon({});
            expect(system.listMastered().length).toBe(0);
        });
    });

    describe('sharpenWeapon', () => {
        it('should sharpen by default amount', () => {
            const { weapon } = system.forgeWeapon({});
            system.sharpenWeapon(weapon.weaponId);
            expect(weapon.sharpness).toBe(25);
        });

        it('should sharpen by custom amount', () => {
            const { weapon } = system.forgeWeapon({});
            system.sharpenWeapon(weapon.weaponId, 30);
            expect(weapon.sharpness).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.sharpenWeapon('ghost', 5);
            expect(result.error).toBe('WEAPON_NOT_FOUND');
        });

        it('should trigger weaponSharpened hook', () => {
            const { weapon } = system.forgeWeapon({});
            let called = false;
            system.registerHook('weaponSharpened', () => { called = true; });
            system.sharpenWeapon(weapon.weaponId, 5);
            expect(called).toBe(true);
        });
    });

    describe('addEnchantment', () => {
        it('should add enchantment', () => {
            const { weapon } = system.forgeWeapon({});
            system.addEnchantment(weapon.weaponId, 'flame');
            expect(weapon.enchantments).toContain('flame');
            expect(weapon.enchantments.length).toBe(1);
        });

        it('should add multiple enchantments', () => {
            const { weapon } = system.forgeWeapon({});
            system.addEnchantment(weapon.weaponId, 'flame');
            system.addEnchantment(weapon.weaponId, 'frost');
            expect(weapon.enchantments).toEqual(['flame', 'frost']);
        });

        it('should reject missing', () => {
            const result = system.addEnchantment('ghost', 'flame');
            expect(result.error).toBe('WEAPON_NOT_FOUND');
        });

        it('should trigger enchantmentAdded hook', () => {
            const { weapon } = system.forgeWeapon({});
            let called = false;
            system.registerHook('enchantmentAdded', () => { called = true; });
            system.addEnchantment(weapon.weaponId, 'flame');
            expect(called).toBe(true);
        });
    });

    describe('masterWeapon', () => {
        it('should set status to mastered', () => {
            const { weapon } = system.forgeWeapon({});
            system.masterWeapon(weapon.weaponId);
            expect(weapon.status).toBe('mastered');
        });

        it('should reject missing', () => {
            const result = system.masterWeapon('ghost');
            expect(result.error).toBe('WEAPON_NOT_FOUND');
        });

        it('should trigger weaponMastered hook', () => {
            const { weapon } = system.forgeWeapon({});
            let called = false;
            system.registerHook('weaponMastered', () => { called = true; });
            system.masterWeapon(weapon.weaponId);
            expect(called).toBe(true);
        });
    });

    describe('calculateWeaponPower', () => {
        it('should calculate default power', () => {
            const { weapon } = system.forgeWeapon({});
            // sharpness=20 * 2 + durability=100 + 0 * 50 = 140
            expect(system.calculateWeaponPower(weapon.weaponId)).toBe(140);
        });

        it('should add 50 per enchantment', () => {
            const { weapon } = system.forgeWeapon({});
            system.addEnchantment(weapon.weaponId, 'flame');
            system.addEnchantment(weapon.weaponId, 'frost');
            // 40 + 100 + 2*50 = 240
            expect(system.calculateWeaponPower(weapon.weaponId)).toBe(240);
        });

        it('should reflect sharpness in formula', () => {
            const { weapon } = system.forgeWeapon({ sharpness: 50 });
            // 50 * 2 + 100 + 0 = 200
            expect(system.calculateWeaponPower(weapon.weaponId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateWeaponPower('ghost')).toBe(0);
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

        it('should execute default getWeapon', () => {
            const result = system.executeTool('getWeapon', { weaponId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('weaponForged', () => count++);
            unregister();
            system.forgeWeapon({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('weaponForged', () => { throw new Error('x'); });
            expect(() => system.forgeWeapon({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalWeapons = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalWeapons = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.forgeWeapon({});
            const json = system.toJSON();
            expect(json.weapons.length).toBe(1);
            expect(json.stats.totalWeapons).toBe(1);
        });
        it('should deserialize', () => {
            system.forgeWeapon({ name: 'a' });
            const json = system.toJSON();
            const newSys = new WeaponForging();
            newSys.fromJSON(json);
            expect(newSys.weapons.size).toBe(1);
            expect(newSys.stats.totalWeapons).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.weaponCount).toBe(0);
            expect(stats.totalWeapons).toBe(0);
            system.forgeWeapon({});
            expect(system.getStats().weaponCount).toBe(1);
        });
    });
});
