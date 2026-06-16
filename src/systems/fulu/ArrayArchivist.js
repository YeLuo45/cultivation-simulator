/**
 * ArrayArchivist.js - 符阵归档
 * V1152 Round 43 Iter 25/30
 */
export const ARCHIVE_STATUS = ['draft', 'submitted', 'reviewed', 'archived', 'deprecated'];
export const ARCHIVE_CATEGORIES = ['combat', 'defense', 'utility', 'experimental', 'classified'];

export class ArrayArchivist {
    constructor(config = {}) {
        this.config = { ...config };
        this.entries = new Map();   // eid -> { id, name, array, status, category, owner, ts }
        this.byOwner = new Map();
        this.byCategory = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalArchived: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ar_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    record(name, array, category = 'combat', owner = null) {
        if (!name || !array) return null;
        if (!ARCHIVE_CATEGORIES.includes(category)) category = 'combat';
        const id = this._newId();
        const e = { id, name, array, status: 'draft', category, owner, ts: Date.now() };
        this.entries.set(id, e);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        if (!this.byCategory.has(category)) this.byCategory.set(category, new Set());
        this.byCategory.get(category).add(id);
        this.stats.total++;
        return e;
    }
    get(id) { return this.entries.get(id) || null; }
    listAll() { return [...this.entries.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.entries.get(id)).filter(Boolean);
    }
    listByCategory(c) {
        const ids = this.byCategory.get(c) || new Set();
        return [...ids].map(id => this.entries.get(id)).filter(Boolean);
    }
    listByStatus(st) { return this.listAll().filter(e => e.status === st); }
    listArchived() { return this.listByStatus('archived'); }
    listDeprecated() { return this.listByStatus('deprecated'); }

    setStatus(id, status) {
        const e = this.entries.get(id);
        if (!e) return false;
        if (!ARCHIVE_STATUS.includes(status)) return false;
        e.status = status;
        if (status === 'archived') {
            this.stats.totalArchived++;
            this._emit('archived', e);
        }
        return true;
    }
    submit(id) { return this.setStatus(id, 'submitted'); }
    review(id) { return this.setStatus(id, 'reviewed'); }
    archive(id) { return this.setStatus(id, 'archived'); }
    deprecate(id) { return this.setStatus(id, 'deprecated'); }
    setCategory(id, category) {
        const e = this.entries.get(id);
        if (!e) return false;
        if (!ARCHIVE_CATEGORIES.includes(category)) return false;
        if (this.byCategory.has(e.category)) this.byCategory.get(e.category).delete(id);
        e.category = category;
        if (!this.byCategory.has(category)) this.byCategory.set(category, new Set());
        this.byCategory.get(category).add(id);
        return true;
    }
    isArchived(id) { return this.entries.get(id)?.status === 'archived'; }
    isDeprecated(id) { return this.entries.get(id)?.status === 'deprecated'; }
    isSubmitted(id) { return this.entries.get(id)?.status === 'submitted'; }
    isReviewed(id) { return this.entries.get(id)?.status === 'reviewed'; }
    categoryOf(id) { return this.entries.get(id)?.category || null; }
    arrayOf(id) { return this.entries.get(id)?.array || null; }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    categoryCount(c) { return this.listByCategory(c).length; }
    archiveRate() { return this.stats.total === 0 ? 0 : this.stats.totalArchived / this.stats.total; }
    countByStatus() {
        const c = {};
        for (const st of ARCHIVE_STATUS) c[st] = 0;
        for (const e of this.entries.values()) c[e.status] = (c[e.status] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalArchived: this.stats.totalArchived, archiveRate: this.archiveRate() }; }
    reset() { this.entries.clear(); this.byOwner.clear(); this.byCategory.clear(); this.stats = { total: 0, totalArchived: 0 }; }
}
