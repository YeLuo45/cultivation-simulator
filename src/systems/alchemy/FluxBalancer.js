/**
 * FluxBalancer.js - 流转平衡器
 * V1047 P-20260614-237 Round 40 Iter 10/30
 */
export const FLUX_TYPES = ['qi', 'heat', 'essence', 'time', 'pressure'];

export class FluxBalancer {
    constructor(config = {}) {
        this.config = { ...config };
        this.fluxes = new Map();   // fluxId -> { id, type, rate, balance, target, history }
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `flx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(type, target = 0, rate = 1) {
        if (!FLUX_TYPES.includes(type)) return null;
        const id = this._newId();
        const f = { id, type, rate, target, balance: 0, history: [] };
        this.fluxes.set(id, f);
        this.stats.total++;
        return f;
    }
    get(id) { return this.fluxes.get(id) || null; }
    listAll() { return [...this.fluxes.values()]; }
    listByType(type) { return this.listAll().filter(f => f.type === type); }

    setRate(id, rate) {
        const f = this.fluxes.get(id);
        if (!f) return false;
        f.rate = rate;
        return true;
    }
    setTarget(id, target) {
        const f = this.fluxes.get(id);
        if (!f) return false;
        f.target = target;
        return true;
    }
    feed(id, amount) {
        const f = this.fluxes.get(id);
        if (!f) return false;
        if (typeof amount !== 'number') return false;
        f.balance += amount;
        f.history.push({ type: 'feed', amount, ts: Date.now() });
        if (f.history.length > 50) f.history.shift();
        return true;
    }
    drain(id, amount) {
        const f = this.fluxes.get(id);
        if (!f) return false;
        if (typeof amount !== 'number') return false;
        f.balance -= amount;
        f.history.push({ type: 'drain', amount, ts: Date.now() });
        if (f.history.length > 50) f.history.shift();
        return true;
    }
    tick(id) {
        const f = this.fluxes.get(id);
        if (!f) return 0;
        const before = f.balance;
        f.balance += f.rate;
        return f.balance - before;
    }
    isBalanced(id) {
        const f = this.fluxes.get(id);
        if (!f) return false;
        return Math.abs(f.balance - f.target) < 5;
    }
    distance(id) {
        const f = this.fluxes.get(id);
        return f ? Math.abs(f.balance - f.target) : 0;
    }
    balance(id) { return this.fluxes.get(id)?.balance || 0; }
    history(id) { return [...(this.fluxes.get(id)?.history || [])]; }
    report() { return { total: this.stats.total }; }
    reset() { this.fluxes.clear(); this.stats = { total: 0 }; }
}
