/**
 * CultivationVerse.test.js - 修真诗系统测试
 * V780 Iteration 13/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationVerse } from '../../../systems/ai/CultivationVerse.js';

describe('CultivationVerse', () => {
    let system;
    beforeEach(() => { system = new CultivationVerse(); });

    describe('recruitVerse', () => {
        it('should recruit', () => {
            const { verse } = system.recruitVerse({ masterId: 'm1', name: 'Jade Chant' });
            expect(verse.name).toBe('Jade Chant');
            expect(verse.masterId).toBe('m1');
        });

        it('should default type to lyric', () => {
            const { verse } = system.recruitVerse({});
            expect(verse.type).toBe('lyric');
        });

        it('should default rhyme from config', () => {
            const { verse } = system.recruitVerse({});
            expect(verse.rhyme).toBe(20);
        });

        it('should set status to novice', () => {
            const { verse } = system.recruitVerse({});
            expect(verse.status).toBe('novice');
        });

        it('should set level to 1', () => {
            const { verse } = system.recruitVerse({});
            expect(verse.level).toBe(1);
        });

        it('should support custom verseId', () => {
            const { verse } = system.recruitVerse({ verseId: 'custom-id' });
            expect(verse.verseId).toBe('custom-id');
        });

        it('should respect maxVerses', () => {
            const limited = new CultivationVerse({ maxVerses: 2 });
            limited.recruitVerse({});
            limited.recruitVerse({});
            const result = limited.recruitVerse({});
            expect(result.error).toBe('MAX_VERSES_REACHED');
        });

        it('should trigger verseRecruited hook', () => {
            let called = false;
            system.registerHook('verseRecruited', () => { called = true; });
            system.recruitVerse({});
            expect(called).toBe(true);
        });
    });

    describe('getVerse', () => {
        it('should return', () => {
            const { verse } = system.recruitVerse({});
            expect(system.getVerse(verse.verseId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getVerse('ghost')).toBeNull(); });
    });

    describe('listVerses', () => {
        it('should list all', () => {
            system.recruitVerse({});
            system.recruitVerse({});
            expect(system.listVerses().length).toBe(2);
        });

        it('should return empty list initially', () => {
            expect(system.listVerses().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitVerse({ masterId: 'm1' });
            system.recruitVerse({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitVerse({ masterId: 'm1' });
            expect(system.listByMaster('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { verse: v1 } = system.recruitVerse({});
            const { verse: v2 } = system.recruitVerse({});
            system.legendVerse(v2.verseId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].verseId).toBe(v2.verseId);
        });
    });

    describe('addStanza', () => {
        it('should add stanza', () => {
            const { verse } = system.recruitVerse({});
            system.addStanza(verse.verseId, '明月松间照');
            expect(verse.stanzas.length).toBe(1);
            expect(verse.stanzas[0]).toBe('明月松间照');
        });

        it('should reject missing', () => {
            const result = system.addStanza('ghost', 'x');
            expect(result.error).toBe('VERSE_NOT_FOUND');
        });

        it('should trigger stanzaAdded hook', () => {
            const { verse } = system.recruitVerse({});
            let called = false;
            system.registerHook('stanzaAdded', () => { called = true; });
            system.addStanza(verse.verseId, 'x');
            expect(called).toBe(true);
        });
    });

    describe('raiseRhyme', () => {
        it('should raise rhyme by default', () => {
            const { verse } = system.recruitVerse({});
            system.raiseRhyme(verse.verseId);
            expect(verse.rhyme).toBe(25);
        });

        it('should raise rhyme by custom amount', () => {
            const { verse } = system.recruitVerse({});
            system.raiseRhyme(verse.verseId, 10);
            expect(verse.rhyme).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raiseRhyme('ghost', 5);
            expect(result.error).toBe('VERSE_NOT_FOUND');
        });

        it('should trigger rhymeRaised hook', () => {
            const { verse } = system.recruitVerse({});
            let called = false;
            system.registerHook('rhymeRaised', () => { called = true; });
            system.raiseRhyme(verse.verseId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpVerse', () => {
        it('should level up', () => {
            const { verse } = system.recruitVerse({});
            system.levelUpVerse(verse.verseId);
            expect(verse.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpVerse('ghost');
            expect(result.error).toBe('VERSE_NOT_FOUND');
        });

        it('should promote to veteran at level 5', () => {
            const { verse } = system.recruitVerse({});
            for (let i = 0; i < 4; i++) system.levelUpVerse(verse.verseId);
            expect(verse.status).toBe('veteran');
        });

        it('should trigger verseLeveledUp hook', () => {
            const { verse } = system.recruitVerse({});
            let called = false;
            system.registerHook('verseLeveledUp', () => { called = true; });
            system.levelUpVerse(verse.verseId);
            expect(called).toBe(true);
        });
    });

    describe('legendVerse', () => {
        it('should legendize', () => {
            const { verse } = system.recruitVerse({});
            system.legendVerse(verse.verseId);
            expect(verse.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendVerse('ghost');
            expect(result.error).toBe('VERSE_NOT_FOUND');
        });

        it('should trigger verseLegendized hook', () => {
            const { verse } = system.recruitVerse({});
            let called = false;
            system.registerHook('verseLegendized', () => { called = true; });
            system.legendVerse(verse.verseId);
            expect(called).toBe(true);
        });
    });

    describe('calculateVerseValue', () => {
        it('should calculate', () => {
            const { verse } = system.recruitVerse({});
            system.addStanza(verse.verseId, 'x');
            const val = system.calculateVerseValue(verse.verseId);
            // level 1 * 100 + rhyme 20 * 2 + stanzas 1 * 30 = 100 + 40 + 30 = 170
            expect(val).toBe(170);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateVerseValue('ghost')).toBe(0);
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

        it('should execute default getVerse', () => {
            const result = system.executeTool('getVerse', { verseId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('verseRecruited', () => count++);
            unregister();
            system.recruitVerse({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('verseRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitVerse({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalVerses = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalVerses = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitVerse({});
            const json = system.toJSON();
            expect(json.verses.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitVerse({});
            const json = system.toJSON();
            const newSys = new CultivationVerse();
            newSys.fromJSON(json);
            expect(newSys.verses.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.verseCount).toBe(0);
        });
    });
});
