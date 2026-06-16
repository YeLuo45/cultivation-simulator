/**
 * TalismanSorter.js - 符箓分类
 * V1154 Round 43 Iter 27/30
 */
export const SORT_KEYS = ['name', 'rarity', 'power', 'type', 'charges', 'level'];
export const SORT_DIRECTIONS = ['asc', 'desc'];

export class TalismanSorter {
    constructor(config = {}) {
        this.config = { ...config };
        this.sorts = new Map();   // sid -> { id, talismans, key, direction, ts }
        this.hooks = new Map();
        this.stats = { total: 0, totalItems: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ts_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    sort(talismans, key = 'rarity', direction = 'desc') {
        if (!Array.isArray(talismans)) return null;
        if (!SORT_KEYS.includes(key)) key = 'rarity';
        if (!SORT_DIRECTIONS.includes(direction)) direction = 'desc';
        const id = this._newId();
        const sorted = this._doSort(talismans, key, direction);
        const s = { id, talismans: sorted, key, direction, ts: Date.now() };
        this.sorts.set(id, s);
        this.stats.total++;
        this.stats.totalItems += talismans.length;
        return s;
    }
    _doSort(talismans, key, direction) {
        const cmp = (a, b) => {
            let va = a[key], vb = b[key];
            if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
            if (va < vb) return direction === 'asc' ? -1 : 1;
            if (va > vb) return direction === 'asc' ? 1 : -1;
            return 0;
        };
        return [...talismans].sort(cmp);
    }
    get(id) { return this.sorts.get(id) || null; }
    listAll() { return [...this.sorts.values()]; }
    listByKey(k) { return this.listAll().filter(s => s.key === k); }
    listByDirection(d) { return this.listAll().filter(s => s.direction === d); }

    setKey(id, key) {
        const s = this.sorts.get(id);
        if (!s) return false;
        if (!SORT_KEYS.includes(key)) return false;
        s.key = key;
        s.talismans = this._doSort(s.talismans, key, s.direction);
        return true;
    }
    setDirection(id, direction) {
        const s = this.sorts.get(id);
        if (!s) return false;
        if (!SORT_DIRECTIONS.includes(direction)) return false;
        s.direction = direction;
        s.talismans = this._doSort(s.talismans, s.key, direction);
        return true;
    }
    addItem(id, item) {
        const s = this.sorts.get(id);
        if (!s) return false;
        s.talismans.push(item);
        s.talismans = this._doSort(s.talismans, s.key, s.direction);
        return true;
    }
    removeItem(id, itemId) {
        const s = this.sorts.get(id);
        if (!s) return false;
        s.talismans = s.talismans.filter(t => t.id !== itemId);
        return true;
    }
    talismansOf(id) { return [...(this.sorts.get(id)?.talismans || [])]; }
    keyOf(id) { return this.sorts.get(id)?.key || null; }
    directionOf(id) { return this.sorts.get(id)?.direction || null; }
    countOf(id) { return this.sorts.get(id)?.talismans.length || 0; }
    topN(id, n) { return this.talismansOf(id).slice(0, n); }
    bottomN(id, n) { return this.talismansOf(id).slice(-n); }
    countByKey() {
        const c = {};
        for (const k of SORT_KEYS) c[k] = 0;
        for (const s of this.sorts.values()) c[s.key] = (c[s.key] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalItems: this.stats.totalItems }; }
    reset() { this.sorts.clear(); this.stats = { total: 0, totalItems: 0 }; }
}
