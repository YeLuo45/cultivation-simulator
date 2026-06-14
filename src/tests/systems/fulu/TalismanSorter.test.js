import { describe, it, expect, beforeEach } from 'vitest';
import { TalismanSorter, SORT_KEYS } from '../../../systems/fulu/TalismanSorter.js';

describe('TalismanSorter', () => {
    let s;
    beforeEach(() => { s = new TalismanSorter(); });
    it('initializes with defaults', () => { expect(s.stats.total).toBe(0); });
    it('sort', () => { expect(s.sort([{ id: 'a', rarity: 'common' }])).not.toBeNull(); });
    it('sort rejects non-array', () => { expect(s.sort('not array')).toBeNull(); });
    it('sort normalizes invalid key', () => { const x = s.sort([{ id: 'a' }], 'invalid'); expect(x.key).toBe('rarity'); });
    it('sort normalizes invalid direction', () => { const x = s.sort([{ id: 'a' }], 'rarity', 'invalid'); expect(x.direction).toBe('desc'); });
    it('get returns null for unknown', () => { expect(s.get('ghost')).toBeNull(); });
    it('listAll and listByKey and listByDirection', () => {
        s.sort([{ id: 'a', rarity: 'common' }], 'rarity');
        s.sort([{ id: 'b', power: 5 }], 'power', 'asc');
        expect(s.listAll().length).toBe(2);
        expect(s.listByKey('power').length).toBe(1);
        expect(s.listByDirection('asc').length).toBe(1);
    });
    it('setKey', () => { const x = s.sort([{ id: 'a', power: 5, rarity: 'a' }]); expect(s.setKey(x.id, 'power')).toBe(true); });
    it('setKey rejects invalid', () => { const x = s.sort([{ id: 'a' }]); expect(s.setKey(x.id, 'invalid')).toBe(false); });
    it('setKey returns false for unknown', () => { expect(s.setKey('ghost', 'power')).toBe(false); });
    it('setDirection', () => { const x = s.sort([{ id: 'a' }]); expect(s.setDirection(x.id, 'asc')).toBe(true); });
    it('setDirection rejects invalid', () => { const x = s.sort([{ id: 'a' }]); expect(s.setDirection(x.id, 'invalid')).toBe(false); });
    it('setDirection returns false for unknown', () => { expect(s.setDirection('ghost', 'asc')).toBe(false); });
    it('addItem and removeItem', () => { const x = s.sort([{ id: 'a' }]); s.addItem(x.id, { id: 'b' }); s.removeItem(x.id, 'b'); expect(s.countOf(x.id)).toBe(1); });
    it('addItem returns false for unknown', () => { expect(s.addItem('ghost', { id: 'a' })).toBe(false); });
    it('removeItem returns false for unknown', () => { expect(s.removeItem('ghost', 'a')).toBe(false); });
    it('talismansOf and keyOf and directionOf and countOf for unknown', () => { expect(s.talismansOf('ghost')).toEqual([]); expect(s.keyOf('ghost')).toBeNull(); expect(s.directionOf('ghost')).toBeNull(); expect(s.countOf('ghost')).toBe(0); });
    it('topN and bottomN', () => { const x = s.sort([{ id: 'a' }, { id: 'b' }, { id: 'c' }]); expect(s.topN(x.id, 2).length).toBe(2); expect(s.bottomN(x.id, 1).length).toBe(1); });
    it('countByKey', () => { s.sort([{ id: 'a' }], 'power'); expect(s.countByKey().power).toBe(1); });
    it('report aggregates', () => { s.sort([{ id: 'a' }]); expect(s.report().total).toBe(1); });
    it('reset clears', () => { s.sort([{ id: 'a' }]); s.reset(); expect(s.stats.total).toBe(0); });
    it('exposes SORT_KEYS', () => { expect(SORT_KEYS).toContain('rarity'); });
});
