import { describe, it, expect, beforeEach } from 'vitest';
import { ArtifactSorter, SORT_CRITERIA } from '../../../systems/shenzhu/ArtifactSorter.js';

describe('ArtifactSorter', () => {
    let s;
    beforeEach(() => { s = new ArtifactSorter(); });
    it('initializes with defaults', () => { expect(s.stats.total).toBe(0); });
    it('sort', () => { expect(s.sort([{ id: 'a', power: 5 }])).not.toBeNull(); });
    it('sort rejects non-array', () => { expect(s.sort('not array')).toBeNull(); });
    it('sort normalizes invalid criteria', () => { const x = s.sort([{ rarity: 'a' }], 'invalid'); expect(x.criteria).toBe('rarity'); });
    it('sort normalizes invalid order', () => { const x = s.sort([{ rarity: 'a' }], 'rarity', 'invalid'); expect(x.order).toBe('desc'); });
    it('get returns null for unknown', () => { expect(s.get('ghost')).toBeNull(); });
    it('listAll and listByCriteria and listByOrder', () => {
        s.sort([{ id: 'a' }], 'rarity');
        s.sort([{ id: 'b' }], 'power', 'asc');
        expect(s.listAll().length).toBe(2);
        expect(s.listByCriteria('power').length).toBe(1);
        expect(s.listByOrder('asc').length).toBe(1);
    });
    it('setCriteria', () => { const x = s.sort([{ id: 'a', rarity: 'a' }]); expect(s.setCriteria(x.id, 'power')).toBe(true); });
    it('setCriteria rejects invalid', () => { const x = s.sort([{ id: 'a' }]); expect(s.setCriteria(x.id, 'invalid')).toBe(false); });
    it('setCriteria returns false for unknown', () => { expect(s.setCriteria('ghost', 'power')).toBe(false); });
    it('setOrder', () => { const x = s.sort([{ id: 'a' }]); expect(s.setOrder(x.id, 'asc')).toBe(true); });
    it('setOrder rejects invalid', () => { const x = s.sort([{ id: 'a' }]); expect(s.setOrder(x.id, 'invalid')).toBe(false); });
    it('setOrder returns false for unknown', () => { expect(s.setOrder('ghost', 'asc')).toBe(false); });
    it('addArtifact and removeArtifact', () => { const x = s.sort([{ id: 'a' }]); s.addArtifact(x.id, { id: 'b' }); s.removeArtifact(x.id, 'b'); expect(s.count(x.id)).toBe(1); });
    it('addArtifact returns false for unknown', () => { expect(s.addArtifact('ghost', { id: 'a' })).toBe(false); });
    it('removeArtifact returns false for unknown', () => { expect(s.removeArtifact('ghost', 'a')).toBe(false); });
    it('artifactsOf and criteriaOf and orderOf and count for unknown', () => { expect(s.artifactsOf('ghost')).toEqual([]); expect(s.criteriaOf('ghost')).toBeNull(); expect(s.orderOf('ghost')).toBeNull(); expect(s.count('ghost')).toBe(0); });
    it('topN and bottomN', () => { const x = s.sort([{ id: 'a' }, { id: 'b' }, { id: 'c' }]); expect(s.topN(x.id, 2).length).toBe(2); expect(s.bottomN(x.id, 1).length).toBe(1); });
    it('countByCriteria', () => { s.sort([{ id: 'a' }], 'power'); expect(s.countByCriteria().power).toBe(1); });
    it('report aggregates', () => { s.sort([{ id: 'a' }]); expect(s.report().total).toBe(1); });
    it('reset clears', () => { s.sort([{ id: 'a' }]); s.reset(); expect(s.stats.total).toBe(0); });
    it('exposes SORT_CRITERIA', () => { expect(SORT_CRITERIA).toContain('rarity'); });
});
