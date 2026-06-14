/**
 * CultivationDiary.js - 修炼日记
 * V1124 P-20260614-817 Round 42 Iter 27/30
 */
export const DIARY_STATUS = ['draft', 'active', 'archived', 'deleted'];
export const DIARY_MOODS = ['inspired', 'frustrated', 'calm', 'excited', 'reflective'];

export class CultivationDiary {
    constructor(config = {}) {
        this.config = { ...config };
        this.entries = new Map();   // eid -> { id, owner, title, content, mood, status, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `cd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    write(owner, title, content = '', mood = 'calm') {
        if (!owner || !title) return null;
        if (!DIARY_MOODS.includes(mood)) mood = 'calm';
        const id = this._newId();
        const e = { id, owner, title, content, mood, status: 'active', ts: Date.now() };
        this.entries.set(id, e);
        if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
        this.byOwner.get(owner).push(id);
        this.stats.total++;
        return e;
    }
    get(id) { return this.entries.get(id) || null; }
    listAll() { return [...this.entries.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.entries.get(id)).filter(Boolean);
    }
    listByStatus(st) { return this.listAll().filter(e => e.status === st); }
    listByMood(mood) { return this.listAll().filter(e => e.mood === mood); }
    listActive() { return this.listByStatus('active'); }
    listArchived() { return this.listByStatus('archived'); }

    updateContent(id, content) {
        const e = this.entries.get(id);
        if (!e) return false;
        e.content = content;
        return true;
    }
    setMood(id, mood) {
        const e = this.entries.get(id);
        if (!e) return false;
        if (!DIARY_MOODS.includes(mood)) return false;
        e.mood = mood;
        return true;
    }
    setStatus(id, status) {
        const e = this.entries.get(id);
        if (!e) return false;
        if (!DIARY_STATUS.includes(status)) return false;
        e.status = status;
        return true;
    }
    archive(id) { return this.setStatus(id, 'archived'); }
    delete(id) { return this.setStatus(id, 'deleted'); }
    isActive(id) { return this.entries.get(id)?.status === 'active'; }
    isArchived(id) { return this.entries.get(id)?.status === 'archived'; }
    isDeleted(id) { return this.entries.get(id)?.status === 'deleted'; }
    moodOf(id) { return this.entries.get(id)?.mood || null; }
    statusOf(id) { return this.entries.get(id)?.status || null; }
    ownerOf(id) { return this.entries.get(id)?.owner || null; }
    titleOf(id) { return this.entries.get(id)?.title || null; }
    recent(n = 10) { return this.listAll().sort((a, b) => b.ts - a.ts).slice(0, n); }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    moodCount(owner, mood) { return this.listByOwner(owner).filter(e => e.mood === mood).length; }
    averageLength() {
        if (this.entries.size === 0) return 0;
        return this.listAll().reduce((s, e) => s + e.content.length, 0) / this.entries.size;
    }
    mostFrequentMood() {
        const counts = {};
        for (const e of this.entries.values()) {
            counts[e.mood] = (counts[e.mood] || 0) + 1;
        }
        let best = null, max = 0;
        for (const [mood, c] of Object.entries(counts)) {
            if (c > max) { best = mood; max = c; }
        }
        return best;
    }
    countByMood() {
        const c = {};
        for (const m of DIARY_MOODS) c[m] = 0;
        for (const e of this.entries.values()) c[e.mood] = (c[e.mood] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total }; }
    reset() { this.entries.clear(); this.byOwner.clear(); this.stats = { total: 0 }; }
}
