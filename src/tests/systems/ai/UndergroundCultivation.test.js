/**
 * UndergroundCultivation.test.js - 地下探索系统测试
 * V467 Iteration 14/15 Round 17 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { UndergroundCultivation } from '../../../systems/ai/UndergroundCultivation.js';

describe('UndergroundCultivation', () => {
    let system;
    beforeEach(() => { system = new UndergroundCultivation(); });

    describe('enterCave', () => {
        it('should create cave', () => {
            const { cave } = system.enterCave({ explorerId: 'e1', name: 'Dark Hollow' });
            expect(cave.explorerId).toBe('e1');
            expect(cave.name).toBe('Dark Hollow');
            expect(cave.depth).toBe(0);
            expect(cave.darkness).toBe(100);
            expect(cave.status).toBe('unexplored');
        });

        it('should trigger caveEntered hook', () => {
            let called = false;
            system.registerHook('caveEntered', () => { called = true; });
            system.enterCave({});
            expect(called).toBe(true);
        });
    });

    describe('getCave', () => {
        it('should return cave', () => {
            const { cave } = system.enterCave({});
            expect(system.getCave(cave.caveId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getCave('ghost')).toBeNull();
        });
    });

    describe('listCaves', () => {
        it('should list all', () => {
            system.enterCave({});
            system.enterCave({});
            expect(system.listCaves().length).toBe(2);
        });
    });

    describe('listByExplorer', () => {
        it('should filter by explorer', () => {
            system.enterCave({ explorerId: 'e1' });
            system.enterCave({ explorerId: 'e2' });
            expect(system.listByExplorer('e1').length).toBe(1);
        });
    });

    describe('listMapped', () => {
        it('should filter mapped and conquered', () => {
            const { cave: c1 } = system.enterCave({});
            const { cave: c2 } = system.enterCave({});
            system.deepenCave(c1.caveId, 5);
            system.conquerCave(c2.caveId);
            const mapped = system.listMapped();
            expect(mapped.length).toBe(2);
        });
    });

    describe('deepenCave', () => {
        it('should deepen', () => {
            const { cave } = system.enterCave({});
            system.deepenCave(cave.caveId, 20);
            expect(cave.depth).toBe(20);
        });

        it('should switch status to mapped', () => {
            const { cave } = system.enterCave({});
            system.deepenCave(cave.caveId, 5);
            expect(cave.status).toBe('mapped');
        });

        it('should reject missing', () => {
            const result = system.deepenCave('ghost', 10);
            expect(result.error).toBe('CAVE_NOT_FOUND');
        });

        it('should trigger caveDeepened hook', () => {
            const { cave } = system.enterCave({});
            let called = false;
            system.registerHook('caveDeepened', () => { called = true; });
            system.deepenCave(cave.caveId, 10);
            expect(called).toBe(true);
        });
    });

    describe('lightUp', () => {
        it('should reduce darkness', () => {
            const { cave } = system.enterCave({});
            system.lightUp(cave.caveId, 30);
            expect(cave.darkness).toBe(70);
        });

        it('should not go below 0', () => {
            const { cave } = system.enterCave({});
            system.lightUp(cave.caveId, 200);
            expect(cave.darkness).toBe(0);
        });

        it('should reject missing', () => {
            const result = system.lightUp('ghost', 5);
            expect(result.error).toBe('CAVE_NOT_FOUND');
        });

        it('should trigger lightIncreased hook', () => {
            const { cave } = system.enterCave({});
            let called = false;
            system.registerHook('lightIncreased', () => { called = true; });
            system.lightUp(cave.caveId, 5);
            expect(called).toBe(true);
        });
    });

    describe('encounterCreature', () => {
        it('should add creature', () => {
            const { cave } = system.enterCave({});
            system.encounterCreature(cave.caveId, { kind: 'bat' });
            expect(cave.creatures.length).toBe(1);
            expect(cave.creatures[0].kind).toBe('bat');
        });

        it('should switch status to mapped', () => {
            const { cave } = system.enterCave({});
            system.encounterCreature(cave.caveId, { kind: 'spider' });
            expect(cave.status).toBe('mapped');
        });

        it('should reject missing', () => {
            const result = system.encounterCreature('ghost', { kind: 'bat' });
            expect(result.error).toBe('CAVE_NOT_FOUND');
        });
    });

    describe('findTreasure', () => {
        it('should add treasure', () => {
            const { cave } = system.enterCave({});
            system.findTreasure(cave.caveId, { type: 'gold' });
            expect(cave.treasures.length).toBe(1);
        });

        it('should switch status to mapped', () => {
            const { cave } = system.enterCave({});
            system.findTreasure(cave.caveId, { type: 'gem' });
            expect(cave.status).toBe('mapped');
        });

        it('should reject missing', () => {
            const result = system.findTreasure('ghost', { type: 'gold' });
            expect(result.error).toBe('CAVE_NOT_FOUND');
        });
    });

    describe('conquerCave', () => {
        it('should set status to conquered', () => {
            const { cave } = system.enterCave({});
            system.conquerCave(cave.caveId);
            expect(cave.status).toBe('conquered');
        });

        it('should reject missing', () => {
            const result = system.conquerCave('ghost');
            expect(result.error).toBe('CAVE_NOT_FOUND');
        });

        it('should trigger caveConquered hook', () => {
            const { cave } = system.enterCave({});
            let called = false;
            system.registerHook('caveConquered', () => { called = true; });
            system.conquerCave(cave.caveId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDepthPower', () => {
        it('should calculate for empty cave', () => {
            const { cave } = system.enterCave({});
            // depth=0*2 + 0*5 + (100-100)/10 = 0
            expect(system.calculateDepthPower(cave.caveId)).toBe(0);
        });

        it('should include depth and treasures and darkness', () => {
            const { cave } = system.enterCave({});
            system.deepenCave(cave.caveId, 20);
            system.findTreasure(cave.caveId, { type: 'gold' });
            system.findTreasure(cave.caveId, { type: 'gem' });
            system.lightUp(cave.caveId, 50);
            // depth=20*2 + 2*5 + (100-50)/10 = 40 + 10 + 5 = 55
            expect(system.calculateDepthPower(cave.caveId)).toBe(55);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDepthPower('ghost')).toBe(0);
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

        it('should execute default getCave', () => {
            const result = system.executeTool('getCave', { caveId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('caveEntered', () => count++);
            unregister();
            system.enterCave({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('caveEntered', () => { throw new Error('x'); });
            expect(() => system.enterCave({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCaves = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCaves = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.enterCave({});
            const json = system.toJSON();
            expect(json.caves.length).toBe(1);
        });
        it('should deserialize', () => {
            system.enterCave({});
            const json = system.toJSON();
            const newSys = new UndergroundCultivation();
            newSys.fromJSON(json);
            expect(newSys.caves.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.caveCount).toBe(0);
        });
    });
});
