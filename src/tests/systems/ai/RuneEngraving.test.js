/**
 * RuneEngraving.test.js - 符文雕刻系统测试
 * V507 Iteration 9/20 Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RuneEngraving } from '../../../systems/ai/RuneEngraving.js';

describe('RuneEngraving', () => {
    let system;
    beforeEach(() => { system = new RuneEngraving(); });

    describe('engraveRune', () => {
        it('should engrave with given fields', () => {
            const { rune } = system.engraveRune({ engraverId: 'e1', name: 'Flame Sigil', type: 'fire' });
            expect(rune.engraverId).toBe('e1');
            expect(rune.name).toBe('Flame Sigil');
            expect(rune.type).toBe('fire');
        });

        it('should default type to fire and precision to 15', () => {
            const { rune } = system.engraveRune({ engraverId: 'e1' });
            expect(rune.type).toBe('fire');
            expect(rune.precision).toBe(15);
            expect(rune.status).toBe('draft');
            expect(rune.materials).toEqual([]);
        });

        it('should generate a runeId when not provided', () => {
            const { rune } = system.engraveRune({});
            expect(rune.runeId).toBeTruthy();
            expect(typeof rune.runeId).toBe('string');
        });

        it('should trigger runeEngraved hook', () => {
            let called = false;
            system.registerHook('runeEngraved', () => { called = true; });
            system.engraveRune({});
            expect(called).toBe(true);
        });
    });

    describe('getRune', () => {
        it('should return rune copy', () => {
            const { rune } = system.engraveRune({});
            const found = system.getRune(rune.runeId);
            expect(found).not.toBeNull();
            expect(found.runeId).toBe(rune.runeId);
        });
        it('should return null for missing', () => { expect(system.getRune('ghost')).toBeNull(); });
    });

    describe('listRunes', () => {
        it('should list all runes', () => {
            system.engraveRune({});
            system.engraveRune({});
            system.engraveRune({});
            expect(system.listRunes().length).toBe(3);
        });
    });

    describe('listByEngraver', () => {
        it('should filter by engraver', () => {
            system.engraveRune({ engraverId: 'e1' });
            system.engraveRune({ engraverId: 'e2' });
            system.engraveRune({ engraverId: 'e1' });
            expect(system.listByEngraver('e1').length).toBe(2);
            expect(system.listByEngraver('e2').length).toBe(1);
            expect(system.listByEngraver('e3').length).toBe(0);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.engraveRune({ type: 'fire' });
            system.engraveRune({ type: 'water' });
            system.engraveRune({ type: 'fire' });
            expect(system.listByType('fire').length).toBe(2);
            expect(system.listByType('water').length).toBe(1);
            expect(system.listByType('earth').length).toBe(0);
        });
    });

    describe('listMastered', () => {
        it('should list only mastered runes', () => {
            const { rune: a } = system.engraveRune({});
            const { rune: b } = system.engraveRune({});
            system.masterRune(a.runeId);
            expect(system.listMastered().length).toBe(1);
            expect(system.listMastered()[0].runeId).toBe(a.runeId);
            expect(b.status).toBe('draft');
        });
    });

    describe('addMaterial', () => {
        it('should add a material to rune', () => {
            const { rune } = system.engraveRune({});
            const result = system.addMaterial(rune.runeId, 'dragon_blood');
            expect(result.success).toBe(true);
            expect(rune.materials).toContain('dragon_blood');
        });

        it('should reject missing rune', () => {
            const result = system.addMaterial('ghost', 'x');
            expect(result.error).toBe('RUNE_NOT_FOUND');
        });

        it('should trigger materialAdded hook', () => {
            const { rune } = system.engraveRune({});
            let called = false;
            system.registerHook('materialAdded', () => { called = true; });
            system.addMaterial(rune.runeId, 'ice_crystal');
            expect(called).toBe(true);
        });
    });

    describe('refineRune', () => {
        it('should refine by default 5', () => {
            const { rune } = system.engraveRune({});
            system.refineRune(rune.runeId);
            expect(rune.precision).toBe(20);
        });

        it('should refine by custom amount', () => {
            const { rune } = system.engraveRune({});
            system.refineRune(rune.runeId, 25);
            expect(rune.precision).toBe(40);
        });

        it('should promote status to engraved on refine from draft', () => {
            const { rune } = system.engraveRune({});
            system.refineRune(rune.runeId);
            expect(rune.status).toBe('engraved');
        });

        it('should reject missing rune', () => {
            const result = system.refineRune('ghost', 10);
            expect(result.error).toBe('RUNE_NOT_FOUND');
        });

        it('should trigger runeRefined hook', () => {
            const { rune } = system.engraveRune({});
            let called = false;
            system.registerHook('runeRefined', () => { called = true; });
            system.refineRune(rune.runeId, 5);
            expect(called).toBe(true);
        });
    });

    describe('masterRune', () => {
        it('should set status to mastered', () => {
            const { rune } = system.engraveRune({});
            system.masterRune(rune.runeId);
            expect(rune.status).toBe('mastered');
        });

        it('should reject missing rune', () => {
            const result = system.masterRune('ghost');
            expect(result.error).toBe('RUNE_NOT_FOUND');
        });

        it('should trigger runeMastered hook', () => {
            const { rune } = system.engraveRune({});
            let called = false;
            system.registerHook('runeMastered', () => { called = true; });
            system.masterRune(rune.runeId);
            expect(called).toBe(true);
        });
    });

    describe('calculateRunePower', () => {
        it('should calculate power with no materials', () => {
            const { rune } = system.engraveRune({ precision: 20 });
            // 20 * 10 + 0 * 20 = 200
            expect(system.calculateRunePower(rune.runeId)).toBe(200);
        });

        it('should calculate power with materials', () => {
            const { rune } = system.engraveRune({ precision: 20 });
            system.addMaterial(rune.runeId, 'a');
            system.addMaterial(rune.runeId, 'b');
            // 20 * 10 + 2 * 20 = 240
            expect(system.calculateRunePower(rune.runeId)).toBe(240);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateRunePower('ghost')).toBe(0);
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

        it('should execute default getRune tool', () => {
            const { rune } = system.engraveRune({});
            const result = system.executeTool('getRune', { runeId: rune.runeId });
            expect(result.success).toBe(true);
            expect(result.result.runeId).toBe(rune.runeId);
        });

        it('should execute default engraveRune tool', () => {
            const result = system.executeTool('engraveRune', { engraverId: 'e1', name: 'X', type: 'water' });
            expect(result.success).toBe(true);
            expect(result.result.rune.engraverId).toBe('e1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('runeEngraved', () => count++);
            unregister();
            system.engraveRune({});
            expect(count).toBe(0);
        });

        it('should handle errors silently in hooks', () => {
            system.registerHook('runeEngraved', () => { throw new Error('x'); });
            expect(() => system.engraveRune({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient runes', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when threshold met', () => {
            system.stats.totalRunes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxRunes).toBe(250);
        });
        it('should not double evolve', () => {
            system.stats.totalRunes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.engraveRune({});
            system.engraveRune({});
            const json = system.toJSON();
            expect(json.runes.length).toBe(2);
            expect(json.stats.totalRunes).toBe(2);
        });

        it('should deserialize from JSON', () => {
            system.engraveRune({ name: 'A' });
            const json = system.toJSON();
            const newSys = new RuneEngraving();
            newSys.fromJSON(json);
            expect(newSys.runes.size).toBe(1);
            expect(newSys.stats.totalRunes).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with count', () => {
            system.engraveRune({});
            const stats = system.getStats();
            expect(stats.runeCount).toBe(1);
            expect(stats.totalRunes).toBe(1);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
