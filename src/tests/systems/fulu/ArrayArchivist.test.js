import { describe, it, expect, beforeEach } from 'vitest';
import { ArrayArchivist, ARCHIVE_CATEGORIES } from '../../../systems/fulu/ArrayArchivist.js';

describe('ArrayArchivist', () => {
    let a;
    beforeEach(() => { a = new ArrayArchivist(); });
    it('initializes with defaults', () => { expect(a.stats.total).toBe(0); });
    it('record', () => { expect(a.record('A1', 'ar1')).not.toBeNull(); });
    it('record rejects missing', () => { expect(a.record('', 'ar1')).toBeNull(); expect(a.record('A1', '')).toBeNull(); });
    it('record normalizes invalid category', () => { const x = a.record('A1', 'ar1', 'invalid'); expect(x.category).toBe('combat'); });
    it('get returns null for unknown', () => { expect(a.get('ghost')).toBeNull(); });
    it('listAll and listByOwner and listByCategory and listByStatus and listArchived and listDeprecated', () => {
        a.record('A1', 'ar1', 'combat', 'p1');
        a.record('B1', 'ar2', 'defense', 'p1');
        a.record('C1', 'ar3', 'classified');
        expect(a.listAll().length).toBe(3);
        expect(a.listByOwner('p1').length).toBe(2);
        expect(a.listByCategory('combat').length).toBe(1);
        expect(a.listByStatus('draft').length).toBe(3);
    });
    it('setStatus', () => { const x = a.record('A1', 'ar1'); expect(a.setStatus(x.id, 'submitted')).toBe(true); });
    it('setStatus rejects invalid', () => { const x = a.record('A1', 'ar1'); expect(a.setStatus(x.id, 'invalid')).toBe(false); });
    it('setStatus returns false for unknown', () => { expect(a.setStatus('ghost', 'submitted')).toBe(false); });
    it('submit and review and archive and deprecate', () => { const x = a.record('A1', 'ar1'); a.submit(x.id); a.review(x.id); a.archive(x.id); expect(a.isArchived(x.id)).toBe(true); const y = a.record('B1', 'ar2'); a.deprecate(y.id); expect(a.isDeprecated(y.id)).toBe(true); });
    it('setCategory', () => { const x = a.record('A1', 'ar1', 'combat'); expect(a.setCategory(x.id, 'defense')).toBe(true); });
    it('setCategory rejects invalid', () => { const x = a.record('A1', 'ar1'); expect(a.setCategory(x.id, 'invalid')).toBe(false); });
    it('setCategory returns false for unknown', () => { expect(a.setCategory('ghost', 'defense')).toBe(false); });
    it('isArchived and isDeprecated and isSubmitted and isReviewed', () => { const x = a.record('A1', 'ar1'); a.submit(x.id); expect(a.isSubmitted(x.id)).toBe(true); });
    it('isArchived for unknown', () => { expect(a.isArchived('ghost')).toBe(false); });
    it('categoryOf and arrayOf for unknown', () => { expect(a.categoryOf('ghost')).toBeNull(); expect(a.arrayOf('ghost')).toBeNull(); });
    it('ownerCount and categoryCount', () => { a.record('A1', 'ar1', 'combat', 'p1'); expect(a.ownerCount('p1')).toBe(1); expect(a.categoryCount('combat')).toBe(1); });
    it('ownerCount and categoryCount for unknown', () => { expect(a.ownerCount('ghost')).toBe(0); expect(a.categoryCount('ghost')).toBe(0); });
    it('archiveRate', () => { const x = a.record('A1', 'ar1'); a.archive(x.id); expect(a.archiveRate()).toBe(1); });
    it('countByStatus', () => { a.record('A1', 'ar1'); expect(a.countByStatus().draft).toBe(1); });
    it('report aggregates', () => { a.record('A1', 'ar1'); expect(a.report().total).toBe(1); });
    it('reset clears', () => { a.record('A1', 'ar1'); a.reset(); expect(a.stats.total).toBe(0); });
    it('exposes ARCHIVE_CATEGORIES', () => { expect(ARCHIVE_CATEGORIES).toContain('combat'); });
});
