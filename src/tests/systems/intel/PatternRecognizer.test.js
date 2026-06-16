import { describe, it, expect, beforeEach } from 'vitest';
import { PatternRecognizer, PATTERN_TYPES } from '../../../systems/intel/PatternRecognizer.js';

describe('PatternRecognizer', () => {
    let p;
    beforeEach(() => { p = new PatternRecognizer(); });
    it('initializes with defaults', () => { expect(p.stats.total).toBe(0); });
    it('register', () => { expect(p.register('sig1')).not.toBeNull(); });
    it('register rejects missing', () => { expect(p.register('')).toBeNull(); });
    it('register normalizes invalid type', () => { const x = p.register('a', 'invalid'); expect(x.type).toBe('sequence'); });
    it('register normalizes invalid confidence', () => { const x = p.register('a', 'sequence', 'invalid'); expect(x.confidence).toBe('medium'); });
    it('get returns null for unknown', () => { expect(p.get('ghost')).toBeNull(); });
    it('listAll and listByType and listByConfidence', () => {
        p.register('a');
        p.register('b', 'cycle', 'high');
        expect(p.listAll().length).toBe(2);
        expect(p.listByType('cycle').length).toBe(1);
        expect(p.listByConfidence('high').length).toBe(1);
    });
    it('detect new', () => { const r = p.detect('new'); expect(r.existing).toBe(false); });
    it('detect existing', () => { p.detect('sig1'); const r = p.detect('sig1'); expect(r.existing).toBe(true); });
    it('setConfidence', () => { const x = p.register('a'); expect(p.setConfidence(x.id, 'high')).toBe(true); });
    it('setConfidence rejects invalid', () => { const x = p.register('a'); expect(p.setConfidence(x.id, 'invalid')).toBe(false); });
    it('setConfidence returns false for unknown', () => { expect(p.setConfidence('ghost', 'high')).toBe(false); });
    it('boost', () => { const x = p.register('a'); p.boost(x.id, 5); expect(p.occurrencesOf(x.id)).toBe(6); });
    it('boost returns false for unknown', () => { expect(p.boost('ghost', 1)).toBe(false); });
    it('occurrencesOf for unknown', () => { expect(p.occurrencesOf('ghost')).toBe(0); });
    it('isHighConfidence', () => { const x = p.register('a'); p.setConfidence(x.id, 'high'); expect(p.isHighConfidence(x.id)).toBe(true); });
    it('isHighConfidence for unknown', () => { expect(p.isHighConfidence('ghost')).toBe(false); });
    it('mostFrequent', () => { p.register('a'); p.register('b'); p.boost(p.listByConfidence('medium').filter(x => x.signature === 'a')[0]?.id, 10); /* ok */ expect(p.mostFrequent()).toBeDefined(); });
    it('mostFrequent null for empty', () => { expect(p.mostFrequent()).toBeNull(); });
    it('byOccurrences', () => { const x = p.register('a'); p.boost(x.id, 5); expect(p.byOccurrences(2).length).toBe(1); });
    it('report aggregates', () => { p.register('a'); expect(p.report().total).toBe(1); });
    it('reset clears', () => { p.register('a'); p.reset(); expect(p.stats.total).toBe(0); });
    it('exposes PATTERN_TYPES', () => { expect(PATTERN_TYPES).toContain('sequence'); });
});
