/**
 * CultivationAttributeArchive.js - 修真属性档案系统
 * V899 P-20260613-073 Iteration 12/30 Round 35
 *
 * 灵感来源: generic-agent L0-L4 五层记忆框架 (L2 全局层应用)
 * 修真属性档案: 记录每个玩家所有可存档属性的历史变化
 * - 核心 API: archiveAttribute / retrieveAttribute / compareAttributes
 * - 数据结构: { id, playerId, attributeName, baseValue, currentValue, history: [{value, recordedAt}], recordedAt }
 * - 配置: ARCHIVABLE_ATTRIBUTES (10), MAX_HISTORY_PER_ATTR (30), ATTRIBUTE_CHANGE_RULES
 */

export const ARCHIVABLE_ATTRIBUTES = [
    'root_bone', 'aptitude', 'fortune', 'comprehension', 'willpower',
    'karma', 'luck', 'charm', 'intellect', 'endurance',
];
export const ARCHIVABLE_ATTRIBUTE_COUNT = 10;

export const ATTRIBUTE_META = {
    root_bone: { name: '根骨', category: 'body' },
    aptitude: { name: '悟性', category: 'mind' },
    fortune: { name: '机缘', category: 'destiny' },
    comprehension: { name: '领悟', category: 'mind' },
    willpower: { name: '意志', category: 'mind' },
    karma: { name: '业力', category: 'destiny' },
    luck: { name: '气运', category: 'destiny' },
    charm: { name: '魅力', category: 'social' },
    intellect: { name: '智力', category: 'mind' },
    endurance: { name: '耐力', category: 'body' },
};

export const MAX_HISTORY_PER_ATTR = 30;
export const DEFAULT_MAX_HISTORY = 30;

export const ATTRIBUTE_CHANGE_RULES = {
    minDelta: 0.0001,
    maxDelta: 1,
    absoluteMin: 0,
    absoluteMax: 1,
    decayEnabled: false,
    decayRate: 0.0001,
};

export const COMPARE_MODES = ['absolute', 'relative', 'delta'];
export const COMPARE_MODE_COUNT = 3;

export const INVALID_PLAYER_ID = 'INVALID_PLAYER_ID';
export const INVALID_ATTRIBUTE = 'INVALID_ATTRIBUTE';
export const INVALID_VALUE = 'INVALID_VALUE';
export const ATTRIBUTE_NOT_FOUND = 'ATTRIBUTE_NOT_FOUND';
export const INVALID_COMPARE_MODE = 'INVALID_COMPARE_MODE';
export const UNKNOWN_TOOL = 'UNKNOWN_TOOL';
export const INVALID_TOOL_NAME = 'INVALID_TOOL_NAME';
export const INVALID_HANDLER = 'INVALID_HANDLER';
export const INVALID_EVENT_NAME = 'INVALID_EVENT_NAME';
export const EVENT_NOT_FOUND = 'EVENT_NOT_FOUND';
export const HANDLER_NOT_FOUND = 'HANDLER_NOT_FOUND';
export const INVALID_DATA = 'INVALID_DATA';
export const TOOL_EXECUTION_ERROR = 'TOOL_EXECUTION_ERROR';

export class CultivationAttributeArchive {
    constructor(config = {}) {
        this.config = {
            maxHistory: config.maxHistory !== undefined ? config.maxHistory : DEFAULT_MAX_HISTORY,
            minDelta: config.minDelta !== undefined ? config.minDelta : ATTRIBUTE_CHANGE_RULES.minDelta,
            maxDelta: config.maxDelta !== undefined ? config.maxDelta : ATTRIBUTE_CHANGE_RULES.maxDelta,
            absoluteMin: config.absoluteMin !== undefined ? config.absoluteMin : ATTRIBUTE_CHANGE_RULES.absoluteMin,
            absoluteMax: config.absoluteMax !== undefined ? config.absoluteMax : ATTRIBUTE_CHANGE_RULES.absoluteMax,
            decayEnabled: config.decayEnabled !== undefined ? config.decayEnabled : ATTRIBUTE_CHANGE_RULES.decayEnabled,
            decayRate: config.decayRate !== undefined ? config.decayRate : ATTRIBUTE_CHANGE_RULES.decayRate,
            ...config,
        };
        this.archives = new Map();
        this.playerArchives = new Map();
        this.attributeArchives = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = {
            totalArchived: 0,
            totalRetrieved: 0,
            totalCompared: 0,
            totalDeleted: 0,
            totalCleared: 0,
            byAttribute: this._initByAttribute(),
            byPlayer: {},
        };
        this._registerDefaultTools();
    }

    _initByAttribute() {
        const obj = {};
        for (const attr of ARCHIVABLE_ATTRIBUTES) {
            obj[attr] = 0;
        }
        return obj;
    }

