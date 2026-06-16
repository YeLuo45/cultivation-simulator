import { describe, it, expect, beforeEach } from 'vitest';
import { MoleHunter, EVIDENCE_TYPES } from '../../../systems/intel/MoleHunter.js';

describe('MoleHunter', () => {
    let h;
    beforeEach(() => { h = new MoleHunter(); });
    it('initializes with defaults', () => { expect(h.stats.total).toBe(0); });
    it('suspect', () => { expect(h.suspect('A')).not.toBeNull(); });
    it('suspect rejects missing', () => { expect(h.suspect('')).toBeNull(); });
    it('get returns null for unknown', () => { expect(h.get('ghost')).toBeNull(); });
    it('listAll and listBySuspicion and listConfirmed', () => {
        h.suspect('A');
        h.suspect('B');
        expect(h.listAll().length).toBe(2);
        expect(h.listBySuspicion('none').length).toBe(2);
    });
    it('addEvidence and updateSuspicion', () => { const x = h.suspect('A'); h.addEvidence(x.id, 'testimony'); expect(h.suspicionOf(x.id)).toBe('mild'); });
    it('addEvidence rejects invalid type', () => { const x = h.suspect('A'); expect(h.addEvidence(x.id, 'invalid')).toBe(false); });
    it('addEvidence returns false for unknown', () => { expect(h.addEvidence('ghost', 'testimony')).toBe(false); });
    it('addEvidence escalates to confirmed', () => { const x = h.suspect('A'); for (const t of EVIDENCE_TYPES) h.addEvidence(x.id, t); expect(h.suspicionOf(x.id)).toBe('confirmed'); });
    it('clear', () => { const x = h.suspect('A'); h.addEvidence(x.id, 'testimony'); h.clear(x.id); expect(h.suspicionOf(x.id)).toBe('none'); });
    it('clear returns false for unknown', () => { expect(h.clear('ghost')).toBe(false); });
    it('confirm', () => { const x = h.suspect('A'); expect(h.confirm(x.id)).toBe(true); });
    it('confirm returns false for unknown', () => { expect(h.confirm('ghost')).toBe(false); });
    it('evidenceCount and hasEvidence', () => { const x = h.suspect('A'); h.addEvidence(x.id, 'testimony'); h.addEvidence(x.id, 'document'); expect(h.evidenceCount(x.id)).toBe(2); expect(h.hasEvidence(x.id, 'testimony')).toBe(true); });
    it('evidenceCount for unknown', () => { expect(h.evidenceCount('ghost')).toBe(0); });
    it('hasEvidence for unknown', () => { expect(h.hasEvidence('ghost', 'x')).toBe(false); });
    it('suspicionOf for unknown', () => { expect(h.suspicionOf('ghost')).toBeNull(); });
    it('isConfirmed and isHighRisk', () => { const x = h.suspect('A'); h.confirm(x.id); expect(h.isConfirmed(x.id)).toBe(true); expect(h.isHighRisk(x.id)).toBe(true); });
    it('isConfirmed for unknown', () => { expect(h.isConfirmed('ghost')).toBe(false); });
    it('topSuspects', () => { const x = h.suspect('A'); h.confirm(x.id); expect(h.topSuspects(1).length).toBe(1); });
    it('averageEvidence', () => { h.suspect('A'); h.addEvidence(h.listAll()[0].id, 'testimony'); expect(h.averageEvidence()).toBe(1); });
    it('listConfirmed', () => { const x = h.suspect('A'); h.confirm(x.id); expect(h.listConfirmed().length).toBe(1); });
    it('report aggregates', () => { h.suspect('A'); h.confirm(h.listAll()[0].id); expect(h.report().confirmed).toBe(1); });
    it('reset clears', () => { h.suspect('A'); h.reset(); expect(h.stats.total).toBe(0); });
    it('exposes EVIDENCE_TYPES', () => { expect(EVIDENCE_TYPES).toContain('testimony'); });
});
