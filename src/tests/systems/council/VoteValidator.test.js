import { describe, it, expect, beforeEach } from 'vitest';
import { VoteValidator } from '../../../systems/council/VoteValidator.js';

describe('VoteValidator', () => {
    let v;
    beforeEach(() => { v = new VoteValidator(); });
    it('initializes with defaults', () => { expect(v.stats.totalChecks).toBe(0); });
    it('addEligible and isEligible', () => {
        v.addEligible('m1');
        expect(v.isEligible('m1')).toBe(true);
    });
    it('removeEligible', () => {
        v.addEligible('m1');
        expect(v.removeEligible('m1')).toBe(true);
    });
    it('eligibleCount', () => {
        v.addEligible('m1');
        v.addEligible('m2');
        expect(v.eligibleCount()).toBe(2);
    });
    it('listEligible', () => {
        v.addEligible('m1');
        v.addEligible('m2');
        expect(v.listEligible().length).toBe(2);
    });
    it('validate success', () => {
        v.addEligible('m1');
        const ballot = { status: 'open', options: ['yes'] };
        const r = v.validate('p1', 'm1', ballot, 1);
        expect(r.valid).toBe(true);
    });
    it('validate rejects not eligible', () => {
        const ballot = { status: 'open', options: ['yes'] };
        const r = v.validate('p1', 'm1', ballot, 1);
        expect(r.valid).toBe(false);
        expect(r.errors).toContain('not_eligible');
    });
    it('validate rejects double vote', () => {
        v.addEligible('m1');
        const ballot = { status: 'open', options: ['yes'] };
        v.validate('p1', 'm1', ballot, 1);
        const r = v.validate('p1', 'm1', ballot, 1);
        expect(r.valid).toBe(false);
    });
    it('validate rejects closed ballot', () => {
        v.addEligible('m1');
        const ballot = { status: 'closed', options: ['yes'] };
        const r = v.validate('p1', 'm1', ballot, 1);
        expect(r.valid).toBe(false);
        expect(r.errors).toContain('ballot_not_open');
    });
    it('validate rejects weight out of bounds', () => {
        v.addEligible('m1');
        const ballot = { status: 'open', options: ['yes'] };
        const r = v.validate('p1', 'm1', ballot, 1000);
        expect(r.valid).toBe(false);
    });
    it('resetBallot allows re-vote', () => {
        v.addEligible('m1');
        const ballot = { status: 'open', options: ['yes'] };
        v.validate('p1', 'm1', ballot, 1);
        v.resetBallot('p1');
        const r = v.validate('p1', 'm1', ballot, 1);
        expect(r.valid).toBe(true);
    });    it('report aggregates', () => { v.addEligible('m1'); expect(v.report().eligible).toBe(1); });
    it('reset clears', () => { v.addEligible('m1'); v.reset(); expect(v.eligibleCount()).toBe(0); });
});
