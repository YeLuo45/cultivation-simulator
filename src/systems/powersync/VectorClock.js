/**
 * VectorClock.js - 向量时钟
 * V1160 Round 44 Iter 3/30 Direction A PowerSync Federation (nanobot)
 * 灵感: nanobot CRDT vector clock + happens-before causal ordering
 */

export const COMPARE = {
    LESS: -1,        // this happensBefore other
    EQUAL: 0,        // this == other
    GREATER: 1,      // this happensAfter other
    CONCURRENT: 2,   // neither happensBefore
};

export class VectorClock {
    constructor(config = {}) {
        this.config = { deviceId: config.deviceId || 'device_a', ...config };
        this.clock = new Map();  // deviceId -> tick
        this.clock.set(this.config.deviceId, 0);
        this.hooks = new Map();
        this.stats = { ticks: 0, merges: 0, comparisons: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }

    tick(deviceId = null) {
        const id = deviceId || this.config.deviceId;
        const next = (this.clock.get(id) || 0) + 1;
        this.clock.set(id, next);
        this.stats.ticks++;
        this._emit('tick', { deviceId: id, value: next });
        return next;
    }

    get(deviceId) { return this.clock.get(deviceId) || 0; }

    merge(other) {
        if (!other || typeof other.get !== 'function') return this;
        let changed = false;
        for (const [dev, tick] of other.clock.entries()) {
            const cur = this.clock.get(dev) || 0;
            if (tick > cur) {
                this.clock.set(dev, tick);
                changed = true;
            }
        }
        if (changed) this.stats.merges++;
        this._emit('merged', { with: other.config?.deviceId || 'unknown' });
        return this;
    }

    compare(other) {
        this.stats.comparisons++;
        if (!other || typeof other.get !== 'function') return COMPARE.CONCURRENT;
        const devices = new Set([...this.clock.keys(), ...other.clock.keys()]);
        let selfGreater = false;
        let otherGreater = false;
        for (const dev of devices) {
            const a = this.clock.get(dev) || 0;
            const b = other.clock.get(dev) || 0;
            if (a > b) selfGreater = true;
            else if (b > a) otherGreater = true;
        }
        if (selfGreater && !otherGreater) return COMPARE.GREATER;
        if (otherGreater && !selfGreater) return COMPARE.LESS;
        if (!selfGreater && !otherGreater) return COMPARE.EQUAL;
        return COMPARE.CONCURRENT;
    }

    isHappensBefore(other) { return this.compare(other) === COMPARE.LESS; }
    isHappensAfter(other) { return this.compare(other) === COMPARE.GREATER; }
    isConcurrent(other) { return this.compare(other) === COMPARE.CONCURRENT; }
    isEqual(other) { return this.compare(other) === COMPARE.EQUAL; }

    clone() {
        const c = new VectorClock({ deviceId: this.config.deviceId });
        for (const [k, v] of this.clock.entries()) c.clock.set(k, v);
        return c;
    }

    serialize() {
        return JSON.stringify({
            deviceId: this.config.deviceId,
            clock: Object.fromEntries(this.clock),
        });
    }

    static deserialize(json) {
        const data = typeof json === 'string' ? JSON.parse(json) : json;
        const c = new VectorClock({ deviceId: data.deviceId || 'device_a' });
        for (const [k, v] of Object.entries(data.clock || {})) {
            c.clock.set(k, v);
        }
        return c;
    }

    listAll() { return Object.fromEntries(this.clock); }
    getStats() { return { ...this.stats, devices: this.clock.size, clock: this.listAll() }; }
}

if (typeof globalThis !== 'undefined') {
    globalThis.VectorClock = VectorClock;
    globalThis.COMPARE = COMPARE;
}
