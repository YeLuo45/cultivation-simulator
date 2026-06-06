/**
 * CultivationPoetry.test.js - 修真诗测试
 * V560 Iteration 3/20 Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationPoetry } from '../../../systems/ai/CultivationPoetry.js';

describe('CultivationPoetry', () => {
    let system;
    beforeEach(() => { system = new CultivationPoetry(); });

    describe('writePoem', () => {
        it('should write', () => {
            const { poem } = system.writePoem({ poetId: 'p1' });
            expect(poem.poetId).toBe('p1');
        });

        it('should default name', () => {
            const { poem } = system.writePoem({});
            expect(poem.name).toBe('Untitled Poem');
        });

        it('should default type to free', () => {
            const { poem } = system.writePoem({});
            expect(poem.type).toBe('free');
        });

        it('should default verses to baseVerses', () => {
            const { poem } = system.writePoem({});
            expect(poem.verses).toBe(20);
        });

        it('should default themes to empty array', () => {
            const { poem } = system.writePoem({});
            expect(poem.themes).toEqual([]);
        });

        it('should default level to 1', () => {
            const { poem } = system.writePoem({});
            expect(poem.level).toBe(1);
        });

        it('should default status to draft', () => {
            const { poem } = system.writePoem({});
            expect(poem.status).toBe('draft');
        });

        it('should accept lyric type', () => {
            const { poem } = system.writePoem({ type: 'lyric' });
            expect(poem.type).toBe('lyric');
        });

        it('should accept epic type', () => {
            const { poem } = system.writePoem({ type: 'epic' });
            expect(poem.type).toBe('epic');
        });

        it('should accept custom verses', () => {
            const { poem } = system.writePoem({ verses: 100 });
            expect(poem.verses).toBe(100);
        });

        it('should accept custom name', () => {
            const { poem } = system.writePoem({ name: 'Dao Poem' });
            expect(poem.name).toBe('Dao Poem');
        });

        it('should accept custom themes', () => {
            const { poem } = system.writePoem({ themes: ['dao', 'heaven'] });
            expect(poem.themes).toEqual(['dao', 'heaven']);
        });

        it('should accept custom id', () => {
            const { poem } = system.writePoem({ id: 'my-poem' });
            expect(poem.poemId).toBe('my-poem');
        });

        it('should trigger poemWritten hook', () => {
            let called = false;
            system.registerHook('poemWritten', () => { called = true; });
            system.writePoem({});
            expect(called).toBe(true);
        });
    });

    describe('getPoem', () => {
        it('should return', () => {
            const { poem } = system.writePoem({});
            expect(system.getPoem(poem.poemId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPoem('ghost')).toBeNull(); });
    });

    describe('listPoems', () => {
        it('should list all', () => {
            system.writePoem({});
            system.writePoem({});
            expect(system.listPoems().length).toBe(2);
        });

        it('should return empty when no poems', () => {
            expect(system.listPoems().length).toBe(0);
        });
    });

    describe('listByPoet', () => {
        it('should filter', () => {
            system.writePoem({ poetId: 'p1' });
            system.writePoem({ poetId: 'p2' });
            expect(system.listByPoet('p1').length).toBe(1);
        });

        it('should return empty for unknown poet', () => {
            system.writePoem({ poetId: 'p1' });
            expect(system.listByPoet('ghost').length).toBe(0);
        });
    });

    describe('listImmortal', () => {
        it('should filter immortal', () => {
            const { poem: p1 } = system.writePoem({});
            system.writePoem({});
            system.immortalPoem(p1.poemId);
            expect(system.listImmortal().length).toBe(1);
        });

        it('should return empty when none immortal', () => {
            system.writePoem({});
            expect(system.listImmortal().length).toBe(0);
        });
    });

    describe('addTheme', () => {
        it('should add theme', () => {
            const { poem } = system.writePoem({});
            system.addTheme(poem.poemId, 'dao');
            expect(system.getPoem(poem.poemId).themes).toContain('dao');
        });

        it('should add multiple themes', () => {
            const { poem } = system.writePoem({});
            system.addTheme(poem.poemId, 'dao');
            system.addTheme(poem.poemId, 'heaven');
            expect(system.getPoem(poem.poemId).themes.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addTheme('ghost', 'dao');
            expect(result.error).toBe('POEM_NOT_FOUND');
        });

        it('should trigger themeAdded hook', () => {
            const { poem } = system.writePoem({});
            let called = false;
            system.registerHook('themeAdded', () => { called = true; });
            system.addTheme(poem.poemId, 'dao');
            expect(called).toBe(true);
        });
    });

    describe('increaseVerses', () => {
        it('should increase verses', () => {
            const { poem } = system.writePoem({});
            system.increaseVerses(poem.poemId, 10);
            expect(system.getPoem(poem.poemId).verses).toBe(30);
        });

        it('should default amount to 5', () => {
            const { poem } = system.writePoem({});
            system.increaseVerses(poem.poemId);
            expect(system.getPoem(poem.poemId).verses).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.increaseVerses('ghost', 5);
            expect(result.error).toBe('POEM_NOT_FOUND');
        });

        it('should trigger versesIncreased hook', () => {
            const { poem } = system.writePoem({});
            let called = false;
            system.registerHook('versesIncreased', () => { called = true; });
            system.increaseVerses(poem.poemId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpPoem', () => {
        it('should level up', () => {
            const { poem } = system.writePoem({});
            system.levelUpPoem(poem.poemId);
            expect(system.getPoem(poem.poemId).level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { poem } = system.writePoem({});
            system.levelUpPoem(poem.poemId);
            system.levelUpPoem(poem.poemId);
            system.levelUpPoem(poem.poemId);
            expect(system.getPoem(poem.poemId).level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpPoem('ghost');
            expect(result.error).toBe('POEM_NOT_FOUND');
        });

        it('should trigger poemLeveledUp hook', () => {
            const { poem } = system.writePoem({});
            let called = false;
            system.registerHook('poemLeveledUp', () => { called = true; });
            system.levelUpPoem(poem.poemId);
            expect(called).toBe(true);
        });
    });

    describe('immortalPoem', () => {
        it('should immortalize', () => {
            const { poem } = system.writePoem({});
            system.immortalPoem(poem.poemId);
            expect(system.getPoem(poem.poemId).status).toBe('immortal');
        });

        it('should reject missing', () => {
            const result = system.immortalPoem('ghost');
            expect(result.error).toBe('POEM_NOT_FOUND');
        });

        it('should trigger poemImmortalized hook', () => {
            const { poem } = system.writePoem({});
            let called = false;
            system.registerHook('poemImmortalized', () => { called = true; });
            system.immortalPoem(poem.poemId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePoemValue', () => {
        it('should calculate with default values', () => {
            const { poem } = system.writePoem({});
            // level=1, verses=20, themes=0 => 1*100 + 20*2 + 0*30 = 140
            expect(system.calculatePoemValue(poem.poemId)).toBe(140);
        });

        it('should calculate with leveled up', () => {
            const { poem } = system.writePoem({});
            system.levelUpPoem(poem.poemId);
            system.levelUpPoem(poem.poemId);
            // level=3, verses=20, themes=0 => 3*100 + 20*2 + 0 = 340
            expect(system.calculatePoemValue(poem.poemId)).toBe(340);
        });

        it('should calculate with themes', () => {
            const { poem } = system.writePoem({});
            system.addTheme(poem.poemId, 'dao');
            system.addTheme(poem.poemId, 'heaven');
            // level=1, verses=20, themes=2 => 100 + 40 + 60 = 200
            expect(system.calculatePoemValue(poem.poemId)).toBe(200);
        });

        it('should calculate with increased verses', () => {
            const { poem } = system.writePoem({});
            system.increaseVerses(poem.poemId, 10);
            // level=1, verses=30, themes=0 => 100 + 60 + 0 = 160
            expect(system.calculatePoemValue(poem.poemId)).toBe(160);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePoemValue('ghost')).toBe(0);
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

        it('should execute default getPoem', () => {
            const result = system.executeTool('getPoem', { poemId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default writePoem', () => {
            const result = system.executeTool('writePoem', { poetId: 'p1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('poemWritten', () => count++);
            unregister();
            system.writePoem({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('poemWritten', () => { throw new Error('x'); });
            expect(() => system.writePoem({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPoems = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPoems = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.writePoem({});
            const json = system.toJSON();
            expect(json.poems.length).toBe(1);
        });
        it('should deserialize', () => {
            system.writePoem({});
            const json = system.toJSON();
            const newSys = new CultivationPoetry();
            newSys.fromJSON(json);
            expect(newSys.poems.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.poemCount).toBe(0);
        });
    });
});
