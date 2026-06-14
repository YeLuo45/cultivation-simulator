/**
 * EssenceExtractor.js - 精华提取器
 * V1046 P-20260614-236 Round 40 Iter 9/30
 */
export const ESSENCE_TYPES = ['qi', 'blood', 'soul', 'elemental', 'divine'];
export const EXTRACTION_RESULTS = ['pure', 'diluted', 'contaminated', 'failed'];

export class EssenceExtractor {
    constructor(config = {}) {
        this.config = { ...config };
        this.extractions = new Map();   // extId -> { id, source, type, result, purity, amount, ts }
        this.hooks = new Map();
        this.stats = { total: 0, pure: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ext_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    extract(source, type, purity = 100, amount = 1) {
        if (!source || !ESSENCE_TYPES.includes(type)) return null;
        if (typeof amount !== 'number' || amount <= 0) return null;
        const id = this._newId();
        let result;
        if (purity >= 90) result = 'pure';
        else if (purity >= 60) result = 'diluted';
        else if (purity >= 30) result = 'contaminated';
        else result = 'failed';
        const e = { id, source, type, result, purity, amount, ts: Date.now() };
        this.extractions.set(id, e);
        this.stats.total++;
        if (result === 'pure') this.stats.pure++;
        this._emit('extracted', e);
        return e;
    }
    get(id) { return this.extractions.get(id) || null; }
    listAll() { return [...this.extractions.values()]; }
    listByType(type) { return this.listAll().filter(e => e.type === type); }
    listByResult(result) { return this.listAll().filter(e => e.result === result); }
    listBySource(source) { return this.listAll().filter(e => e.source === source); }

    totalAmount(type = null) {
        const list = type ? this.listByType(type) : this.listAll();
        return list.reduce((s, e) => s + e.amount, 0);
    }
    isPure(id) { return this.extractions.get(id)?.result === 'pure'; }
    isContaminated(id) { return this.extractions.get(id)?.result === 'contaminated'; }
    isFailed(id) { return this.extractions.get(id)?.result === 'failed'; }
    averagePurity() {
        if (this.extractions.size === 0) return 0;
        return this.listAll().reduce((s, e) => s + e.purity, 0) / this.extractions.size;
    }
    pureCount() { return this.listByResult('pure').length; }
    pureRatio() { return this.stats.total === 0 ? 0 : this.stats.pure / this.stats.total; }
    bestExtraction(type) {
        const list = this.listByType(type);
        if (list.length === 0) return null;
        return list.reduce((best, e) => !best || e.purity > best.purity ? e : best, null);
    }
    report() { return { total: this.stats.total, pure: this.stats.pure, pureRatio: this.pureRatio() }; }
    reset() { this.extractions.clear(); this.stats = { total: 0, pure: 0 }; }
}
