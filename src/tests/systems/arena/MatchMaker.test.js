import { describe, it, expect, beforeEach } from 'vitest';
import { MatchMaker, MATCH_STRATEGIES } from '../../../systems/arena/MatchMaker.js';

describe('MatchMaker', () => {
    let m;
    beforeEach(() => { m = new MatchMaker(); });
    it('initializes with defaults', () => { expect(m.stats.totalMatches).toBe(0); });
    it('registerPlayer creates entry', () => { expect(m.registerPlayer('p1', 1500)).not.toBeNull(); });
    it('registerPlayer rejects missing', () => { expect(m.registerPlayer('', 1500)).toBeNull(); });
    it('getPlayer returns null for unknown', () => { expect(m.getPlayer('ghost')).toBeNull(); });
    it('setElo clamps to 0', () => { m.registerPlayer('p1'); m.setElo('p1', -100); expect(m.getPlayer('p1').elo).toBe(0); });
    it('setElo returns false for unknown', () => { expect(m.setElo('ghost', 100)).toBe(false); });
    it('setTier and setPrefs', () => { m.registerPlayer('p1'); m.setTier('p1', 'gold'); m.setPrefs('p1', { lang: 'en' }); expect(m.getPlayer('p1').tier).toBe('gold'); });
    it('listByTier and listByEloRange', () => {
        m.registerPlayer('a', 1100, 'silver');
        m.registerPlayer('b', 1500, 'gold');
        expect(m.listByTier('gold').length).toBe(1);
        expect(m.listByEloRange(1000, 1200).length).toBe(1);
    });
    it('recordResult', () => {
        m.registerPlayer('p1');
        expect(m.recordResult('p1', true)).toBe(true);
    });
    it('recordResult returns false for unknown', () => { expect(m.recordResult('ghost', true)).toBe(false); });
    it('winRate', () => {
        m.registerPlayer('p1');
        m.recordResult('p1', true);
        m.recordResult('p1', true);
        m.recordResult('p1', false);
        expect(m.winRate('p1')).toBeCloseTo(2 / 3);
    });
    it('winRate for unknown', () => { expect(m.winRate('ghost')).toBe(0); });
    it('isOnStreak', () => {
        m.registerPlayer('p1');
        m.recordResult('p1', true);
        m.recordResult('p1', true);
        m.recordResult('p1', true);
        expect(m.isOnStreak('p1', 3)).toBe(true);
    });
    it('eloUpdate', () => {
        const r = m.eloUpdate(1500, 1500);
        expect(r.winnerNew).toBeGreaterThan(1500);
    });
    it('findMatch', () => {
        m.registerPlayer('a', 1500);
        m.registerPlayer('b', 1500);
        expect(m.findMatch('a')).toBe('b');
    });
    it('findMatch for unknown', () => { expect(m.findMatch('ghost')).toBeNull(); });
    it('findMatch no candidates', () => {
        m.registerPlayer('a');
        expect(m.findMatch('a')).toBeNull();
    });
    it('findMatch strategy tier', () => {
        m.config.strategy = 'tier';
        m.registerPlayer('a', 1500, 'gold');
        m.registerPlayer('b', 1500, 'silver');
        expect(m.findMatch('a')).toBe('b');
    });
    it('createMatch', () => {
        m.registerPlayer('a');
        m.registerPlayer('b');
        expect(m.createMatch('a', 'b')).not.toBeNull();
    });
    it('createMatch rejects same', () => {
        m.registerPlayer('a');
        expect(m.createMatch('a', 'a')).toBeNull();
    });
    it('createMatch rejects unknown', () => { expect(m.createMatch('ghost', 'a')).toBeNull(); });
    it('get returns null for unknown', () => { expect(m.get('ghost')).toBeNull(); });
    it('listAll and isValid and matchCount', () => {
        m.registerPlayer('a');
        m.registerPlayer('b');
        const x = m.createMatch('a', 'b');
        expect(m.listAll().length).toBe(1);
        expect(m.isValid(x.id)).toBe(true);
        expect(m.matchCount('a')).toBe(1);
    });
    it('report aggregates', () => { m.registerPlayer('a'); expect(m.report().players).toBe(1); });
    it('reset clears', () => { m.registerPlayer('a'); m.reset(); expect(m.players.size).toBe(0); });
    it('exposes MATCH_STRATEGIES', () => { expect(MATCH_STRATEGIES).toContain('elo'); });
});
