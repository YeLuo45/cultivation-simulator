import { describe, it, expect, beforeEach } from 'vitest';
import { InformantNetwork, LOYALTY_LEVELS } from '../../../systems/intel/InformantNetwork.js';

describe('InformantNetwork', () => {
    let n;
    beforeEach(() => { n = new InformantNetwork(); });
    it('initializes with defaults', () => { expect(n.stats.total).toBe(0); });
    it('recruit', () => { expect(n.recruit('A', 'Beijing')).not.toBeNull(); });
    it('recruit rejects missing', () => { expect(n.recruit('', 'B')).toBeNull(); });
    it('recruit normalizes invalid loyalty', () => { const x = n.recruit('A', 'B', 'invalid'); expect(x.loyalty).toBe('loyal'); });
    it('get returns null for unknown', () => { expect(n.get('ghost')).toBeNull(); });
    it('listAll and listByStatus and listByLocation and listByLoyalty and listActive', () => {
        n.recruit('A', 'Beijing', 'loyal');
        n.recruit('B', 'Shanghai', 'devoted');
        expect(n.listAll().length).toBe(2);
        expect(n.listByStatus('active').length).toBe(2);
        expect(n.listByLocation('Beijing').length).toBe(1);
        expect(n.listByLoyalty('devoted').length).toBe(1);
    });
    it('setStatus', () => { const x = n.recruit('A'); expect(n.setStatus(x.id, 'dormant')).toBe(true); });
    it('setStatus rejects invalid', () => { const x = n.recruit('A'); expect(n.setStatus(x.id, 'invalid')).toBe(false); });
    it('setStatus returns false for unknown', () => { expect(n.setStatus('ghost', 'dormant')).toBe(false); });
    it('setLoyalty', () => { const x = n.recruit('A'); expect(n.setLoyalty(x.id, 'devoted')).toBe(true); });
    it('setLoyalty rejects invalid', () => { const x = n.recruit('A'); expect(n.setLoyalty(x.id, 'invalid')).toBe(false); });
    it('setLoyalty returns false for unknown', () => { expect(n.setLoyalty('ghost', 'loyal')).toBe(false); });
    it('setReliability', () => { const x = n.recruit('A'); n.setReliability(x.id, 0.5); expect(n.reliabilityOf(x.id)).toBe(0.5); });
    it('setReliability clamps', () => { const x = n.recruit('A'); n.setReliability(x.id, 2); expect(n.reliabilityOf(x.id)).toBe(1); });
    it('setReliability returns false for unknown', () => { expect(n.setReliability('ghost', 0.5)).toBe(false); });
    it('relocate', () => { const x = n.recruit('A', 'Beijing'); expect(n.relocate(x.id, 'Shanghai')).toBe(true); });
    it('relocate returns false for unknown', () => { expect(n.relocate('ghost', 'X')).toBe(false); });
    it('isActive and isCompromised', () => { const x = n.recruit('A'); expect(n.isActive(x.id)).toBe(true); n.setStatus(x.id, 'compromised'); expect(n.isCompromised(x.id)).toBe(true); });
    it('isActive for unknown', () => { expect(n.isActive('ghost')).toBe(false); });
    it('reliabilityOf and loyaltyOf for unknown', () => { expect(n.reliabilityOf('ghost')).toBe(0); expect(n.loyaltyOf('ghost')).toBeNull(); });
    it('averageReliability', () => { n.recruit('A'); n.setReliability(n.listAll()[0].id, 0.5); expect(n.averageReliability()).toBe(0.5); });
    it('report aggregates', () => { n.recruit('A'); expect(n.report().total).toBe(1); });
    it('reset clears', () => { n.recruit('A'); n.reset(); expect(n.stats.total).toBe(0); });
    it('exposes LOYALTY_LEVELS', () => { expect(LOYALTY_LEVELS).toContain('loyal'); });
});
