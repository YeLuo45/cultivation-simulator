/**
 * ConflictReflector.js - 冲突反思器
 * V1183 Round 45 Iter 27/30 Direction A PowerSync Federation (chatdev)
 * 灵感: generic-agent reflector - 冲突率分析 + 根因溯源 + 改进方案
 */

export const ROOT_CAUSE_HYPOTHESES = ['frequent_update', 'divergent_base', 'clock_skew'];
export const FIX_KINDS = ['use_lww', 'enable_crdt', 'add_vector_clock', 'throttle_updates'];
export const CONFLICT_TYPES = ['write_write', 'update_update', 'delete_update', 'stale_read'];

export class ConflictReflector {
    constructor(config = {}) {
        this.config = { windowMs: 60000, hotKeyThreshold: 5, ...config };
        this.conflicts = []; // { key, type, ts }
        this.hooks = new Map();
        this.stats = { recorded: 0, hotspots: 0, rootCauses: 0, fixes: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }

    // ---- recording ----
    recordConflict(conflict) {
        if (!conflict || typeof conflict !== 'object') return false;
        const c = {
            key: typeof conflict.key === 'string' ? conflict.key : '<unknown>',
            type: conflict.type || 'write_write',
            ts: typeof conflict.ts === 'number' ? conflict.ts : Date.now(),
        };
        this.conflicts.push(c);
        this.stats.recorded++;
        this._emit('recorded', c);
        return true;
    }

    recordBatch(conflicts) {
        if (!Array.isArray(conflicts)) return 0;
        let n = 0;
        for (const c of conflicts) { if (this.recordConflict(c)) n++; }
        return n;
    }

    _purgeWindow(now = Date.now()) {
        const cutoff = now - this.config.windowMs;
        this.conflicts = this.conflicts.filter((c) => c.ts >= cutoff);
    }

    // ---- analyze ----
    analyze() {
        this._purgeWindow();
        const byKey = new Map();
        const byType = new Map();
        for (const c of this.conflicts) {
            byKey.set(c.key, (byKey.get(c.key) || 0) + 1);
            byType.set(c.type, (byType.get(c.type) || 0) + 1);
        }
        const total = this.conflicts.length;
        const rate = this.config.windowMs > 0 ? total / (this.config.windowMs / 1000) : 0;

        // hotspots: keys >= threshold
        const hotspots = [];
        for (const [key, count] of byKey.entries()) {
            if (count >= this.config.hotKeyThreshold) {
                hotspots.push({ key, count, ratio: total > 0 ? count / total : 0 });
            }
        }
        hotspots.sort((a, b) => b.count - a.count);
        this.stats.hotspots = hotspots.length;

        // root causes + fixes per hotspot
        const rootCauses = {};
        const fixes = {};
        for (const h of hotspots) {
            rootCauses[h.key] = this.getRootCause(h.key);
            fixes[h.key] = this.suggestFix(h.key);
        }
        this.stats.rootCauses = Object.keys(rootCauses).length;
        this.stats.fixes = Object.keys(fixes).length;

        return {
            rate,
            total,
            hotspots,
            rootCauses,
            fixes,
            byType: Object.fromEntries(byType),
            byKey: Object.fromEntries(byKey),
        };
    }

    // ---- queries ----
    getConflictsByKey(key) {
        return this.conflicts.filter((c) => c.key === key);
    }

    countByKey(key) {
        return this.getConflictsByKey(key).length;
    }

    getRootCause(key) {
        const conflicts = this.getConflictsByKey(key);
        if (conflicts.length === 0) return null;
        const types = new Set(conflicts.map((c) => c.type));
        // heuristic:
        //   - all same type  → frequent_update
        //   - many types & few conflicts → clock_skew
        //   - many types & many conflicts → divergent_base
        if (types.size === 1) return 'frequent_update';
        if (conflicts.length < 5) return 'clock_skew';
        return 'divergent_base';
    }

    suggestFix(key) {
        const cause = this.getRootCause(key);
        if (!cause) return null;
        switch (cause) {
            case 'frequent_update': return 'use_lww';
            case 'divergent_base':  return 'enable_crdt';
            case 'clock_skew':      return 'add_vector_clock';
            default:                return 'throttle_updates';
        }
    }

    listKeys() {
        const out = new Set();
        for (const c of this.conflicts) out.add(c.key);
        return Array.from(out);
    }

    listConflicts() { return this.conflicts.slice(); }

    setHotKeyThreshold(t) {
        if (typeof t !== 'number' || t <= 0) return false;
        this.config.hotKeyThreshold = t;
        return true;
    }

    setWindowMs(ms) {
        if (typeof ms !== 'number' || ms <= 0) return false;
        this.config.windowMs = ms;
        return true;
    }

    getStats() {
        return { ...this.stats, stored: this.conflicts.length, uniqueKeys: this.listKeys().length };
    }

    reset() {
        this.conflicts = [];
        this.stats = { recorded: 0, hotspots: 0, rootCauses: 0, fixes: 0 };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.ConflictReflector = ConflictReflector;
    globalThis.ROOT_CAUSE_HYPOTHESES = ROOT_CAUSE_HYPOTHESES;
    globalThis.FIX_KINDS = FIX_KINDS;
    globalThis.CONFLICT_TYPES = CONFLICT_TYPES;
}
