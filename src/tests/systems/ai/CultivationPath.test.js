/**
 * CultivationPath.test.js - 道路系统测试
 * V529 Iteration 11/20 Round 21 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationPath } from '../../../systems/ai/CultivationPath.js';

describe('CultivationPath', () => {
    let system;
    beforeEach(() => { system = new CultivationPath(); });

    describe('openPath', () => {
        it('should open path', () => {
            const { path } = system.openPath({ cultivatorId: 'c1', name: 'Sage Path', type: 'sage' });
            expect(path.cultivatorId).toBe('c1');
            expect(path.name).toBe('Sage Path');
            expect(path.type).toBe('sage');
        });

        it('should default status to open', () => {
            const { path } = system.openPath({});
            expect(path.status).toBe('open');
        });

        it('should default type to sage', () => {
            const { path } = system.openPath({});
            expect(path.type).toBe('sage');
        });

        it('should default insight to baseInsight', () => {
            const { path } = system.openPath({});
            expect(path.insight).toBe(20);
        });

        it('should start at level 1', () => {
            const { path } = system.openPath({});
            expect(path.level).toBe(1);
        });

        it('should start with empty trials', () => {
            const { path } = system.openPath({});
            expect(path.trials).toEqual([]);
        });

        it('should generate pathId', () => {
            const { path } = system.openPath({});
            expect(path.pathId).toBeDefined();
            expect(typeof path.pathId).toBe('string');
        });

        it('should accept custom pathId', () => {
            const { path } = system.openPath({ pathId: 'my-path' });
            expect(path.pathId).toBe('my-path');
        });

        it('should trigger pathOpened hook', () => {
            let called = false;
            system.registerHook('pathOpened', () => { called = true; });
            system.openPath({});
            expect(called).toBe(true);
        });

        it('should support all types', () => {
            const { path: p1 } = system.openPath({ type: 'sage' });
            const { path: p2 } = system.openPath({ type: 'hero' });
            const { path: p3 } = system.openPath({ type: 'emperor' });
            expect(p1.type).toBe('sage');
            expect(p2.type).toBe('hero');
            expect(p3.type).toBe('emperor');
        });
    });

    describe('getPath', () => {
        it('should return path', () => {
            const { path } = system.openPath({});
            expect(system.getPath(path.pathId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPath('ghost')).toBeNull(); });
    });

    describe('listPaths', () => {
        it('should list all', () => {
            system.openPath({});
            system.openPath({});
            expect(system.listPaths().length).toBe(2);
        });

        it('should return empty when no paths', () => {
            expect(system.listPaths().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter by cultivator', () => {
            system.openPath({ cultivatorId: 'c1' });
            system.openPath({ cultivatorId: 'c2' });
            system.openPath({ cultivatorId: 'c1' });
            expect(system.listByCultivator('c1').length).toBe(2);
        });

        it('should return empty for unknown cultivator', () => {
            system.openPath({ cultivatorId: 'c1' });
            expect(system.listByCultivator('ghost').length).toBe(0);
        });
    });

    describe('listMastered', () => {
        it('should filter mastered only', () => {
            const { path: p1 } = system.openPath({});
            const { path: p2 } = system.openPath({});
            system.masterPath(p1.pathId);
            const mastered = system.listMastered();
            expect(mastered.length).toBe(1);
            expect(mastered[0].pathId).toBe(p1.pathId);
            expect(p2.status).toBe('open');
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.openPath({ type: 'sage' });
            system.openPath({ type: 'hero' });
            system.openPath({ type: 'emperor' });
            expect(system.listByType('sage').length).toBe(1);
            expect(system.listByType('hero').length).toBe(1);
            expect(system.listByType('emperor').length).toBe(1);
        });
    });

    describe('listVisible', () => {
        it('should filter visible only', () => {
            const { path: p1 } = system.openPath({});
            const { path: p2 } = system.openPath({});
            p1.status = 'visible';
            const visible = system.listVisible();
            expect(visible.length).toBe(1);
            expect(visible[0].pathId).toBe(p1.pathId);
            expect(p2.status).toBe('open');
        });
    });

    describe('addTrial', () => {
        it('should add trial', () => {
            const { path } = system.openPath({});
            system.addTrial(path.pathId, 'trial-1');
            expect(path.trials).toContain('trial-1');
        });

        it('should accumulate trials', () => {
            const { path } = system.openPath({});
            system.addTrial(path.pathId, 't1');
            system.addTrial(path.pathId, 't2');
            system.addTrial(path.pathId, 't3');
            expect(path.trials.length).toBe(3);
        });

        it('should reject missing path', () => {
            const result = system.addTrial('ghost', 't');
            expect(result.error).toBe('PATH_NOT_FOUND');
        });

        it('should trigger trialAdded hook', () => {
            const { path } = system.openPath({});
            let called = false;
            system.registerHook('trialAdded', () => { called = true; });
            system.addTrial(path.pathId, 't');
            expect(called).toBe(true);
        });
    });

    describe('increaseInsight', () => {
        it('should increase insight by default', () => {
            const { path } = system.openPath({});
            system.increaseInsight(path.pathId);
            expect(path.insight).toBe(25);
        });

        it('should increase insight by custom amount', () => {
            const { path } = system.openPath({});
            system.increaseInsight(path.pathId, 100);
            expect(path.insight).toBe(120);
        });

        it('should reject missing path', () => {
            const result = system.increaseInsight('ghost');
            expect(result.error).toBe('PATH_NOT_FOUND');
        });

        it('should trigger insightIncreased hook', () => {
            const { path } = system.openPath({});
            let called = false;
            system.registerHook('insightIncreased', () => { called = true; });
            system.increaseInsight(path.pathId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpPath', () => {
        it('should level up', () => {
            const { path } = system.openPath({});
            system.levelUpPath(path.pathId);
            expect(path.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { path } = system.openPath({});
            system.levelUpPath(path.pathId);
            system.levelUpPath(path.pathId);
            system.levelUpPath(path.pathId);
            expect(path.level).toBe(4);
        });

        it('should reject missing path', () => {
            const result = system.levelUpPath('ghost');
            expect(result.error).toBe('PATH_NOT_FOUND');
        });

        it('should trigger pathLeveledUp hook', () => {
            const { path } = system.openPath({});
            let called = false;
            system.registerHook('pathLeveledUp', () => { called = true; });
            system.levelUpPath(path.pathId);
            expect(called).toBe(true);
        });
    });

    describe('masterPath', () => {
        it('should master path', () => {
            const { path } = system.openPath({});
            system.masterPath(path.pathId);
            expect(path.status).toBe('mastered');
        });

        it('should reject missing path', () => {
            const result = system.masterPath('ghost');
            expect(result.error).toBe('PATH_NOT_FOUND');
        });

        it('should trigger pathMastered hook', () => {
            const { path } = system.openPath({});
            let called = false;
            system.registerHook('pathMastered', () => { called = true; });
            system.masterPath(path.pathId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePathPower', () => {
        it('should calculate base power', () => {
            const { path } = system.openPath({});
            // level=1, insight=20, trials=0 -> 1*100 + 20*2 + 0 = 140
            expect(system.calculatePathPower(path.pathId)).toBe(140);
        });

        it('should include trials in power', () => {
            const { path } = system.openPath({});
            system.addTrial(path.pathId, 't1');
            system.addTrial(path.pathId, 't2');
            // level=1, insight=20, trials=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculatePathPower(path.pathId)).toBe(200);
        });

        it('should scale with level', () => {
            const { path } = system.openPath({});
            system.levelUpPath(path.pathId);
            system.levelUpPath(path.pathId);
            // level=3, insight=20, trials=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculatePathPower(path.pathId)).toBe(340);
        });

        it('should scale with insight', () => {
            const { path } = system.openPath({});
            system.increaseInsight(path.pathId, 100);
            // level=1, insight=120, trials=0 -> 1*100 + 120*2 + 0 = 340
            expect(system.calculatePathPower(path.pathId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePathPower('ghost')).toBe(0);
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

        it('should execute default openPath', () => {
            const result = system.executeTool('openPath', { cultivatorId: 'c1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('pathOpened', () => count++);
            unregister();
            system.openPath({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('pathOpened', () => { throw new Error('x'); });
            expect(() => system.openPath({})).not.toThrow();
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
            system.openPath({});
            const json = system.toJSON();
            expect(json.paths.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openPath({});
            const json = system.toJSON();
            const newSys = new CultivationPath();
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
