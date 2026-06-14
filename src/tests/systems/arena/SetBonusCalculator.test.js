import { describe, it, expect, beforeEach } from 'vitest';
import { SetBonusCalculator, TIER_BONUSES } from '../../../systems/arena/SetBonusCalculator.js';

describe('SetBonusCalculator', () => {
    let c;
    beforeEach(() => { c = new SetBonusCalculator(); });
    it('initializes with defaults', () => { expect(c.stats.totalSets).toBe(0); });
    it('registerSet', () => { expect(c.registerSet('s1', 'Dragon Set', [2, 4], [{ atk: 5 }, { atk: 10 }])).toBe(true); });
    it('registerSet rejects mismatched arrays', () => { expect(c.registerSet('s1', 'X', [2, 4], [{ atk: 5 }])).toBe(false); });
    it('registerSet rejects missing fields', () => { expect(c.registerSet('', 'X', [2], [{}])).toBe(false); });
    it('get returns null for unknown', () => { expect(c.get('ghost')).toBeNull(); });
    it('listAll', () => { c.registerSet('s1', 'A', [2], [{}]); expect(c.listAll().length).toBe(1); });
    it('calculateBonus', () => { c.registerSet('s1', 'A', [2, 4], [{ atk: 5 }, { atk: 10 }]); const b = c.calculateBonus('s1', 2); expect(b.bonus.atk).toBe(5); });
    it('calculateBonus for unknown', () => { expect(c.calculateBonus('ghost', 1)).toBeNull(); });
    it('nextThreshold', () => { c.registerSet('s1', 'A', [2, 4], [{}, {}]); expect(c.nextThreshold('s1', 1)).toBe(2); });
    it('nextThreshold for unknown', () => { expect(c.nextThreshold('ghost', 1)).toBeNull(); });
    it('progressToNext', () => { c.registerSet('s1', 'A', [2, 4], [{}, {}]); expect(c.progressToNext('s1', 1)).toBeCloseTo(0.5); });
    it('hasBonus', () => { c.registerSet('s1', 'A', [2], [{}]); expect(c.hasBonus('s1', 0)).toBe(false); expect(c.hasBonus('s1', 2)).toBe(true); });
    it('isMaxed', () => { c.registerSet('s1', 'A', [2], [{}]); expect(c.isMaxed('s1', 2)).toBe(true); expect(c.isMaxed('s1', 1)).toBe(false); });
    it('isMaxed for unknown', () => { expect(c.isMaxed('ghost', 10)).toBe(false); });
    it('aggregateForPlayer', () => { c.registerSet('s1', 'A', [2], [{ atk: 5 }]); const r = c.aggregateForPlayer({ s1: 2 }); expect(r.atk).toBe(5); });
    it('totalBonusValue', () => { c.registerSet('s1', 'A', [2], [{ atk: 5, def: 3 }]); expect(c.totalBonusValue('s1', 2)).toBe(8); });
    it('report aggregates', () => { c.registerSet('s1', 'A', [2], [{}]); expect(c.report().totalSets).toBe(1); });
    it('reset clears', () => { c.registerSet('s1', 'A', [2], [{}]); c.reset(); expect(c.stats.totalSets).toBe(0); });
    it('exposes TIER_BONUSES', () => { expect(TIER_BONUSES).toContain(0); });
});
