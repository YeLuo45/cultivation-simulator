/**
 * CultivationPillInventory.js - 修真丹药仓库系统
 * V939 P-20260613-113 Iteration 22/30 Round 36
 *
 * 丹药仓库系统：收纳/分类/使用/丢弃
 * - 核心 API: storePill / retrievePill / listByQuality / listByOwner / usePill / discardExpired
 * - 数据结构: { id, pillName, quality, effects, potency, duration, expiresAt, owner }
 * - 配置: PILL_QUALITIES (5), MAX_PILLS_PER_OWNER (100), EXPIRY_CHECK_INTERVAL (60000), PILL_EFFECT_TYPES (8)
 */

export const PILL_QUALITIES = {
    mortal: { rank: 1, multiplier: 1.0 },
    spirit: { rank: 2, multiplier: 1.5 },
    earth: { rank: 3, multiplier: 2.5 },
    heaven: { rank: 4, multiplier: 4.0 },
    immortal: { rank: 5, multiplier: 7.0 },
};
export const PILL_QUALITY_KEYS = Object.keys(PILL_QUALITIES);
export const PILL_QUALITY_COUNT = 5;

export const PILL_EFFECT_TYPES = [
    'heal', 'mp_restore', 'exp_boost', 'poison_resist',
    'attack_boost', 'defense_boost', 'speed_boost', 'cultivation_boost',
];
export const PILL_EFFECT_TYPE_COUNT = 8;

export const DEFAULT_MAX_PILLS_PER_OWNER = 100;
export const DEFAULT_POTENCY = 10;
export const DEFAULT_DURATION = 0;
export const DEFAULT_OWNER = 'cultivator';
export const DEFAULT_EXPIRY_MS = 86400000;

export const INVALID_PILL = 'INVALID_PILL';
export const INVALID_QUALITY = 'INVALID_QUALITY';
export const INVALID_EFFECT = 'INVALID_EFFECT';
export const INVALID_OWNER = 'INVALID_OWNER';
export const INVENTORY_FULL = 'INVENTORY_FULL';
export const DUPLICATE_ID = 'DUPLICATE_ID';
export const PILL_NOT_FOUND = 'PILL_NOT_FOUND';
export const NOT_OWNER = 'NOT_OWNER';
export const INVALID_DATA = 'INVALID_DATA';
export const PILL_EXPIRED = 'PILL_EXPIRED';
export const INVALID_TARGET = 'INVALID_TARGET';
export const INVALID_TOOL_NAME = 'INVALID_TOOL_NAME';
export const INVALID_HANDLER = 'INVALID_HANDLER';
export const UNKNOWN_TOOL = 'UNKNOWN_TOOL';
export const TOOL_EXECUTION_ERROR = 'TOOL_EXECUTION_ERROR';
export const INVALID_EVENT_NAME = 'INVALID_EVENT_NAME';
export const EVENT_NOT_REGISTERED = 'EVENT_NOT_REGISTERED';
export const HANDLER_NOT_FOUND = 'HANDLER_NOT_FOUND';

const VALID_ORDERS = ['asc', 'desc'];

