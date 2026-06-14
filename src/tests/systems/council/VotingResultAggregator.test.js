import { describe, it, expect, beforeEach } from 'vitest';
import { VotingResultAggregator } from '../../../systems/council/VotingResultAggregator.js';

describe('VotingResultAggregator', () => {
    let a;
    beforeEach(() => { a = new VotingResultAggregator(); });
    it('initializes with defaults', () => { expect(a.stats.totalComputed).toBe(0); });
    it('compute passed', () => {
        const r = a.compute('p1', [{ option: 'yes', weight: 5 }, { option: 'no', weight: 2 }], 10);
        expect(r.type).toBe('passed');
    });
    it('compute rejected', () => {
        const r = a.compute('p1', [{ option: 'yes', weight: 2 }, { option: 'no', weight: 5 }], 10);
        expect(r.type).toBe('rejected');
    });
    it('compute tied', () => {
        const r = a.compute('p1', [{ option: 'yes', weight: 3 }, { option: 'no', weight: 3 }], 10);
        expect(r.type).toBe('tied');
    });
    it('compute no_quorum when empty', () => {
        const r = a.compute('p1', [], 10);
        expect(r.type).toBe('no_quorum');
    });
    it('compute pending when below threshold', () => {
        const r = a.compute('p1', [{ option: 'yes', weight: 1 }], 10, 0.5);
        expect(r.type).toBe('pending');
    });
    it('get returns null for unknown', () => { expect(a.get('ghost')).toBeNull(); });
    it('isPassed/isRejected/isTied', () => {
        a.compute('p1', [{ option: 'yes', weight: 5 }, { option: 'no', weight: 2 }], 10);
        expect(a.isPassed('p1')).toBe(true);
    });
    it('isRejected for rejected', () => {
        a.compute('p1', [{ option: 'yes', weight: 1 }, { option: 'no', weight: 5 }], 10);
        expect(a.isRejected('p1')).toBe(true);
    });
    it('margin calculates difference', () => {
        a.compute('p1', [{ option: 'yes', weight: 5 }, { option: 'no', weight: 2 }], 10);
        expect(a.margin('p1')).toBe(3);
    });
    it('supportRatio', () => {
        a.compute('p1', [{ option: 'yes', weight: 5 }, { option: 'no', weight: 5 }], 10);
        expect(a.supportRatio('p1')).toBe(0.5);
    });
    it('listByType', () => {
        a.compute('p1', [{ option: 'yes', weight: 5 }], 10);
        expect(a.listByType('passed').length).toBe(1);
    });
    it('listAll', () => {
        a.compute('p1', [{ option: 'yes', weight: 5 }], 10);
        expect(a.listAll().length).toBe(1);
    });
    it('report aggregates', () => { a.compute('p1', [{ option: 'yes', weight: 5 }], 10); expect(a.report().totalComputed).toBe(1); });
    it('reset clears', () => { a.compute('p1', [{ option: 'yes', weight: 5 }], 10); a.reset(); expect(a.stats.totalComputed).toBe(0); });
});
