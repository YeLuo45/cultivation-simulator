/**
 * SignalJammer.js - 信号干扰器
 * V1072 P-20260614-361 Round 41 Iter 5/30
 */
export const SIGNAL_TYPES = ['qi', 'sound', 'light', 'spiritual', 'formation'];
export const JAMMING_STATUS = ['idle', 'active', 'overload', 'maintenance'];

export class SignalJammer {
    constructor(config = {}) {
        this.config = { ...config };
        this.jammers = new Map();   // jammerId -> { id, signalType, power, range, status, activatedAt }
        this.hooks = new Map();
        this.stats = { total: 0, totalJammed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `jmr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(signalType, power = 50, range = 100) {
        if (!SIGNAL_TYPES.includes(signalType)) return null;
        const id = this._newId();
        const j = { id, signalType, power, range, status: 'idle', activatedAt: null };
        this.jammers.set(id, j);
        this.stats.total++;
        return j;
    }
    get(id) { return this.jammers.get(id) || null; }
    listAll() { return [...this.jammers.values()]; }
    listByStatus(st) { return this.listAll().filter(j => j.status === st); }
    listBySignal(sig) { return this.listAll().filter(j => j.signalType === sig); }
    listActive() { return this.listByStatus('active'); }

    activate(id) {
        const j = this.jammers.get(id);
        if (!j) return false;
        if (j.status !== 'idle') return false;
        j.status = 'active';
        j.activatedAt = Date.now();
        this._emit('activated', j);
        return true;
    }
    deactivate(id) {
        const j = this.jammers.get(id);
        if (!j) return false;
        j.status = 'idle';
        return true;
    }
    overload(id) {
        const j = this.jammers.get(id);
        if (!j) return false;
        j.status = 'overload';
        this._emit('overload', j);
        return true;
    }
    maintain(id) { return this.setStatus(id, 'maintenance'); }
    setStatus(id, status) {
        const j = this.jammers.get(id);
        if (!j) return false;
        if (!JAMMING_STATUS.includes(status)) return false;
        j.status = status;
        return true;
    }
    setPower(id, power) {
        const j = this.jammers.get(id);
        if (!j) return false;
        j.power = Math.max(0, Math.min(100, power));
        return true;
    }
    setRange(id, range) {
        const j = this.jammers.get(id);
        if (!j) return false;
        j.range = Math.max(0, range);
        return true;
    }
    effectivePower(id) {
        const j = this.jammers.get(id);
        if (!j) return 0;
        if (j.status === 'active') return j.power;
        if (j.status === 'overload') return j.power * 1.5;
        return 0;
    }
    isActive(id) { return this.jammers.get(id)?.status === 'active'; }
    isOverload(id) { return this.jammers.get(id)?.status === 'overload'; }
    totalActivePower() { return this.listActive().reduce((s, j) => s + j.power, 0); }
    report() { return { total: this.stats.total, totalActivePower: this.totalActivePower() }; }
    reset() { this.jammers.clear(); this.stats = { total: 0, totalJammed: 0 }; }
}