export class CultivationPillInventory {
    constructor(config = {}) {
        this.config = {
            maxPillsPerOwner: config.maxPillsPerOwner !== undefined ? config.maxPillsPerOwner : DEFAULT_MAX_PILLS_PER_OWNER,
            expiryCheckInterval: config.expiryCheckInterval !== undefined ? config.expiryCheckInterval : 60000,
            defaultOwner: config.defaultOwner !== undefined ? config.defaultOwner : DEFAULT_OWNER,
            defaultPotency: config.defaultPotency !== undefined ? config.defaultPotency : DEFAULT_POTENCY,
            defaultDuration: config.defaultDuration !== undefined ? config.defaultDuration : DEFAULT_DURATION,
            defaultExpiryMs: config.defaultExpiryMs !== undefined ? config.defaultExpiryMs : DEFAULT_EXPIRY_MS,
            autoGenerateId: config.autoGenerateId !== undefined ? config.autoGenerateId : true,
            ...config,
        };
        this.pills = new Map();
        this.ownerIndex = new Map();
        this.qualityIndex = new Map();
        this.effectIndex = new Map();
        this.useLog = [];
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = {
            totalStored: 0,
            totalRetrieved: 0,
            totalUsed: 0,
            totalDiscarded: 0,
            evolutionCount: 0,
            byQuality: {
                mortal: 0, spirit: 0, earth: 0, heaven: 0, immortal: 0,
            },
            byEffect: {
                heal: 0, mp_restore: 0, exp_boost: 0, poison_resist: 0,
                attack_boost: 0, defense_boost: 0, speed_boost: 0, cultivation_boost: 0,
            },
        };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPill', (ctx) => this.getPill(ctx.pillId));
        this.registerTool('listByQuality', (ctx) => this.listByQuality(ctx.quality));
        this.registerTool('listByOwner', (ctx) => this.listByOwner(ctx.owner));
        this.registerTool('listByEffect', (ctx) => this.listByEffect(ctx.effect));
        this.registerTool('usePill', (ctx) => this.usePill(ctx.pillId, ctx.target));
        this.registerTool('discardExpired', () => this.discardExpired());
    }

