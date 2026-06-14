import { describe, it, expect, beforeEach } from 'vitest';
import { BracketBuilder, BRACKET_TYPES } from '../../../systems/arena/BracketBuilder.js';

describe('BracketBuilder', () => {
    let b;
    beforeEach(() => { b = new BracketBuilder(); });
    it('initializes with defaults', () => { expect(b.stats.total).toBe(0); });
    it('create single elim', () => { expect(b.create('single_elim', ['a', 'b', 'c', 'd'])).not.toBeNull(); });
    it('create double elim', () => { expect(b.create('double_elim', ['a', 'b'])).not.toBeNull(); });
    it('create round robin', () => { expect(b.create('round_robin', ['a', 'b', 'c'])).not.toBeNull(); });
    it('create swiss', () => { expect(b.create('swiss', ['a', 'b'])).not.toBeNull(); });
    it('create rejects invalid type', () => { expect(b.create('invalid', ['a', 'b'])).toBeNull(); });
    it('create rejects single player', () => { expect(b.create('single_elim', ['a'])).toBeNull(); });
    it('get returns null for unknown', () => { expect(b.get('ghost')).toBeNull(); });
    it('listAll', () => { b.create('round_robin', ['a', 'b']); expect(b.listAll().length).toBe(1); });
    it('listByType and listByStatus', () => {
        b.create('round_robin', ['a', 'b']);
        expect(b.listByType('round_robin').length).toBe(1);
        expect(b.listByStatus('pending').length).toBe(1);
    });
    it('advance match', () => {
        const x = b.create('single_elim', ['a', 'b']);
        expect(b.advance(x.id, 0, 'a')).toBe(true);
    });
    it('advance returns false for unknown bracket', () => { expect(b.advance('ghost', 0, 'a')).toBe(false); });
    it('advance returns false for unknown match', () => { const x = b.create('single_elim', ['a', 'b']); expect(b.advance(x.id, 99, 'a')).toBe(false); });
    it('startNextRound single elim', () => {
        const x = b.create('single_elim', ['a', 'b', 'c', 'd']);
        b.advance(x.id, 0, 'a');
        b.advance(x.id, 1, 'b');
        const r = b.startNextRound(x.id);
        expect(r.rounds.length).toBe(2);
    });
    it('startNextRound returns null for incomplete', () => {
        const x = b.create('single_elim', ['a', 'b', 'c', 'd']);
        expect(b.startNextRound(x.id)).toBeNull();
    });
    it('startNextRound completes tournament', () => {
        const x = b.create('single_elim', ['a', 'b']);
        b.advance(x.id, 0, 'a');
        b.startNextRound(x.id);
        expect(x.status).toBe('completed');
    });
    it('startNextRound returns null for unknown', () => { expect(b.startNextRound('ghost')).toBeNull(); });
    it('isComplete and winner', () => {
        const x = b.create('single_elim', ['a', 'b']);
        expect(b.isComplete(x.id)).toBe(false);
    });
    it('currentRound and matchCount and playerMatches', () => {
        const x = b.create('round_robin', ['a', 'b', 'c']);
        expect(b.currentRound(x.id)).toBe(1);
        expect(b.matchCount(x.id)).toBe(3);
        expect(b.playerMatches(x.id, 'a').length).toBe(2);
    });
    it('report aggregates', () => { b.create('single_elim', ['a', 'b']); expect(b.report().total).toBe(1); });
    it('reset clears', () => { b.create('single_elim', ['a', 'b']); b.reset(); expect(b.stats.total).toBe(0); });
    it('exposes BRACKET_TYPES', () => { expect(BRACKET_TYPES).toContain('single_elim'); });
});
