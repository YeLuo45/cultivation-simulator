/**
 * SectHistoryArchive.js - 史馆
 * V1006 P-20260614-166 Round 38 Iter 29/30
 */
export const EVENT_CATEGORIES = ['founding', 'election', 'war', 'treaty', 'reform', 'disaster', 'breakthrough'];
export const ARCHIVE_ERAS = ['ancient', 'classical', 'medieval', 'modern', 'contemporary'];

export class SectHistoryArchive {
    constructor(config = {}) {
        this.config = { ...config };
        this.events = new Map();   // eventId -> { id, year, era, category, title, description, participants, significance }
        this.byYear = new Map();   // year -> [eventId]
        this.byEra = new Map();    // era -> [eventId]
        this.hooks = new Map();
        this.stats = { total: 0, byCategory: {} };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    record(year, era, category, title, description = '', participants = []) {
        if (!EVENT_CATEGORIES.includes(category)) return null;
        if (!ARCHIVE_ERAS.includes(era)) return null;
        const id = this._newId();
        const e = { id, year, era, category, title, description, participants, significance: this._computeSignificance(category, participants), ts: Date.now() };
        this.events.set(id, e);
        if (!this.byYear.has(year)) this.byYear.set(year, []);
        this.byYear.get(year).push(id);
        if (!this.byEra.has(era)) this.byEra.set(era, []);
        this.byEra.get(era).push(id);
        this.stats.total++;
        this.stats.byCategory[category] = (this.stats.byCategory[category] || 0) + 1;
        this._emit('recorded', e);
        return e;
    }

    _computeSignificance(category, participants) {
        let s = 1;
        if (['founding', 'war', 'disaster', 'breakthrough'].includes(category)) s += 2;
        if (participants.length > 5) s += 1;
        if (participants.length > 20) s += 1;
        return s;
    }

    get(id) { return this.events.get(id) || null; }
    listAll() { return [...this.events.values()]; }
    listByYear(year) { return (this.byYear.get(year) || []).map(id => this.events.get(id)).filter(Boolean); }
    listByEra(era) { return (this.byEra.get(era) || []).map(id => this.events.get(id)).filter(Boolean); }
    listByCategory(cat) { return this.listAll().filter(e => e.category === cat); }
    listForParticipant(participant) { return this.listAll().filter(e => e.participants.includes(participant)); }

    years() { return [...this.byYear.keys()].sort((a, b) => a - b); }
    eras() { return [...this.byEra.keys()]; }
    eraStats() {
        const result = {};
        for (const era of ARCHIVE_ERAS) result[era] = (this.byEra.get(era) || []).length;
        return result;
    }

    mostSignificant(n = 5) {
        return [...this.listAll()].sort((a, b) => b.significance - a.significance).slice(0, n);
    }
    searchByTitle(query) {
        const q = (query || '').toLowerCase();
        return this.listAll().filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    byYearRange(start, end) { return this.listAll().filter(e => e.year >= start && e.year <= end); }

    eraOf(year, currentYear = 2026) {
        // Simple mapping: ancient < 0, classical 0-1000, medieval 1000-1500, modern 1500-1900, contemporary 1900+
        const age = currentYear - year;
        if (age > 1000) return 'ancient';
        if (age > 500) return 'classical';
        if (age > 200) return 'medieval';
        if (age > 50) return 'modern';
        return 'contemporary';
    }
    report() {
        return { total: this.stats.total, byCategory: { ...this.stats.byCategory }, eraStats: this.eraStats(), yearSpan: this.years().length > 0 ? { min: Math.min(...this.years()), max: Math.max(...this.years()) } : null };
    }
    reset() { this.events.clear(); this.byYear.clear(); this.byEra.clear(); this.stats = { total: 0, byCategory: {} }; }
}
