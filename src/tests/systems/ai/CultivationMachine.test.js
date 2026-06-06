/**
 * CultivationMachine.test.js - 修真机械测试
 * V573 Iteration 16/20 Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMachine } from '../../../systems/ai/CultivationMachine.js';

describe('CultivationMachine', () => {
    let system;
    beforeEach(() => { system = new CultivationMachine(); });

    describe('buildMachine', () => {
        it('should build', () => {
            const { machine } = system.buildMachine({ engineerId: 'e1', name: 'Iron Gear', type: 'gear' });
            expect(machine.engineerId).toBe('e1');
            expect(machine.name).toBe('Iron Gear');
            expect(machine.type).toBe('gear');
        });

        it('should default to base precision', () => {
            const { machine } = system.buildMachine({});
            expect(machine.precision).toBe(20);
        });

        it('should set status to assembled', () => {
            const { machine } = system.buildMachine({});
            expect(machine.status).toBe('assembled');
        });

        it('should default to empty components', () => {
            const { machine } = system.buildMachine({});
            expect(machine.components).toEqual([]);
        });

        it('should default to level 1', () => {
            const { machine } = system.buildMachine({});
            expect(machine.level).toBe(1);
        });

        it('should default to gear type', () => {
            const { machine } = system.buildMachine({});
            expect(machine.type).toBe('gear');
        });

        it('should trigger machineBuilt hook', () => {
            let called = false;
            system.registerHook('machineBuilt', () => { called = true; });
            system.buildMachine({});
            expect(called).toBe(true);
        });

        it('should generate unique ids', () => {
            const { machine: m1 } = system.buildMachine({});
            const { machine: m2 } = system.buildMachine({});
            expect(m1.machineId).not.toBe(m2.machineId);
        });
    });

    describe('getMachine', () => {
        it('should return', () => {
            const { machine } = system.buildMachine({});
            expect(system.getMachine(machine.machineId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMachine('ghost')).toBeNull(); });
    });

    describe('listMachines', () => {
        it('should list all', () => {
            system.buildMachine({});
            system.buildMachine({});
            expect(system.listMachines().length).toBe(2);
        });

        it('should return empty list initially', () => {
            expect(system.listMachines().length).toBe(0);
        });
    });

    describe('listByEngineer', () => {
        it('should filter', () => {
            system.buildMachine({ engineerId: 'e1' });
            system.buildMachine({ engineerId: 'e2' });
            expect(system.listByEngineer('e1').length).toBe(1);
        });

        it('should return empty for unknown engineer', () => {
            system.buildMachine({ engineerId: 'e1' });
            expect(system.listByEngineer('ghost').length).toBe(0);
        });
    });

    describe('listPerfect', () => {
        it('should filter perfected machines', () => {
            const { machine: m1 } = system.buildMachine({});
            const { machine: m2 } = system.buildMachine({});
            system.perfectMachine(m1.machineId);
            expect(system.listPerfect().length).toBe(1);
            expect(system.listPerfect()[0].machineId).toBe(m1.machineId);
        });

        it('should return empty when none perfect', () => {
            system.buildMachine({});
            expect(system.listPerfect().length).toBe(0);
        });
    });

    describe('addComponent', () => {
        it('should add component', () => {
            const { machine } = system.buildMachine({});
            system.addComponent(machine.machineId, 'gear_a');
            expect(machine.components).toContain('gear_a');
        });

        it('should transition status to operational', () => {
            const { machine } = system.buildMachine({});
            system.addComponent(machine.machineId, 'spring');
            expect(machine.status).toBe('operational');
        });

        it('should reject missing', () => {
            const result = system.addComponent('ghost', 'cog');
            expect(result.error).toBe('MACHINE_NOT_FOUND');
        });

        it('should trigger componentAdded hook', () => {
            const { machine } = system.buildMachine({});
            let called = false;
            system.registerHook('componentAdded', () => { called = true; });
            system.addComponent(machine.machineId, 'core');
            expect(called).toBe(true);
        });
    });

    describe('increasePrecision', () => {
        it('should increase with custom amount', () => {
            const { machine } = system.buildMachine({});
            system.increasePrecision(machine.machineId, 15);
            expect(machine.precision).toBe(35);
        });

        it('should default to 5', () => {
            const { machine } = system.buildMachine({});
            system.increasePrecision(machine.machineId);
            expect(machine.precision).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.increasePrecision('ghost', 5);
            expect(result.error).toBe('MACHINE_NOT_FOUND');
        });

        it('should trigger precisionIncreased hook', () => {
            const { machine } = system.buildMachine({});
            let called = false;
            system.registerHook('precisionIncreased', () => { called = true; });
            system.increasePrecision(machine.machineId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMachine', () => {
        it('should level up', () => {
            const { machine } = system.buildMachine({});
            system.levelUpMachine(machine.machineId);
            expect(machine.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { machine } = system.buildMachine({});
            system.levelUpMachine(machine.machineId);
            system.levelUpMachine(machine.machineId);
            system.levelUpMachine(machine.machineId);
            expect(machine.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpMachine('ghost');
            expect(result.error).toBe('MACHINE_NOT_FOUND');
        });

        it('should trigger machineLeveledUp hook', () => {
            const { machine } = system.buildMachine({});
            let called = false;
            system.registerHook('machineLeveledUp', () => { called = true; });
            system.levelUpMachine(machine.machineId);
            expect(called).toBe(true);
        });
    });

    describe('perfectMachine', () => {
        it('should set status to perfect', () => {
            const { machine } = system.buildMachine({});
            system.perfectMachine(machine.machineId);
            expect(machine.status).toBe('perfect');
        });

        it('should reject missing', () => {
            const result = system.perfectMachine('ghost');
            expect(result.error).toBe('MACHINE_NOT_FOUND');
        });

        it('should trigger machinePerfected hook', () => {
            const { machine } = system.buildMachine({});
            let called = false;
            system.registerHook('machinePerfected', () => { called = true; });
            system.perfectMachine(machine.machineId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMachineValue', () => {
        it('should calculate value', () => {
            const { machine } = system.buildMachine({});
            system.addComponent(machine.machineId, 'a');
            system.addComponent(machine.machineId, 'b');
            // level=1 * 100 + precision=20 * 2 + components.length=2 * 30 = 100 + 40 + 60 = 200
            expect(system.calculateMachineValue(machine.machineId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMachineValue('ghost')).toBe(0);
        });

        it('should reflect leveling and precision', () => {
            const { machine } = system.buildMachine({});
            system.levelUpMachine(machine.machineId);
            system.increasePrecision(machine.machineId, 10);
            // level=2 * 100 + precision=30 * 2 + 0 = 200 + 60 = 260
            expect(system.calculateMachineValue(machine.machineId)).toBe(260);
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

        it('should execute default getMachine', () => {
            const result = system.executeTool('getMachine', { machineId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should default context to empty object', () => {
            system.registerTool('echo', (ctx) => ctx);
            const result = system.executeTool('echo');
            expect(result.result).toEqual({});
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('machineBuilt', () => count++);
            unregister();
            system.buildMachine({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('machineBuilt', () => { throw new Error('x'); });
            expect(() => system.buildMachine({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMachines = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMachines = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.buildMachine({});
            const json = system.toJSON();
            expect(json.machines.length).toBe(1);
        });
        it('should deserialize', () => {
            system.buildMachine({});
            const json = system.toJSON();
            const newSys = new CultivationMachine();
            newSys.fromJSON(json);
            expect(newSys.machines.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.machineCount).toBe(0);
        });

        it('should reflect machine count after building', () => {
            system.buildMachine({});
            system.buildMachine({});
            const stats = system.getStats();
            expect(stats.machineCount).toBe(2);
        });
    });
});
