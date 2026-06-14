/**
 * ToxicityAnalyzer.js - 毒性分析仪
 * V1049 P-20260614-239 Round 40 Iter 12/30
 */
export const TOXICITY_LEVELS = ['safe', 'mild', 'moderate', 'severe', 'lethal'];

export class ToxicityAnalyzer {
    constructor(config = {}) {
        this.config = { ...config };
        this.analyses = new Map();   // analysisId -> { id, itemId, level, score, ts }
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `tox_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    analyze(itemId, score = 0) {
        if (!itemId) return null;
        const id = this._newId();
        let level;
        if (score < 10) level = 'safe';
        else if (score < 30) level = 'mild';
        else if (score < 60) level = 'moderate';
        else if (score < 90) level = 'severe';
        else level = 'lethal';
        const a = { id, itemId, level, score, ts: Date.now() };
        this.analyses.set(id, a);
        this.stats.total++;
        this._emit('analyzed', a);
        return a;
    }
    get(id) { return this.analyses.get(id) || null; }
    listAll() { return [...this.analyses.values()]; }
    listForItem(itemId) { return this.listAll().filter(a => a.itemId === itemId); }
    listByLevel(level) { return this.listAll().filter(a => a.level === level); }
    isSafe(analysisId) { return this.analyses.get(analysisId)?.level === 'safe'; }
    isLethal(analysisId) { return this.analyses.get(analysisId)?.level === 'lethal'; }
    isSevere(analysisId) { return this.analyses.get(analysisId)?.level === 'severe'; }
    itemLevel(itemId) {
        const list = this.listForItem(itemId);
        if (list.length === 0) return null;
        return list[list.length - 1].level;
    }
    itemScore(itemId) {
        const list = this.listForItem(itemId);
        if (list.length === 0) return 0;
        return list[list.length - 1].score;
    }
    averageScore() {
        if (this.analyses.size === 0) return 0;
        return this.listAll().reduce((s, a) => s + a.score, 0) / this.analyses.size;
    }
    safeCount() { return this.listByLevel('safe').length; }
    safeRatio() { return this.stats.total === 0 ? 0 : this.safeCount() / this.stats.total; }
    report() { return { total: this.stats.total, safeRatio: this.safeRatio() }; }
    reset() { this.analyses.clear(); this.stats = { total: 0 }; }
}
