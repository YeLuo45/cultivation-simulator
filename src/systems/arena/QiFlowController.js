/**
 * QiFlowController.js - 气血流转控制器
 * V1022 P-20260614-182 Round 39 Iter 15/30
 */
export const DEFAULT_MAX_QI = 100;
export const FLOW_RATES = { passive: 1, active: 5, peak: 10 };

export class QiFlowController {
    constructor(config = {}) {
        this.config = { defaultMaxQi: config.defaultMaxQi || DEFAULT_MAX_QI, ...config };
        this.pools = new Map();   // playerId -> { current, max, rate, history }
        this.hooks = new Map();
        this.stats = { totalFlows: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    init(playerId, max = this.config.defaultMaxQi, current = null) {
        if (!playerId) return false;
        this.pools.set(playerId, { current: current !== null ? current : max, max, rate: FLOW_RATES.passive, history: [] });
        return true;
    }
    get(playerId) { return this.pools.get(playerId) || null; }
    currentQi(playerId) { return this.pools.get(playerId)?.current || 0; }
    maxQi(playerId) { return this.pools.get(playerId)?.max || 0; }
    setMax(playerId, max) {
        const p = this.pools.get(playerId);
        if (!p) return false;
        p.max = max;
        p.current = Math.min(p.current, max);
        return true;
    }

    spend(playerId, amount) {
        const p = this.pools.get(playerId);
        if (!p) return false;
        if (amount <= 0) return false;
        if (p.current < amount) return false;
        p.current -= amount;
        p.history.push({ event: 'spend', amount, ts: Date.now() });
        this.stats.totalFlows++;
        this._emit('spent', { playerId, amount, remaining: p.current });
        return true;
    }
    gain(playerId, amount) {
        const p = this.pools.get(playerId);
        if (!p) return false;
        if (amount <= 0) return false;
        const before = p.current;
        p.current = Math.min(p.max, p.current + amount);
        p.history.push({ event: 'gain', amount: p.current - before, ts: Date.now() });
        this.stats.totalFlows++;
        this._emit('gained', { playerId, amount, current: p.current });
        return true;
    }
    setFlowRate(playerId, rate) {
        const p = this.pools.get(playerId);
        if (!p) return false;
        p.rate = rate;
        return true;
    }
    tick(playerId) {
        const p = this.pools.get(playerId);
        if (!p) return 0;
        const before = p.current;
        p.current = Math.min(p.max, p.current + p.rate);
        return p.current - before;
    }
    drain(playerId) {
        const p = this.pools.get(playerId);
        if (!p) return 0;
        const d = p.current;
        p.current = 0;
        p.history.push({ event: 'drain', amount: d, ts: Date.now() });
        return d;
    }
    fill(playerId) {
        const p = this.pools.get(playerId);
        if (!p) return false;
        const amount = p.max - p.current;
        p.current = p.max;
        p.history.push({ event: 'fill', amount, ts: Date.now() });
        return true;
    }

    isFull(playerId) {
        const p = this.pools.get(playerId);
        return p ? p.current >= p.max : false;
    }
    isEmpty(playerId) {
        const p = this.pools.get(playerId);
        return p ? p.current <= 0 : false;
    }
    percent(playerId) {
        const p = this.pools.get(playerId);
        if (!p || p.max === 0) return 0;
        return p.current / p.max;
    }
    canAfford(playerId, cost) { return this.currentQi(playerId) >= cost; }
    history_(playerId) { return [...(this.pools.get(playerId)?.history || [])]; }
    report() { return { totalFlows: this.stats.totalFlows, totalPools: this.pools.size }; }
    reset() { this.pools.clear(); this.stats = { totalFlows: 0 }; }
}
