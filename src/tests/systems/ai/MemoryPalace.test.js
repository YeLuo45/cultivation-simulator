/**
 * MemoryPalace.test.js - 记忆宫殿测试
 * V417 Iteration 9/15 Round 14 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryPalace } from '../../../systems/ai/MemoryPalace.js';

describe('MemoryPalace', () => {
    let system;
    beforeEach(() => { system = new MemoryPalace(); });

    describe('buildPalace', () => {
        it('should build', () => {
            const { palace } = system.buildPalace({ cultivatorId: 'c1' });
            expect(palace.cultivatorId).toBe('c1');
        });

        it('should use baseRooms and baseCapacity defaults', () => {
            const { palace } = system.buildPalace({});
            expect(palace.rooms).toBe(10);
            expect(palace.capacity).toBe(100);
        });

        it('should trigger palaceBuilt hook', () => {
            let called = false;
            system.registerHook('palaceBuilt', () => { called = true; });
            system.buildPalace({});
            expect(called).toBe(true);
        });
    });

    describe('getPalace', () => {
        it('should return', () => {
            const { palace } = system.buildPalace({});
            expect(system.getPalace(palace.palaceId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPalace('ghost')).toBeNull(); });
    });

    describe('listPalaces', () => {
        it('should list all', () => {
            system.buildPalace({});
            expect(system.listPalaces().length).toBe(1);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.buildPalace({ cultivatorId: 'c1' });
            system.buildPalace({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listByBrightness', () => {
        it('should filter', () => {
            system.buildPalace({ brightness: 50 });
            system.buildPalace({ brightness: 90 });
            expect(system.listByBrightness(80).length).toBe(1);
        });
    });

    describe('addRoom', () => {
        it('should increase rooms', () => {
            const { palace } = system.buildPalace({});
            system.addRoom(palace.palaceId, 'library');
            expect(palace.rooms).toBe(11);
        });

        it('should reject missing palace', () => {
            const result = system.addRoom('ghost', 'void');
            expect(result.error).toBe('PALACE_NOT_FOUND');
        });

        it('should trigger roomAdded hook', () => {
            const { palace } = system.buildPalace({});
            let called = false;
            system.registerHook('roomAdded', () => { called = true; });
            system.addRoom(palace.palaceId, 'study');
            expect(called).toBe(true);
        });

        it('should default name when none provided', () => {
            const { palace } = system.buildPalace({});
            const { room } = system.addRoom(palace.palaceId);
            expect(room.name).toMatch(/^room_/);
        });
    });

    describe('storeMemory', () => {
        it('should increase brightness', () => {
            const { palace } = system.buildPalace({});
            system.storeMemory(palace.palaceId, 'm1', 'memory1');
            expect(palace.brightness).toBe(55);
        });

        it('should cap brightness at 100', () => {
            const { palace } = system.buildPalace({ brightness: 99 });
            system.storeMemory(palace.palaceId, 'm1');
            expect(palace.brightness).toBe(100);
        });

        it('should reject missing palace', () => {
            const result = system.storeMemory('ghost', 'm1');
            expect(result.error).toBe('PALACE_NOT_FOUND');
        });

        it('should trigger memoryStored hook', () => {
            const { palace } = system.buildPalace({});
            let called = false;
            system.registerHook('memoryStored', () => { called = true; });
            system.storeMemory(palace.palaceId, 'm1');
            expect(called).toBe(true);
        });
    });

    describe('expandPalace', () => {
        it('should expand by default amount', () => {
            const { palace } = system.buildPalace({});
            system.expandPalace(palace.palaceId);
            expect(palace.capacity).toBe(105);
        });

        it('should expand by custom amount', () => {
            const { palace } = system.buildPalace({});
            system.expandPalace(palace.palaceId, 50);
            expect(palace.capacity).toBe(150);
        });

        it('should reject missing palace', () => {
            const result = system.expandPalace('ghost', 10);
            expect(result.error).toBe('PALACE_NOT_FOUND');
        });

        it('should trigger palaceExpanded hook', () => {
            const { palace } = system.buildPalace({});
            let called = false;
            system.registerHook('palaceExpanded', () => { called = true; });
            system.expandPalace(palace.palaceId, 10);
            expect(called).toBe(true);
        });
    });

    describe('calculateCapacity', () => {
        it('should calculate', () => {
            const { palace } = system.buildPalace({ rooms: 5 });
            expect(system.calculateCapacity(palace.palaceId)).toBe(150);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCapacity('ghost')).toBe(0);
        });
    });

    describe('listRadiant', () => {
        it('should filter radiant', () => {
            system.buildPalace({ brightness: 50 });
            system.buildPalace({ brightness: 90 });
            expect(system.listRadiant().length).toBe(1);
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

        it('should execute default getPalace', () => {
            const result = system.executeTool('getPalace', { palaceId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('palaceBuilt', () => count++);
            unregister();
            system.buildPalace({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('palaceBuilt', () => { throw new Error('x'); });
            expect(() => system.buildPalace({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPalaces = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPalaces = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.buildPalace({});
            const json = system.toJSON();
            expect(json.palaces.length).toBe(1);
        });
        it('should deserialize', () => {
            system.buildPalace({});
            const json = system.toJSON();
            const newSys = new MemoryPalace();
            newSys.fromJSON(json);
            expect(newSys.palaces.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.palaceCount).toBe(0);
        });
    });
});
