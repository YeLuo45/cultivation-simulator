import { describe, it, expect, beforeEach } from 'vitest';
import { TreatyEngine, TREATY_TYPES } from '../../../systems/council/TreatyEngine.js';

describe('TreatyEngine', () => {
    let e;
    beforeEach(() => { e = new TreatyEngine(); });
    it('initializes with defaults', () => { expect(e.stats.total).toBe(0); });
    it('draft creates treaty', () => { expect(e.draft('peace', ['s1', 's2'], {})).not.toBeNull(); });
    it('draft rejects invalid type', () => { expect(e.draft('invalid', ['s1', 's2'], {})).toBeNull(); });
    it('draft rejects single party', () => { expect(e.draft('peace', ['s1'], {})).toBeNull(); });
    it('sign', () => {
        const t = e.draft('peace', ['s1', 's2'], {});
        expect(e.sign(t.id)).toBe(true);
    });
    it('sign fails for non-draft', () => {
        const t = e.draft('peace', ['s1', 's2'], {});
        e.sign(t.id);
        expect(e.sign(t.id)).toBe(false);
    });
    it('breakTreaty', () => {
        const t = e.draft('peace', ['s1', 's2'], {});
        e.sign(t.id);
        expect(e.breakTreaty(t.id, 'test')).toBe(true);
    });
    it('breakTreaty fails for non-active', () => { const t = e.draft('peace', ['s1', 's2'], {}); expect(e.breakTreaty(t.id)).toBe(false); });
    it('renegotiate', () => {
        const t = e.draft('peace', ['s1', 's2'], {});
        expect(e.renegotiate(t.id, { new: 'terms' })).toBe(true);
    });
    it('renegotiate active', () => {
        const t = e.draft('peace', ['s1', 's2'], {});
        e.sign(t.id);
        e.renegotiate(t.id, { new: 'terms' });
        expect(t.status).toBe('draft');
    });
    it('expireOverdue', () => {
        const t = e.draft('peace', ['s1', 's2'], {}, 0);
        e.sign(t.id);
        e.expireOverdue();
        expect(t.status).toBe('expired');
    });
    it('get returns null for unknown', () => { expect(e.get('ghost')).toBeNull(); });
    it('listAll', () => { e.draft('peace', ['s1', 's2'], {}); expect(e.listAll().length).toBe(1); });
    it('listByStatus and listByParty and listByType', () => {
        e.draft('peace', ['s1', 's2'], {});
        e.draft('trade', ['s1', 's3'], {});
        expect(e.listByStatus('draft').length).toBe(2);
        expect(e.listByParty('s1').length).toBe(2);
        expect(e.listByType('peace').length).toBe(1);
    });
    it('isActive/isBroken', () => {
        const t = e.draft('peace', ['s1', 's2'], {});
        e.sign(t.id);
        expect(e.isActive(t.id)).toBe(true);
    });
    it('hasActiveTreaty', () => {
        const t = e.draft('peace', ['s1', 's2'], {});
        e.sign(t.id);
        expect(e.hasActiveTreaty('s1', 's2')).toBe(true);
    });
    it('isExpiring false for long treaty', () => {
        const t = e.draft('peace', ['s1', 's2'], {}, 365 * 24 * 60 * 60 * 1000);
        e.sign(t.id);
        expect(e.isExpiring(t.id, 7 * 24 * 60 * 60 * 1000)).toBe(false);
    });
    it('history', () => {
        const t = e.draft('peace', ['s1', 's2'], {});
        e.sign(t.id);
        expect(e.history(t.id).length).toBe(1);
    });
    it('report aggregates', () => { e.draft('peace', ['s1', 's2'], {}); expect(e.report().total).toBe(1); });
    it('reset clears', () => { e.draft('peace', ['s1', 's2'], {}); e.reset(); expect(e.stats.total).toBe(0); });
    it('exposes TREATY_TYPES', () => { expect(TREATY_TYPES).toContain('peace'); });
});
