/**
 * TribulationManager.js - 渡劫管理器
 * V1107 P-20260614-800 Round 42 Iter 10/30
 */
export const TRIBULATION_TYPES = ['lightning', 'fire', 'wind', 'heart', 'karma', 'heaven'];
export const TRIBULATION_PHASES = ['gathering', 'striking', 'passed', 'failed'];

export class TribulationManager {
    constructor(config = {}) {
        this.config = { ...config };
        this.tribulations = new Map();   // tid -> { id, owner, type, phase, intensity, startedAt, endedAt, livesLeft }
        this.hooks = new Map();
        this.stats = { total: 0, totalPassed: 0, totalFailed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `tr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    trigger(owner, type = 'lightning', intensity = 1) {
        if (!owner) return null;
        if (!TRIBULATION_TYPES.includes(type)) type = 'lightning';
        const id = this._newId();
        const t = { id, owner, type, phase: 'gathering', intensity, startedAt: Date.now(), endedAt: null, livesLeft: 9 };
        this.tribulations.set(id, t);
        this.stats.total++;
        this._emit('triggered', t);
        return t;
    }
    get(id) { return this.tribulations.get(id) || null; }
    listAll() { return [...this.tribulations.values()]; }
    listByOwner(owner) { return this.listAll().filter(t => t.owner === owner); }
    listByType(type) { return this.listAll().filter(t => t.type === type); }
    listByPhase(phase) { return this.listAll().filter(t => t.phase === phase); }
    listActive() { return this.listAll().filter(t => t.phase === 'gathering' || t.phase === 'striking'); }

    setPhase(id, phase) {
        const t = this.tribulations.get(id);
        if (!t) return false;
        if (!TRIBULATION_PHASES.includes(phase)) return false;
        t.phase = phase;
        if (phase === 'passed') {
            t.endedAt = Date.now();
            this.stats.totalPassed++;
            this._emit('passed', t);
        } else if (phase === 'failed') {
            t.endedAt = Date.now();
            this.stats.totalFailed++;
            this._emit('failed', t);
        }
        return true;
    }
    startStriking(id) { return this.setPhase(id, 'striking'); }
    pass(id) { return this.setPhase(id, 'passed'); }
    fail(id) { return this.setPhase(id, 'failed'); }
    loseLife(id) {
        const t = this.tribulations.get(id);
        if (!t) return false;
        t.livesLeft--;
        if (t.livesLeft <= 0) this.fail(id);
        return true;
    }
    setIntensity(id, intensity) {
        const t = this.tribulations.get(id);
        if (!t) return false;
        t.intensity = Math.max(0, intensity);
        return true;
    }
    isPassed(id) { return this.tribulations.get(id)?.phase === 'passed'; }
    isFailed(id) { return this.tribulations.get(id)?.phase === 'failed'; }
    isActive(id) { return this.tribulations.get(id)?.phase === 'gathering' || this.tribulations.get(id)?.phase === 'striking'; }
    isStriking(id) { return this.tribulations.get(id)?.phase === 'striking'; }
    livesOf(id) { return this.tribulations.get(id)?.livesLeft || 0; }
    intensityOf(id) { return this.tribulations.get(id)?.intensity || 0; }
    typeOf(id) { return this.tribulations.get(id)?.type || null; }
    duration(id) {
        const t = this.tribulations.get(id);
        if (!t || !t.endedAt) return 0;
        return t.endedAt - t.startedAt;
    }
    passRate() { return this.stats.total === 0 ? 0 : this.stats.totalPassed / this.stats.total; }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    ownerPassed(owner) { return this.listByOwner(owner).filter(t => t.phase === 'passed').length; }
    averageIntensity() {
        if (this.tribulations.size === 0) return 0;
        return this.listAll().reduce((s, t) => s + t.intensity, 0) / this.tribulations.size;
    }
    report() { return { total: this.stats.total, totalPassed: this.stats.totalPassed, totalFailed: this.stats.totalFailed }; }
    reset() { this.tribulations.clear(); this.stats = { total: 0, totalPassed: 0, totalFailed: 0 }; }
}
