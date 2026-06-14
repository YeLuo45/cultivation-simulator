import { describe, it, expect, beforeEach } from 'vitest';
import { SectProposalCollector } from '../../../systems/council/SectProposalCollector.js';

describe('SectProposalCollector', () => {
    let c;
    beforeEach(() => { c = new SectProposalCollector(); });
    it('initializes with defaults', () => { expect(c.stats.total).toBe(0); });
    it('submit creates proposal', () => {
        const p = c.submit('m1', 'Test', 'Content', { category: 'tax' });
        expect(p).not.toBeNull();
        expect(c.stats.total).toBe(1);
    });
    it('submit rejects invalid', () => {
        expect(c.submit('', 't', 'c')).toBeNull();
        expect(c.submit('m1', '', 'c')).toBeNull();
    });
    it('submit normalizes invalid category', () => {
        const p = c.submit('m1', 't', 'c', { category: 'xxx' });
        expect(p.category).toBe('cultivation');
    });
    it('submit normalizes invalid priority', () => {
        const p = c.submit('m1', 't', 'c', { priority: 'xxx' });
        expect(p.priority).toBe('normal');
    });
    it('get returns null for unknown', () => { expect(c.get('ghost')).toBeNull(); });
    it('listByCategory', () => {
        c.submit('m1', 'a', '', { category: 'tax' });
        c.submit('m1', 'b', '', { category: 'defense' });
        expect(c.listByCategory('tax').length).toBe(1);
    });
    it('listByProposer', () => {
        c.submit('m1', 'a');
        c.submit('m2', 'b');
        c.submit('m1', 'c');
        expect(c.listByProposer('m1').length).toBe(2);
    });
    it('listByPriority', () => {
        c.submit('m1', 'a', '', { priority: 'high' });
        c.submit('m1', 'b', '', { priority: 'low' });
        expect(c.listByPriority('high').length).toBe(1);
    });
    it('countByCategory and countByProposer', () => {
        c.submit('m1', 'a', '', { category: 'tax' });
        c.submit('m1', 'b', '', { category: 'tax' });
        c.submit('m2', 'c');
        expect(c.countByCategory('tax')).toBe(2);
        expect(c.countByProposer('m1')).toBe(2);
    });
    it('updateStatus', () => {
        const p = c.submit('m1', 't');
        expect(c.updateStatus(p.id, 'voting')).toBe(true);
    });
    it('updateStatus returns false for unknown', () => { expect(c.updateStatus('ghost', 'x')).toBe(false); });
    it('withdraw and archive', () => {
        const p = c.submit('m1', 't');
        c.withdraw(p.id);
        expect(c.get(p.id).status).toBe('withdrawn');
    });
    it('filterBy and sortBy', () => {
        c.submit('m1', 'a', '', { priority: 'low' });
        c.submit('m1', 'b', '', { priority: 'high' });
        expect(c.sortBy('priority')[0].priority).toBe('high');
    });
    it('report aggregates', () => {
        c.submit('m1', 'a');
        const r = c.report();
        expect(r.total).toBe(1);
    });
    it('reset clears', () => {
        c.submit('m1', 'a');
        c.reset();
        expect(c.stats.total).toBe(0);
    });
    it('triggers proposalSubmitted hook', () => {
        let called = false;
        c.registerHook('proposalSubmitted', () => { called = true; });
        c.submit('m1', 'a');
        expect(called).toBe(true);
    });
});
