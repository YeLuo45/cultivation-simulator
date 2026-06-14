/**
 * CulturalExchange.js - 文化交流
 * V1002 P-20260614-162 Round 38 Iter 25/30
 */
export const EXCHANGE_TYPES = ['technique', 'lore', 'tradition', 'artifact', 'language'];
export const DEFAULT_FLOW_RATE = 1.0;

export class CulturalExchange {
    constructor(config = {}) {
        this.config = { defaultFlowRate: config.defaultFlowRate || DEFAULT_FLOW_RATE, ...config };
        this.flows = new Map();   // flowId -> { id, type, from, to, content, value, ts }
        this.byParty = new Map(); // partyId -> [flowId]
        this.hooks = new Map();
        this.stats = { total: 0, totalValue: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `exc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    transfer(from, to, type, content, value = 1) {
        if (!from || !to) return null;
        if (!EXCHANGE_TYPES.includes(type)) return null;
        if (typeof value !== 'number' || value <= 0) return null;
        const id = this._newId();
        const f = { id, from, to, type, content, value, ts: Date.now() };
        this.flows.set(id, f);
        if (!this.byParty.has(from)) this.byParty.set(from, []);
        this.byParty.get(from).push(id);
        if (!this.byParty.has(to)) this.byParty.set(to, []);
        this.byParty.get(to).push(id);
        this.stats.total++;
        this.stats.totalValue += value;
        this._emit('transferred', f);
        return f;
    }
    get(id) { return this.flows.get(id) || null; }
    listAll() { return [...this.flows.values()]; }
    listByParty(party) {
        const ids = this.byParty.get(party) || [];
        return ids.map(id => this.flows.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(f => f.type === type); }
    listFromTo(from, to) { return this.listAll().filter(f => f.from === from && f.to === to); }

    inflow(party) { return this.listByParty(party).filter(f => f.to === party).reduce((s, f) => s + f.value, 0); }
    outflow(party) { return this.listByParty(party).filter(f => f.from === party).reduce((s, f) => s + f.value, 0); }
    netFlow(party) { return this.inflow(party) - this.outflow(party); }
    influenceBalance(party) {
        const total = this.inflow(party) + this.outflow(party);
        if (total === 0) return 0;
        return (this.inflow(party) - this.outflow(party)) / total;
    }

    topInfluencers(n = 5) {
        const influence = new Map();
        for (const f of this.flows.values()) {
            if (f.to === f.from) continue;
            influence.set(f.to, (influence.get(f.to) || 0) + f.value);
        }
        return [...influence.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
    }
    isInfluencer(party, threshold = 50) {
        return this.inflow(party) >= threshold;
    }
    cultureMix(party) {
        const result = {};
        for (const t of EXCHANGE_TYPES) result[t] = 0;
        for (const f of this.listByParty(party)) {
            if (f.to === party) result[f.type] = (result[f.type] || 0) + f.value;
        }
        return result;
    }
    report() {
        return { total: this.stats.total, totalValue: this.stats.totalValue, parties: this.byParty.size };
    }
    reset() { this.flows.clear(); this.byParty.clear(); this.stats = { total: 0, totalValue: 0 }; }
}
