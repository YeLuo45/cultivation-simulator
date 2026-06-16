/**
 * QualityGrader.js - 品质分级器
 * V1054 P-20260614-244 Round 40 Iter 17/30
 */
export const QUALITY_GRADES = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS'];
export const QUALITY_THRESHOLDS = [0, 10, 30, 50, 70, 85, 95, 100];

export class QualityGrader {
    constructor(config = {}) {
        this.config = { thresholds: config.thresholds || QUALITY_THRESHOLDS, ...config };
        this.grades = new Map();   // itemId -> { id, score, grade, gradedAt }
        this.hooks = new Map();
        this.stats = { total: 0, topGrade: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    grade(itemId, score) {
        if (!itemId) return null;
        if (typeof score !== 'number') return null;
        const s = Math.max(0, Math.min(100, score));
        const grade = this._gradeFor(s);
        const g = { id: itemId, score: s, grade, gradedAt: Date.now() };
        this.grades.set(itemId, g);
        this.stats.total++;
        if (grade === 'SS') this.stats.topGrade++;
        this._emit('graded', g);
        return g;
    }
    _gradeFor(score) {
        const t = this.config.thresholds;
        for (let i = t.length - 1; i >= 0; i--) {
            if (score >= t[i]) return QUALITY_GRADES[i];
        }
        return QUALITY_GRADES[0];
    }
    get(itemId) { return this.grades.get(itemId) || null; }
    listAll() { return [...this.grades.values()]; }
    listByGrade(grade) { return this.listAll().filter(g => g.grade === grade); }
    gradeOf(itemId) { return this.grades.get(itemId)?.grade || null; }
    scoreOf(itemId) { return this.grades.get(itemId)?.score || 0; }
    isTopGrade(itemId) {
        const g = this.grades.get(itemId)?.grade;
        return g === 'S' || g === 'SS';
    }
    isAcceptable(itemId, minGrade = 'D') {
        const order = QUALITY_GRADES;
        const cur = this.gradeOf(itemId);
        return cur ? order.indexOf(cur) >= order.indexOf(minGrade) : false;
    }
    averageScore() {
        if (this.grades.size === 0) return 0;
        return this.listAll().reduce((s, g) => s + g.score, 0) / this.grades.size;
    }
    distribution() {
        const d = {};
        for (const g of QUALITY_GRADES) d[g] = 0;
        for (const x of this.grades.values()) d[x.grade] = (d[x.grade] || 0) + 1;
        return d;
    }
    best() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, g) => !best || g.score > best.score ? g : best, null);
    }
    ssRatio() { return this.stats.total === 0 ? 0 : this.stats.topGrade / this.stats.total; }
    report() { return { total: this.stats.total, topGrade: this.stats.topGrade, averageScore: this.averageScore() }; }
    reset() { this.grades.clear(); this.stats = { total: 0, topGrade: 0 }; }
}
