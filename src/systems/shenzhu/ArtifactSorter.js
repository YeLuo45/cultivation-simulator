/**
 * ArtifactSorter.js - 法宝分类
 * V1116 P-20260614-809 Round 42 Iter 19/30
 */
export const SORT_CRITERIA = ['rarity', 'power', 'type', 'level', 'name'];
export const SORT_ORDERS = ['asc', 'desc'];

export class ArtifactSorter {
    constructor(config = {}) {
        this.config = { ...config };
        this.sorts = new Map();   // sid -> { id, criteria, order, artifacts, ts }
        this.hooks = new Map();
        this.stats = { total: 0, totalArtifacts: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `as_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    sort(artifacts, criteria = 'rarity', order = 'desc') {
        if (!Array.isArray(artifacts)) return null;
        if (!SORT_CRITERIA.includes(criteria)) criteria = 'rarity';
        if (!SORT_ORDERS.includes(order)) order = 'desc';
        const id = this._newId();
        const sorted = this._doSort(artifacts, criteria, order);
        const s = { id, criteria, order, artifacts: sorted, ts: Date.now() };
        this.sorts.set(id, s);
        this.stats.total++;
        this.stats.totalArtifacts += artifacts.length;
        return s;
    }
    _doSort(artifacts, criteria, order) {
        const cmp = (a, b) => {
            let va = a[criteria], vb = b[criteria];
            if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
            if (va < vb) return order === 'asc' ? -1 : 1;
            if (va > vb) return order === 'asc' ? 1 : -1;
            return 0;
        };
        return [...artifacts].sort(cmp);
    }
    get(id) { return this.sorts.get(id) || null; }
    listAll() { return [...this.sorts.values()]; }
    listByCriteria(c) { return this.listAll().filter(s => s.criteria === c); }
    listByOrder(o) { return this.listAll().filter(s => s.order === o); }

    setCriteria(id, criteria) {
        const s = this.sorts.get(id);
        if (!s) return false;
        if (!SORT_CRITERIA.includes(criteria)) return false;
        s.criteria = criteria;
        s.artifacts = this._doSort(s.artifacts, criteria, s.order);
        return true;
    }
    setOrder(id, order) {
        const s = this.sorts.get(id);
        if (!s) return false;
        if (!SORT_ORDERS.includes(order)) return false;
        s.order = order;
        s.artifacts = this._doSort(s.artifacts, s.criteria, order);
        return true;
    }
    addArtifact(id, artifact) {
        const s = this.sorts.get(id);
        if (!s) return false;
        s.artifacts.push(artifact);
        s.artifacts = this._doSort(s.artifacts, s.criteria, s.order);
        return true;
    }
    removeArtifact(id, artifactId) {
        const s = this.sorts.get(id);
        if (!s) return false;
        s.artifacts = s.artifacts.filter(a => a.id !== artifactId);
        return true;
    }
    artifactsOf(id) { return [...(this.sorts.get(id)?.artifacts || [])]; }
    criteriaOf(id) { return this.sorts.get(id)?.criteria || null; }
    orderOf(id) { return this.sorts.get(id)?.order || null; }
    count(id) { return this.sorts.get(id)?.artifacts.length || 0; }
    topN(id, n) { return this.artifactsOf(id).slice(0, n); }
    bottomN(id, n) { return this.artifactsOf(id).slice(-n); }
    countByCriteria() {
        const c = {};
        for (const cr of SORT_CRITERIA) c[cr] = 0;
        for (const s of this.sorts.values()) c[s.criteria] = (c[s.criteria] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalArtifacts: this.stats.totalArtifacts }; }
    reset() { this.sorts.clear(); this.stats = { total: 0, totalArtifacts: 0 }; }
}
