import { describe, it, expect, beforeEach } from 'vitest';
import { RankingLadder, TIER_BANDS } from '../../../systems/arena/RankingLadder.js';

describe('RankingLadder', () => {
    let r;
    beforeEach(() => { r = new RankingLadder(); });
    it('initializes with defaults', () => { expect(r.stats.totalUpdates).toBe(0); });
    it('registerPlayer', () => { expect(r.registerPlayer('p1', 1500)).not.toBeNull(); });
    it('registerPlayer rejects missing', () => { expect(r.registerPlayer('')).toBeNull(); });
    it('get returns null for unknown', () => { expect(r.get('ghost')).toBeNull(); });
    it('listAll', () => { r.registerPlayer('p1'); r.registerPlayer('p2'); expect(r.listAll().length).toBe(2); });
    it('tierFor elo', () => { r.registerPlayer('p1', 1500); expect(r.get('p1').tier).toBe('platinum'); });
    it('updateElo', () => { r.registerPlayer('a', 1500); r.registerPlayer('b', 1500); expect(r.updateElo('a', 'b')).not.toBeNull(); });
    it('updateElo returns null for unknown', () => { r.registerPlayer('a'); expect(r.updateElo('a', 'ghost')).toBeNull(); });
    it('rankOf', () => { r.registerPlayer('a', 1500); r.registerPlayer('b', 1800); expect(r.rankOf('a')).toBe(2); });
    it('eloOf', () => { r.registerPlayer('a', 1500); expect(r.eloOf('a')).toBe(1500); });
    it('tierOf and peakElo', () => { r.registerPlayer('a', 1500); r.get('a').peak = 1800; expect(r.tierOf('a')).toBe('platinum'); expect(r.peakElo('a')).toBe(1800); });
    it('isTop', () => { r.registerPlayer('a', 1800); r.registerPlayer('b', 1500); expect(r.isTop('a', 1)).toBe(true); expect(r.isTop('b', 1)).toBe(false); });
    it('top', () => { r.registerPlayer('a', 1500); r.registerPlayer('b', 1800); expect(r.top(1)[0].id).toBe('b'); });
    it('byTier', () => { r.registerPlayer('a', 1500); expect(r.byTier('platinum').length).toBe(1); });
    it('countByTier', () => { r.registerPlayer('a', 1500); expect(r.countByTier().platinum).toBe(1); });
    it('rankGap and eloGap', () => { r.registerPlayer('a', 1500); r.registerPlayer('b', 1800); expect(r.rankGap('a', 'b')).toBe(1); expect(r.eloGap('a', 'b')).toBe(300); });
    it('report aggregates', () => { r.registerPlayer('a'); expect(r.report().totalPlayers).toBe(1); });
    it('reset clears', () => { r.registerPlayer('a'); r.reset(); expect(r.stats.totalUpdates).toBe(0); });
    it('exposes TIER_BANDS', () => { expect(TIER_BANDS).toContain('gold'); });
});
