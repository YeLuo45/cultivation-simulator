/**
 * RefiningEngine.js - 炼制引擎
 * V1043 P-20260614-233 Round 40 Iter 6/30
 */
export const REFINE_PHASES = ['preparation', 'combining', 'purifying', 'condensing', 'finalized'];
export const REFINE_RESULTS = ['success', 'partial', 'failure', 'critical_failure'];

export class RefiningEngine {
    constructor(config = {}) {
        this.config = { ...config };
        this.refines = new Map();   // refineId -> { id, recipeId, ingredients, phase, result, ts }
        this.hooks = new Map();
        this.stats = { total: 0, success: 0, failure: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `rfn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    start(recipeId, ingredients) {
        if (!recipeId) return null;
        if (!Array.isArray(ingredients)) return null;
        const id = this._newId();
        const r = { id, recipeId, ingredients: [...ingredients], phase: 'preparation', result: null, quality: 0, startedAt: Date.now(), finishedAt: null };
        this.refines.set(id, r);
        this.stats.total++;
        this._emit('started', r);
        return r;
    }
    get(id) { return this.refines.get(id) || null; }
    listAll() { return [...this.refines.values()]; }
    listByPhase(phase) { return this.listAll().filter(r => r.phase === phase); }
    listByResult(result) { return this.listAll().filter(r => r.result === result); }

    advance(id, toPhase) {
        const r = this.refines.get(id);
        if (!r) return false;
        if (!REFINE_PHASES.includes(toPhase)) return false;
        const idx = REFINE_PHASES.indexOf(r.phase);
        const toIdx = REFINE_PHASES.indexOf(toPhase);
        if (toIdx !== idx + 1) return false;
        r.phase = toPhase;
        return true;
    }
    canAdvance(id) {
        const r = this.refines.get(id);
        if (!r) return false;
        const idx = REFINE_PHASES.indexOf(r.phase);
        return idx >= 0 && idx < REFINE_PHASES.length - 1;
    }
    finish(id, result, quality = 0) {
        const r = this.refines.get(id);
        if (!r) return false;
        if (!REFINE_RESULTS.includes(result)) return false;
        r.result = result;
        r.quality = quality;
        r.phase = 'finalized';
        r.finishedAt = Date.now();
        if (result === 'success') this.stats.success++;
        else if (result === 'failure' || result === 'critical_failure') this.stats.failure++;
        this._emit('finished', r);
        return true;
    }
    cancel(id) {
        const r = this.refines.get(id);
        if (!r) return false;
        r.result = 'failure';
        r.phase = 'finalized';
        return true;
    }
    isFinalized(id) { return this.refines.get(id)?.phase === 'finalized'; }
    isSuccess(id) { return this.refines.get(id)?.result === 'success'; }
    isFailed(id) {
        const r = this.refines.get(id);
        return r ? r.result === 'failure' || r.result === 'critical_failure' : false;
    }
    duration(id) {
        const r = this.refines.get(id);
        if (!r) return 0;
        if (!r.finishedAt) return Date.now() - r.startedAt;
        return r.finishedAt - r.startedAt;
    }
    successRate() { return this.stats.total === 0 ? 0 : this.stats.success / this.stats.total; }
    averageQuality() {
        const success = this.listByResult('success');
        if (success.length === 0) return 0;
        return success.reduce((s, r) => s + r.quality, 0) / success.length;
    }
    report() { return { total: this.stats.total, success: this.stats.success, successRate: this.successRate() }; }
    reset() { this.refines.clear(); this.stats = { total: 0, success: 0, failure: 0 }; }
}
