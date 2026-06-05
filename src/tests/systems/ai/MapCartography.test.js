/**
 * MapCartography.test.js - 地图绘制系统测试
 * V335 Iteration 5/9 Round 6 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MapCartography } from '../../../systems/ai/MapCartography.js';

describe('MapCartography', () => {
    let system;
    beforeEach(() => { system = new MapCartography(); });

    describe('createMap', () => {
        it('should create', () => {
            const { map } = system.createMap({ name: 'M1' });
            expect(map.name).toBe('M1');
        });

        it('should default scale to continent', () => {
            const { map } = system.createMap({});
            expect(map.scale).toBe('continent');
        });

        it('should start unexplored', () => {
            const { map } = system.createMap({});
            expect(map.explored).toBe(0);
        });

        it('should trigger mapCreated hook', () => {
            let called = false;
            system.registerHook('mapCreated', () => { called = true; });
            system.createMap({});
            expect(called).toBe(true);
        });
    });

    describe('getMap', () => {
        it('should return', () => {
            const { map } = system.createMap({});
            expect(system.getMap(map.mapId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMap('ghost')).toBeNull(); });
    });

    describe('listMaps', () => {
        it('should list all', () => {
            system.createMap({});
            expect(system.listMaps().length).toBe(1);
        });
    });

    describe('addRegion', () => {
        it('should add', () => {
            const { map } = system.createMap({});
            const result = system.addRegion(map.mapId, { name: 'R1' });
            expect(result.success).toBe(true);
        });

        it('should reject missing map', () => {
            const result = system.addRegion('ghost', {});
            expect(result.error).toBe('MAP_NOT_FOUND');
        });

        it('should trigger regionAdded hook', () => {
            const { map } = system.createMap({});
            let called = false;
            system.registerHook('regionAdded', () => { called = true; });
            system.addRegion(map.mapId, {});
            expect(called).toBe(true);
        });
    });

    describe('getRegion', () => {
        it('should return', () => {
            const { map } = system.createMap({});
            const { region } = system.addRegion(map.mapId, {});
            expect(system.getRegion(region.regionId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getRegion('ghost')).toBeNull(); });
    });

    describe('listRegions', () => {
        it('should filter by map', () => {
            const { map: m1 } = system.createMap({});
            const { map: m2 } = system.createMap({});
            system.addRegion(m1.mapId, {});
            system.addRegion(m2.mapId, {});
            expect(system.listRegions(m1.mapId).length).toBe(1);
        });
    });

    describe('connectRegions', () => {
        it('should connect', () => {
            const { map } = system.createMap({});
            const { region: a } = system.addRegion(map.mapId, {});
            const { region: b } = system.addRegion(map.mapId, {});
            const result = system.connectRegions(map.mapId, a.regionId, b.regionId);
            expect(result.success).toBe(true);
        });

        it('should reject missing map', () => {
            const result = system.connectRegions('ghost', 'a', 'b');
            expect(result.error).toBe('MAP_NOT_FOUND');
        });

        it('should reject missing region', () => {
            const { map } = system.createMap({});
            const result = system.connectRegions(map.mapId, 'a', 'b');
            expect(result.error).toBe('REGION_NOT_FOUND');
        });

        it('should not duplicate', () => {
            const { map } = system.createMap({});
            const { region: a } = system.addRegion(map.mapId, {});
            const { region: b } = system.addRegion(map.mapId, {});
            system.connectRegions(map.mapId, a.regionId, b.regionId);
            system.connectRegions(map.mapId, a.regionId, b.regionId);
            expect(system.getConnections(map.mapId).length).toBe(1);
        });
    });

    describe('getConnections', () => {
        it('should return empty for missing', () => {
            expect(system.getConnections('ghost').length).toBe(0);
        });
    });

    describe('exploreRegion', () => {
        it('should explore', () => {
            const { map } = system.createMap({ total: 100 });
            const result = system.exploreRegion(map.mapId, 10);
            expect(map.explored).toBe(10);
        });

        it('should reject missing map', () => {
            const result = system.exploreRegion('ghost', 10);
            expect(result.error).toBe('MAP_NOT_FOUND');
        });

        it('should cap at total', () => {
            const { map } = system.createMap({ total: 100 });
            system.exploreRegion(map.mapId, 9999);
            expect(map.explored).toBe(100);
        });

        it('should trigger regionExplored hook', () => {
            const { map } = system.createMap({});
            let called = false;
            system.registerHook('regionExplored', () => { called = true; });
            system.exploreRegion(map.mapId, 10);
            expect(called).toBe(true);
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

        it('should execute default getMap', () => {
            const result = system.executeTool('getMap', { mapId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('mapCreated', () => count++);
            unregister();
            system.createMap({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('mapCreated', () => { throw new Error('x'); });
            expect(() => system.createMap({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMaps = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMaps = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createMap({});
            const json = system.toJSON();
            expect(json.maps.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createMap({});
            const json = system.toJSON();
            const newSys = new MapCartography();
            newSys.fromJSON(json);
            expect(newSys.maps.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.mapCount).toBe(0);
        });
    });
});