/**
 * CultivationChord.test.js - 修真和弦系统测试
 * V789 Iteration 22/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationChord } from '../../../systems/ai/CultivationChord.js';

describe('CultivationChord', () => {
    let system;
    beforeEach(() => { system = new CultivationChord(); });

    describe('recruitChord', () => {
        it('should recruit with masterId', () => {
            const { chord } = system.recruitChord({ masterId: 'm1', name: 'HarmonyChord' });
            expect(chord.masterId).toBe('m1');
            expect(chord.name).toBe('HarmonyChord');
        });

        it('should default type to major', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            expect(chord.type).toBe('major');
        });

        it('should support minor type', () => {
            const { chord } = system.recruitChord({ masterId: 'm1', type: 'minor' });
            expect(chord.type).toBe('minor');
        });

        it('should support dim type', () => {
            const { chord } = system.recruitChord({ masterId: 'm1', type: 'dim' });
            expect(chord.type).toBe('dim');
        });

        it('should default resonance to baseResonance', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            expect(chord.resonance).toBe(20);
        });

        it('should accept custom resonance', () => {
            const { chord } = system.recruitChord({ masterId: 'm1', resonance: 60 });
            expect(chord.resonance).toBe(60);
        });

        it('should default status to novice', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            expect(chord.status).toBe('novice');
        });

        it('should default notes to []', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            expect(chord.notes).toEqual([]);
        });

        it('should default level to 1', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            expect(chord.level).toBe(1);
        });

        it('should accept custom chordId', () => {
            const { chord } = system.recruitChord({ masterId: 'm1', chordId: 'chord-xyz' });
            expect(chord.chordId).toBe('chord-xyz');
        });

        it('should trigger chordRecruited hook', () => {
            let called = false;
            system.registerHook('chordRecruited', () => { called = true; });
            system.recruitChord({ masterId: 'm1' });
            expect(called).toBe(true);
        });

        it('should reject when maxChords reached', () => {
            const sys = new CultivationChord({ maxChords: 1 });
            sys.recruitChord({ masterId: 'm1' });
            const result = sys.recruitChord({ masterId: 'm2' });
            expect(result.error).toBe('MAX_CHORDS_REACHED');
        });
    });

    describe('getChord', () => {
        it('should return', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            expect(system.getChord(chord.chordId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getChord('ghost')).toBeNull(); });
    });

    describe('listChords', () => {
        it('should list all', () => {
            system.recruitChord({ masterId: 'm1' });
            system.recruitChord({ masterId: 'm2' });
            expect(system.listChords().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listChords()).toEqual([]);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitChord({ masterId: 'm1' });
            system.recruitChord({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitChord({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should return empty when no legendary', () => {
            system.recruitChord({ masterId: 'm1' });
            expect(system.listLegendary().length).toBe(0);
        });

        it('should filter legendary', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            system.legendChord(chord.chordId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addNote', () => {
        it('should add note', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            system.addNote(chord.chordId, 'C4');
            expect(chord.notes).toContain('C4');
        });

        it('should reject missing', () => {
            const result = system.addNote('ghost', 'C4');
            expect(result.error).toBe('CHORD_NOT_FOUND');
        });

        it('should trigger noteAdded hook', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            let called = false;
            system.registerHook('noteAdded', () => { called = true; });
            system.addNote(chord.chordId, 'D4');
            expect(called).toBe(true);
        });
    });

    describe('raiseResonance', () => {
        it('should raise with default amount', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            system.raiseResonance(chord.chordId);
            expect(chord.resonance).toBe(25);
        });

        it('should raise with custom amount', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            system.raiseResonance(chord.chordId, 10);
            expect(chord.resonance).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raiseResonance('ghost', 5);
            expect(result.error).toBe('CHORD_NOT_FOUND');
        });

        it('should trigger resonanceRaised hook', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            let called = false;
            system.registerHook('resonanceRaised', () => { called = true; });
            system.raiseResonance(chord.chordId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpChord', () => {
        it('should level up', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            system.levelUpChord(chord.chordId);
            expect(chord.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpChord('ghost');
            expect(result.error).toBe('CHORD_NOT_FOUND');
        });

        it('should trigger chordLeveledUp hook', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            let called = false;
            system.registerHook('chordLeveledUp', () => { called = true; });
            system.levelUpChord(chord.chordId);
            expect(called).toBe(true);
        });
    });

    describe('legendChord', () => {
        it('should set legendary', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            system.legendChord(chord.chordId);
            expect(chord.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendChord('ghost');
            expect(result.error).toBe('CHORD_NOT_FOUND');
        });

        it('should trigger chordLegendized hook', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            let called = false;
            system.registerHook('chordLegendized', () => { called = true; });
            system.legendChord(chord.chordId);
            expect(called).toBe(true);
        });
    });

    describe('calculateChordValue', () => {
        it('should calculate base value', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            // level 1 * 100 + resonance 20 * 2 + notes 0 * 30 = 140
            expect(system.calculateChordValue(chord.chordId)).toBe(140);
        });

        it('should include notes in value', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            system.addNote(chord.chordId, 'C4');
            system.addNote(chord.chordId, 'D4');
            // 100 + 40 + 60 = 200
            expect(system.calculateChordValue(chord.chordId)).toBe(200);
        });

        it('should include level in value', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            system.levelUpChord(chord.chordId);
            system.levelUpChord(chord.chordId);
            // 300 + 40 + 0 = 340
            expect(system.calculateChordValue(chord.chordId)).toBe(340);
        });

        it('should include resonance in value', () => {
            const { chord } = system.recruitChord({ masterId: 'm1' });
            system.raiseResonance(chord.chordId, 10);
            // 100 + 60 + 0 = 160
            expect(system.calculateChordValue(chord.chordId)).toBe(160);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateChordValue('ghost')).toBe(0);
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

        it('should execute default getChord', () => {
            const result = system.executeTool('getChord', { chordId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitChord', () => {
            const result = system.executeTool('recruitChord', { masterId: 'm1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('chordRecruited', () => count++);
            unregister();
            system.recruitChord({ masterId: 'm1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('chordRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitChord({ masterId: 'm1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient chords', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when enough chords', () => {
            system.stats.totalChords = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalChords = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitChord({ masterId: 'm1' });
            const json = system.toJSON();
            expect(json.chords.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitChord({ masterId: 'm1' });
            const json = system.toJSON();
            const newSys = new CultivationChord();
            newSys.fromJSON(json);
            expect(newSys.chords.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.chordCount).toBe(0);
        });
    });
});
