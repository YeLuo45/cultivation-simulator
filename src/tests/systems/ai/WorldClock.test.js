/**
 * WorldClock.test.js - 世界时钟仪表盘测试
 * V357 Iteration 9/9 FINAL Round 8 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WorldClock } from '../../../systems/ai/WorldClock.js';

describe('WorldClock', () => {
    let system;
    beforeEach(() => { system = new WorldClock(); });

    describe('createClock', () => {
        it('should create', () => {
            const { clock } = system.createClock({ name: 'C1' });
            expect(clock.name).toBe('C1');
        });

        it('should default to central tz', () => {
            const { clock } = system.createClock({});
            expect(clock.tzId).toBe('central');
        });

        it('should trigger clockCreated hook', () => {
            let called = false;
            system.registerHook('clockCreated', () => { called = true; });
            system.createClock({});
            expect(called).toBe(true);
        });
    });

    describe('getClock', () => {
        it('should return', () => {
            const { clock } = system.createClock({});
            expect(system.getClock(clock.clockId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getClock('ghost')).toBeNull(); });
    });

    describe('listClocks', () => {
        it('should list all', () => {
            system.createClock({});
            expect(system.listClocks().length).toBe(1);
        });
    });

    describe('listByTimezone', () => {
        it('should filter', () => {
            system.createClock({ tzId: 'central' });
            system.createClock({ tzId: 'eastern' });
            expect(system.listByTimezone('central').length).toBe(1);
        });
    });

    describe('getTimezone', () => {
        it('should return', () => { expect(system.getTimezone('central')).not.toBeNull(); });
        it('should return null for missing', () => { expect(system.getTimezone('ghost')).toBeNull(); });
    });

    describe('listTimezones', () => {
        it('should list all', () => { expect(system.listTimezones().length).toBe(3); });
    });

    describe('tick', () => {
        it('should tick', () => {
            const { clock } = system.createClock({});
            const result = system.tick(clock.clockId);
            expect(clock.currentTime).toBeGreaterThan(0);
        });

        it('should reject missing', () => {
            const result = system.tick('ghost');
            expect(result.error).toBe('CLOCK_NOT_FOUND');
        });

        it('should not tick if paused', () => {
            const { clock } = system.createClock({ paused: true });
            const before = clock.currentTime;
            system.tick(clock.clockId);
            expect(clock.currentTime).toBe(before);
        });

        it('should trigger clockTicked hook', () => {
            const { clock } = system.createClock({});
            let called = false;
            system.registerHook('clockTicked', () => { called = true; });
            system.tick(clock.clockId);
            expect(called).toBe(true);
        });
    });

    describe('pause', () => {
        it('should pause', () => {
            const { clock } = system.createClock({});
            const result = system.pause(clock.clockId);
            expect(clock.paused).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.pause('ghost');
            expect(result.error).toBe('CLOCK_NOT_FOUND');
        });
    });

    describe('resume', () => {
        it('should resume', () => {
            const { clock } = system.createClock({ paused: true });
            const result = system.resume(clock.clockId);
            expect(clock.paused).toBe(false);
        });

        it('should reject missing', () => {
            const result = system.resume('ghost');
            expect(result.error).toBe('CLOCK_NOT_FOUND');
        });
    });

    describe('syncClocks', () => {
        it('should sync', () => {
            const { clock: master } = system.createClock({ currentTime: 1000 });
            const { clock: slave } = system.createClock({});
            system.syncClocks(master.clockId, [slave.clockId]);
            expect(slave.currentTime).toBe(1000);
        });

        it('should reject missing master', () => {
            const result = system.syncClocks('ghost', []);
            expect(result.error).toBe('CLOCK_NOT_FOUND');
        });

        it('should trigger clocksSynced hook', () => {
            const { clock: master } = system.createClock({});
            let called = false;
            system.registerHook('clocksSynced', () => { called = true; });
            system.syncClocks(master.clockId, []);
            expect(called).toBe(true);
        });
    });

    describe('calculateOffset', () => {
        it('should calculate', () => {
            const { clock } = system.createClock({ tzId: 'eastern' });
            expect(system.calculateOffset(clock.clockId)).toBe(21600000);
        });

        it('should return null for missing', () => {
            expect(system.calculateOffset('ghost')).toBeNull();
        });
    });

    describe('deleteClock', () => {
        it('should delete', () => {
            const { clock } = system.createClock({});
            const result = system.deleteClock(clock.clockId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteClock('ghost');
            expect(result.error).toBe('CLOCK_NOT_FOUND');
        });

        it('should trigger clockDeleted hook', () => {
            const { clock } = system.createClock({});
            let called = false;
            system.registerHook('clockDeleted', () => { called = true; });
            system.deleteClock(clock.clockId);
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

        it('should execute default getClock', () => {
            const result = system.executeTool('getClock', { clockId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('clockCreated', () => count++);
            unregister();
            system.createClock({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('clockCreated', () => { throw new Error('x'); });
            expect(() => system.createClock({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalClocks = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalClocks = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createClock({});
            const json = system.toJSON();
            expect(json.clocks.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createClock({});
            const json = system.toJSON();
            const newSys = new WorldClock();
            newSys.fromJSON(json);
            expect(newSys.clocks.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.clockCount).toBe(0);
        });
    });
});