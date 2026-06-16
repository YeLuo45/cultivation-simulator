/**
 * DreamWalking.test.js - 梦行系统测试
 * V418 Iteration 10/15 Round 14 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DreamWalking } from '../../../systems/ai/DreamWalking.js';

describe('DreamWalking', () => {
    let system;
    beforeEach(() => { system = new DreamWalking(); });

    describe('startWalking', () => {
        it('should start', () => {
            const { walk } = system.startWalking({ walkerId: 'w1', targetId: 't1' });
            expect(walk.walkerId).toBe('w1');
        });

        it('should trigger walkStarted hook', () => {
            let called = false;
            system.registerHook('walkStarted', () => { called = true; });
            system.startWalking({});
            expect(called).toBe(true);
        });

        it('should set default depth and lucidity', () => {
            const { walk } = system.startWalking({});
            expect(walk.depth).toBe(10);
            expect(walk.lucidity).toBe(50);
        });

        it('should set status to wandering', () => {
            const { walk } = system.startWalking({});
            expect(walk.status).toBe('wandering');
        });

        it('should use custom depth and lucidity', () => {
            const { walk } = system.startWalking({ depth: 20, lucidity: 80 });
            expect(walk.depth).toBe(20);
            expect(walk.lucidity).toBe(80);
        });
    });

    describe('getWalk', () => {
        it('should return', () => {
            const { walk } = system.startWalking({});
            expect(system.getWalk(walk.walkId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getWalk('ghost')).toBeNull(); });
    });

    describe('listWalks', () => {
        it('should list all', () => {
            system.startWalking({});
            expect(system.listWalks().length).toBe(1);
        });
        it('should return empty when no walks', () => {
            expect(system.listWalks().length).toBe(0);
        });
    });

    describe('listByWalker', () => {
        it('should filter', () => {
            system.startWalking({ walkerId: 'w1' });
            system.startWalking({ walkerId: 'w2' });
            expect(system.listByWalker('w1').length).toBe(1);
        });
    });

    describe('listByStatus', () => {
        it('should filter by exited', () => {
            const { walk } = system.startWalking({});
            system.exitWalk(walk.walkId);
            expect(system.listByStatus('exited').length).toBe(1);
        });
        it('should filter wandering', () => {
            system.startWalking({});
            expect(system.listByStatus('wandering').length).toBe(1);
        });
    });

    describe('deepenWalk', () => {
        it('should increase depth and lucidity', () => {
            const { walk } = system.startWalking({});
            system.deepenWalk(walk.walkId, 10);
            expect(walk.depth).toBe(20);
            expect(walk.lucidity).toBe(60);
        });

        it('should reject missing', () => {
            const result = system.deepenWalk('ghost', 10);
            expect(result.error).toBe('WALK_NOT_FOUND');
        });

        it('should trigger walkDeepened hook', () => {
            const { walk } = system.startWalking({});
            let called = false;
            system.registerHook('walkDeepened', () => { called = true; });
            system.deepenWalk(walk.walkId, 10);
            expect(called).toBe(true);
        });

        it('should change status to deep when depth >= 30', () => {
            const { walk } = system.startWalking({});
            system.deepenWalk(walk.walkId, 25);
            expect(walk.status).toBe('deep');
        });
    });

    describe('collectExperience', () => {
        it('should increase experiences', () => {
            const { walk } = system.startWalking({});
            system.collectExperience(walk.walkId, 5);
            expect(walk.experiences).toBe(5);
        });

        it('should reject missing', () => {
            const result = system.collectExperience('ghost', 5);
            expect(result.error).toBe('WALK_NOT_FOUND');
        });

        it('should trigger experienceCollected hook', () => {
            const { walk } = system.startWalking({});
            let called = false;
            system.registerHook('experienceCollected', () => { called = true; });
            system.collectExperience(walk.walkId, 5);
            expect(called).toBe(true);
        });
    });

    describe('exitWalk', () => {
        it('should set status to exited', () => {
            const { walk } = system.startWalking({});
            system.exitWalk(walk.walkId);
            expect(walk.status).toBe('exited');
        });

        it('should reject missing', () => {
            const result = system.exitWalk('ghost');
            expect(result.error).toBe('WALK_NOT_FOUND');
        });

        it('should trigger walkExited hook', () => {
            const { walk } = system.startWalking({});
            let called = false;
            system.registerHook('walkExited', () => { called = true; });
            system.exitWalk(walk.walkId);
            expect(called).toBe(true);
        });
    });

    describe('calculateJourneyDepth', () => {
        it('should calculate', () => {
            const { walk } = system.startWalking({});
            // depth=10, lucidity=50, experiences=0: 10*50/100 + 0 = 5
            expect(system.calculateJourneyDepth(walk.walkId)).toBeCloseTo(5, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateJourneyDepth('ghost')).toBe(0);
        });

        it('should include experiences', () => {
            const { walk } = system.startWalking({});
            system.collectExperience(walk.walkId, 10);
            // 10*50/100 + 10 = 5 + 10 = 15
            expect(system.calculateJourneyDepth(walk.walkId)).toBeCloseTo(15, 5);
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

        it('should execute default getWalk', () => {
            const result = system.executeTool('getWalk', { walkId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('walkStarted', () => count++);
            unregister();
            system.startWalking({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('walkStarted', () => { throw new Error('x'); });
            expect(() => system.startWalking({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalWalks = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalWalks = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startWalking({});
            const json = system.toJSON();
            expect(json.walks.length).toBe(1);
        });
        it('should deserialize', () => {
            system.startWalking({});
            const json = system.toJSON();
            const newSys = new DreamWalking();
            newSys.fromJSON(json);
            expect(newSys.walks.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.walkCount).toBe(0);
        });
    });
});
