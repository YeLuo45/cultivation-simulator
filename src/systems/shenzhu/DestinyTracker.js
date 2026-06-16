/**
 * DestinyTracker.js - 命运追踪
 * V1126 P-20260614-819 Round 42 Iter 29/30
 */
export const DESTINY_STATUS = ['undetermined', 'forming', 'manifested', 'fulfilled', 'broken'];
export const DESTINY_TYPES = ['romance', 'combat', 'cultivation', 'wealth', 'power', 'longevity'];

export class DestinyTracker {
    constructor(config = {}) {
        this.config = { ...config };
        this.destinies = new Map();   // did -> { id, owner, type, status, strength, partner, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalFulfilled: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `dt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    forge(owner, type, strength = 0.5, partner = null) {
        if (!owner) return null;
        if (!DESTINY_TYPES.includes(type)) type = 'cultivation';
        const id = this._newId();
        const d = { id, owner, type, status: 'forming', strength: Math.max(0, Math.min(1, strength)), partner, ts: Date.now() };
        this.destinies.set(id, d);
        if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
        this.byOwner.get(owner).push(id);
        this.stats.total++;
        this._emit('forged', d);
        return d;
    }
    get(id) { return this.destinies.get(id) || null; }
    listAll() { return [...this.destinies.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.destinies.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(d => d.type === type); }
    listByStatus(st) { return this.listAll().filter(d => d.status === st); }
    listManifested() { return this.listByStatus('manifested'); }
    listFulfilled() { return this.listByStatus('fulfilled'); }

    setStatus(id, status) {
        const d = this.destinies.get(id);
        if (!d) return false;
        if (!DESTINY_STATUS.includes(status)) return false;
        d.status = status;
        if (status === 'fulfilled') {
            this.stats.totalFulfilled++;
            this._emit('fulfilled', d);
        } else if (status === 'broken') {
            this._emit('broken', d);
        }
        return true;
    }
    manifest(id) { return this.setStatus(id, 'manifested'); }
    fulfill(id) { return this.setStatus(id, 'fulfilled'); }
    break_(id) { return this.setStatus(id, 'broken'); }
    reset_(id) { return this.setStatus(id, 'forming'); }
    setStrength(id, strength) {
        const d = this.destinies.get(id);
        if (!d) return false;
        d.strength = Math.max(0, Math.min(1, strength));
        return true;
    }
    setPartner(id, partner) {
        const d = this.destinies.get(id);
        if (!d) return false;
        d.partner = partner;
        return true;
    }
    isManifested(id) { return this.destinies.get(id)?.status === 'manifested'; }
    isFulfilled(id) { return this.destinies.get(id)?.status === 'fulfilled'; }
    isBroken(id) { return this.destinies.get(id)?.status === 'broken'; }
    isForming(id) { return this.destinies.get(id)?.status === 'forming'; }
    strengthOf(id) { return this.destinies.get(id)?.strength || 0; }
    typeOf(id) { return this.destinies.get(id)?.type || null; }
    partnerOf(id) { return this.destinies.get(id)?.partner || null; }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    strengthFor(owner) {
        const list = this.listByOwner(owner);
        if (list.length === 0) return 0;
        return list.reduce((s, d) => s + d.strength, 0);
    }
    averageStrength() {
        if (this.destinies.size === 0) return 0;
        return this.listAll().reduce((s, d) => s + d.strength, 0) / this.destinies.size;
    }
    fulfillmentRate() { return this.stats.total === 0 ? 0 : this.stats.totalFulfilled / this.stats.total; }
    bestFor(owner) {
        const list = this.listByOwner(owner);
        if (list.length === 0) return null;
        return list.reduce((best, d) => !best || d.strength > best.strength ? d : best, null);
    }
    countByType() {
        const c = {};
        for (const t of DESTINY_TYPES) c[t] = 0;
        for (const d of this.destinies.values()) c[d.type] = (c[d.type] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalFulfilled: this.stats.totalFulfilled, fulfillmentRate: this.fulfillmentRate() }; }
    reset() { this.destinies.clear(); this.byOwner.clear(); this.stats = { total: 0, totalFulfilled: 0 }; }
}
