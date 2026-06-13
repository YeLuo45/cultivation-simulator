/**
 * CultivationGlyph.test.js - 修真符文系统测试
 * V761 Iteration 24/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationGlyph } from '../../../systems/ai/CultivationGlyph.js';

describe('CultivationGlyph', () => {
    let system;
    beforeEach(() => { system = new CultivationGlyph(); });

    describe('recruitGlyph', () => {
        it('should recruit glyph', () => {
            const { glyph } = system.recruitGlyph({ masterId: 'm1', name: 'Heaven Glyph', type: 'divine' });
            expect(glyph.masterId).toBe('m1');
            expect(glyph.name).toBe('Heaven Glyph');
            expect(glyph.type).toBe('divine');
        });

        it('should default type to arcane', () => {
            const { glyph } = system.recruitGlyph({});
            expect(glyph.type).toBe('arcane');
        });

        it('should default name to Unnamed Glyph', () => {
            const { glyph } = system.recruitGlyph({});
            expect(glyph.name).toBe('Unnamed Glyph');
        });

        it('should default depth to baseDepth', () => {
            const { glyph } = system.recruitGlyph({});
            expect(glyph.depth).toBe(20);
        });

        it('should start at level 1', () => {
            const { glyph } = system.recruitGlyph({});
            expect(glyph.level).toBe(1);
        });

        it('should start with status novice', () => {
            const { glyph } = system.recruitGlyph({});
            expect(glyph.status).toBe('novice');
        });

        it('should start with empty strokes', () => {
            const { glyph } = system.recruitGlyph({});
            expect(glyph.strokes).toEqual([]);
        });

        it('should generate glyphId', () => {
            const { glyph } = system.recruitGlyph({});
            expect(glyph.glyphId).toBeDefined();
            expect(typeof glyph.glyphId).toBe('string');
        });

        it('should accept custom glyphId', () => {
            const { glyph } = system.recruitGlyph({ glyphId: 'my-glyph' });
            expect(glyph.glyphId).toBe('my-glyph');
        });

        it('should support all types', () => {
            const { glyph: g1 } = system.recruitGlyph({ type: 'arcane' });
            const { glyph: g2 } = system.recruitGlyph({ type: 'divine' });
            const { glyph: g3 } = system.recruitGlyph({ type: 'cosmic' });
            expect(g1.type).toBe('arcane');
            expect(g2.type).toBe('divine');
            expect(g3.type).toBe('cosmic');
        });

        it('should trigger glyphRecruited hook', () => {
            let called = false;
            system.registerHook('glyphRecruited', () => { called = true; });
            system.recruitGlyph({});
            expect(called).toBe(true);
        });
    });

    describe('getGlyph', () => {
        it('should return glyph', () => {
            const { glyph } = system.recruitGlyph({});
            expect(system.getGlyph(glyph.glyphId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getGlyph('ghost')).toBeNull(); });
    });

    describe('listGlyphs', () => {
        it('should list all', () => {
            system.recruitGlyph({});
            system.recruitGlyph({});
            expect(system.listGlyphs().length).toBe(2);
        });

        it('should return empty when no glyphs', () => {
            expect(system.listGlyphs().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitGlyph({ masterId: 'm1' });
            system.recruitGlyph({ masterId: 'm2' });
            system.recruitGlyph({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for missing master', () => {
            system.recruitGlyph({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { glyph: g1 } = system.recruitGlyph({});
            const { glyph: g2 } = system.recruitGlyph({});
            system.legendGlyph(g1.glyphId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].glyphId).toBe(g1.glyphId);
        });

        it('should return empty when none legendary', () => {
            system.recruitGlyph({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addStroke', () => {
        it('should add stroke', () => {
            const { glyph } = system.recruitGlyph({});
            system.addStroke(glyph.glyphId, 'dragon-stroke');
            expect(glyph.strokes).toContain('dragon-stroke');
            expect(glyph.strokes.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addStroke('ghost', 'stroke');
            expect(result.error).toBe('GLYPH_NOT_FOUND');
        });

        it('should trigger strokeAdded hook', () => {
            const { glyph } = system.recruitGlyph({});
            let called = false;
            system.registerHook('strokeAdded', () => { called = true; });
            system.addStroke(glyph.glyphId, 'stroke');
            expect(called).toBe(true);
        });

        it('should add multiple strokes', () => {
            const { glyph } = system.recruitGlyph({});
            system.addStroke(glyph.glyphId, 'stroke1');
            system.addStroke(glyph.glyphId, 'stroke2');
            expect(glyph.strokes.length).toBe(2);
        });
    });

    describe('raiseDepth', () => {
        it('should raise depth', () => {
            const { glyph } = system.recruitGlyph({});
            system.raiseDepth(glyph.glyphId, 10);
            expect(glyph.depth).toBe(30);
        });

        it('should default amount to 5', () => {
            const { glyph } = system.recruitGlyph({});
            system.raiseDepth(glyph.glyphId);
            expect(glyph.depth).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseDepth('ghost', 10);
            expect(result.error).toBe('GLYPH_NOT_FOUND');
        });

        it('should trigger depthRaised hook', () => {
            const { glyph } = system.recruitGlyph({});
            let called = false;
            system.registerHook('depthRaised', () => { called = true; });
            system.raiseDepth(glyph.glyphId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpGlyph', () => {
        it('should level up', () => {
            const { glyph } = system.recruitGlyph({});
            system.levelUpGlyph(glyph.glyphId);
            expect(glyph.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpGlyph('ghost');
            expect(result.error).toBe('GLYPH_NOT_FOUND');
        });

        it('should trigger glyphLeveledUp hook', () => {
            const { glyph } = system.recruitGlyph({});
            let called = false;
            system.registerHook('glyphLeveledUp', () => { called = true; });
            system.levelUpGlyph(glyph.glyphId);
            expect(called).toBe(true);
        });
    });

    describe('legendGlyph', () => {
        it('should set status to legendary', () => {
            const { glyph } = system.recruitGlyph({});
            system.legendGlyph(glyph.glyphId);
            expect(glyph.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendGlyph('ghost');
            expect(result.error).toBe('GLYPH_NOT_FOUND');
        });

        it('should trigger glyphLegendized hook', () => {
            const { glyph } = system.recruitGlyph({});
            let called = false;
            system.registerHook('glyphLegendized', () => { called = true; });
            system.legendGlyph(glyph.glyphId);
            expect(called).toBe(true);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitGlyph({ type: 'arcane' });
            system.recruitGlyph({ type: 'divine' });
            system.recruitGlyph({ type: 'cosmic' });
            expect(system.listByType('divine').length).toBe(1);
        });

        it('should return empty for missing type', () => {
            system.recruitGlyph({ type: 'arcane' });
            expect(system.listByType('shadow').length).toBe(0);
        });
    });

    describe('listVeteran', () => {
        it('should return empty when no veteran glyphs', () => {
            system.recruitGlyph({});
            expect(system.listVeteran().length).toBe(0);
        });
    });

    describe('calculateGlyphValue', () => {
        it('should calculate for default glyph', () => {
            const { glyph } = system.recruitGlyph({});
            // level 1 * 100 + depth 20 * 2 + 0 strokes * 30 = 100 + 40 + 0 = 140
            expect(system.calculateGlyphValue(glyph.glyphId)).toBe(140);
        });

        it('should incorporate level, depth, and strokes', () => {
            const { glyph } = system.recruitGlyph({});
            system.levelUpGlyph(glyph.glyphId); // level 2
            system.raiseDepth(glyph.glyphId, 10); // depth 30
            system.addStroke(glyph.glyphId, 'stroke1'); // 1 stroke
            system.addStroke(glyph.glyphId, 'stroke2'); // 2 strokes
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateGlyphValue(glyph.glyphId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateGlyphValue('ghost')).toBe(0);
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

        it('should execute default getGlyph', () => {
            const result = system.executeTool('getGlyph', { glyphId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('glyphRecruited', () => count++);
            unregister();
            system.recruitGlyph({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('glyphRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitGlyph({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalGlyphs = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalGlyphs = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitGlyph({});
            const json = system.toJSON();
            expect(json.glyphs.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitGlyph({});
            const json = system.toJSON();
            const newSys = new CultivationGlyph();
            newSys.fromJSON(json);
            expect(newSys.glyphs.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.glyphCount).toBe(0);
        });
    });
});
