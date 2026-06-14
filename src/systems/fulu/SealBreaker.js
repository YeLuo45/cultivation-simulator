/**
 * SealBreaker.js - 破封
 * V1140 Round 43 Iter 13/30
 */
export const BREAK_STATUS = ['analyzing', 'weakening', 'breaking', 'broken', 'failed', 'backlash'];
export const BREAK_METHODS = ['overwhelming_force', 'key_seal', 'time_decay', 'counter_seal', 'undermine'];

export class SealBreaker {
    constructor(config = {}) {
        this.config = { ...config };
        this.breaks = new Map();   // bid -> { id, seal, method, status, power, startedAt, endedAt }
        this.hooks = new Map();
        this.stats = { total: 0, totalBroken: 0, totalFailed: 0, totalBacklash: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `sb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    start(seal, method = 'overwhelming_force', power = 1) {
        if (!seal) return null;
        if (!BREAK_METHODS.includes(method)) method = 'overwhelming_force';
        const id = this._newId();
        const b = { id, seal, method, status: 'analyzing', power, startedAt: Date.now(), endedAt: null };
        this.breaks.set(id, b);
        this.stats.total++;
        return b;
    }
    get(id) { return this.breaks.get(id) || null; }
    listAll() { return [...this.breaks.values()]; }
    listBySeal(seal) { return this.listAll().filter(b => b.seal === seal); }
    listByStatus(st) { return this.listAll().filter(b => b.status === st); }
    listByMethod(m) { return this.listAll().filter(b => b.method === m); }
    listActive() { return this.listAll().filter(b => b.status === 'analyzing' || b.status === 'weakening' || b.status === 'breaking'); }

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
        } else if (status === 'backlash') {
            b.endedAt = Date.now();
            this.stats.totalBacklash++;
        }
        return true;
    }
    weaken(id) { return this.setStatus(id, 'weakening'); }
    breaking(id) { return this.setStatus(id, 'breaking'); }
    succeed(id) { return this.setStatus(id, 'broken'); }
    fail(id) { return this.setStatus(id, 'failed'); }
    backlash(id) { return this.setStatus(id, 'backlash'); }
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
        return s === 'analyzing' || s === 'weakening' || s === 'breaking';
    }
    isBroken(id) { return this.breaks.get(id)?.status === 'broken'; }
    isFailed(id) { return this.breaks.get(id)?.status === 'failed'; }
    isBacklash(id) { return this.breaks.get(id)?.status === 'backlash'; }
    powerOf(id) { return this.breaks.get(id)?.power || 0; }
    methodOf(id) { return this.breaks.get(id)?.method || null; }
    duration(id) {
        const b = this.breaks.get(id);
        if (!b || !b.endedAt) return 0;
        return b.endedAt - b.startedAt;
    }
    successRate() { return this.stats.total === 0 ? 0 : this.stats.totalBroken / this.stats.total; }
    sealCount(seal) { return this.listBySeal(seal).length; }
    averagePower() {
        if (this.breaks.size === 0) return 0;
        return this.listAll().reduce((s, b) => s + b.power, 0) / this.breaks.size;
    }
    countByMethod() {
        const c = {};
        for (const m of BREAK_METHODS) c[m] = 0;
        for (const b of this.breaks.values()) c[b.method] = (c[b.method] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalBroken: this.stats.totalBroken, totalFailed: this.stats.totalFailed, successRate: this.successRate() }; }
    reset() { this.breaks.clear(); this.stats = { total: 0, totalBroken: 0, totalFailed: 0, totalBacklash: 0 }; }
}
