/**
 * ChangeLog.js - CRDT 风格变更日志
 * V1159 Round 44 Iter 2/30 Direction A PowerSync Federation (thunderbolt)
 * 灵感: thunderbolt PowerSync operation log + tombstone + compression
 */

export const OP_KINDS = ['set', 'delete', 'merge', 'patch'];
export const COMPACT_MODES = ['time', 'count', 'vector'];

export class ChangeLog {
    constructor(config = {}) {
        this.config = { maxSize: 4096, compactThreshold: 1024, compactKeep: 256, ...config };
        this.log = new Map();           // opId -> { id, kind, key, value, ts, vector, tombstone }
        this.order = [];                // FIFO of opIds
        this.tombstones = new Map();    // key -> opId of latest delete
        this.hooks = new Map();
        this.stats = { appended: 0, compacted: 0, tombstones: 0, dropped: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }
    _newId() { return `cl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    append(kind, key, value, vector = {}) {
        if (!OP_KINDS.includes(kind)) kind = 'set';
        if (this.log.size >= this.config.maxSize) {
            this.stats.dropped++;
            this._emit('dropped', { reason: 'full', key });
            return null;
        }
        const id = this._newId();
        const entry = { id, kind, key, value, ts: Date.now(), vector: { ...vector } };
        // delete creates a tombstone
        if (kind === 'delete') {
            this.tombstones.set(key, id);
            entry.tombstone = true;
            this.stats.tombstones++;
        } else {
            // any write clears any tombstone for this key
            this.tombstones.delete(key);
            entry.tombstone = false;
        }
        this.log.set(id, entry);
        this.order.push(id);
        this.stats.appended++;
        this._emit('appended', entry);
        return entry;
    }

    since(vector) {
        // returns entries whose vector has at least one device with higher tick
        if (!vector || typeof vector !== 'object') return this.listAll();
        return this.order
            .map(id => this.log.get(id))
            .filter(Boolean)
            .filter(e => {
                for (const dev of Object.keys(e.vector)) {
                    if ((e.vector[dev] || 0) > (vector[dev] || 0)) return true;
                }
                return false;
            });
    }

    compact(before = null) {
        // compact entries older than `before` (ts or opId or count) - keeps the latest N
        const keep = this.config.compactKeep;
        let cutoffIdx = 0;
        if (before === null) {
            cutoffIdx = Math.max(0, this.order.length - keep);
        } else if (typeof before === 'number') {
            cutoffIdx = before;
        } else if (typeof before === 'string') {
            cutoffIdx = this.order.indexOf(before);
            if (cutoffIdx < 0) cutoffIdx = 0;
        }
        if (cutoffIdx <= 0) return 0;
        const toRemove = this.order.splice(0, cutoffIdx);
        let removed = 0;
        for (const id of toRemove) {
            const e = this.log.get(id);
            if (e && !e.tombstone) {
                // keep tombstone summary if no later write to same key
            }
            this.log.delete(id);
            removed++;
        }
        this.stats.compacted += removed;
        this._emit('compacted', { removed });
        return removed;
    }

    getTombstones() {
        const result = [];
        for (const [key, opId] of this.tombstones.entries()) {
            const e = this.log.get(opId);
            if (e) result.push({ key, opId, ts: e.ts });
        }
        return result;
    }

    get(opId) { return this.log.get(opId) || null; }
    listAll() { return this.order.map(id => this.log.get(id)).filter(Boolean); }
    listByKey(key) { return this.listAll().filter(e => e.key === key); }
    get size() { return this.log.size; }
    get length() { return this.order.length; }
    getStats() { return { ...this.stats, size: this.log.size, tombstones: this.tombstones.size }; }
}

if (typeof globalThis !== 'undefined') {
    globalThis.ChangeLog = ChangeLog;
    globalThis.OP_KINDS = OP_KINDS;
    globalThis.COMPACT_MODES = COMPACT_MODES;
}
