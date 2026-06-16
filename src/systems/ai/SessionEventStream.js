/**
 * SessionEventStream.js - 会话事件流
 * V949 P-20260614-002 Iteration 2/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (thunderbolt feedback + stream):
 * - 玩家每次会话 (login/logout/pause/resume)
 * - 标记 start/end 时长
 * - 维护活跃 session 列表
 * - 关闭/恢复事件
 */

export const SESSION_STATUSES = ['active', 'paused', 'closed', 'abandoned'];
export const MAX_SESSION_DURATION_MS = 24 * 60 * 60 * 1000;  // 24h
export const DEFAULT_MAX_SESSIONS = 500;

export class SessionEventStream {
    constructor(config = {}) {
        this.config = {
            maxSessions: config.maxSessions !== undefined ? config.maxSessions : DEFAULT_MAX_SESSIONS,
            maxSessionDurationMs: config.maxSessionDurationMs !== undefined ? config.maxSessionDurationMs : MAX_SESSION_DURATION_MS,
            ...config,
        };
        this.sessions = new Map();          // sessionId -> session
        this.playerSessions = new Map();    // playerId -> Set<sessionId>
        this.activeSessions = new Set();    // sessionId
        this.hooks = new Map();
        this.stats = { totalStarted: 0, totalClosed: 0, totalAbandoned: 0, totalResumed: 0 };
    }

    _emit(ev, payload) {
        const list = this.hooks.get(ev) || [];
        for (const l of list) { try { l(payload); } catch {} }
    }

    registerHook(ev, listener) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(listener);
    }

    _newId() {
        return `ses_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    startSession(playerId, meta = {}) {
        if (!playerId) return null;
        const id = this._newId();
        const now = Date.now();
        const session = {
            id, playerId,
            startTime: now,
            endTime: null,
            pauseTime: null,
            durationMs: 0,
            status: 'active',
            meta,
            events: [],
        };
        this.sessions.set(id, session);
        if (!this.playerSessions.has(playerId)) this.playerSessions.set(playerId, new Set());
        this.playerSessions.get(playerId).add(id);
        this.activeSessions.add(id);
        this.stats.totalStarted++;
        this._emit('started', session);
        if (this.sessions.size > this.config.maxSessions) this._pruneOldest();
        return session;
    }

    recordEvent(sessionId, kind, data = {}) {
        const s = this.sessions.get(sessionId);
        if (!s) return null;
        const evt = { kind, data, timestamp: Date.now() };
        s.events.push(evt);
        this._emit('eventRecorded', { session: s, event: evt });
        return evt;
    }

    pauseSession(sessionId) {
        const s = this.sessions.get(sessionId);
        if (!s || s.status !== 'active') return null;
        s.status = 'paused';
        s.pauseTime = Date.now();
        this.activeSessions.delete(sessionId);
        this._emit('paused', s);
        return s;
    }

    resumeSession(sessionId) {
        const s = this.sessions.get(sessionId);
        if (!s || s.status !== 'paused') return null;
        const pausedFor = Date.now() - s.pauseTime;
        s.durationMs += pausedFor;
        s.pauseTime = null;
        s.status = 'active';
        this.activeSessions.add(sessionId);
        this.stats.totalResumed++;
        this._emit('resumed', s);
        return s;
    }

    closeSession(sessionId, abandoned = false) {
        const s = this.sessions.get(sessionId);
        if (!s) return null;
        const now = Date.now();
        if (s.status === 'active') s.durationMs += now - s.startTime;
        else if (s.status === 'paused') s.durationMs += now - s.pauseTime;
        if (now - s.startTime > this.config.maxSessionDurationMs) {
            s.status = 'abandoned';
            this.stats.totalAbandoned++;
        } else {
            s.status = abandoned ? 'abandoned' : 'closed';
            if (abandoned) this.stats.totalAbandoned++;
            else this.stats.totalClosed++;
        }
        s.endTime = now;
        this.activeSessions.delete(sessionId);
        this._emit('closed', s);
        return s;
    }

    _pruneOldest() {
        const sorted = [...this.sessions.values()]
            .filter(s => s.status === 'closed' || s.status === 'abandoned')
            .sort((a, b) => a.endTime - b.endTime);
        const toRemove = Math.max(0, this.sessions.size - this.config.maxSessions);
        for (let i = 0; i < toRemove && i < sorted.length; i++) {
            const s = sorted[i];
            this.sessions.delete(s.id);
            const set = this.playerSessions.get(s.playerId);
            if (set) set.delete(s.id);
        }
    }

    getSession(sessionId) { return this.sessions.get(sessionId) || null; }

    getActiveSessions(playerId = null) {
        const all = [...this.activeSessions].map(id => this.sessions.get(id)).filter(Boolean);
        if (playerId) return all.filter(s => s.playerId === playerId);
        return all;
    }

    listSessions(playerId) {
        const set = this.playerSessions.get(playerId);
        if (!set) return [];
        return [...set].map(id => this.sessions.get(id)).filter(Boolean);
    }

    report(playerId) {
        const list = this.listSessions(playerId);
        const total = list.length;
        const totalDuration = list.reduce((s, x) => s + x.durationMs, 0);
        const avgDuration = total > 0 ? totalDuration / total : 0;
        const longest = list.reduce((m, s) => s.durationMs > m ? s.durationMs : m, 0);
        return {
            playerId, totalSessions: total, totalDurationMs: totalDuration,
            avgDurationMs: avgDuration, longestMs: longest,
            statusBreakdown: list.reduce((acc, s) => {
                acc[s.status] = (acc[s.status] || 0) + 1; return acc;
            }, {}),
        };
    }

    reset() {
        this.sessions.clear();
        this.playerSessions.clear();
        this.activeSessions.clear();
        this.stats = { totalStarted: 0, totalClosed: 0, totalAbandoned: 0, totalResumed: 0 };
    }
}
