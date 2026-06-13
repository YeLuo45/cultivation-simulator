/**
 * PlayerBehaviorCollector.js - 玩家行为数据收集器
 * V948 P-20260614-001 Iteration 1/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (thunderbolt pipeline + feedback loops):
 * - 收集玩家每次操作 (kind/target/result/timestamp)
 * - 按 playerId 索引
 * - 支持 hook 生命周期 (collected/filtered/exported)
 * - 提供综合分析报告
 */

export const BEHAVIOR_KINDS = ['cultivate', 'combat', 'trade', 'social', 'explore', 'craft'];
export const RESULT_TIERS = ['failure', 'partial', 'normal', 'critical', 'legendary'];

export const DEFAULT_MAX_EVENTS = 1000;
export const DEFAULT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;  // 30 days

export class PlayerBehaviorCollector {
    constructor(config = {}) {
        this.config = {
            maxEvents: config.maxEvents !== undefined ? config.maxEvents : DEFAULT_MAX_EVENTS,
            retentionMs: config.retentionMs !== undefined ? config.retentionMs : DEFAULT_RETENTION_MS,
            autoPrune: config.autoPrune !== undefined ? config.autoPrune : true,
            ...config,
        };
        this.events = new Map();        // eventId -> event
        this.playerEvents = new Map();  // playerId -> Set<eventId>
        this.hooks = new Map();         // event -> listener[]
        this.stats = {
            totalCollected: 0,
            totalPruned: 0,
            totalFiltered: 0,
            totalExported: 0,
        };
    }

    _emit(event, payload) {
        const listeners = this.hooks.get(event) || [];
        for (const l of listeners) {
            try { l(payload); } catch { /* ignore */ }
        }
    }

    registerHook(event, listener) {
        if (!this.hooks.has(event)) this.hooks.set(event, []);
        this.hooks.get(event).push(listener);
    }

    _pruneExpired(now = Date.now()) {
        if (!this.config.autoPrune) return 0;
        let pruned = 0;
        for (const [eid, e] of this.events) {
            if (now - e.timestamp > this.config.retentionMs) {
                this.events.delete(eid);
                const set = this.playerEvents.get(e.playerId);
                if (set) set.delete(eid);
                pruned++;
            }
        }
        this.stats.totalPruned += pruned;
        return pruned;
    }

    _pruneOverCapacity() {
        if (this.events.size <= this.config.maxEvents) return 0;
        const sorted = [...this.events.values()].sort((a, b) => a.timestamp - b.timestamp);
        const toRemove = this.events.size - this.config.maxEvents;
        let pruned = 0;
        for (let i = 0; i < toRemove; i++) {
            const e = sorted[i];
            this.events.delete(e.id);
            const set = this.playerEvents.get(e.playerId);
            if (set) set.delete(e.id);
            pruned++;
        }
        this.stats.totalPruned += pruned;
        return pruned;
    }

    collect(playerId, kind, target, result = 'normal', meta = {}) {
        if (!playerId || !BEHAVIOR_KINDS.includes(kind)) return null;
        if (!RESULT_TIERS.includes(result)) return null;
        const event = {
            id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            playerId,
            kind,
            target: target || 'unknown',
            result,
            meta,
            timestamp: Date.now(),
        };
        this.events.set(event.id, event);
        if (!this.playerEvents.has(playerId)) this.playerEvents.set(playerId, new Set());
        this.playerEvents.get(playerId).add(event.id);
        this.stats.totalCollected++;
        this._pruneOverCapacity();
        this._emit('collected', event);
        return event;
    }

    filterByPlayer(playerId) {
        const set = this.playerEvents.get(playerId);
        if (!set) return [];
        this.stats.totalFiltered++;
        return [...set].map(id => this.events.get(id)).filter(Boolean);
    }

    filterByKind(playerId, kind) {
        return this.filterByPlayer(playerId).filter(e => e.kind === kind);
    }

    getEvent(eventId) {
        return this.events.get(eventId) || null;
    }

    countByKind(playerId) {
        const counts = {};
        for (const k of BEHAVIOR_KINDS) counts[k] = 0;
        for (const e of this.filterByPlayer(playerId)) counts[e.kind] = (counts[e.kind] || 0) + 1;
        return counts;
    }

    report(playerId) {
        const evts = this.filterByPlayer(playerId);
        const totalEvents = evts.length;
        const resultDist = {};
        for (const r of RESULT_TIERS) resultDist[r] = 0;
        let earliest = null;
        let latest = null;
        for (const e of evts) {
            resultDist[e.result] = (resultDist[e.result] || 0) + 1;
            if (earliest === null || e.timestamp < earliest) earliest = e.timestamp;
            if (latest === null || e.timestamp > latest) latest = e.timestamp;
        }
        return {
            playerId,
            totalEvents,
            kindCounts: this.countByKind(playerId),
            resultDist,
            spanMs: totalEvents > 0 ? latest - earliest : 0,
            earliest,
            latest,
        };
    }

    export(playerId) {
        this.stats.totalExported++;
        return this.filterByPlayer(playerId);
    }

    reset() {
        this.events.clear();
        this.playerEvents.clear();
        this.stats = { totalCollected: 0, totalPruned: 0, totalFiltered: 0, totalExported: 0 };
    }

    prune() {
        const n = this._pruneExpired();
        return { pruned: n, remaining: this.events.size };
    }
}
