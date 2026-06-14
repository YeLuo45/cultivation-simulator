import { describe, it, expect, beforeEach } from 'vitest';
import { OpponentScouter, SCOUTING_DEPTHS } from '../../../systems/arena/OpponentScouter.js';

describe('OpponentScouter', () => {
    let s;
    beforeEach(() => { s = new OpponentScouter(); });
    it('initializes with defaults', () => { expect(s.stats.totalReports).toBe(0); });
    it('registerOpponent', () => { expect(s.registerOpponent('o1', 'A', 100)).not.toBeNull(); });
    it('registerOpponent rejects missing', () => { expect(s.registerOpponent('', 'A')).toBeNull(); expect(s.registerOpponent('o1', '')).toBeNull(); });
    it('get returns null for unknown', () => { expect(s.get('ghost')).toBeNull(); });
    it('listAll', () => { s.registerOpponent('o1', 'A'); expect(s.listAll().length).toBe(1); });
    it('addTechnique and setPower', () => {
        s.registerOpponent('o1', 'A');
        s.addTechnique('o1', 'sword');
        s.setPower('o1', 500);
        expect(s.get('o1').power).toBe(500);
    });
    it('recordResult updates winRate', () => {
        s.registerOpponent('o1', 'A');
        s.recordResult('o1', true);
        s.recordResult('o1', true);
        s.recordResult('o1', false);
        expect(s.get('o1').winRate).toBeCloseTo(2 / 3);
    });
    it('scout returns report', () => {
        s.registerOpponent('o1', 'A');
        const r = s.scout('sc1', 'o1');
        expect(r).not.toBeNull();
    });
    it('scout returns null for unknown', () => { expect(s.scout('sc1', 'ghost')).toBeNull(); });
    it('scout basic limits data', () => {
        s.setDepth('basic');
        s.registerOpponent('o1', 'A', 100);
        s.addTechnique('o1', 't1');
        s.addTechnique('o1', 't2');
        const r = s.scout('sc1', 'o1');
        expect(r.data.techniques.length).toBe(1);
    });
    it('scout exhaustive shows all', () => {
        s.setDepth('exhaustive');
        s.registerOpponent('o1', 'A', 100);
        s.addTechnique('o1', 't1');
        s.addTechnique('o1', 't2');
        s.recordResult('o1', true);
        s.recordResult('o1', false);
        s.recordResult('o1', true);
        const r = s.scout('sc1', 'o1');
        expect(r.data.recent.length).toBe(3);
    });
    it('inferStrengths high power', () => {
        s.registerOpponent('o1', 'A', 300);
        const r = s.scout('sc1', 'o1');
        expect(r.data.strengths).toContain('high_power');
    });
    it('inferWeaknesses low power', () => {
        s.registerOpponent('o1', 'A', 50);
        const r = s.scout('sc1', 'o1');
        expect(r.data.weaknesses).toContain('low_power');
    });
    it('getReport', () => {
        s.registerOpponent('o1', 'A');
        const r = s.scout('sc1', 'o1');
        expect(s.getReport(r.id)).not.toBeNull();
    });
    it('getReport returns null for unknown', () => { expect(s.getReport('ghost')).toBeNull(); });
    it('listReportsFor and listReportsBy', () => {
        s.registerOpponent('o1', 'A');
        s.scout('sc1', 'o1');
        s.scout('sc2', 'o1');
        expect(s.listReportsFor('o1').length).toBe(2);
        expect(s.listReportsBy('sc1').length).toBe(1);
    });
    it('setDepth rejects invalid', () => { expect(s.setDepth('invalid')).toBe(false); });
    it('threat', () => {
        s.registerOpponent('o1', 'A', 100);
        expect(s.threat('o1')).toBeGreaterThan(0);
    });
    it('threat for unknown', () => { expect(s.threat('ghost')).toBe(0); });
    it('isThreat', () => {
        s.registerOpponent('o1', 'A', 500);
        expect(s.isThreat('o1', 100)).toBe(true);
    });
    it('report aggregates', () => { s.registerOpponent('o1', 'A'); expect(s.report_().opponents).toBe(1); });
    it('reset clears', () => { s.registerOpponent('o1', 'A'); s.reset(); expect(s.profiles.size).toBe(0); });
    it('exposes SCOUTING_DEPTHS', () => { expect(SCOUTING_DEPTHS).toContain('basic'); });
});
