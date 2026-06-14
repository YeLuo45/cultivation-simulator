import { describe, it, expect, beforeEach } from 'vitest';
import { VoteWeightingEngine, WEIGHTING_STRATEGIES } from '../../../systems/council/VoteWeightingEngine.js';

describe('VoteWeightingEngine', () => {
    let e;
    beforeEach(() => { e = new VoteWeightingEngine(); });
    it('initializes with defaults', () => { expect(e.config.strategy).toBe('flat'); });
    it('setWeight and getWeight', () => {
        e.setWeight('m1', 2.0);
        expect(e.getWeight('m1')).toBe(2.0);
    });
    it('setWeight rejects invalid', () => {
        expect(e.setWeight('', 1)).toBe(false);
        expect(e.setWeight('m1', 'x')).toBe(false);
    });
    it('weightFor flat', () => { expect(e.weightFor('m1', 'master')).toBe(1.0); });
    it('weightFor role', () => {
        e.changeStrategy('role');
        expect(e.weightFor('m1', 'master')).toBe(5.0);
    });
    it('weightFor reputation', () => {
        e.changeStrategy('reputation');
        expect(e.weightFor('m1', 'master', 100)).toBe(2.0);
    });
    it('weightFor hybrid', () => {
        e.changeStrategy('hybrid');
        expect(e.weightFor('m1', 'master', 50)).toBeGreaterThan(5.0);
    });
    it('applyTo', () => {
        e.setWeight('m1', 2.0);
        const r = e.applyTo([{ memberId: 'm1', option: 'yes' }]);
        expect(r[0].weight).toBe(2.0);
    });
    it('aggregate', () => {
        e.setWeight('m1', 2.0);
        e.setWeight('m2', 1.0);
        const sums = e.aggregate([{ memberId: 'm1', option: 'yes' }, { memberId: 'm2', option: 'no' }]);
        expect(sums.yes).toBe(2.0);
    });
    it('changeStrategy rejects invalid', () => { expect(e.changeStrategy('invalid')).toBe(false); });
    it('getStrategy returns current', () => { expect(e.getStrategy()).toBe('flat'); });
    it('count returns 0 initially', () => { expect(e.count()).toBe(0); });
    it('report aggregates', () => { expect(e.report().strategy).toBe('flat'); });
    it('reset clears', () => {
        e.setWeight('m1', 2.0);
        e.reset();
        expect(e.count()).toBe(0);
    });
    it('exposes WEIGHTING_STRATEGIES', () => { expect(WEIGHTING_STRATEGIES).toContain('flat'); });
});
