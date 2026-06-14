/**
 * MeridianActivator.js - 经脉激活器
 * V1052 P-20260614-242 Round 40 Iter 15/30
 */
export const MERIDIAN_TYPES = ['ren', 'du', 'chong', 'dai', 'yin_qiao', 'yang_qiao', 'yin_wei', 'yang_wei'];
export const MAX_ENERGY = 1000;

export class MeridianActivator {
    constructor(config = {}) {
        this.config = { maxEnergy: config.maxEnergy || MAX_ENERGY, ...config };
        this.meridians = new Map();   // meridianId -> { id, type, energy, activated, owner, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalActivations: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `mer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(meridianType, owner) {
        if (!MERIDIAN_TYPES.includes(meridianType)) return null;
        if (!owner) return null;
        const id = this._newId();
        const m = { id, type: meridianType, energy: 0, activated: false, owner, createdAt: Date.now() };
        this.meridians.set(id, m);
        if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
        this.byOwner.get(owner).push(id);
        this.stats.total++;
        return m;
    }
    get(id) { return this.meridians.get(id) || null; }
    listAll() { return [...this.meridians.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.meridians.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(m => m.type === type); }
    listActivated() { return this.listAll().filter(m => m.activated); }
    listForOwnerByType(owner, type) { return this.listByOwner(owner).filter(m => m.type === type); }

    addEnergy(id, amount) {
        const m = this.meridians.get(id);
        if (!m) return false;
        m.energy = Math.min(this.config.maxEnergy, m.energy + amount);
        if (m.energy >= this.config.maxEnergy && !m.activated) {
            m.activated = true;
            m.activatedAt = Date.now();
            this.stats.totalActivations++;
            this._emit('activated', m);
        }
        return true;
    }
    activate(id) {
        const m = this.meridians.get(id);
        if (!m) return false;
        if (m.activated) return false;
        m.energy = this.config.maxEnergy;
        m.activated = true;
        m.activatedAt = Date.now();
        this.stats.totalActivations++;
        this._emit('activated', m);
        return true;
    }
    setEnergy(id, value) {
        const m = this.meridians.get(id);
        if (!m) return false;
        m.energy = Math.max(0, Math.min(this.config.maxEnergy, value));
        if (m.energy >= this.config.maxEnergy && !m.activated) {
            m.activated = true;
            m.activatedAt = Date.now();
            this.stats.totalActivations++;
        }
        return true;
    }
    progress(id) {
        const m = this.meridians.get(id);
        if (!m) return 0;
        return m.energy / this.config.maxEnergy;
    }
    isActivated(id) { return this.meridians.get(id)?.activated || false; }
    energyOf(id) { return this.meridians.get(id)?.energy || 0; }
    activatedCount(owner) { return this.listByOwner(owner).filter(m => m.activated).length; }
    ownerProgress(owner) {
        const list = this.listByOwner(owner);
        if (list.length === 0) return 0;
        return list.filter(m => m.activated).length / list.length;
    }
    report() { return { total: this.stats.total, totalActivations: this.stats.totalActivations }; }
    reset() { this.meridians.clear(); this.byOwner.clear(); this.stats = { total: 0, totalActivations: 0 }; }
}
