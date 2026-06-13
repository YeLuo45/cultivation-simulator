/**
 * CultivationL0MetaMemory.js - 修真L0元记忆引擎
 * V888 P-20260613-062 Iteration 1/30 Round 35
 *
 * 修真L0-L4分层记忆传承系统：L0元记忆层(generic-agent L0-L4分层框架第1层)
 * - 核心 API: recordMetaEvent / queryMetaHistory / freezeMetaSnapshot
 * - 数据结构: { id, playerId, eventType, metaValue, lineageDepth, recordedAt, layer, snapshot }
 * - 配置: META_EVENT_TYPES, LINEAGE_MAX_DEPTH, META_VALUE_THRESHOLDS, META_LAYERS
 */

export const META_EVENT_TYPES = {
    awakening: {
        name: '觉醒',
        baseValue: 20,
        category: 'cultivation',
        layerHint: 'L0',
    },
    reincarnation: {
        name: '轮回',
        baseValue: 50,
        category: 'rebirth',
        layerHint: 'L1',
    },
    lineage: {
        name: '传承',
        baseValue: 30,
        category: 'ancestor',
        layerHint: 'L2',
    },
};

export const META_EVENT_TYPE_KEYS = Object.keys(META_EVENT_TYPES);
export const META_EVENT_TYPE_COUNT = 3;

export const LINEAGE_MAX_DEPTH = 10;

export const META_VALUE_THRESHOLDS = [
    { layer: 'L0', minValue: 0, name: '初识' },
    { layer: 'L1', minValue: 25, name: '感通' },
    { layer: 'L2', minValue: 50, name: '通幽' },
    { layer: 'L3', minValue: 75, name: '显化' },
    { layer: 'L4', minValue: 100, name: '归元' },
];
export const META_VALUE_THRESHOLD_COUNT = 5;

export const META_LAYERS = ['L0', 'L1', 'L2', 'L3', 'L4'];
export const META_LAYER_COUNT = 5;

export const DEFAULT_MAX_EVENTS_PER_PLAYER = 100;

export const INVALID_PLAYER_ID = 'INVALID_PLAYER_ID';
export const UNKNOWN_EVENT_TYPE = 'UNKNOWN_EVENT_TYPE';
export const PLAYER_FROZEN = 'PLAYER_FROZEN';
export const EVENT_NOT_FOUND = 'EVENT_NOT_FOUND';
export const PLAYER_NOT_FOUND = 'PLAYER_NOT_FOUND';
export const LINEAGE_DEPTH_EXCEEDED = 'LINEAGE_DEPTH_EXCEEDED';
export const INVALID_TOOL_NAME = 'INVALID_TOOL_NAME';
export const INVALID_HANDLER = 'INVALID_HANDLER';
export const UNKNOWN_TOOL = 'UNKNOWN_TOOL';
export const TOOL_EXECUTION_ERROR = 'TOOL_EXECUTION_ERROR';
export const INVALID_EVENT_NAME = 'INVALID_EVENT_NAME';
export const EVENT_NOT_REGISTERED = 'EVENT_NOT_REGISTERED';
export const HANDLER_NOT_FOUND = 'HANDLER_NOT_FOUND';
export const INVALID_DATA = 'INVALID_DATA';

export class CultivationL0MetaMemory {
    constructor(config = {}) {
        this.config = {
            maxEventsPerPlayer: config.maxEventsPerPlayer !== undefined ? config.maxEventsPerPlayer : DEFAULT_MAX_EVENTS_PER_PLAYER,
            allowEventsAfterFreeze: config.allowEventsAfterFreeze !== undefined ? config.allowEventsAfterFreeze : false,
            snapshotThreshold: config.snapshotThreshold !== undefined ? config.snapshotThreshold : 50,
            ...config,
        };
        this.events = new Map();
        this.playerEvents = new Map();
        this.snapshots = new Map();
        this.frozenPlayers = new Set();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = {
            totalRecorded: 0,
            totalQueried: 0,
            totalFrozen: 0,
            totalSnapshots: 0,
            evolutionCount: 0,
            byType: { awakening: 0, reincarnation: 0, lineage: 0 },
            byLayer: { L0: 0, L1: 0, L2: 0, L3: 0, L4: 0 },
        };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getEvent', (ctx) => this.getMetaEvent(ctx.eventId));
        this.registerTool('queryHistory', (ctx) => this.queryMetaHistory(ctx.playerId, ctx.layer));
        this.registerTool('listByType', (ctx) => this.listByType(ctx.eventType));
        this.registerTool('freeze', (ctx) => this.freezeMetaSnapshot(ctx.playerId));
    }

