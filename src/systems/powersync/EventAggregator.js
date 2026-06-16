/**
 * EventAggregator.js - 事件批量聚合 (时间窗口/去重/去噪)
 * V1170 Round 44 Iter 13/30 Direction A PowerSync Federation (nanobot)
 * 灵感: nanobot mesh event bus batch flush + dedupe + throttling
 */

export const AGGREGATOR_STATES = ['idle', 'collecting', 'flushing'];

export class EventAggregator {
    constructor(config = {}) {
        this.config = {
            windowMs: 1000,
            maxBatch: 100,
            dedupeWindowMs: 500,
            minIntervalMs: 50,
            ...config,
        };
        this.state = 'idle';
        this.buffer = [];           // { id, event, ts }
        this.seen = new Map();       // eventId -> ts (for dedupe)
        this.lastEmitTs = new Map(); // eventId -> ts (for minInterval de-noise)
        this.lastFlush = 0;
        this.lastAdd = 0;
        this.hooks = new Map();
        this.stats = { added: 0, flushed: 0, deduped: 0, throttled: 0, autoFlush: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }
    _newId() { return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    size() { return this.buffer.length; }
    isFull() { return this.buffer.length >= this.config.maxBatch; }
    getState() { return this.state; }
    setWindow(ms) {
        if (typeof ms !== 'number' || ms <= 0) return false;
        this.config.windowMs = ms;
        return true;
    }
    setMaxBatch(n) {
        if (typeof n !== 'number' || n <= 0) return false;
        this.config.maxBatch = n;
        return true;
    }
    setMinInterval(ms) {
        if (typeof ms !== 'number' || ms < 0) return false;
        this.config.minIntervalMs = ms;
        return true;
    }
    getConfig() { return { ...this.config }; }

    _pruneSeen(now) {
        const cutoff = now - this.config.dedupeWindowMs;
        for (const [id, ts] of this.seen.entries()) {
            if (ts < cutoff) this.seen.delete(id);
        }
    }

    add(event, opts = {}) {
        const now = Date.now();
        this._pruneSeen(now);
        const id = (event && event.id) || opts.id || this._newId();
        // minInterval de-noise (per id) — check throttle FIRST so spam is throttled, not deduped
        if (this.config.minIntervalMs > 0) {
            const last = this.lastEmitTs.get(id);
            if (last && (now - last) < this.config.minIntervalMs) {
                this.stats.throttled++;
                this._emit('throttled', { id, event });
                return { added: false, reason: 'throttled' };
            }
        }
        // dedupe check
        if (this.seen.has(id) && opts.force !== true) {
            this.stats.deduped++;
            this._emit('deduped', { id, event });
            return { added: false, reason: 'duplicate' };
        }
        const entry = { id, event, ts: now };
        this.buffer.push(entry);
        this.seen.set(id, now);
        this.lastEmitTs.set(id, now);
        this.lastAdd = now;
        this.state = 'collecting';
        this.stats.added++;
        this._emit('added', entry);

        // auto-flush when maxBatch reached
        if (this.buffer.length >= this.config.maxBatch) {
            this.stats.autoFlush++;
            return { added: true, flushed: this.flush(), reason: 'auto' };
        }
        return { added: true, reason: 'buffered' };
    }

    flush() {
        if (this.buffer.length === 0) {
            this.state = 'idle';
            return [];
        }
        const batch = this.buffer.slice();
        this.buffer = [];
        this.lastFlush = Date.now();
        this.state = 'flushing';
        this.stats.flushed++;
        this._emit('flushed', { count: batch.length, events: batch });
        this.state = 'idle';
        return batch;
    }

    // test-friendly: check whether the window has expired and auto-flush if so
    tick(now = Date.now()) {
        if (this.buffer.length === 0) return [];
        const oldest = this.buffer[0];
        if (now - oldest.ts >= this.config.windowMs) {
            return this.flush();
        }
        return [];
    }

    // ---- queries ----
    listBuffer() { return this.buffer.slice(); }
    listSeen() { return Array.from(this.seen.keys()); }
    lastAddTs() { return this.lastAdd; }
    lastFlushTs() { return this.lastFlush; }
    clear() {
        this.buffer = [];
        this.seen.clear();
        this.lastEmitTs.clear();
        this.state = 'idle';
    }
    reset() { this.clear(); }
    getStats() {
        return {
            ...this.stats,
            size: this.buffer.length,
            seen: this.seen.size,
            maxBatch: this.config.maxBatch,
            windowMs: this.config.windowMs,
        };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.EventAggregator = EventAggregator;
    globalThis.AGGREGATOR_STATES = AGGREGATOR_STATES;
}
