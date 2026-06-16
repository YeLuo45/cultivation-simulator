/**
 * ConnectivityMonitor.js - 网络连接状态/带宽/延迟监控
 * V1172 Round 44 Iter 15/30 Direction A PowerSync Federation (nanobot)
 * 灵感: nanobot mesh health monitor + sliding window latency + last-seen
 */

export const CONNECTIVITY_STATES = ['online', 'offline'];
export const LINK_QUALITY = ['excellent', 'good', 'fair', 'poor'];

export class ConnectivityMonitor {
    constructor(config = {}) {
        this.config = {
            latencyWindow: 10,
            offlineTimeoutMs: 5000,
            ...config,
        };
        this.state = 'online';
        this.lastSeen = Date.now();
        this.lastChange = Date.now();
        this.latencies = [];     // rolling window of recent samples
        this.history = [];       // { state, ts }
        this.hooks = new Map();
        this.stats = { transitions: 0, samples: 0, onlineTime: 0, offlineTime: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }
    _newId() { return `net_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    // ---- state ----
    setOnline(online, now = Date.now()) {
        const newState = online ? 'online' : 'offline';
        if (this.state === newState) return false;
        const prev = this.state;
        const elapsed = now - this.lastChange;
        if (prev === 'online') this.stats.onlineTime += elapsed;
        else this.stats.offlineTime += elapsed;
        this.state = newState;
        this.lastChange = now;
        if (newState === 'online') this.lastSeen = now;
        this.history.push({ state: newState, ts: now });
        this.stats.transitions++;
        this._emit('stateChange', { prev, state: newState, ts: now });
        return true;
    }

    isOnline() { return this.state === 'online'; }
    isOffline() { return this.state === 'offline'; }
    getState() { return this.state; }
    getLastSeen() { return this.lastSeen; }
    getLastChange() { return this.lastChange; }

    // ---- latency ----
    recordLatency(ms, now = Date.now()) {
        if (typeof ms !== 'number' || ms < 0) return false;
        this.latencies.push({ ms, ts: now });
        // trim to window
        const max = this.config.latencyWindow;
        if (this.latencies.length > max) {
            this.latencies.splice(0, this.latencies.length - max);
        }
        this.stats.samples++;
        // also mark lastSeen
        this.lastSeen = now;
        this._emit('latencySample', { ms, ts: now });
        return true;
    }

    getAvgLatency() {
        if (this.latencies.length === 0) return 0;
        let sum = 0;
        for (const x of this.latencies) sum += x.ms;
        return sum / this.latencies.length;
    }

    getMinLatency() {
        if (this.latencies.length === 0) return 0;
        let m = Infinity;
        for (const x of this.latencies) if (x.ms < m) m = x.ms;
        return m;
    }

    getMaxLatency() {
        if (this.latencies.length === 0) return 0;
        let m = 0;
        for (const x of this.latencies) if (x.ms > m) m = x.ms;
        return m;
    }

    getP95Latency() {
        if (this.latencies.length === 0) return 0;
        const sorted = this.latencies.map(x => x.ms).slice().sort((a, b) => a - b);
        const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
        return sorted[idx];
    }

    getJitter() {
        if (this.latencies.length < 2) return 0;
        const avg = this.getAvgLatency();
        let sum = 0;
        for (const x of this.latencies) sum += Math.abs(x.ms - avg);
        return sum / this.latencies.length;
    }

    getLinkQuality() {
        const avg = this.getAvgLatency();
        if (avg === 0) return 'fair';
        if (avg < 50) return 'excellent';
        if (avg < 150) return 'good';
        if (avg < 500) return 'fair';
        return 'poor';
    }

    // ---- time-since-last-seen ----
    getTimeSinceLastSeen(now = Date.now()) {
        return now - this.lastSeen;
    }

    isStale(now = Date.now()) {
        return this.getTimeSinceLastSeen(now) > this.config.offlineTimeoutMs;
    }

    // test-friendly: based on a synthetic "now", update state
    checkTimeout(now = Date.now()) {
        if (this.isOnline() && this.isStale(now)) {
            return this.setOnline(false, now);
        }
        return false;
    }

    // ---- queries ----
    listLatencies() { return this.latencies.slice(); }
    listHistory() { return this.history.slice(); }
    sampleCount() { return this.latencies.length; }
    setLatencyWindow(n) {
        if (typeof n !== 'number' || n <= 0) return false;
        this.config.latencyWindow = n;
        // trim if needed
        if (this.latencies.length > n) {
            this.latencies.splice(0, this.latencies.length - n);
        }
        return true;
    }
    setOfflineTimeoutMs(ms) {
        if (typeof ms !== 'number' || ms < 0) return false;
        this.config.offlineTimeoutMs = ms;
        return true;
    }
    clear() {
        this.latencies = [];
        this.history = [];
        this.stats = { transitions: 0, samples: 0, onlineTime: 0, offlineTime: 0 };
    }
    getStats() {
        return {
            ...this.stats,
            state: this.state,
            avgLatency: this.getAvgLatency(),
            minLatency: this.getMinLatency(),
            maxLatency: this.getMaxLatency(),
            p95Latency: this.getP95Latency(),
            jitter: this.getJitter(),
            linkQuality: this.getLinkQuality(),
            samples: this.sampleCount(),
            lastSeen: this.lastSeen,
            timeSinceLastSeen: this.getTimeSinceLastSeen(),
        };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.ConnectivityMonitor = ConnectivityMonitor;
    globalThis.CONNECTIVITY_STATES = CONNECTIVITY_STATES;
    globalThis.LINK_QUALITY = LINK_QUALITY;
}
