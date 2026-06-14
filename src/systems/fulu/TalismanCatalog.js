/**
 * TalismanCatalog.js - 符箓总目
 * V1153 Round 43 Iter 26/30
 */
export const CATALOG_STATUS = ['active', 'draft', 'archived', 'restricted', 'legendary'];
export const CATALOG_KINDS = ['combat', 'ritual', 'communication', 'storage', 'transport', 'protection'];

export class TalismanCatalog {
    constructor(config = {}) {
        this.config = { ...config };
        this.entries = new Map();   // eid -> { id, name, kind, status, power, school, ts }
        this.byKind = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalPower: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `tc3_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    addEntry(name, kind, school = 'common', power = 1, status = 'active') {
        if (!name) return null;
        if (!CATALOG_KINDS.includes(kind)) kind = 'combat';
        if (!CATALOG_STATUS.includes(status)) status = 'active';
        const id = this._newId();
        const e = { id, name, kind, status, power, school, ts: Date.now() };
        this.entries.set(id, e);
        if (!this.byKind.has(kind)) this.byKind.set(kind, new Set());
        this.byKind.get(kind).add(id);
        this.stats.total++;
        this.stats.totalPower += power;
        return e;
    }
    get(id) { return this.entries.get(id) || null; }
    listAll() { return [...this.entries.values()]; }
    listByKind(k) {
        const ids = this.byKind.get(k) || new Set();
        return [...ids].map(id => this.entries.get(id)).filter(Boolean);
    }
    listByStatus(st) { return this.listAll().filter(e => e.status === st); }
    listBySchool(sc) { return this.listAll().filter(e => e.school === sc); }
    listLegendary() { return this.listByStatus('legendary'); }

    setPower(id, power) {
        const e = this.entries.get(id);
        if (!e) return false;
        e.power = Math.max(0, power);
        this.stats.totalPower = this.listAll().reduce((s, x) => s + x.power, 0);
        return true;
    }
    setStatus(id, status) {
        const e = this.entries.get(id);
        if (!e) return false;
        if (!CATALOG_STATUS.includes(status)) return false;
        e.status = status;
        return true;
    }
    isLegendary(id) { return this.entries.get(id)?.status === 'legendary'; }
    powerOf(id) { return this.entries.get(id)?.power || 0; }
    kindOf(id) { return this.entries.get(id)?.kind || null; }
    schoolOf(id) { return this.entries.get(id)?.school || null; }
    averagePower() { return this.stats.total === 0 ? 0 : this.stats.totalPower / this.stats.total; }
    bestPower() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, e) => !best || e.power > best.power ? e : best, null);
    }
    countByKind() {
        const c = {};
        for (const k of CATALOG_KINDS) c[k] = 0;
        for (const e of this.entries.values()) c[e.kind] = (c[e.kind] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalPower: this.stats.totalPower, averagePower: this.averagePower() }; }
    reset() { this.entries.clear(); this.byKind.clear(); this.stats = { total: 0, totalPower: 0 }; }
}
