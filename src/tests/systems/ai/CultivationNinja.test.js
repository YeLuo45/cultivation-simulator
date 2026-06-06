/**
 * CultivationNinja.test.js - 修真忍者测试
 * V616 Iteration 19/20 Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationNinja } from '../../../systems/ai/CultivationNinja.js';

describe('CultivationNinja', () => {
    let system;
    beforeEach(() => { system = new CultivationNinja(); });

    describe('recruitNinja', () => {
        it('should recruit ninja', () => {
            const { ninja } = system.recruitNinja({ handlerId: 'h1', name: 'Crimson Wind' });
            expect(ninja.handlerId).toBe('h1');
            expect(ninja.name).toBe('Crimson Wind');
        });

        it('should default name to Silent Shadow', () => {
            const { ninja } = system.recruitNinja({});
            expect(ninja.name).toBe('Silent Shadow');
        });

        it('should default type to shadow', () => {
            const { ninja } = system.recruitNinja({});
            expect(ninja.type).toBe('shadow');
        });

        it('should default agility to baseAgility', () => {
            const { ninja } = system.recruitNinja({});
            expect(ninja.agility).toBe(20);
        });

        it('should start at level 1', () => {
            const { ninja } = system.recruitNinja({});
            expect(ninja.level).toBe(1);
        });

        it('should start with novice status', () => {
            const { ninja } = system.recruitNinja({});
            expect(ninja.status).toBe('novice');
        });

        it('should start with empty weapons', () => {
            const { ninja } = system.recruitNinja({});
            expect(ninja.weapons).toEqual([]);
        });

        it('should generate ninjaId', () => {
            const { ninja } = system.recruitNinja({});
            expect(ninja.ninjaId).toBeDefined();
            expect(typeof ninja.ninjaId).toBe('string');
        });

        it('should accept custom ninjaId', () => {
            const { ninja } = system.recruitNinja({ ninjaId: 'my-ninja' });
            expect(ninja.ninjaId).toBe('my-ninja');
        });

        it('should trigger ninjaRecruited hook', () => {
            let called = false;
            system.registerHook('ninjaRecruited', () => { called = true; });
            system.recruitNinja({});
            expect(called).toBe(true);
        });

        it('should support all types', () => {
            const { ninja: n1 } = system.recruitNinja({ type: 'shadow' });
            const { ninja: n2 } = system.recruitNinja({ type: 'poison' });
            const { ninja: n3 } = system.recruitNinja({ type: 'ninjutsu' });
            expect(n1.type).toBe('shadow');
            expect(n2.type).toBe('poison');
            expect(n3.type).toBe('ninjutsu');
        });

        it('should accept custom agility', () => {
            const { ninja } = system.recruitNinja({ agility: 80 });
            expect(ninja.agility).toBe(80);
        });
    });

    describe('getNinja', () => {
        it('should return ninja', () => {
            const { ninja } = system.recruitNinja({});
            expect(system.getNinja(ninja.ninjaId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getNinja('ghost')).toBeNull(); });
    });

    describe('listNinjas', () => {
        it('should list all', () => {
            system.recruitNinja({});
            system.recruitNinja({});
            expect(system.listNinjas().length).toBe(2);
        });

        it('should return empty when no ninjas', () => {
            expect(system.listNinjas().length).toBe(0);
        });
    });

    describe('listByHandler', () => {
        it('should filter by handler', () => {
            system.recruitNinja({ handlerId: 'h1' });
            system.recruitNinja({ handlerId: 'h2' });
            system.recruitNinja({ handlerId: 'h1' });
            expect(system.listByHandler('h1').length).toBe(2);
        });

        it('should return empty for unknown handler', () => {
            system.recruitNinja({ handlerId: 'h1' });
            expect(system.listByHandler('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { ninja: n1 } = system.recruitNinja({});
            const { ninja: n2 } = system.recruitNinja({});
            system.legendNinja(n1.ninjaId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].ninjaId).toBe(n1.ninjaId);
            expect(n2.status).toBe('novice');
        });

        it('should return empty when none legendary', () => {
            system.recruitNinja({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addWeapon', () => {
        it('should add weapon', () => {
            const { ninja } = system.recruitNinja({});
            system.addWeapon(ninja.ninjaId, 'katana');
            expect(ninja.weapons).toContain('katana');
        });

        it('should accumulate weapons', () => {
            const { ninja } = system.recruitNinja({});
            system.addWeapon(ninja.ninjaId, 'shuriken');
            system.addWeapon(ninja.ninjaId, 'katana');
            system.addWeapon(ninja.ninjaId, 'kunai');
            expect(ninja.weapons.length).toBe(3);
        });

        it('should reject missing ninja', () => {
            const result = system.addWeapon('ghost', 'katana');
            expect(result.error).toBe('NINJA_NOT_FOUND');
        });

        it('should trigger weaponAdded hook', () => {
            const { ninja } = system.recruitNinja({});
            let called = false;
            system.registerHook('weaponAdded', () => { called = true; });
            system.addWeapon(ninja.ninjaId, 'katana');
            expect(called).toBe(true);
        });
    });

    describe('sharpenAgility', () => {
        it('should increase agility by default', () => {
            const { ninja } = system.recruitNinja({});
            system.sharpenAgility(ninja.ninjaId);
            expect(ninja.agility).toBe(25);
        });

        it('should increase agility by custom amount', () => {
            const { ninja } = system.recruitNinja({});
            system.sharpenAgility(ninja.ninjaId, 100);
            expect(ninja.agility).toBe(120);
        });

        it('should reject missing ninja', () => {
            const result = system.sharpenAgility('ghost');
            expect(result.error).toBe('NINJA_NOT_FOUND');
        });

        it('should trigger agilitySharpened hook', () => {
            const { ninja } = system.recruitNinja({});
            let called = false;
            system.registerHook('agilitySharpened', () => { called = true; });
            system.sharpenAgility(ninja.ninjaId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpNinja', () => {
        it('should level up', () => {
            const { ninja } = system.recruitNinja({});
            system.levelUpNinja(ninja.ninjaId);
            expect(ninja.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { ninja } = system.recruitNinja({});
            system.levelUpNinja(ninja.ninjaId);
            system.levelUpNinja(ninja.ninjaId);
            system.levelUpNinja(ninja.ninjaId);
            expect(ninja.level).toBe(4);
        });

        it('should reject missing ninja', () => {
            const result = system.levelUpNinja('ghost');
            expect(result.error).toBe('NINJA_NOT_FOUND');
        });

        it('should trigger ninjaLeveledUp hook', () => {
            const { ninja } = system.recruitNinja({});
            let called = false;
            system.registerHook('ninjaLeveledUp', () => { called = true; });
            system.levelUpNinja(ninja.ninjaId);
            expect(called).toBe(true);
        });
    });

    describe('legendNinja', () => {
        it('should set status to legendary', () => {
            const { ninja } = system.recruitNinja({});
            system.legendNinja(ninja.ninjaId);
            expect(ninja.status).toBe('legendary');
        });

        it('should reject missing ninja', () => {
            const result = system.legendNinja('ghost');
            expect(result.error).toBe('NINJA_NOT_FOUND');
        });

        it('should trigger ninjaLegendized hook', () => {
            const { ninja } = system.recruitNinja({});
            let called = false;
            system.registerHook('ninjaLegendized', () => { called = true; });
            system.legendNinja(ninja.ninjaId);
            expect(called).toBe(true);
        });
    });

    describe('calculateNinjaValue', () => {
        it('should calculate base value', () => {
            const { ninja } = system.recruitNinja({});
            // level=1, agility=20, weapons=0 -> 1*100 + 20*2 + 0 = 140
            expect(system.calculateNinjaValue(ninja.ninjaId)).toBe(140);
        });

        it('should include weapons in value', () => {
            const { ninja } = system.recruitNinja({});
            system.addWeapon(ninja.ninjaId, 'katana');
            system.addWeapon(ninja.ninjaId, 'shuriken');
            // level=1, agility=20, weapons=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateNinjaValue(ninja.ninjaId)).toBe(200);
        });

        it('should scale with level', () => {
            const { ninja } = system.recruitNinja({});
            system.levelUpNinja(ninja.ninjaId);
            system.levelUpNinja(ninja.ninjaId);
            // level=3, agility=20, weapons=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculateNinjaValue(ninja.ninjaId)).toBe(340);
        });

        it('should scale with agility', () => {
            const { ninja } = system.recruitNinja({});
            system.sharpenAgility(ninja.ninjaId, 100);
            // level=1, agility=120, weapons=0 -> 1*100 + 120*2 + 0 = 340
            expect(system.calculateNinjaValue(ninja.ninjaId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateNinjaValue('ghost')).toBe(0);
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

        it('should execute default getNinja', () => {
            const result = system.executeTool('getNinja', { ninjaId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitNinja', () => {
            const result = system.executeTool('recruitNinja', { handlerId: 'h1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('ninjaRecruited', () => count++);
            unregister();
            system.recruitNinja({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('ninjaRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitNinja({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalNinjas = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalNinjas = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitNinja({});
            const json = system.toJSON();
            expect(json.ninjas.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitNinja({});
            const json = system.toJSON();
            const newSys = new CultivationNinja();
            newSys.fromJSON(json);
            expect(newSys.ninjas.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.ninjaCount).toBe(0);
        });
    });
});
