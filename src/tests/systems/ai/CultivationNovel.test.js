/**
 * CultivationNovel.test.js - 修真小说测试
 * V422 Iteration 14/15 Round 14 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationNovel } from '../../../systems/ai/CultivationNovel.js';

describe('CultivationNovel', () => {
    let system;
    beforeEach(() => { system = new CultivationNovel(); });

    describe('writeNovel', () => {
        it('should write a novel', () => {
            const { novel } = system.writeNovel({ title: 'Test Novel', author: 'Author1' });
            expect(novel.title).toBe('Test Novel');
            expect(novel.author).toBe('Author1');
            expect(novel.status).toBe('ongoing');
            expect(novel.chapters).toEqual([]);
            expect(novel.ratings).toEqual([]);
            expect(novel.wordCount).toBe(0);
        });

        it('should generate novelId', () => {
            const { novel } = system.writeNovel({ title: 'N1' });
            expect(novel.novelId).toBeDefined();
            expect(novel.novelId).toMatch(/^nvl_/);
        });

        it('should use custom id if provided', () => {
            const { novel } = system.writeNovel({ id: 'custom-id', title: 'N1' });
            expect(novel.novelId).toBe('custom-id');
        });

        it('should preserve explicit wordCount', () => {
            const { novel } = system.writeNovel({ title: 'N1', wordCount: 5000 });
            expect(novel.wordCount).toBe(5000);
        });

        it('should preserve custom chapters', () => {
            const chapters = [{ title: 'Ch1', wordCount: 1000 }];
            const { novel } = system.writeNovel({ title: 'N1', chapters });
            expect(novel.chapters.length).toBe(1);
        });

        it('should preserve custom ratings', () => {
            const ratings = [5, 4];
            const { novel } = system.writeNovel({ title: 'N1', ratings });
            expect(novel.ratings.length).toBe(2);
        });

        it('should respect custom status', () => {
            const { novel } = system.writeNovel({ title: 'N1', status: 'paused' });
            expect(novel.status).toBe('paused');
        });

        it('should increment totalNovels stat', () => {
            system.writeNovel({ title: 'N1' });
            expect(system.stats.totalNovels).toBe(1);
        });

        it('should trigger novelWritten hook', () => {
            let called = false;
            system.registerHook('novelWritten', () => { called = true; });
            system.writeNovel({ title: 'N1' });
            expect(called).toBe(true);
        });
    });

    describe('getNovel', () => {
        it('should return novel', () => {
            const { novel } = system.writeNovel({ title: 'N1' });
            const result = system.getNovel(novel.novelId);
            expect(result).not.toBeNull();
            expect(result.title).toBe('N1');
        });

        it('should return null for missing', () => {
            expect(system.getNovel('ghost')).toBeNull();
        });

        it('should return a copy', () => {
            const { novel } = system.writeNovel({ title: 'N1' });
            const result = system.getNovel(novel.novelId);
            result.title = 'Modified';
            expect(system.getNovel(novel.novelId).title).toBe('N1');
        });
    });

    describe('listNovels', () => {
        it('should list all', () => {
            system.writeNovel({ title: 'N1' });
            system.writeNovel({ title: 'N2' });
            expect(system.listNovels().length).toBe(2);
        });

        it('should return empty when no novels', () => {
            expect(system.listNovels().length).toBe(0);
        });
    });

    describe('listByStatus', () => {
        it('should filter by ongoing', () => {
            system.writeNovel({ title: 'N1', status: 'ongoing' });
            system.writeNovel({ title: 'N2', status: 'paused' });
            expect(system.listByStatus('ongoing').length).toBe(1);
        });

        it('should filter by completed', () => {
            system.writeNovel({ title: 'N1', status: 'ongoing' });
            system.writeNovel({ title: 'N2', status: 'completed' });
            expect(system.listByStatus('completed').length).toBe(1);
        });

        it('should filter by paused', () => {
            system.writeNovel({ title: 'N1', status: 'paused' });
            expect(system.listByStatus('paused').length).toBe(1);
        });

        it('should return empty for no matches', () => {
            system.writeNovel({ title: 'N1' });
            expect(system.listByStatus('nonexistent').length).toBe(0);
        });
    });

    describe('listByAuthor', () => {
        it('should filter by author', () => {
            system.writeNovel({ title: 'N1', author: 'A1' });
            system.writeNovel({ title: 'N2', author: 'A2' });
            expect(system.listByAuthor('A1').length).toBe(1);
        });

        it('should return multiple novels for same author', () => {
            system.writeNovel({ title: 'N1', author: 'A1' });
            system.writeNovel({ title: 'N2', author: 'A1' });
            expect(system.listByAuthor('A1').length).toBe(2);
        });

        it('should return empty for unknown author', () => {
            system.writeNovel({ title: 'N1', author: 'A1' });
            expect(system.listByAuthor('Unknown').length).toBe(0);
        });
    });

    describe('addChapter', () => {
        it('should add a chapter', () => {
            const { novel } = system.writeNovel({ title: 'N1' });
            const result = system.addChapter(novel.novelId, 'Chapter 1', 1500);
            expect(result.success).toBe(true);
            expect(novel.chapters.length).toBe(1);
            expect(novel.wordCount).toBe(1500);
        });

        it('should use default wordCount of 1000', () => {
            const { novel } = system.writeNovel({ title: 'N1' });
            system.addChapter(novel.novelId, 'Ch1');
            expect(novel.wordCount).toBe(1000);
        });

        it('should accumulate wordCount across chapters', () => {
            const { novel } = system.writeNovel({ title: 'N1' });
            system.addChapter(novel.novelId, 'Ch1', 1000);
            system.addChapter(novel.novelId, 'Ch2', 2000);
            system.addChapter(novel.novelId, 'Ch3', 500);
            expect(novel.wordCount).toBe(3500);
        });

        it('should track totalChapters in result', () => {
            const { novel } = system.writeNovel({ title: 'N1' });
            const result = system.addChapter(novel.novelId, 'Ch1', 1000);
            expect(result.totalChapters).toBe(1);
        });

        it('should track totalWords in result', () => {
            const { novel } = system.writeNovel({ title: 'N1' });
            const result = system.addChapter(novel.novelId, 'Ch1', 1500);
            expect(result.totalWords).toBe(1500);
        });

        it('should reject missing novel', () => {
            const result = system.addChapter('ghost', 'Ch1', 1000);
            expect(result.success).toBe(false);
            expect(result.error).toBe('NOVEL_NOT_FOUND');
        });

        it('should trigger chapterAdded hook', () => {
            const { novel } = system.writeNovel({ title: 'N1' });
            let called = false;
            system.registerHook('chapterAdded', () => { called = true; });
            system.addChapter(novel.novelId, 'Ch1', 1000);
            expect(called).toBe(true);
        });
    });

    describe('addRating', () => {
        it('should add a rating', () => {
            const { novel } = system.writeNovel({ title: 'N1' });
            const result = system.addRating(novel.novelId, 4);
            expect(result.success).toBe(true);
            expect(novel.ratings.length).toBe(1);
            expect(novel.ratings[0]).toBe(4);
        });

        it('should use default score of 5', () => {
            const { novel } = system.writeNovel({ title: 'N1' });
            system.addRating(novel.novelId);
            expect(novel.ratings[0]).toBe(5);
        });

        it('should accumulate ratings', () => {
            const { novel } = system.writeNovel({ title: 'N1' });
            system.addRating(novel.novelId, 3);
            system.addRating(novel.novelId, 5);
            system.addRating(novel.novelId, 4);
            expect(novel.ratings.length).toBe(3);
        });

        it('should track totalRatings in result', () => {
            const { novel } = system.writeNovel({ title: 'N1' });
            const result = system.addRating(novel.novelId, 5);
            expect(result.totalRatings).toBe(1);
        });

        it('should reject missing novel', () => {
            const result = system.addRating('ghost', 5);
            expect(result.error).toBe('NOVEL_NOT_FOUND');
        });

        it('should trigger ratingAdded hook', () => {
            const { novel } = system.writeNovel({ title: 'N1' });
            let called = false;
            system.registerHook('ratingAdded', () => { called = true; });
            system.addRating(novel.novelId, 5);
            expect(called).toBe(true);
        });
    });

    describe('completeNovel', () => {
        it('should set status to completed', () => {
            const { novel } = system.writeNovel({ title: 'N1', status: 'ongoing' });
            const result = system.completeNovel(novel.novelId);
            expect(result.success).toBe(true);
            expect(novel.status).toBe('completed');
        });

        it('should reject missing novel', () => {
            const result = system.completeNovel('ghost');
            expect(result.error).toBe('NOVEL_NOT_FOUND');
        });

        it('should trigger novelCompleted hook', () => {
            const { novel } = system.writeNovel({ title: 'N1' });
            let called = false;
            system.registerHook('novelCompleted', () => { called = true; });
            system.completeNovel(novel.novelId);
            expect(called).toBe(true);
        });
    });

    describe('calculateAverageRating', () => {
        it('should calculate average', () => {
            const { novel } = system.writeNovel({ title: 'N1' });
            system.addRating(novel.novelId, 5);
            system.addRating(novel.novelId, 3);
            expect(system.calculateAverageRating(novel.novelId)).toBe(4);
        });

        it('should return 0 for novel with no ratings', () => {
            const { novel } = system.writeNovel({ title: 'N1' });
            expect(system.calculateAverageRating(novel.novelId)).toBe(0);
        });

        it('should return 0 for missing novel', () => {
            expect(system.calculateAverageRating('ghost')).toBe(0);
        });

        it('should handle single rating', () => {
            const { novel } = system.writeNovel({ title: 'N1' });
            system.addRating(novel.novelId, 4);
            expect(system.calculateAverageRating(novel.novelId)).toBe(4);
        });

        it('should handle decimal results', () => {
            const { novel } = system.writeNovel({ title: 'N1' });
            system.addRating(novel.novelId, 5);
            system.addRating(novel.novelId, 4);
            system.addRating(novel.novelId, 4);
            expect(system.calculateAverageRating(novel.novelId)).toBeCloseTo(4.333, 2);
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

        it('should execute default getNovel', () => {
            const result = system.executeTool('getNovel', { novelId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('novelWritten', () => count++);
            unregister();
            system.writeNovel({ title: 'N1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('novelWritten', () => { throw new Error('x'); });
            expect(() => system.writeNovel({ title: 'N1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalNovels = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalNovels = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.writeNovel({ title: 'N1' });
            const json = system.toJSON();
            expect(json.novels.length).toBe(1);
        });
        it('should deserialize', () => {
            system.writeNovel({ title: 'N1' });
            const json = system.toJSON();
            const newSys = new CultivationNovel();
            newSys.fromJSON(json);
            expect(newSys.novels.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.novelCount).toBe(0);
        });
    });
});
