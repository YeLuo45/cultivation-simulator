/**
 * ApprenticePath.test.js - 弟子之路测试
 * V476 Iteration 8/15 Round 18 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ApprenticePath } from '../../../systems/ai/ApprenticePath.js';

describe('ApprenticePath', () => {
    let system;
    beforeEach(() => { system = new ApprenticePath(); });

    describe('startPath', () => {
        it('should start', () => {
            const { path } = system.startPath({ apprenticeId: 'a1', masterId: 'm1' });
            expect(path.apprenticeId).toBe('a1');
            expect(path.masterId).toBe('m1');
        });

        it('should default status to in-progress', () => {
            const { path } = system.startPath({});
            expect(path.status).toBe('in-progress');
        });

        it('should default breakthroughs to baseLessons', () => {
            const { path } = system.startPath({});
            expect(path.breakthroughs).toBe(0);
        });

        it('should increment totalPaths', () => {
            system.startPath({});
            expect(system.stats.totalPaths).toBe(1);
        });

        it('should trigger pathStarted hook', () => {
            let called = false;
            system.registerHook('pathStarted', () => { called = true; });
            system.startPath({});
            expect(called).toBe(true);
        });
    });

    describe('getPath', () => {
        it('should return', () => {
            const { path } = system.startPath({});
            expect(system.getPath(path.pathId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPath('ghost')).toBeNull(); });
    });

    describe('listPaths', () => {
        it('should list all', () => {
            system.startPath({});
            system.startPath({});
            expect(system.listPaths().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listPaths().length).toBe(0);
        });
    });

    describe('listByApprentice', () => {
        it('should filter', () => {
            system.startPath({ apprenticeId: 'a1' });
            system.startPath({ apprenticeId: 'a2' });
            expect(system.listByApprentice('a1').length).toBe(1);
        });
    });

    describe('listInProgress', () => {
        it('should filter in-progress only', () => {
            const { path: p1 } = system.startPath({});
            system.startPath({ status: 'graduated' });
            const inProgress = system.listInProgress();
            expect(inProgress.length).toBe(1);
            expect(inProgress[0].pathId).toBe(p1.pathId);
        });
    });

    describe('addLesson', () => {
        it('should add lesson', () => {
            const { path } = system.startPath({});
            system.addLesson(path.pathId, { name: 'sword-forms' });
            expect(path.lessons.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addLesson('ghost', {});
            expect(result.error).toBe('PATH_NOT_FOUND');
        });

        it('should trigger lessonAdded hook', () => {
            const { path } = system.startPath({});
            let called = false;
            system.registerHook('lessonAdded', () => { called = true; });
            system.addLesson(path.pathId, {});
            expect(called).toBe(true);
        });
    });

    describe('achieveMilestone', () => {
        it('should add milestone', () => {
            const { path } = system.startPath({});
            system.achieveMilestone(path.pathId, { name: 'qi-refining' });
            expect(path.milestones.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.achieveMilestone('ghost', {});
            expect(result.error).toBe('PATH_NOT_FOUND');
        });

        it('should trigger milestoneAchieved hook', () => {
            const { path } = system.startPath({});
            let called = false;
            system.registerHook('milestoneAchieved', () => { called = true; });
            system.achieveMilestone(path.pathId, {});
            expect(called).toBe(true);
        });
    });

    describe('breakthrough', () => {
        it('should increment breakthroughs', () => {
            const { path } = system.startPath({});
            system.breakthrough(path.pathId);
            expect(path.breakthroughs).toBe(1);
        });

        it('should increment multiple times', () => {
            const { path } = system.startPath({});
            system.breakthrough(path.pathId);
            system.breakthrough(path.pathId);
            expect(path.breakthroughs).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.breakthrough('ghost');
            expect(result.error).toBe('PATH_NOT_FOUND');
        });

        it('should trigger breakthroughReached hook', () => {
            const { path } = system.startPath({});
            let called = false;
            system.registerHook('breakthroughReached', () => { called = true; });
            system.breakthrough(path.pathId);
            expect(called).toBe(true);
        });
    });

    describe('graduatePath', () => {
        it('should set status to graduated', () => {
            const { path } = system.startPath({});
            system.graduatePath(path.pathId);
            expect(path.status).toBe('graduated');
        });

        it('should reject missing', () => {
            const result = system.graduatePath('ghost');
            expect(result.error).toBe('PATH_NOT_FOUND');
        });

        it('should trigger pathGraduated hook', () => {
            const { path } = system.startPath({});
            let called = false;
            system.registerHook('pathGraduated', () => { called = true; });
            system.graduatePath(path.pathId);
            expect(called).toBe(true);
        });
    });

    describe('calculateGrowthScore', () => {
        it('should calculate using formula', () => {
            const { path } = system.startPath({});
            system.addLesson(path.pathId, {});
            system.addLesson(path.pathId, {});
            system.achieveMilestone(path.pathId, {});
            system.breakthrough(path.pathId);
            // 2 lessons * 5 + 1 milestone * 20 + 1 breakthrough * 50 = 10 + 20 + 50 = 80
            expect(system.calculateGrowthScore(path.pathId)).toBe(80);
        });

        it('should return 0 for empty path', () => {
            const { path } = system.startPath({});
            expect(system.calculateGrowthScore(path.pathId)).toBe(0);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateGrowthScore('ghost')).toBe(0);
        });
    });

    describe('listGraduated', () => {
        it('should filter graduated', () => {
            const { path: p1 } = system.startPath({});
            system.startPath({});
            system.graduatePath(p1.pathId);
            expect(system.listGraduated().length).toBe(1);
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

        it('should execute default getPath', () => {
            const result = system.executeTool('getPath', { pathId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('pathStarted', () => count++);
            unregister();
            system.startPath({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('pathStarted', () => { throw new Error('x'); });
            expect(() => system.startPath({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPaths = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPaths = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startPath({});
            const json = system.toJSON();
            expect(json.paths.length).toBe(1);
        });
        it('should deserialize', () => {
            system.startPath({});
            const json = system.toJSON();
            const newSys = new ApprenticePath();
            newSys.fromJSON(json);
            expect(newSys.paths.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.pathCount).toBe(0);
        });
    });
});
