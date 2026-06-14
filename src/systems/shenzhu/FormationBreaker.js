/**
 * FormationBreaker.js - 阵法破除
 * V1122 P-20260614-815 Round 42 Iter 25/30
 */
export const BREAK_STATUS = ['analyzing', 'striking', 'broken', 'failed', 'escaped'];
export const BREAK_METHODS = ['overwhelming_force', 'counter_formation', 'qi_disruption', 'element_exploit', 'time_decay'];

export class FormationBreaker {
    constructor(config = {}) {
        this.config = { ...config };
        this.breaks = new Map();   // bid -> { id, formation, method, status, power, startedAt, endedAt }
        this.hooks = new Map();
        this.stats = { total: 0, totalBroken: 0, totalFailed: 0, totalEscaped: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `bk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    start(formation, method = 'overwhelming_force', power = 1) {
        if (!formation) return null;
        if (!BREAK_METHODS.includes(method)) method = 'overwhelming_force';
        const id = this._newId();
        const b = { id, formation, method, status: 'analyzing', power, startedAt: Date.now(), endedAt: null };
        this.breaks.set(id, b);
        this.stats.total++;
        return b;
    }
    get(id) { return this.breaks.get(id) || null; }
    listAll() { return [...this.breaks.values()]; }
    listByFormation(formation) { return this.listAll().filter(b => b.formation === formation); }
    listByStatus(st) { return this.listAll().filter(b => b.status === st); }
    listByMethod(method) { return this.listAll().filter(b => b.method === method); }
    listActive() { return this.listAll().filter(b => b.status === 'analyzing' || b.status === 'striking'); }

    setStatus(id, status) {
        const b = this.breaks.get(id);
        if (!b) return false;
        if (!BREAK_STATUS.includes(status)) return false;
        b.status = status;
        if (status === 'broken') {
            b.endedAt = Date.now();
            this.stats.totalBroken++;
            this._emit('broken', b);
        } else if (status === 'failed') {
            b.endedAt = Date.now();
            this.stats.totalFailed++;
        } else if (status === 'escaped') {
            b.endedAt = Date.now();
            this.stats.totalEscaped++;
        }
        return true;
    }
    analyze(id) { return this.setStatus(id, 'analyzing'); }
    strike(id) { return this.setStatus(id, 'striking'); }
    succeed(id) { return this.setStatus(id, 'broken'); }
    fail(id) { return this.setStatus(id, 'failed'); }
    escape(id) { return this.setStatus(id, 'escaped'); }
    setMethod(id, method) {
        const b = this.breaks.get(id);
        if (!b) return false;
        if (!BREAK_METHODS.includes(method)) return false;
        b.method = method;
        return true;
    }
    setPower(id, power) {
        const b = this.breaks.get(id);
        if (!b) return false;
        b.power = Math.max(0, power);
        return true;
    }
    isActive(id) {
        const s = this.breaks.get(id)?.status;
        return s === 'analyzing' || s === 'striking';
    }
    isBroken(id) { return this.breaks.get(id)?.status === 'broken'; }
    isFailed(id) { return this.breaks.get(id)?.status === 'failed'; }
    isEscaped(id) { return this.breaks.get(id)?.status === 'escaped'; }
    powerOf(id) { return this.breaks.get(id)?.power || 0; }
    methodOf(id) { return this.breaks.get(id)?.method || null; }
    duration(id) {
        const b = this.breaks.get(id);
        if (!b || !b.endedAt) return 0;
        return b.endedAt - b.startedAt;
    }
    successRate() { return this.stats.total === 0 ? 0 : this.stats.totalBroken / this.stats.total; }
    averagePower() {
        if (this.breaks.size === 0) return 0;
        return this.listAll().reduce((s, b) => s + b.power, 0) / this.breaks.size;
    }
    formationCount(formation) { return this.listByFormation(formation).length; }
    bestFor(formation) {
        const list = this.listByFormation(formation).filter(b => b.status === 'broken');
        if (list.length === 0) return null;
        return list.reduce((best, b) => !best || b.power > best.power ? b : best, null);
    }
    countByMethod() {
        const c = {};
        for (const m of BREAK_METHODS) c[m] = 0;
        for (const b of this.breaks.values()) c[b.method] = (c[b.method] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalBroken: this.stats.totalBroken, totalFailed: this.stats.totalFailed, successRate: this.successRate() }; }
    reset() { this.breaks.clear(); this.stats = { total: 0, totalBroken: 0, totalFailed: 0, totalEscaped: 0 }; }
}
