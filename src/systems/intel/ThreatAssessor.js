/**
 * ThreatAssessor.js - 威胁评估器
 * V1074 P-20260614-401 Round 41 Iter 7/30
 */
export const THREAT_LEVELS = ['negligible', 'low', 'moderate', 'high', 'critical', 'existential'];
export const THREAT_TYPES = ['military', 'political', 'economic', 'magical', 'natural', 'internal'];

export class ThreatAssessor {
    constructor(config = {}) {
        this.config = { ...config };
        this.assessments = new Map();   // assId -> { id, threatType, level, source, score, ts }
        this.hooks = new Map();
        this.stats = { total: 0, critical: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `thr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    assess(threatType, score, source = 'unknown') {
        if (!THREAT_TYPES.includes(threatType)) return null;
        if (typeof score !== 'number') return null;
        const s = Math.max(0, Math.min(100, score));
        const level = this._levelFor(s);
        const id = this._newId();
        const a = { id, threatType, level, source, score: s, ts: Date.now() };
        this.assessments.set(id, a);
        this.stats.total++;
        if (level === 'critical' || level === 'existential') this.stats.critical++;
        this._emit('assessed', a);
        return a;
    }
    _levelFor(score) {
        if (score < 5) return 'negligible';
        if (score < 20) return 'low';
        if (score < 40) return 'moderate';
        if (score < 70) return 'high';
        if (score < 90) return 'critical';
        return 'existential';
    }
    get(id) { return this.assessments.get(id) || null; }
    listAll() { return [...this.assessments.values()]; }
    listByType(type) { return this.listAll().filter(a => a.threatType === type); }
    listByLevel(level) { return this.listAll().filter(a => a.level === level); }
    listBySource(source) { return this.listAll().filter(a => a.source === source); }

    updateLevel(id, score) {
        const a = this.assessments.get(id);
        if (!a) return false;
        if (typeof score !== 'number') return false;
        a.score = Math.max(0, Math.min(100, score));
        a.level = this._levelFor(a.score);
        return true;
    }
    isCritical(id) {
        const l = this.assessments.get(id)?.level;
        return l === 'critical' || l === 'existential';
    }
    isHigh(id) {
        const l = this.assessments.get(id)?.level;
        return l === 'high' || l === 'critical' || l === 'existential';
    }
    levelOf(id) { return this.assessments.get(id)?.level || null; }
    scoreOf(id) { return this.assessments.get(id)?.score || 0; }
    top(n = 5) { return this.listAll().sort((a, b) => b.score - a.score).slice(0, n); }
    averageScore() {
        if (this.assessments.size === 0) return 0;
        return this.listAll().reduce((s, a) => s + a.score, 0) / this.assessments.size;
    }
    countByLevel() {
        const c = {};
        for (const l of THREAT_LEVELS) c[l] = 0;
        for (const a of this.assessments.values()) c[a.level] = (c[a.level] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, critical: this.stats.critical, averageScore: this.averageScore() }; }
    reset() { this.assessments.clear(); this.stats = { total: 0, critical: 0 }; }
}
