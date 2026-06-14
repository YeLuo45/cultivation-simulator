import { describe, it, expect, beforeEach } from 'vitest';
import { ComboChainTracker, COMBO_BONUSES } from '../../../systems/arena/ComboChainTracker.js';

describe('ComboChainTracker', () => {
    let c;
    beforeEach(() => { c = new ComboChainTracker(); });
    it('initializes with defaults', () => { expect(c.stats.totalHits).toBe(0); });
    it('hit increments count', () => { expect(c.hit('p1', 10)).toBe(1); });
    it('hit consecutive', () => { c.hit('p1', 10); c.hit('p1', 10); c.hit('p1', 10); expect(c.currentCount('p1')).toBe(3); });
    it('breakChain', () => { c.hit('p1', 10); c.hit('p1', 10); const e = c.breakChain('p1'); expect(e.count).toBe(2); });
    it('breakChain returns null for unknown', () => { expect(c.breakChain('ghost')).toBeNull(); });
    it('breakAll', () => { c.hit('p1', 10); c.hit('p2', 10); const r = c.breakAll(); expect(r.length).toBe(2); });
    it('get returns null for unknown', () => { expect(c.get('ghost')).toBeNull(); });
    it('currentCount for unknown', () => { expect(c.currentCount('ghost')).toBe(0); });
    it('isInCombo', () => { c.hit('p1', 10); expect(c.isInCombo('p1')).toBe(true); expect(c.isInCombo('ghost')).toBe(false); });
    it('damageBonus', () => { c.hit('p1', 10); c.hit('p1', 10); c.hit('p1', 10); expect(c.damageBonus('p1')).toBeGreaterThan(0); });
    it('isExpired true for unknown', () => { expect(c.isExpired('ghost')).toBe(true); });
    it('isExpired false for fresh', () => { c.hit('p1', 10); expect(c.isExpired('p1')).toBe(false); });
    it('maxComboFor', () => { c.hit('p1', 10); c.hit('p1', 10); expect(c.maxComboFor('p1')).toBe(2); });
    it('history_', () => { c.hit('p1', 10); c.breakChain('p1'); expect(c.history_('p1').length).toBe(1); });
    it('bestCombo', () => { c.hit('p1', 10); c.breakChain('p1'); c.hit('p1', 10); c.hit('p1', 10); c.breakChain('p1'); expect(c.bestCombo('p1')).toBe(2); });
    it('avgCombo', () => { c.hit('p1', 10); c.breakChain('p1'); expect(c.avgCombo('p1')).toBe(1); });
    it('isHotStreak', () => { for (let i = 0; i < 5; i++) c.hit('p1', 10); expect(c.isHotStreak('p1', 5)).toBe(true); });
    it('totalCombos increments on break', () => { c.hit('p1', 10); c.hit('p1', 10); c.hit('p1', 10); c.breakChain('p1'); expect(c.stats.totalCombos).toBe(1); });
    it('report aggregates', () => { c.hit('p1', 10); expect(c.report().totalHits).toBe(1); });
    it('reset clears', () => { c.hit('p1', 10); c.reset(); expect(c.stats.totalHits).toBe(0); });
    it('exposes COMBO_BONUSES', () => { expect(COMBO_BONUSES).toContain(0); });
});
