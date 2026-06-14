import { describe, it, expect, beforeEach } from 'vitest';
import { RootProfiler, ROOT_TYPES } from '../../../systems/shenzhu/RootProfiler.js';

describe('RootProfiler', () => {
    let p;
    beforeEach(() => { p = new RootProfiler(); });
    it('initializes with defaults', () => { expect(p.stats.total).toBe(0); });
    it('profile', () => { expect(p.profile('A', 'fire')).not.toBeNull(); });
    it('profile rejects missing', () => { expect(p.profile('', 'fire')).toBeNull(); });
    it('profile normalizes invalid primary', () => { const x = p.profile('A', 'invalid'); expect(x.primary).toBe('wood'); });
    it('profile normalizes invalid secondary', () => { const x = p.profile('A', 'fire', 'invalid'); expect(x.secondary).toBeNull(); });
    it('profile normalizes invalid grade', () => { const x = p.profile('A', 'fire', null, 'invalid'); expect(x.grade).toBe('common'); });
    it('get returns null for unknown', () => { expect(p.get('ghost')).toBeNull(); });
    it('listAll and listByOwner and listByPrimary and listByGrade', () => {
        p.profile('A', 'fire');
        p.profile('A', 'water');
        p.profile('B', 'fire');
        expect(p.listAll().length).toBe(3);
        expect(p.listByOwner('A').length).toBe(2);
        expect(p.listByPrimary('fire').length).toBe(2);
        expect(p.listByGrade('common').length).toBe(3);
    });
    it('setGrade', () => { const x = p.profile('A', 'fire'); expect(p.setGrade(x.id, 'immortal')).toBe(true); });
    it('setGrade rejects invalid', () => { const x = p.profile('A', 'fire'); expect(p.setGrade(x.id, 'invalid')).toBe(false); });
    it('setGrade returns false for unknown', () => { expect(p.setGrade('ghost', 'immortal')).toBe(false); });
    it('setPurity', () => { const x = p.profile('A', 'fire'); p.setPurity(x.id, 0.5); expect(p.purityOf(x.id)).toBe(0.5); });
    it('setPurity clamps', () => { const x = p.profile('A', 'fire'); p.setPurity(x.id, 2); expect(p.purityOf(x.id)).toBe(1); });
    it('setPurity returns false for unknown', () => { expect(p.setPurity('ghost', 0.5)).toBe(false); });
    it('isImmortal and isTwin and isPure', () => { const x = p.profile('A', 'fire', 'water', 'immortal'); p.setPurity(x.id, 0.95); expect(p.isImmortal(x.id)).toBe(true); expect(p.isTwin(x.id)).toBe(true); expect(p.isPure(x.id)).toBe(true); });
    it('isImmortal for unknown', () => { expect(p.isImmortal('ghost')).toBe(false); });
    it('purityOf and gradeOf and primaryOf and secondaryOf for unknown', () => { expect(p.purityOf('ghost')).toBe(0); expect(p.gradeOf('ghost')).toBeNull(); expect(p.primaryOf('ghost')).toBeNull(); expect(p.secondaryOf('ghost')).toBeNull(); });
    it('averagePurity', () => { p.profile('A', 'fire'); expect(p.averagePurity()).toBeGreaterThan(0); });
    it('bestPurity', () => { p.profile('A', 'fire'); expect(p.bestPurity()).not.toBeNull(); });
    it('bestPurity null for empty', () => { expect(p.bestPurity()).toBeNull(); });
    it('countByGrade', () => { p.profile('A', 'fire'); expect(p.countByGrade().common).toBe(1); });
    it('report aggregates', () => { p.profile('A', 'fire'); expect(p.report().total).toBe(1); });
    it('reset clears', () => { p.profile('A', 'fire'); p.reset(); expect(p.stats.total).toBe(0); });
    it('exposes ROOT_TYPES', () => { expect(ROOT_TYPES).toContain('fire'); });
});
