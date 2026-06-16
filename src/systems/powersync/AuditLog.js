/**
 * AuditLog.js - 审计日志 (append + query + time range + size)
 * V1176 Round 44 Iter 19/30 Direction A PowerSync Federation (ruflo)
 * 灵感: ruflo audit trail with rolling window + filter
 */

export const AUDIT_ORDERS = ['asc', 'desc'];

export class AuditLog {
    constructor(config = {}) {
        this.config = {
            maxSize: 10000,
            ...config,
        };
        this.maxSize = this.config.maxSize;
        // id -> entry
        this.entries = new Map();
        // insertion order, for rolling window
        this.order = [];
        this.hooks = new Map();
        this.stats = { appended: 0, dropped: 0, queried: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }
    _newId() { return `aud_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    append(action, actor, target, meta = {}) {
        if (typeof action !== 'string' || !action) {
            throw new Error('append: action must be non-empty string');
        }
        const entry = {
            id: this._newId(),
            action,
            actor: actor == null ? null : String(actor),
            target: target == null ? null : String(target),
            meta: meta == null ? {} : { ...meta },
            ts: Date.now(),
        };
        // rolling: if at maxSize, drop oldest
        if (this.order.length >= this.maxSize) {
            const oldId = this.order.shift();
            this.entries.delete(oldId);
            this.stats.dropped++;
        }
        this.entries.set(entry.id, entry);
        this.order.push(entry.id);
        this.stats.appended++;
        this._emit('appended', entry);
        return entry.id;
    }

    query(filter = {}) {
        this.stats.queried++;
        const since = (filter.since !== undefined) ? filter.since : null;
        const until = (filter.until !== undefined) ? filter.until : null;
        const results = [];
        for (const id of this.order) {
            const e = this.entries.get(id);
            if (!e) continue;
            if (filter.action !== undefined && e.action !== filter.action) continue;
            if (filter.actor !== undefined && e.actor !== filter.actor) continue;
            if (filter.target !== undefined && e.target !== filter.target) continue;
            if (since !== null && e.ts < since) continue;
            if (until !== null && e.ts > until) continue;
            results.push(e);
        }
        this._emit('queried', { count: results.length, filter });
        return results;
    }

    getById(id) {
        return this.entries.get(id) || null;
    }

    get size() { return this.entries.size; }

    list(options = {}) {
        const { limit = 100, offset = 0, order = 'desc' } = options;
        if (!AUDIT_ORDERS.includes(order)) {
            throw new Error(`list: order must be one of ${AUDIT_ORDERS.join(',')}`);
        }
        const all = this.order.map(id => this.entries.get(id)).filter(Boolean);
        const sorted = order === 'desc' ? all.slice().reverse() : all;
        return sorted.slice(offset, offset + limit);
    }

    clear() {
        const n = this.entries.size;
        this.entries.clear();
        this.order = [];
        this._emit('cleared', { count: n });
        return n;
    }

    getStats() {
        return {
            ...this.stats,
            size: this.entries.size,
            maxSize: this.maxSize,
        };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.AuditLog = AuditLog;
    globalThis.AUDIT_ORDERS = AUDIT_ORDERS;
}
