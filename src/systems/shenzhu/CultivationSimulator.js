/**
 * CultivationSimulator.js - 修炼模拟器
 * V1105 P-20260614-607 Round 42 Iter 8/30
 */
export const CULTIVATION_STATUS = ['idle', 'meditating', 'circulating', 'breakthrough', 'tribulation', 'failed'];
export const CULTIVATION_MODES = ['closed_door', 'combat', 'travel', 'alchemy', 'array'];

export class CultivationSimulator {
    constructor(config = {}) {
        this.config = { ...config };
        this.sessions = new Map();   // sid -> { id, owner, mode, status, startedAt, endedAt, exp, qi }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalExp: 0, totalQi: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `cs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    start(owner, mode = 'closed_door') {
        if (!owner) return null;
        if (!CULTIVATION_MODES.includes(mode)) mode = 'closed_door';
        const id = this._newId();
        const s = { id, owner, mode, status: 'meditating', startedAt: Date.now(), endedAt: null, exp: 0, qi: 0 };
        this.sessions.set(id, s);
        if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
        this.byOwner.get(owner).push(id);
        this.stats.total++;
        return s;
    }
    get(id) { return this.sessions.get(id) || null; }
    listAll() { return [...this.sessions.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.sessions.get(id)).filter(Boolean);
    }
    listByStatus(st) { return this.listAll().filter(s => s.status === st); }
    listByMode(mode) { return this.listAll().filter(s => s.mode === mode); }

    setStatus(id, status) {
        const s = this.sessions.get(id);
        if (!s) return false;
        if (!CULTIVATION_STATUS.includes(status)) return false;
        s.status = status;
        if (status === 'idle' || status === 'failed') s.endedAt = Date.now();
        return true;
    }
    breakthrough(id) { return this.setStatus(id, 'breakthrough'); }
    startTribulation(id) { return this.setStatus(id, 'tribulation'); }
    fail(id) { return this.setStatus(id, 'failed'); }
    gainExp(id, amount) {
        const s = this.sessions.get(id);
        if (!s) return false;
        if (typeof amount !== 'number' || amount <= 0) return false;
        s.exp += amount;
        this.stats.totalExp += amount;
        return true;
    }
    gainQi(id, amount) {
        const s = this.sessions.get(id);
        if (!s) return false;
        if (typeof amount !== 'number' || amount <= 0) return false;
        s.qi += amount;
        this.stats.totalQi += amount;
        return true;
    }
    isActive(id) { return this.sessions.get(id)?.status === 'meditating' || this.sessions.get(id)?.status === 'circulating' || this.sessions.get(id)?.status === 'breakthrough'; }
    isFailed(id) { return this.sessions.get(id)?.status === 'failed'; }
    isBreakthrough(id) { return this.sessions.get(id)?.status === 'breakthrough'; }
    isTribulation(id) { return this.sessions.get(id)?.status === 'tribulation'; }
    expOf(id) { return this.sessions.get(id)?.exp || 0; }
    qiOf(id) { return this.sessions.get(id)?.qi || 0; }
    duration(id) {
        const s = this.sessions.get(id);
        if (!s) return 0;
        const end = s.endedAt || Date.now();
        return end - s.startedAt;
    }
    totalExpFor(owner) { return this.listByOwner(owner).reduce((sum, s) => sum + s.exp, 0); }
    totalQiFor(owner) { return this.listByOwner(owner).reduce((sum, s) => sum + s.qi, 0); }
    averageExp() { return this.stats.total === 0 ? 0 : this.stats.totalExp / this.stats.total; }
    averageQi() { return this.stats.total === 0 ? 0 : this.stats.totalQi / this.stats.total; }
    activeCount() { return this.listAll().filter(s => this.isActive(s.id)).length; }
    report() { return { total: this.stats.total, totalExp: this.stats.totalExp, totalQi: this.stats.totalQi }; }
    reset() { this.sessions.clear(); this.byOwner.clear(); this.stats = { total: 0, totalExp: 0, totalQi: 0 }; }
}
