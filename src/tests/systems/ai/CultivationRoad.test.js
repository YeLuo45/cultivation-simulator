/**
 * CultivationRoad.test.js - 修真路测试
 * V751 Iteration 14/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationRoad } from '../../../systems/ai/CultivationRoad.js';

describe('CultivationRoad', () => {
    let system;
    beforeEach(() => { system = new CultivationRoad(); });

    describe('recruitRoad', () => {
        it('should recruit', () => {
            const { road } = system.recruitRoad({ masterId: 'm1', name: 'Heavenly Road', type: 'main' });
            expect(road.masterId).toBe('m1');
            expect(road.name).toBe('Heavenly Road');
            expect(road.type).toBe('main');
        });

        it('should default type to main', () => {
            const { road } = system.recruitRoad({});
            expect(road.type).toBe('main');
        });

        it('should default status to novice', () => {
            const { road } = system.recruitRoad({});
            expect(road.status).toBe('novice');
        });

        it('should default steadiness to baseSteadiness', () => {
            const { road } = system.recruitRoad({});
            expect(road.steadiness).toBe(20);
        });

        it('should start at level 1', () => {
            const { road } = system.recruitRoad({});
            expect(road.level).toBe(1);
        });

        it('should start with empty stones', () => {
            const { road } = system.recruitRoad({});
            expect(road.stones).toEqual([]);
        });

        it('should generate roadId', () => {
            const { road } = system.recruitRoad({});
            expect(road.roadId).toBeDefined();
            expect(typeof road.roadId).toBe('string');
        });

        it('should accept custom roadId', () => {
            const { road } = system.recruitRoad({ roadId: 'my-road' });
            expect(road.roadId).toBe('my-road');
        });

        it('should trigger roadRecruited hook', () => {
            let called = false;
            system.registerHook('roadRecruited', () => { called = true; });
            system.recruitRoad({});
            expect(called).toBe(true);
        });

        it('should support all types', () => {
            const { road: r1 } = system.recruitRoad({ type: 'main' });
            const { road: r2 } = system.recruitRoad({ type: 'branch' });
            const { road: r3 } = system.recruitRoad({ type: 'sacred' });
            expect(r1.type).toBe('main');
            expect(r2.type).toBe('branch');
            expect(r3.type).toBe('sacred');
        });
    });

    describe('getRoad', () => {
        it('should return road', () => {
            const { road } = system.recruitRoad({});
            expect(system.getRoad(road.roadId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getRoad('ghost')).toBeNull(); });
    });

    describe('listRoads', () => {
        it('should list all', () => {
            system.recruitRoad({});
            system.recruitRoad({});
            expect(system.listRoads().length).toBe(2);
        });

        it('should return empty when no roads', () => {
            expect(system.listRoads().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitRoad({ masterId: 'm1' });
            system.recruitRoad({ masterId: 'm2' });
            system.recruitRoad({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitRoad({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { road: r1 } = system.recruitRoad({});
            const { road: r2 } = system.recruitRoad({});
            system.legendRoad(r1.roadId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].roadId).toBe(r1.roadId);
            expect(r2.status).toBe('novice');
        });
    });

    describe('addStone', () => {
        it('should add stone', () => {
            const { road } = system.recruitRoad({});
            system.addStone(road.roadId, { name: 'foundation-stone' });
            expect(road.stones.length).toBe(1);
        });

        it('should accumulate stones', () => {
            const { road } = system.recruitRoad({});
            system.addStone(road.roadId, { name: 's1' });
            system.addStone(road.roadId, { name: 's2' });
            system.addStone(road.roadId, { name: 's3' });
            expect(road.stones.length).toBe(3);
        });

        it('should reject missing road', () => {
            const result = system.addStone('ghost', { name: 's' });
            expect(result.error).toBe('ROAD_NOT_FOUND');
        });

        it('should trigger stoneAdded hook', () => {
            const { road } = system.recruitRoad({});
            let called = false;
            system.registerHook('stoneAdded', () => { called = true; });
            system.addStone(road.roadId, { name: 's' });
            expect(called).toBe(true);
        });
    });

    describe('raiseSteadiness', () => {
        it('should raise steadiness by default', () => {
            const { road } = system.recruitRoad({});
            system.raiseSteadiness(road.roadId);
            expect(road.steadiness).toBe(25);
        });

        it('should raise steadiness by custom amount', () => {
            const { road } = system.recruitRoad({});
            system.raiseSteadiness(road.roadId, 30);
            expect(road.steadiness).toBe(50);
        });

        it('should reject missing road', () => {
            const result = system.raiseSteadiness('ghost');
            expect(result.error).toBe('ROAD_NOT_FOUND');
        });

        it('should trigger steadinessRaised hook', () => {
            const { road } = system.recruitRoad({});
            let called = false;
            system.registerHook('steadinessRaised', () => { called = true; });
            system.raiseSteadiness(road.roadId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpRoad', () => {
        it('should level up', () => {
            const { road } = system.recruitRoad({});
            system.levelUpRoad(road.roadId);
            expect(road.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { road } = system.recruitRoad({});
            system.levelUpRoad(road.roadId);
            system.levelUpRoad(road.roadId);
            system.levelUpRoad(road.roadId);
            expect(road.level).toBe(4);
        });

        it('should reject missing road', () => {
            const result = system.levelUpRoad('ghost');
            expect(result.error).toBe('ROAD_NOT_FOUND');
        });

        it('should trigger roadLeveledUp hook', () => {
            const { road } = system.recruitRoad({});
            let called = false;
            system.registerHook('roadLeveledUp', () => { called = true; });
            system.levelUpRoad(road.roadId);
            expect(called).toBe(true);
        });
    });

    describe('legendRoad', () => {
        it('should legendize road', () => {
            const { road } = system.recruitRoad({});
            system.legendRoad(road.roadId);
            expect(road.status).toBe('legendary');
        });

        it('should reject missing road', () => {
            const result = system.legendRoad('ghost');
            expect(result.error).toBe('ROAD_NOT_FOUND');
        });

        it('should trigger roadLegendized hook', () => {
            const { road } = system.recruitRoad({});
            let called = false;
            system.registerHook('roadLegendized', () => { called = true; });
            system.legendRoad(road.roadId);
            expect(called).toBe(true);
        });
    });

    describe('calculateRoadValue', () => {
        it('should calculate base value', () => {
            const { road } = system.recruitRoad({});
            // level=1, steadiness=20, stones=0 -> 1*100 + 20*2 + 0 = 140
            expect(system.calculateRoadValue(road.roadId)).toBe(140);
        });

        it('should include stones in value', () => {
            const { road } = system.recruitRoad({});
            system.addStone(road.roadId, { name: 's1' });
            system.addStone(road.roadId, { name: 's2' });
            // level=1, steadiness=20, stones=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateRoadValue(road.roadId)).toBe(200);
        });

        it('should scale with level', () => {
            const { road } = system.recruitRoad({});
            system.levelUpRoad(road.roadId);
            system.levelUpRoad(road.roadId);
            // level=3, steadiness=20, stones=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculateRoadValue(road.roadId)).toBe(340);
        });

        it('should scale with steadiness', () => {
            const { road } = system.recruitRoad({});
            system.raiseSteadiness(road.roadId, 100);
            // level=1, steadiness=120, stones=0 -> 1*100 + 120*2 + 0 = 340
            expect(system.calculateRoadValue(road.roadId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateRoadValue('ghost')).toBe(0);
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

        it('should execute default getRoad', () => {
            const result = system.executeTool('getRoad', { roadId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('roadRecruited', () => count++);
            unregister();
            system.recruitRoad({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('roadRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitRoad({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalRoads = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalRoads = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitRoad({});
            const json = system.toJSON();
            expect(json.roads.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitRoad({});
            const json = system.toJSON();
            const newSys = new CultivationRoad();
            newSys.fromJSON(json);
            expect(newSys.roads.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.roadCount).toBe(0);
        });
    });
});
