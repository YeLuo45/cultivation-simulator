import { describe, it, expect, beforeEach } from 'vitest';
import { SeniorityRanker, SENIORITY_TIERS } from '../../../systems/council/SeniorityRanker.js';

describe('SeniorityRanker', () => {
    let r;
    beforeEach(() => { r = new SeniorityRanker(); });
    it('initializes with defaults', () => { expect(r.stats.total).toBe(0); });
    it('recordJoin adds member', () => { expect(r.recordJoin('m1')).toBe(true); });
    it('recordJoin rejects missing', () => { expect(r.recordJoin('')).toBe(false); });
    it('removeJoin', () => { r.recordJoin('m1'); expect(r.removeJoin('m1')).toBe(true); });
    it('getJoinDate for unknown returns null', () => { expect(r.getJoinDate('ghost')).toBeNull(); });
    it('daysSinceJoin for unknown returns 0', () => { expect(r.daysSinceJoin('ghost')).toBe(0); });
    it('seniorityScore equals days', () => { r.recordJoin('m1'); expect(r.seniorityScore('m1')).toBeGreaterThanOrEqual(0); });
    it('getTier novice for new', () => { r.recordJoin('m1'); expect(r.getTier('m1')).toBe('novice'); });
    it('getTier mappings', () => {
        const r2 = new SeniorityRanker();
        const now = Date.now();
        r2.recordJoin('a', now - 5 * 24 * 60 * 60 * 1000);
        r2.recordJoin('b', now - 100 * 24 * 60 * 60 * 1000);
        r2.recordJoin('c', now - 400 * 24 * 60 * 60 * 1000);
        r2.recordJoin('d', now - 1500 * 24 * 60 * 60 * 1000);
        r2.recordJoin('e', now - 4000 * 24 * 60 * 60 * 1000);
        expect(r2.getTier('a')).toBe('novice');
        expect(r2.getTier('b')).toBe('junior');
        expect(r2.getTier('c')).toBe('senior');
        expect(r2.getTier('d')).toBe('veteran');
        expect(r2.getTier('e')).toBe('elder');
    });
    it('isTier', () => { r.recordJoin('m1'); expect(r.isTier('m1', 'novice')).toBe(true); });
    it('byTier', () => { r.recordJoin('m1'); expect(r.byTier('novice')).toContain('m1'); });
    it('rankBySeniority', () => {
        r.recordJoin('m1');
        r.recordJoin('m2');
        expect(r.rankBySeniority().length).toBe(2);
    });
    it('topSenior and bottomSenior', () => {
        r.recordJoin('m1');
        r.recordJoin('m2');
        expect(r.topSenior().length).toBe(2);
    });
    it('isMoreSenior', () => {
        const now = Date.now();
        r.recordJoin('a', now - 1000);
        r.recordJoin('b', now - 2000);
        expect(r.isMoreSenior('b', 'a')).toBe(true);
    });
    it('isMoreSenior false for unknown', () => { expect(r.isMoreSenior('ghost', 'a')).toBe(false); });
    it('seniorityGap', () => { expect(r.seniorityGap('a', 'b')).toBeGreaterThanOrEqual(0); });
    it('distribution', () => { r.recordJoin('m1'); expect(r.distribution().novice).toBe(1); });
    it('report aggregates', () => { r.recordJoin('m1'); expect(r.report().total).toBe(1); });
    it('reset clears', () => { r.recordJoin('m1'); r.reset(); expect(r.stats.total).toBe(0); });
    it('exposes SENIORITY_TIERS', () => { expect(SENIORITY_TIERS).toContain('elder'); });
});
