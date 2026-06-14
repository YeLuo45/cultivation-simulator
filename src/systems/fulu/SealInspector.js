/**
 * SealInspector.js - 封印审查
 * V1141 Round 43 Iter 14/30
 */
export const INSPECTION_STATUS = ['pending', 'inspecting', 'verified', 'rejected', 'flagged'];
export const INSPECTION_OUTCOMES = ['safe', 'minor_issues', 'major_issues', 'dangerous', 'unknown'];

export class SealInspector {
    constructor(config = {}) {
        this.config = { ...config };
        this.inspections = new Map();   // iid -> { id, seal, status, outcome, score, inspector, ts }
        this.byInspector = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalVerified: 0, totalRejected: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `si_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    inspect(seal, inspector, score = 0) {
        if (!seal || !inspector) return null;
        const id = this._newId();
        const i = { id, seal, status: 'inspecting', outcome: 'unknown', score, inspector, ts: Date.now() };
        this.inspections.set(id, i);
        if (!this.byInspector.has(inspector)) this.byInspector.set(inspector, []);
        this.byInspector.get(inspector).push(id);
        this.stats.total++;
        return i;
    }
    get(id) { return this.inspections.get(id) || null; }
    listAll() { return [...this.inspections.values()]; }
    listBySeal(seal) { return this.listAll().filter(i => i.seal === seal); }
    listByInspector(ins) {
        const ids = this.byInspector.get(ins) || [];
        return ids.map(id => this.inspections.get(id)).filter(Boolean);
    }
    listByStatus(st) { return this.listAll().filter(i => i.status === st); }
    listByOutcome(out) { return this.listAll().filter(i => i.outcome === out); }
    listVerified() { return this.listByStatus('verified'); }
    listFlagged() { return this.listByStatus('flagged'); }

    setStatus(id, status) {
        const i = this.inspections.get(id);
        if (!i) return false;
        if (!INSPECTION_STATUS.includes(status)) return false;
        i.status = status;
        if (status === 'verified') this.stats.totalVerified++;
        else if (status === 'rejected') this.stats.totalRejected++;
        if (status === 'verified' || status === 'rejected' || status === 'flagged') this._emit('concluded', i);
        return true;
    }
    verify(id) { return this.setStatus(id, 'verified'); }
    reject(id) { return this.setStatus(id, 'rejected'); }
    flag(id) { return this.setStatus(id, 'flagged'); }
    setOutcome(id, outcome) {
        const i = this.inspections.get(id);
        if (!i) return false;
        if (!INSPECTION_OUTCOMES.includes(outcome)) return false;
        i.outcome = outcome;
        return true;
    }
    setScore(id, score) {
        const i = this.inspections.get(id);
        if (!i) return false;
        i.score = Math.max(0, Math.min(100, score));
        return true;
    }
    isVerified(id) { return this.inspections.get(id)?.status === 'verified'; }
    isRejected(id) { return this.inspections.get(id)?.status === 'rejected'; }
    isFlagged(id) { return this.inspections.get(id)?.status === 'flagged'; }
    isInspecting(id) { return this.inspections.get(id)?.status === 'inspecting'; }
    scoreOf(id) { return this.inspections.get(id)?.score || 0; }
    outcomeOf(id) { return this.inspections.get(id)?.outcome || null; }
    sealCount(seal) { return this.listBySeal(seal).length; }
    inspectorCount(ins) { return this.listByInspector(ins).length; }
    verificationRate() { return this.stats.total === 0 ? 0 : this.stats.totalVerified / this.stats.total; }
    averageScore() {
        if (this.inspections.size === 0) return 0;
        return this.listAll().reduce((s, i) => s + i.score, 0) / this.inspections.size;
    }
    countByOutcome() {
        const c = {};
        for (const o of INSPECTION_OUTCOMES) c[o] = 0;
        for (const i of this.inspections.values()) c[i.outcome] = (c[i.outcome] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalVerified: this.stats.totalVerified, totalRejected: this.stats.totalRejected, verificationRate: this.verificationRate() }; }
    reset() { this.inspections.clear(); this.byInspector.clear(); this.stats = { total: 0, totalVerified: 0, totalRejected: 0 }; }
}
