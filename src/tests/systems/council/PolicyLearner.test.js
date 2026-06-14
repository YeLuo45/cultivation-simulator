import { describe, it, expect, beforeEach } from 'vitest';
import { PolicyLearner, POLICY_OUTCOMES } from '../../../systems/council/PolicyLearner.js';

describe('PolicyLearner', () => {
    let l;
    beforeEach(() => { l = new PolicyLearner(); });
    it('initializes with defaults', () => { expect(l.stats.totalUpdates).toBe(0); });
    it('register adds policy', () => { expect(l.register('aggressive')).toBe(true); });
    it('register rejects missing', () => { expect(l.register('')).toBe(false); });
    it('listAll', () => { l.register('a'); l.register('b'); expect(l.listAll().length).toBe(2); });
    it('record updates score', () => {
        l.register('a');
        l.record('a', 'success');
        expect(l.score('a')).toBeGreaterThan(0);
    });
    it('record with reward', () => {
        l.register('a');
        l.record('a', null, 0.5);
        expect(l.count('a')).toBe(1);
    });
    it('best returns null for no data', () => { expect(l.best()).toBeNull(); });
    it('best returns highest', () => {
        l.register('a');
        l.register('b');
        l.record('a', 'failure');
        l.record('b', 'success');
        expect(l.best()).toBe('b');
    });
    it('apply', () => {
        l.register('a');
        expect(l.apply('ctx1', 'a')).toBe(true);
    });
    it('autoApply', () => {
        l.register('a');
        l.record('a', 'success');
        expect(l.autoApply('ctx1')).toBe('a');
    });
    it('currentPolicy', () => {
        l.register('a');
        l.apply('ctx1', 'a');
        expect(l.currentPolicy('ctx1')).toBe('a');
    });
    it('currentPolicy for unknown returns null', () => { expect(l.currentPolicy('ghost')).toBeNull(); });
    it('choosePolicy with no data', () => {
        l.register('a');
        expect(l.choosePolicy('ctx', 0)).toBeNull();
    });
    it('choosePolicy with data', () => {
        l.register('a');
        l.record('a', 'success');
        const p = l.choosePolicy('ctx', 0);
        expect(p).toBe('a');
    });
    it('score and count', () => {
        l.register('a');
        l.record('a', 'success');
        expect(l.score('a')).toBeGreaterThan(0);
        expect(l.count('a')).toBe(1);
    });
    it('hasLearned and isLearning', () => {
        l.register('a');
        expect(l.hasLearned()).toBe(false);
        l.record('a', 'success');
        expect(l.hasLearned()).toBe(true);
        expect(l.isLearning('a')).toBe(true);
    });
    it('history', () => {
        l.register('a');
        l.record('a', 'success');
        expect(l.history('a').length).toBe(1);
    });
    it('report aggregates', () => { l.register('a'); expect(l.report().total).toBe(1); });
    it('reset clears', () => { l.register('a'); l.reset(); expect(l.policies.size).toBe(0); });
    it('exposes POLICY_OUTCOMES', () => { expect(POLICY_OUTCOMES).toContain('success'); });
});
