/**
 * PaperMill.js - 符纸坊
 * V1128 Round 43 Iter 1/30 Direction A 仙道符箓阁 (claude-code) 2nd cycle
 */
export const PAPER_TYPES = ['yellow', 'crimson', 'jade', 'golden', 'silver', 'spirit', 'blood', 'shadow'];
export const PAPER_QUALITY = ['flawed', 'normal', 'fine', 'excellent', 'perfect'];

export class PaperMill {
    constructor(config = {}) {
        this.config = { ...config };
        this.papers = new Map();   // pid -> { id, type, quality, width, length, owner, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalArea: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `pp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    produce(type, width = 30, length = 30, quality = 'normal', owner = null) {
        if (!PAPER_TYPES.includes(type)) type = 'yellow';
        if (!PAPER_QUALITY.includes(quality)) quality = 'normal';
        const id = this._newId();
        const p = { id, type, quality, width, length, owner, ts: Date.now() };
        this.papers.set(id, p);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        this.stats.total++;
        this.stats.totalArea += width * length;
        this._emit('produced', p);
        return p;
    }
    get(id) { return this.papers.get(id) || null; }
    listAll() { return [...this.papers.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.papers.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(p => p.type === type); }
    listByQuality(q) { return this.listAll().filter(p => p.quality === q); }
    listPerfect() { return this.listByQuality('perfect'); }

    setQuality(id, quality) {
        const p = this.papers.get(id);
        if (!p) return false;
        if (!PAPER_QUALITY.includes(quality)) return false;
        p.quality = quality;
        return true;
    }
    setOwner(id, owner) {
        const p = this.papers.get(id);
        if (!p) return false;
        p.owner = owner;
        return true;
    }
    setSize(id, width, length) {
        const p = this.papers.get(id);
        if (!p) return false;
        p.width = Math.max(0, width);
        p.length = Math.max(0, length);
        this.stats.totalArea = this.listAll().reduce((s, x) => s + x.width * x.length, 0);
        return true;
    }
    isPerfect(id) { return this.papers.get(id)?.quality === 'perfect'; }
    isSpirit(id) { return this.papers.get(id)?.type === 'spirit'; }
    areaOf(id) {
        const p = this.papers.get(id);
        return p ? p.width * p.length : 0;
    }
    qualityOf(id) { return this.papers.get(id)?.quality || null; }
    typeOf(id) { return this.papers.get(id)?.type || null; }
    ownerOf(id) { return this.papers.get(id)?.owner || null; }
    totalArea() { return this.stats.totalArea; }
    averageArea() { return this.stats.total === 0 ? 0 : this.stats.totalArea / this.stats.total; }
    bestQuality() {
        const list = this.listAll();
        if (list.length === 0) return null;
        const qualityOrder = ['flawed', 'normal', 'fine', 'excellent', 'perfect'];
        return list.reduce((best, p) => {
            if (!best) return p;
            return qualityOrder.indexOf(p.quality) > qualityOrder.indexOf(best.quality) ? p : best;
        }, null);
    }
    countByType() {
        const c = {};
        for (const t of PAPER_TYPES) c[t] = 0;
        for (const p of this.papers.values()) c[p.type] = (c[p.type] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalArea: this.stats.totalArea }; }
    reset() { this.papers.clear(); this.byOwner.clear(); this.stats = { total: 0, totalArea: 0 }; }
}
