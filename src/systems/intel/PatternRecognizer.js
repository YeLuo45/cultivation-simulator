/**
 * PatternRecognizer.js - 模式识别器
 * V1073 P-20260614-400 Round 41 Iter 6/30
 */
export const PATTERN_TYPES = ['sequence', 'cycle', 'anomaly', 'trend', 'cluster'];
export const CONFIDENCE_LEVELS = ['low', 'medium', 'high'];

export class PatternRecognizer {
    constructor(config = {}) {
        this.config = { ...config };
        this.patterns = new Map();   // patternId -> { id, type, confidence, signature, occurrences, ts }
        this.hooks = new Map();
        this.stats = { total: 0, totalOccurrences: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ptn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    register(signature, type = 'sequence', confidence = 'medium') {
        if (!signature) return null;
        if (!PATTERN_TYPES.includes(type)) type = 'sequence';
        if (!CONFIDENCE_LEVELS.includes(confidence)) confidence = 'medium';
        const id = this._newId();
        const p = { id, signature, type, confidence, occurrences: 1, ts: Date.now() };
        this.patterns.set(id, p);
        this.stats.total++;
        this.stats.totalOccurrences++;
        return p;
    }
    get(id) { return this.patterns.get(id) || null; }
    listAll() { return [...this.patterns.values()]; }
    listByType(type) { return this.listAll().filter(p => p.type === type); }
    listByConfidence(c) { return this.listAll().filter(p => p.confidence === c); }

    detect(signature, type = 'sequence') {
        const existing = this.listAll().find(p => p.signature === signature);
        if (existing) {
            existing.occurrences++;
            this.stats.totalOccurrences++;
            return { existing: true, pattern: existing };
        }
        const newP = this.register(signature, type);
        return { existing: false, pattern: newP };
    }
    setConfidence(id, level) {
        const p = this.patterns.get(id);
        if (!p) return false;
        if (!CONFIDENCE_LEVELS.includes(level)) return false;
        p.confidence = level;
        return true;
    }
    boost(id, amount = 1) {
        const p = this.patterns.get(id);
        if (!p) return false;
        p.occurrences += amount;
        this.stats.totalOccurrences += amount;
        return true;
    }
    occurrencesOf(id) { return this.patterns.get(id)?.occurrences || 0; }
    isHighConfidence(id) { return this.patterns.get(id)?.confidence === 'high'; }
    mostFrequent() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, p) => !best || p.occurrences > best.occurrences ? p : best, null);
    }
    byOccurrences(min = 2) { return this.listAll().filter(p => p.occurrences >= min); }
    report() { return { total: this.stats.total, totalOccurrences: this.stats.totalOccurrences }; }
    reset() { this.patterns.clear(); this.stats = { total: 0, totalOccurrences: 0 }; }
}
