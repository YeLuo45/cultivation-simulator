/**
 * CultivationMana.test.js - 修真法力系统测试
 * V724 Iteration 17/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMana } from '../../../systems/ai/CultivationMana.js';

describe('CultivationMana', () => {
    let system;
    beforeEach(() => { system = new CultivationMana(); });

    describe('recruitMana', () => {
        it('should recruit with given fields', () => {
            const { mana } = system.recruitMana({ masterId: 'm1', name: 'Spirit Force', type: 'spirit' });
            expect(mana.masterId).toBe('m1');
            expect(mana.name).toBe('Spirit Force');
            expect(mana.type).toBe('spirit');
        });

        it('should default type to divine and power to 20', () => {
            const { mana } = system.recruitMana({ masterId: 'm1' });
            expect(mana.type).toBe('divine');
            expect(mana.power).toBe(20);
            expect(mana.level).toBe(1);
            expect(mana.status).toBe('novice');
            expect(mana.spells).toEqual([]);
        });

        it('should generate a manaId when not provided', () => {
            const { mana } = system.recruitMana({});
            expect(mana.manaId).toBeTruthy();
            expect(typeof mana.manaId).toBe('string');
        });

        it('should trigger manaRecruited hook', () => {
            let called = false;
            system.registerHook('manaRecruited', () => { called = true; });
            system.recruitMana({});
            expect(called).toBe(true);
        });
    });

    describe('getMana', () => {
        it('should return mana copy', () => {
            const { mana } = system.recruitMana({});
            const found = system.getMana(mana.manaId);
            expect(found).not.toBeNull();
            expect(found.manaId).toBe(mana.manaId);
        });
        it('should return null for missing', () => { expect(system.getMana('ghost')).toBeNull(); });
    });

    describe('listManas', () => {
        it('should list all manas', () => {
            system.recruitMana({});
            system.recruitMana({});
            system.recruitMana({});
            expect(system.listManas().length).toBe(3);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitMana({ masterId: 'm1' });
            system.recruitMana({ masterId: 'm2' });
            system.recruitMana({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary manas', () => {
            const { mana: a } = system.recruitMana({});
            const { mana: b } = system.recruitMana({});
            system.legendMana(a.manaId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].manaId).toBe(a.manaId);
            expect(b.status).toBe('novice');
        });
    });

    describe('addSpell', () => {
        it('should add a spell to mana', () => {
            const { mana } = system.recruitMana({});
            const result = system.addSpell(mana.manaId, 'celestial_strike');
            expect(result.success).toBe(true);
            expect(mana.spells).toContain('celestial_strike');
        });

        it('should reject missing mana', () => {
            const result = system.addSpell('ghost', 'x');
            expect(result.error).toBe('MANA_NOT_FOUND');
        });

        it('should trigger spellAdded hook', () => {
            const { mana } = system.recruitMana({});
            let called = false;
            system.registerHook('spellAdded', () => { called = true; });
            system.addSpell(mana.manaId, 'spirit_blast');
            expect(called).toBe(true);
        });
    });

    describe('raisePower', () => {
        it('should raise power by default 5', () => {
            const { mana } = system.recruitMana({});
            system.raisePower(mana.manaId);
            expect(mana.power).toBe(25);
        });

        it('should raise power by custom amount', () => {
            const { mana } = system.recruitMana({});
            system.raisePower(mana.manaId, 30);
            expect(mana.power).toBe(50);
        });

        it('should reject missing mana', () => {
            const result = system.raisePower('ghost', 10);
            expect(result.error).toBe('MANA_NOT_FOUND');
        });

        it('should trigger powerRaised hook', () => {
            const { mana } = system.recruitMana({});
            let called = false;
            system.registerHook('powerRaised', () => { called = true; });
            system.raisePower(mana.manaId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMana', () => {
        it('should increase level by 1', () => {
            const { mana } = system.recruitMana({});
            system.levelUpMana(mana.manaId);
            expect(mana.level).toBe(2);
        });

        it('should increase level multiple times', () => {
            const { mana } = system.recruitMana({});
            system.levelUpMana(mana.manaId);
            system.levelUpMana(mana.manaId);
            system.levelUpMana(mana.manaId);
            expect(mana.level).toBe(4);
        });

        it('should reject missing mana', () => {
            const result = system.levelUpMana('ghost');
            expect(result.error).toBe('MANA_NOT_FOUND');
        });

        it('should trigger manaLeveledUp hook', () => {
            const { mana } = system.recruitMana({});
            let called = false;
            system.registerHook('manaLeveledUp', () => { called = true; });
            system.levelUpMana(mana.manaId);
            expect(called).toBe(true);
        });
    });

    describe('legendMana', () => {
        it('should set status to legendary', () => {
            const { mana } = system.recruitMana({});
            system.legendMana(mana.manaId);
            expect(mana.status).toBe('legendary');
        });

        it('should reject missing mana', () => {
            const result = system.legendMana('ghost');
            expect(result.error).toBe('MANA_NOT_FOUND');
        });

        it('should trigger manaLegendized hook', () => {
            const { mana } = system.recruitMana({});
            let called = false;
            system.registerHook('manaLegendized', () => { called = true; });
            system.legendMana(mana.manaId);
            expect(called).toBe(true);
        });
    });

    describe('calculateManaValue', () => {
        it('should calculate value with default stats', () => {
            const { mana } = system.recruitMana({});
            // level=1 * 100 + power=20 * 2 + spells=0 * 30 = 100 + 40 + 0 = 140
            expect(system.calculateManaValue(mana.manaId)).toBe(140);
        });

        it('should calculate value with spells and leveled up', () => {
            const { mana } = system.recruitMana({});
            system.levelUpMana(mana.manaId);
            system.levelUpMana(mana.manaId);
            system.addSpell(mana.manaId, 'celestial_strike');
            system.addSpell(mana.manaId, 'cosmic_burst');
            system.raisePower(mana.manaId, 10);
            // level=3 * 100 + power=30 * 2 + spells=2 * 30 = 300 + 60 + 60 = 420
            expect(system.calculateManaValue(mana.manaId)).toBe(420);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateManaValue('ghost')).toBe(0);
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

        it('should execute default getMana tool', () => {
            const { mana } = system.recruitMana({});
            const result = system.executeTool('getMana', { manaId: mana.manaId });
            expect(result.success).toBe(true);
            expect(result.result.manaId).toBe(mana.manaId);
        });

        it('should execute default recruitMana tool', () => {
            const result = system.executeTool('recruitMana', { masterId: 'm1', name: 'X', type: 'cosmic' });
            expect(result.success).toBe(true);
            expect(result.result.mana.masterId).toBe('m1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('manaRecruited', () => count++);
            unregister();
            system.recruitMana({});
            expect(count).toBe(0);
        });

        it('should handle errors silently in hooks', () => {
            system.registerHook('manaRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitMana({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient manas', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when threshold met', () => {
            system.stats.totalManas = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxManas).toBe(50);
        });
        it('should not double evolve', () => {
            system.stats.totalManas = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitMana({});
            system.recruitMana({});
            const json = system.toJSON();
            expect(json.manas.length).toBe(2);
            expect(json.stats.totalManas).toBe(2);
        });

        it('should deserialize from JSON', () => {
            system.recruitMana({ name: 'A' });
            const json = system.toJSON();
            const newSys = new CultivationMana();
            newSys.fromJSON(json);
            expect(newSys.manas.size).toBe(1);
            expect(newSys.stats.totalManas).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with count', () => {
            system.recruitMana({});
            const stats = system.getStats();
            expect(stats.manaCount).toBe(1);
            expect(stats.totalManas).toBe(1);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
