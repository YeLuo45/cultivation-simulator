/**
 * DeltaSyncCore.js - 增量同步核心
 * V1158 Round 44 Iter 1/30 Direction A PowerSync Federation (thunderbolt)
 * 灵感: thunderbolt PowerSync changelog + version vector dispatch
 */

export const SYNC_OPS = ['insert', 'update', 'delete', 'tombstone'];
export const SYNC_STATES = ['pending', 'flushed', 'acked', 'dropped'];

export class DeltaSyncCore {
    constructor(config = {}) {
        this.config = { maxQueue: 1024, batchSize: 50, ttlMs: 60000, ...config };
        this.changelog = new Map();        // opId -> { id, op, key, value, ts, state, vector }
        this.pendingOps = [];              // FIFO of opIds
        this.byState = { pending: [], flushed: [], acked: [], dropped: [] };
        this.hooks = new Map();
        this.stats = { recorded: 0, flushed: 0, acked: 0, dropped: 0, total: 0 };
        this.vector = { tick: 0, device: 'core' };
    }

    _emit(ev, payload) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(payload); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }
    _newId() { return `op_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    recordOp(op, key, value, vector = null) {
        if (!SYNC_OPS.includes(op)) op = 'update';
        if (this.changelog.size >= this.config.maxQueue) {
            this.stats.dropped++;
            this._emit('dropped', { reason: 'queue_full' });
            return null;
        }
        const id = this._newId();
        const entry = { id, op, key, value, ts: Date.now(), state: 'pending', vector: vector || { ...this.vector } };
        this.changelog.set(id, entry);
        this.pendingOps.push(id);
        this.byState.pending.push(id);
        this.stats.recorded++;
        this.stats.total++;
        this.vector.tick++;
        this._emit('recorded', entry);
        return entry;
    }

    flush() {
        const batch = [];
        const toFlush = this.pendingOps.splice(0, this.config.batchSize);
        for (const opId of toFlush) {
            const e = this.changelog.get(opId);
            if (!e) continue;
            e.state = 'flushed';
            this.byState.pending = this.byState.pending.filter(id => id !== opId);
            this.byState.flushed.push(opId);
            this.stats.flushed++;
            batch.push(e);
            this._emit('flushed', e);
        }
        return batch;
    }

    ack(opId) {
        const e = this.changelog.get(opId);
        if (!e) return false;
        const prev = e.state;
        e.state = 'acked';
        this.byState[prev] = (this.byState[prev] || []).filter(id => id !== opId);
        this.byState.acked.push(opId);
        this.stats.acked++;
        this._emit('acked', e);
        return true;
    }

    drop(opId, reason = 'manual') {
        const e = this.changelog.get(opId);
        if (!e) return false;
        const prev = e.state;
        e.state = 'dropped';
        this.byState[prev] = (this.byState[prev] || []).filter(id => id !== opId);
        this.byState.dropped.push(opId);
        this.stats.dropped++;
        this._emit('dropped', { ...e, reason });
        return true;
    }

    getOp(opId) { return this.changelog.get(opId) || null; }
    listPending() { return this.pendingOps.map(id => this.changelog.get(id)).filter(Boolean); }
    listByState(state) {
        if (!SYNC_STATES.includes(state)) return [];
        return (this.byState[state] || []).map(id => this.changelog.get(id)).filter(Boolean);
    }
    getStats() { return { ...this.stats, queueSize: this.changelog.size, pending: this.pendingOps.length }; }

    sweep(ttlMs = null) {
        const cutoff = Date.now() - (ttlMs || this.config.ttlMs);
        let removed = 0;
        for (const [id, e] of this.changelog.entries()) {
            if (e.ts < cutoff && (e.state === 'acked' || e.state === 'dropped')) {
                this.changelog.delete(id);
                removed++;
            }
        }
        return removed;
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.DeltaSyncCore = DeltaSyncCore;
    globalThis.SYNC_OPS = SYNC_OPS;
    globalThis.SYNC_STATES = SYNC_STATES;
}
