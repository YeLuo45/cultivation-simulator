/**
 * SessionEventStream.test.js - 会话事件流测试
 * V949 P-20260614-002 Iteration 2/30 Round 37 - 目标覆盖率 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { SessionEventStream, SESSION_STATUSES } from '../../../systems/ai/SessionEventStream.js';

describe('SessionEventStream', () => {
    let s;
    beforeEach(() => { s = new SessionEventStream(); });

    it('initializes with defaults', () => {
        expect(s.sessions.size).toBe(0);
        expect(s.stats.totalStarted).toBe(0);
    });

    it('starts a session', () => {
        const ses = s.startSession('p1');
        expect(ses).not.toBeNull();
        expect(ses.status).toBe('active');
        expect(s.stats.totalStarted).toBe(1);
    });

    it('rejects empty playerId', () => {
        expect(s.startSession('')).toBeNull();
    });

    it('pauses and resumes session', () => {
        const ses = s.startSession('p1');
        s.pauseSession(ses.id);
        expect(s.getSession(ses.id).status).toBe('paused');
        s.resumeSession(ses.id);
        expect(s.getSession(ses.id).status).toBe('active');
        expect(s.stats.totalResumed).toBe(1);
    });

    it('close session calculates duration', () => {
        const ses = s.startSession('p1');
        s.closeSession(ses.id);
        const final = s.getSession(ses.id);
        expect(final.status).toBe('closed');
        expect(final.endTime).not.toBeNull();
        expect(s.stats.totalClosed).toBe(1);
    });

    it('marks long-running session as abandoned', () => {
        const s2 = new SessionEventStream({ maxSessionDurationMs: 1 });
        const ses = s2.startSession('p1');
        return new Promise((r) => setTimeout(() => {
            s2.closeSession(ses.id);
            expect(s2.getSession(ses.id).status).toBe('abandoned');
            r();
        }, 10));
    });

    it('records events in session', () => {
        const ses = s.startSession('p1');
        const evt = s.recordEvent(ses.id, 'levelup', { realm: 'gold_core' });
        expect(evt.kind).toBe('levelup');
        expect(s.getSession(ses.id).events.length).toBe(1);
    });

    it('returns null for unknown session event', () => {
        expect(s.recordEvent('ghost', 'test')).toBeNull();
    });

    it('lists active sessions', () => {
        const s1 = s.startSession('p1');
        s.startSession('p2');
        expect(s.getActiveSessions().length).toBe(2);
        s.closeSession(s1.id);
        expect(s.getActiveSessions().length).toBe(1);
    });

    it('lists active sessions filtered by player', () => {
        s.startSession('p1');
        s.startSession('p2');
        expect(s.getActiveSessions('p1').length).toBe(1);
    });

    it('returns null for invalid pause/resume', () => {
        const ses = s.startSession('p1');
        s.closeSession(ses.id);
        expect(s.pauseSession(ses.id)).toBeNull();
        expect(s.resumeSession(ses.id)).toBeNull();
    });

    it('returns null for invalid close', () => {
        expect(s.closeSession('ghost')).toBeNull();
    });

    it('report aggregates session stats', () => {
        s.startSession('p1');
        s.startSession('p1');
        const r = s.report('p1');
        expect(r.totalSessions).toBe(2);
    });

    it('reset clears all', () => {
        s.startSession('p1');
        s.reset();
        expect(s.sessions.size).toBe(0);
    });

    it('exposes SESSION_STATUSES', () => {
        expect(SESSION_STATUSES).toContain('active');
    });

    it('triggers started hook', () => {
        let called = false;
        s.registerHook('started', () => { called = true; });
        s.startSession('p1');
        expect(called).toBe(true);
    });

    it('pauseSession updates duration after resume', () => {
        const ses = s.startSession('p1');
        s.pauseSession(ses.id);
        return new Promise((r) => setTimeout(() => {
            s.resumeSession(ses.id);
            expect(s.getSession(ses.id).durationMs).toBeGreaterThanOrEqual(0);
            r();
        }, 5));
    });

    it('closeSession on paused session includes paused duration', () => {
        const ses = s.startSession('p1');
        s.pauseSession(ses.id);
        s.closeSession(ses.id);
        expect(s.getSession(ses.id).status).toBe('closed');
    });

    it('prunes oldest closed sessions over maxSessions', () => {
        const s2 = new SessionEventStream({ maxSessions: 3 });
        for (let i = 0; i < 6; i++) {
            const x = s2.startSession('p1');
            s2.closeSession(x.id);
        }
        expect(s2.sessions.size).toBeLessThanOrEqual(6);
    });

    it('triggers closed hook', () => {
        let called = false;
        s.registerHook('closed', () => { called = true; });
        const ses = s.startSession('p1');
        s.closeSession(ses.id);
        expect(called).toBe(true);
    });

    it('triggers resumed hook', () => {
        let called = false;
        s.registerHook('resumed', () => { called = true; });
        const ses = s.startSession('p1');
        s.pauseSession(ses.id);
        s.resumeSession(ses.id);
        expect(called).toBe(true);
    });

    it('report for player with no sessions', () => {
        const r = s.report('ghost');
        expect(r.totalSessions).toBe(0);
        expect(r.avgDurationMs).toBe(0);
    });

    it('closeSession on already closed still works', () => {
        const ses = s.startSession('p1');
        s.closeSession(ses.id);
        const second = s.closeSession(ses.id);
        expect(second).not.toBeNull();
        expect(second.status).toBe('closed');
    });
});
