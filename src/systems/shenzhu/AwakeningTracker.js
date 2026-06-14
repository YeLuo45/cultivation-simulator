/**
 * AwakeningTracker.js - 觉醒追踪器
 * V1099 P-20260614-601 Round 42 Iter 2/30
 */
export const AWAKENING_STATUS = ['dormant', 'awakening', 'awakened', 'transcended'];
export const AWAKENING_TYPES = ['bloodline', 'innate', 'triggered', 'forced', 'natural'];

export class AwakeningTracker {
    constructor(config = {}) {
        this.config = { ...config };
        this.events = new Map();   // eventId -> { id, owner, type, status, startedAt, completedAt, power }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalCompleted: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `awk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    begin(owner, type = 'natural', power = 1) {
        if (!owner) return null;
        if (!AWAKENING_TYPES.includes(type)) type = 'natural';
        const id = this._newId();
        const e = { id, owner, type, status: 'awakening', startedAt: Date.now(), completedAt: null, power };
        this.events.set(id, e);
        if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
        this.byOwner.get(owner).push(id);
        this.stats.total++;
        this._emit('begin', e);
        return e;
    }
    get(id) { return this.events.get(id) || null; }
    listAll() { return [...this.events.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.events.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(e => e.type === type); }
    listByStatus(st) { return this.listAll().filter(e => e.status === st); }
    listCompleted() { return this.listByStatus('awakened'); }

    setStatus(id, status) {
        const e = this.events.get(id);
        if (!e) return false;
        if (!AWAKENING_STATUS.includes(status)) return false;
        e.status = status;
        if (status === 'awakened') {
            e.completedAt = Date.now();
            this.stats.totalCompleted++;
            this._emit('awakened', e);
        }
        return true;
    }
    complete(id) { return this.setStatus(id, 'awakened'); }
    transcend(id) { return this.setStatus(id, 'transcended'); }
    isAwakened(id) { return this.events.get(id)?.status === 'awakened'; }
    isTranscended(id) { return this.events.get(id)?.status === 'transcended'; }
    isDormant(id) { return this.events.get(id)?.status === 'dormant'; }
    powerOf(id) { return this.events.get(id)?.power || 0; }
    typeOf(id) { return this.events.get(id)?.type || null; }
    duration(id) {
        const e = this.events.get(id);
        if (!e || !e.completedAt) return 0;
        return e.completedAt - e.startedAt;
    }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    totalPowerFor(owner) { return this.listByOwner(owner).reduce((s, e) => s + e.power, 0); }
    averagePower() { return this.stats.total === 0 ? 0 : this.listAll().reduce((s, e) => s + e.power, 0) / this.stats.total; }
    completionRate() { return this.stats.total === 0 ? 0 : this.stats.totalCompleted / this.stats.total; }
    report() { return { total: this.stats.total, completed: this.stats.totalCompleted, completionRate: this.completionRate() }; }
    reset() { this.events.clear(); this.byOwner.clear(); this.stats = { total: 0, totalCompleted: 0 }; }
}
