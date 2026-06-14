import { describe, it, expect, beforeEach } from 'vitest';
import { DecisionLogger, DECISION_OUTCOMES } from '../../../systems/council/DecisionLogger.js';

describe('DecisionLogger', () => {
    let l;
    beforeEach(() => { l = new DecisionLogger(); });
    it('initializes with defaults', () => { expect(l.stats.total).toBe(0); });
    it('log_ creates entry', () => {
        const x = l.log_('p1', 'passed', 'content');
        expect(x).not.toBeNull();
    });
    it('log_ rejects missing', () => { expect(l.log_('', 'passed', 'c')).toBeNull(); });
    it('log_ rejects invalid outcome', () => { expect(l.log_('p1', 'invalid', 'c')).toBeNull(); });
    it('get returns null for unknown', () => { expect(l.get('ghost')).toBeNull(); });
    it('listAll', () => { l.log_('p1', 'passed', 'c'); expect(l.listAll().length).toBe(1); });
    it('forProposal', () => {
        l.log_('p1', 'passed', 'c');
        l.log_('p2', 'rejected', 'c');
        expect(l.forProposal('p1').length).toBe(1);
    });
    it('byOutcome', () => {
        l.log_('p1', 'passed', 'c');
        l.log_('p2', 'rejected', 'c');
        expect(l.byOutcome('passed').length).toBe(1);
    });
    it('hasDecision', () => {
        l.log_('p1', 'passed', 'c');
        expect(l.hasDecision('p1')).toBe(true);
        expect(l.hasDecision('p2')).toBe(false);
    });
    it('lastDecision', () => {
        l.log_('p1', 'passed', 'c');
        expect(l.lastDecision('p1').outcome).toBe('passed');
    });
    it('lastDecision for unknown returns null', () => { expect(l.lastDecision('ghost')).toBeNull(); });
    it('isApproved', () => {
        l.log_('p1', 'passed', 'c');
        expect(l.isApproved('p1')).toBe(true);
    });
    it('exportTo', () => {
        const x = l.log_('p1', 'passed', 'c');
        const e = l.exportTo(x.id);
        expect(JSON.parse(e).proposalId).toBe('p1');
    });
    it('exportAll', () => {
        l.log_('p1', 'passed', 'c');
        expect(l.exportAll().length).toBe(1);
    });
    it('countByOutcome', () => {
        l.log_('p1', 'passed', 'c');
        l.log_('p2', 'rejected', 'c');
        const c = l.countByOutcome();
        expect(c.passed).toBe(1);
    });
    it('recent', () => {
        l.log_('p1', 'passed', 'c');
        l.log_('p2', 'rejected', 'c');
        expect(l.recent().length).toBe(2);
    });
    it('report aggregates', () => { l.log_('p1', 'passed', 'c'); expect(l.report().total).toBe(1); });
    it('reset clears', () => { l.log_('p1', 'passed', 'c'); l.reset(); expect(l.stats.total).toBe(0); });
    it('exposes DECISION_OUTCOMES', () => { expect(DECISION_OUTCOMES).toContain('passed'); });
});
