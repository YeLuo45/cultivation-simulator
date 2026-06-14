import { describe, it, expect, beforeEach } from 'vitest';
import { PillStorage, PILL_RARITY } from '../../../systems/alchemy/PillStorage.js';

describe('PillStorage', () => {
    let s;
    beforeEach(() => { s = new PillStorage(); });
    it('initializes with defaults', () => { expect(s.stats.total).toBe(0); });
    it('add pill', () => { expect(s.add('Heal Pill', 'heal', 'common', 1, 'p1')).not.toBeNull(); });
    it('add rejects missing', () => { expect(s.add('', 'heal', 'common')).toBeNull(); });
    it('add normalizes invalid rarity', () => { const x = s.add('A', 'heal', 'invalid'); expect(x.rarity).toBe('common'); });
    it('add rejects non-positive count', () => { expect(s.add('A', 'heal', 'common', 0)).toBeNull(); });
    it('get returns null for unknown', () => { expect(s.get('ghost')).toBeNull(); });
    it('listAll and listByOwner and listByType and listByRarity', () => {
        s.add('A', 'heal', 'common', 1, 'p1');
        s.add('B', 'attack', 'rare', 1, 'p2');
        expect(s.listAll().length).toBe(2);
        expect(s.listByOwner('p1').length).toBe(1);
        expect(s.listByType('heal').length).toBe(1);
        expect(s.listByRarity('rare').length).toBe(1);
    });
    it('take', () => { const x = s.add('A', 'heal', 'common', 5); expect(s.take(x.id, 2)).toBe(true); });
    it('take returns false for insufficient', () => { const x = s.add('A', 'heal', 'common', 1); expect(s.take(x.id, 5)).toBe(false); });
    it('take returns false for unknown', () => { expect(s.take('ghost', 1)).toBe(false); });
    it('consume', () => { const x = s.add('A', 'heal', 'common', 5); s.consume(x.id); expect(s.countOf(x.id)).toBe(4); });
    it('has', () => { const x = s.add('A', 'heal', 'common', 5); expect(s.has(x.id, 5)).toBe(true); expect(s.has(x.id, 10)).toBe(false); });
    it('has for unknown', () => { expect(s.has('ghost', 1)).toBe(false); });
    it('countOf', () => { const x = s.add('A', 'heal', 'common', 5); expect(s.countOf(x.id)).toBe(5); });
    it('countOf for unknown', () => { expect(s.countOf('ghost')).toBe(0); });
    it('setOwner', () => { const x = s.add('A', 'heal', 'common'); s.setOwner(x.id, 'p1'); expect(s.get(x.id).owner).toBe('p1'); });
    it('setOwner returns false for unknown', () => { expect(s.setOwner('ghost', 'p1')).toBe(false); });
    it('ownerCount and totalCount', () => { s.add('A', 'heal', 'common', 5, 'p1'); s.add('B', 'attack', 'common', 3, 'p1'); expect(s.ownerCount('p1')).toBe(8); expect(s.totalCount()).toBe(8); });
    it('ownerCount for no owner', () => { expect(s.ownerCount('ghost')).toBe(0); });
    it('report aggregates', () => { s.add('A', 'heal', 'common'); expect(s.report().total).toBe(1); });
    it('reset clears', () => { s.add('A', 'heal', 'common'); s.reset(); expect(s.stats.total).toBe(0); });
    it('exposes PILL_RARITY', () => { expect(PILL_RARITY).toContain('common'); });
});
