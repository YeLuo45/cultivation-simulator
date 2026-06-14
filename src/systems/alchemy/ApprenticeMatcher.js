/**
 * ApprenticeMatcher.js - 学徒匹配器
 * V1061 P-20260614-251 Round 40 Iter 24/30
 */
export const APPRENTICESHIP_STATUS = ['pending', 'active', 'completed', 'failed'];
export const APPRENTICESHIP_TYPES = ['crafting', 'combat', 'meditation', 'lore'];

export class ApprenticeMatcher {
    constructor(config = {}) {
        this.config = { ...config };
        this.relationships = new Map();   // relId -> { id, master, apprentice, type, status, startedAt, endedAt }
        this.byMaster = new Map();
        this.byApprentice = new Map();
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `apr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    match(master, apprentice, type = 'crafting') {
        if (!master || !apprentice) return null;
        if (!APPRENTICESHIP_TYPES.includes(type)) type = 'crafting';
        const id = this._newId();
        const r = { id, master, apprentice, type, status: 'pending', startedAt: null, endedAt: null };
        this.relationships.set(id, r);
        if (!this.byMaster.has(master)) this.byMaster.set(master, []);
        this.byMaster.get(master).push(id);
        if (!this.byApprentice.has(apprentice)) this.byApprentice.set(apprentice, []);
        this.byApprentice.get(apprentice).push(id);
        this.stats.total++;
        return r;
    }
    get(id) { return this.relationships.get(id) || null; }
    listAll() { return [...this.relationships.values()]; }
    listByMaster(master) {
        const ids = this.byMaster.get(master) || [];
        return ids.map(id => this.relationships.get(id)).filter(Boolean);
    }
    listByApprentice(apprentice) {
        const ids = this.byApprentice.get(apprentice) || [];
        return ids.map(id => this.relationships.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(r => r.type === type); }
    listByStatus(st) { return this.listAll().filter(r => r.status === st); }

    start(id) {
        const r = this.relationships.get(id);
        if (!r) return false;
        if (r.status !== 'pending') return false;
        r.status = 'active';
        r.startedAt = Date.now();
        return true;
    }
    complete(id) {
        const r = this.relationships.get(id);
        if (!r) return false;
        if (r.status !== 'active') return false;
        r.status = 'completed';
        r.endedAt = Date.now();
        return true;
    }
    fail(id) {
        const r = this.relationships.get(id);
        if (!r) return false;
        r.status = 'failed';
        r.endedAt = Date.now();
        return true;
    }
    isActive(id) { return this.relationships.get(id)?.status === 'active'; }
    activeApprentices(master) { return this.listByMaster(master).filter(r => r.status === 'active'); }
    activeMaster(apprentice) { return this.listByApprentice(apprentice).filter(r => r.status === 'active'); }
    masterFor(apprentice) {
        const list = this.activeMaster(apprentice);
        return list[0]?.master || null;
    }
    apprenticeCount(master) { return this.listByMaster(master).filter(r => r.status === 'active').length; }
    report() { return { total: this.stats.total }; }
    reset() { this.relationships.clear(); this.byMaster.clear(); this.byApprentice.clear(); this.stats = { total: 0 }; }
}
