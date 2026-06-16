/**
 * SealDesigner.js - 封印设计
 * V1138 Round 43 Iter 11/30
 */
export const SEAL_TYPES = ['binding', 'sealing', 'draining', 'containment', 'paralysis', 'silence'];
export const SEAL_LEVELS = ['low', 'mid', 'high', 'top', 'ultimate'];

export class SealDesigner {
    constructor(config = {}) {
        this.config = { ...config };
        this.designs = new Map();   // did -> { id, name, type, level, power, owner, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalPower: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `sd2_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    design(name, type, level = 'low', power = 1, owner = null) {
        if (!name) return null;
        if (!SEAL_TYPES.includes(type)) type = 'binding';
        if (!SEAL_LEVELS.includes(level)) level = 'low';
        const id = this._newId();
        const d = { id, name, type, level, power, owner, ts: Date.now() };
        this.designs.set(id, d);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        this.stats.total++;
        this.stats.totalPower += power;
        this._emit('designed', d);
        return d;
    }
    get(id) { return this.designs.get(id) || null; }
    listAll() { return [...this.designs.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.designs.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(d => d.type === type); }
    listByLevel(l) { return this.listAll().filter(d => d.level === l); }
    listUltimate() { return this.listByLevel('ultimate'); }

    setLevel(id, level) {
        const d = this.designs.get(id);
        if (!d) return false;
        if (!SEAL_LEVELS.includes(level)) return false;
        d.level = level;
        return true;
    }
    setPower(id, power) {
        const d = this.designs.get(id);
        if (!d) return false;
        d.power = Math.max(0, power);
        this.stats.totalPower = this.listAll().reduce((s, x) => s + x.power, 0);
        return true;
    }
    setOwner(id, owner) {
        const d = this.designs.get(id);
        if (!d) return false;
        d.owner = owner;
        return true;
    }
    isUltimate(id) { return this.designs.get(id)?.level === 'ultimate'; }
    isTop(id) { return this.designs.get(id)?.level === 'top' || this.designs.get(id)?.level === 'ultimate'; }
    powerOf(id) { return this.designs.get(id)?.power || 0; }
    levelOf(id) { return this.designs.get(id)?.level || null; }
    typeOf(id) { return this.designs.get(id)?.type || null; }
    ownerOf(id) { return this.designs.get(id)?.owner || null; }
    averagePower() { return this.stats.total === 0 ? 0 : this.stats.totalPower / this.stats.total; }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    bestPower() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, d) => !best || d.power > best.power ? d : best, null);
    }
    countByType() {
        const c = {};
        for (const t of SEAL_TYPES) c[t] = 0;
        for (const d of this.designs.values()) c[d.type] = (c[d.type] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalPower: this.stats.totalPower, averagePower: this.averagePower() }; }
    reset() { this.designs.clear(); this.byOwner.clear(); this.stats = { total: 0, totalPower: 0 }; }
}
