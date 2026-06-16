/**
 * SynergyDetector.js - 协同检测器
 * V1050 P-20260614-240 Round 40 Iter 13/30
 */
export const SYNERGY_LEVELS = ['none', 'weak', 'moderate', 'strong', 'perfect'];

export class SynergyDetector {
    constructor(config = {}) {
        this.config = { ...config };
        this.detections = new Map();   // detId -> { id, ingredients, level, score, ts }
        this.knownPairs = new Map();   // "ing1:ing2" -> level
        this.hooks = new Map();
        this.stats = { total: 0, perfect: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `syn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    registerSynergy(ing1, ing2, level) {
        if (!SYNERGY_LEVELS.includes(level)) return false;
        const key = [ing1, ing2].sort().join(':');
        this.knownPairs.set(key, level);
        return true;
    }
    pairLevel(ing1, ing2) {
        const key = [ing1, ing2].sort().join(':');
        return this.knownPairs.get(key) || 'none';
    }

    detect(ingredients) {
        if (!Array.isArray(ingredients)) return null;
        const id = this._newId();
        let totalScore = 0;
        let pairCount = 0;
        for (let i = 0; i < ingredients.length; i++) {
            for (let j = i + 1; j < ingredients.length; j++) {
                const level = this.pairLevel(ingredients[i], ingredients[j]);
                const score = { none: 0, weak: 1, moderate: 2, strong: 3, perfect: 5 }[level] || 0;
                totalScore += score;
                pairCount++;
            }
        }
        const avg = pairCount > 0 ? totalScore / pairCount : 0;
        let level;
        if (avg === 0) level = 'none';
        else if (avg < 1) level = 'weak';
        else if (avg < 2.5) level = 'moderate';
        else if (avg < 4) level = 'strong';
        else level = 'perfect';
        const d = { id, ingredients, level, score: totalScore, ts: Date.now() };
        this.detections.set(id, d);
        this.stats.total++;
        if (level === 'perfect') this.stats.perfect++;
        this._emit('detected', d);
        return d;
    }
    get(id) { return this.detections.get(id) || null; }
    listAll() { return [...this.detections.values()]; }
    listByLevel(level) { return this.listAll().filter(d => d.level === level); }
    isPerfect(id) { return this.detections.get(id)?.level === 'perfect'; }
    isStrong(id) {
        const l = this.detections.get(id)?.level;
        return l === 'strong' || l === 'perfect';
    }
    perfectRatio() { return this.stats.total === 0 ? 0 : this.stats.perfect / this.stats.total; }
    averageScore() {
        if (this.detections.size === 0) return 0;
        return this.listAll().reduce((s, d) => s + d.score, 0) / this.detections.size;
    }
    best() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, d) => !best || d.score > best.score ? d : best, null);
    }
    report() { return { total: this.stats.total, perfect: this.stats.perfect, perfectRatio: this.perfectRatio() }; }
    reset() { this.detections.clear(); this.knownPairs.clear(); this.stats = { total: 0, perfect: 0 }; }
}
