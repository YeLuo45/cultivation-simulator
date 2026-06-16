import { describe, it, expect, beforeEach } from 'vitest';
import { QuorumCalculator, QUORUM_TYPES } from '../../../systems/council/QuorumCalculator.js';

describe('QuorumCalculator', () => {
    let q;
    beforeEach(() => { q = new QuorumCalculator(); });
    it('initializes with defaults', () => { expect(q.stats.totalChecks).toBe(0); });
    it('setRequirement', () => { expect(q.setRequirement('p1', 'simple_majority')).toBe(true); });
    it('setRequirement normalizes invalid', () => { expect(q.setRequirement('p1', 'invalid')).toBe(true); });
    it('getRequirement returns default for unset', () => {
        const r = q.getRequirement('p1');
        expect(r.type).toBe('simple_majority');
    });
    it('getRequirement returns set value', () => {
        q.setRequirement('p1', 'unanimous');
        expect(q.getRequirement('p1').type).toBe('unanimous');
    });
    it('removeRequirement', () => {
        q.setRequirement('p1', 'simple_majority');
        expect(q.removeRequirement('p1')).toBe(true);
    });
    it('requiredVotes', () => {
        q.setRequirement('p1', 'simple_majority');
        expect(q.requiredVotes('p1', 10)).toBe(5);
    });
    it('isMet true when met', () => {
        q.setRequirement('p1', 'simple_majority');
        expect(q.isMet('p1', 5, 10)).toBe(true);
    });
    it('isMet false when not met', () => {
        q.setRequirement('p1', 'simple_majority');
        expect(q.isMet('p1', 2, 10)).toBe(false);
    });
    it('isQuorumType', () => {
        expect(q.isQuorumType('unanimous')).toBe(true);
        expect(q.isQuorumType('invalid')).toBe(false);
    });
    it('ratioFor maps types', () => {
        expect(q.ratioFor('unanimous')).toBe(1.0);
        expect(q.ratioFor('simple_majority')).toBe(0.5);
    });
    it('report aggregates', () => { q.setRequirement('p1', 'simple_majority'); expect(q.report().tracked).toBe(1); });
    it('reset clears', () => { q.setRequirement('p1', 'simple_majority'); q.reset(); expect(q.requirements.size).toBe(0); });
    it('exposes QUORUM_TYPES', () => { expect(QUORUM_TYPES).toContain('unanimous'); });
});
