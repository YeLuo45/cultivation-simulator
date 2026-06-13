/**
 * WorldEventCore.test.js - 天地异变核心测试
 * V385 Iteration 1/9 Round 12 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WorldEventCore } from '../../../systems/ai/WorldEventCore.js';

describe('WorldEventCore', () => {
    let system;
    beforeEach(() => { system = new WorldEventCore(); });

    describe('createEvent', () => {
        it('should create', () => {
            const { event } = system.createEvent({ name: 'E1' });
            expect(event.name).toBe('E1');
        });

        it('should trigger eventCreated hook', () => {
            let called = false;
            system.registerHook('eventCreated', () => { called = true; });
            system.createEvent({});
            expect(called).toBe(true);
        });
    });

    describe('getEvent', () => {
        it('should return', () => {
            const { event } = system.createEvent({});
            expect(system.getEvent(event.eventId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getEvent('ghost')).toBeNull(); });
    });

    describe('listEvents', () => {
        it('should list all', () => {
            system.createEvent({});
            expect(system.listEvents().length).toBe(1);
        });
    });

    describe('listActive', () => {
        it('should filter', () => {
            const { event } = system.createEvent({});
            event.status = 'resolved';
            system.createEvent({});
            expect(system.listActive().length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.createEvent({ type: 'tribulation' });
            system.createEvent({ type: 'calamity' });
            expect(system.listByType('tribulation').length).toBe(1);
        });
    });

    describe('listByRegion', () => {
        it('should filter', () => {
            system.createEvent({ affectedRegion: 'east' });
            system.createEvent({ affectedRegion: 'west' });
            expect(system.listByRegion('east').length).toBe(1);
        });
    });

    describe('listBySeverity', () => {
        it('should filter', () => {
            system.createEvent({ severity: 1 });
            system.createEvent({ severity: 5 });
            expect(system.listBySeverity(3).length).toBe(1);
        });
    });

    describe('escalateEvent', () => {
        it('should escalate', () => {
            const { event } = system.createEvent({});
            system.escalateEvent(event.eventId, 1);
            expect(event.severity).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.escalateEvent('ghost');
            expect(result.error).toBe('EVENT_NOT_FOUND');
        });

        it('should trigger eventEscalated hook', () => {
            const { event } = system.createEvent({});
            let called = false;
            system.registerHook('eventEscalated', () => { called = true; });
            system.escalateEvent(event.eventId);
            expect(called).toBe(true);
        });
    });

    describe('resolveEvent', () => {
        it('should resolve', () => {
            const { event } = system.createEvent({});
            system.resolveEvent(event.eventId);
            expect(event.status).toBe('resolved');
        });

        it('should reject missing', () => {
            const result = system.resolveEvent('ghost');
            expect(result.error).toBe('EVENT_NOT_FOUND');
        });

        it('should trigger eventResolved hook', () => {
            const { event } = system.createEvent({});
            let called = false;
            system.registerHook('eventResolved', () => { called = true; });
            system.resolveEvent(event.eventId);
            expect(called).toBe(true);
        });
    });

    describe('cancelEvent', () => {
        it('should cancel', () => {
            const { event } = system.createEvent({});
            system.cancelEvent(event.eventId);
            expect(event.status).toBe('cancelled');
        });

        it('should reject missing', () => {
            const result = system.cancelEvent('ghost');
            expect(result.error).toBe('EVENT_NOT_FOUND');
        });

        it('should trigger eventCancelled hook', () => {
            const { event } = system.createEvent({});
            let called = false;
            system.registerHook('eventCancelled', () => { called = true; });
            system.cancelEvent(event.eventId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTotalSeverity', () => {
        it('should calculate', () => {
            system.createEvent({ severity: 2 });
            system.createEvent({ severity: 3 });
            expect(system.calculateTotalSeverity()).toBe(5);
        });
    });

    describe('findCriticalEvents', () => {
        it('should find', () => {
            system.createEvent({ severity: 1 });
            system.createEvent({ severity: 10 });
            expect(system.findCriticalEvents().length).toBe(1);
        });
    });

    describe('countByStatus', () => {
        it('should count', () => {
            system.createEvent({});
            system.createEvent({});
            expect(system.countByStatus('active')).toBe(2);
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

        it('should execute default getEvent', () => {
            const result = system.executeTool('getEvent', { eventId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('eventCreated', () => count++);
            unregister();
            system.createEvent({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('eventCreated', () => { throw new Error('x'); });
            expect(() => system.createEvent({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalEvents = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalEvents = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createEvent({});
            const json = system.toJSON();
            expect(json.events.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createEvent({});
            const json = system.toJSON();
            const newSys = new WorldEventCore();
            newSys.fromJSON(json);
            expect(newSys.events.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.eventCount).toBe(0);
        });
    });
});