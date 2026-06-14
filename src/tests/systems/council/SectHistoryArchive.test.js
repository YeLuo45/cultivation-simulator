import { describe, it, expect, beforeEach } from 'vitest';
import { SectHistoryArchive, EVENT_CATEGORIES } from '../../../systems/council/SectHistoryArchive.js';

describe('SectHistoryArchive', () => {
    let a;
    beforeEach(() => { a = new SectHistoryArchive(); });
    it('initializes with defaults', () => { expect(a.stats.total).toBe(0); });
    it('record creates event', () => { expect(a.record(1000, 'ancient', 'founding', 'Sect founded')).not.toBeNull(); });
    it('record rejects invalid category', () => { expect(a.record(1000, 'ancient', 'invalid', 't')).toBeNull(); });
    it('record rejects invalid era', () => { expect(a.record(1000, 'invalid', 'founding', 't')).toBeNull(); });
    it('get returns null for unknown', () => { expect(a.get('ghost')).toBeNull(); });
    it('listAll', () => { a.record(1000, 'ancient', 'founding', 't'); expect(a.listAll().length).toBe(1); });
    it('listByYear', () => { a.record(1000, 'ancient', 'founding', 't'); expect(a.listByYear(1000).length).toBe(1); });
    it('listByEra', () => { a.record(1000, 'ancient', 'founding', 't'); expect(a.listByEra('ancient').length).toBe(1); });
    it('listByCategory', () => { a.record(1000, 'ancient', 'founding', 't'); expect(a.listByCategory('founding').length).toBe(1); });
    it('listForParticipant', () => { a.record(1000, 'ancient', 'founding', 't', '', ['m1', 'm2']); expect(a.listForParticipant('m1').length).toBe(1); });
    it('years sorted', () => {
        a.record(2000, 'modern', 'founding', 't');
        a.record(1000, 'ancient', 'founding', 't');
        expect(a.years()[0]).toBe(1000);
    });
    it('eras and eraStats', () => {
        a.record(1000, 'ancient', 'founding', 't');
        const s = a.eraStats();
        expect(s.ancient).toBe(1);
    });
    it('mostSignificant', () => {
        a.record(1000, 'ancient', 'founding', 't', '', ['m1', 'm2', 'm3', 'm4', 'm5', 'm6']);
        expect(a.mostSignificant().length).toBe(1);
    });
    it('searchByTitle', () => {
        a.record(1000, 'ancient', 'founding', 'Founding War');
        expect(a.searchByTitle('Founding').length).toBe(1);
    });
    it('byYearRange', () => {
        a.record(1000, 'ancient', 'founding', 't');
        a.record(2000, 'modern', 'founding', 't');
        expect(a.byYearRange(900, 1500).length).toBe(1);
    });
    it('eraOf', () => {
        expect(a.eraOf(500, 2026)).toBe('ancient');
        expect(a.eraOf(2000, 2026)).toBe('contemporary');
    });
    it('report aggregates', () => { a.record(1000, 'ancient', 'founding', 't'); expect(a.report().total).toBe(1); });
    it('reset clears', () => { a.record(1000, 'ancient', 'founding', 't'); a.reset(); expect(a.stats.total).toBe(0); });
    it('exposes EVENT_CATEGORIES', () => { expect(EVENT_CATEGORIES).toContain('founding'); });
});
