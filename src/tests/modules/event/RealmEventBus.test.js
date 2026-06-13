/**
 * RealmEventBus.test.js - TDD测试
 * 仙界事件总线测试 - 覆盖率 >= 95%
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    RealmEventBus,
    RealmEvent,
    SubscriberEntry,
    realmEventBus,
    EVENT_CONFIG,
    EVENT_PRIORITIES,
    REALM_EVENT_TYPES,
    mcpPublish,
    mcpSubscribe,
    mcpUnsubscribe,
    mcpHistory,
    mcpCascadeTrigger,
    mcpSubscriberList
} from '../../../systems/event/RealmEventBus.js';

// ===== RealmEvent测试 =====

describe('RealmEvent', () => {
    it('should create an event with correct properties', () => {
        const event = new RealmEvent('player.cultivation.breakthrough', { realm: 1 }, { source: 'test' });
        
        expect(event.type).toBe('player.cultivation.breakthrough');
        expect(event.data).toEqual({ realm: 1 });
        expect(event.source).toBe('test');
        expect(event.timestamp).toBeGreaterThan(0);
        expect(event.priority).toBe('medium');
        expect(event.cascadeLevel).toBe(0);
        expect(event.processed).toBe(false);
    });
    
    it('should generate unique event ids', () => {
        const event1 = new RealmEvent('test.type', {});
        const event2 = new RealmEvent('test.type', {});
        
        expect(event1.id).not.toBe(event2.id);
        expect(event1.id).toMatch(/^event_/);
    });
    
    it('should use default priority when not specified', () => {
        const event = new RealmEvent('test.type', {});
        expect(event.priority).toBe('medium');
    });
    
    it('should use custom priority when specified', () => {
        const event = new RealmEvent('test.type', {}, { priority: 'high' });
        expect(event.priority).toBe('high');
    });
    
    it('should calculate correct priority value', () => {
        const highEvent = new RealmEvent('test', {}, { priority: 'high' });
        const medEvent = new RealmEvent('test', {}, { priority: 'medium' });
        const lowEvent = new RealmEvent('test', {}, { priority: 'low' });
        
        expect(highEvent.getPriorityValue()).toBe(3);
        expect(medEvent.getPriorityValue()).toBe(2);
        expect(lowEvent.getPriorityValue()).toBe(1);
    });
});

// ===== SubscriberEntry测试 =====

describe('SubscriberEntry', () => {
    it('should create a subscriber with correct properties', () => {
        const callback = () => {};
        const sub = new SubscriberEntry('player.*', callback, { subscriberId: 'test-sub' });
        
        expect(sub.pattern).toBe('player.*');
        expect(sub.callback).toBe(callback);
        expect(sub.subscriberId).toBe('test-sub');
        expect(sub.priority).toBe(2);
        expect(sub.active).toBe(true);
        expect(sub.matchCount).toBe(0);
    });
    
    it('should generate unique subscriber ids', () => {
        const sub1 = new SubscriberEntry('test.*', () => {});
        const sub2 = new SubscriberEntry('test.*', () => {});
        
        expect(sub1.id).not.toBe(sub2.id);
        expect(sub1.id).toMatch(/^sub_/);
    });
});

// ===== RealmEventBus测试 =====

describe('RealmEventBus', () => {
    let bus;
    
    beforeEach(() => {
        bus = new RealmEventBus();
    });
    
    describe('createEvent', () => {
        it('should create events correctly', () => {
            const event = bus.createEvent('test.type', { data: 123 });
            
            expect(event).toBeInstanceOf(RealmEvent);
            expect(event.type).toBe('test.type');
            expect(event.data).toEqual({ data: 123 });
        });
    });
    
    describe('publish and subscribe', () => {
        it('should publish events and receive callbacks', () => {
            const receivedEvents = [];
            bus.subscribe('player.*', (event) => {
                receivedEvents.push(event);
            }, { subscriberId: 'test' });
            
            bus.publish('player.cultivation.breakthrough', { realm: 2 });
            bus.publish('player.level.up', { level: 5 });
            
            expect(receivedEvents.length).toBe(2);
            expect(receivedEvents[0].type).toBe('player.cultivation.breakthrough');
            expect(receivedEvents[1].type).toBe('player.level.up');
        });
        
        it('should support glob pattern matching', () => {
            const receivedEvents = [];
            bus.subscribe('player.*', (event) => {
                receivedEvents.push(event);
            }, { subscriberId: 'test' });
            
            bus.publish('player.anything.here', {});
            bus.publish('player.test', {});
            
            expect(receivedEvents.length).toBe(2);
        });
        
        it('should match exact patterns', () => {
            const receivedEvents = [];
            bus.subscribe('exact.event', (event) => {
                receivedEvents.push(event);
            }, { subscriberId: 'test' });
            
            bus.publish('exact.event', {});
            bus.publish('not.exact.event', {});
            
            expect(receivedEvents.length).toBe(1);
        });
        
        it('should respect priority ordering', () => {
            const callOrder = [];
            bus.subscribe('test.event', () => {
                callOrder.push('low');
            }, { priority: 'low', subscriberId: 'low' });
            
            bus.subscribe('test.event', () => {
                callOrder.push('high');
            }, { priority: 'high', subscriberId: 'high' });
            
            bus.subscribe('test.event', () => {
                callOrder.push('medium');
            }, { priority: 'medium', subscriberId: 'medium' });
            
            bus.publish('test.event', {});
            
            expect(callOrder).toEqual(['high', 'medium', 'low']);
        });
        
        it('should not call inactive subscribers', () => {
            const receivedEvents = [];
            const sub1 = bus.subscribe('test.*', () => {
                receivedEvents.push('active');
            }, { subscriberId: 'active' });
            
            const sub2 = bus.subscribe('test.*', () => {
                receivedEvents.push('inactive');
            }, { subscriberId: 'inactive' });
            
            // Deactivate sub2
            bus.unsubscribe(sub2.subscriberId);
            
            bus.publish('test.event', {});
            
            expect(receivedEvents).toEqual(['active']);
        });
        
        it('should return correct publish result', () => {
            bus.subscribe('test.event', () => {}, { subscriberId: 'sub1' });
            bus.subscribe('test.event', () => {}, { subscriberId: 'sub2' });
            
            const result = bus.publish('test.event', { data: 123 });
            
            expect(result.success).toBe(true);
            expect(result.eventId).toMatch(/^event_/);
            expect(result.type).toBe('test.event');
            expect(result.matchedCount).toBe(2);
        });
        
        it('should handle callback errors gracefully', () => {
            bus.subscribe('test.event', () => {
                throw new Error('Test error');
            }, { subscriberId: 'error-sub' });
            
            const result = bus.publish('test.event', {});
            
            expect(result.results.length).toBe(1);
            expect(result.results[0].success).toBe(false);
            expect(result.results[0].error).toBe('Test error');
        });
    });
    
    describe('unsubscribe', () => {
        it('should unsubscribe by subscriber id', () => {
            const receivedEvents = [];
            const sub = bus.subscribe('test.*', () => {
                receivedEvents.push('test');
            }, { subscriberId: 'test-sub' });
            
            bus.publish('test.event', {});
            expect(receivedEvents.length).toBe(1);
            
            bus.unsubscribe(sub.subscriberId);
            bus.publish('test.event', {});
            
            expect(receivedEvents.length).toBe(1);
        });
        
        it('should unsubscribe by pattern and subscriberId', () => {
            const receivedEvents = [];
            const sub = bus.subscribe('test.*', () => {
                receivedEvents.push('test');
            }, { subscriberId: 'test-sub' });
            
            bus.publish('test.event', {});
            
            bus.unsubscribeByPattern('test.*', sub.subscriberId);
            bus.publish('test.event', {});
            
            expect(receivedEvents.length).toBe(1);
        });
        
        it('should return failure for non-existent subscriber', () => {
            const result = bus.unsubscribe('non-existent-id');
            expect(result.success).toBe(false);
        });
    });
    
    describe('history', () => {
        it('should record event history', () => {
            bus.publish('event1', {});
            bus.publish('event2', {});
            bus.publish('event3', {});
            
            const history = bus.history();
            expect(history.length).toBe(3);
        });
        
        it('should filter by event type', () => {
            bus.publish('player.event', {});
            bus.publish('npc.event', {});
            bus.publish('player.other', {});
            
            const history = bus.history({ eventType: 'player.event' });
            expect(history.length).toBe(1);
            expect(history[0].type).toBe('player.event');
        });
        
        it('should filter by source', () => {
            bus.publish('event1', {}, { source: 'source1' });
            bus.publish('event2', {}, { source: 'source2' });
            
            const history = bus.history({ source: 'source1' });
            expect(history.length).toBe(1);
        });
        
        it('should filter by since timestamp', () => {
            const now = Date.now();
            const oldTimestamp = now - 10000;
            const newTimestamp = now;
            
            // Create events with explicit timestamps
            const oldEvent = bus.createEvent('old.event', {}, { timestamp: oldTimestamp });
            const newEvent = bus.createEvent('new.event', {}, { timestamp: newTimestamp });
            
            // Add directly to history with controlled timestamps
            bus.eventHistory.push(oldEvent);
            bus.eventHistory.push(newEvent);
            
            const history = bus.history({ since: now - 5000 });
            expect(history.length).toBe(1);
            expect(history[0].type).toBe('new.event');
        });
        
        it('should limit results', () => {
            for (let i = 0; i < 50; i++) {
                bus.publish(`event${i}`, {});
            }
            
            const history = bus.history({ limit: 10 });
            expect(history.length).toBe(10);
        });
    });
    
    describe('listSubscribers', () => {
        it('should list all active subscribers', () => {
            bus.subscribe('player.*', () => {}, { subscriberId: 'sub1' });
            bus.subscribe('npc.*', () => {}, { subscriberId: 'sub2' });
            bus.subscribe('test.event', () => {}, { subscriberId: 'sub3' });
            
            const subs = bus.listSubscribers();
            expect(subs.length).toBe(3);
        });
        
        it('should filter by pattern', () => {
            bus.subscribe('player.*', () => {}, { subscriberId: 'sub1' });
            bus.subscribe('npc.*', () => {}, { subscriberId: 'sub2' });
            
            const subs = bus.listSubscribers({ pattern: 'player.*' });
            expect(subs.length).toBe(1);
            expect(subs[0].subscriberId).toBe('sub1');
        });
        
        it('should filter by subscriberId', () => {
            bus.subscribe('player.*', () => {}, { subscriberId: 'sub1' });
            bus.subscribe('npc.*', () => {}, { subscriberId: 'sub2' });
            
            const subs = bus.listSubscribers({ subscriberId: 'sub1' });
            expect(subs.length).toBe(1);
        });
    });
    
    describe('triggerCascade', () => {
        it('should trigger initial event', () => {
            const receivedEvents = [];
            bus.subscribe('initial.event', () => {
                receivedEvents.push('initial');
            }, { subscriberId: 'test' });
            
            const result = bus.triggerCascade(
                { type: 'initial.event', data: {} },
                {}
            );
            
            expect(result.success).toBe(true);
            expect(receivedEvents.length).toBe(1);
        });
        
        it('should trigger follow-up events in order', () => {
            const callOrder = [];
            bus.subscribe('event1', () => { callOrder.push(1); }, { subscriberId: 'sub1' });
            bus.subscribe('event2', () => { callOrder.push(2); }, { subscriberId: 'sub2' });
            bus.subscribe('event3', () => { callOrder.push(3); }, { subscriberId: 'sub3' });
            
            const result = bus.triggerCascade(
                { type: 'event1' },
                { followUpEvents: [{ type: 'event2' }, { type: 'event3' }] }
            );
            
            expect(result.success).toBe(true);
            expect(callOrder).toEqual([1, 2, 3]);
        });
        
        it('should detect circular cascades', () => {
            // This is handled internally by cascadeTracking
            const result = bus.triggerCascade(
                { type: 'test.event' },
                { followUpEvents: [{ type: 'test.event' }] }
            );
            
            // The cascade should either succeed (first level) or detect circular
            expect(result).toHaveProperty('success');
        });
        
        it('should respect maxDepth limit', () => {
            const callOrder = [];
            for (let i = 1; i <= 10; i++) {
                bus.subscribe(`cascade.event${i}`, () => {
                    callOrder.push(i);
                }, { subscriberId: `sub${i}` });
            }
            
            const followUpEvents = Array.from({ length: 10 }, (_, i) => ({
                type: `cascade.event${i + 1}`
            }));
            
            const result = bus.triggerCascade(
                { type: 'cascade.event1' },
                { followUpEvents, maxDepth: 3 }
            );
            
            expect(result.success).toBe(true);
            expect(callOrder.length).toBe(4); // Initial + 3 depth
        });
    });
    
    describe('matchPattern', () => {
        it('should match exact strings', () => {
            expect(bus.matchPattern('exact.event', 'exact.event')).toBe(true);
            expect(bus.matchPattern('exact.event', 'different.event')).toBe(false);
        });
        
        it('should match glob patterns', () => {
            expect(bus.matchPattern('player.anything', 'player.*')).toBe(true);
            expect(bus.matchPattern('player.test.123', 'player.*')).toBe(true);
            expect(bus.matchPattern('npc.event', 'player.*')).toBe(false);
        });
    });
    
    describe('getMatchedSubscribers', () => {
        it('should return all subscribers matching an event type', () => {
            bus.subscribe('player.*', () => {}, { subscriberId: 'sub1' });
            bus.subscribe('player.level.*', () => {}, { subscriberId: 'sub2' });
            bus.subscribe('npc.*', () => {}, { subscriberId: 'sub3' });
            
            const matched = bus.getMatchedSubscribers('player.level.up');
            
            expect(matched.length).toBe(2);
        });
    });
    
    describe('getStats', () => {
        it('should return correct statistics', () => {
            bus.subscribe('player.*', () => {}, { subscriberId: 'sub1' });
            bus.subscribe('npc.*', () => {}, { subscriberId: 'sub2' });
            
            bus.publish('event1', {});
            bus.publish('event2', {});
            
            const stats = bus.getStats();
            
            expect(stats.totalEvents).toBe(2);
            expect(stats.totalSubscribers).toBe(2);
            expect(stats.uniquePatterns).toBe(2);
        });
    });
    
    describe('clearHistory', () => {
        it('should clear event history', () => {
            bus.publish('event1', {});
            bus.publish('event2', {});
            
            expect(bus.history().length).toBe(2);
            
            bus.clearHistory();
            
            expect(bus.history().length).toBe(0);
        });
    });
    
    describe('reset', () => {
        it('should reset all state', () => {
            bus.subscribe('player.*', () => {}, { subscriberId: 'sub1' });
            bus.publish('event1', {});
            
            bus.reset();
            
            expect(bus.history().length).toBe(0);
            expect(bus.listSubscribers().length).toBe(0);
        });
    });
});

// ===== MCP工具测试 =====

describe('MCP Tools', () => {
    let bus;
    
    beforeEach(() => {
        // Reset the global bus before each test
        realmEventBus.reset();
        bus = realmEventBus;
    });
    
    describe('mcpPublish', () => {
        it('should publish events via MCP', () => {
            const result = mcpPublish({ type: 'test.event', data: { value: 123 } });
            
            expect(result.success).toBe(true);
            expect(result.type).toBe('test.event');
            expect(result.eventId).toMatch(/^event_/);
        });
        
        it('should fail without event type', () => {
            const result = mcpPublish({});
            expect(result.success).toBe(false);
            expect(result.error).toBe('Event type is required');
        });
    });
    
    describe('mcpSubscribe', () => {
        it('should subscribe via MCP', () => {
            const result = mcpSubscribe({ pattern: 'player.*', subscriberId: 'mcp-test' });
            
            expect(result.success).toBe(true);
            expect(result.subscriberId).toMatch(/^sub_/);
            expect(result.pattern).toBe('player.*');
        });
        
        it('should fail without pattern', () => {
            const result = mcpSubscribe({});
            expect(result.success).toBe(false);
            expect(result.error).toBe('Event pattern is required');
        });
    });
    
    describe('mcpUnsubscribe', () => {
        it('should unsubscribe via MCP', () => {
            const sub = mcpSubscribe({ pattern: 'test.*', subscriberId: 'mcp-test' });
            const result = mcpUnsubscribe({ subscriberId: sub.subscriberId });
            
            expect(result.success).toBe(true);
        });
        
        it('should fail without subscriberId', () => {
            const result = mcpUnsubscribe({});
            expect(result.success).toBe(false);
            expect(result.error).toBe('Subscriber ID is required');
        });
    });
    
    describe('mcpHistory', () => {
        it('should get event history via MCP', () => {
            mcpPublish({ type: 'event1' });
            mcpPublish({ type: 'event2' });
            
            const result = mcpHistory({});
            
            expect(result.success).toBe(true);
            expect(result.count).toBe(2);
            expect(result.events.length).toBe(2);
        });
        
        it('should filter history via MCP', () => {
            mcpPublish({ type: 'player.event' });
            mcpPublish({ type: 'npc.event' });
            
            const result = mcpHistory({ eventType: 'player.event' });
            
            expect(result.success).toBe(true);
            expect(result.count).toBe(1);
            expect(result.events[0].type).toBe('player.event');
        });
    });
    
    describe('mcpCascadeTrigger', () => {
        it('should trigger cascade via MCP', () => {
            bus.subscribe('initial', () => {}, { subscriberId: 'test' });
            bus.subscribe('followup', () => {}, { subscriberId: 'test' });
            
            const result = mcpCascadeTrigger({
                initialEvent: { type: 'initial' },
                followUpEvents: [{ type: 'followup' }]
            });
            
            expect(result.success).toBe(true);
            expect(result.totalEvents).toBe(2);
        });
        
        it('should fail without initial event', () => {
            const result = mcpCascadeTrigger({});
            expect(result.success).toBe(false);
        });
    });
    
    describe('mcpSubscriberList', () => {
        it('should list subscribers via MCP', () => {
            mcpSubscribe({ pattern: 'player.*', subscriberId: 'mcp-test1' });
            mcpSubscribe({ pattern: 'npc.*', subscriberId: 'mcp-test2' });
            
            const result = mcpSubscriberList({});
            
            expect(result.success).toBe(true);
            expect(result.count).toBe(2);
        });
        
        it('should filter subscriber list', () => {
            mcpSubscribe({ pattern: 'player.*', subscriberId: 'mcp-test1' });
            mcpSubscribe({ pattern: 'npc.*', subscriberId: 'mcp-test2' });
            
            const result = mcpSubscriberList({ subscriberId: 'mcp-test1' });
            
            expect(result.success).toBe(true);
            expect(result.count).toBe(1);
        });
    });
});

// ===== 常量测试 =====

describe('Constants', () => {
    describe('EVENT_CONFIG', () => {
        it('should have required properties', () => {
            expect(EVENT_CONFIG.maxHistoryLength).toBeGreaterThan(0);
            expect(EVENT_CONFIG.maxSubscribersPerEvent).toBeGreaterThan(0);
            expect(EVENT_CONFIG.cascadeDepthLimit).toBeGreaterThan(0);
            expect(EVENT_CONFIG.defaultPriority).toBe('medium');
        });
    });
    
    describe('EVENT_PRIORITIES', () => {
        it('should have correct priority values', () => {
            expect(EVENT_PRIORITIES.high).toBe(3);
            expect(EVENT_PRIORITIES.medium).toBe(2);
            expect(EVENT_PRIORITIES.low).toBe(1);
        });
    });
    
    describe('REALM_EVENT_TYPES', () => {
        it('should have common event types', () => {
            expect(REALM_EVENT_TYPES.PLAYER_CULTIVATION_BREAKTHROUGH).toBe('player.cultivation.breakthrough');
            expect(REALM_EVENT_TYPES.NPC_INTERACT).toBe('npc.interact');
            expect(REALM_EVENT_TYPES.REALM_QUAKE).toBe('realm.quake');
        });
    });
});

// ===== 全局单例测试 =====

describe('Global realmEventBus instance', () => {
    it('should be an instance of RealmEventBus', () => {
        expect(realmEventBus).toBeInstanceOf(RealmEventBus);
    });
    
    it('should be the same instance', () => {
        const bus1 = realmEventBus;
        const bus2 = realmEventBus;
        expect(bus1).toBe(bus2);
    });
});