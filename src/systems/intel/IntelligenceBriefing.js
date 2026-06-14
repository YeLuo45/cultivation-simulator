/**
 * IntelligenceBriefing.js - 情报简报
 * V1093 P-20260614-420 Round 41 Iter 26/30
 */
export const BRIEFING_LEVELS = ['routine', 'priority', 'urgent', 'critical'];
export const BRIEFING_STATUS = ['drafting', 'review', 'published', 'archived'];

export class IntelligenceBriefing {
    constructor(config = {}) {
        this.config = { ...config };
        this.briefings = new Map();   // briefId -> { id, title, level, status, items, ts }
        this.hooks = new Map();
        this.stats = { total: 0, published: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `brf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(title, level = 'routine') {
        if (!title) return null;
        if (!BRIEFING_LEVELS.includes(level)) level = 'routine';
        const id = this._newId();
        const b = { id, title, level, status: 'drafting', items: [], ts: Date.now() };
        this.briefings.set(id, b);
        this.stats.total++;
        return b;
    }
    get(id) { return this.briefings.get(id) || null; }
    listAll() { return [...this.briefings.values()]; }
    listByStatus(st) { return this.listAll().filter(b => b.status === st); }
    listByLevel(level) { return this.listAll().filter(b => b.level === level); }
    listPublished() { return this.listByStatus('published'); }

    addItem(briefId, content) {
        const b = this.briefings.get(briefId);
        if (!b) return false;
        if (!content) return false;
        b.items.push({ content, ts: Date.now() });
        return true;
    }
    removeItem(briefId, index) {
        const b = this.briefings.get(briefId);
        if (!b) return false;
        if (index < 0 || index >= b.items.length) return false;
        b.items.splice(index, 1);
        return true;
    }
    setStatus(id, status) {
        const b = this.briefings.get(id);
        if (!b) return false;
        if (!BRIEFING_STATUS.includes(status)) return false;
        b.status = status;
        if (status === 'published') {
            this.stats.published++;
            b.publishedAt = Date.now();
            this._emit('published', b);
        }
        return true;
    }
    setLevel(id, level) {
        const b = this.briefings.get(id);
        if (!b) return false;
        if (!BRIEFING_LEVELS.includes(level)) return false;
        b.level = level;
        return true;
    }
    review(id) { return this.setStatus(id, 'review'); }
    publish(id) { return this.setStatus(id, 'published'); }
    archive(id) { return this.setStatus(id, 'archived'); }
    isPublished(id) { return this.briefings.get(id)?.status === 'published'; }
    isCritical(id) {
        const l = this.briefings.get(id)?.level;
        return l === 'urgent' || l === 'critical';
    }
    itemCount(id) { return this.briefings.get(id)?.items.length || 0; }
    levelOf(id) { return this.briefings.get(id)?.level || null; }
    items(id) { return [...(this.briefings.get(id)?.items || [])]; }
    mostRecent() {
        const list = this.listPublished();
        if (list.length === 0) return null;
        return list.reduce((best, b) => !best || (b.publishedAt || 0) > (best.publishedAt || 0) ? b : best, null);
    }
    report() { return { total: this.stats.total, published: this.stats.published }; }
    reset() { this.briefings.clear(); this.stats = { total: 0, published: 0 }; }
}
