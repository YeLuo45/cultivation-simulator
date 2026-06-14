/**
 * InformantNetwork.js - 情报网络
 * V1068 P-20260614-262 Round 41 Iter 1/30 Direction D 仙道情报司
 */
export const INFORMANT_STATUS = ['active', 'dormant', 'compromised', 'lost', 'retired'];
export const LOYALTY_LEVELS = ['questionable', 'loyal', 'devoted', 'fanatic'];

export class InformantNetwork {
    constructor(config = {}) {
        this.config = { ...config };
        this.informants = new Map();   // informantId -> { id, name, location, loyalty, status, reliability, recruitedAt }
        this.byLocation = new Map();
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `inf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    recruit(name, location, loyalty = 'loyal', reliability = 0.7) {
        if (!name) return null;
        if (!LOYALTY_LEVELS.includes(loyalty)) loyalty = 'loyal';
        const id = this._newId();
        const i = { id, name, location, loyalty, status: 'active', reliability, recruitedAt: Date.now() };
        this.informants.set(id, i);
        if (!this.byLocation.has(location)) this.byLocation.set(location, new Set());
        this.byLocation.get(location).add(id);
        this.stats.total++;
        this._emit('recruited', i);
        return i;
    }
    get(id) { return this.informants.get(id) || null; }
    listAll() { return [...this.informants.values()]; }
    listByStatus(st) { return this.listAll().filter(i => i.status === st); }
    listByLocation(loc) {
        const ids = this.byLocation.get(loc) || new Set();
        return [...ids].map(id => this.informants.get(id)).filter(Boolean);
    }
    listByLoyalty(loyalty) { return this.listAll().filter(i => i.loyalty === loyalty); }
    listActive() { return this.listByStatus('active'); }

    setStatus(id, status) {
        const i = this.informants.get(id);
        if (!i) return false;
        if (!INFORMANT_STATUS.includes(status)) return false;
        i.status = status;
        return true;
    }
    setLoyalty(id, loyalty) {
        const i = this.informants.get(id);
        if (!i) return false;
        if (!LOYALTY_LEVELS.includes(loyalty)) return false;
        i.loyalty = loyalty;
        return true;
    }
    setReliability(id, value) {
        const i = this.informants.get(id);
        if (!i) return false;
        i.reliability = Math.max(0, Math.min(1, value));
        return true;
    }
    relocate(id, newLocation) {
        const i = this.informants.get(id);
        if (!i) return false;
        const oldLocation = i.location;
        if (this.byLocation.has(oldLocation)) {
            this.byLocation.get(oldLocation).delete(id);
        }
        i.location = newLocation;
        if (!this.byLocation.has(newLocation)) this.byLocation.set(newLocation, new Set());
        this.byLocation.get(newLocation).add(id);
        return true;
    }
    isActive(id) { return this.informants.get(id)?.status === 'active'; }
    isCompromised(id) { return this.informants.get(id)?.status === 'compromised'; }
    reliabilityOf(id) { return this.informants.get(id)?.reliability || 0; }
    loyaltyOf(id) { return this.informants.get(id)?.loyalty || null; }
    averageReliability() {
        if (this.informants.size === 0) return 0;
        return this.listAll().reduce((s, i) => s + i.reliability, 0) / this.informants.size;
    }
    report() { return { total: this.stats.total, active: this.listActive().length, averageReliability: this.averageReliability() }; }
    reset() { this.informants.clear(); this.byLocation.clear(); this.stats = { total: 0 }; }
}
