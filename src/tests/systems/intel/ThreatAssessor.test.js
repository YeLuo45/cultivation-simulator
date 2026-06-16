import { describe, it, expect, beforeEach } from 'vitest';
import { ThreatAssessor, THREAT_LEVELS } from '../../../systems/intel/ThreatAssessor.js';

describe('ThreatAssessor', () => {
    let a;
    beforeEach(() => { a = new ThreatAssessor(); });
    it('initializes with defaults', () => { expect(a.stats.total).toBe(0); });
    it('assess', () => { expect(a.assess('military', 50)).not.toBeNull(); });
    it('assess rejects invalid type', () => { expect(a.assess('invalid', 50)).toBeNull(); });
    it('assess rejects non-number', () => { expect(a.assess('military', 'x')).toBeNull(); });
    it('assess clamps score', () => { const x = a.assess('military', 200); expect(x.score).toBe(100); });
    it('levelFor score', () => { expect(a._levelFor(2)).toBe('negligible'); expect(a._levelFor(50)).toBe('high'); expect(a._levelFor(95)).toBe('existential'); });
    it('get returns null for unknown', () => { expect(a.get('ghost')).toBeNull(); });
    it('listAll and listByType and listByLevel and listBySource', () => {
        a.assess('military', 50);
        a.assess('political', 90);
        expect(a.listAll().length).toBe(2);
        expect(a.listByType('military').length).toBe(1);
        expect(a.listByLevel('high').length).toBe(1);
    });
    it('updateLevel', () => { const x = a.assess('military', 50); expect(a.updateLevel(x.id, 90)).toBe(true); });
    it('updateLevel rejects non-number', () => { const x = a.assess('military', 50); expect(a.updateLevel(x.id, 'x')).toBe(false); });
    it('updateLevel returns false for unknown', () => { expect(a.updateLevel('ghost', 50)).toBe(false); });
    it('isCritical and isHigh', () => { const x = a.assess('military', 95); expect(a.isCritical(x.id)).toBe(true); expect(a.isHigh(x.id)).toBe(true); });
    it('isCritical for low', () => { const x = a.assess('military', 30); expect(a.isCritical(x.id)).toBe(false); });
    it('isHigh for unknown', () => { expect(a.isHigh('ghost')).toBe(false); });
    it('levelOf and scoreOf', () => { const x = a.assess('military', 50); expect(a.levelOf(x.id)).toBe('high'); expect(a.scoreOf(x.id)).toBe(50); });
    it('levelOf for unknown', () => { expect(a.levelOf('ghost')).toBeNull(); });
    it('top', () => { a.assess('military', 30); a.assess('political', 90); expect(a.top(1)[0].score).toBe(90); });
    it('averageScore', () => { a.assess('military', 30); a.assess('political', 70); expect(a.averageScore()).toBe(50); });
    it('countByLevel', () => { a.assess('military', 50); expect(a.countByLevel().high).toBe(1); });
    it('report aggregates', () => { a.assess('military', 95); expect(a.report().critical).toBe(1); });
    it('reset clears', () => { a.assess('military', 50); a.reset(); expect(a.stats.total).toBe(0); });
    it('exposes THREAT_LEVELS', () => { expect(THREAT_LEVELS).toContain('high'); });
});
