/**
 * DeadLetterQueue.js - 死信队列 (push + replay + capacity + alert)
 * V1177 Round 44 Iter 20/30 Direction A PowerSync Federation (ruflo)
 * 灵感: ruflo dead-letter recovery queue with alert threshold
 */

export class DeadLetterQueue {
    constructor(config = {}) {
        this.config = {
            maxSize: 500,
            alertThreshold: 0.8,
            ...config,
        };
        this.maxSize = this.config.maxSize;
        this.alertThreshold = this.config.alertThreshold;
        this.items = new Map(); // id -> { id, item, reason, ts, replayedAt }
        this.order = [];        // insertion order, oldest first
        this.hooks = new Map();
        this.stats = { pushed: 0, dropped: 0, replayed: 0, replayFailures: 0, removed: 0, alertCount: 0 };
        this._lastAlertState = false;
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }
    _newId() { return `dlq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    push(item, reason = 'unknown') {
        // if at capacity, drop oldest
        if (this.order.length >= this.maxSize) {
            const oldId = this.order.shift();
            this.items.delete(oldId);
            this.stats.dropped++;
            this._emit('dropped', { id: oldId });
        }
        const entry = {
            id: this._newId(),
            item: this._cloneItem(item),
            reason: String(reason),
            ts: Date.now(),
            replayedAt: null,
        };
        this.items.set(entry.id, entry);
        this.order.push(entry.id);
        this.stats.pushed++;
        this._checkAlert();
        this._emit('pushed', entry);
        return entry.id;
    }

    _cloneItem(item) {
        if (item === null || item === undefined) return item;
        try { return JSON.parse(JSON.stringify(item)); } catch (_) { return item; }
    }

    get(id) {
        const e = this.items.get(id);
        if (!e) return null;
        return { ...e, item: this._cloneItem(e.item) };
    }

    list(options = {}) {
        const { reason = null, since = null } = options;
        const out = [];
        for (const id of this.order) {
            const e = this.items.get(id);
            if (!e) continue;
            if (reason !== null && e.reason !== reason) continue;
            if (since !== null && e.ts < since) continue;
            out.push({ ...e, item: this._cloneItem(e.item) });
        }
        return out;
    }

    async replay(id, handler) {
        const e = this.items.get(id);
        if (!e) return { ok: false, reason: 'not_found' };
        if (typeof handler !== 'function') {
            return { ok: false, reason: 'invalid_handler' };
        }
        let result;
        try {
            result = await handler(e.item);
        } catch (err) {
            this.stats.replayFailures++;
            this._emit('replayError', { id, error: err && err.message });
            return { ok: false, reason: 'handler_threw', error: err && err.message };
        }
        if (result === true) {
            // success: remove
            this.items.delete(id);
            const idx = this.order.indexOf(id);
            if (idx >= 0) this.order.splice(idx, 1);
            e.replayedAt = Date.now();
            this.stats.replayed++;
            this._checkAlert();
            this._emit('replayed', { id, item: e.item });
            return { ok: true, id };
        } else {
            this.stats.replayFailures++;
            this._emit('replayFailed', { id, result });
            return { ok: false, reason: 'handler_returned_false', result };
        }
    }

    remove(id) {
        if (!this.items.has(id)) return false;
        this.items.delete(id);
        const idx = this.order.indexOf(id);
        if (idx >= 0) this.order.splice(idx, 1);
        this.stats.removed++;
        this._checkAlert();
        this._emit('removed', { id });
        return true;
    }

    clear() {
        const n = this.items.size;
        this.items.clear();
        this.order = [];
        this._lastAlertState = false;
        this._emit('cleared', { count: n });
        return n;
    }

    get size() { return this.items.size; }

    get alertLevel() {
        if (this.maxSize <= 0) return 0;
        return this.items.size / this.maxSize;
    }

    isAlerting() { return this.alertLevel >= this.alertThreshold; }

    _checkAlert() {
        const now = this.isAlerting();
        if (now && !this._lastAlertState) {
            this.stats.alertCount++;
            this._emit('alert', { level: this.alertLevel, size: this.items.size, maxSize: this.maxSize });
        }
        this._lastAlertState = now;
    }

    getStats() {
        return {
            ...this.stats,
            size: this.items.size,
            maxSize: this.maxSize,
            alertLevel: this.alertLevel,
            alerting: this.isAlerting(),
        };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.DeadLetterQueue = DeadLetterQueue;
}