    _genId() {
        return `pill_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    _ensureOwnerIndex(owner) {
        if (!this.ownerIndex.has(owner)) {
            this.ownerIndex.set(owner, []);
        }
        return this.ownerIndex.get(owner);
    }

    _ensureQualityIndex(quality) {
        if (!this.qualityIndex.has(quality)) {
            this.qualityIndex.set(quality, []);
        }
        return this.qualityIndex.get(quality);
    }

    _ensureEffectIndex(effect) {
        if (!this.effectIndex.has(effect)) {
            this.effectIndex.set(effect, []);
        }
        return this.effectIndex.get(effect);
    }

    _clonePill(pill) {
        return {
            ...pill,
            effects: Array.isArray(pill.effects) ? [...pill.effects] : [],
        };
    }

    _normalizeEffects(effects) {
        if (!Array.isArray(effects)) return [];
        const out = [];
        const seen = new Set();
        for (const e of effects) {
            if (typeof e === 'string' && PILL_EFFECT_TYPES.includes(e) && !seen.has(e)) {
                seen.add(e);
                out.push(e);
            }
        }
        return out;
    }

    _isValidPill(obj) {
        if (!obj || typeof obj !== 'object') return false;
        if (typeof obj.pillName !== 'string' || obj.pillName.length === 0) return false;
        return true;
    }

    _isExpired(pill, now) {
        const t = now !== undefined ? now : Date.now();
        if (pill.expiresAt === undefined || pill.expiresAt === null) return false;
        return pill.expiresAt <= t;
    }

    storePill(pill) {
        if (!this._isValidPill(pill)) {
            return { success: false, error: INVALID_PILL };
        }
        const quality = pill.quality;
        if (!PILL_QUALITIES[quality]) {
            return { success: false, error: INVALID_QUALITY };
        }
        const effects = this._normalizeEffects(pill.effects);
        if (pill.effects !== undefined && !Array.isArray(pill.effects)) {
            return { success: false, error: INVALID_EFFECT };
        }
        const owner = pill.owner !== undefined ? pill.owner : this.config.defaultOwner;
        if (typeof owner !== 'string' || owner.length === 0) {
            return { success: false, error: INVALID_OWNER };
        }
        const ownerList = this._ensureOwnerIndex(owner);
        if (ownerList.length >= this.config.maxPillsPerOwner) {
            return { success: false, error: INVENTORY_FULL };
        }

        const id = (pill.id !== undefined && pill.id !== null && pill.id !== '')
            ? pill.id
            : (this.config.autoGenerateId ? this._genId() : null);
        if (!id) {
            return { success: false, error: INVALID_PILL };
        }
        if (this.pills.has(id)) {
            return { success: false, error: DUPLICATE_ID };
        }

        const potency = pill.potency !== undefined ? pill.potency : this.config.defaultPotency;
        const duration = pill.duration !== undefined ? pill.duration : this.config.defaultDuration;
        const storedAt = Date.now();
        const expiresAt = pill.expiresAt !== undefined
            ? pill.expiresAt
            : storedAt + this.config.defaultExpiryMs;

        const stored = {
            id,
            pillName: pill.pillName,
            quality,
            effects,
            potency,
            duration,
            expiresAt,
            storedAt,
            owner,
        };

        this.pills.set(id, stored);
        ownerList.push(id);
        this._ensureQualityIndex(quality).push(id);
        for (const eff of effects) {
            this._ensureEffectIndex(eff).push(id);
        }

        this.stats.totalStored += 1;
        this.stats.byQuality[quality] = (this.stats.byQuality[quality] || 0) + 1;
        for (const eff of effects) {
            this.stats.byEffect[eff] = (this.stats.byEffect[eff] || 0) + 1;
        }

        this._triggerHook('onStore', { pill: this._clonePill(stored) });
        return { success: true, pill: this._clonePill(stored) };
    }

    retrievePill(pillId, requester) {
        if (typeof pillId !== 'string' || pillId.length === 0) {
            return { success: false, error: INVALID_PILL };
        }
        if (typeof requester !== 'string' || requester.length === 0) {
            return { success: false, error: INVALID_OWNER };
        }
        if (!this.pills.has(pillId)) {
            return { success: false, error: PILL_NOT_FOUND };
        }
        const pill = this.pills.get(pillId);
        if (pill.owner !== requester) {
            return { success: false, error: NOT_OWNER };
        }

        this.pills.delete(pillId);
        const ownerList = this.ownerIndex.get(pill.owner);
        if (ownerList) {
            const idx = ownerList.indexOf(pillId);
            if (idx !== -1) ownerList.splice(idx, 1);
        }
        const qualList = this.qualityIndex.get(pill.quality);
        if (qualList) {
            const idx = qualList.indexOf(pillId);
            if (idx !== -1) qualList.splice(idx, 1);
        }
        for (const eff of pill.effects) {
            const list = this.effectIndex.get(eff);
            if (list) {
                const idx = list.indexOf(pillId);
                if (idx !== -1) list.splice(idx, 1);
            }
        }

        this.stats.totalRetrieved += 1;
        this._triggerHook('onRetrieve', { pill: this._clonePill(pill), requester });
        return { success: true, pill: this._clonePill(pill) };
    }

    listByQuality(quality) {
        if (!PILL_QUALITIES[quality]) return [];
        const ids = this.qualityIndex.get(quality) || [];
        return ids
            .map(id => this.pills.get(id))
            .filter(p => p !== undefined)
            .map(p => this._clonePill(p));
    }

    listByOwner(owner) {
        if (typeof owner !== 'string' || owner.length === 0) return [];
        const ids = this.ownerIndex.get(owner) || [];
        return ids
            .map(id => this.pills.get(id))
            .filter(p => p !== undefined)
            .map(p => this._clonePill(p));
    }

    listByEffect(effect) {
        if (typeof effect !== 'string' || !PILL_EFFECT_TYPES.includes(effect)) return [];
        const ids = this.effectIndex.get(effect) || [];
        return ids
            .map(id => this.pills.get(id))
            .filter(p => p !== undefined)
            .map(p => this._clonePill(p));
    }

    sortByPotency(order) {
        const normalizedOrder = (order !== undefined && order !== null) ? order : 'asc';
        if (!VALID_ORDERS.includes(normalizedOrder)) {
            return { success: false, error: 'INVALID_ORDER' };
        }

        const all = Array.from(this.pills.values()).map(p => this._clonePill(p));
        const dir = normalizedOrder === 'desc' ? -1 : 1;
        all.sort((a, b) => {
            const av = a.potency !== undefined ? a.potency : 0;
            const bv = b.potency !== undefined ? b.potency : 0;
            if (av === bv) return 0;
            return av < bv ? -1 * dir : 1 * dir;
        });
        this._triggerHook('onSort', { attribute: 'potency', order: normalizedOrder, count: all.length });
        return { success: true, pills: all, order: normalizedOrder };
    }

    usePill(pillId, target) {
        if (typeof pillId !== 'string' || pillId.length === 0) {
            return { success: false, error: INVALID_PILL };
        }
        if (!this.pills.has(pillId)) {
            return { success: false, error: PILL_NOT_FOUND };
        }
        const pill = this.pills.get(pillId);
        if (!target || typeof target !== 'object') {
            return { success: false, error: INVALID_TARGET };
        }
        if (this._isExpired(pill)) {
            return { success: false, error: PILL_EXPIRED };
        }

        // Apply effects to target
        const appliedEffects = [];
        for (const eff of pill.effects) {
            appliedEffects.push({
                effect: eff,
                potency: pill.potency,
                duration: pill.duration,
            });
        }
        if (!target._appliedEffects) {
            target._appliedEffects = [];
        }
        for (const ae of appliedEffects) {
            target._appliedEffects.push(ae);
        }

        this.useLog.push({
            pillId,
            pillName: pill.pillName,
            target: target.id || target.name || 'unknown',
            effects: [...pill.effects],
            potency: pill.potency,
            usedAt: Date.now(),
        });

        // Remove pill from inventory
        this.pills.delete(pillId);
        const ownerList = this.ownerIndex.get(pill.owner);
        if (ownerList) {
            const idx = ownerList.indexOf(pillId);
            if (idx !== -1) ownerList.splice(idx, 1);
        }
        const qualList = this.qualityIndex.get(pill.quality);
        if (qualList) {
            const idx = qualList.indexOf(pillId);
            if (idx !== -1) qualList.splice(idx, 1);
        }
        for (const eff of pill.effects) {
            const list = this.effectIndex.get(eff);
            if (list) {
                const idx = list.indexOf(pillId);
                if (idx !== -1) list.splice(idx, 1);
            }
        }

        this.stats.totalUsed += 1;
        this.stats.byQuality[pill.quality] = Math.max(0, (this.stats.byQuality[pill.quality] || 0) - 1);
        for (const eff of pill.effects) {
            this.stats.byEffect[eff] = Math.max(0, (this.stats.byEffect[eff] || 0) - 1);
        }

        this._triggerHook('onUse', { pillId, target, appliedEffects });
        return { success: true, appliedEffects, pillName: pill.pillName };
    }

    discardExpired() {
        const now = Date.now();
        const discarded = [];
        const toRemove = [];
        for (const [id, pill] of this.pills.entries()) {
            if (this._isExpired(pill, now)) {
                toRemove.push(id);
            }
        }
        for (const id of toRemove) {
            const pill = this.pills.get(id);
            discarded.push(this._clonePill(pill));
            this.pills.delete(id);
            const ownerList = this.ownerIndex.get(pill.owner);
            if (ownerList) {
                const idx = ownerList.indexOf(id);
                if (idx !== -1) ownerList.splice(idx, 1);
            }
            const qualList = this.qualityIndex.get(pill.quality);
            if (qualList) {
                const idx = qualList.indexOf(id);
                if (idx !== -1) qualList.splice(idx, 1);
            }
            for (const eff of pill.effects) {
                const list = this.effectIndex.get(eff);
                if (list) {
                    const idx = list.indexOf(id);
                    if (idx !== -1) list.splice(idx, 1);
                }
            }
            this.stats.byQuality[pill.quality] = Math.max(0, (this.stats.byQuality[pill.quality] || 0) - 1);
            for (const eff of pill.effects) {
                this.stats.byEffect[eff] = Math.max(0, (this.stats.byEffect[eff] || 0) - 1);
            }
            this.stats.totalDiscarded += 1;
        }
        this._triggerHook('onDiscardExpired', { count: discarded.length, pills: discarded });
        return { success: true, discarded, count: discarded.length };
    }

    getPill(pillId) {
        if (typeof pillId !== 'string' || pillId.length === 0) return null;
        if (!this.pills.has(pillId)) return null;
        return this._clonePill(this.pills.get(pillId));
    }

    getUseLog() {
        return this.useLog.map(u => ({ ...u, effects: [...(u.effects || [])] }));
    }

    listAll() {
        return Array.from(this.pills.values()).map(p => this._clonePill(p));
    }

    listQualities() {
        return [...PILL_QUALITY_KEYS];
    }

    listEffectTypes() {
        return [...PILL_EFFECT_TYPES];
    }

    listOwners() {
        return Array.from(this.ownerIndex.keys());
    }

    getInventoryStats() {
        const byQuality = {};
        for (const k of PILL_QUALITY_KEYS) byQuality[k] = 0;
        for (const p of this.pills.values()) {
            byQuality[p.quality] = (byQuality[p.quality] || 0) + 1;
        }
        const byEffect = {};
        for (const k of PILL_EFFECT_TYPES) byEffect[k] = 0;
        for (const p of this.pills.values()) {
            for (const eff of p.effects) {
                byEffect[eff] = (byEffect[eff] || 0) + 1;
            }
        }
        const byOwner = {};
        for (const p of this.pills.values()) {
            byOwner[p.owner] = (byOwner[p.owner] || 0) + 1;
        }
        return {
            totalPills: this.pills.size,
            maxPerOwner: this.config.maxPillsPerOwner,
            totalOwners: this.ownerIndex.size,
            byQuality,
            byEffect,
            byOwner,
            totalUsed: this.useLog.length,
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
                // silent
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

    toJSON() {
        return {
            config: { ...this.config },
            pills: Array.from(this.pills.entries()),
            ownerIndex: Array.from(this.ownerIndex.entries()),
            qualityIndex: Array.from(this.qualityIndex.entries()),
            effectIndex: Array.from(this.effectIndex.entries()),
            useLog: this.useLog.map(u => ({ ...u, effects: [...(u.effects || [])] })),
            stats: { ...this.stats },
        };
    }

    fromJSON(data) {
        if (!data || typeof data !== 'object') return { success: false, error: INVALID_DATA };
        if (data.config) {
            this.config = { ...this.config, ...data.config };
        }
        if (data.pills && Array.isArray(data.pills)) {
            this.pills = new Map(data.pills);
        }
        if (data.ownerIndex && Array.isArray(data.ownerIndex)) {
            this.ownerIndex = new Map(data.ownerIndex);
        }
        if (data.qualityIndex && Array.isArray(data.qualityIndex)) {
            this.qualityIndex = new Map(data.qualityIndex);
        }
        if (data.effectIndex && Array.isArray(data.effectIndex)) {
            this.effectIndex = new Map(data.effectIndex);
        }
        if (data.useLog && Array.isArray(data.useLog)) {
            this.useLog = data.useLog.map(u => ({ ...u, effects: [...(u.effects || [])] }));
        }
        if (data.stats) {
            this.stats = { ...this.stats, ...data.stats };
        }
        return { success: true };
    }

    getStats() {
        return {
            ...this.stats,
            totalPills: this.pills.size,
            totalOwners: this.ownerIndex.size,
            totalUseLog: this.useLog.length,
        };
    }

    autoEvolve() {
        this.stats.evolutionCount += 1;
        this._triggerHook('onEvolve', { stats: this.stats });
        return { success: true, evolutionCount: this.stats.evolutionCount };
    }

    reset() {
        this.pills.clear();
        this.ownerIndex.clear();
        this.qualityIndex.clear();
        this.effectIndex.clear();
        this.useLog = [];
        this.hooks.clear();
        this.stats = {
            totalStored: 0,
            totalRetrieved: 0,
            totalUsed: 0,
            totalDiscarded: 0,
            evolutionCount: 0,
            byQuality: {
                mortal: 0, spirit: 0, earth: 0, heaven: 0, immortal: 0,
            },
            byEffect: {
                heal: 0, mp_restore: 0, exp_boost: 0, poison_resist: 0,
                attack_boost: 0, defense_boost: 0, speed_boost: 0, cultivation_boost: 0,
            },
        };
        this._registerDefaultTools();
        return { success: true };
    }
}