/**
 * RealmFoundation.js - 境界根基
 * V1102 P-20260614-604 Round 42 Iter 5/30
 */
export const REALM_LEVELS = [
    'qi_refining', 'foundation', 'core_formation', 'nascent_soul',
    'soul_transformation', 'mahayana', 'tribulation', 'immortal'
];
export const REALM_QUALITY = ['flawed', 'normal', 'perfect', 'supreme'];

export class RealmFoundation {
    constructor(config = {}) {
        this.config = { ...config };
        this.foundations = new Map();   // fid -> { id, owner, level, quality, stability, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, averageStability: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `rf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    establish(owner, level, quality = 'normal') {
        if (!owner) return null;
        if (!REALM_LEVELS.includes(level)) level = 'qi_refining';
        if (!REALM_QUALITY.includes(quality)) quality = 'normal';
        const id = this._newId();
        const stability = quality === 'supreme' ? 1.0 : quality === 'perfect' ? 0.9 : quality === 'normal' ? 0.7 : 0.5;
        const f = { id, owner, level, quality, stability, ts: Date.now() };
        this.foundations.set(id, f);
        if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
        this.byOwner.get(owner).push(id);
        this.stats.total++;
        this.stats.averageStability = this._avgStability();
        return f;
    }
    _avgStability() {
        if (this.foundations.size === 0) return 0;
        return this.listAll().reduce((s, f) => s + f.stability, 0) / this.foundations.size;
    }
    get(id) { return this.foundations.get(id) || null; }
    listAll() { return [...this.foundations.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.foundations.get(id)).filter(Boolean);
    }
    listByLevel(level) { return this.listAll().filter(f => f.level === level); }
    listByQuality(q) { return this.listAll().filter(f => f.quality === q); }

    setQuality(id, quality) {
        const f = this.foundations.get(id);
        if (!f) return false;
        if (!REALM_QUALITY.includes(quality)) return false;
        f.quality = quality;
        f.stability = quality === 'supreme' ? 1.0 : quality === 'perfect' ? 0.9 : quality === 'normal' ? 0.7 : 0.5;
        this.stats.averageStability = this._avgStability();
        return true;
    }
    setStability(id, stability) {
        const f = this.foundations.get(id);
        if (!f) return false;
        f.stability = Math.max(0, Math.min(1, stability));
        this.stats.averageStability = this._avgStability();
        return true;
    }
    isSupreme(id) { return this.foundations.get(id)?.quality === 'supreme'; }
    isImmortal(id) { return this.foundations.get(id)?.level === 'immortal'; }
    stabilityOf(id) { return this.foundations.get(id)?.stability || 0; }
    levelOf(id) { return this.foundations.get(id)?.level || null; }
    qualityOf(id) { return this.foundations.get(id)?.quality || null; }
    levelIndex(id) { return REALM_LEVELS.indexOf(this.foundations.get(id)?.level || ''); }
    isStronger(a, b) {
        const fa = this.foundations.get(a);
        const fb = this.foundations.get(b);
        if (!fa || !fb) return false;
        const ai = REALM_LEVELS.indexOf(fa.level);
        const bi = REALM_LEVELS.indexOf(fb.level);
        return ai > bi;
    }
    highest() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, f) => {
            if (!best) return f;
            return REALM_LEVELS.indexOf(f.level) > REALM_LEVELS.indexOf(best.level) ? f : best;
        }, null);
    }
    countByQuality() {
        const c = {};
        for (const q of REALM_QUALITY) c[q] = 0;
        for (const f of this.foundations.values()) c[f.quality] = (c[f.quality] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, averageStability: this.stats.averageStability }; }
    reset() { this.foundations.clear(); this.byOwner.clear(); this.stats = { total: 0, averageStability: 0 }; }
}
