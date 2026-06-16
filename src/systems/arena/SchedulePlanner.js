/**
 * SchedulePlanner.js - 赛程规划器
 * V1012 P-20260614-172 Round 39 Iter 5/30
 */
export const SCHEDULE_STATUS = ['draft', 'confirmed', 'in_progress', 'completed', 'cancelled'];

export class SchedulePlanner {
    constructor(config = {}) {
        this.config = { ...config };
        this.schedules = new Map();   // scheduleId -> { id, title, matches, status, createdAt }
        this.byMatch = new Map();     // matchId -> scheduleId
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `sch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(title, matches = []) {
        if (!title) return null;
        const id = this._newId();
        const s = { id, title, matches: matches.map(m => ({ ...m, status: 'scheduled' })), status: 'draft', createdAt: Date.now() };
        this.schedules.set(id, s);
        this.stats.total++;
        for (const m of s.matches) this.byMatch.set(m.id, id);
        this._emit('created', s);
        return s;
    }
    get(id) { return this.schedules.get(id) || null; }
    listAll() { return [...this.schedules.values()]; }
    listByStatus(st) { return this.listAll().filter(s => s.status === st); }
    listByMatch(matchId) {
        const sid = this.byMatch.get(matchId);
        return sid ? this.schedules.get(sid) : null;
    }
    confirm(id) {
        const s = this.schedules.get(id);
        if (!s || s.status !== 'draft') return false;
        s.status = 'confirmed';
        return true;
    }
    start(id) {
        const s = this.schedules.get(id);
        if (!s || s.status !== 'confirmed') return false;
        s.status = 'in_progress';
        return true;
    }
    complete(id) {
        const s = this.schedules.get(id);
        if (!s) return false;
        s.status = 'completed';
        return true;
    }
    cancel(id, reason = '') {
        const s = this.schedules.get(id);
        if (!s) return false;
        s.status = 'cancelled';
        s.cancelReason = reason;
        return true;
    }
    addMatch(scheduleId, match) {
        const s = this.schedules.get(scheduleId);
        if (!s) return false;
        const m = { ...match, status: 'scheduled' };
        s.matches.push(m);
        this.byMatch.set(m.id, scheduleId);
        return true;
    }
    removeMatch(matchId) {
        const sid = this.byMatch.get(matchId);
        if (!sid) return false;
        const s = this.schedules.get(sid);
        if (s) s.matches = s.matches.filter(m => m.id !== matchId);
        return this.byMatch.delete(matchId);
    }
    updateMatchStatus(matchId, status) {
        const sid = this.byMatch.get(matchId);
        if (!sid) return false;
        const s = this.schedules.get(sid);
        if (!s) return false;
        const m = s.matches.find(x => x.id === matchId);
        if (!m) return false;
        m.status = status;
        return true;
    }
    isMatchScheduled(matchId) { return this.byMatch.has(matchId); }
    progress(id) {
        const s = this.schedules.get(id);
        if (!s || s.matches.length === 0) return 0;
        const done = s.matches.filter(m => m.status === 'completed').length;
        return done / s.matches.length;
    }
    nextMatch(id) {
        const s = this.schedules.get(id);
        if (!s) return null;
        return s.matches.find(m => m.status === 'scheduled') || null;
    }
    report() { return { total: this.stats.total, byStatus: this.listAll().reduce((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {}) }; }
    reset() { this.schedules.clear(); this.byMatch.clear(); this.stats = { total: 0 }; }
}
