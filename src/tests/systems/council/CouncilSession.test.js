import { describe, it, expect, beforeEach } from 'vitest';
import { CouncilSession, SESSION_TYPES } from '../../../systems/council/CouncilSession.js';

describe('CouncilSession', () => {
    let s;
    beforeEach(() => { s = new CouncilSession(); });
    it('initializes with defaults', () => { expect(s.stats.total).toBe(0); });
    it('schedule creates session', () => {
        const x = s.schedule('regular');
        expect(x).not.toBeNull();
    });
    it('schedule rejects invalid type', () => { expect(s.schedule('invalid')).toBeNull(); });
    it('get returns null for unknown', () => { expect(s.get('ghost')).toBeNull(); });
    it('listAll', () => { s.schedule('regular'); expect(s.listAll().length).toBe(1); });
    it('listByStatus', () => { s.schedule('regular'); expect(s.listByStatus('scheduled').length).toBe(1); });
    it('open', () => {
        const x = s.schedule('regular');
        expect(s.open(x.id)).toBe(true);
    });
    it('open fails for active', () => {
        const x = s.schedule('regular');
        s.open(x.id);
        expect(s.open(x.id)).toBe(false);
    });
    it('open fails for unknown', () => { expect(s.open('ghost')).toBe(false); });
    it('pause and resume', () => {
        const x = s.schedule('regular');
        s.open(x.id);
        expect(s.pause(x.id)).toBe(true);
        expect(s.resume(x.id)).toBe(true);
    });
    it('close', () => {
        const x = s.schedule('regular');
        s.open(x.id);
        expect(s.close(x.id)).toBe(true);
    });
    it('cancel', () => {
        const x = s.schedule('regular');
        expect(s.cancel(x.id, 'test')).toBe(true);
    });
    it('addAttendee and isAttending', () => {
        const x = s.schedule('regular');
        s.addAttendee(x.id, 'm1');
        expect(s.isAttending(x.id, 'm1')).toBe(true);
    });
    it('removeAttendee', () => {
        const x = s.schedule('regular');
        s.addAttendee(x.id, 'm1');
        s.removeAttendee(x.id, 'm1');
        expect(s.isAttending(x.id, 'm1')).toBe(false);
    });
    it('isAttending for unknown returns false', () => { expect(s.isAttending('ghost', 'm1')).toBe(false); });
    it('addDecision', () => {
        const x = s.schedule('regular');
        expect(s.addDecision(x.id, { type: 'pass' })).not.toBeNull();
    });
    it('addDecision returns null for unknown', () => { expect(s.addDecision('ghost', {})).toBeNull(); });
    it('attendanceCount', () => {
        const x = s.schedule('regular');
        s.addAttendee(x.id, 'm1');
        s.addAttendee(x.id, 'm2');
        expect(s.attendanceCount(x.id)).toBe(2);
    });
    it('isActive', () => {
        const x = s.schedule('regular');
        s.open(x.id);
        expect(s.isActive(x.id)).toBe(true);
    });
    it('report aggregates', () => { s.schedule('regular'); expect(s.report().total).toBe(1); });
    it('reset clears', () => { s.schedule('regular'); s.reset(); expect(s.stats.total).toBe(0); });
    it('exposes SESSION_TYPES', () => { expect(SESSION_TYPES).toContain('regular'); });
});
