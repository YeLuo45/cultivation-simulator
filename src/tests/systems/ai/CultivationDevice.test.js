/**
 * CultivationDevice.test.js - 修真装置系统测试
 * V574 Iteration 17/20 Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDevice } from '../../../systems/ai/CultivationDevice.js';

describe('CultivationDevice', () => {
    let system;
    beforeEach(() => { system = new CultivationDevice(); });

    describe('buildDevice', () => {
        it('should build', () => {
            const { device } = system.buildDevice({ inventorId: 'i1', name: 'Qi Sensor', type: 'sensor' });
            expect(device.inventorId).toBe('i1');
            expect(device.name).toBe('Qi Sensor');
            expect(device.type).toBe('sensor');
        });

        it('should default to base sensitivity', () => {
            const { device } = system.buildDevice({});
            expect(device.sensitivity).toBe(20);
        });

        it('should set status to offline', () => {
            const { device } = system.buildDevice({});
            expect(device.status).toBe('offline');
        });

        it('should default to empty modules', () => {
            const { device } = system.buildDevice({});
            expect(device.modules).toEqual([]);
        });

        it('should default name when missing', () => {
            const { device } = system.buildDevice({});
            expect(device.name).toBe('Unnamed Device');
        });

        it('should default type to sensor', () => {
            const { device } = system.buildDevice({});
            expect(device.type).toBe('sensor');
        });

        it('should start at level 1', () => {
            const { device } = system.buildDevice({});
            expect(device.level).toBe(1);
        });

        it('should trigger deviceBuilt hook', () => {
            let called = false;
            system.registerHook('deviceBuilt', () => { called = true; });
            system.buildDevice({});
            expect(called).toBe(true);
        });
    });

    describe('getDevice', () => {
        it('should return', () => {
            const { device } = system.buildDevice({});
            expect(system.getDevice(device.deviceId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDevice('ghost')).toBeNull(); });
    });

    describe('listDevices', () => {
        it('should list all', () => {
            system.buildDevice({});
            system.buildDevice({});
            expect(system.listDevices().length).toBe(2);
        });

        it('should return empty list initially', () => {
            expect(system.listDevices().length).toBe(0);
        });
    });

    describe('listByInventor', () => {
        it('should filter', () => {
            system.buildDevice({ inventorId: 'i1' });
            system.buildDevice({ inventorId: 'i2' });
            expect(system.listByInventor('i1').length).toBe(1);
        });

        it('should return empty for unknown inventor', () => {
            system.buildDevice({ inventorId: 'i1' });
            expect(system.listByInventor('ghost').length).toBe(0);
        });
    });

    describe('listQuantum', () => {
        it('should filter quantum devices', () => {
            const { device: d1 } = system.buildDevice({});
            const { device: d2 } = system.buildDevice({});
            system.quantumDevice(d1.deviceId);
            expect(system.listQuantum().length).toBe(1);
        });

        it('should return empty when none quantum', () => {
            system.buildDevice({});
            expect(system.listQuantum().length).toBe(0);
        });
    });

    describe('addModule', () => {
        it('should add module', () => {
            const { device } = system.buildDevice({});
            system.addModule(device.deviceId, 'qps_chip');
            expect(device.modules).toContain('qps_chip');
        });

        it('should add multiple modules', () => {
            const { device } = system.buildDevice({});
            system.addModule(device.deviceId, 'a');
            system.addModule(device.deviceId, 'b');
            expect(device.modules.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addModule('ghost', 'chip');
            expect(result.error).toBe('DEVICE_NOT_FOUND');
        });

        it('should trigger moduleAdded hook', () => {
            const { device } = system.buildDevice({});
            let called = false;
            system.registerHook('moduleAdded', () => { called = true; });
            system.addModule(device.deviceId, 'arm');
            expect(called).toBe(true);
        });
    });

    describe('increaseSensitivity', () => {
        it('should increase with custom amount', () => {
            const { device } = system.buildDevice({});
            system.increaseSensitivity(device.deviceId, 20);
            expect(device.sensitivity).toBe(40);
        });

        it('should default to 5', () => {
            const { device } = system.buildDevice({});
            system.increaseSensitivity(device.deviceId);
            expect(device.sensitivity).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.increaseSensitivity('ghost', 5);
            expect(result.error).toBe('DEVICE_NOT_FOUND');
        });

        it('should trigger sensitivityIncreased hook', () => {
            const { device } = system.buildDevice({});
            let called = false;
            system.registerHook('sensitivityIncreased', () => { called = true; });
            system.increaseSensitivity(device.deviceId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDevice', () => {
        it('should level up', () => {
            const { device } = system.buildDevice({});
            system.levelUpDevice(device.deviceId);
            expect(device.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { device } = system.buildDevice({});
            system.levelUpDevice(device.deviceId);
            system.levelUpDevice(device.deviceId);
            system.levelUpDevice(device.deviceId);
            expect(device.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpDevice('ghost');
            expect(result.error).toBe('DEVICE_NOT_FOUND');
        });

        it('should trigger deviceLeveledUp hook', () => {
            const { device } = system.buildDevice({});
            let called = false;
            system.registerHook('deviceLeveledUp', () => { called = true; });
            system.levelUpDevice(device.deviceId);
            expect(called).toBe(true);
        });
    });

    describe('quantumDevice', () => {
        it('should set status to quantum', () => {
            const { device } = system.buildDevice({});
            system.quantumDevice(device.deviceId);
            expect(device.status).toBe('quantum');
        });

        it('should reject missing', () => {
            const result = system.quantumDevice('ghost');
            expect(result.error).toBe('DEVICE_NOT_FOUND');
        });

        it('should trigger deviceQuantized hook', () => {
            const { device } = system.buildDevice({});
            let called = false;
            system.registerHook('deviceQuantized', () => { called = true; });
            system.quantumDevice(device.deviceId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDeviceValue', () => {
        it('should calculate with level, sensitivity and modules', () => {
            const { device } = system.buildDevice({});
            system.levelUpDevice(device.deviceId);
            system.increaseSensitivity(device.deviceId, 10);
            system.addModule(device.deviceId, 'a');
            system.addModule(device.deviceId, 'b');
            // level=2, sensitivity=30, modules=2 -> 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateDeviceValue(device.deviceId)).toBeCloseTo(320, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDeviceValue('ghost')).toBe(0);
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

        it('should execute default getDevice', () => {
            const result = system.executeTool('getDevice', { deviceId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default buildDevice', () => {
            const result = system.executeTool('buildDevice', { inventorId: 'i1', name: 'Test', type: 'sensor' });
            expect(result.success).toBe(true);
            expect(result.result.device.inventorId).toBe('i1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('deviceBuilt', () => count++);
            unregister();
            system.buildDevice({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('deviceBuilt', () => { throw new Error('x'); });
            expect(() => system.buildDevice({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDevices = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDevices = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.buildDevice({});
            const json = system.toJSON();
            expect(json.devices.length).toBe(1);
        });
        it('should deserialize', () => {
            system.buildDevice({});
            const json = system.toJSON();
            const newSys = new CultivationDevice();
            newSys.fromJSON(json);
            expect(newSys.devices.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.deviceCount).toBe(0);
        });

        it('should reflect built devices', () => {
            system.buildDevice({});
            const stats = system.getStats();
            expect(stats.deviceCount).toBe(1);
            expect(stats.totalDevices).toBe(1);
        });
    });
});
