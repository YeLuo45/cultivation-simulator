/**
 * CultivationVehicle.test.js - 修真车测试
 * V567 Iteration 10/20 Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationVehicle } from '../../../systems/ai/CultivationVehicle.js';

describe('CultivationVehicle', () => {
    let system;
    beforeEach(() => { system = new CultivationVehicle(); });

    describe('craftVehicle', () => {
        it('should craft', () => {
            const { vehicle } = system.craftVehicle({ ownerId: 'o1', name: 'Sky Chariot' });
            expect(vehicle.ownerId).toBe('o1');
            expect(vehicle.name).toBe('Sky Chariot');
        });

        it('should default to idle status', () => {
            const { vehicle } = system.craftVehicle({});
            expect(vehicle.status).toBe('idle');
        });

        it('should default to carriage type', () => {
            const { vehicle } = system.craftVehicle({});
            expect(vehicle.type).toBe('carriage');
        });

        it('should default to base speed', () => {
            const { vehicle } = system.craftVehicle({});
            expect(vehicle.speed).toBe(20);
        });

        it('should start at level 1', () => {
            const { vehicle } = system.craftVehicle({});
            expect(vehicle.level).toBe(1);
        });

        it('should have empty parts array', () => {
            const { vehicle } = system.craftVehicle({});
            expect(vehicle.parts).toEqual([]);
        });

        it('should trigger vehicleCrafted hook', () => {
            let called = false;
            system.registerHook('vehicleCrafted', () => { called = true; });
            system.craftVehicle({});
            expect(called).toBe(true);
        });
    });

    describe('getVehicle', () => {
        it('should return', () => {
            const { vehicle } = system.craftVehicle({});
            expect(system.getVehicle(vehicle.vehicleId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getVehicle('ghost')).toBeNull(); });
    });

    describe('listVehicles', () => {
        it('should list all', () => {
            system.craftVehicle({});
            system.craftVehicle({});
            expect(system.listVehicles().length).toBe(2);
        });

        it('should return empty array when none', () => {
            expect(system.listVehicles().length).toBe(0);
        });
    });

    describe('listByOwner', () => {
        it('should filter by owner', () => {
            system.craftVehicle({ ownerId: 'o1' });
            system.craftVehicle({ ownerId: 'o2' });
            expect(system.listByOwner('o1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { vehicle: v1 } = system.craftVehicle({});
            const { vehicle: v2 } = system.craftVehicle({});
            system.legendVehicle(v1.vehicleId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.craftVehicle({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addPart', () => {
        it('should add part', () => {
            const { vehicle } = system.craftVehicle({});
            system.addPart(vehicle.vehicleId, 'engine');
            expect(vehicle.parts.length).toBe(1);
            expect(vehicle.parts[0]).toBe('engine');
        });

        it('should accumulate multiple parts', () => {
            const { vehicle } = system.craftVehicle({});
            system.addPart(vehicle.vehicleId, 'wheel');
            system.addPart(vehicle.vehicleId, 'sail');
            expect(vehicle.parts.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addPart('ghost', 'engine');
            expect(result.error).toBe('VEHICLE_NOT_FOUND');
        });

        it('should trigger partAdded hook', () => {
            const { vehicle } = system.craftVehicle({});
            let called = false;
            system.registerHook('partAdded', () => { called = true; });
            system.addPart(vehicle.vehicleId, 'sail');
            expect(called).toBe(true);
        });
    });

    describe('increaseSpeed', () => {
        it('should increase speed', () => {
            const { vehicle } = system.craftVehicle({ speed: 20 });
            system.increaseSpeed(vehicle.vehicleId, 10);
            expect(vehicle.speed).toBe(30);
        });

        it('should default amount to 5', () => {
            const { vehicle } = system.craftVehicle({ speed: 20 });
            system.increaseSpeed(vehicle.vehicleId);
            expect(vehicle.speed).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.increaseSpeed('ghost', 5);
            expect(result.error).toBe('VEHICLE_NOT_FOUND');
        });

        it('should trigger speedIncreased hook', () => {
            const { vehicle } = system.craftVehicle({});
            let called = false;
            system.registerHook('speedIncreased', () => { called = true; });
            system.increaseSpeed(vehicle.vehicleId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpVehicle', () => {
        it('should level up', () => {
            const { vehicle } = system.craftVehicle({});
            system.levelUpVehicle(vehicle.vehicleId);
            expect(vehicle.level).toBe(2);
        });

        it('should be stackable', () => {
            const { vehicle } = system.craftVehicle({});
            system.levelUpVehicle(vehicle.vehicleId);
            system.levelUpVehicle(vehicle.vehicleId);
            expect(vehicle.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpVehicle('ghost');
            expect(result.error).toBe('VEHICLE_NOT_FOUND');
        });

        it('should trigger vehicleLeveledUp hook', () => {
            const { vehicle } = system.craftVehicle({});
            let called = false;
            system.registerHook('vehicleLeveledUp', () => { called = true; });
            system.levelUpVehicle(vehicle.vehicleId);
            expect(called).toBe(true);
        });
    });

    describe('legendVehicle', () => {
        it('should legendize vehicle', () => {
            const { vehicle } = system.craftVehicle({});
            system.legendVehicle(vehicle.vehicleId);
            expect(vehicle.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendVehicle('ghost');
            expect(result.error).toBe('VEHICLE_NOT_FOUND');
        });

        it('should trigger vehicleLegendized hook', () => {
            const { vehicle } = system.craftVehicle({});
            let called = false;
            system.registerHook('vehicleLegendized', () => { called = true; });
            system.legendVehicle(vehicle.vehicleId);
            expect(called).toBe(true);
        });
    });

    describe('calculateVehicleValue', () => {
        it('should calculate default value', () => {
            const { vehicle } = system.craftVehicle({});
            // 1 * 100 + 20 * 2 + 0 * 30 = 100 + 40 + 0 = 140
            expect(system.calculateVehicleValue(vehicle.vehicleId)).toBe(140);
        });

        it('should include level and parts in calculation', () => {
            const { vehicle } = system.craftVehicle({});
            system.levelUpVehicle(vehicle.vehicleId);
            system.levelUpVehicle(vehicle.vehicleId);
            system.addPart(vehicle.vehicleId, 'engine');
            system.addPart(vehicle.vehicleId, 'sail');
            // 3 * 100 + 20 * 2 + 2 * 30 = 300 + 40 + 60 = 400
            expect(system.calculateVehicleValue(vehicle.vehicleId)).toBe(400);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateVehicleValue('ghost')).toBe(0);
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

        it('should execute default getVehicle', () => {
            const result = system.executeTool('getVehicle', { vehicleId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('vehicleCrafted', () => count++);
            unregister();
            system.craftVehicle({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('vehicleCrafted', () => { throw new Error('x'); });
            expect(() => system.craftVehicle({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalVehicles = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalVehicles = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.craftVehicle({});
            const json = system.toJSON();
            expect(json.vehicles.length).toBe(1);
        });
        it('should deserialize', () => {
            system.craftVehicle({});
            const json = system.toJSON();
            const newSys = new CultivationVehicle();
            newSys.fromJSON(json);
            expect(newSys.vehicles.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.vehicleCount).toBe(0);
        });
    });
});
