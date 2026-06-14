import { describe, it, expect, beforeEach } from 'vitest';
import { ExpirationTracker, EXPIRATION_STATUS } from '../../../systems/alchemy/ExpirationTracker.js';

describe('ExpirationTracker', () => {
    let t;
    beforeEach(() => { t = new ExpirationTracker(); });
    it('initializes with defaults', () => { expect(t.stats.total).toBe(0); });
    it('track', () => { expect(t.track('item1', 'Pill')).not.toBeNull(); });
    it('track rejects missing', () => { expect(t.track('', 'Pill')).toBeNull(); });
    it('get returns null for unknown', () => { expect(t.get('ghost')).toBeNull(); });
    it('listAll and listByStatus', () => { t.track('a'); expect(t.listAll().length).toBe(1); expect(t.listByStatus('fresh').length).toBe(1); });
    it('updateStatus', () => { const x = t.track('a', 'Pill', 1000, Date.now() - 600); t.updateStatus('a'); expect(x.status).toBe('aging'); });
    it('updateStatus for unknown', () => { expect(t.updateStatus('ghost')).toBe(false); });
    it('sweepAll', () => { t.track('a', 'Pill', 100, Date.now() - 200); t.sweepAll(); expect(t.listByStatus('expired').length).toBe(1); });
    it('isExpired and isFresh and isStale', () => { t.track('a', 'Pill', 100, Date.now() - 200); t.sweepAll(); expect(t.isExpired('a')).toBe(true); });
    it('isFresh for new', () => { t.track('a', 'Pill', 100000); expect(t.isFresh('a')).toBe(true); });
    it('isStale', () => { t.track('a', 'Pill', 100, Date.now() - 90); t.sweepAll(); expect(t.isStale('a')).toBe(true); });
    it('remainingMs', () => { t.track('a', 'Pill', 10000); expect(t.remainingMs('a')).toBeGreaterThanOrEqual(0); });
    it('remainingMs for unknown', () => { expect(t.remainingMs('ghost')).toBe(0); });
    it('freshness', () => { t.track('a', 'Pill', 10000); expect(t.freshness('a')).toBe(1); });
    it('freshness for unknown', () => { expect(t.freshness('ghost')).toBe(0); });
    it('removeExpired', () => { t.track('a', 'Pill', 100, Date.now() - 200); expect(t.removeExpired()).toBe(1); });
    it('countByStatus', () => { t.track('a', 'Pill', 1000); t.track('b', 'Pill', 100, Date.now() - 200); t.sweepAll(); expect(t.countByStatus().expired).toBe(1); });
    it('report aggregates', () => { t.track('a'); expect(t.report().total).toBe(1); });
    it('reset clears', () => { t.track('a'); t.reset(); expect(t.stats.total).toBe(0); });
    it('exposes EXPIRATION_STATUS', () => { expect(EXPIRATION_STATUS).toContain('fresh'); });
});
