/**
 * CultivationNote.test.js - 修真音符系统测试
 * V788 Iteration 21/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationNote } from '../../../systems/ai/CultivationNote.js';

describe('CultivationNote', () => {
    let system;
    beforeEach(() => { system = new CultivationNote(); });

    describe('recruitNote', () => {
        it('should recruit with masterId', () => {
            const { note } = system.recruitNote({ masterId: 'm1', name: 'DoBell' });
            expect(note.masterId).toBe('m1');
            expect(note.name).toBe('DoBell');
        });

        it('should default type to do', () => {
            const { note } = system.recruitNote({ masterId: 'm1' });
            expect(note.type).toBe('do');
        });

        it('should support other types', () => {
            const { note } = system.recruitNote({ masterId: 'm1', type: 'mi' });
            expect(note.type).toBe('mi');
        });

        it('should default clarity to baseClarity', () => {
            const { note } = system.recruitNote({ masterId: 'm1' });
            expect(note.clarity).toBe(20);
        });

        it('should accept custom clarity', () => {
            const { note } = system.recruitNote({ masterId: 'm1', clarity: 50 });
            expect(note.clarity).toBe(50);
        });

        it('should default status to novice', () => {
            const { note } = system.recruitNote({ masterId: 'm1' });
            expect(note.status).toBe('novice');
        });

        it('should default tones to []', () => {
            const { note } = system.recruitNote({ masterId: 'm1' });
            expect(note.tones).toEqual([]);
        });

        it('should default level to 1', () => {
            const { note } = system.recruitNote({ masterId: 'm1' });
            expect(note.level).toBe(1);
        });

        it('should trigger noteRecruited hook', () => {
            let called = false;
            system.registerHook('noteRecruited', () => { called = true; });
            system.recruitNote({ masterId: 'm1' });
            expect(called).toBe(true);
        });

        it('should reject when maxNotes reached', () => {
            const sys = new CultivationNote({ maxNotes: 1 });
            sys.recruitNote({ masterId: 'm1' });
            const result = sys.recruitNote({ masterId: 'm2' });
            expect(result.error).toBe('MAX_NOTES_REACHED');
        });
    });

    describe('getNote', () => {
        it('should return', () => {
            const { note } = system.recruitNote({ masterId: 'm1' });
            expect(system.getNote(note.noteId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getNote('ghost')).toBeNull(); });
    });

    describe('listNotes', () => {
        it('should list all', () => {
            system.recruitNote({ masterId: 'm1' });
            system.recruitNote({ masterId: 'm2' });
            expect(system.listNotes().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listNotes()).toEqual([]);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitNote({ masterId: 'm1' });
            system.recruitNote({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should return empty when no legendary', () => {
            system.recruitNote({ masterId: 'm1' });
            expect(system.listLegendary().length).toBe(0);
        });

        it('should filter legendary', () => {
            const { note } = system.recruitNote({ masterId: 'm1' });
            system.legendNote(note.noteId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addTone', () => {
        it('should add tone', () => {
            const { note } = system.recruitNote({ masterId: 'm1' });
            system.addTone(note.noteId, 'C4');
            expect(note.tones).toContain('C4');
        });

        it('should reject missing', () => {
            const result = system.addTone('ghost', 'C4');
            expect(result.error).toBe('NOTE_NOT_FOUND');
        });

        it('should trigger toneAdded hook', () => {
            const { note } = system.recruitNote({ masterId: 'm1' });
            let called = false;
            system.registerHook('toneAdded', () => { called = true; });
            system.addTone(note.noteId, 'D4');
            expect(called).toBe(true);
        });
    });

    describe('raiseClarity', () => {
        it('should raise with default amount', () => {
            const { note } = system.recruitNote({ masterId: 'm1' });
            system.raiseClarity(note.noteId);
            expect(note.clarity).toBe(25);
        });

        it('should raise with custom amount', () => {
            const { note } = system.recruitNote({ masterId: 'm1' });
            system.raiseClarity(note.noteId, 10);
            expect(note.clarity).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raiseClarity('ghost', 5);
            expect(result.error).toBe('NOTE_NOT_FOUND');
        });

        it('should trigger clarityRaised hook', () => {
            const { note } = system.recruitNote({ masterId: 'm1' });
            let called = false;
            system.registerHook('clarityRaised', () => { called = true; });
            system.raiseClarity(note.noteId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpNote', () => {
        it('should level up', () => {
            const { note } = system.recruitNote({ masterId: 'm1' });
            system.levelUpNote(note.noteId);
            expect(note.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpNote('ghost');
            expect(result.error).toBe('NOTE_NOT_FOUND');
        });

        it('should trigger noteLeveledUp hook', () => {
            const { note } = system.recruitNote({ masterId: 'm1' });
            let called = false;
            system.registerHook('noteLeveledUp', () => { called = true; });
            system.levelUpNote(note.noteId);
            expect(called).toBe(true);
        });
    });

    describe('legendNote', () => {
        it('should set legendary', () => {
            const { note } = system.recruitNote({ masterId: 'm1' });
            system.legendNote(note.noteId);
            expect(note.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendNote('ghost');
            expect(result.error).toBe('NOTE_NOT_FOUND');
        });

        it('should trigger noteLegendized hook', () => {
            const { note } = system.recruitNote({ masterId: 'm1' });
            let called = false;
            system.registerHook('noteLegendized', () => { called = true; });
            system.legendNote(note.noteId);
            expect(called).toBe(true);
        });
    });

    describe('calculateNoteValue', () => {
        it('should calculate base value', () => {
            const { note } = system.recruitNote({ masterId: 'm1' });
            // level 1 * 100 + clarity 20 * 2 + tones 0 * 30 = 140
            expect(system.calculateNoteValue(note.noteId)).toBe(140);
        });

        it('should include tones in value', () => {
            const { note } = system.recruitNote({ masterId: 'm1' });
            system.addTone(note.noteId, 'C4');
            system.addTone(note.noteId, 'D4');
            // 100 + 40 + 60 = 200
            expect(system.calculateNoteValue(note.noteId)).toBe(200);
        });

        it('should include level in value', () => {
            const { note } = system.recruitNote({ masterId: 'm1' });
            system.levelUpNote(note.noteId);
            system.levelUpNote(note.noteId);
            // 300 + 40 + 0 = 340
            expect(system.calculateNoteValue(note.noteId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateNoteValue('ghost')).toBe(0);
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

        it('should execute default getNote', () => {
            const result = system.executeTool('getNote', { noteId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitNote', () => {
            const result = system.executeTool('recruitNote', { masterId: 'm1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('noteRecruited', () => count++);
            unregister();
            system.recruitNote({ masterId: 'm1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('noteRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitNote({ masterId: 'm1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient notes', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when enough notes', () => {
            system.stats.totalNotes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalNotes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitNote({ masterId: 'm1' });
            const json = system.toJSON();
            expect(json.notes.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitNote({ masterId: 'm1' });
            const json = system.toJSON();
            const newSys = new CultivationNote();
            newSys.fromJSON(json);
            expect(newSys.notes.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.noteCount).toBe(0);
        });
    });
});
