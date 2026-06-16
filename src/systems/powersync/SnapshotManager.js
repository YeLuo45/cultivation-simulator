/**
 * SnapshotManager.js - 周期性快照管理
 * V1164 Round 44 Iter 7/30 Direction A PowerSync Federation (nanobot)
 * 灵感: nanobot base snapshot + delta log replay pattern
 */

export const SNAPSHOT_KINDS = ['full', 'incremental', 'delta'];

export class SnapshotManager {
    constructor(config = {}) {
        this.config = { maxSnapshots: 64, autoCompact: true, ...config };
        this.snapshots = new Map();   // id -> { id, label, data, ts, kind }
        this.applied = [];            // ordered list of applied snapshot ids
        this.hooks = new Map();
        this.stats = { created: 0, applied: 0, restored: 0, dropped: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }
    _newId() { return `snap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    createSnapshot(data, label = null, kind = 'full') {
        if (!SNAPSHOT_KINDS.includes(kind)) kind = 'full';
        if (this.snapshots.size >= this.config.maxSnapshots) {
            // remove oldest non-applied snapshot
            let oldestId = null;
            let oldestTs = Infinity;
            for (const [id, s] of this.snapshots.entries()) {
                if (!this.applied.includes(id) && s.ts < oldestTs) {
                    oldestTs = s.ts;
                    oldestId = id;
                }
            }
            if (oldestId) {
                this.snapshots.delete(oldestId);
                this.stats.dropped++;
            }
        }
        const id = this._newId();
        const snap = {
            id,
            label: label || `snap_${this.snapshots.size}`,
            data: typeof data === 'object' ? JSON.parse(JSON.stringify(data)) : data,
            ts: Date.now(),
            kind,
        };
        this.snapshots.set(id, snap);
        this.stats.created++;
        this._emit('created', snap);
        return snap;
    }

    applySnapshot(id) {
        const snap = this.snapshots.get(id);
        if (!snap) return false;
        if (!this.applied.includes(id)) {
            this.applied.push(id);
        }
        this.stats.applied++;
        this._emit('applied', snap);
        return true;
    }

    restore(tsOrId) {
        // find the snapshot at or before the given ts, or by id
        let snap = null;
        if (typeof tsOrId === 'string' && this.snapshots.has(tsOrId)) {
            snap = this.snapshots.get(tsOrId);
        } else if (typeof tsOrId === 'number') {
            let best = null;
            for (const s of this.snapshots.values()) {
                if (s.ts <= tsOrId && (!best || s.ts > best.ts)) best = s;
            }
            snap = best;
        }
        if (!snap) return null;
        this.stats.restored++;
        this._emit('restored', snap);
        return snap;
    }

    get(id) { return this.snapshots.get(id) || null; }

    listSnapshots() {
        return Array.from(this.snapshots.values()).sort((a, b) => b.ts - a.ts);
    }

    getLatest() {
        let best = null;
        for (const s of this.snapshots.values()) {
            if (!best || s.ts > best.ts) best = s;
        }
        return best;
    }

    listApplied() { return this.applied.slice(); }
    remove(id) {
        const ok = this.snapshots.delete(id);
        if (ok) {
            this.applied = this.applied.filter(x => x !== id);
        }
        return ok;
    }
    clear() {
        this.snapshots.clear();
        this.applied = [];
    }
    getStats() { return { ...this.stats, count: this.snapshots.size, applied: this.applied.length }; }
}

if (typeof globalThis !== 'undefined') {
    globalThis.SnapshotManager = SnapshotManager;
    globalThis.SNAPSHOT_KINDS = SNAPSHOT_KINDS;
}
