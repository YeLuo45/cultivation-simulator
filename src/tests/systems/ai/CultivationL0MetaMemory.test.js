/**
 * CultivationL0MetaMemory.test.js - 修真L0元记忆引擎测试
 * V888 P-20260613-062 Iteration 1/30 Round 35
 * 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    CultivationL0MetaMemory,
    META_EVENT_TYPES,
    META_EVENT_TYPE_KEYS,
    META_EVENT_TYPE_COUNT,
    LINEAGE_MAX_DEPTH,
    META_VALUE_THRESHOLDS,
    META_VALUE_THRESHOLD_COUNT,
    META_LAYERS,
    META_LAYER_COUNT,
    DEFAULT_MAX_EVENTS_PER_PLAYER,
    INVALID_PLAYER_ID,
    UNKNOWN_EVENT_TYPE,
    PLAYER_FROZEN,
    EVENT_NOT_FOUND,
    PLAYER_NOT_FOUND,
    LINEAGE_DEPTH_EXCEEDED,
    INVALID_TOOL_NAME,
    INVALID_HANDLER,
    UNKNOWN_TOOL,
    TOOL_EXECUTION_ERROR,
    INVALID_EVENT_NAME,
    EVENT_NOT_REGISTERED,
    HANDLER_NOT_FOUND,
    INVALID_DATA,
} from '../../../systems/ai/CultivationL0MetaMemory.js';

describe('CultivationL0MetaMemory', () => {
    let system;
    beforeEach(() => {
        system = new CultivationL0MetaMemory();
    });

    describe('constructor', () => {
        it('should initialize with default config', () => {
            expect(system.config.maxEventsPerPlayer).toBe(DEFAULT_MAX_EVENTS_PER_PLAYER);
            expect(system.config.allowEventsAfterFreeze).toBe(false);
            expect(system.config.snapshotThreshold).toBe(50);
        });
        it('should accept custom config', () => {
            const s = new CultivationL0MetaMemory({
                maxEventsPerPlayer: 5,
                allowEventsAfterFreeze: true,
                snapshotThreshold: 200,
            });
            expect(s.config.maxEventsPerPlayer).toBe(5);
            expect(s.config.allowEventsAfterFreeze).toBe(true);
            expect(s.config.snapshotThreshold).toBe(200);
        });
        it('should initialize empty maps', () => {
            expect(system.events.size).toBe(0);
            expect(system.playerEvents.size).toBe(0);
            expect(system.snapshots.size).toBe(0);
            expect(system.frozenPlayers.size).toBe(0);
        });
        it('should initialize stats with zero counters', () => {
            expect(system.stats.totalRecorded).toBe(0);
            expect(system.stats.totalQueried).toBe(0);
            expect(system.stats.totalFrozen).toBe(0);
            expect(system.stats.evolutionCount).toBe(0);
        });
        it('should register default tools', () => {
            expect(system.tools.has('getEvent')).toBe(true);
            expect(system.tools.has('queryHistory')).toBe(true);
            expect(system.tools.has('listByType')).toBe(true);
            expect(system.tools.has('freeze')).toBe(true);
        });
        it('should handle maxEventsPerPlayer=0', () => {
            const s = new CultivationL0MetaMemory({ maxEventsPerPlayer: 0 });
            expect(s.config.maxEventsPerPlayer).toBe(0);
        });
        it('should handle snapshotThreshold=0', () => {
            const s = new CultivationL0MetaMemory({ snapshotThreshold: 0 });
            expect(s.config.snapshotThreshold).toBe(0);
        });
    });

    describe('recordMetaEvent', () => {
        it('should record an awakening event', () => {
            const { success, event } = system.recordMetaEvent('player_1', 'awakening');
            expect(success).toBe(true);
            expect(event.playerId).toBe('player_1');
            expect(event.eventType).toBe('awakening');
            expect(event.metaValue).toBe(20);
            expect(event.lineageDepth).toBe(1);
            expect(event.layer).toBe('L0');
            expect(event.snapshot).toBe(null);
        });
        it('should record a reincarnation event with L2 layer', () => {
            const { event } = system.recordMetaEvent('p1', 'reincarnation');
            expect(event.metaValue).toBe(50);
            expect(event.layer).toBe('L2');
        });
        it('should record a lineage event with L1 layer', () => {
            const { event } = system.recordMetaEvent('p1', 'lineage');
            expect(event.metaValue).toBe(30);
            expect(event.layer).toBe('L1');
        });
        it('should accept all 3 event types', () => {
            for (const type of META_EVENT_TYPE_KEYS) {
                const { success, event } = system.recordMetaEvent('p1', type);
                expect(success).toBe(true);
                expect(event.eventType).toBe(type);
            }
        });
        it('should accumulate lineageDepth across multiple events', () => {
            const r1 = system.recordMetaEvent('p1', 'awakening');
            const r2 = system.recordMetaEvent('p1', 'lineage');
            const r3 = system.recordMetaEvent('p1', 'reincarnation');
            expect(r1.event.lineageDepth).toBe(1);
            expect(r2.event.lineageDepth).toBe(2);
            expect(r3.event.lineageDepth).toBe(3);
        });
        it('should reject empty playerId', () => {
            const result = system.recordMetaEvent('', 'awakening');
            expect(result.success).toBe(false);
            expect(result.error).toBe(INVALID_PLAYER_ID);
        });
        it('should reject unknown eventType', () => {
            const result = system.recordMetaEvent('p1', 'unknown_type');
            expect(result.error).toBe(UNKNOWN_EVENT_TYPE);
        });
        it('should reject when player is frozen (default config)', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.freezeMetaSnapshot('p1');
            const result = system.recordMetaEvent('p1', 'awakening');
            expect(result.success).toBe(false);
            expect(result.error).toBe(PLAYER_FROZEN);
        });
        it('should allow recording after freeze when allowEventsAfterFreeze=true', () => {
            const s = new CultivationL0MetaMemory({ allowEventsAfterFreeze: true });
            s.recordMetaEvent('p1', 'awakening');
            s.freezeMetaSnapshot('p1');
            const { success } = s.recordMetaEvent('p1', 'lineage');
            expect(success).toBe(true);
        });
        it('should reject when lineageDepth exceeds LINEAGE_MAX_DEPTH', () => {
            const s = new CultivationL0MetaMemory();
            for (let i = 0; i < LINEAGE_MAX_DEPTH; i++) {
                s.recordMetaEvent('p1', 'awakening');
            }
            const result = s.recordMetaEvent('p1', 'awakening');
            expect(result.error).toBe(LINEAGE_DEPTH_EXCEEDED);
        });
        it('should track player events', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.recordMetaEvent('p1', 'lineage');
            expect(system.playerEvents.get('p1').length).toBe(2);
        });
        it('should trim oldest events when exceeding maxEventsPerPlayer', () => {
            const s = new CultivationL0MetaMemory({ maxEventsPerPlayer: 2 });
            const r1 = s.recordMetaEvent('p1', 'awakening');
            const r2 = s.recordMetaEvent('p1', 'lineage');
            const r3 = s.recordMetaEvent('p1', 'reincarnation');
            expect(s.events.size).toBe(2);
            expect(s.playerEvents.get('p1').length).toBe(2);
            expect(s.events.has(r1.event.id)).toBe(false);
            expect(s.events.has(r3.event.id)).toBe(true);
        });
        it('should update byType stats', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.recordMetaEvent('p1', 'awakening');
            expect(system.stats.byType.awakening).toBe(2);
        });
        it('should update byLayer stats', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.recordMetaEvent('p1', 'reincarnation');
            expect(system.stats.byLayer.L0).toBe(1);
            expect(system.stats.byLayer.L2).toBe(1);
        });
        it('should set recordedAt to current time', () => {
            const before = Date.now();
            const { event } = system.recordMetaEvent('p1', 'awakening');
            const after = Date.now();
            expect(event.recordedAt).toBeGreaterThanOrEqual(before);
            expect(event.recordedAt).toBeLessThanOrEqual(after);
        });
        it('should assign unique ids to events', () => {
            const r1 = system.recordMetaEvent('p1', 'awakening');
            const r2 = system.recordMetaEvent('p2', 'awakening');
            expect(r1.event.id).not.toBe(r2.event.id);
            expect(r1.event.id).toMatch(/^meta_/);
        });
    });

    describe('queryMetaHistory', () => {
        beforeEach(() => {
            system.recordMetaEvent('p1', 'awakening');
            system.recordMetaEvent('p1', 'lineage');
            system.recordMetaEvent('p1', 'reincarnation');
        });
        it('should return events for the given layer only', () => {
            const l0 = system.queryMetaHistory('p1', 'L0');
            expect(l0.length).toBe(1);
            expect(l0[0].eventType).toBe('awakening');
        });
        it('should return multiple events in same layer', () => {
            system.recordMetaEvent('p1', 'awakening');
            const l0 = system.queryMetaHistory('p1', 'L0');
            expect(l0.length).toBe(2);
        });
        it('should return empty for unknown player', () => {
            expect(system.queryMetaHistory('unknown', 'L0')).toEqual([]);
        });
        it('should increment totalQueried stat', () => {
            const before = system.stats.totalQueried;
            system.queryMetaHistory('p1', 'L0');
            expect(system.stats.totalQueried).toBe(before + 1);
        });
        it('should return clones (not references)', () => {
            const result = system.queryMetaHistory('p1', 'L0');
            result[0].metaValue = 999;
            const fresh = system.queryMetaHistory('p1', 'L0');
            expect(fresh[0].metaValue).toBe(20);
        });
        it('should not include events from other players', () => {
            system.recordMetaEvent('p2', 'awakening');
            const l0 = system.queryMetaHistory('p2', 'L0');
            expect(l0.length).toBe(1);
            expect(l0[0].playerId).toBe('p2');
        });
    });

    describe('freezeMetaSnapshot', () => {
        it('should freeze events for a player', () => {
            system.recordMetaEvent('p1', 'awakening');
            const result = system.freezeMetaSnapshot('p1');
            expect(result.success).toBe(true);
            expect(result.snapshot.playerId).toBe('p1');
            expect(result.snapshot.eventIds.length).toBe(1);
        });
        it('should mark each event with snapshot data', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.freezeMetaSnapshot('p1');
            const event = system.getMetaEvent(system.events.keys().next().value);
            expect(event.snapshot).not.toBe(null);
            expect(event.snapshot.metaValue).toBe(20);
            expect(event.snapshot.layer).toBe('L0');
        });
        it('should reject empty playerId', () => {
            const result = system.freezeMetaSnapshot('');
            expect(result.error).toBe(INVALID_PLAYER_ID);
        });
        it('should reject player with no events', () => {
            const result = system.freezeMetaSnapshot('ghost');
            expect(result.error).toBe(PLAYER_NOT_FOUND);
        });
        it('should add player to frozenPlayers set', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.freezeMetaSnapshot('p1');
            expect(system.frozenPlayers.has('p1')).toBe(true);
        });
        it('should record snapshot in snapshots map', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.freezeMetaSnapshot('p1');
            expect(system.snapshots.has('p1')).toBe(true);
            expect(system.snapshots.get('p1').frozenAt).toBeGreaterThan(0);
        });
        it('should update totalFrozen and totalSnapshots stats', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.freezeMetaSnapshot('p1');
            expect(system.stats.totalFrozen).toBe(1);
            expect(system.stats.totalSnapshots).toBe(1);
        });
        it('should freeze all events for the player', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.recordMetaEvent('p1', 'lineage');
            system.freezeMetaSnapshot('p1');
            for (const id of system.playerEvents.get('p1')) {
                const ev = system.getMetaEvent(id);
                expect(ev.snapshot).not.toBe(null);
            }
        });
    });

    describe('getMetaEvent', () => {
        it('should return event by id', () => {
            const { event } = system.recordMetaEvent('p1', 'awakening');
            const fetched = system.getMetaEvent(event.id);
            expect(fetched.id).toBe(event.id);
            expect(fetched.playerId).toBe('p1');
        });
        it('should return null for unknown id', () => {
            expect(system.getMetaEvent('unknown')).toBe(null);
        });
        it('should return a clone (snapshot field copied)', () => {
            const { event } = system.recordMetaEvent('p1', 'awakening');
            system.freezeMetaSnapshot('p1');
            const fetched = system.getMetaEvent(event.id);
            fetched.snapshot.metaValue = 999;
            const fresh = system.getMetaEvent(event.id);
            expect(fresh.snapshot.metaValue).toBe(20);
        });
    });

    describe('listByPlayer', () => {
        it('should return empty for unknown player', () => {
            expect(system.listByPlayer('unknown')).toEqual([]);
        });
        it('should list all player events', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.recordMetaEvent('p1', 'lineage');
            expect(system.listByPlayer('p1').length).toBe(2);
        });
        it('should separate events by player', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.recordMetaEvent('p2', 'awakening');
            expect(system.listByPlayer('p1').length).toBe(1);
            expect(system.listByPlayer('p2').length).toBe(1);
        });
    });

    describe('listByLayer', () => {
        it('should filter events by layer', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.recordMetaEvent('p2', 'reincarnation');
            expect(system.listByLayer('L0').length).toBe(1);
            expect(system.listByLayer('L2').length).toBe(1);
        });
        it('should return empty for unknown layer', () => {
            expect(system.listByLayer('LX')).toEqual([]);
        });
        it('should aggregate across multiple players', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.recordMetaEvent('p2', 'awakening');
            system.recordMetaEvent('p3', 'lineage');
            expect(system.listByLayer('L0').length).toBe(2);
            expect(system.listByLayer('L1').length).toBe(1);
        });
    });

    describe('listByEventType', () => {
        it('should filter events by eventType', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.recordMetaEvent('p2', 'awakening');
            system.recordMetaEvent('p3', 'lineage');
            expect(system.listByEventType('awakening').length).toBe(2);
            expect(system.listByEventType('lineage').length).toBe(1);
        });
        it('should return empty for unknown eventType', () => {
            expect(system.listByEventType('unknown')).toEqual([]);
        });
    });

    describe('listSnapshots + listFrozenPlayers', () => {
        it('should list snapshots', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.freezeMetaSnapshot('p1');
            const list = system.listSnapshots();
            expect(list.length).toBe(1);
            expect(list[0].playerId).toBe('p1');
        });
        it('should list frozen players', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.recordMetaEvent('p2', 'awakening');
            system.freezeMetaSnapshot('p1');
            system.freezeMetaSnapshot('p2');
            expect(system.listFrozenPlayers().sort()).toEqual(['p1', 'p2']);
        });
    });

    describe('getMetaStats', () => {
        it('should return zero stats for unknown player', () => {
            const stats = system.getMetaStats('unknown');
            expect(stats.totalEvents).toBe(0);
            expect(stats.totalMetaValue).toBe(0);
            expect(stats.avgMetaValue).toBe(0);
            expect(stats.frozen).toBe(false);
        });
        it('should compute totalMetaValue and avgMetaValue', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.recordMetaEvent('p1', 'lineage');
            const stats = system.getMetaStats('p1');
            expect(stats.totalMetaValue).toBe(50);
            expect(stats.avgMetaValue).toBe(25);
        });
        it('should report frozen=true after freeze', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.freezeMetaSnapshot('p1');
            expect(system.getMetaStats('p1').frozen).toBe(true);
        });
        it('should compute byType and byLayer', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.recordMetaEvent('p1', 'awakening');
            system.recordMetaEvent('p1', 'lineage');
            const stats = system.getMetaStats('p1');
            expect(stats.byType.awakening).toBe(2);
            expect(stats.byType.lineage).toBe(1);
            expect(stats.byLayer.L0).toBe(2);
            expect(stats.byLayer.L1).toBe(1);
        });
    });

    describe('registerTool + executeTool', () => {
        it('should register a custom tool', () => {
            const result = system.registerTool('myTool', () => 42);
            expect(result.success).toBe(true);
            expect(system.tools.has('myTool')).toBe(true);
        });
        it('should reject invalid tool name', () => {
            expect(system.registerTool('', () => {}).error).toBe(INVALID_TOOL_NAME);
        });
        it('should reject invalid handler', () => {
            expect(system.registerTool('t', null).error).toBe(INVALID_HANDLER);
        });
        it('should execute a registered tool', () => {
            system.registerTool('get42', () => 42);
            const result = system.executeTool('get42');
            expect(result.result).toBe(42);
        });
        it('should pass context to the tool', () => {
            system.registerTool('echo', (ctx) => ctx);
            const result = system.executeTool('echo', { x: 1 });
            expect(result.result.x).toBe(1);
        });
        it('should default context to {} when undefined', () => {
            system.registerTool('keysLen', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('keysLen');
            expect(result.result).toBe(0);
        });
        it('should default context to {} when null', () => {
            system.registerTool('keysLen2', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('keysLen2', null);
            expect(result.result).toBe(0);
        });
        it('should return UNKNOWN_TOOL for missing tool', () => {
            expect(system.executeTool('nonexistent').error).toBe(UNKNOWN_TOOL);
        });
        it('should handle tool execution errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad');
            expect(result.success).toBe(false);
            expect(result.error).toBe(TOOL_EXECUTION_ERROR);
        });
        it('should call built-in getEvent via tool', () => {
            const { event } = system.recordMetaEvent('p1', 'awakening');
            const result = system.executeTool('getEvent', { eventId: event.id });
            expect(result.result.id).toBe(event.id);
        });
        it('should call built-in queryHistory via tool', () => {
            system.recordMetaEvent('p1', 'awakening');
            const result = system.executeTool('queryHistory', { playerId: 'p1', layer: 'L0' });
            expect(result.result.length).toBe(1);
        });
        it('should call built-in freeze via tool', () => {
            system.recordMetaEvent('p1', 'awakening');
            const result = system.executeTool('freeze', { playerId: 'p1' });
            expect(result.result.success).toBe(true);
        });
    });

    describe('registerHook + triggerHook', () => {
        it('should register a hook', () => {
            const result = system.registerHook('onTest', () => {});
            expect(result.success).toBe(true);
        });
        it('should reject invalid event name', () => {
            expect(system.registerHook('', () => {}).error).toBe(INVALID_EVENT_NAME);
        });
        it('should reject invalid handler', () => {
            expect(system.registerHook('onTest', null).error).toBe(INVALID_HANDLER);
        });
        it('should trigger onMetaRecord hook on recordMetaEvent', () => {
            let called = false;
            system.registerHook('onMetaRecord', () => { called = true; });
            system.recordMetaEvent('p1', 'awakening');
            expect(called).toBe(true);
        });
        it('should trigger onMetaFreeze hook on freezeMetaSnapshot', () => {
            let called = false;
            system.registerHook('onMetaFreeze', () => { called = true; });
            system.recordMetaEvent('p1', 'awakening');
            system.freezeMetaSnapshot('p1');
            expect(called).toBe(true);
        });
        it('should handle hook errors silently', () => {
            system.registerHook('onMetaRecord', () => { throw new Error('hook-fail'); });
            expect(() => system.recordMetaEvent('p1', 'awakening')).not.toThrow();
        });
        it('should support multiple handlers per event', () => {
            let count = 0;
            system.registerHook('onMetaRecord', () => { count++; });
            system.registerHook('onMetaRecord', () => { count++; });
            system.recordMetaEvent('p1', 'awakening');
            expect(count).toBe(2);
        });
        it('should unregister a hook', () => {
            const handler = () => {};
            system.registerHook('onTest', handler);
            const result = system.unregisterHook('onTest', handler);
            expect(result.success).toBe(true);
        });
        it('should return error when unregistering missing event', () => {
            expect(system.unregisterHook('nonexistent', () => {}).error).toBe(EVENT_NOT_REGISTERED);
        });
        it('should return error when handler not in event list', () => {
            system.registerHook('onTest', () => {});
            expect(system.unregisterHook('onTest', () => {}).error).toBe(HANDLER_NOT_FOUND);
        });
    });

    describe('deleteMetaEvent', () => {
        it('should delete an event', () => {
            const { event } = system.recordMetaEvent('p1', 'awakening');
            const result = system.deleteMetaEvent(event.id);
            expect(result.success).toBe(true);
            expect(system.events.has(event.id)).toBe(false);
        });
        it('should reject unknown eventId', () => {
            expect(system.deleteMetaEvent('unknown').error).toBe(EVENT_NOT_FOUND);
        });
        it('should remove from playerEvents list', () => {
            const { event } = system.recordMetaEvent('p1', 'awakening');
            system.deleteMetaEvent(event.id);
            expect(system.playerEvents.get('p1')).toEqual([]);
        });
        it('should reject deletion when player is frozen', () => {
            const { event } = system.recordMetaEvent('p1', 'awakening');
            system.freezeMetaSnapshot('p1');
            expect(system.deleteMetaEvent(event.id).error).toBe(PLAYER_FROZEN);
        });
    });

    describe('toJSON + fromJSON', () => {
        it('should serialize state', () => {
            system.recordMetaEvent('p1', 'awakening');
            const json = system.toJSON();
            expect(json.events.length).toBe(1);
            expect(json.playerEvents.length).toBe(1);
        });
        it('should deserialize state', () => {
            system.recordMetaEvent('p1', 'awakening');
            const json = system.toJSON();
            const s2 = new CultivationL0MetaMemory();
            const result = s2.fromJSON(json);
            expect(result.success).toBe(true);
            expect(s2.events.size).toBe(1);
        });
        it('should reject invalid data', () => {
            expect(system.fromJSON(null).error).toBe(INVALID_DATA);
        });
        it('should restore frozen players on fromJSON', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.freezeMetaSnapshot('p1');
            const json = system.toJSON();
            const s2 = new CultivationL0MetaMemory();
            s2.fromJSON(json);
            expect(s2.frozenPlayers.has('p1')).toBe(true);
        });
        it('should restore snapshots on fromJSON', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.freezeMetaSnapshot('p1');
            const json = system.toJSON();
            const s2 = new CultivationL0MetaMemory();
            s2.fromJSON(json);
            expect(s2.snapshots.has('p1')).toBe(true);
        });
        it('should merge config on fromJSON', () => {
            const s = new CultivationL0MetaMemory();
            s.fromJSON({ config: { maxEventsPerPlayer: 7 } });
            expect(s.config.maxEventsPerPlayer).toBe(7);
        });
        it('should merge stats on fromJSON', () => {
            const s = new CultivationL0MetaMemory();
            s.fromJSON({ stats: { totalRecorded: 42 } });
            expect(s.stats.totalRecorded).toBe(42);
        });
    });

    describe('getStats', () => {
        it('should return stats snapshot', () => {
            const stats = system.getStats();
            expect(stats.totalEvents).toBe(0);
            expect(stats.totalSnapshots).toBe(0);
            expect(stats.frozenPlayers).toBe(0);
        });
        it('should reflect events count', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.recordMetaEvent('p2', 'lineage');
            expect(system.getStats().totalEvents).toBe(2);
        });
        it('should reflect snapshots count', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.freezeMetaSnapshot('p1');
            expect(system.getStats().totalSnapshots).toBe(1);
        });
    });

    describe('autoEvolve + reset', () => {
        it('should increment evolutionCount', () => {
            system.autoEvolve();
            expect(system.stats.evolutionCount).toBe(1);
        });
        it('should reset all state', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.autoEvolve();
            system.reset();
            expect(system.events.size).toBe(0);
            expect(system.playerEvents.size).toBe(0);
            expect(system.frozenPlayers.size).toBe(0);
            expect(system.stats.evolutionCount).toBe(0);
        });
        it('should re-register default tools after reset', () => {
            system.reset();
            expect(system.tools.has('getEvent')).toBe(true);
            expect(system.tools.has('freeze')).toBe(true);
        });
        it('should fire onEvolve hook on autoEvolve', () => {
            let called = false;
            system.registerHook('onEvolve', () => { called = true; });
            system.autoEvolve();
            expect(called).toBe(true);
        });
    });

    describe('exports - META_EVENT_TYPES', () => {
        it('should have 3 event types', () => {
            expect(META_EVENT_TYPE_COUNT).toBe(3);
            expect(Object.keys(META_EVENT_TYPES).length).toBe(3);
        });
        it('should have valid config for each event type', () => {
            for (const [key, value] of Object.entries(META_EVENT_TYPES)) {
                expect(value.name).toBeDefined();
                expect(value.baseValue).toBeGreaterThan(0);
                expect(value.category).toBeDefined();
            }
        });
    });

    describe('exports - META_VALUE_THRESHOLDS + META_LAYERS', () => {
        it('should have 5 ordered thresholds', () => {
            expect(META_VALUE_THRESHOLD_COUNT).toBe(5);
            expect(META_VALUE_THRESHOLDS[0].minValue).toBeLessThan(META_VALUE_THRESHOLDS[1].minValue);
            expect(META_VALUE_THRESHOLDS[4].minValue).toBe(100);
        });
        it('should have 5 layers', () => {
            expect(META_LAYER_COUNT).toBe(5);
            expect(META_LAYERS).toEqual(['L0', 'L1', 'L2', 'L3', 'L4']);
        });
        it('should have LINEAGE_MAX_DEPTH=10', () => {
            expect(LINEAGE_MAX_DEPTH).toBe(10);
        });
    });

    describe('edge cases', () => {
        it('should handle lineageDepth not incrementing beyond max even with mix of types', () => {
            const s = new CultivationL0MetaMemory();
            for (let i = 0; i < LINEAGE_MAX_DEPTH; i++) {
                const types = ['awakening', 'reincarnation', 'lineage'];
                s.recordMetaEvent('p1', types[i % 3]);
            }
            const result = s.recordMetaEvent('p1', 'awakening');
            expect(result.error).toBe(LINEAGE_DEPTH_EXCEEDED);
        });
        it('should preserve player events across freeze and re-record with allowEventsAfterFreeze', () => {
            const s = new CultivationL0MetaMemory({ allowEventsAfterFreeze: true });
            s.recordMetaEvent('p1', 'awakening');
            s.freezeMetaSnapshot('p1');
            s.recordMetaEvent('p1', 'lineage');
            expect(s.listByPlayer('p1').length).toBe(2);
            const frozenEvent = s.getMetaEvent(s.playerEvents.get('p1')[0]);
            expect(frozenEvent.snapshot).not.toBe(null);
        });
        it('should assign different lineageDepth across two players independently', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.recordMetaEvent('p1', 'awakening');
            system.recordMetaEvent('p2', 'awakening');
            const p2Event = system.playerEvents.get('p2')[0];
            expect(system.getMetaEvent(p2Event).lineageDepth).toBe(1);
        });
        it('should clone snapshot in listByPlayer result', () => {
            system.recordMetaEvent('p1', 'awakening');
            system.freezeMetaSnapshot('p1');
            const list = system.listByPlayer('p1');
            list[0].snapshot.metaValue = 999;
            const fresh = system.listByPlayer('p1');
            expect(fresh[0].snapshot.metaValue).toBe(20);
        });
    });
});