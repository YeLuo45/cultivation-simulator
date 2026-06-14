import { describe, it, expect, beforeEach } from 'vitest';
import { RecordBook, RECORD_TYPES } from '../../../systems/arena/RecordBook.js';

describe('RecordBook', () => {
    let b;
    beforeEach(() => { b = new RecordBook(); });
    it('initializes with defaults', () => { expect(b.stats.total).toBe(0); });
    it('submit', () => { expect(b.submit('fastest_kill', 1.5, 'p1', 'first kill')).not.toBeNull(); });
    it('submit rejects invalid', () => { expect(b.submit('invalid', 1, 'p1')).toBeNull(); expect(b.submit('fastest_kill', 1, '')).toBeNull(); });
    it('get returns null for unknown', () => { expect(b.get('ghost')).toBeNull(); });
    it('listAll and listByType', () => { b.submit('fastest_kill', 1, 'p1'); b.submit('highest_damage', 100, 'p1'); expect(b.listAll().length).toBe(2); expect(b.listByType('fastest_kill').length).toBe(1); });
    it('listByPlayer', () => { b.submit('fastest_kill', 1, 'p1'); expect(b.listByPlayer('p1').length).toBe(1); });
    it('forPlayer', () => { b.submit('fastest_kill', 1, 'p1'); expect(b.forPlayer('p1').length).toBe(1); });
    it('bestFor minimum (fastest)', () => { b.submit('fastest_kill', 2, 'p1'); b.submit('fastest_kill', 1, 'p2'); expect(b.bestFor('fastest_kill').holder).toBe('p2'); });
    it('bestFor maximum (highest)', () => { b.submit('highest_damage', 100, 'p1'); b.submit('highest_damage', 200, 'p2'); expect(b.bestFor('highest_damage').holder).toBe('p2'); });
    it('bestFor null', () => { expect(b.bestFor('fastest_kill')).toBeNull(); });
    it('bestHolderFor and bestValueFor', () => { b.submit('fastest_kill', 1, 'p1'); expect(b.bestHolderFor('fastest_kill')).toBe('p1'); expect(b.bestValueFor('fastest_kill')).toBe(1); });
    it('playerHoldsRecord', () => { b.submit('fastest_kill', 1, 'p1'); expect(b.playerHoldsRecord('p1', 'fastest_kill')).toBe(true); expect(b.playerHoldsRecord('p2', 'fastest_kill')).toBe(false); });
    it('recordCount and playerRecordCount', () => { b.submit('fastest_kill', 1, 'p1'); b.submit('fastest_kill', 2, 'p1'); expect(b.recordCount('fastest_kill')).toBe(2); expect(b.playerRecordCount('p1')).toBe(2); });
    it('isMinimumRecord', () => { expect(b.isMinimumRecord('fastest_kill')).toBe(true); expect(b.isMinimumRecord('highest_damage')).toBe(false); });
    it('exceedsRecord', () => { expect(b.exceedsRecord('fastest_kill', 1)).toBe(true); b.submit('fastest_kill', 1, 'p1'); expect(b.exceedsRecord('fastest_kill', 2)).toBe(false); });
    it('topHolders', () => { b.submit('fastest_kill', 1, 'p1'); b.submit('highest_damage', 100, 'p1'); expect(b.topHolders()[0].player).toBe('p1'); });
    it('typeStats', () => { b.submit('fastest_kill', 1, 'p1'); expect(b.typeStats().fastest_kill).toBe(1); });
    it('report aggregates', () => { b.submit('fastest_kill', 1, 'p1'); expect(b.report().total).toBe(1); });
    it('reset clears', () => { b.submit('fastest_kill', 1, 'p1'); b.reset(); expect(b.stats.total).toBe(0); });
    it('exposes RECORD_TYPES', () => { expect(RECORD_TYPES).toContain('fastest_kill'); });
});
