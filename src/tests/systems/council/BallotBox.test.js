import { describe, it, expect, beforeEach } from 'vitest';
import { BallotBox, VOTE_OPTIONS } from '../../../systems/council/BallotBox.js';

describe('BallotBox', () => {
    let b;
    beforeEach(() => { b = new BallotBox(); });
    it('initializes with defaults', () => { expect(b.stats.totalBallots).toBe(0); });
    it('open creates ballot', () => {
        const x = b.open('p1');
        expect(x).not.toBeNull();
    });
    it('open rejects invalid', () => { expect(b.open('')).toBeNull(); });
    it('open accepts custom options', () => {
        const x = b.open('p1', ['agree', 'disagree']);
        expect(x.options).toContain('agree');
    });
    it('close marks closed', () => {
        const x = b.open('p1');
        expect(b.close(x.id)).toBe(true);
    });
    it('close returns false for unknown', () => { expect(b.close('ghost')).toBe(false); });
    it('invalidate marks invalid', () => {
        const x = b.open('p1');
        b.invalidate(x.id, 'test');
        expect(x.status).toBe('invalid');
    });
    it('invalidate returns false for unknown', () => { expect(b.invalidate('ghost')).toBe(false); });
    it('cast records vote', () => {
        const x = b.open('p1');
        expect(b.cast(x.id, 'm1', 'yes')).not.toBeNull();
    });
    it('cast rejects invalid option', () => {
        const x = b.open('p1');
        expect(b.cast(x.id, 'm1', 'invalid')).toBeNull();
    });
    it('cast rejects when closed', () => {
        const x = b.open('p1');
        b.close(x.id);
        expect(b.cast(x.id, 'm1', 'yes')).toBeNull();
    });
    it('cast replaces existing', () => {
        const x = b.open('p1');
        b.cast(x.id, 'm1', 'yes');
        b.cast(x.id, 'm1', 'no');
        expect(b.getVote(x.id, 'm1').option).toBe('no');
    });
    it('hasVoted true after cast', () => {
        const x = b.open('p1');
        b.cast(x.id, 'm1', 'yes');
        expect(b.hasVoted(x.id, 'm1')).toBe(true);
    });
    it('hasVoted false for unknown ballot', () => { expect(b.hasVoted('ghost', 'm1')).toBe(false); });
    it('getVote returns null for unknown', () => { expect(b.getVote('ghost', 'm1')).toBeNull(); });
    it('get returns null for unknown', () => { expect(b.get('ghost')).toBeNull(); });
    it('getByProposal', () => {
        const x = b.open('p1');
        expect(b.getByProposal('p1').id).toBe(x.id);
    });
    it('tally counts votes', () => {
        const x = b.open('p1');
        b.cast(x.id, 'm1', 'yes');
        b.cast(x.id, 'm2', 'no');
        const t = b.tally(x.id);
        expect(t.counts.yes).toBe(1);
    });
    it('tally returns null for unknown', () => { expect(b.tally('ghost')).toBeNull(); });
    it('listByStatus', () => {
        const x = b.open('p1');
        expect(b.listByStatus('open').length).toBe(1);
    });
    it('report aggregates', () => { b.open('p1'); expect(b.report().totalBallots).toBe(1); });
    it('reset clears', () => { b.open('p1'); b.reset(); expect(b.stats.totalBallots).toBe(0); });
    it('exposes VOTE_OPTIONS', () => { expect(VOTE_OPTIONS).toContain('yes'); });
});
