/**
 * CultivationMage.test.js - 修真法师系统测试
 * V599 Iteration 2/20 Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMage } from '../../../systems/ai/CultivationMage.js';

describe('CultivationMage', () => {
    let system;
    beforeEach(() => { system = new CultivationMage(); });

    describe('recruitMage', () => {
        it('should recruit with given fields', () => {
            const { mage } = system.recruitMage({ masterId: 'm1', name: 'Fire Lord', type: 'fire' });
            expect(mage.masterId).toBe('m1');
            expect(mage.name).toBe('Fire Lord');
            expect(mage.type).toBe('fire');
        });

        it('should default type to fire and mana to 50', () => {
            const { mage } = system.recruitMage({ masterId: 'm1' });
            expect(mage.type).toBe('fire');
            expect(mage.mana).toBe(50);
            expect(mage.level).toBe(1);
            expect(mage.status).toBe('novice');
            expect(mage.spells).toEqual([]);
        });

        it('should generate a mageId when not provided', () => {
            const { mage } = system.recruitMage({});
            expect(mage.mageId).toBeTruthy();
            expect(typeof mage.mageId).toBe('string');
        });

        it('should trigger mageRecruited hook', () => {
            let called = false;
            system.registerHook('mageRecruited', () => { called = true; });
            system.recruitMage({});
            expect(called).toBe(true);
        });
    });

    describe('getMage', () => {
        it('should return mage copy', () => {
            const { mage } = system.recruitMage({});
            const found = system.getMage(mage.mageId);
            expect(found).not.toBeNull();
            expect(found.mageId).toBe(mage.mageId);
        });
        it('should return null for missing', () => { expect(system.getMage('ghost')).toBeNull(); });
    });

    describe('listMages', () => {
        it('should list all mages', () => {
            system.recruitMage({});
            system.recruitMage({});
            system.recruitMage({});
            expect(system.listMages().length).toBe(3);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitMage({ masterId: 'm1' });
            system.recruitMage({ masterId: 'm2' });
            system.recruitMage({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary mages', () => {
            const { mage: a } = system.recruitMage({});
            const { mage: b } = system.recruitMage({});
            system.legendMage(a.mageId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].mageId).toBe(a.mageId);
            expect(b.status).toBe('novice');
        });
    });

    describe('addSpell', () => {
        it('should add a spell to mage', () => {
            const { mage } = system.recruitMage({});
            const result = system.addSpell(mage.mageId, 'fireball');
            expect(result.success).toBe(true);
            expect(mage.spells).toContain('fireball');
        });

        it('should reject missing mage', () => {
            const result = system.addSpell('ghost', 'x');
            expect(result.error).toBe('MAGE_NOT_FOUND');
        });

        it('should trigger spellAdded hook', () => {
            const { mage } = system.recruitMage({});
            let called = false;
            system.registerHook('spellAdded', () => { called = true; });
            system.addSpell(mage.mageId, 'ice_blast');
            expect(called).toBe(true);
        });
    });

    describe('recoverMana', () => {
        it('should recover by default 5', () => {
            const { mage } = system.recruitMage({});
            system.recoverMana(mage.mageId);
            expect(mage.mana).toBe(55);
        });

        it('should recover by custom amount', () => {
            const { mage } = system.recruitMage({});
            system.recoverMana(mage.mageId, 25);
            expect(mage.mana).toBe(75);
        });

        it('should reject missing mage', () => {
            const result = system.recoverMana('ghost', 10);
            expect(result.error).toBe('MAGE_NOT_FOUND');
        });

        it('should trigger manaRecovered hook', () => {
            const { mage } = system.recruitMage({});
            let called = false;
            system.registerHook('manaRecovered', () => { called = true; });
            system.recoverMana(mage.mageId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMage', () => {
        it('should increase level by 1', () => {
            const { mage } = system.recruitMage({});
            system.levelUpMage(mage.mageId);
            expect(mage.level).toBe(2);
        });

        it('should increase level multiple times', () => {
            const { mage } = system.recruitMage({});
            system.levelUpMage(mage.mageId);
            system.levelUpMage(mage.mageId);
            system.levelUpMage(mage.mageId);
            expect(mage.level).toBe(4);
        });

        it('should reject missing mage', () => {
            const result = system.levelUpMage('ghost');
            expect(result.error).toBe('MAGE_NOT_FOUND');
        });

        it('should trigger mageLeveledUp hook', () => {
            const { mage } = system.recruitMage({});
            let called = false;
            system.registerHook('mageLeveledUp', () => { called = true; });
            system.levelUpMage(mage.mageId);
            expect(called).toBe(true);
        });
    });

    describe('legendMage', () => {
        it('should set status to legendary', () => {
            const { mage } = system.recruitMage({});
            system.legendMage(mage.mageId);
            expect(mage.status).toBe('legendary');
        });

        it('should reject missing mage', () => {
            const result = system.legendMage('ghost');
            expect(result.error).toBe('MAGE_NOT_FOUND');
        });

        it('should trigger mageLegendized hook', () => {
            const { mage } = system.recruitMage({});
            let called = false;
            system.registerHook('mageLegendized', () => { called = true; });
            system.legendMage(mage.mageId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMageValue', () => {
        it('should calculate value with default stats', () => {
            const { mage } = system.recruitMage({});
            // level=1 * 100 + mana=50 * 2 + spells=0 * 30 = 200
            expect(system.calculateMageValue(mage.mageId)).toBe(200);
        });

        it('should calculate value with spells and leveled up', () => {
            const { mage } = system.recruitMage({});
            system.levelUpMage(mage.mageId);
            system.levelUpMage(mage.mageId);
            system.addSpell(mage.mageId, 'fireball');
            system.addSpell(mage.mageId, 'meteor');
            // level=3 * 100 + mana=50 * 2 + spells=2 * 30 = 300 + 100 + 60 = 460
            expect(system.calculateMageValue(mage.mageId)).toBe(460);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMageValue('ghost')).toBe(0);
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

        it('should execute default getMage tool', () => {
            const { mage } = system.recruitMage({});
            const result = system.executeTool('getMage', { mageId: mage.mageId });
            expect(result.success).toBe(true);
            expect(result.result.mageId).toBe(mage.mageId);
        });

        it('should execute default recruitMage tool', () => {
            const result = system.executeTool('recruitMage', { masterId: 'm1', name: 'X', type: 'water' });
            expect(result.success).toBe(true);
            expect(result.result.mage.masterId).toBe('m1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('mageRecruited', () => count++);
            unregister();
            system.recruitMage({});
            expect(count).toBe(0);
        });

        it('should handle errors silently in hooks', () => {
            system.registerHook('mageRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitMage({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient mages', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when threshold met', () => {
            system.stats.totalMages = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxMages).toBe(70);
        });
        it('should not double evolve', () => {
            system.stats.totalMages = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitMage({});
            system.recruitMage({});
            const json = system.toJSON();
            expect(json.mages.length).toBe(2);
            expect(json.stats.totalMages).toBe(2);
        });

        it('should deserialize from JSON', () => {
            system.recruitMage({ name: 'A' });
            const json = system.toJSON();
            const newSys = new CultivationMage();
            newSys.fromJSON(json);
            expect(newSys.mages.size).toBe(1);
            expect(newSys.stats.totalMages).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with count', () => {
            system.recruitMage({});
            const stats = system.getStats();
            expect(stats.mageCount).toBe(1);
            expect(stats.totalMages).toBe(1);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
