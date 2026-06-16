/**
 * CultivationPath.test.js - 修真道测试
 * V749 Iteration 12/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationPath } from '../../../systems/ai/CultivationPath.js';

describe('CultivationPath', () => {
    let system;
    beforeEach(() => { system = new CultivationPath(); });

    describe('recruitPath', () => {
        it('should recruit', () => {
            const { path } = system.recruitPath({ masterId: 'm1', name: 'Sword Dao', type: 'righteous' });
            expect(path.masterId).toBe('m1');
            expect(path.name).toBe('Sword Dao');
            expect(path.type).toBe('righteous');
        });

        it('should default type to neutral', () => {
            const { path } = system.recruitPath({});
            expect(path.type).toBe('neutral');
        });

        it('should default status to novice', () => {
            const { path } = system.recruitPath({});
            expect(path.status).toBe('novice');
        });

        it('should default clarity to baseClarity', () => {
            const { path } = system.recruitPath({});
            expect(path.clarity).toBe(20);
        });

        it('should start at level 1', () => {
            const { path } = system.recruitPath({});
            expect(path.level).toBe(1);
        });

        it('should start with empty waypoints', () => {
            const { path } = system.recruitPath({});
            expect(path.waypoints).toEqual([]);
        });

        it('should generate pathId', () => {
            const { path } = system.recruitPath({});
            expect(path.pathId).toBeDefined();
            expect(typeof path.pathId).toBe('string');
        });

        it('should accept custom pathId', () => {
            const { path } = system.recruitPath({ pathId: 'my-path' });
            expect(path.pathId).toBe('my-path');
        });

        it('should trigger pathRecruited hook', () => {
            let called = false;
            system.registerHook('pathRecruited', () => { called = true; });
            system.recruitPath({});
            expect(called).toBe(true);
        });

        it('should support all types', () => {
            const { path: p1 } = system.recruitPath({ type: 'righteous' });
            const { path: p2 } = system.recruitPath({ type: 'demonic' });
            const { path: p3 } = system.recruitPath({ type: 'neutral' });
            expect(p1.type).toBe('righteous');
            expect(p2.type).toBe('demonic');
            expect(p3.type).toBe('neutral');
        });
    });

    describe('getPath', () => {
        it('should return path', () => {
            const { path } = system.recruitPath({});
            expect(system.getPath(path.pathId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPath('ghost')).toBeNull(); });
    });

    describe('listPaths', () => {
        it('should list all', () => {
            system.recruitPath({});
            system.recruitPath({});
            expect(system.listPaths().length).toBe(2);
        });

        it('should return empty when no paths', () => {
            expect(system.listPaths().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitPath({ masterId: 'm1' });
            system.recruitPath({ masterId: 'm2' });
            system.recruitPath({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitPath({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { path: p1 } = system.recruitPath({});
            const { path: p2 } = system.recruitPath({});
            system.legendPath(p1.pathId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].pathId).toBe(p1.pathId);
            expect(p2.status).toBe('novice');
        });
    });

    describe('addWaypoint', () => {
        it('should add waypoint', () => {
            const { path } = system.recruitPath({});
            system.addWaypoint(path.pathId, { name: 'mountain-trial' });
            expect(path.waypoints.length).toBe(1);
        });

        it('should accumulate waypoints', () => {
            const { path } = system.recruitPath({});
            system.addWaypoint(path.pathId, { name: 'w1' });
            system.addWaypoint(path.pathId, { name: 'w2' });
            system.addWaypoint(path.pathId, { name: 'w3' });
            expect(path.waypoints.length).toBe(3);
        });

        it('should reject missing path', () => {
            const result = system.addWaypoint('ghost', { name: 'w' });
            expect(result.error).toBe('PATH_NOT_FOUND');
        });

        it('should trigger waypointAdded hook', () => {
            const { path } = system.recruitPath({});
            let called = false;
            system.registerHook('waypointAdded', () => { called = true; });
            system.addWaypoint(path.pathId, { name: 'w' });
            expect(called).toBe(true);
        });
    });

    describe('raiseClarity', () => {
        it('should raise clarity by default', () => {
            const { path } = system.recruitPath({});
            system.raiseClarity(path.pathId);
            expect(path.clarity).toBe(25);
        });

        it('should raise clarity by custom amount', () => {
            const { path } = system.recruitPath({});
            system.raiseClarity(path.pathId, 30);
            expect(path.clarity).toBe(50);
        });

        it('should reject missing path', () => {
            const result = system.raiseClarity('ghost');
            expect(result.error).toBe('PATH_NOT_FOUND');
        });

        it('should trigger clarityRaised hook', () => {
            const { path } = system.recruitPath({});
            let called = false;
            system.registerHook('clarityRaised', () => { called = true; });
            system.raiseClarity(path.pathId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpPath', () => {
        it('should level up', () => {
            const { path } = system.recruitPath({});
            system.levelUpPath(path.pathId);
            expect(path.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { path } = system.recruitPath({});
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
            const { path } = system.recruitPath({});
            let called = false;
            system.registerHook('pathLeveledUp', () => { called = true; });
            system.levelUpPath(path.pathId);
            expect(called).toBe(true);
        });
    });

    describe('legendPath', () => {
        it('should legendize path', () => {
            const { path } = system.recruitPath({});
            system.legendPath(path.pathId);
            expect(path.status).toBe('legendary');
        });

        it('should reject missing path', () => {
            const result = system.legendPath('ghost');
            expect(result.error).toBe('PATH_NOT_FOUND');
        });

        it('should trigger pathLegendized hook', () => {
            const { path } = system.recruitPath({});
            let called = false;
            system.registerHook('pathLegendized', () => { called = true; });
            system.legendPath(path.pathId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePathValue', () => {
        it('should calculate base value', () => {
            const { path } = system.recruitPath({});
            // level=1, clarity=20, waypoints=0 -> 1*100 + 20*2 + 0 = 140
            expect(system.calculatePathValue(path.pathId)).toBe(140);
        });

        it('should include waypoints in value', () => {
            const { path } = system.recruitPath({});
            system.addWaypoint(path.pathId, { name: 'w1' });
            system.addWaypoint(path.pathId, { name: 'w2' });
            // level=1, clarity=20, waypoints=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculatePathValue(path.pathId)).toBe(200);
        });

        it('should scale with level', () => {
            const { path } = system.recruitPath({});
            system.levelUpPath(path.pathId);
            system.levelUpPath(path.pathId);
            // level=3, clarity=20, waypoints=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculatePathValue(path.pathId)).toBe(340);
        });

        it('should scale with clarity', () => {
            const { path } = system.recruitPath({});
            system.raiseClarity(path.pathId, 100);
            // level=1, clarity=120, waypoints=0 -> 1*100 + 120*2 + 0 = 340
            expect(system.calculatePathValue(path.pathId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePathValue('ghost')).toBe(0);
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
            const unregister = system.registerHook('pathRecruited', () => count++);
            unregister();
            system.recruitPath({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('pathRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitPath({})).not.toThrow();
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
            system.recruitPath({});
            const json = system.toJSON();
            expect(json.paths.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitPath({});
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
