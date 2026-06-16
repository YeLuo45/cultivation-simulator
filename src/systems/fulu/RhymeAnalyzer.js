/**
 * RhymeAnalyzer.js - 韵律分析
 * V1145 Round 43 Iter 18/30
 */
export const RHYME_TYPES = ['perfect', 'near', 'slant', 'eye', 'identical'];
export const RHYME_PATTERNS = ['AABB', 'ABAB', 'ABBA', 'free', 'heroic'];

export class RhymeAnalyzer {
    constructor(config = {}) {
        this.config = { ...config };
        this.analyses = new Map();   // aid -> { id, chant, pattern, score, type, suggestions, ts }
        this.hooks = new Map();
        this.stats = { total: 0, totalScore: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ra_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    analyze(chant, pattern = 'free', type = 'perfect') {
        if (!chant) return null;
        if (!RHYME_PATTERNS.includes(pattern)) pattern = 'free';
        if (!RHYME_TYPES.includes(type)) type = 'perfect';
        const score = Math.random() * 0.4 + 0.6;
        const id = this._newId();
        const a = { id, chant, pattern, score, type, suggestions: [], ts: Date.now() };
        this.analyses.set(id, a);
        this.stats.total++;
        this.stats.totalScore += score;
        return a;
    }
    get(id) { return this.analyses.get(id) || null; }
    listAll() { return [...this.analyses.values()]; }
    listByChant(c) { return this.listAll().filter(a => a.chant === c); }
    listByPattern(p) { return this.listAll().filter(a => a.pattern === p); }
    listByType(t) { return this.listAll().filter(a => a.type === t); }
    listPerfect() { return this.listByType('perfect'); }

    setScore(id, score) {
        const a = this.analyses.get(id);
        if (!a) return false;
        a.score = Math.max(0, Math.min(1, score));
        this.stats.totalScore = this.listAll().reduce((s, x) => s + x.score, 0);
        return true;
    }
    setPattern(id, pattern) {
        const a = this.analyses.get(id);
        if (!a) return false;
        if (!RHYME_PATTERNS.includes(pattern)) return false;
        a.pattern = pattern;
        return true;
    }
    setType(id, type) {
        const a = this.analyses.get(id);
        if (!a) return false;
        if (!RHYME_TYPES.includes(type)) return false;
        a.type = type;
        return true;
    }
    addSuggestion(id, suggestion) {
        const a = this.analyses.get(id);
        if (!a) return false;
        a.suggestions.push(suggestion);
        return true;
    }
    isPerfect(id) { return this.analyses.get(id)?.type === 'perfect'; }
    scoreOf(id) { return this.analyses.get(id)?.score || 0; }
    typeOf(id) { return this.analyses.get(id)?.type || null; }
    patternOf(id) { return this.analyses.get(id)?.pattern || null; }
    chantCount(c) { return this.listByChant(c).length; }
    averageScore() { return this.stats.total === 0 ? 0 : this.stats.totalScore / this.stats.total; }
    best() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, a) => !best || a.score > best.score ? a : best, null);
    }
    countByPattern() {
        const c = {};
        for (const p of RHYME_PATTERNS) c[p] = 0;
        for (const a of this.analyses.values()) c[a.pattern] = (c[a.pattern] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, averageScore: this.averageScore() }; }
    reset() { this.analyses.clear(); this.stats = { total: 0, totalScore: 0 }; }
}
