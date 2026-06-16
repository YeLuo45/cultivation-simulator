/**
 * SpaceFold.test.js - 空间折叠测试
 * V434 Iteration 11/15 Round 15 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SpaceFold } from '../../../systems/ai/SpaceFold.js';

describe('SpaceFold', () => {
    let system;
    beforeEach(() => { system = new SpaceFold(); });

    describe('createFold', () => {
        it('should create a fold', () => {
            const { fold } = system.createFold({ controllerId: 's1', name: 'QuickPath' });
            expect(fold.controllerId).toBe('s1');
            expect(fold.name).toBe('QuickPath');
        });

        it('should use baseDistance default', () => {
            const { fold } = system.createFold({});
            expect(fold.distance).toBe(1000);
        });

        it('should default stability to 0', () => {
            const { fold } = system.createFold({});
            expect(fold.stability).toBe(0);
        });

        it('should default origin to origin_point', () => {
            const { fold } = system.createFold({});
            expect(fold.origin).toBe('origin_point');
        });

        it('should default target to target_point', () => {
            const { fold } = system.createFold({});
            expect(fold.target).toBe('target_point');
        });

        it('should default status to unstable', () => {
            const { fold } = system.createFold({});
            expect(fold.status).toBe('unstable');
        });

        it('should use provided id', () => {
            const { fold } = system.createFold({ id: 'my_id' });
            expect(fold.foldId).toBe('my_id');
        });

        it('should trigger foldCreated hook', () => {
            let called = false;
            system.registerHook('foldCreated', () => { called = true; });
            system.createFold({});
            expect(called).toBe(true);
        });
    });

    describe('getFold', () => {
        it('should return fold', () => {
            const { fold } = system.createFold({});
            expect(system.getFold(fold.foldId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getFold('ghost')).toBeNull(); });
    });

    describe('listFolds', () => {
        it('should list all', () => {
            system.createFold({});
            expect(system.listFolds().length).toBe(1);
        });

        it('should return empty list when no folds', () => {
            expect(system.listFolds().length).toBe(0);
        });
    });

    describe('listByController', () => {
        it('should filter by controller', () => {
            system.createFold({ controllerId: 's1' });
            system.createFold({ controllerId: 's2' });
            expect(system.listByController('s1').length).toBe(1);
        });

        it('should return empty for unknown controller', () => {
            system.createFold({ controllerId: 's1' });
            expect(system.listByController('ghost').length).toBe(0);
        });
    });

    describe('listStable', () => {
        it('should filter stable status', () => {
            const { fold: f1 } = system.createFold({});
            f1.status = 'stable';
            const { fold: f2 } = system.createFold({});
            f2.status = 'stable';
            system.createFold({});
            expect(system.listStable().length).toBe(2);
        });

        it('should return empty when no stable', () => {
            system.createFold({});
            expect(system.listStable().length).toBe(0);
        });
    });

    describe('stabilizeFold', () => {
        it('should stabilize', () => {
            const { fold } = system.createFold({});
            system.stabilizeFold(fold.foldId, 10);
            expect(fold.stability).toBe(10);
        });

        it('should use default amount of 5', () => {
            const { fold } = system.createFold({});
            system.stabilizeFold(fold.foldId);
            expect(fold.stability).toBe(5);
        });

        it('should reject missing', () => {
            const result = system.stabilizeFold('ghost', 10);
            expect(result.error).toBe('FOLD_NOT_FOUND');
        });

        it('should trigger foldStabilized hook', () => {
            const { fold } = system.createFold({});
            let called = false;
            system.registerHook('foldStabilized', () => { called = true; });
            system.stabilizeFold(fold.foldId, 10);
            expect(called).toBe(true);
        });
    });

    describe('shortenDistance', () => {
        it('should shorten', () => {
            const { fold } = system.createFold({});
            system.shortenDistance(fold.foldId, 100);
            expect(fold.distance).toBe(900);
        });

        it('should use default amount of 2', () => {
            const { fold } = system.createFold({});
            system.shortenDistance(fold.foldId);
            expect(fold.distance).toBe(998);
        });

        it('should not go below 0', () => {
            const { fold } = system.createFold({ distance: 5 });
            system.shortenDistance(fold.foldId, 100);
            expect(fold.distance).toBe(0);
        });

        it('should reject missing', () => {
            const result = system.shortenDistance('ghost', 5);
            expect(result.error).toBe('FOLD_NOT_FOUND');
        });

        it('should trigger distanceShortened hook', () => {
            const { fold } = system.createFold({});
            let called = false;
            system.registerHook('distanceShortened', () => { called = true; });
            system.shortenDistance(fold.foldId, 5);
            expect(called).toBe(true);
        });
    });

    describe('anchorFold', () => {
        it('should set status to stable', () => {
            const { fold } = system.createFold({});
            system.anchorFold(fold.foldId);
            expect(fold.status).toBe('stable');
        });

        it('should set collapsed to stable', () => {
            const { fold } = system.createFold({ status: 'collapsed' });
            system.anchorFold(fold.foldId);
            expect(fold.status).toBe('stable');
        });

        it('should reject missing', () => {
            const result = system.anchorFold('ghost');
            expect(result.error).toBe('FOLD_NOT_FOUND');
        });

        it('should trigger foldAnchored hook', () => {
            const { fold } = system.createFold({});
            let called = false;
            system.registerHook('foldAnchored', () => { called = true; });
            system.anchorFold(fold.foldId);
            expect(called).toBe(true);
        });
    });

    describe('collapseFold', () => {
        it('should set status to collapsed', () => {
            const { fold } = system.createFold({});
            system.collapseFold(fold.foldId);
            expect(fold.status).toBe('collapsed');
        });

        it('should reject missing', () => {
            const result = system.collapseFold('ghost');
            expect(result.error).toBe('FOLD_NOT_FOUND');
        });

        it('should trigger foldCollapsed hook', () => {
            const { fold } = system.createFold({});
            let called = false;
            system.registerHook('foldCollapsed', () => { called = true; });
            system.collapseFold(fold.foldId);
            expect(called).toBe(true);
        });
    });

    describe('calculateFoldingPower', () => {
        it('should calculate with default values', () => {
            const { fold } = system.createFold({});
            // distance=1000, stability=0 -> (1000-1000)*(1+0) = 0
            expect(system.calculateFoldingPower(fold.foldId)).toBe(0);
        });

        it('should reflect stability changes', () => {
            const { fold } = system.createFold({});
            system.stabilizeFold(fold.foldId, 50);
            // distance=1000, stability=50 -> (1000-1000)*(1+0.5) = 0
            expect(system.calculateFoldingPower(fold.foldId)).toBe(0);
        });

        it('should reflect distance changes', () => {
            const { fold } = system.createFold({});
            system.shortenDistance(fold.foldId, 200);
            // distance=800, stability=0 -> (1000-800)*(1+0) = 200
            expect(system.calculateFoldingPower(fold.foldId)).toBe(200);
        });

        it('should reflect both distance and stability', () => {
            const { fold } = system.createFold({});
            system.shortenDistance(fold.foldId, 200);
            system.stabilizeFold(fold.foldId, 50);
            // distance=800, stability=50 -> (1000-800)*(1+0.5) = 200*1.5 = 300
            expect(system.calculateFoldingPower(fold.foldId)).toBe(300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateFoldingPower('ghost')).toBe(0);
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

        it('should execute default getFold', () => {
            const result = system.executeTool('getFold', { foldId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('foldCreated', () => count++);
            unregister();
            system.createFold({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('foldCreated', () => { throw new Error('x'); });
            expect(() => system.createFold({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalFolds = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalFolds = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createFold({});
            const json = system.toJSON();
            expect(json.folds.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createFold({});
            const json = system.toJSON();
            const newSys = new SpaceFold();
            newSys.fromJSON(json);
            expect(newSys.folds.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.foldCount).toBe(0);
        });
    });
});
