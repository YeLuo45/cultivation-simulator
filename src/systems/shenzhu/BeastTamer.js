/**
 * BeastTamer.js - 驭兽师
 * V1109 P-20260614-802 Round 42 Iter 12/30
 */
export const TAMER_LEVELS = ['novice', 'adept', 'master', 'grandmaster', 'legendary'];
export const TAMER_STATUS = ['available', 'taming', 'resting', 'retired'];

export class BeastTamer {
    constructor(config = {}) {
        this.config = { ...config };
        this.tamers = new Map();   // tid -> { id, name, level, status, beastsTamed, owner, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalTamed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `tm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    hire(name, level = 'novice', owner = null) {
        if (!name) return null;
        if (!TAMER_LEVELS.includes(level)) level = 'novice';
        const id = this._newId();
        const t = { id, name, level, status: 'available', beastsTamed: 0, owner, ts: Date.now() };
        this.tamers.set(id, t);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        this.stats.total++;
        return t;
    }
    get(id) { return this.tamers.get(id) || null; }
    listAll() { return [...this.tamers.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.tamers.get(id)).filter(Boolean);
    }
    listByLevel(level) { return this.listAll().filter(t => t.level === level); }
    listByStatus(st) { return this.listAll().filter(t => t.status === st); }
    listAvailable() { return this.listByStatus('available'); }

    setStatus(id, status) {
        const t = this.tamers.get(id);
        if (!t) return false;
        if (!TAMER_STATUS.includes(status)) return false;
        t.status = status;
        return true;
    }
    setLevel(id, level) {
        const t = this.tamers.get(id);
        if (!t) return false;
        if (!TAMER_LEVELS.includes(level)) return false;
        t.level = level;
        return true;
    }
    tame(id) {
        const t = this.tamers.get(id);
        if (!t) return false;
        if (t.status !== 'available') return false;
        t.beastsTamed++;
        this.stats.totalTamed++;
        this._emit('tamed', t);
        return true;
    }
    rest(id) { return this.setStatus(id, 'resting'); }
    retire(id) { return this.setStatus(id, 'retired'); }
    isAvailable(id) { return this.tamers.get(id)?.status === 'available'; }
    isLegendary(id) { return this.tamers.get(id)?.level === 'legendary'; }
    isRetired(id) { return this.tamers.get(id)?.status === 'retired'; }
    tamedCount(id) { return this.tamers.get(id)?.beastsTamed || 0; }
    levelOf(id) { return this.tamers.get(id)?.level || null; }
    ownerOf(id) { return this.tamers.get(id)?.owner || null; }
    averageTamed() {
        if (this.tamers.size === 0) return 0;
        return this.listAll().reduce((s, t) => s + t.beastsTamed, 0) / this.tamers.size;
    }
    best() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, t) => !best || t.beastsTamed > best.beastsTamed ? t : best, null);
    }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    countByLevel() {
        const c = {};
        for (const l of TAMER_LEVELS) c[l] = 0;
        for (const t of this.tamers.values()) c[t.level] = (c[t.level] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalTamed: this.stats.totalTamed }; }
    reset() { this.tamers.clear(); this.byOwner.clear(); this.stats = { total: 0, totalTamed: 0 }; }
}
