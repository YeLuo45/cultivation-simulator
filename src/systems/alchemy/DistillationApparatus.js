/**
 * DistillationApparatus.js - 蒸馏装置
 * V1045 P-20260614-235 Round 40 Iter 8/30
 */
export const DISTILL_PHASES = ['input', 'heating', 'evaporating', 'condensing', 'collected'];
export const YIELD_QUALITY = ['impure', 'normal', 'refined', 'pure'];

export class DistillationApparatus {
    constructor(config = {}) {
        this.config = { ...config };
        this.distillations = new Map();   // distId -> { id, input, output, phase, yield, quality, startedAt, finishedAt }
        this.hooks = new Map();
        this.stats = { total: 0, pure: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `dst_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    start(input, expectedOutput) {
        if (!input) return null;
        const id = this._newId();
        const d = { id, input, expectedOutput: expectedOutput || null, output: null, phase: 'input', quality: 'normal', yield: 0, startedAt: Date.now(), finishedAt: null };
        this.distillations.set(id, d);
        this.stats.total++;
        return d;
    }
    get(id) { return this.distillations.get(id) || null; }
    listAll() { return [...this.distillations.values()]; }
    listByPhase(phase) { return this.listAll().filter(d => d.phase === phase); }
    listByQuality(quality) { return this.listAll().filter(d => d.quality === quality); }

    setPhase(id, phase) {
        const d = this.distillations.get(id);
        if (!d) return false;
        if (!DISTILL_PHASES.includes(phase)) return false;
        d.phase = phase;
        return true;
    }
    setYield(id, yieldAmount) {
        const d = this.distillations.get(id);
        if (!d) return false;
        d.yield = Math.max(0, yieldAmount);
        return true;
    }
    setQuality(id, quality) {
        const d = this.distillations.get(id);
        if (!d) return false;
        if (!YIELD_QUALITY.includes(quality)) return false;
        d.quality = quality;
        if (quality === 'pure') this.stats.pure++;
        return true;
    }
    finish(id, output) {
        const d = this.distillations.get(id);
        if (!d) return false;
        d.output = output;
        d.phase = 'collected';
        d.finishedAt = Date.now();
        this._emit('finished', d);
        return true;
    }
    cancel(id) {
        const d = this.distillations.get(id);
        if (!d) return false;
        d.phase = 'collected';
        d.finishedAt = Date.now();
        return true;
    }
    isComplete(id) { return this.distillations.get(id)?.phase === 'collected'; }
    isPure(id) { return this.distillations.get(id)?.quality === 'pure'; }
    averageYield() {
        if (this.distillations.size === 0) return 0;
        return this.listAll().reduce((s, d) => s + d.yield, 0) / this.distillations.size;
    }
    yieldOf(id) { return this.distillations.get(id)?.yield || 0; }
    report() { return { total: this.stats.total, pure: this.stats.pure }; }
    reset() { this.distillations.clear(); this.stats = { total: 0, pure: 0 }; }
}
