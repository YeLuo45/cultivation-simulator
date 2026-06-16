/**
 * SyncQueue.js - 异步同步队列
 * V1162 Round 44 Iter 5/30 Direction A PowerSync Federation (thunderbolt)
 * 灵感: thunderbolt PowerSync priority queue + backpressure + retry
 */

export const PRIORITIES = ['high', 'medium', 'low'];
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export class SyncQueue {
    constructor(config = {}) {
        this.config = { maxSize: 1024, defaultPriority: 'medium', ...config };
        this.queues = { high: [], medium: [], low: [] };
        this.byId = new Map();   // id -> { item, priority, attempts, retryAt }
        this.hooks = new Map();
        this.stats = { enqueued: 0, dequeued: 0, retried: 0, rejected: 0, dropped: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }
    _newId() { return `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    enqueue(item, priority = null) {
        const pri = (priority || this.config.defaultPriority);
        const p = PRIORITIES.includes(pri) ? pri : this.config.defaultPriority;
        if (this.size() >= this.config.maxSize) {
            this.stats.rejected++;
            this._emit('rejected', { reason: 'full', item });
            return null;
        }
        const id = this._newId();
        const entry = { id, item, priority: p, attempts: 0, retryAt: 0, ts: Date.now() };
        this.queues[p].push(entry);
        this.byId.set(id, entry);
        this.stats.enqueued++;
        this._emit('enqueued', entry);
        return entry;
    }

    dequeue() {
        // priority order: high > medium > low
        for (const p of PRIORITIES) {
            const q = this.queues[p];
            if (q && q.length > 0) {
                // skip entries scheduled for future retry
                const now = Date.now();
                for (let i = 0; i < q.length; i++) {
                    if (q[i].retryAt <= now) {
                        const e = q.splice(i, 1)[0];
                        // keep byId entry so retry(id) can find it
                        this.stats.dequeued++;
                        this._emit('dequeued', e);
                        return e;
                    }
                }
            }
        }
        return null;
    }

    retry(id, delayMs = 0) {
        const e = this.byId.get(id);
        if (!e) return false;
        // remove from current priority queue
        const q = this.queues[e.priority];
        const idx = q.findIndex(x => x.id === id);
        if (idx >= 0) q.splice(idx, 1);
        e.attempts++;
        e.retryAt = Date.now() + delayMs;
        // re-insert at the head of its priority queue
        q.unshift(e);
        this.stats.retried++;
        this._emit('retried', e);
        return true;
    }

    remove(id) {
        const e = this.byId.get(id);
        if (!e) return false;
        const q = this.queues[e.priority];
        const idx = q.findIndex(x => x.id === id);
        if (idx >= 0) q.splice(idx, 1);
        this.byId.delete(id);
        return true;
    }

    get(id) { return this.byId.get(id) || null; }
    listAll() { return Array.from(this.byId.values()); }
    listByPriority(p) {
        if (!PRIORITIES.includes(p)) return [];
        return (this.queues[p] || []).slice();
    }
    size() {
        return this.queues.high.length + this.queues.medium.length + this.queues.low.length;
    }
    isFull() { return this.size() >= this.config.maxSize; }
    clear() {
        this.queues.high = [];
        this.queues.medium = [];
        this.queues.low = [];
        this.byId.clear();
    }
    getStats() {
        return {
            ...this.stats,
            size: this.size(),
            maxSize: this.config.maxSize,
            byPriority: {
                high: this.queues.high.length,
                medium: this.queues.medium.length,
                low: this.queues.low.length,
            },
        };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.SyncQueue = SyncQueue;
    globalThis.PRIORITIES = PRIORITIES;
}
