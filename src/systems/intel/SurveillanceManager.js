/**
 * SurveillanceManager.js - 监视管理器
 * V1084 P-20260614-411 Round 41 Iter 17/30
 */
export const SURVEILLANCE_STATUS = ['planning', 'active', 'paused', 'completed', 'blown'];
export const SURVEILLANCE_METHODS = ['visual', 'audio', 'spiritual', 'formation', 'scrying'];

export class SurveillanceManager {
    constructor(config = {}) {
        this.config = { ...config };
        this.ops = new Map();   // opId -> { id, target, method, status, duration, startedAt, endedAt }
        this.byTarget = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalCompleted: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `srv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    start(target, method = 'visual', duration = 24) {
        if (!target) return null;
        if (!SURVEILLANCE_METHODS.includes(method)) method = 'visual';
        const id = this._newId();
        const o = { id, target, method, status: 'planning', duration, startedAt: null, endedAt: null };
        this.ops.set(id, o);
        if (!this.byTarget.has(target)) this.byTarget.set(target, []);
        this.byTarget.get(target).push(id);
        this.stats.total++;
        return o;
    }
    get(id) { return this.ops.get(id) || null; }
    listAll() { return [...this.ops.values()]; }
    listByStatus(st) { return this.listAll().filter(o => o.status === st); }
    listByMethod(method) { return this.listAll().filter(o => o.method === method); }
    listByTarget(target) {
        const ids = this.byTarget.get(target) || [];
        return ids.map(id => this.ops.get(id)).filter(Boolean);
    }
    listActive() { return this.listByStatus('active'); }

    activate(id) {
        const o = this.ops.get(id);
        if (!o) return false;
        if (o.status !== 'planning') return false;
        o.status = 'active';
        o.startedAt = Date.now();
        return true;
    }
    pause(id) { return this._setStatus(id, 'paused'); }
    complete(id) {
        const o = this.ops.get(id);
        if (!o) return false;
        o.status = 'completed';
        o.endedAt = Date.now();
        this.stats.totalCompleted++;
        this._emit('completed', o);
        return true;
    }
    blow(id) {
        const o = this.ops.get(id);
        if (!o) return false;
        o.status = 'blown';
        o.endedAt = Date.now();
        this._emit('blown', o);
        return true;
    }
    _setStatus(id, status) {
        const o = this.ops.get(id);
        if (!o) return false;
        if (!SURVEILLANCE_STATUS.includes(status)) return false;
        o.status = status;
        return true;
    }
    setMethod(id, method) {
        const o = this.ops.get(id);
        if (!o) return false;
        if (!SURVEILLANCE_METHODS.includes(method)) return false;
        o.method = method;
        return true;
    }
    isActive(id) { return this.ops.get(id)?.status === 'active'; }
    isCompleted(id) { return this.ops.get(id)?.status === 'completed'; }
    isBlown(id) { return this.ops.get(id)?.status === 'blown'; }
    duration(id) {
        const o = this.ops.get(id);
        if (!o) return 0;
        if (!o.startedAt) return 0;
        const end = o.endedAt || Date.now();
        return end - o.startedAt;
    }
    targetFor(id) { return this.ops.get(id)?.target || null; }
    report() { return { total: this.stats.total, totalCompleted: this.stats.totalCompleted }; }
    reset() { this.ops.clear(); this.byTarget.clear(); this.stats = { total: 0, totalCompleted: 0 }; }
}
