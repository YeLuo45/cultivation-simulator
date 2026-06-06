/**
 * CultivationStory.test.js - 修真故事系统测试
 * V570 Iteration 13/20 Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationStory } from '../../../systems/ai/CultivationStory.js';

describe('CultivationStory', () => {
    let system;
    beforeEach(() => { system = new CultivationStory(); });

    describe('writeStory', () => {
        it('should create', () => {
            const { story } = system.writeStory({ authorId: 'a1', name: 'My Epic' });
            expect(story.authorId).toBe('a1');
            expect(story.name).toBe('My Epic');
            expect(story.type).toBe('folk');
        });

        it('should respect type', () => {
            const { story } = system.writeStory({ type: 'epic' });
            expect(story.type).toBe('epic');
        });

        it('should use basePlot default', () => {
            const { story } = system.writeStory({});
            expect(story.plot).toBe(20);
        });

        it('should accept explicit plot', () => {
            const { story } = system.writeStory({ plot: 100 });
            expect(story.plot).toBe(100);
        });

        it('should respect chapters array', () => {
            const { story } = system.writeStory({ chapters: ['ch1', 'ch2'] });
            expect(story.chapters.length).toBe(2);
        });

        it('should clone chapters array', () => {
            const orig = ['a'];
            const { story } = system.writeStory({ chapters: orig });
            orig.push('b');
            expect(story.chapters.length).toBe(1);
        });

        it('should reject when storage full', () => {
            system.config.maxStories = 1;
            system.writeStory({});
            const result = system.writeStory({});
            expect(result.error).toBe('STORAGE_FULL');
        });

        it('should trigger storyWritten hook', () => {
            let called = false;
            system.registerHook('storyWritten', () => { called = true; });
            system.writeStory({});
            expect(called).toBe(true);
        });
    });

    describe('getStory', () => {
        it('should return', () => {
            const { story } = system.writeStory({});
            expect(system.getStory(story.storyId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getStory('ghost')).toBeNull(); });
        it('should return a copy', () => {
            const { story } = system.writeStory({ name: 'X' });
            const fetched = system.getStory(story.storyId);
            fetched.name = 'Y';
            expect(system.getStory(story.storyId).name).toBe('X');
        });
    });

    describe('listStories', () => {
        it('should list all', () => {
            system.writeStory({});
            system.writeStory({});
            expect(system.listStories().length).toBe(2);
        });
        it('should be empty initially', () => {
            expect(system.listStories().length).toBe(0);
        });
    });

    describe('listByAuthor', () => {
        it('should filter by author', () => {
            system.writeStory({ authorId: 'a1' });
            system.writeStory({ authorId: 'a2' });
            system.writeStory({ authorId: 'a1' });
            expect(system.listByAuthor('a1').length).toBe(2);
        });
        it('should return empty for unknown author', () => {
            system.writeStory({ authorId: 'a1' });
            expect(system.listByAuthor('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter by status', () => {
            const { story } = system.writeStory({});
            system.legendStory(story.storyId);
            system.writeStory({});
            expect(system.listLegendary().length).toBe(1);
        });
        it('should be empty when none', () => {
            system.writeStory({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addChapter', () => {
        it('should add chapter', () => {
            const { story } = system.writeStory({});
            system.addChapter(story.storyId, 'chapter 1');
            expect(story.chapters.length).toBe(1);
            expect(story.chapters[0]).toBe('chapter 1');
        });

        it('should reject missing', () => {
            const result = system.addChapter('ghost', 'ch');
            expect(result.error).toBe('STORY_NOT_FOUND');
        });

        it('should trigger chapterAdded hook', () => {
            const { story } = system.writeStory({});
            let received = null;
            system.registerHook('chapterAdded', (d) => { received = d; });
            system.addChapter(story.storyId, 'ch1');
            expect(received.chapterCount).toBe(1);
        });
    });

    describe('deepenPlot', () => {
        it('should deepen with default amount', () => {
            const { story } = system.writeStory({});
            system.deepenPlot(story.storyId);
            expect(story.plot).toBe(25);
        });

        it('should deepen with custom amount', () => {
            const { story } = system.writeStory({});
            system.deepenPlot(story.storyId, 10);
            expect(story.plot).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.deepenPlot('ghost', 5);
            expect(result.error).toBe('STORY_NOT_FOUND');
        });

        it('should trigger plotDeepened hook', () => {
            const { story } = system.writeStory({});
            let received = null;
            system.registerHook('plotDeepened', (d) => { received = d; });
            system.deepenPlot(story.storyId, 7);
            expect(received.newPlot).toBe(27);
        });
    });

    describe('levelUpStory', () => {
        it('should level up', () => {
            const { story } = system.writeStory({});
            system.levelUpStory(story.storyId);
            expect(story.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpStory('ghost');
            expect(result.error).toBe('STORY_NOT_FOUND');
        });

        it('should trigger storyLeveledUp hook', () => {
            const { story } = system.writeStory({});
            let received = null;
            system.registerHook('storyLeveledUp', (d) => { received = d; });
            system.levelUpStory(story.storyId);
            expect(received.newLevel).toBe(2);
        });
    });

    describe('legendStory', () => {
        it('should mark legendary', () => {
            const { story } = system.writeStory({});
            system.legendStory(story.storyId);
            expect(story.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendStory('ghost');
            expect(result.error).toBe('STORY_NOT_FOUND');
        });

        it('should trigger storyLegendized hook', () => {
            const { story } = system.writeStory({});
            let called = false;
            system.registerHook('storyLegendized', () => { called = true; });
            system.legendStory(story.storyId);
            expect(called).toBe(true);
        });
    });

    describe('calculateStoryValue', () => {
        it('should calculate base value', () => {
            const { story } = system.writeStory({});
            // level 1 * 100 + plot 20 * 2 + 0 chapters * 30 = 140
            expect(system.calculateStoryValue(story.storyId)).toBe(140);
        });

        it('should include chapters', () => {
            const { story } = system.writeStory({ chapters: ['a', 'b'] });
            // 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateStoryValue(story.storyId)).toBe(200);
        });

        it('should reflect level and plot', () => {
            const { story } = system.writeStory({});
            system.levelUpStory(story.storyId);
            system.deepenPlot(story.storyId, 10);
            // 2*100 + 30*2 + 0 = 260
            expect(system.calculateStoryValue(story.storyId)).toBe(260);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateStoryValue('ghost')).toBe(0);
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

        it('should execute default getStory tool', () => {
            const result = system.executeTool('getStory', { storyId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('storyWritten', () => count++);
            unregister();
            system.writeStory({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('storyWritten', () => { throw new Error('x'); });
            expect(() => system.writeStory({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalStories = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalStories = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.writeStory({});
            const json = system.toJSON();
            expect(json.stories.length).toBe(1);
        });
        it('should deserialize', () => {
            system.writeStory({});
            const json = system.toJSON();
            const newSys = new CultivationStory();
            newSys.fromJSON(json);
            expect(newSys.stories.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.storyCount).toBe(0);
        });
        it('should reflect additions', () => {
            system.writeStory({});
            const stats = system.getStats();
            expect(stats.storyCount).toBe(1);
            expect(stats.totalStories).toBe(1);
        });
    });
});
