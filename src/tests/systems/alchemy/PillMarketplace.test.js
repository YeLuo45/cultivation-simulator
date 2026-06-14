import { describe, it, expect, beforeEach } from 'vitest';
import { PillMarketplace, LISTING_STATUS } from '../../../systems/alchemy/PillMarketplace.js';

describe('PillMarketplace', () => {
    let m;
    beforeEach(() => { m = new PillMarketplace(); });
    it('initializes with defaults', () => { expect(m.stats.total).toBe(0); });
    it('list', () => { expect(m.list('Heal Pill', 10, 100, 'seller1')).not.toBeNull(); });
    it('list rejects missing', () => { expect(m.list('', 10, 100, 's1')).toBeNull(); expect(m.list('A', 10, 100, '')).toBeNull(); });
    it('list rejects non-positive quantity', () => { expect(m.list('A', 0, 100, 's1')).toBeNull(); });
    it('list rejects negative price', () => { expect(m.list('A', 10, -1, 's1')).toBeNull(); });
    it('get returns null for unknown', () => { expect(m.get('ghost')).toBeNull(); });
    it('listAll and listActive and listBySeller and listByItem and listByStatus', () => {
        m.list('A', 10, 100, 's1');
        m.list('B', 5, 200, 's1');
        m.list('A', 3, 50, 's2');
        expect(m.listAll().length).toBe(3);
        expect(m.listActive().length).toBe(3);
        expect(m.listBySeller('s1').length).toBe(2);
        expect(m.listByItem('A').length).toBe(2);
        expect(m.listByStatus('active').length).toBe(3);
    });
    it('buy', () => { const x = m.list('Pill', 10, 100, 's1'); expect(m.buy('b1', x.id, 3)).not.toBeNull(); });
    it('buy rejects non-active', () => { const x = m.list('Pill', 10, 100, 's1'); m.cancel(x.id); expect(m.buy('b1', x.id)).toBeNull(); });
    it('buy rejects insufficient', () => { const x = m.list('Pill', 1, 100, 's1'); expect(m.buy('b1', x.id, 5)).toBeNull(); });
    it('buy expires and returns null', () => {
        const x = m.list('Pill', 10, 100, 's1', -1000);
        expect(m.buy('b1', x.id)).toBeNull();
    });
    it('buy returns null for unknown', () => { expect(m.buy('b1', 'ghost')).toBeNull(); });
    it('buy marks sold when out of stock', () => { const x = m.list('Pill', 1, 100, 's1'); m.buy('b1', x.id); expect(m.isSold(x.id)).toBe(true); });
    it('cancel', () => { const x = m.list('Pill', 10, 100, 's1'); expect(m.cancel(x.id)).toBe(true); });
    it('cancel rejects non-active', () => { const x = m.list('Pill', 10, 100, 's1'); m.cancel(x.id); expect(m.cancel(x.id)).toBe(false); });
    it('cancel returns false for unknown', () => { expect(m.cancel('ghost')).toBe(false); });
    it('sweepExpired', () => { m.list('Pill', 10, 100, 's1', -1000); expect(m.sweepExpired()).toBe(1); });
    it('isActive and isSold', () => { const x = m.list('Pill', 10, 100, 's1'); expect(m.isActive(x.id)).toBe(true); m.cancel(x.id); expect(m.isActive(x.id)).toBe(false); });
    it('priceOf and remaining', () => { const x = m.list('Pill', 10, 100, 's1'); expect(m.priceOf(x.id)).toBe(100); expect(m.remaining(x.id)).toBe(10); });
    it('priceOf for unknown', () => { expect(m.priceOf('ghost')).toBe(0); });
    it('remaining for unknown', () => { expect(m.remaining('ghost')).toBe(0); });
    it('cheapest', () => { m.list('Pill', 1, 100, 's1'); m.list('Pill', 1, 50, 's2'); expect(m.cheapest('Pill').price).toBe(50); });
    it('cheapest for no active', () => { m.list('Pill', 1, 100, 's1', -1000); m.sweepExpired(); expect(m.cheapest('Pill')).toBeNull(); });
    it('report aggregates', () => { m.list('Pill', 1, 100, 's1'); expect(m.report().total).toBe(1); });
    it('reset clears', () => { m.list('Pill', 1, 100, 's1'); m.reset(); expect(m.stats.total).toBe(0); });
    it('exposes LISTING_STATUS', () => { expect(LISTING_STATUS).toContain('active'); });
});
