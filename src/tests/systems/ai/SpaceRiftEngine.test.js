/**
 * SpaceRiftEngine.test.js - 空间裂缝引擎测试
 * V353 Iteration 5/9 Round 8 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SpaceRiftEngine } from '../../../systems/ai/SpaceRiftEngine.js';

describe('SpaceRiftEngine', () => {
    let system;
    beforeEach(() => { system = new SpaceRiftEngine(); });

    describe('createRift', () => {
        it('should create', () => {
            const { rift } = system.createRift({ name: 'R1' });
            expect(rift.name).toBe('R1');
        });

        it('should default stability to 1.0', () => {
            const { rift } = system.createRift({});
            expect(rift.stability).toBe(1.0);
        });

        it('should trigger riftCreated hook', () => {
            let called = false;
            system.registerHook('riftCreated', () => { called = true; });
            system.createRift({});
            expect(called).toBe(true);
        });
    });

    describe('getRift', () => {
        it('should return', () => {
            const { rift } = system.createRift({});
            expect(system.getRift(rift.riftId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getRift('ghost')).toBeNull(); });
    });

    describe('listRifts', () => {
        it('should list all', () => {
            system.createRift({});
            expect(system.listRifts().length).toBe(1);
        });
    });

    describe('listByLocation', () => {
        it('should filter', () => {
            system.createRift({ location: 'mountain' });
            system.createRift({ location: 'sea' });
            expect(system.listByLocation('mountain').length).toBe(1);
        });
    });

    describe('listByStatus', () => {
        it('should filter', () => {
            system.createRift({});
            const { rift } = system.createRift({});
            rift.status = 'unstable'; // Override default
            expect(system.listByStatus('stable').length).toBe(1);
        });
    });

    describe('expandRift', () => {
        it('should expand', () => {
            const { rift } = system.createRift({ size: 1 });
            const result = system.expandRift(rift.riftId, 1);
            expect(rift.size).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.expandRift('ghost', 1);
            expect(result.error).toBe('RIFT_NOT_FOUND');
        });

        it('should reduce stability', () => {
            const { rift } = system.createRift({ size: 1 });
            system.expandRift(rift.riftId, 1);
            expect(rift.stability).toBeLessThan(1);
        });

        it('should trigger riftExpanded hook', () => {
            const { rift } = system.createRift({});
            let called = false;
            system.registerHook('riftExpanded', () => { called = true; });
            system.expandRift(rift.riftId, 1);
            expect(called).toBe(true);
        });
    });

    describe('stabilizeRift', () => {
        it('should stabilize', () => {
            const { rift } = system.createRift({ stability: 0.5 });
            const result = system.stabilizeRift(rift.riftId, 0.5);
            expect(rift.stability).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.stabilizeRift('ghost', 0.5);
            expect(result.error).toBe('RIFT_NOT_FOUND');
        });

        it('should trigger riftStabilized hook', () => {
            const { rift } = system.createRift({});
            let called = false;
            system.registerHook('riftStabilized', () => { called = true; });
            system.stabilizeRift(rift.riftId, 0.5);
            expect(called).toBe(true);
        });
    });

    describe('closeRift', () => {
        it('should close', () => {
            const { rift } = system.createRift({});
            const result = system.closeRift(rift.riftId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.closeRift('ghost');
            expect(result.error).toBe('RIFT_NOT_FOUND');
        });

        it('should trigger riftClosed hook', () => {
            const { rift } = system.createRift({});
            let called = false;
            system.registerHook('riftClosed', () => { called = true; });
            system.closeRift(rift.riftId);
            expect(called).toBe(true);
        });
    });

    describe('calculateFlux', () => {
        it('should calculate', () => {
            const { rift } = system.createRift({ size: 5, stability: 0.5 });
            expect(system.calculateFlux(rift.riftId)).toBe(250);
        });

        it('should return null for missing', () => {
            expect(system.calculateFlux('ghost')).toBeNull();
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

        it('should execute default getRift', () => {
            const result = system.executeTool('getRift', { riftId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('riftCreated', () => count++);
            unregister();
            system.createRift({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('riftCreated', () => { throw new Error('x'); });
            expect(() => system.createRift({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalRifts = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalRifts = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createRift({});
            const json = system.toJSON();
            expect(json.rifts.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createRift({});
            const json = system.toJSON();
            const newSys = new SpaceRiftEngine();
            newSys.fromJSON(json);
            expect(newSys.rifts.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.riftCount).toBe(0);
        });
    });
});