    _genId() {
        return `meta_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    _computeLayer(metaValue) {
        let chosen = META_VALUE_THRESHOLDS[0].layer;
        for (const t of META_VALUE_THRESHOLDS) {
            if (metaValue >= t.minValue) chosen = t.layer;
        }
        return chosen;
    }

    _nextLineageDepth(playerId) {
        if (!this.playerEvents.has(playerId)) return 1;
        const list = this.playerEvents.get(playerId);
        return list.length + 1;
    }

    _isFrozen(playerId) {
        return this.frozenPlayers.has(playerId);
    }

    _cloneEvent(event) {
        return {
            ...event,
            snapshot: event.snapshot ? { ...event.snapshot } : null,
        };
    }

    recordMetaEvent(playerId, eventType) {
        if (typeof playerId !== 'string' || playerId.length === 0) {
            return { success: false, error: INVALID_PLAYER_ID };
        }
        if (!META_EVENT_TYPES[eventType]) {
            return { success: false, error: UNKNOWN_EVENT_TYPE };
        }
        if (this._isFrozen(playerId) && !this.config.allowEventsAfterFreeze) {
            return { success: false, error: PLAYER_FROZEN };
        }

        const typeDef = META_EVENT_TYPES[eventType];
        const lineageDepth = this._nextLineageDepth(playerId);
        if (lineageDepth > LINEAGE_MAX_DEPTH) {
            return { success: false, error: LINEAGE_DEPTH_EXCEEDED };
        }

        const id = this._genId();
        const recordedAt = Date.now();
        const metaValue = typeDef.baseValue;
        const layer = this._computeLayer(metaValue);

        const event = {
            id,
            playerId,
            eventType,
            metaValue,
            lineageDepth,
            recordedAt,
            layer,
            snapshot: null,
        };

        this.events.set(id, event);
        if (!this.playerEvents.has(playerId)) {
            this.playerEvents.set(playerId, []);
        }
        this.playerEvents.get(playerId).push(id);

        // Trim oldest if exceeding per-player cap
        const playerList = this.playerEvents.get(playerId);
        if (playerList.length > this.config.maxEventsPerPlayer) {
            const removedId = playerList.shift();
            if (removedId && this.events.has(removedId)) {
                this.events.delete(removedId);
            }
        }

        this.stats.totalRecorded += 1;
        this.stats.byType[eventType] = (this.stats.byType[eventType] || 0) + 1;
        this.stats.byLayer[layer] = (this.stats.byLayer[layer] || 0) + 1;

        this._triggerHook('onMetaRecord', { event });
        return { success: true, event: this._cloneEvent(event) };
    }

    queryMetaHistory(playerId, layer) {
        this.stats.totalQueried += 1;
        if (!this.playerEvents.has(playerId)) return [];
        const ids = this.playerEvents.get(playerId);
        const events = ids.map(id => this.events.get(id)).filter(e => e !== undefined);
        const filtered = events.filter(e => e.layer === layer);
        return filtered.map(e => this._cloneEvent(e));
    }

    freezeMetaSnapshot(playerId) {
        if (typeof playerId !== 'string' || playerId.length === 0) {
            return { success: false, error: INVALID_PLAYER_ID };
        }
        if (!this.playerEvents.has(playerId) || this.playerEvents.get(playerId).length === 0) {
            return { success: false, error: PLAYER_NOT_FOUND };
        }

        const ids = this.playerEvents.get(playerId);
        const frozenAt = Date.now();
        const frozenEventIds = [];

        for (const id of ids) {
            if (this.events.has(id)) {
                const event = this.events.get(id);
                event.snapshot = Object.freeze({
                    frozenAt,
                    frozenId: id,
                    metaValue: event.metaValue,
                    layer: event.layer,
                });
                frozenEventIds.push(id);
            }
        }

        const snapshot = {
            playerId,
            frozenAt,
            eventIds: [...frozenEventIds],
            threshold: this.config.snapshotThreshold,
        };
        this.snapshots.set(playerId, snapshot);
        this.frozenPlayers.add(playerId);
        this.stats.totalFrozen += 1;
        this.stats.totalSnapshots += 1;

        this._triggerHook('onMetaFreeze', { playerId, snapshot });
        return { success: true, snapshot: { ...snapshot } };
    }

    getMetaEvent(eventId) {
        if (!this.events.has(eventId)) return null;
        const event = this.events.get(eventId);
        return this._cloneEvent(event);
    }

    listByPlayer(playerId) {
        if (!this.playerEvents.has(playerId)) return [];
        const ids = this.playerEvents.get(playerId);
        return ids
            .map(id => this.events.get(id))
            .filter(e => e !== undefined)
            .map(e => this._cloneEvent(e));
    }

    listByLayer(layer) {
        if (!META_LAYERS.includes(layer)) return [];
        return Array.from(this.events.values())
            .filter(e => e.layer === layer)
            .map(e => this._cloneEvent(e));
    }

    listByEventType(eventType) {
        if (!META_EVENT_TYPES[eventType]) return [];
        return Array.from(this.events.values())
            .filter(e => e.eventType === eventType)
            .map(e => this._cloneEvent(e));
    }

    listSnapshots() {
        return Array.from(this.snapshots.values()).map(s => ({ ...s, eventIds: [...s.eventIds] }));
    }

    listFrozenPlayers() {
        return Array.from(this.frozenPlayers);
    }

    getMetaStats(playerId) {
        const events = this.listByPlayer(playerId);
        const totalMetaValue = events.reduce((sum, e) => sum + e.metaValue, 0);
        const lineageDepth = events.length;
        const byType = { awakening: 0, reincarnation: 0, lineage: 0 };
        const byLayer = { L0: 0, L1: 0, L2: 0, L3: 0, L4: 0 };
        for (const e of events) {
            byType[e.eventType] = (byType[e.eventType] || 0) + 1;
            byLayer[e.layer] = (byLayer[e.layer] || 0) + 1;
        }
        return {
            playerId,
            totalEvents: events.length,
            totalMetaValue,
            avgMetaValue: events.length > 0 ? totalMetaValue / events.length : 0,
            lineageDepth,
            frozen: this._isFrozen(playerId),
            byType,
            byLayer,
        };
    }

    registerTool(name, handler) {
        if (typeof name !== 'string' || name.length === 0) {
            return { success: false, error: INVALID_TOOL_NAME };
        }
        if (typeof handler !== 'function') {
            return { success: false, error: INVALID_HANDLER };
        }
        this.tools.set(name, handler);
        return { success: true };
    }

    executeTool(name, context) {
        if (!this.tools.has(name)) {
            return { success: false, error: UNKNOWN_TOOL };
        }
        const handler = this.tools.get(name);
        const ctx = (context !== undefined && context !== null) ? context : {};
        try {
            const result = handler(ctx);
            return { success: true, result };
        } catch (e) {
            return { success: false, error: TOOL_EXECUTION_ERROR, message: e.message };
        }
    }

    registerHook(event, handler) {
        if (typeof event !== 'string' || event.length === 0) {
            return { success: false, error: INVALID_EVENT_NAME };
        }
        if (typeof handler !== 'function') {
            return { success: false, error: INVALID_HANDLER };
        }
        if (!this.hooks.has(event)) {
            this.hooks.set(event, []);
        }
        this.hooks.get(event).push(handler);
        return { success: true };
    }

    _triggerHook(event, data) {
        if (!this.hooks.has(event)) return;
        for (const handler of this.hooks.get(event)) {
            try {
                handler(data);
            } catch (e) {
                // silent error handling
            }
        }
    }

    unregisterHook(event, handler) {
        if (!this.hooks.has(event)) return { success: false, error: EVENT_NOT_REGISTERED };
        const handlers = this.hooks.get(event);
        const idx = handlers.indexOf(handler);
        if (idx === -1) return { success: false, error: HANDLER_NOT_FOUND };
        handlers.splice(idx, 1);
        return { success: true };
    }

    deleteMetaEvent(eventId) {
        if (!this.events.has(eventId)) return { success: false, error: EVENT_NOT_FOUND };
        const event = this.events.get(eventId);
        const playerId = event.playerId;
        if (this._isFrozen(playerId)) {
            return { success: false, error: PLAYER_FROZEN };
        }
        if (this.playerEvents.has(playerId)) {
            const list = this.playerEvents.get(playerId);
            const idx = list.indexOf(eventId);
            if (idx !== -1) list.splice(idx, 1);
        }
        this.events.delete(eventId);
        return { success: true };
    }

    toJSON() {
        return {
            config: { ...this.config },
            events: Array.from(this.events.entries()),
            playerEvents: Array.from(this.playerEvents.entries()),
            snapshots: Array.from(this.snapshots.entries()),
            frozenPlayers: Array.from(this.frozenPlayers),
            stats: { ...this.stats },
        };
    }

    fromJSON(data) {
        if (!data || typeof data !== 'object') return { success: false, error: INVALID_DATA };
        if (data.config) {
            this.config = { ...this.config, ...data.config };
        }
        if (data.events && Array.isArray(data.events)) {
            this.events = new Map(data.events);
        }
        if (data.playerEvents && Array.isArray(data.playerEvents)) {
            this.playerEvents = new Map(data.playerEvents);
        }
        if (data.snapshots && Array.isArray(data.snapshots)) {
            this.snapshots = new Map(data.snapshots);
        }
        if (data.frozenPlayers && Array.isArray(data.frozenPlayers)) {
            this.frozenPlayers = new Set(data.frozenPlayers);
        }
        if (data.stats) {
            this.stats = { ...this.stats, ...data.stats };
        }
        return { success: true };
    }

    getStats() {
        return {
            ...this.stats,
            totalEvents: this.events.size,
            totalSnapshots: this.snapshots.size,
            frozenPlayers: this.frozenPlayers.size,
        };
    }

    autoEvolve() {
        this.stats.evolutionCount += 1;
        this._triggerHook('onEvolve', { stats: this.stats });
        return { success: true, evolutionCount: this.stats.evolutionCount };
    }

    reset() {
        this.events.clear();
        this.playerEvents.clear();
        this.snapshots.clear();
        this.frozenPlayers.clear();
        this.hooks.clear();
        this.stats = {
            totalRecorded: 0,
            totalQueried: 0,
            totalFrozen: 0,
            totalSnapshots: 0,
            evolutionCount: 0,
            byType: { awakening: 0, reincarnation: 0, lineage: 0 },
            byLayer: { L0: 0, L1: 0, L2: 0, L3: 0, L4: 0 },
        };
        this._registerDefaultTools();
        return { success: true };
    }
}