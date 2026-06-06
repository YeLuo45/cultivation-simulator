/**
 * MountTaming.test.js - 坐骑系统测试
 * V450 Iteration 12/15 Round 16 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MountTaming } from '../../../systems/ai/MountTaming.js';

describe('MountTaming', () => {
    let system;
    beforeEach(() => { system = new MountTaming(); });

    describe('captureMount', () => {
        it('should capture', () => {
            const { mount } = system.captureMount({ riderId: 'r1', name: 'Shadowmane' });
            expect(mount.riderId).toBe('r1');
            expect(mount.name).toBe('Shadowmane');
        });

        it('should default to wild status', () => {
            const { mount } = system.captureMount({});
            expect(mount.status).toBe('wild');
        });

        it('should trigger mountCaptured hook', () => {
            let called = false;
            system.registerHook('mountCaptured', () => { called = true; });
            system.captureMount({});
            expect(called).toBe(true);
        });
    });

    describe('getMount', () => {
        it('should return', () => {
            const { mount } = system.captureMount({});
            expect(system.getMount(mount.mountId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMount('ghost')).toBeNull(); });
    });

    describe('listMounts', () => {
        it('should list all', () => {
            system.captureMount({});
            system.captureMount({});
            expect(system.listMounts().length).toBe(2);
        });
    });

    describe('listByRider', () => {
        it('should filter by rider', () => {
            system.captureMount({ riderId: 'r1' });
            system.captureMount({ riderId: 'r2' });
            expect(system.listByRider('r1').length).toBe(1);
        });
    });

    describe('listBySpecies', () => {
        it('should filter by species', () => {
            system.captureMount({ species: 'dragon' });
            system.captureMount({ species: 'horse' });
            expect(system.listBySpecies('dragon').length).toBe(1);
        });
    });

    describe('breakMount', () => {
        it('should break mount', () => {
            const { mount } = system.captureMount({ loyalty: 20 });
            system.breakMount(mount.mountId, 10);
            expect(mount.loyalty).toBe(30);
        });

        it('should change status from wild to broken', () => {
            const { mount } = system.captureMount({ status: 'wild' });
            system.breakMount(mount.mountId, 5);
            expect(mount.status).toBe('broken');
        });

        it('should cap loyalty at 100', () => {
            const { mount } = system.captureMount({ loyalty: 99 });
            system.breakMount(mount.mountId, 50);
            expect(mount.loyalty).toBe(100);
        });

        it('should reject missing', () => {
            const result = system.breakMount('ghost', 5);
            expect(result.error).toBe('MOUNT_NOT_FOUND');
        });

        it('should trigger mountBroken hook', () => {
            const { mount } = system.captureMount({});
            let called = false;
            system.registerHook('mountBroken', () => { called = true; });
            system.breakMount(mount.mountId, 5);
            expect(called).toBe(true);
        });
    });

    describe('increaseSpeed', () => {
        it('should increase speed', () => {
            const { mount } = system.captureMount({ speed: 10 });
            system.increaseSpeed(mount.mountId, 5);
            expect(mount.speed).toBe(15);
        });

        it('should reject missing', () => {
            const result = system.increaseSpeed('ghost', 5);
            expect(result.error).toBe('MOUNT_NOT_FOUND');
        });

        it('should trigger speedIncreased hook', () => {
            const { mount } = system.captureMount({});
            let called = false;
            system.registerHook('speedIncreased', () => { called = true; });
            system.increaseSpeed(mount.mountId, 2);
            expect(called).toBe(true);
        });
    });

    describe('trainMount', () => {
        it('should train mount', () => {
            const { mount } = system.captureMount({});
            system.trainMount(mount.mountId, 20);
            expect(mount.stamina).toBe(70);
        });

        it('should reject missing', () => {
            const result = system.trainMount('ghost', 10);
            expect(result.error).toBe('MOUNT_NOT_FOUND');
        });

        it('should trigger mountTrained hook', () => {
            const { mount } = system.captureMount({});
            let called = false;
            system.registerHook('mountTrained', () => { called = true; });
            system.trainMount(mount.mountId, 10);
            expect(called).toBe(true);
        });
    });

    describe('rideMount', () => {
        it('should ride mount', () => {
            const { mount } = system.captureMount({});
            system.rideMount(mount.mountId);
            expect(mount.status).toBe('ridden');
        });

        it('should reject missing', () => {
            const result = system.rideMount('ghost');
            expect(result.error).toBe('MOUNT_NOT_FOUND');
        });
    });

    describe('calculateMountSpeed', () => {
        it('should calculate', () => {
            const { mount } = system.captureMount({ speed: 10, loyalty: 50, stamina: 50 });
            // 10 * (1 + 0.5) + 5 = 15 + 5 = 20
            expect(system.calculateMountSpeed(mount.mountId)).toBeCloseTo(20, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMountSpeed('ghost')).toBe(0);
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

        it('should execute default getMount', () => {
            const result = system.executeTool('getMount', { mountId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('mountCaptured', () => count++);
            unregister();
            system.captureMount({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('mountCaptured', () => { throw new Error('x'); });
            expect(() => system.captureMount({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMounts = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMounts = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.captureMount({});
            const json = system.toJSON();
            expect(json.mounts.length).toBe(1);
        });
        it('should deserialize', () => {
            system.captureMount({});
            const json = system.toJSON();
            const newSys = new MountTaming();
            newSys.fromJSON(json);
            expect(newSys.mounts.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.mountCount).toBe(0);
        });
    });
});
