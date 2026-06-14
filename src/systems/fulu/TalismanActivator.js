/**
 * TalismanActivator.js - 符箓激活
 * V1135 Round 43 Iter 8/30
 */
export const ACTIVATION_STATUS = ['dormant', 'priming', 'active', 'cooling', 'exhausted'];
export const ACTIVATION_TRIGGERS = ['touch', 'proximity', 'time', 'command', 'condition'];

export class TalismanActivator {
    constructor(config = {}) {
        this.config = { ...config };
        this.activations = new Map();   // aid -> { id, talisman, trigger, status, power, activatedAt, expiresAt }
        this.hooks = new Map();
        this.stats = { total: 0, totalActive: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ta_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    arm(talisman, trigger = 'touch', power = 1, duration = 60000) {
        if (!talisman) return null;
        if (!ACTIVATION_TRIGGERS.includes(trigger)) trigger = 'touch';
        const id = this._newId();
        const a = { id, talisman, trigger, status: 'dormant', power, activatedAt: null, expiresAt: null };
        this.activations.set(id, a);
        this.stats.total++;
        return a;
    }
    get(id) { return this.activations.get(id) || null; }
    listAll() { return [...this.activations.values()]; }
    listByTalisman(tal) { return this.listAll().filter(a => a.talisman === tal); }
    listByStatus(st) { return this.listAll().filter(a => a.status === st); }
    listByTrigger(tr) { return this.listAll().filter(a => a.trigger === tr); }
    listDormant() { return this.listByStatus('dormant'); }
    listActive() { return this.listByStatus('active'); }

    setStatus(id, status) {
        const a = this.activations.get(id);
        if (!a) return false;
        if (!ACTIVATION_STATUS.includes(status)) return false;
        a.status = status;
        if (status === 'active') {
            a.activatedAt = Date.now();
            a.expiresAt = Date.now() + 60000;
            this.stats.totalActive++;
            this._emit('activated', a);
        } else if (status === 'exhausted') {
            this.stats.totalActive = Math.max(0, this.stats.totalActive - 1);
        }
        return true;
    }
    prime(id) { return this.setStatus(id, 'priming'); }
    activate(id) { return this.setStatus(id, 'active'); }
    cool(id) { return this.setStatus(id, 'cooling'); }
    exhaust(id) { return this.setStatus(id, 'exhausted'); }
    setPower(id, power) {
        const a = this.activations.get(id);
        if (!a) return false;
        a.power = Math.max(0, power);
        return true;
    }
    setTrigger(id, trigger) {
        const a = this.activations.get(id);
        if (!a) return false;
        if (!ACTIVATION_TRIGGERS.includes(trigger)) return false;
        a.trigger = trigger;
        return true;
    }
    isDormant(id) { return this.activations.get(id)?.status === 'dormant'; }
    isActive(id) { return this.activations.get(id)?.status === 'active'; }
    isPriming(id) { return this.activations.get(id)?.status === 'priming'; }
    isCooling(id) { return this.activations.get(id)?.status === 'cooling'; }
    isExhausted(id) { return this.activations.get(id)?.status === 'exhausted'; }
    powerOf(id) { return this.activations.get(id)?.power || 0; }
    triggerOf(id) { return this.activations.get(id)?.trigger || null; }
    talismanCount(tal) { return this.listByTalisman(tal).length; }
    activeCount() { return this.listActive().length; }
    averagePower() {
        if (this.activations.size === 0) return 0;
        return this.listAll().reduce((s, a) => s + a.power, 0) / this.activations.size;
    }
    bestPower() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, a) => !best || a.power > best.power ? a : best, null);
    }
    countByStatus() {
        const c = {};
        for (const st of ACTIVATION_STATUS) c[st] = 0;
        for (const a of this.activations.values()) c[a.status] = (c[a.status] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalActive: this.stats.totalActive }; }
    reset() { this.activations.clear(); this.stats = { total: 0, totalActive: 0 }; }
}
