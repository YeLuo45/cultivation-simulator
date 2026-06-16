import { describe, it, expect, beforeEach } from 'vitest';
import { PaperMill, PAPER_TYPES } from '../../../systems/fulu/PaperMill.js';

describe('PaperMill', () => {
    let p;
    beforeEach(() => { p = new PaperMill(); });
    it('initializes with defaults', () => { expect(p.stats.total).toBe(0); });
    it('produce', () => { expect(p.produce('yellow', 30, 30)).not.toBeNull(); });
    it('produce normalizes invalid type', () => { const x = p.produce('invalid', 30, 30); expect(x.type).toBe('yellow'); });
    it('produce normalizes invalid quality', () => { const x = p.produce('yellow', 30, 30, 'invalid'); expect(x.quality).toBe('normal'); });
    it('get returns null for unknown', () => { expect(p.get('ghost')).toBeNull(); });
    it('listAll and listByOwner and listByType and listByQuality and listPerfect', () => {
        p.produce('yellow', 30, 30, 'normal', 'p1');
        p.produce('jade', 30, 30, 'perfect', 'p1');
        p.produce('golden', 30, 30, 'perfect');
        expect(p.listAll().length).toBe(3);
        expect(p.listByOwner('p1').length).toBe(2);
        expect(p.listByType('yellow').length).toBe(1);
        expect(p.listByQuality('perfect').length).toBe(2);
        expect(p.listPerfect().length).toBe(2);
    });
    it('setQuality', () => { const x = p.produce('yellow'); expect(p.setQuality(x.id, 'perfect')).toBe(true); });
    it('setQuality rejects invalid', () => { const x = p.produce('yellow'); expect(p.setQuality(x.id, 'invalid')).toBe(false); });
    it('setQuality returns false for unknown', () => { expect(p.setQuality('ghost', 'perfect')).toBe(false); });
    it('setOwner and setSize', () => { const x = p.produce('yellow'); p.setOwner(x.id, 'p2'); p.setSize(x.id, 50, 50); expect(x.owner).toBe('p2'); expect(x.width).toBe(50); });
    it('setSize clamps', () => { const x = p.produce('yellow'); p.setSize(x.id, -10, 30); expect(x.width).toBe(0); });
    it('setSize and setOwner return false for unknown', () => { expect(p.setSize('ghost', 50, 50)).toBe(false); expect(p.setOwner('ghost', 'p2')).toBe(false); });
    it('isPerfect and isSpirit', () => { const x = p.produce('spirit', 30, 30, 'perfect'); expect(p.isPerfect(x.id)).toBe(true); expect(p.isSpirit(x.id)).toBe(true); });
    it('isPerfect for unknown', () => { expect(p.isPerfect('ghost')).toBe(false); });
    it('areaOf and qualityOf and typeOf and ownerOf for unknown', () => { expect(p.areaOf('ghost')).toBe(0); expect(p.qualityOf('ghost')).toBeNull(); expect(p.typeOf('ghost')).toBeNull(); expect(p.ownerOf('ghost')).toBeNull(); });
    it('totalArea and averageArea', () => { p.produce('yellow', 30, 30); expect(p.totalArea()).toBe(900); expect(p.averageArea()).toBe(900); });
    it('bestQuality', () => { p.produce('yellow', 30, 30, 'flawed'); p.produce('jade', 30, 30, 'perfect'); expect(p.bestQuality().quality).toBe('perfect'); });
    it('bestQuality null for empty', () => { expect(p.bestQuality()).toBeNull(); });
    it('countByType', () => { p.produce('yellow'); expect(p.countByType().yellow).toBe(1); });
    it('report aggregates', () => { p.produce('yellow'); expect(p.report().total).toBe(1); });
    it('reset clears', () => { p.produce('yellow'); p.reset(); expect(p.stats.total).toBe(0); });
    it('exposes PAPER_TYPES', () => { expect(PAPER_TYPES).toContain('yellow'); });
});
