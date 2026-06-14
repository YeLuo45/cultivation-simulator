import { describe, it, expect, beforeEach } from 'vitest';
import { SectTermTracker } from '../../../systems/council/SectTermTracker.js';

describe('SectTermTracker', () => {
    let t;
    beforeEach(() => { t = new SectTermTracker(); });
    it('initializes with defaults', () => { expect(t.stats.total).toBe(0); });
    it('startTerm creates term', () => {
        const term = t.startTerm('m1', 'master');
        expect(term).not.toBeNull();
        expect(t.stats.total).toBe(1);
    });
    it('startTerm rejects invalid', () => {
        expect(t.startTerm('', 'master')).toBeNull();
        expect(t.startTerm('m1', '')).toBeNull();
    });
    it('isActive true for fresh term', () => {
        const term = t.startTerm('m1', 'master');
        expect(t.isActive(term.id)).toBe(true);
    });
    it('isActive false for unknown', () => { expect(t.isActive('ghost')).toBe(false); });
    it('remainingMs > 0 for fresh', () => {
        const term = t.startTerm('m1', 'master');
        expect(t.remainingMs(term.id)).toBeGreaterThan(0);
    });
    it('progress 0 for fresh', () => {
        const term = t.startTerm('m1', 'master');
        expect(t.progress(term.id)).toBe(0);
    });
    it('renew extends end', () => {
        const term = t.startTerm('m1', 'master');
        const orig = term.endTs;
        t.renew(term.id);
        expect(term.endTs).toBeGreaterThan(orig);
    });
    it('renew returns false for unknown', () => { expect(t.renew('ghost')).toBe(false); });
    it('revoke sets status', () => {
        const term = t.startTerm('m1', 'master');
        expect(t.revoke(term.id, 'test')).toBe(true);
    });
    it('revoke returns false for unknown', () => { expect(t.revoke('ghost')).toBe(false); });
    it('sweepExpired', () => {
        const t2 = new SectTermTracker({ defaultTermLength: 0 });
        const term = t2.startTerm('m1', 'master');
        t2.sweepExpired();
        expect(term.status).toBe('expired');
    });
    it('activeFor and historyFor', () => {
        t.startTerm('m1', 'master');
        expect(t.activeFor('m1').length).toBe(1);
        expect(t.historyFor('m1').length).toBe(1);
    });
    it('expiredTerms', () => {
        const t2 = new SectTermTracker({ defaultTermLength: 0 });
        t2.startTerm('m1', 'master');
        expect(t2.expiredTerms().length).toBe(1);
    });
    it('report aggregates', () => { t.startTerm('m1', 'master'); expect(t.report().total).toBe(1); });
    it('reset clears', () => { t.startTerm('m1', 'master'); t.reset(); expect(t.stats.total).toBe(0); });
});
