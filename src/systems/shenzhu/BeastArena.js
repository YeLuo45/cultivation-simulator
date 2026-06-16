/**
 * BeastArena.js - 灵兽竞技场
 * V1112 P-20260614-805 Round 42 Iter 15/30
 */
export const ARENA_STATUS = ['pending', 'fighting', 'finished', 'cancelled'];
export const ARENA_TYPES = ['single', 'team', 'tournament', 'royal'];

export class BeastArena {
    constructor(config = {}) {
        this.config = { ...config };
        this.matches = new Map();   // mid -> { id, beasts, type, status, winner, startedAt, endedAt }
        this.hooks = new Map();
        this.stats = { total: 0, totalFinished: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ar_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(beasts, type = 'single') {
        if (!Array.isArray(beasts) || beasts.length < 2) return null;
        if (!ARENA_TYPES.includes(type)) type = 'single';
        const id = this._newId();
        const m = { id, beasts: [...beasts], type, status: 'pending', winner: null, startedAt: null, endedAt: null };
        this.matches.set(id, m);
        this.stats.total++;
        return m;
    }
    get(id) { return this.matches.get(id) || null; }
    listAll() { return [...this.matches.values()]; }
    listByStatus(st) { return this.listAll().filter(m => m.status === st); }
    listByType(type) { return this.listAll().filter(m => m.type === type); }
    listByBeast(beast) { return this.listAll().filter(m => m.beasts.includes(beast)); }
    listActive() { return this.listByStatus('fighting'); }

    setStatus(id, status) {
        const m = this.matches.get(id);
        if (!m) return false;
        if (!ARENA_STATUS.includes(status)) return false;
        m.status = status;
        if (status === 'finished') {
            m.endedAt = Date.now();
            this.stats.totalFinished++;
        } else if (status === 'fighting') {
            m.startedAt = Date.now();
        }
        return true;
    }
    start(id) { return this.setStatus(id, 'fighting'); }
    finish(id, winner) {
        const m = this.matches.get(id);
        if (!m) return false;
        if (m.status !== 'fighting') return false;
        if (!m.beasts.includes(winner)) return false;
        m.winner = winner;
        m.status = 'finished';
        m.endedAt = Date.now();
        this.stats.totalFinished++;
        this._emit('finished', m);
        return true;
    }
    cancel(id) { return this.setStatus(id, 'cancelled'); }
    isActive(id) { return this.matches.get(id)?.status === 'fighting'; }
    isFinished(id) { return this.matches.get(id)?.status === 'finished'; }
    isPending(id) { return this.matches.get(id)?.status === 'pending'; }
    winnerOf(id) { return this.matches.get(id)?.winner || null; }
    beastsOf(id) { return [...(this.matches.get(id)?.beasts || [])]; }
    duration(id) {
        const m = this.matches.get(id);
        if (!m || !m.endedAt) return 0;
        return m.endedAt - m.startedAt;
    }
    isBeastInMatch(beast) { return this.listByBeast(beast).length > 0; }
    wins(beast) { return this.listAll().filter(m => m.winner === beast).length; }
    losses(beast) {
        return this.listByBeast(beast).filter(m => m.status === 'finished' && m.winner !== beast).length;
    }
    winRate(beast) {
        const total = this.wins(beast) + this.losses(beast);
        return total === 0 ? 0 : this.wins(beast) / total;
    }
    averageDuration() {
        const finished = this.listByStatus('finished');
        if (finished.length === 0) return 0;
        return finished.reduce((s, m) => s + (m.endedAt - m.startedAt), 0) / finished.length;
    }
    beastStats(beast) {
        return { wins: this.wins(beast), losses: this.losses(beast), winRate: this.winRate(beast) };
    }
    report() { return { total: this.stats.total, totalFinished: this.stats.totalFinished }; }
    reset() { this.matches.clear(); this.stats = { total: 0, totalFinished: 0 }; }
}
