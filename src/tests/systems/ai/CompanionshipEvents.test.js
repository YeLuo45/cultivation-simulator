/**
 * CompanionshipEvents.test.js - 羁绊事件系统测试
 * V307 Iteration 4/9 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CompanionshipEvents } from '../../../systems/ai/CompanionshipEvents.js';

describe('CompanionshipEvents', () => {
    let system;

    beforeEach(() => {
        system = new CompanionshipEvents();
    });

    describe('Default Event Types', () => {
        it('should have default event types', () => {
            expect(system.eventTypes.size).toBeGreaterThan(0);
        });

        it('should contain first_meeting', () => {
            expect(system.getEventType('first_meeting')).not.toBeNull();
        });
    });

    describe('registerEventType', () => {
        it('should register custom event type', () => {
            const { type } = system.registerEventType({ name: 'Custom' });
            expect(type.name).toBe('Custom');
        });
    });

    describe('getEventType', () => {
        it('should return type', () => {
            expect(system.getEventType('first_meeting')).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getEventType('ghost')).toBeNull();
        });
    });

    describe('triggerEvent', () => {
        it('should trigger event', () => {
            const result = system.triggerEvent('first_meeting', 'c1');
            expect(result.success).toBe(true);
        });

        it('should reject missing type', () => {
            const result = system.triggerEvent('ghost', 'c1');
            expect(result.error).toBe('EVENT_TYPE_NOT_FOUND');
        });

        it('should reject too many', () => {
            system.config.maxActiveEvents = 1;
            system.triggerEvent('first_meeting', 'c1');
            const result = system.triggerEvent('first_meeting', 'c2');
            expect(result.error).toBe('TOO_MANY_EVENTS');
        });

        it('should trigger eventTriggered hook', () => {
            let called = false;
            system.registerHook('eventTriggered', () => { called = true; });
            system.triggerEvent('first_meeting', 'c1');
            expect(called).toBe(true);
        });

        it('should increment totalTriggered', () => {
            system.triggerEvent('first_meeting', 'c1');
            expect(system.stats.totalTriggered).toBe(1);
        });
    });

    describe('getEvent', () => {
        it('should return event', () => {
            const { event } = system.triggerEvent('first_meeting', 'c1');
            expect(system.getEvent(event.eventId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getEvent('ghost')).toBeNull();
        });
    });

    describe('listAvailable', () => {
        it('should list by min bond', () => {
            const low = system.listAvailable(0);
            const high = system.listAvailable(100);
            expect(high.length).toBeGreaterThan(low.length);
        });
    });

    describe('listActiveEvents', () => {
        it('should list active', () => {
            system.triggerEvent('first_meeting', 'c1');
            expect(system.listActiveEvents().length).toBe(1);
        });
    });

    describe('participate', () => {
        it('should add participant', () => {
            const { event } = system.triggerEvent('first_meeting', 'c1');
            const result = system.participate(event.eventId, 'p1');
            expect(result.success).toBe(true);
            expect(event.participants.length).toBe(1);
        });

        it('should reject missing event', () => {
            const result = system.participate('ghost', 'p1');
            expect(result.error).toBe('EVENT_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { event } = system.triggerEvent('first_meeting', 'c1');
            event.status = 'completed';
            const result = system.participate(event.eventId, 'p1');
            expect(result.error).toBe('EVENT_INACTIVE');
        });

        it('should not duplicate participants', () => {
            const { event } = system.triggerEvent('first_meeting', 'c1');
            system.participate(event.eventId, 'p1');
            system.participate(event.eventId, 'p1');
            expect(event.participants.length).toBe(1);
        });

        it('should track participations', () => {
            const { event } = system.triggerEvent('first_meeting', 'c1');
            system.participate(event.eventId, 'p1');
            expect(system.participations.get('p1').length).toBe(1);
        });

        it('should trigger participantJoined hook', () => {
            const { event } = system.triggerEvent('first_meeting', 'c1');
            let called = false;
            system.registerHook('participantJoined', () => { called = true; });
            system.participate(event.eventId, 'p1');
            expect(called).toBe(true);
        });
    });

    describe('completeEvent', () => {
        it('should complete', () => {
            const { event } = system.triggerEvent('first_meeting', 'c1');
            const result = system.completeEvent(event.eventId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.completeEvent('ghost');
            expect(result.error).toBe('EVENT_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { event } = system.triggerEvent('first_meeting', 'c1');
            event.status = 'completed';
            const result = system.completeEvent(event.eventId);
            expect(result.error).toBe('EVENT_INACTIVE');
        });

        it('should add to log', () => {
            const { event } = system.triggerEvent('first_meeting', 'c1');
            system.completeEvent(event.eventId);
            expect(system.eventLog.length).toBe(1);
        });

        it('should increment totalCompleted', () => {
            const { event } = system.triggerEvent('first_meeting', 'c1');
            system.completeEvent(event.eventId);
            expect(system.stats.totalCompleted).toBe(1);
        });

        it('should trigger eventCompleted hook', () => {
            const { event } = system.triggerEvent('first_meeting', 'c1');
            let called = false;
            system.registerHook('eventCompleted', () => { called = true; });
            system.completeEvent(event.eventId);
            expect(called).toBe(true);
        });
    });

    describe('failEvent', () => {
        it('should fail', () => {
            const { event } = system.triggerEvent('first_meeting', 'c1');
            const result = system.failEvent(event.eventId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.failEvent('ghost');
            expect(result.error).toBe('EVENT_NOT_FOUND');
        });

        it('should trigger eventFailed hook', () => {
            const { event } = system.triggerEvent('first_meeting', 'c1');
            let called = false;
            system.registerHook('eventFailed', () => { called = true; });
            system.failEvent(event.eventId);
            expect(called).toBe(true);
        });
    });

    describe('Mesh Network', () => {
        it('should add node', () => {
            const result = system.addMeshNode('n1');
            expect(result.success).toBe(true);
        });

        it('should connect nodes', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            const result = system.connectMeshNodes('a', 'b');
            expect(result.success).toBe(true);
        });

        it('should reject missing nodes', () => {
            const result = system.connectMeshNodes('ghost', 'ghost2');
            expect(result.error).toBe('NODE_NOT_FOUND');
        });

        it('should broadcast event', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            system.connectMeshNodes('a', 'b');
            const { event } = system.triggerEvent('first_meeting', 'c1');
            const result = system.broadcastEvent(event.eventId, 'a');
            expect(result.propagated).toBe(2);
        });

        it('should reject missing source', () => {
            const result = system.broadcastEvent('any', 'ghost');
            expect(result.error).toBe('NODE_NOT_FOUND');
        });

        it('should reject missing event', () => {
            system.addMeshNode('n1');
            const result = system.broadcastEvent('ghost', 'n1');
            expect(result.error).toBe('EVENT_NOT_FOUND');
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

        it('should execute default triggerEvent', () => {
            const result = system.executeTool('triggerEvent', { typeId: 'first_meeting', companionshipId: 'c1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('eventTriggered', () => count++);
            unregister();
            system.triggerEvent('first_meeting', 'c1');
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('eventTriggered', () => { throw new Error('x'); });
            expect(() => system.triggerEvent('first_meeting', 'c1')).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalCompleted = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalCompleted = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.triggerEvent('first_meeting', 'c1');
            const json = system.toJSON();
            expect(json.activeEvents.length).toBe(1);
        });

        it('should deserialize', () => {
            system.triggerEvent('first_meeting', 'c1');
            const json = system.toJSON();
            const newSys = new CompanionshipEvents();
            newSys.fromJSON(json);
            expect(newSys.activeEvents.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.eventTypeCount).toBeGreaterThan(0);
        });
    });
});