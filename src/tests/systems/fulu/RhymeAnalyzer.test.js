import { describe, it, expect, beforeEach } from 'vitest';
import { RhymeAnalyzer, RHYME_PATTERNS } from '../../../systems/fulu/RhymeAnalyzer.js';

describe('RhymeAnalyzer', () => {
    let a;
    beforeEach(() => { a = new RhymeAnalyzer(); });
    it('initializes with defaults', () => { expect(a.stats.total).toBe(0); });
    it('analyze', () => { expect(a.analyze('C1')).not.toBeNull(); });
    it('analyze rejects missing', () => { expect(a.analyze('')).toBeNull(); });
    it('analyze normalizes invalid pattern', () => { const x = a.analyze('C1', 'invalid'); expect(x.pattern).toBe('free'); });
    it('analyze normalizes invalid type', () => { const x = a.analyze('C1', 'free', 'invalid'); expect(x.type).toBe('perfect'); });
    it('get returns null for unknown', () => { expect(a.get('ghost')).toBeNull(); });
    it('listAll and listByChant and listByPattern and listByType and listPerfect', () => {
        a.analyze('C1');
        a.analyze('C1', 'AABB');
        a.analyze('C2');
        expect(a.listAll().length).toBe(3);
        expect(a.listByChant('C1').length).toBe(2);
        expect(a.listByPattern('AABB').length).toBe(1);
        expect(a.listPerfect().length).toBeGreaterThan(0);
    });
    it('setScore', () => { const x = a.analyze('C1'); a.setScore(x.id, 0.95); expect(a.scoreOf(x.id)).toBe(0.95); });
    it('setScore clamps', () => { const x = a.analyze('C1'); a.setScore(x.id, 2); expect(a.scoreOf(x.id)).toBe(1); });
    it('setScore returns false for unknown', () => { expect(a.setScore('ghost', 0.5)).toBe(false); });
    it('setPattern and setType', () => { const x = a.analyze('C1'); a.setPattern(x.id, 'ABAB'); a.setType(x.id, 'near'); expect(x.pattern).toBe('ABAB'); expect(x.type).toBe('near'); });
    it('setPattern rejects invalid', () => { const x = a.analyze('C1'); expect(a.setPattern(x.id, 'invalid')).toBe(false); });
    it('setPattern and setType return false for unknown', () => { expect(a.setPattern('ghost', 'ABAB')).toBe(false); expect(a.setType('ghost', 'near')).toBe(false); });
    it('addSuggestion', () => { const x = a.analyze('C1'); expect(a.addSuggestion(x.id, 'fix line 2')).toBe(true); });
    it('addSuggestion returns false for unknown', () => { expect(a.addSuggestion('ghost', 's')).toBe(false); });
    it('isPerfect and scoreOf and typeOf and patternOf for unknown', () => { expect(a.isPerfect('ghost')).toBe(false); expect(a.scoreOf('ghost')).toBe(0); expect(a.typeOf('ghost')).toBeNull(); expect(a.patternOf('ghost')).toBeNull(); });
    it('chantCount and averageScore', () => { a.analyze('C1'); expect(a.chantCount('C1')).toBe(1); expect(a.averageScore()).toBeGreaterThan(0); });
    it('chantCount for unknown', () => { expect(a.chantCount('ghost')).toBe(0); });
    it('best', () => { a.analyze('C1'); a.setScore(a.listAll()[0].id, 0.95); expect(a.best().score).toBe(0.95); });
    it('best null for empty', () => { expect(a.best()).toBeNull(); });
    it('countByPattern', () => { a.analyze('C1', 'AABB'); expect(a.countByPattern().AABB).toBe(1); });
    it('report aggregates', () => { a.analyze('C1'); expect(a.report().total).toBe(1); });
    it('reset clears', () => { a.analyze('C1'); a.reset(); expect(a.stats.total).toBe(0); });
    it('exposes RHYME_PATTERNS', () => { expect(RHYME_PATTERNS).toContain('free'); });
});
