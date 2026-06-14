import { describe, it, expect, beforeEach } from 'vitest';
import { TitleAwarder, TITLE_TIERS } from '../../../systems/arena/TitleAwarder.js';

describe('TitleAwarder', () => {
    let a;
    beforeEach(() => { a = new TitleAwarder(); });
    it('initializes with defaults', () => { expect(a.stats.total).toBe(0); });
    it('create', () => { expect(a.create('Champion', 'gold', 'tournament', 'Win 10')).not.toBeNull(); });
    it('create rejects missing', () => { expect(a.create('', 'gold')).toBeNull(); });
    it('create normalizes invalid tier', () => { const x = a.create('A', 'invalid'); expect(x.tier).toBe('bronze'); });
    it('create normalizes invalid category', () => { const x = a.create('A', 'gold', 'invalid'); expect(x.category).toBe('achievement'); });
    it('get returns null for unknown', () => { expect(a.get('ghost')).toBeNull(); });
    it('listAll and listByTier and listByCategory', () => { a.create('A', 'gold', 'combat'); expect(a.listAll().length).toBe(1); expect(a.listByTier('gold').length).toBe(1); expect(a.listByCategory('combat').length).toBe(1); });
    it('listForPlayer', () => { const x = a.create('A', 'gold'); a.award(x.id, 'p1'); expect(a.listForPlayer('p1').length).toBe(1); });
    it('award and revoke', () => { const x = a.create('A', 'gold'); a.award(x.id, 'p1'); expect(a.revoke(x.id, 'p1')).toBe(true); });
    it('award returns false for unknown', () => { expect(a.award('ghost', 'p1')).toBe(false); });
    it('revoke returns false for unknown', () => { expect(a.revoke('ghost', 'p1')).toBe(false); });
    it('hasTitle', () => { const x = a.create('A', 'gold'); a.award(x.id, 'p1'); expect(a.hasTitle('p1', x.id)).toBe(true); });
    it('count', () => { const x = a.create('A', 'gold'); a.award(x.id, 'p1'); expect(a.count('p1')).toBe(1); });
    it('countByTitle and holdersOf', () => { const x = a.create('A', 'gold'); a.award(x.id, 'p1'); expect(a.countByTitle(x.id)).toBe(1); expect(a.holdersOf(x.id)).toContain('p1'); });
    it('bestTierFor', () => { const x = a.create('A', 'gold'); a.award(x.id, 'p1'); expect(a.bestTierFor('p1').tier).toBe('gold'); });
    it('bestTierFor for none', () => { expect(a.bestTierFor('ghost')).toBeNull(); });
    it('topHolders', () => { const x = a.create('A', 'gold'); a.award(x.id, 'p1'); a.award(x.id, 'p2'); expect(a.topHolders().length).toBeGreaterThan(0); });
    it('report aggregates', () => { a.create('A', 'gold'); expect(a.report().total).toBe(1); });
    it('reset clears', () => { a.create('A', 'gold'); a.reset(); expect(a.stats.total).toBe(0); });
    it('exposes TITLE_TIERS', () => { expect(TITLE_TIERS).toContain('gold'); });
});
