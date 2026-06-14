import { describe, it, expect, beforeEach } from 'vitest';
import { FieldCommander, COMMAND_RANKS } from '../../../systems/intel/FieldCommander.js';

describe('FieldCommander', () => {
    let c;
    beforeEach(() => { c = new FieldCommander(); });
    it('initializes with defaults', () => { expect(c.stats.total).toBe(0); });
    it('commission', () => { expect(c.commission('Cmdr1')).not.toBeNull(); });
    it('commission rejects missing', () => { expect(c.commission('')).toBeNull(); });
    it('commission normalizes invalid rank', () => { const x = c.commission('C', 'invalid'); expect(x.rank).toBe('captain'); });
    it('get returns null for unknown', () => { expect(c.get('ghost')).toBeNull(); });
    it('listAll and listByRank and listByStatus and listActive', () => {
        c.commission('A', 'colonel');
        c.commission('B', 'general');
        expect(c.listAll().length).toBe(2);
        expect(c.listByRank('general').length).toBe(1);
        expect(c.listByStatus('assigned').length).toBe(2);
    });
    it('setStatus', () => { const x = c.commission('C'); expect(c.setStatus(x.id, 'active')).toBe(true); });
    it('setStatus rejects invalid', () => { const x = c.commission('C'); expect(c.setStatus(x.id, 'invalid')).toBe(false); });
    it('setStatus returns false for unknown', () => { expect(c.setStatus('ghost', 'active')).toBe(false); });
    it('promote', () => { const x = c.commission('C'); expect(c.promote(x.id, 'general')).toBe(true); });
    it('promote rejects invalid', () => { const x = c.commission('C'); expect(c.promote(x.id, 'invalid')).toBe(false); });
    it('promote returns false for unknown', () => { expect(c.promote('ghost', 'general')).toBe(false); });
    it('recordOperation', () => { const x = c.commission('C'); expect(c.recordOperation(x.id)).toBe(true); expect(c.stats.totalOps).toBe(1); });
    it('recordOperation returns false for unknown', () => { expect(c.recordOperation('ghost')).toBe(false); });
    it('isActive and isKia and isRetired', () => { const x = c.commission('C'); c.setStatus(x.id, 'active'); expect(c.isActive(x.id)).toBe(true); c.setStatus(x.id, 'kia'); expect(c.isKia(x.id)).toBe(true); const y = c.commission('D'); c.setStatus(y.id, 'retired'); expect(c.isRetired(y.id)).toBe(true); });
    it('isActive for unknown', () => { expect(c.isActive('ghost')).toBe(false); });
    it('rankOf and opsCount', () => { const x = c.commission('C', 'colonel'); expect(c.rankOf(x.id)).toBe('colonel'); expect(c.opsCount(x.id)).toBe(0); });
    it('rankOf for unknown', () => { expect(c.rankOf('ghost')).toBeNull(); });
    it('opsCount for unknown', () => { expect(c.opsCount('ghost')).toBe(0); });
    it('highestRank and mostExperienced', () => { c.commission('A', 'colonel'); c.commission('B', 'general'); expect(c.highestRank().rank).toBe('general'); c.recordOperation(c.listAll()[0].id); c.recordOperation(c.listAll()[0].id); expect(c.mostExperienced().rank).toBe('colonel'); });
    it('highestRank for empty', () => { expect(c.highestRank()).toBeNull(); });
    it('averageOps and rankByExperience', () => { c.commission('A'); c.recordOperation(c.listAll()[0].id); expect(c.averageOps()).toBe(1); expect(c.rankByExperience().length).toBe(1); });
    it('report aggregates', () => { c.commission('A'); expect(c.report().total).toBe(1); });
    it('reset clears', () => { c.commission('A'); c.reset(); expect(c.stats.total).toBe(0); });
    it('exposes COMMAND_RANKS', () => { expect(COMMAND_RANKS).toContain('general'); });
});
