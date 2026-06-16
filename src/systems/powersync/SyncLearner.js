/**
 * SyncLearner.js - 学习器
 * V1182 Round 44 Iter 25/30 Direction A PowerSync Federation (chatdev)
 * 灵感: chatdev learner - 同步模式统计 + 热点识别 + 优化建议
 */

export const LEARNER_OPS = ['read', 'write', 'sync', 'merge', 'delete'];
export const RECOMMENDATION_KINDS = ['cache', 'batch', 'compress', 'throttle', 'observe'];

export class SyncLearner {
    constructor(config = {}) {
        this.config = {
            hotKeyThreshold: 10,
            windowSize: 100,
            latencyThreshold: 500,
            ...config,
        };
        this.events = [];      // ring buffer of last `windowSize` events
        this.totalObserved = 0;
        this.hooks = new Map();
        this.stats = { observed: 0, recommendations: 0, hotKeys: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }

    // ---- observation ----
    observe(event) {
        if (!event || typeof event !== 'object') return false;
        const e = {
            key: event.key || '<unknown>',
            op: event.op || 'read',
            ts: typeof event.ts === 'number' ? event.ts : Date.now(),
            latency: typeof event.latency === 'number' ? event.latency : 0,
        };
        this.events.push(e);
        this.totalObserved++;
        this.stats.observed++;
        // trim to windowSize
        if (this.events.length > this.config.windowSize) {
            this.events.splice(0, this.events.length - this.config.windowSize);
        }
        this._emit('observed', e);
        return true;
    }

    // ---- patterns ----
    getPatterns() {
        const byKey = new Map();
        const byOp = new Map();
        const byLatencyBucket = new Map();
        for (const e of this.events) {
            byKey.set(e.key, (byKey.get(e.key) || 0) + 1);
            byOp.set(e.op, (byOp.get(e.op) || 0) + 1);
            const bucket = this._bucket(e.latency);
            byLatencyBucket.set(bucket, (byLatencyBucket.get(bucket) || 0) + 1);
        }
        return { byKey, byOp, byLatencyBucket };
    }

    _bucket(ms) {
        if (ms < 50) return 'fast';
        if (ms < 200) return 'normal';
        if (ms < this.config.latencyThreshold) return 'slow';
        return 'very_slow';
    }

    // ---- hot keys ----
    getHotKeys() {
        const { byKey } = this.getPatterns();
        const hot = [];
        for (const [key, count] of byKey.entries()) {
            if (count >= this.config.hotKeyThreshold) hot.push({ key, count });
        }
        hot.sort((a, b) => b.count - a.count);
        this.stats.hotKeys = hot.length;
        return hot;
    }

    // ---- recommendations ----
    getRecommendations() {
        const recs = [];
        const { byKey, byOp, byLatencyBucket } = this.getPatterns();
        // cache hot keys
        for (const { key } of this.getHotKeys()) {
            recs.push({ kind: 'cache', target: key, reason: 'high_frequency' });
        }
        // batch suggestions for write-heavy workloads
        const writeCount = byOp.get('write') || 0;
        let total = 0;
        for (const v of byOp.values()) total += v;
        if (total > 0 && writeCount / total > 0.5) {
            recs.push({ kind: 'batch', target: 'writes', reason: 'write_heavy' });
        }
        // compress slow keys
        const slowKeys = [];
        for (const e of this.events) {
            if (e.latency >= this.config.latencyThreshold) slowKeys.push(e.key);
        }
        if (slowKeys.length > 0) {
            // pick first unique key
            const seen = new Set();
            for (const k of slowKeys) {
                if (!seen.has(k)) { seen.add(k); recs.push({ kind: 'compress', target: k, reason: 'high_latency' }); }
            }
        }
        // throttle if many 'very_slow'
        const verySlow = byLatencyBucket.get('very_slow') || 0;
        if (this.events.length > 0 && verySlow / this.events.length > 0.3) {
            recs.push({ kind: 'throttle', target: '<system>', reason: 'high_very_slow_ratio' });
        }
        // observe sparse keys
        for (const [key, count] of byKey.entries()) {
            if (count === 1) {
                recs.push({ kind: 'observe', target: key, reason: 'single_observation' });
            }
        }
        this.stats.recommendations = recs.length;
        return recs;
    }

    // ---- stats ----
    getStats() {
        const { byKey } = this.getPatterns();
        return {
            ...this.stats,
            total: this.totalObserved,
            window: this.events.length,
            unique: byKey.size,
            hot: this.stats.hotKeys,
            hotThreshold: this.config.hotKeyThreshold,
        };
    }

    // ---- queries / config ----
    listEvents() { return this.events.slice(); }
    listOps() { return LEARNER_OPS.slice(); }
    setHotKeyThreshold(t) {
        if (typeof t !== 'number' || t <= 0) return false;
        this.config.hotKeyThreshold = t;
        return true;
    }
    setWindowSize(n) {
        if (typeof n !== 'number' || n <= 0) return false;
        this.config.windowSize = n;
        if (this.events.length > n) {
            this.events.splice(0, this.events.length - n);
        }
        return true;
    }
    setLatencyThreshold(ms) {
        if (typeof ms !== 'number' || ms < 0) return false;
        this.config.latencyThreshold = ms;
        return true;
    }
    reset() {
        this.events = [];
        this.totalObserved = 0;
        this.stats = { observed: 0, recommendations: 0, hotKeys: 0 };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.SyncLearner = SyncLearner;
    globalThis.LEARNER_OPS = LEARNER_OPS;
    globalThis.RECOMMENDATION_KINDS = RECOMMENDATION_KINDS;
}
