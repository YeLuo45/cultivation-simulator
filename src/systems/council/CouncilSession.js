/**
 * CouncilSession.js - 议会会话
 * V989 P-20260614-149 Round 38 Iter 12/30
 */
export const SESSION_STATUS = ['scheduled', 'active', 'paused', 'closed', 'cancelled'];
export const SESSION_TYPES = ['regular', 'emergency', 'voting_only', 'ceremonial'];

export class CouncilSession {
    constructor(config = {}) {
        this.config = { ...config };
        this.sessions = new Map();    // sessionId -> { id, type, status, agenda, attendees, decisions, openedAt, closedAt }
        this.hooks = new Map();
        this.stats = { total: 0, active: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    schedule(type, agenda = [], scheduledFor = null) {
        if (!SESSION_TYPES.includes(type)) return null;
        const id = this._newId();
        const s = { id, type, agenda, attendees: new Set(), decisions: [], status: 'scheduled', scheduledFor, openedAt: null, closedAt: null };
        this.sessions.set(id, s);
        this.stats.total++;
        this._emit('scheduled', s);
        return s;
    }
    get(id) { return this.sessions.get(id) || null; }
    listAll() { return [...this.sessions.values()]; }
    listByStatus(st) { return this.sessions_list_by('status', st); }
    sessions_list_by(field, val) { return this.listAll().filter(s => s[field] === val); }

    open(id) {
        const s = this.sessions.get(id);
        if (!s || s.status !== 'scheduled') return false;
        s.status = 'active';
        s.openedAt = Date.now();
        this.stats.active++;
        this._emit('opened', s);
        return true;
    }
    pause(id) {
        const s = this.sessions.get(id);
        if (!s || s.status !== 'active') return false;
        s.status = 'paused';
        this.stats.active--;
        return true;
    }
    resume(id) {
        const s = this.sessions.get(id);
        if (!s || s.status !== 'paused') return false;
        s.status = 'active';
        this.stats.active++;
        return true;
    }
    close(id) {
        const s = this.sessions.get(id);
        if (!s || (s.status !== 'active' && s.status !== 'paused')) return false;
        if (s.status === 'active') this.stats.active--;
        s.status = 'closed';
        s.closedAt = Date.now();
        this._emit('closed', s);
        return true;
    }
    cancel(id, reason = '') {
        const s = this.sessions.get(id);
        if (!s) return false;
        if (s.status === 'active') this.stats.active--;
        s.status = 'cancelled';
        s.cancelReason = reason;
        s.closedAt = Date.now();
        return true;
    }
    addAttendee(sessionId, memberId) {
        const s = this.sessions.get(sessionId);
        if (!s) return false;
        s.attendees.add(memberId);
        return true;
    }
    removeAttendee(sessionId, memberId) {
        const s = this.sessions.get(sessionId);
        if (!s) return false;
        s.attendees.delete(memberId);
        return true;
    }
    isAttending(sessionId, memberId) {
        const s = this.sessions.get(sessionId);
        return s ? s.attendees.has(memberId) : false;
    }
    addDecision(sessionId, decision) {
        const s = this.sessions.get(sessionId);
        if (!s) return null;
        const d = { id: `dec_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, ...decision, ts: Date.now() };
        s.decisions.push(d);
        this._emit('decisionAdded', d);
        return d;
    }
    attendanceCount(sessionId) { return this.sessions.get(sessionId)?.attendees.size || 0; }
    isActive(sessionId) { return this.sessions.get(sessionId)?.status === 'active'; }
    report() { return { total: this.stats.total, active: this.stats.active }; }
    reset() { this.sessions.clear(); this.stats = { total: 0, active: 0 }; }
}
