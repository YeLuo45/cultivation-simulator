/**
 * CultivationRune.test.js - 修真卢恩系统测试
 * V762 Iteration 25/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationRune } from '../../../systems/ai/CultivationRune.js';

describe('CultivationRune', () => {
    let system;
    beforeEach(() => { system = new CultivationRune(); });

    describe('recruitRune', () => {
        it('should recruit rune', () => {
            const { rune } = system.recruitRune({ masterId: 'm1', name: 'Heaven Rune', type: 'futhark' });
            expect(rune.masterId).toBe('m1');
            expect(rune.name).toBe('Heaven Rune');
            expect(rune.type).toBe('futhark');
        });

        it('should default type to elder', () => {
            const { rune } = system.recruitRune({});
            expect(rune.type).toBe('elder');
        });

        it('should default name to Unnamed Rune', () => {
            const { rune } = system.recruitRune({});
            expect(rune.name).toBe('Unnamed Rune');
        });

        it('should default power to basePower', () => {
            const { rune } = system.recruitRune({});
            expect(rune.power).toBe(20);
        });

        it('should start at level 1', () => {
            const { rune } = system.recruitRune({});
            expect(rune.level).toBe(1);
        });

        it('should start with status novice', () => {
            const { rune } = system.recruitRune({});
            expect(rune.status).toBe('novice');
        });

        it('should start with empty engravings', () => {
            const { rune } = system.recruitRune({});
            expect(rune.engravings).toEqual([]);
        });

        it('should generate runeId', () => {
            const { rune } = system.recruitRune({});
            expect(rune.runeId).toBeDefined();
            expect(typeof rune.runeId).toBe('string');
        });

        it('should accept custom runeId', () => {
            const { rune } = system.recruitRune({ runeId: 'my-rune' });
            expect(rune.runeId).toBe('my-rune');
        });

        it('should support all types', () => {
            const { rune: r1 } = system.recruitRune({ type: 'elder' });
            const { rune: r2 } = system.recruitRune({ type: 'futhark' });
            const { rune: r3 } = system.recruitRune({ type: 'sacred' });
            expect(r1.type).toBe('elder');
            expect(r2.type).toBe('futhark');
            expect(r3.type).toBe('sacred');
        });

        it('should trigger runeRecruited hook', () => {
            let called = false;
            system.registerHook('runeRecruited', () => { called = true; });
            system.recruitRune({});
            expect(called).toBe(true);
        });
    });

    describe('getRune', () => {
        it('should return rune', () => {
            const { rune } = system.recruitRune({});
            expect(system.getRune(rune.runeId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getRune('ghost')).toBeNull(); });
    });

    describe('listRunes', () => {
        it('should list all', () => {
            system.recruitRune({});
            system.recruitRune({});
            expect(system.listRunes().length).toBe(2);
        });

        it('should return empty when no runes', () => {
            expect(system.listRunes().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitRune({ masterId: 'm1' });
            system.recruitRune({ masterId: 'm2' });
            system.recruitRune({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for missing master', () => {
            system.recruitRune({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { rune: r1 } = system.recruitRune({});
            const { rune: r2 } = system.recruitRune({});
            system.legendRune(r1.runeId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].runeId).toBe(r1.runeId);
        });

        it('should return empty when none legendary', () => {
            system.recruitRune({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addEngraving', () => {
        it('should add engraving', () => {
            const { rune } = system.recruitRune({});
            system.addEngraving(rune.runeId, 'dragon-engraving');
            expect(rune.engravings).toContain('dragon-engraving');
            expect(rune.engravings.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addEngraving('ghost', 'engraving');
            expect(result.error).toBe('RUNE_NOT_FOUND');
        });

        it('should trigger engravingAdded hook', () => {
            const { rune } = system.recruitRune({});
            let called = false;
            system.registerHook('engravingAdded', () => { called = true; });
            system.addEngraving(rune.runeId, 'engraving');
            expect(called).toBe(true);
        });

        it('should add multiple engravings', () => {
            const { rune } = system.recruitRune({});
            system.addEngraving(rune.runeId, 'eng1');
            system.addEngraving(rune.runeId, 'eng2');
            expect(rune.engravings.length).toBe(2);
        });
    });

    describe('raisePower', () => {
        it('should raise power', () => {
            const { rune } = system.recruitRune({});
            system.raisePower(rune.runeId, 10);
            expect(rune.power).toBe(30);
        });

        it('should default amount to 5', () => {
            const { rune } = system.recruitRune({});
            system.raisePower(rune.runeId);
            expect(rune.power).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raisePower('ghost', 10);
            expect(result.error).toBe('RUNE_NOT_FOUND');
        });

        it('should trigger powerRaised hook', () => {
            const { rune } = system.recruitRune({});
            let called = false;
            system.registerHook('powerRaised', () => { called = true; });
            system.raisePower(rune.runeId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpRune', () => {
        it('should level up', () => {
            const { rune } = system.recruitRune({});
            system.levelUpRune(rune.runeId);
            expect(rune.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpRune('ghost');
            expect(result.error).toBe('RUNE_NOT_FOUND');
        });

        it('should trigger runeLeveledUp hook', () => {
            const { rune } = system.recruitRune({});
            let called = false;
            system.registerHook('runeLeveledUp', () => { called = true; });
            system.levelUpRune(rune.runeId);
            expect(called).toBe(true);
        });
    });

    describe('legendRune', () => {
        it('should set status to legendary', () => {
            const { rune } = system.recruitRune({});
            system.legendRune(rune.runeId);
            expect(rune.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendRune('ghost');
            expect(result.error).toBe('RUNE_NOT_FOUND');
        });

        it('should trigger runeLegendized hook', () => {
            const { rune } = system.recruitRune({});
            let called = false;
            system.registerHook('runeLegendized', () => { called = true; });
            system.legendRune(rune.runeId);
            expect(called).toBe(true);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitRune({ type: 'elder' });
            system.recruitRune({ type: 'futhark' });
            system.recruitRune({ type: 'sacred' });
            expect(system.listByType('futhark').length).toBe(1);
        });

        it('should return empty for missing type', () => {
            system.recruitRune({ type: 'elder' });
            expect(system.listByType('shadow').length).toBe(0);
        });
    });

    describe('listVeteran', () => {
        it('should return empty when no veteran runes', () => {
            system.recruitRune({});
            expect(system.listVeteran().length).toBe(0);
        });
    });

    describe('calculateRuneValue', () => {
        it('should calculate for default rune', () => {
            const { rune } = system.recruitRune({});
            // level 1 * 100 + power 20 * 2 + 0 engravings * 30 = 100 + 40 + 0 = 140
            expect(system.calculateRuneValue(rune.runeId)).toBe(140);
        });

        it('should incorporate level, power, and engravings', () => {
            const { rune } = system.recruitRune({});
            system.levelUpRune(rune.runeId); // level 2
            system.raisePower(rune.runeId, 10); // power 30
            system.addEngraving(rune.runeId, 'eng1'); // 1 engraving
            system.addEngraving(rune.runeId, 'eng2'); // 2 engravings
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateRuneValue(rune.runeId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateRuneValue('ghost')).toBe(0);
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

        it('should execute default getRune', () => {
            const result = system.executeTool('getRune', { runeId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('runeRecruited', () => count++);
            unregister();
            system.recruitRune({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('runeRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitRune({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalRunes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalRunes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitRune({});
            const json = system.toJSON();
            expect(json.runes.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitRune({});
            const json = system.toJSON();
            const newSys = new CultivationRune();
            newSys.fromJSON(json);
            expect(newSys.runes.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.runeCount).toBe(0);
        });
    });
});
