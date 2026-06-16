/**
 * InnerUniverse.test.js - 内在宇宙测试
 * V423 Iteration 15/15 FINAL Round 14 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InnerUniverse } from '../../../systems/ai/InnerUniverse.js';

describe('InnerUniverse', () => {
    let system;
    beforeEach(() => { system = new InnerUniverse(); });

    describe('createUniverse', () => {
        it('should create', () => {
            const { universe } = system.createUniverse({ name: 'U1' });
            expect(universe.name).toBe('U1');
        });

        it('should set initial metrics', () => {
            const { universe } = system.createUniverse({});
            expect(system.getMetrics(universe.universeId)).not.toBeNull();
        });

        it('should trigger universeCreated hook', () => {
            let called = false;
            system.registerHook('universeCreated', () => { called = true; });
            system.createUniverse({});
            expect(called).toBe(true);
        });
    });

    describe('getUniverse', () => {
        it('should return', () => {
            const { universe } = system.createUniverse({});
            expect(system.getUniverse(universe.universeId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getUniverse('ghost')).toBeNull(); });
    });

    describe('listUniverses', () => {
        it('should list all', () => {
            system.createUniverse({});
            expect(system.listUniverses().length).toBe(1);
        });
    });

    describe('setMetrics', () => {
        it('should set', () => {
            const { universe } = system.createUniverse({});
            const result = system.setMetrics(universe.universeId, { cultivations: 5 });
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.setMetrics('ghost', {});
            expect(result.error).toBe('UNIVERSE_NOT_FOUND');
        });
    });

    describe('getMetrics', () => {
        it('should return', () => {
            const { universe } = system.createUniverse({});
            expect(system.getMetrics(universe.universeId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getMetrics('ghost')).toBeNull();
        });
    });

    describe('refreshUniverse', () => {
        it('should refresh', () => {
            const { universe } = system.createUniverse({});
            const result = system.refreshUniverse(universe.universeId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.refreshUniverse('ghost');
            expect(result.error).toBe('UNIVERSE_NOT_FOUND');
        });

        it('should trigger universeRefreshed hook', () => {
            const { universe } = system.createUniverse({});
            let called = false;
            system.registerHook('universeRefreshed', () => { called = true; });
            system.refreshUniverse(universe.universeId);
            expect(called).toBe(true);
        });
    });

    describe('calculateUniverseSize', () => {
        it('should calculate', () => {
            const { universe } = system.createUniverse({});
            expect(system.calculateUniverseSize(universe.universeId)).toBe(9000 + 1080);
        });

        it('should return null for missing', () => {
            expect(system.calculateUniverseSize('ghost')).toBeNull();
        });
    });

    describe('calculateCultivationScore', () => {
        it('should calculate', () => {
            const { universe } = system.createUniverse({});
            system.setMetrics(universe.universeId, { cultivations: 10, techniques: 5, treasures: 2, disciples: 3, realms: 1 });
            expect(system.calculateCultivationScore(universe.universeId)).toBe(82);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCultivationScore('ghost')).toBe(0);
        });
    });

    describe('deleteUniverse', () => {
        it('should delete', () => {
            const { universe } = system.createUniverse({});
            const result = system.deleteUniverse(universe.universeId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteUniverse('ghost');
            expect(result.error).toBe('UNIVERSE_NOT_FOUND');
        });

        it('should trigger universeDeleted hook', () => {
            const { universe } = system.createUniverse({});
            let called = false;
            system.registerHook('universeDeleted', () => { called = true; });
            system.deleteUniverse(universe.universeId);
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

        it('should execute default getUniverse', () => {
            const result = system.executeTool('getUniverse', { universeId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('universeCreated', () => count++);
            unregister();
            system.createUniverse({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('universeCreated', () => { throw new Error('x'); });
            expect(() => system.createUniverse({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalUniverses = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalUniverses = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createUniverse({});
            const json = system.toJSON();
            expect(json.universes.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createUniverse({});
            const json = system.toJSON();
            const newSys = new InnerUniverse();
            newSys.fromJSON(json);
            expect(newSys.universes.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.universeCount).toBe(0);
        });
    });
});