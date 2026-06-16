/**
 * OfflineBuffer.js - 离线写前日志 (WAL) 缓冲
 * V1171 Round 44 Iter 14/30 Direction A PowerSync Federation (nanobot)
 * 灵感: nanobot offline write-ahead log + bounded buffer + batch flush
 */

export const BUFFER_STATES = ['empty', 'partial', 'full', 'draining'];

export class OfflineBuffer {
    constructor(config = {}) {
        this.config = {
            maxEntries: 1000,
            flushBatchSize: 50,
            ...config,
        };
        this.entries = [];         // ordered WAL: { id, payload, ts, attempts }
        this.byId = new Map();
        this.flushedHistory = [];  // { id, ts }
        this.state = 'empty';
        this.drained = 0;
        this.hooks = new Map();
        this.stats = { written: 0, flushed: 0, failed: 0, dropped: 0, retries: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }
    _newId() { return `wal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    size() { return this.entries.length; }
    capacity() { return { used: this.entries.length, total: this.config.maxEntries }; }
    isFull() { return this.entries.length >= this.config.maxEntries; }
    isEmpty() { return this.entries.length === 0; }
    getState() { return this.state; }

    write(payload, opts = {}) {
        if (this.isFull()) {
            this.stats.dropped++;
            this._emit('dropped', { reason: 'full', payload });
            return null;
        }
        const id = opts.id || this._newId();
        if (this.byId.has(id)) {
            this.stats.dropped++;
            this._emit('dropped', { reason: 'duplicate', id });
            return null;
        }
        const entry = { id, payload, ts: Date.now(), attempts: 0, lastError: null };
        this.entries.push(entry);
        this.byId.set(id, entry);
        this.stats.written++;
        this._updateState();
        this._emit('written', entry);
        return entry;
    }

    _updateState() {
        if (this.entries.length === 0) this.state = 'empty';
        else if (this.entries.length >= this.config.maxEntries) this.state = 'full';
        else this.state = 'partial';
    }

    peek(n = null) {
        if (n == null) return this.entries.slice();
        return this.entries.slice(0, n);
    }

    get(id) { return this.byId.get(id) || null; }
    listAll() { return this.entries.slice(); }

    async flush(writer, opts = {}) {
        if (typeof writer !== 'function') {
            this._emit('error', { reason: 'invalid_writer' });
            return { flushed: 0, failed: 0 };
        }
        if (this.entries.length === 0) return { flushed: 0, failed: 0 };
        this.state = 'draining';
        const batchSize = opts.batchSize || this.config.flushBatchSize;
        let flushed = 0;
        let failed = 0;
        // process in batches
        while (this.entries.length > 0) {
            const batch = this.entries.slice(0, batchSize);
            let batchAllOk = true;
            for (const entry of batch) {
                try {
                    const r = await writer(entry);
                    if (r === false) {
                        entry.attempts++;
                        entry.lastError = 'rejected';
                        this.stats.retries++;
                        batchAllOk = false;
                        failed++;
                        this._emit('flushFailed', { id: entry.id, reason: 'rejected' });
                    } else {
                        // success — remove from buffer
                        const idx = this.entries.findIndex(e => e.id === entry.id);
                        if (idx >= 0) this.entries.splice(idx, 1);
                        this.byId.delete(entry.id);
                        this.flushedHistory.push({ id: entry.id, ts: Date.now() });
                        this.drained++;
                        flushed++;
                        this.stats.flushed++;
                        this._emit('flushed', entry);
                    }
                } catch (e) {
                    entry.attempts++;
                    entry.lastError = e.message || String(e);
                    this.stats.retries++;
                    batchAllOk = false;
                    failed++;
                    this._emit('flushFailed', { id: entry.id, reason: entry.lastError });
                }
            }
            // if entire batch failed, stop to avoid infinite loop
            if (!batchAllOk) break;
        }
        this._updateState();
        return { flushed, failed };
    }

    remove(id) {
        const e = this.byId.get(id);
        if (!e) return false;
        const idx = this.entries.findIndex(x => x.id === id);
        if (idx >= 0) this.entries.splice(idx, 1);
        this.byId.delete(id);
        this._updateState();
        return true;
    }

    clear() {
        this.entries = [];
        this.byId.clear();
        this._updateState();
    }
    clearHistory() { this.flushedHistory = []; }
    listHistory() { return this.flushedHistory.slice(); }
    drainedCount() { return this.drained; }

    setMaxEntries(n) {
        if (typeof n !== 'number' || n <= 0) return false;
        this.config.maxEntries = n;
        this._updateState();
        return true;
    }
    setFlushBatchSize(n) {
        if (typeof n !== 'number' || n <= 0) return false;
        this.config.flushBatchSize = n;
        return true;
    }
    getConfig() { return { ...this.config }; }

    getStats() {
        return {
            ...this.stats,
            size: this.entries.length,
            drained: this.drained,
            capacity: this.capacity(),
            state: this.state,
        };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.OfflineBuffer = OfflineBuffer;
    globalThis.BUFFER_STATES = BUFFER_STATES;
}
