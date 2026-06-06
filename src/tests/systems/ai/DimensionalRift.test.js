/**
 * DimensionalRift.test.js - 空间裂隙测试
 * V461 Iteration 8/15 Round 17 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DimensionalRift } from '../../../systems/ai/DimensionalRift.js';

describe('DimensionalRift', () => {
    let system;
    beforeEach(() => { system = new DimensionalRift(); });

    describe('openRift', () => {
        it('should open a rift', () => {
            const { rift } = system.openRift({ controllerId: 's1', name: 'VoidGate' });
            expect(rift.controllerId).toBe('s1');
            expect(rift.name).toBe('VoidGate');
        });

        it('should use baseStability default of 50', () => {
            const { rift } = system.openRift({});
            expect(rift.stability).toBe(50);
        });

        it('should default creatures to empty array', () => {
            const { rift } = system.openRift({});
            expect(rift.creatures).toEqual([]);
        });

        it('should default origin to origin_point', () => {
            const { rift } = system.openRift({});
            expect(rift.origin).toBe('origin_point');
        });

        it('should default dimension to unknown_dimension', () => {
            const { rift } = system.openRift({});
            expect(rift.dimension).toBe('unknown_dimension');
        });

        it('should default status to unstable', () => {
            const { rift } = system.openRift({});
            expect(rift.status).toBe('unstable');
        });

        it('should use provided id', () => {
            const { rift } = system.openRift({ id: 'my_id' });
            expect(rift.riftId).toBe('my_id');
        });

        it('should accept provided creatures', () => {
            const { rift } = system.openRift({ creatures: ['imp', 'demon'] });
            expect(rift.creatures).toEqual(['imp', 'demon']);
        });

        it('should increment totalRifts', () => {
            system.openRift({});
            expect(system.stats.totalRifts).toBe(1);
        });

        it('should trigger riftOpened hook', () => {
            let called = false;
            system.registerHook('riftOpened', () => { called = true; });
            system.openRift({});
            expect(called).toBe(true);
        });
    });

    describe('getRift', () => {
        it('should return rift', () => {
            const { rift } = system.openRift({});
            expect(system.getRift(rift.riftId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getRift('ghost')).toBeNull(); });
    });

    describe('listRifts', () => {
        it('should list all', () => {
            system.openRift({});
            expect(system.listRifts().length).toBe(1);
        });

        it('should return empty list when no rifts', () => {
            expect(system.listRifts().length).toBe(0);
        });
    });

    describe('listByController', () => {
        it('should filter by controller', () => {
            system.openRift({ controllerId: 's1' });
            system.openRift({ controllerId: 's2' });
            expect(system.listByController('s1').length).toBe(1);
        });

        it('should return empty for unknown controller', () => {
            system.openRift({ controllerId: 's1' });
            expect(system.listByController('ghost').length).toBe(0);
        });
    });

    describe('listStable', () => {
        it('should filter stable status', () => {
            const { rift: r1 } = system.openRift({});
            r1.status = 'stable';
            const { rift: r2 } = system.openRift({});
            r2.status = 'stable';
            system.openRift({});
            expect(system.listStable().length).toBe(2);
        });

        it('should return empty when no stable', () => {
            system.openRift({});
            expect(system.listStable().length).toBe(0);
        });
    });

    describe('stabilizeRift', () => {
        it('should stabilize', () => {
            const { rift } = system.openRift({});
            system.stabilizeRift(rift.riftId, 10);
            expect(rift.stability).toBe(60);
        });

        it('should use default amount of 5', () => {
            const { rift } = system.openRift({});
            system.stabilizeRift(rift.riftId);
            expect(rift.stability).toBe(55);
        });

        it('should reject missing', () => {
            const result = system.stabilizeRift('ghost', 10);
            expect(result.error).toBe('RIFT_NOT_FOUND');
        });

        it('should trigger riftStabilized hook', () => {
            const { rift } = system.openRift({});
            let called = false;
            system.registerHook('riftStabilized', () => { called = true; });
            system.stabilizeRift(rift.riftId, 10);
            expect(called).toBe(true);
        });
    });

    describe('addCreature', () => {
        it('should add creature', () => {
            const { rift } = system.openRift({});
            system.addCreature(rift.riftId, 'shadow_wolf');
            expect(rift.creatures.length).toBe(1);
            expect(rift.creatures[0]).toBe('shadow_wolf');
        });

        it('should add multiple creatures', () => {
            const { rift } = system.openRift({});
            system.addCreature(rift.riftId, 'imp');
            system.addCreature(rift.riftId, 'demon');
            expect(rift.creatures.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addCreature('ghost', 'imp');
            expect(result.error).toBe('RIFT_NOT_FOUND');
        });

        it('should trigger creatureAdded hook', () => {
            const { rift } = system.openRift({});
            let called = false;
            system.registerHook('creatureAdded', () => { called = true; });
            system.addCreature(rift.riftId, 'imp');
            expect(called).toBe(true);
        });
    });

    describe('sealRift', () => {
        it('should set status to sealed', () => {
            const { rift } = system.openRift({});
            system.sealRift(rift.riftId);
            expect(rift.status).toBe('sealed');
        });

        it('should override stable status', () => {
            const { rift } = system.openRift({ status: 'stable' });
            system.sealRift(rift.riftId);
            expect(rift.status).toBe('sealed');
        });

        it('should reject missing', () => {
            const result = system.sealRift('ghost');
            expect(result.error).toBe('RIFT_NOT_FOUND');
        });

        it('should trigger riftSealed hook', () => {
            const { rift } = system.openRift({});
            let called = false;
            system.registerHook('riftSealed', () => { called = true; });
            system.sealRift(rift.riftId);
            expect(called).toBe(true);
        });
    });

    describe('calculateRiftPower', () => {
        it('should calculate with default values', () => {
            const { rift } = system.openRift({});
            // stability=50, creatures=0 -> 50 * 0 = 0
            expect(system.calculateRiftPower(rift.riftId)).toBe(0);
        });

        it('should reflect creature additions', () => {
            const { rift } = system.openRift({});
            system.addCreature(rift.riftId, 'imp');
            system.addCreature(rift.riftId, 'demon');
            // stability=50, creatures=2 -> 50 * 2 = 100
            expect(system.calculateRiftPower(rift.riftId)).toBe(100);
        });

        it('should reflect stability changes', () => {
            const { rift } = system.openRift({});
            system.addCreature(rift.riftId, 'imp');
            system.stabilizeRift(rift.riftId, 20);
            // stability=70, creatures=1 -> 70 * 1 = 70
            expect(system.calculateRiftPower(rift.riftId)).toBe(70);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateRiftPower('ghost')).toBe(0);
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
            const unregister = system.registerHook('riftOpened', () => count++);
            unregister();
            system.openRift({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('riftOpened', () => { throw new Error('x'); });
            expect(() => system.openRift({})).not.toThrow();
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
            system.openRift({});
            const json = system.toJSON();
            expect(json.rifts.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openRift({});
            const json = system.toJSON();
            const newSys = new DimensionalRift();
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
