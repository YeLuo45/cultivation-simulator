/**
 * ArrayActivator.js - 符阵激活
 * V1150 Round 43 Iter 23/30
 */
export const ACTIVATE_STATUS = ['dormant', 'priming', 'active', 'cooling', 'expired', 'overload'];
export const ACTIVATE_TRIGGERS = ['time', 'trigger', 'sustained', 'command', 'passive'];

export class ArrayActivator {
    constructor(config = {}) {
        this.config = { ...config };
        this.activations = new Map();   // aid -> { id, array, trigger, status, power, startedAt, expiresAt }
        this.hooks = new Map();
        this.stats = { total: 0, totalActive: 0, totalOverload: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `aa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    arm(array, trigger = 'command', power = 1) {
        if (!array) return null;
        if (!ACTIVATE_TRIGGERS.includes(trigger)) trigger = 'command';
        const id = this._newId();
        const a = { id, array, trigger, status: 'dormant', power, startedAt: null, expiresAt: null };
        this.activations.set(id, a);
        this.stats.total++;
        return a;
    }
    get(id) { return this.activations.get(id) || null; }
    listAll() { return [...this.activations.values()]; }
    listByArray(arr) { return this.listAll().filter(a => a.array === arr); }
    listByStatus(st) { return this.listAll().filter(a => a.status === st); }
    listByTrigger(tr) { return this.listAll().filter(a => a.trigger === tr); }
    listActive() { return this.listByStatus('active'); }

    setStatus(id, status) {
        const a = this.activations.get(id);
        if (!a) return false;
        if (!ACTIVATE_STATUS.includes(status)) return false;
        a.status = status;
        if (status === 'active') {
            a.startedAt = Date.now();
            a.expiresAt = Date.now() + 120000;
            this.stats.totalActive++;
            this._emit('activated', a);
        } else if (status === 'expired') {
            this.stats.totalActive = Math.max(0, this.stats.totalActive - 1);
        } else if (status === 'overload') {
            this.stats.totalOverload++;
            this._emit('overload', a);
        }
        return true;
    }
    prime(id) { return this.setStatus(id, 'priming'); }
    activate(id) { return this.setStatus(id, 'active'); }
    cool(id) { return this.setStatus(id, 'cooling'); }
    expire(id) { return this.setStatus(id, 'expired'); }
    overload(id) { return this.setStatus(id, 'overload'); }
    setPower(id, power) {
        const a = this.activations.get(id);
        if (!a) return false;
        a.power = Math.max(0, power);
        return true;
    }
    setTrigger(id, trigger) {
        const a = this.activations.get(id);
        if (!a) return false;
        if (!ACTIVATE_TRIGGERS.includes(trigger)) return false;
        a.trigger = trigger;
        return true;
    }
    isDormant(id) { return this.activations.get(id)?.status === 'dormant'; }
    isActive(id) { return this.activations.get(id)?.status === 'active'; }
    isOverload(id) { return this.activations.get(id)?.status === 'overload'; }
    isExpired(id) { return this.activations.get(id)?.status === 'expired'; }
    powerOf(id) { return this.activations.get(id)?.power || 0; }
    triggerOf(id) { return this.activations.get(id)?.trigger || null; }
    arrayCount(arr) { return this.listByArray(arr).length; }
    activeCount() { return this.listActive().length; }
    averagePower() {
        if (this.activations.size === 0) return 0;
        return this.listAll().reduce((s, a) => s + a.power, 0) / this.activations.size;
    }
    countByStatus() {
        const c = {};
        for (const st of ACTIVATE_STATUS) c[st] = 0;
        for (const a of this.activations.values()) c[a.status] = (c[a.status] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalActive: this.stats.totalActive, totalOverload: this.stats.totalOverload }; }
    reset() { this.activations.clear(); this.stats = { total: 0, totalActive: 0, totalOverload: 0 }; }
}
