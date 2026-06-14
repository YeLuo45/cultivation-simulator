/**
 * IntelArchive.js - 情报档案
 * V1095 P-20260614-422 Round 41 Iter 28/30
 */
export const ARCHIVE_CATEGORIES = ['rumor', 'report', 'analysis', 'intercept', 'testimony'];
export const CLASSIFICATION = ['public', 'restricted', 'confidential', 'top_secret'];

export class IntelArchive {
    constructor(config = {}) {
        this.config = { ...config };
        this.entries = new Map();   // entId -> { id, title, content, category, classification, ts, tags }
        this.byCategory = new Map();
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `arc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    archive(title, content, category, classification = 'restricted', tags = []) {
        if (!title) return null;
        if (!ARCHIVE_CATEGORIES.includes(category)) category = 'report';
        if (!CLASSIFICATION.includes(classification)) classification = 'restricted';
        if (!Array.isArray(tags)) tags = [];
        const id = this._newId();
        const e = { id, title, content, category, classification, tags: [...tags], ts: Date.now() };
        this.entries.set(id, e);
        if (!this.byCategory.has(category)) this.byCategory.set(category, new Set());
        this.byCategory.get(category).add(id);
        this.stats.total++;
        return e;
    }
    get(id) { return this.entries.get(id) || null; }
    listAll() { return [...this.entries.values()]; }
    listByCategory(cat) {
        const ids = this.byCategory.get(cat) || new Set();
        return [...ids].map(id => this.entries.get(id)).filter(Boolean);
    }
    listByClassification(c) { return this.listAll().filter(e => e.classification === c); }
    listByTag(tag) { return this.listAll().filter(e => e.tags.includes(tag)); }

    addTag(id, tag) {
        const e = this.entries.get(id);
        if (!e) return false;
        if (e.tags.includes(tag)) return false;
        e.tags.push(tag);
        return true;
    }
    removeTag(id, tag) {
        const e = this.entries.get(id);
        if (!e) return false;
        e.tags = e.tags.filter(t => t !== tag);
        return true;
    }
    setClassification(id, level) {
        const e = this.entries.get(id);
        if (!e) return false;
        if (!CLASSIFICATION.includes(level)) return false;
        e.classification = level;
        return true;
    }
    search(query) {
        const q = (query || '').toLowerCase();
        if (!q) return [];
        return this.listAll().filter(e => e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q));
    }
    isTopSecret(id) { return this.entries.get(id)?.classification === 'top_secret'; }
    classificationOf(id) { return this.entries.get(id)?.classification || null; }
    tagsOf(id) { return [...(this.entries.get(id)?.tags || [])]; }
    hasTag(id, tag) { return (this.entries.get(id)?.tags || []).includes(tag); }
    countByCategory() {
        const c = {};
        for (const cat of ARCHIVE_CATEGORIES) c[cat] = 0;
        for (const e of this.entries.values()) c[e.category] = (c[e.category] || 0) + 1;
        return c;
    }
    recent(n = 10) { return this.listAll().sort((a, b) => b.ts - a.ts).slice(0, n); }
    report() { return { total: this.stats.total }; }
    reset() { this.entries.clear(); this.byCategory.clear(); this.stats = { total: 0 }; }
}
