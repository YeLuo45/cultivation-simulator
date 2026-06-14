import { describe, it, expect, beforeEach } from 'vitest';
import { VotingPowerCalculator, POWER_FACTORS } from '../../../systems/council/VotingPowerCalculator.js';

describe('VotingPowerCalculator', () => {
    let c;
    beforeEach(() => { c = new VotingPowerCalculator(); });
    it('initializes with defaults', () => { expect(c.stats.totalCalcs).toBe(0); });
    it('setReputation and getReputation', () => {
        c.setReputation('m1', 50);
        expect(c.getReputation('m1')).toBe(50);
    });
    it('setReputation clamps to 0-100', () => {
        c.setReputation('m1', 200);
        expect(c.getReputation('m1')).toBe(100);
    });
    it('addContribution accumulates', () => {
        c.addContribution('m1', 100);
        c.addContribution('m1', 50);
        expect(c.getContribution('m1')).toBe(150);
    });
    it('setSeniority and getSeniority', () => {
        c.setSeniority('m1', 100);
        expect(c.getSeniority('m1')).toBe(100);
    });
    it('calculate for master role', () => {
        const p = c.calculate('m1', 'master');
        expect(p).toBe(POWER_FACTORS.master);
    });
    it('calculate for unknown role uses base', () => {
        expect(c.calculate('m1', 'invalid')).toBe(1.0);
    });
    it('calculate with reputation bonus', () => {
        c.setReputation('m1', 100);
        const p = c.calculate('m1', 'master');
        expect(p).toBeGreaterThan(POWER_FACTORS.master);
    });
    it('calculateAll', () => {
        const r = c.calculateAll({ m1: 'master', m2: 'elder' });
        expect(r.get('m1')).toBeGreaterThan(0);
    });
    it('totalPower', () => {
        const t = c.totalPower({ m1: 'master', m2: 'elder' });
        expect(t).toBe(POWER_FACTORS.master + POWER_FACTORS.elder);
    });
    it('topVoters', () => {
        const top = c.topVoters({ m1: 'master', m2: 'outer_disciple' });
        expect(top[0][0]).toBe('m1');
    });
    it('report aggregates', () => { expect(c.report().totalCalcs).toBe(0); });
    it('reset clears', () => {
        c.setReputation('m1', 50);
        c.reset();
        expect(c.reputation.size).toBe(0);
    });
    it('exposes POWER_FACTORS', () => { expect(POWER_FACTORS.master).toBe(5.0); });
});
