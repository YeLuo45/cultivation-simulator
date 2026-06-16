/**
 * ConflictAdvisor.js - 冲突建议 Agent
 * V1179 Round 44 Iter 22/30 Direction A PowerSync Federation (chatdev)
 * 灵感: chatdev advisor 启发式分析 + confidence 评分 + 决策学习历史
 */

export const ADVISOR_STRATEGIES = ['lww', 'merge', 'custom', 'manual'];
export const CONFLICT_KINDS = ['identical', 'diverged', 'remote_only', 'local_only', 'both_new'];

/**
 * conflict: { localValue, remoteValue, baseValue, localTs, remoteTs }
 * local:    { value, ts }  | null
 * remote:   { value, ts }  | null
 * base:     { value, ts }  | null
 */
export class ConflictAdvisor {
    constructor(config = {}) {
        this.config = {
            lwwThreshold: 0.5,
            minConfidence: 0.6,
            mergeConfidence: 0.7,
            ...config,
        };
        this.history = [];   // { conflict, decision, ts }
        this.hooks = new Map();
        this.stats = { analyzed: 0, recommended: 0, recorded: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }

    // ---- helpers ----
    _normalize(c) {
        if (!c) return { local: null, remote: null, base: null };
        const localVal = c.localValue !== undefined ? c.localValue : (c.local ? c.local.value : undefined);
        const remoteVal = c.remoteValue !== undefined ? c.remoteValue : (c.remote ? c.remote.value : undefined);
        const baseVal = c.baseValue !== undefined ? c.baseValue : (c.base ? c.base.value : undefined);
        const localTs = c.localTs !== undefined ? c.localTs : (c.local ? (c.local.ts || 0) : 0);
        const remoteTs = c.remoteTs !== undefined ? c.remoteTs : (c.remote ? (c.remote.ts || 0) : 0);
        const baseTs = c.baseTs !== undefined ? c.baseTs : (c.base ? (c.base.ts || 0) : 0);
        return {
            local: localVal !== undefined ? { value: localVal, ts: localTs } : null,
            remote: remoteVal !== undefined ? { value: remoteVal, ts: remoteTs } : null,
            base: baseVal !== undefined ? { value: baseVal, ts: baseTs } : null,
        };
    }

    _classify(local, remote, base) {
        if (local && remote && local.value === remote.value) return 'identical';
        if (!local && !remote) return 'identical';
        if (local && !remote) return 'local_only';
        if (!local && remote) return 'remote_only';
        if (local && remote && base) {
            const localChanged = local.value !== base.value;
            const remoteChanged = remote.value !== base.value;
            if (localChanged && remoteChanged) return 'both_new';
            if (localChanged) return 'local_only';
            if (remoteChanged) return 'remote_only';
            return 'identical';
        }
        return 'diverged';
    }

    _tsDiff(local, remote) {
        if (!local || !remote) return 0;
        return local.ts - remote.ts;
    }

    // ---- core API ----
    analyze(local, remote, base = null) {
        this.stats.analyzed++;
        const L = (local && (local.value !== undefined ? { value: local.value, ts: local.ts || 0 } : local)) || null;
        const R = (remote && (remote.value !== undefined ? { value: remote.value, ts: remote.ts || 0 } : remote)) || null;
        const B = base ? (base.value !== undefined ? { value: base.value, ts: base.ts || 0 } : base) : null;

        const kind = this._classify(L, R, B);
        const result = this._decide(kind, L, R, B);
        this._emit('analyzed', { kind, ...result });
        return { kind, ...result };
    }

    _decide(kind, L, R, B) {
        if (kind === 'identical') {
            return { strategy: 'lww', confidence: 1.0, reason: 'values_identical', winner: L || R || B };
        }
        if (kind === 'local_only') {
            return { strategy: 'lww', confidence: 0.9, reason: 'remote_missing_take_local', winner: L };
        }
        if (kind === 'remote_only') {
            return { strategy: 'lww', confidence: 0.9, reason: 'local_missing_take_remote', winner: R };
        }
        // diverged / both_new
        const lt = (L && L.ts) || 0;
        const rt = (R && R.ts) || 0;
        const tsGap = Math.abs(lt - rt);
        const bothValuesPrimitive = L && R && this._isPrimitive(L.value) && this._isPrimitive(R.value) && typeof L.value === typeof R.value;
        if (bothValuesPrimitive && tsGap < 100) {
            // recent conflict on primitives - suggest manual review
            return { strategy: 'manual', confidence: 0.55, reason: 'concurrent_primitives_close_in_time' };
        }
        if (lt === rt) {
            return { strategy: 'manual', confidence: 0.5, reason: 'same_timestamp_needs_review' };
        }
        if (lt > rt) {
            const conf = this._lwwConfidence(lt - rt);
            return { strategy: 'lww', confidence: conf, reason: 'local_newer', winner: L };
        }
        const conf = this._lwwConfidence(rt - lt);
        return { strategy: 'lww', confidence: conf, reason: 'remote_newer', winner: R };
    }

    _isPrimitive(v) {
        return v === null || v === undefined || typeof v !== 'object';
    }

    _lwwConfidence(tsGap) {
        // tsGap larger -> higher confidence
        const base = this.config.lwwThreshold;
        const bonus = Math.min(0.4, tsGap / 10000);
        return Math.min(1.0, base + bonus);
    }

    // ---- recommendation ----
    recommendStrategy(conflict) {
        this.stats.recommended++;
        const norm = this._normalize(conflict);
        const r = this._decide(this._classify(norm.local, norm.remote, norm.base), norm.local, norm.remote, norm.base);
        if (r.confidence < this.config.minConfidence) {
            const fallback = { strategy: 'manual', confidence: r.confidence, reason: r.reason + '_low_confidence' };
            this._emit('recommended', fallback);
            return fallback;
        }
        if (r.strategy === 'lww' && norm.base) {
            // if base exists, also consider merge
            return { strategy: 'merge', confidence: this.config.mergeConfidence, reason: 'base_available_consider_merge' };
        }
        this._emit('recommended', r);
        return r;
    }

    // ---- learning history ----
    recordDecision(conflict, decision) {
        const entry = {
            conflict: this._normalize(conflict),
            decision: decision || null,
            ts: Date.now(),
        };
        this.history.push(entry);
        this.stats.recorded++;
        this._emit('recorded', { strategy: decision && decision.strategy, ts: entry.ts });
        return entry;
    }

    getHistory() { return this.history.slice(); }
    clearHistory() {
        const n = this.history.length;
        this.history = [];
        return n;
    }

    getStats() {
        return {
            ...this.stats,
            historySize: this.history.length,
            minConfidence: this.config.minConfidence,
            lwwThreshold: this.config.lwwThreshold,
        };
    }

    setLwwThreshold(t) {
        if (typeof t !== 'number' || t < 0 || t > 1) return false;
        this.config.lwwThreshold = t;
        return true;
    }
    setMinConfidence(t) {
        if (typeof t !== 'number' || t < 0 || t > 1) return false;
        this.config.minConfidence = t;
        return true;
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.ConflictAdvisor = ConflictAdvisor;
    globalThis.ADVISOR_STRATEGIES = ADVISOR_STRATEGIES;
    globalThis.CONFLICT_KINDS = CONFLICT_KINDS;
}
