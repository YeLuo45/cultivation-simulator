/**
 * SyncCoordinator.js - 同步协调 Agent
 * V1178 Round 44 Iter 21/30 Direction A PowerSync Federation (chatdev)
 * 灵感: chatdev 多 agent 协调 - mutex lock + barrier + leader election
 */

export const COORDINATOR_STATES = ['idle', 'running', 'blocked'];
export const LOCK_STATES = ['free', 'held', 'expired'];
export const BARRIER_STATES = ['waiting', 'released'];

export class SyncCoordinator {
    constructor(config = {}) {
        this.config = { barrierTimeoutMs: 10000, defaultLockTtlMs: 5000, ...config };
        this.state = 'idle';
        this.clients = new Set();
        this.locks = new Map();   // resource -> { clientId, expiresAt, acquiredAt }
        this.barriers = new Map(); // barrierId -> { expectedCount, arrived: Set, state, createdAt }
        this.hooks = new Map();
        this.stats = {
            locksAcquired: 0,
            locksReleased: 0,
            locksExpired: 0,
            locksContended: 0,
            barriersCreated: 0,
            barriersReleased: 0,
            leadersElected: 0,
        };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }

    // -------- client registry --------
    addClient(clientId) {
        if (!clientId) return false;
        if (this.clients.has(clientId)) return false;
        this.clients.add(clientId);
        this._emit('clientAdded', { clientId, count: this.clients.size });
        return true;
    }
    removeClient(clientId) {
        if (!this.clients.has(clientId)) return false;
        this.clients.delete(clientId);
        // release any locks held by this client
        for (const [resource, info] of this.locks.entries()) {
            if (info.clientId === clientId) {
                this.locks.delete(resource);
                this.stats.locksReleased++;
                this._emit('lockReleased', { resource, clientId, reason: 'client_left' });
            }
        }
        // remove from barriers
        for (const [bid, b] of this.barriers.entries()) {
            if (b.arrived.has(clientId)) {
                b.arrived.delete(clientId);
                this._emit('barrierUpdated', { barrierId: bid, arrived: b.arrived.size, expected: b.expectedCount });
            }
        }
        this._emit('clientRemoved', { clientId, count: this.clients.size });
        return true;
    }
    hasClient(clientId) { return this.clients.has(clientId); }
    getClientCount() { return this.clients.size; }
    listClients() { return Array.from(this.clients); }

    // -------- locks (mutex) --------
    _isExpired(info, now = Date.now()) {
        return info && info.expiresAt > 0 && info.expiresAt <= now;
    }
    _purgeExpiredLocks(now = Date.now()) {
        for (const [resource, info] of this.locks.entries()) {
            if (this._isExpired(info, now)) {
                this.locks.delete(resource);
                this.stats.locksExpired++;
                this._emit('lockExpired', { resource, clientId: info.clientId });
            }
        }
    }
    acquireLock(resource, clientId, ttlMs = this.config.defaultLockTtlMs) {
        if (!resource || !clientId) return false;
        this._purgeExpiredLocks();
        const existing = this.locks.get(resource);
        if (existing && !this._isExpired(existing)) {
            this.stats.locksContended++;
            this._emit('lockContended', { resource, holder: existing.clientId, requester: clientId });
            return false;
        }
        const now = Date.now();
        const info = {
            clientId,
            acquiredAt: now,
            expiresAt: ttlMs > 0 ? now + ttlMs : 0,
        };
        this.locks.set(resource, info);
        this.stats.locksAcquired++;
        this._emit('lockAcquired', { resource, clientId, ttlMs, expiresAt: info.expiresAt });
        return true;
    }
    releaseLock(resource, clientId) {
        const info = this.locks.get(resource);
        if (!info) return false;
        if (info.clientId !== clientId) return false;
        this.locks.delete(resource);
        this.stats.locksReleased++;
        this._emit('lockReleased', { resource, clientId, reason: 'manual' });
        return true;
    }
    isLocked(resource) {
        this._purgeExpiredLocks();
        return this.locks.has(resource);
    }
    getLockHolder(resource) {
        this._purgeExpiredLocks();
        const info = this.locks.get(resource);
        return info ? info.clientId : null;
    }
    listLocks() {
        this._purgeExpiredLocks();
        return Array.from(this.locks.entries()).map(([resource, info]) => ({ resource, ...info }));
    }

    // -------- barrier --------
    barrier(barrierId, expectedCount) {
        if (!barrierId || typeof expectedCount !== 'number' || expectedCount <= 0) return false;
        this.barriers.set(barrierId, {
            expectedCount,
            arrived: new Set(),
            state: 'waiting',
            createdAt: Date.now(),
        });
        this.stats.barriersCreated++;
        this._emit('barrierCreated', { barrierId, expectedCount });
        return true;
    }
    arriveAtBarrier(barrierId, clientId) {
        const b = this.barriers.get(barrierId);
        if (!b) return { ok: false, reason: 'unknown_barrier' };
        if (b.state === 'released') return { ok: false, reason: 'already_released' };
        if (b.arrived.has(clientId)) return { ok: false, reason: 'duplicate', arrived: b.arrived.size };
        b.arrived.add(clientId);
        if (b.arrived.size >= b.expectedCount) {
            b.state = 'released';
            this.stats.barriersReleased++;
            this._emit('barrierReleased', { barrierId, arrived: b.arrived.size, expected: b.expectedCount });
            return { ok: true, released: true, arrived: b.arrived.size };
        }
        this._emit('barrierUpdated', { barrierId, arrived: b.arrived.size, expected: b.expectedCount });
        return { ok: true, released: false, arrived: b.arrived.size };
    }
    isBarrierReleased(barrierId) {
        const b = this.barriers.get(barrierId);
        return !!(b && b.state === 'released');
    }
    getBarrierProgress(barrierId) {
        const b = this.barriers.get(barrierId);
        if (!b) return null;
        return { expected: b.expectedCount, arrived: b.arrived.size, state: b.state };
    }
    resetBarrier(barrierId) {
        const b = this.barriers.get(barrierId);
        if (!b) return false;
        b.arrived.clear();
        b.state = 'waiting';
        b.createdAt = Date.now();
        this._emit('barrierReset', { barrierId });
        return true;
    }
    listBarriers() {
        return Array.from(this.barriers.entries()).map(([bid, b]) => ({
            barrierId: bid,
            expected: b.expectedCount,
            arrived: b.arrived.size,
            state: b.state,
        }));
    }

    // -------- leader election --------
    electLeader(candidates) {
        if (!Array.isArray(candidates) || candidates.length === 0) return null;
        let min = candidates[0];
        for (let i = 1; i < candidates.length; i++) {
            if (candidates[i] < min) min = candidates[i];
        }
        this.stats.leadersElected++;
        this._emit('leaderElected', { leader: min, count: candidates.length });
        return min;
    }

    // -------- general --------
    setState(s) {
        if (!COORDINATOR_STATES.includes(s)) return false;
        const prev = this.state;
        this.state = s;
        this._emit('stateChange', { prev, state: s });
        return true;
    }
    getState() { return this.state; }
    clear() {
        this.locks.clear();
        this.barriers.clear();
        this.clients.clear();
        this.state = 'idle';
    }
    getStats() {
        return {
            ...this.stats,
            clients: this.clients.size,
            locks: this.locks.size,
            barriers: this.barriers.size,
            state: this.state,
        };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.SyncCoordinator = SyncCoordinator;
    globalThis.COORDINATOR_STATES = COORDINATOR_STATES;
    globalThis.LOCK_STATES = LOCK_STATES;
    globalThis.BARRIER_STATES = BARRIER_STATES;
}
