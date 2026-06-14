/**
 * CounterEspionage.js - 反间谍
 * V1085 P-20260614-412 Round 41 Iter 18/30
 */
export const OP_STATUS = ['planning', 'active', 'successful', 'failed', 'exposed'];
export const COUNTER_METHODS = ['double_agent', 'disinformation', 'counter_intel', 'sabotage', 'exposure'];

export class CounterEspionage {
    constructor(config = {}) {
        this.config = { ...config };
        this.ops = new Map();   // opId -> { id, target, method, status, successRate, executedAt }
        this.hooks = new Map();
        this.stats = { total: 0, successful: 0, failed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `cnt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    plan(target, method = 'double_agent', successRate = 0.5) {
        if (!target) return null;
        if (!COUNTER_METHODS.includes(method)) method = 'double_agent';
        const id = this._newId();
        const o = { id, target, method, status: 'planning', successRate: Math.max(0, Math.min(1, successRate)), executedAt: null };
        this.ops.set(id, o);
        this.stats.total++;
        return o;
    }
    get(id) { return this.ops.get(id) || null; }
    listAll() { return [...this.ops.values()]; }
    listByStatus(st) { return this.listAll().filter(o => o.status === st); }
    listByMethod(method) { return this.listAll().filter(o => o.method === method); }
    listByTarget(target) { return this.listAll().filter(o => o.target === target); }

    execute(id) {
        const o = this.ops.get(id);
        if (!o) return false;
        if (o.status !== 'planning') return false;
        o.status = 'active';
        o.executedAt = Date.now();
        return true;
    }
    succeed(id) {
        const o = this.ops.get(id);
        if (!o) return false;
        o.status = 'successful';
        this.stats.successful++;
        this._emit('successful', o);
        return true;
    }
    fail(id) {
        const o = this.ops.get(id);
        if (!o) return false;
        o.status = 'failed';
        this.stats.failed++;
        this._emit('failed', o);
        return true;
    }
    expose(id) {
        const o = this.ops.get(id);
        if (!o) return false;
        o.status = 'exposed';
        this._emit('exposed', o);
        return true;
    }
    setMethod(id, method) {
        const o = this.ops.get(id);
        if (!o) return false;
        if (!COUNTER_METHODS.includes(method)) return false;
        o.method = method;
        return true;
    }
    setSuccessRate(id, rate) {
        const o = this.ops.get(id);
        if (!o) return false;
        o.successRate = Math.max(0, Math.min(1, rate));
        return true;
    }
    isSuccessful(id) { return this.ops.get(id)?.status === 'successful'; }
    isFailed(id) { return this.ops.get(id)?.status === 'failed'; }
    isExposed(id) { return this.ops.get(id)?.status === 'exposed'; }
    successRate() { return this.stats.total === 0 ? 0 : this.stats.successful / this.stats.total; }
    report() { return { total: this.stats.total, successful: this.stats.successful, successRate: this.successRate() }; }
    reset() { this.ops.clear(); this.stats = { total: 0, successful: 0, failed: 0 }; }
}
