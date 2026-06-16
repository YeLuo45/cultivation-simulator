/**
 * SyncDispatcher.js - 多目的地 fan-out 派发器
 * V1169 Round 44 Iter 12/30 Direction A PowerSync Federation (nanobot)
 * 灵感: nanobot fan-out router + ordering guarantee + retry
 */

export const ORDERING_MODES = ['fifo', 'lifo', 'none'];
export const DISPATCH_STATES = ['pending', 'sent', 'failed', 'retrying'];

export class SyncDispatcher {
    constructor(config = {}) {
        this.config = { maxRetries: 3, ordering: 'fifo', retryDelayMs: 100, ...config };
        this.targets = new Map();     // id -> { id, send, opts }
        this.history = [];            // ordered by dispatch ts
        this.retryQueue = [];         // { targetId, payload, attempts, nextAt }
        this.hooks = new Map();
        this.stats = { sent: 0, failed: 0, retried: 0, dispatched: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }
    _newId() { return `dsp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    addTarget(target) {
        if (!target || typeof target.id !== 'string') return false;
        if (typeof target.send !== 'function') return false;
        this.targets.set(target.id, { id: target.id, send: target.send, opts: target.opts || {} });
        this._emit('targetAdded', { id: target.id });
        return true;
    }

    removeTarget(id) {
        const existed = this.targets.delete(id);
        if (existed) this._emit('targetRemoved', { id });
        return existed;
    }

    listTargets() { return Array.from(this.targets.keys()); }
    getTarget(id) { return this.targets.get(id) || null; }
    hasTarget(id) { return this.targets.has(id); }
    targetCount() { return this.targets.size; }

    setOrdering(mode) {
        if (!ORDERING_MODES.includes(mode)) return false;
        this.config.ordering = mode;
        return true;
    }
    getOrdering() { return this.config.ordering; }

    withOrdering(list) {
        if (!Array.isArray(list)) return [];
        const mode = this.config.ordering;
        const out = list.slice();
        if (mode === 'fifo') return out;
        if (mode === 'lifo') return out.reverse();
        // 'none' means we shuffle deterministically using sort by id (or input order preserved)
        return out;
    }

    async _sendTo(target, payload) {
        // try-catch around target.send so one bad target doesn't break others
        try {
            const r = await target.send(payload);
            if (r === false) {
                return { ok: false, reason: 'rejected' };
            }
            return { ok: true };
        } catch (e) {
            return { ok: false, reason: 'error', error: e.message || String(e) };
        }
    }

    async dispatch(payload, opts = {}) {
        const id = this._newId();
        const ts = Date.now();
        const results = [];
        const orderedTargets = this.withOrdering(Array.from(this.targets.values()));
        this.stats.dispatched++;
        this._emit('dispatching', { id, payload, count: orderedTargets.length });

        for (const t of orderedTargets) {
            const r = await this._sendTo(t, payload);
            results.push({ targetId: t.id, ...r });
            if (r.ok) {
                this.stats.sent++;
                this._emit('sent', { id, targetId: t.id });
            } else {
                this.stats.failed++;
                this._emit('failed', { id, targetId: t.id, reason: r.reason });
                if (opts.retry !== false) {
                    this.retryQueue.push({
                        id: this._newId(),
                        targetId: t.id,
                        payload,
                        attempts: 0,
                        nextAt: ts,
                    });
                }
            }
        }
        const entry = { id, payload, results, ts };
        this.history.push(entry);
        this._emit('dispatched', entry);
        return entry;
    }

    async processRetries(now = Date.now()) {
        if (this.retryQueue.length === 0) return 0;
        const stillPending = [];
        let processed = 0;
        for (const item of this.retryQueue) {
            if (item.nextAt > now) {
                stillPending.push(item);
                continue;
            }
            const t = this.targets.get(item.targetId);
            if (!t) continue; // target gone
            item.attempts++;
            const r = await this._sendTo(t, item.payload);
            processed++;
            if (r.ok) {
                this.stats.sent++;
                this.stats.retried++;
                this._emit('retrySucceeded', { targetId: item.targetId, attempts: item.attempts });
            } else if (item.attempts < this.config.maxRetries) {
                item.nextAt = now + this.config.retryDelayMs * Math.pow(2, item.attempts);
                stillPending.push(item);
                this._emit('retryFailed', { targetId: item.targetId, attempts: item.attempts });
            } else {
                this._emit('retryExhausted', { targetId: item.targetId, attempts: item.attempts });
            }
        }
        this.retryQueue = stillPending;
        return processed;
    }

    // ---- queries ----
    listHistory() { return this.history.slice(); }
    listRetries() { return this.retryQueue.slice(); }
    retryCount() { return this.retryQueue.length; }
    historyLength() { return this.history.length; }
    clear() {
        this.targets.clear();
        this.history = [];
        this.retryQueue = [];
    }
    getStats() {
        return {
            ...this.stats,
            targets: this.targets.size,
            history: this.history.length,
            retries: this.retryQueue.length,
        };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.SyncDispatcher = SyncDispatcher;
    globalThis.ORDERING_MODES = ORDERING_MODES;
    globalThis.DISPATCH_STATES = DISPATCH_STATES;
}
