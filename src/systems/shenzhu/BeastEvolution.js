/**
 * BeastEvolution.js - 灵兽进化
 * V1111 P-20260614-804 Round 42 Iter 14/30
 */
export const EVOLUTION_STATUS = ['locked', 'available', 'in_progress', 'evolved', 'failed'];
export const EVOLUTION_PATHS = ['ascension', 'transformation', 'awakening', 'divine_pact', 'bloodline_purge'];

export class BeastEvolution {
    constructor(config = {}) {
        this.config = { ...config };
        this.evolutions = new Map();   // eid -> { id, beast, path, status, level, ts }
        this.hooks = new Map();
        this.stats = { total: 0, totalEvolved: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `be_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    start(beast, path = 'ascension') {
        if (!beast) return null;
        if (!EVOLUTION_PATHS.includes(path)) path = 'ascension';
        const id = this._newId();
        const e = { id, beast, path, status: 'in_progress', level: 0, ts: Date.now() };
        this.evolutions.set(id, e);
        this.stats.total++;
        this._emit('started', e);
        return e;
    }
    get(id) { return this.evolutions.get(id) || null; }
    listAll() { return [...this.evolutions.values()]; }
    listByBeast(beast) { return this.listAll().filter(e => e.beast === beast); }
    listByStatus(st) { return this.listAll().filter(e => e.status === st); }
    listByPath(path) { return this.listAll().filter(e => e.path === path); }
    listEvolved() { return this.listByStatus('evolved'); }

    setStatus(id, status) {
        const e = this.evolutions.get(id);
        if (!e) return false;
        if (!EVOLUTION_STATUS.includes(status)) return false;
        e.status = status;
        if (status === 'evolved') {
            this.stats.totalEvolved++;
            this._emit('evolved', e);
        }
        return true;
    }
    succeed(id) { return this.setStatus(id, 'evolved'); }
    fail(id) { return this.setStatus(id, 'failed'); }
    unlock(id) { return this.setStatus(id, 'available'); }
    setLevel(id, level) {
        const e = this.evolutions.get(id);
        if (!e) return false;
        e.level = Math.max(0, level);
        return true;
    }
    setPath(id, path) {
        const e = this.evolutions.get(id);
        if (!e) return false;
        if (!EVOLUTION_PATHS.includes(path)) return false;
        e.path = path;
        return true;
    }
    isEvolved(id) { return this.evolutions.get(id)?.status === 'evolved'; }
    isFailed(id) { return this.evolutions.get(id)?.status === 'failed'; }
    isAvailable(id) { return this.evolutions.get(id)?.status === 'available'; }
    isInProgress(id) { return this.evolutions.get(id)?.status === 'in_progress'; }
    levelOf(id) { return this.evolutions.get(id)?.level || 0; }
    pathOf(id) { return this.evolutions.get(id)?.path || null; }
    beastCount(beast) { return this.listByBeast(beast).length; }
    successRate() { return this.stats.total === 0 ? 0 : this.stats.totalEvolved / this.stats.total; }
    averageLevel() {
        if (this.evolutions.size === 0) return 0;
        return this.listAll().reduce((s, e) => s + e.level, 0) / this.evolutions.size;
    }
    bestFor(beast) {
        const list = this.listByBeast(beast).filter(e => e.status === 'evolved');
        if (list.length === 0) return null;
        return list.reduce((best, e) => !best || e.level > best.level ? e : best, null);
    }
    countByPath() {
        const c = {};
        for (const p of EVOLUTION_PATHS) c[p] = 0;
        for (const e of this.evolutions.values()) c[e.path] = (c[e.path] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalEvolved: this.stats.totalEvolved, successRate: this.successRate() }; }
    reset() { this.evolutions.clear(); this.stats = { total: 0, totalEvolved: 0 }; }
}