    _registerDefaultTools() {
        this.registerTool('archiveAttribute', (ctx) => this.archiveAttribute(ctx?.playerId, ctx?.attribute, ctx?.value, ctx?.options));
        this.registerTool('retrieveAttribute', (ctx) => this.retrieveAttribute(ctx?.playerId, ctx?.attribute));
        this.registerTool('compareAttributes', (ctx) => this.compareAttributes(ctx?.playerId1, ctx?.playerId2, ctx?.attribute, ctx?.mode));
        this.registerTool('listByPlayer', (ctx) => this.listByPlayer(ctx?.playerId));
        this.registerTool('listByAttribute', (ctx) => this.listByAttribute(ctx?.attribute));
        this.registerTool('getHistory', (ctx) => this.getHistory(ctx?.playerId, ctx?.attribute));
        this.registerTool('deleteArchive', (ctx) => this.deleteArchive(ctx?.playerId, ctx?.attribute));
        this.registerTool('clearHistory', (ctx) => this.clearHistory(ctx?.playerId, ctx?.attribute));
    }

    _genId() {
        return `arch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    _isValidAttribute(attr) {
        return typeof attr === 'string' && ARCHIVABLE_ATTRIBUTES.includes(attr);
    }

    _isValidMode(mode) {
        return typeof mode === 'string' && COMPARE_MODES.includes(mode);
    }

    _clampValue(v) {
        if (typeof v !== 'number' || Number.isNaN(v)) return 0;
        const lo = this.config.absoluteMin ?? 0;
        const hi = this.config.absoluteMax ?? 1;
        return Math.max(lo, Math.min(hi, v));
    }

    _key(playerId, attribute) {
        return `${playerId}:${attribute}`;
    }

    _cloneArchive(archive) {
        return {
            id: archive.id,
            playerId: archive.playerId,
            attributeName: archive.attributeName,
            baseValue: archive.baseValue,
            currentValue: archive.currentValue,
            history: archive.history.map(h => ({ ...h })),
            recordedAt: archive.recordedAt,
        };
    }

    archiveAttribute(playerId, attribute, value, options = {}) {
        if (typeof playerId !== 'string' || playerId.length === 0) {
            return { success: false, error: INVALID_PLAYER_ID };
        }
        if (!this._isValidAttribute(attribute)) {
            return { success: false, error: INVALID_ATTRIBUTE };
        }
        if (typeof value !== 'number' || Number.isNaN(value)) {
            return { success: false, error: INVALID_VALUE };
        }
        const id = options.id !== undefined ? options.id : this._genId();
        const recordedAt = options.recordedAt !== undefined ? options.recordedAt : Date.now();
        const reason = options.reason !== undefined ? options.reason : null;
        const source = options.source !== undefined ? options.source : 'manual';
        const clamped = this._clampValue(value);
        const key = this._key(playerId, attribute);

        let archive = null;
        if (this.archives.has(key)) {
            archive = this.archives.get(key);
        } else {
            archive = {
                id,
                playerId,
                attributeName: attribute,
                baseValue: clamped,
                currentValue: clamped,
                history: [],
                recordedAt,
            };
            this.archives.set(key, archive);
            if (!this.playerArchives.has(playerId)) this.playerArchives.set(playerId, []);
            this.playerArchives.get(playerId).push(key);
            if (!this.attributeArchives.has(attribute)) this.attributeArchives.set(attribute, []);
            this.attributeArchives.get(attribute).push(key);
        }

        const prevValue = archive.currentValue;
        const delta = clamped - prevValue;
        const entry = {
            value: clamped,
            delta,
            recordedAt,
            reason,
            source,
        };
        archive.history.push(entry);
        if (archive.history.length > this.config.maxHistory) {
            archive.history.shift();
        }
        // currentValue tracks the actual latest value (= baseValue + sum of deltas = baseValue + (clamped - baseValue))
        archive.currentValue = archive.baseValue + (clamped - archive.baseValue);
        archive.recordedAt = recordedAt;

        this.stats.totalArchived += 1;
        if (this.stats.byAttribute[attribute] !== undefined) {
            this.stats.byAttribute[attribute] = this.stats.byAttribute[attribute] + 1;
        } else {
            this.stats.byAttribute[attribute] = 1;
        }
        this.stats.byPlayer[playerId] = (this.stats.byPlayer[playerId] ?? 0) + 1;

        this._triggerHook('onArchived', { archiveId: archive.id, playerId, attribute, value: clamped, delta });
        return { success: true, archive: this._cloneArchive(archive) };
    }

    retrieveAttribute(playerId, attribute) {
        if (typeof playerId !== 'string' || playerId.length === 0) {
            return { success: false, error: INVALID_PLAYER_ID };
        }
        if (!this._isValidAttribute(attribute)) {
            return { success: false, error: INVALID_ATTRIBUTE };
        }
        const key = this._key(playerId, attribute);
        if (!this.archives.has(key)) {
            return { success: false, error: ATTRIBUTE_NOT_FOUND };
        }
        const archive = this.archives.get(key);
        this.stats.totalRetrieved += 1;
        this._triggerHook('onRetrieved', { playerId, attribute, archiveId: archive.id });
        return { success: true, archive: this._cloneArchive(archive) };
    }

    compareAttributes(playerId1, playerId2, attribute, mode = 'absolute') {
        if (typeof playerId1 !== 'string' || playerId1.length === 0) {
            return { success: false, error: INVALID_PLAYER_ID };
        }
        if (typeof playerId2 !== 'string' || playerId2.length === 0) {
            return { success: false, error: INVALID_PLAYER_ID };
        }
        if (!this._isValidAttribute(attribute)) {
            return { success: false, error: INVALID_ATTRIBUTE };
        }
        if (!this._isValidMode(mode)) {
            return { success: false, error: INVALID_COMPARE_MODE };
        }
        const key1 = this._key(playerId1, attribute);
        const key2 = this._key(playerId2, attribute);
        const a1 = this.archives.has(key1) ? this.archives.get(key1) : null;
        const a2 = this.archives.has(key2) ? this.archives.get(key2) : null;
        if (a1 === null || a2 === null) {
            return { success: false, error: ATTRIBUTE_NOT_FOUND };
        }
        const v1 = a1.currentValue;
        const v2 = a2.currentValue;
        const diff = v1 - v2;
        let modeResult = {};
        if (mode === 'absolute') {
            modeResult = { difference: diff, mode: 'absolute' };
        } else if (mode === 'relative') {
            const denom = v2 !== 0 ? v2 : (this.config.minDelta ?? 0.0001);
            modeResult = { difference: diff / denom, mode: 'relative' };
        } else {
            // delta
            modeResult = {
                difference: diff,
                baseDelta1: v1 - a1.baseValue,
                baseDelta2: v2 - a2.baseValue,
                mode: 'delta',
            };
        }
        this.stats.totalCompared += 1;
        this._triggerHook('onCompared', { playerId1, playerId2, attribute, difference: diff, mode });
        return {
            success: true,
            playerId1,
            playerId2,
            attribute,
            value1: v1,
            value2: v2,
            baseValue1: a1.baseValue,
            baseValue2: a2.baseValue,
            ...modeResult,
        };
    }

    getHistory(playerId, attribute) {
        if (typeof playerId !== 'string' || playerId.length === 0) {
            return { success: false, error: INVALID_PLAYER_ID };
        }
        if (!this._isValidAttribute(attribute)) {
            return { success: false, error: INVALID_ATTRIBUTE };
        }
        const key = this._key(playerId, attribute);
        if (!this.archives.has(key)) {
            return { success: false, error: ATTRIBUTE_NOT_FOUND };
        }
        const archive = this.archives.get(key);
        return {
            success: true,
            playerId,
            attribute,
            history: archive.history.map(h => ({ ...h })),
            count: archive.history.length,
        };
    }

    listByPlayer(playerId) {
        if (typeof playerId !== 'string' || playerId.length === 0) return [];
        if (!this.playerArchives.has(playerId)) return [];
        const keys = this.playerArchives.get(playerId);
        return keys.map(k => this.archives.get(k)).filter(a => a !== undefined && a !== null).map(a => this._cloneArchive(a));
    }

    listByAttribute(attribute) {
        if (!this._isValidAttribute(attribute)) return [];
        if (!this.attributeArchives.has(attribute)) return [];
        const keys = this.attributeArchives.get(attribute);
        return keys.map(k => this.archives.get(k)).filter(a => a !== undefined && a !== null).map(a => this._cloneArchive(a));
    }

    listAll() {
        return Array.from(this.archives.values()).map(a => this._cloneArchive(a));
    }

    listAttributes() {
        return ARCHIVABLE_ATTRIBUTES.slice();
    }

    listPlayers() {
        return Array.from(this.playerArchives.keys());
    }

    hasArchive(playerId, attribute) {
        if (typeof playerId !== 'string' || playerId.length === 0) return false;
        if (!this._isValidAttribute(attribute)) return false;
        return this.archives.has(this._key(playerId, attribute));
    }

    deleteArchive(playerId, attribute) {
        if (typeof playerId !== 'string' || playerId.length === 0) {
            return { success: false, error: INVALID_PLAYER_ID };
        }
        if (!this._isValidAttribute(attribute)) {
            return { success: false, error: INVALID_ATTRIBUTE };
        }
        const key = this._key(playerId, attribute);
        if (!this.archives.has(key)) {
            return { success: false, error: ATTRIBUTE_NOT_FOUND };
        }
        this.archives.delete(key);
        if (this.playerArchives.has(playerId)) {
            const arr = this.playerArchives.get(playerId);
            const idx = arr.indexOf(key);
            if (idx !== -1) arr.splice(idx, 1);
            if (arr.length === 0) this.playerArchives.delete(playerId);
        }
        if (this.attributeArchives.has(attribute)) {
            const arr = this.attributeArchives.get(attribute);
            const idx = arr.indexOf(key);
            if (idx !== -1) arr.splice(idx, 1);
            if (arr.length === 0) this.attributeArchives.delete(attribute);
        }
        this.stats.totalDeleted += 1;
        this._triggerHook('onDeleted', { playerId, attribute });
        return { success: true };
    }

    clearHistory(playerId, attribute) {
        if (typeof playerId !== 'string' || playerId.length === 0) {
            return { success: false, error: INVALID_PLAYER_ID };
        }
        if (!this._isValidAttribute(attribute)) {
            return { success: false, error: INVALID_ATTRIBUTE };
        }
        const key = this._key(playerId, attribute);
        if (!this.archives.has(key)) {
            return { success: false, error: ATTRIBUTE_NOT_FOUND };
        }
        const archive = this.archives.get(key);
        archive.history = [];
        // Reset currentValue to baseValue (no history = no delta)
        archive.currentValue = archive.baseValue;
        this.stats.totalCleared += 1;
        this._triggerHook('onCleared', { playerId, attribute });
        return { success: true };
    }

    deletePlayer(playerId) {
        if (typeof playerId !== 'string' || playerId.length === 0) {
            return { success: false, error: INVALID_PLAYER_ID };
        }
        if (!this.playerArchives.has(playerId)) {
            return { success: false, error: ATTRIBUTE_NOT_FOUND };
        }
        const keys = this.playerArchives.get(playerId).slice();
        let count = 0;
        for (const k of keys) {
            const parts = k.split(':');
            const attr = parts.slice(1).join(':');
            this.deleteArchive(playerId, attr);
            count += 1;
        }
        return { success: true, deleted: count };
    }

    setMaxHistory(value) {
        if (typeof value !== 'number' || Number.isNaN(value) || value < 1) {
            return { success: false, error: INVALID_VALUE };
        }
        this.config.maxHistory = value;
        return { success: true };
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
        if (typeof name !== 'string' || name.length === 0) {
            return { success: false, error: INVALID_TOOL_NAME };
        }
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
        if (!this.hooks.has(event)) this.hooks.set(event, []);
        this.hooks.get(event).push(handler);
        return { success: true };
    }

    _triggerHook(event, data) {
        if (!this.hooks.has(event)) return;
        for (const handler of this.hooks.get(event)) {
            try {
                handler(data);
            } catch (e) {
                // silent
            }
        }
    }

    unregisterHook(event, handler) {
        if (!this.hooks.has(event)) return { success: false, error: EVENT_NOT_FOUND };
        const arr = this.hooks.get(event);
        const idx = arr.indexOf(handler);
        if (idx === -1) return { success: false, error: HANDLER_NOT_FOUND };
        arr.splice(idx, 1);
        return { success: true };
    }

    toJSON() {
        return {
            config: this.config,
            archives: Array.from(this.archives.entries()),
            playerArchives: Array.from(this.playerArchives.entries()),
            attributeArchives: Array.from(this.attributeArchives.entries()),
            stats: this.stats,
        };
    }

    fromJSON(data) {
        if (!data || typeof data !== 'object') return { success: false, error: INVALID_DATA };
        if (data.config) {
            this.config = { ...this.config, ...data.config };
        }
        if (data.archives && Array.isArray(data.archives)) {
            this.archives = new Map(data.archives);
        }
        if (data.playerArchives && Array.isArray(data.playerArchives)) {
            this.playerArchives = new Map(data.playerArchives);
        }
        if (data.attributeArchives && Array.isArray(data.attributeArchives)) {
            this.attributeArchives = new Map(data.attributeArchives);
        }
        if (data.stats) {
            this.stats = { ...this.stats, ...data.stats };
        }
        return { success: true };
    }

    getStats() {
        return {
            ...this.stats,
            totalArchiveRecords: this.archives.size,
            totalPlayers: this.playerArchives.size,
        };
    }

    reset() {
        this.archives.clear();
        this.playerArchives.clear();
        this.attributeArchives.clear();
        this.hooks.clear();
        this.stats = {
            totalArchived: 0,
            totalRetrieved: 0,
            totalCompared: 0,
            totalDeleted: 0,
            totalCleared: 0,
            byAttribute: this._initByAttribute(),
            byPlayer: {},
        };
        this._registerDefaultTools();
        return { success: true };
    }
}
