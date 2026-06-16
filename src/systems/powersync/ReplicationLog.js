/**
 * ReplicationLog.js - 复制日志
 * V1165 Round 44 Iter 8/30 Direction A PowerSync Federation (thunderbolt)
 * 灵感: thunderbolt PowerSync node registry + heartbeat + lag tracking
 */

export const NODE_STATES = ['active', 'idle', 'lagging', 'dead'];

export class ReplicationLog {
    constructor(config = {}) {
        this.config = { defaultTimeoutMs: 30000, ...config };
        this.nodes = new Map();      // id -> { id, meta, state, lastHeartbeat, joinedAt }
        this.hooks = new Map();
        this.stats = { registered: 0, heartbeats: 0, dead: 0, lagUpdates: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }

    registerNode(id, meta = {}) {
        if (typeof id !== 'string' || !id) return null;
        const existing = this.nodes.get(id);
        if (existing) {
            // refresh metadata and heartbeat
            existing.meta = { ...existing.meta, ...meta };
            existing.lastHeartbeat = Date.now();
            existing.state = 'active';
            return existing;
        }
        const entry = {
            id,
            meta: { ...meta },
            state: 'active',
            lastHeartbeat: Date.now(),
            joinedAt: Date.now(),
        };
        this.nodes.set(id, entry);
        this.stats.registered++;
        this._emit('registered', entry);
        return entry;
    }

    heartbeat(id, ts = null) {
        const e = this.nodes.get(id);
        if (!e) return false;
        e.lastHeartbeat = ts || Date.now();
        if (e.state !== 'active') e.state = 'active';
        this.stats.heartbeats++;
        this._emit('heartbeat', e);
        return true;
    }

    getLag(id, now = null) {
        const e = this.nodes.get(id);
        if (!e) return -1;
        const t = now || Date.now();
        return t - e.lastHeartbeat;
    }

    isAlive(id, timeoutMs = null, now = null) {
        const e = this.nodes.get(id);
        if (!e) return false;
        const t = now || Date.now();
        const to = timeoutMs !== null ? timeoutMs : this.config.defaultTimeoutMs;
        return (t - e.lastHeartbeat) <= to;
    }

    markDead(id) {
        const e = this.nodes.get(id);
        if (!e) return false;
        e.state = 'dead';
        this.stats.dead++;
        this._emit('dead', e);
        return true;
    }

    setState(id, state) {
        const e = this.nodes.get(id);
        if (!e) return false;
        if (!NODE_STATES.includes(state)) return false;
        e.state = state;
        return true;
    }

    listNodes() { return Array.from(this.nodes.values()); }
    listOnline(timeoutMs = null, now = null) {
        const to = timeoutMs !== null ? timeoutMs : this.config.defaultTimeoutMs;
        const t = now || Date.now();
        return this.listNodes().filter(n => (t - n.lastHeartbeat) <= to);
    }
    listByState(state) {
        if (!NODE_STATES.includes(state)) return [];
        return this.listNodes().filter(n => n.state === state);
    }
    get(id) { return this.nodes.get(id) || null; }
    remove(id) {
        const ok = this.nodes.delete(id);
        return ok;
    }
    getStats() {
        return {
            ...this.stats,
            total: this.nodes.size,
            online: this.listOnline().length,
            byState: NODE_STATES.reduce((acc, s) => {
                acc[s] = this.listByState(s).length;
                return acc;
            }, {}),
        };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.ReplicationLog = ReplicationLog;
    globalThis.NODE_STATES = NODE_STATES;
}
