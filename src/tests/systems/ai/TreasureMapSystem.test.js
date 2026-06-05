/**
 * TreasureMapSystem.test.js - 藏宝图系统测试
 * V331 Iteration 1/9 Round 6 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreasureMapSystem } from '../../../systems/ai/TreasureMapSystem.js';

describe('TreasureMapSystem', () => {
    let system;
    beforeEach(() => { system = new TreasureMapSystem(); });

    describe('registerExplorer', () => {
        it('should register', () => {
            const { explorer } = system.registerExplorer({ name: 'E1' });
            expect(explorer.name).toBe('E1');
        });

        it('should default luck to 0.5', () => {
            const { explorer } = system.registerExplorer({});
            expect(explorer.luck).toBe(0.5);
        });

        it('should start at level 1', () => {
            const { explorer } = system.registerExplorer({});
            expect(explorer.level).toBe(1);
        });
    });

    describe('getExplorer', () => {
        it('should return', () => {
            const { explorer } = system.registerExplorer({});
            expect(system.getExplorer(explorer.explorerId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getExplorer('ghost')).toBeNull(); });
    });

    describe('listExplorers', () => {
        it('should list all', () => {
            system.registerExplorer({});
            expect(system.listExplorers().length).toBe(1);
        });
    });

    describe('generateMap', () => {
        it('should generate', () => {
            const { map } = system.generateMap({ name: 'M1' });
            expect(map.name).toBe('M1');
        });

        it('should set rarity', () => {
            const { map } = system.generateMap({});
            expect(['common', 'rare', 'epic', 'legendary', 'mythic']).toContain(map.rarity);
        });

        it('should start undiscovered', () => {
            const { map } = system.generateMap({});
            expect(map.discovered).toBe(false);
        });

        it('should trigger mapGenerated hook', () => {
            let called = false;
            system.registerHook('mapGenerated', () => { called = true; });
            system.generateMap({});
            expect(called).toBe(true);
        });

        it('should increment totalMaps', () => {
            system.generateMap({});
            expect(system.stats.totalMaps).toBe(1);
        });
    });

    describe('getMap', () => {
        it('should return', () => {
            const { map } = system.generateMap({});
            expect(system.getMap(map.mapId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMap('ghost')).toBeNull(); });
    });

    describe('listMaps', () => {
        it('should list all', () => {
            system.generateMap({});
            expect(system.listMaps().length).toBe(1);
        });
    });

    describe('listMapsByRarity', () => {
        it('should filter by rarity', () => {
            system.maps.set('m1', { mapId: 'm1', rarity: 'rare', clues: [], treasures: [], discovered: false });
            system.maps.set('m2', { mapId: 'm2', rarity: 'epic', clues: [], treasures: [], discovered: false });
            expect(system.listMapsByRarity('rare').length).toBe(1);
        });
    });

    describe('addClue', () => {
        it('should add', () => {
            const { map } = system.generateMap({});
            const result = system.addClue(map.mapId, { text: 'x' });
            expect(result.success).toBe(true);
        });

        it('should reject missing map', () => {
            const result = system.addClue('ghost', {});
            expect(result.error).toBe('MAP_NOT_FOUND');
        });

        it('should add to map clues', () => {
            const { map } = system.generateMap({});
            system.addClue(map.mapId, { text: 'x' });
            expect(map.clues.length).toBe(1);
        });

        it('should trigger clueAdded hook', () => {
            const { map } = system.generateMap({});
            let called = false;
            system.registerHook('clueAdded', () => { called = true; });
            system.addClue(map.mapId, {});
            expect(called).toBe(true);
        });
    });

    describe('getClue', () => {
        it('should return', () => {
            const { map } = system.generateMap({});
            const { clue } = system.addClue(map.mapId, {});
            expect(system.getClue(clue.clueId)).not.toBeNull();
        });

        it('should return null for missing', () => { expect(system.getClue('ghost')).toBeNull(); });
    });

    describe('listClues', () => {
        it('should list all', () => {
            const { map } = system.generateMap({});
            system.addClue(map.mapId, {});
            expect(system.listClues().length).toBe(1);
        });

        it('should filter by map', () => {
            const { map: m1 } = system.generateMap({});
            const { map: m2 } = system.generateMap({});
            system.addClue(m1.mapId, {});
            system.addClue(m2.mapId, {});
            expect(system.listClues(m1.mapId).length).toBe(1);
        });
    });

    describe('discoverTreasure', () => {
        it('should discover', () => {
            const { map } = system.generateMap({});
            const { explorer } = system.registerExplorer({});
            const result = system.discoverTreasure(map.mapId, explorer.explorerId);
            expect(result.success).toBe(true);
        });

        it('should reject missing map', () => {
            const { explorer } = system.registerExplorer({});
            const result = system.discoverTreasure('ghost', explorer.explorerId);
            expect(result.error).toBe('MAP_NOT_FOUND');
        });

        it('should reject missing explorer', () => {
            const { map } = system.generateMap({});
            const result = system.discoverTreasure(map.mapId, 'ghost');
            expect(result.error).toBe('EXPLORER_NOT_FOUND');
        });

        it('should reject already discovered', () => {
            const { map } = system.generateMap({});
            const { explorer } = system.registerExplorer({});
            system.discoverTreasure(map.mapId, explorer.explorerId);
            const result = system.discoverTreasure(map.mapId, explorer.explorerId);
            expect(result.error).toBe('ALREADY_DISCOVERED');
        });

        it('should set map discovered', () => {
            const { map } = system.generateMap({});
            const { explorer } = system.registerExplorer({});
            system.discoverTreasure(map.mapId, explorer.explorerId);
            expect(map.discovered).toBe(true);
        });

        it('should increment totalDiscovered', () => {
            const { map } = system.generateMap({});
            const { explorer } = system.registerExplorer({});
            system.discoverTreasure(map.mapId, explorer.explorerId);
            expect(system.stats.totalDiscovered).toBe(1);
        });

        it('should increase explorer experience', () => {
            const { map } = system.generateMap({});
            const { explorer } = system.registerExplorer({});
            const before = explorer.experience;
            system.discoverTreasure(map.mapId, explorer.explorerId);
            expect(explorer.experience).toBeGreaterThan(before);
        });

        it('should trigger treasureDiscovered hook', () => {
            const { map } = system.generateMap({});
            const { explorer } = system.registerExplorer({});
            let called = false;
            system.registerHook('treasureDiscovered', () => { called = true; });
            system.discoverTreasure(map.mapId, explorer.explorerId);
            expect(called).toBe(true);
        });
    });

    describe('getDiscovery', () => {
        it('should return', () => {
            const { map } = system.generateMap({});
            const { explorer } = system.registerExplorer({});
            const { discovery } = system.discoverTreasure(map.mapId, explorer.explorerId);
            expect(system.getDiscovery(discovery.discoveryId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDiscovery('ghost')).toBeNull(); });
    });

    describe('listDiscoveries', () => {
        it('should list all', () => {
            const { map } = system.generateMap({});
            const { explorer } = system.registerExplorer({});
            system.discoverTreasure(map.mapId, explorer.explorerId);
            expect(system.listDiscoveries().length).toBe(1);
        });
    });

    describe('listDiscoveriesByExplorer', () => {
        it('should filter by explorer', () => {
            const { map: m1 } = system.generateMap({});
            const { map: m2 } = system.generateMap({});
            const { explorer: e1 } = system.registerExplorer({});
            const { explorer: e2 } = system.registerExplorer({});
            system.discoverTreasure(m1.mapId, e1.explorerId);
            system.discoverTreasure(m2.mapId, e2.explorerId);
            expect(system.listDiscoveriesByExplorer(e1.explorerId).length).toBe(1);
        });
    });

    describe('deleteMap', () => {
        it('should delete', () => {
            const { map } = system.generateMap({});
            const result = system.deleteMap(map.mapId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteMap('ghost');
            expect(result.error).toBe('MAP_NOT_FOUND');
        });

        it('should clean clues', () => {
            const { map } = system.generateMap({});
            system.addClue(map.mapId, {});
            system.deleteMap(map.mapId);
            expect(system.clues.size).toBe(0);
        });

        it('should trigger mapDeleted hook', () => {
            const { map } = system.generateMap({});
            let called = false;
            system.registerHook('mapDeleted', () => { called = true; });
            system.deleteMap(map.mapId);
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

        it('should execute default getClue', () => {
            const result = system.executeTool('getClue', { clueId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('mapGenerated', () => count++);
            unregister();
            system.generateMap({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('mapGenerated', () => { throw new Error('x'); });
            expect(() => system.generateMap({})).not.toThrow();
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
            system.generateMap({});
            const json = system.toJSON();
            expect(json.maps.length).toBe(1);
        });
        it('should deserialize', () => {
            system.generateMap({});
            const json = system.toJSON();
            const newSys = new TreasureMapSystem();
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