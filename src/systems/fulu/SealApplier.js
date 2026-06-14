/**
 * SealApplier.js - 封印施加
 * V1139 Round 43 Iter 12/30
 */
export const APPLY_STATUS = ['planning', 'attaching', 'active', 'expired', 'rejected'];
export const APPLY_RESISTANCE = ['immune', 'strong', 'normal', 'weak', 'none'];

export class SealApplier {
    constructor(config = {}) {
        this.config = { ...config };
        this.applies = new Map();   // aid -> { id, seal, target, status, resistance, startedAt, expiresAt }
        this.byTarget = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalActive: 0, totalRejected: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `sa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    apply(seal, target, resistance = 'normal') {
        if (!seal || !target) return null;
        if (!APPLY_RESISTANCE.includes(resistance)) resistance = 'normal';
        const id = this._newId();
        const a = { id, seal, target, status: 'attaching', resistance, startedAt: Date.now(), expiresAt: null };
        this.applies.set(id, a);
        if (!this.byTarget.has(target)) this.byTarget.set(target, []);
        this.byTarget.get(target).push(id);
        this.stats.total++;
        return a;
    }
    get(id) { return this.applies.get(id) || null; }
    listAll() { return [...this.applies.values()]; }
    listBySeal(seal) { return this.listAll().filter(a => a.seal === seal); }
    listByTarget(target) {
        const ids = this.byTarget.get(target) || [];
        return ids.map(id => this.applies.get(id)).filter(Boolean);
    }
    listByStatus(st) { return this.listAll().filter(a => a.status === st); }
    listActive() { return this.listByStatus('active'); }
    listRejected() { return this.listByStatus('rejected'); }

    setStatus(id, status) {
        const a = this.applies.get(id);
        if (!a) return false;
        if (!APPLY_STATUS.includes(status)) return false;
        a.status = status;
        if (status === 'active') {
            a.expiresAt = Date.now() + 300000;
            this.stats.totalActive++;
            this._emit('active', a);
        } else if (status === 'rejected') {
            this.stats.totalRejected++;
            this._emit('rejected', a);
        } else if (status === 'expired') {
            this.stats.totalActive = Math.max(0, this.stats.totalActive - 1);
        }
        return true;
    }
    activate(id) { return this.setStatus(id, 'active'); }
    expire(id) { return this.setStatus(id, 'expired'); }
    reject(id) { return this.setStatus(id, 'rejected'); }
    setResistance(id, resistance) {
        const a = this.applies.get(id);
        if (!a) return false;
        if (!APPLY_RESISTANCE.includes(resistance)) return false;
        a.resistance = resistance;
        return true;
    }
    isActive(id) { return this.applies.get(id)?.status === 'active'; }
    isExpired(id) { return this.applies.get(id)?.status === 'expired'; }
    isRejected(id) { return this.applies.get(id)?.status === 'rejected'; }
    isAttaching(id) { return this.applies.get(id)?.status === 'attaching'; }
    resistanceOf(id) { return this.applies.get(id)?.resistance || null; }
    sealCount(seal) { return this.listBySeal(seal).length; }
    targetCount(target) { return this.listByTarget(target).length; }
    activeCount() { return this.listActive().length; }
    rejectionRate() { return this.stats.total === 0 ? 0 : this.stats.totalRejected / this.stats.total; }
    bestSealFor(target) {
        const list = this.listByTarget(target).filter(a => a.status === 'active');
        if (list.length === 0) return null;
        return list.reduce((best, a) => best, list[0]);
    }
    countByResistance() {
        const c = {};
        for (const r of APPLY_RESISTANCE) c[r] = 0;
        for (const a of this.applies.values()) c[a.resistance] = (c[a.resistance] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalActive: this.stats.totalActive, totalRejected: this.stats.totalRejected }; }
    reset() { this.applies.clear(); this.byTarget.clear(); this.stats = { total: 0, totalActive: 0, totalRejected: 0 }; }
}
