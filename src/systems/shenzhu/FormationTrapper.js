/**
 * FormationTrapper.js - 阵法陷阱
 * V1121 P-20260614-814 Round 42 Iter 24/30
 */
export const TRAP_TYPES = ['damage', 'immobilize', 'silence', 'debuff', 'teleport', 'summon'];
export const TRAP_STATUS = ['armed', 'triggered', 'disarmed', 'expired'];

export class FormationTrapper {
    constructor(config = {}) {
        this.config = { ...config };
        this.traps = new Map();   // tid -> { id, type, status, location, owner, power, triggeredAt }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalTriggered: 0, totalDisarmed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ft_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    set(type, location, owner, power = 1) {
        if (!location) return null;
        if (!TRAP_TYPES.includes(type)) type = 'damage';
        const id = this._newId();
        const t = { id, type, status: 'armed', location, owner, power, triggeredAt: null, disarmedBy: null };
        this.traps.set(id, t);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        this.stats.total++;
        this._emit('set', t);
        return t;
    }
    get(id) { return this.traps.get(id) || null; }
    listAll() { return [...this.traps.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.traps.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(t => t.type === type); }
    listByStatus(st) { return this.listAll().filter(t => t.status === st); }
    listArmed() { return this.listByStatus('armed'); }

    setStatus(id, status) {
        const t = this.traps.get(id);
        if (!t) return false;
        if (!TRAP_STATUS.includes(status)) return false;
        t.status = status;
        return true;
    }
    trigger(id) {
        const t = this.traps.get(id);
        if (!t) return false;
        if (t.status !== 'armed') return false;
        t.status = 'triggered';
        t.triggeredAt = Date.now();
        this.stats.totalTriggered++;
        this._emit('triggered', t);
        return true;
    }
    disarm(id, by = 'unknown') {
        const t = this.traps.get(id);
        if (!t) return false;
        if (t.status !== 'armed' && t.status !== 'triggered') return false;
        t.status = 'disarmed';
        t.disarmedBy = by;
        this.stats.totalDisarmed++;
        return true;
    }
    expire(id) {
        const t = this.traps.get(id);
        if (!t) return false;
        if (t.status === 'disarmed' || t.status === 'triggered') return false;
        t.status = 'expired';
        return true;
    }
    setPower(id, power) {
        const t = this.traps.get(id);
        if (!t) return false;
        t.power = Math.max(0, power);
        return true;
    }
    isArmed(id) { return this.traps.get(id)?.status === 'armed'; }
    isTriggered(id) { return this.traps.get(id)?.status === 'triggered'; }
    isDisarmed(id) { return this.traps.get(id)?.status === 'disarmed'; }
    powerOf(id) { return this.traps.get(id)?.power || 0; }
    typeOf(id) { return this.traps.get(id)?.type || null; }
    locationOf(id) { return this.traps.get(id)?.location || null; }
    ownerOf(id) { return this.traps.get(id)?.owner || null; }
    triggerRate() { return this.stats.total === 0 ? 0 : this.stats.totalTriggered / this.stats.total; }
    averagePower() {
        if (this.traps.size === 0) return 0;
        return this.listAll().reduce((s, t) => s + t.power, 0) / this.traps.size;
    }
    bestFor(owner) {
        const list = this.listByOwner(owner).filter(t => t.status === 'triggered');
        if (list.length === 0) return null;
        return list.reduce((best, t) => !best || t.power > best.power ? t : best, null);
    }
    countByType() {
        const c = {};
        for (const t of TRAP_TYPES) c[t] = 0;
        for (const tr of this.traps.values()) c[tr.type] = (c[tr.type] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalTriggered: this.stats.totalTriggered, totalDisarmed: this.stats.totalDisarmed }; }
    reset() { this.traps.clear(); this.byOwner.clear(); this.stats = { total: 0, totalTriggered: 0, totalDisarmed: 0 }; }
}
