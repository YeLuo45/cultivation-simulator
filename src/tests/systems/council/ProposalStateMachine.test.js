import { describe, it, expect, beforeEach } from 'vitest';
import { ProposalStateMachine, PROPOSAL_STATES } from '../../../systems/council/ProposalStateMachine.js';

describe('ProposalStateMachine', () => {
    let s;
    beforeEach(() => { s = new ProposalStateMachine(); });
    it('initializes with defaults', () => { expect(s.stats.transitions).toBe(0); });
    it('init creates state', () => { expect(s.init('p1')).toBe(true); });
    it('init normalizes invalid initial', () => { expect(s.init('p1', 'invalid')).toBe(false); });
    it('init fails for duplicate', () => { s.init('p1'); expect(s.init('p1')).toBe(false); });
    it('get returns null for unknown', () => { expect(s.get('ghost')).toBeNull(); });
    it('currentState returns null for unknown', () => { expect(s.currentState('ghost')).toBeNull(); });
    it('history returns array', () => { s.init('p1'); expect(s.history('p1').length).toBe(1); });
    it('canTransition valid', () => {
        s.init('p1');
        expect(s.canTransition('p1', 'submitted')).toBe(true);
    });
    it('canTransition invalid state', () => {
        s.init('p1');
        expect(s.canTransition('p1', 'invalid_state')).toBe(false);
    });
    it('canTransition invalid transition', () => {
        s.init('p1');
        expect(s.canTransition('p1', 'executed')).toBe(false);
    });
    it('canTransition false for unknown', () => { expect(s.canTransition('ghost', 'submitted')).toBe(false); });
    it('transition success', () => {
        s.init('p1');
        expect(s.transition('p1', 'submitted')).toBe(true);
    });
    it('transition failure', () => {
        s.init('p1');
        expect(s.transition('p1', 'executed')).toBe(false);
    });
    it('allowedFrom', () => {
        s.init('p1');
        const a = s.allowedFrom('p1');
        expect(a).toContain('submitted');
    });
    it('allowedFrom for unknown returns []', () => { expect(s.allowedFrom('ghost')).toEqual([]); });
    it('isTerminal', () => {
        s.init('p1');
        expect(s.isTerminal('p1')).toBe(false);
    });
    it('isInState', () => { s.init('p1'); expect(s.isInState('p1', 'draft')).toBe(true); });
    it('isPassed/isRejected/isActive', () => {
        s.init('p1');
        s.submit('p1');
        s.deliberate('p1');
        s.vote('p1');
        s.pass('p1');
        expect(s.isPassed('p1')).toBe(true);
    });
    it('isRejected', () => {
        s.init('p1');
        s.submit('p1');
        s.reject('p1');
        expect(s.isRejected('p1')).toBe(true);
    });
    it('isActive', () => {
        s.init('p1');
        s.submit('p1');
        expect(s.isActive('p1')).toBe(true);
    });
    it('submit/deliberate/vote/pass/reject/execute/archive', () => {
        s.init('p1');
        s.submit('p1');
        s.deliberate('p1');
        s.vote('p1');
        s.pass('p1');
        s.execute('p1');
        s.archive('p1');
        expect(s.isTerminal('p1')).toBe(true);
    });
    it('countByState', () => {
        s.init('p1');
        s.init('p2');
        expect(s.countByState().draft).toBe(2);
    });
    it('report aggregates', () => { s.init('p1'); expect(s.report().total).toBe(1); });
    it('reset clears', () => { s.init('p1'); s.reset(); expect(s.state.size).toBe(0); });
    it('exposes PROPOSAL_STATES', () => { expect(PROPOSAL_STATES).toContain('draft'); });
});
