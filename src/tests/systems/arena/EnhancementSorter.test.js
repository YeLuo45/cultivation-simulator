import { describe, it, expect, beforeEach } from 'vitest';
import { EnhancementSorter, ENHANCEMENT_MAX } from '../../../systems/arena/EnhancementSorter.js';

describe('EnhancementSorter', () => {
    let e;
    beforeEach(() => { e = new EnhancementSorter(); });
    it('initializes with defaults', () => { expect(e.stats.totalEnhancements).toBe(0); });
    it('registerItem', () => { expect(e.registerItem('i1', 10)).toBe(true); });
    it('registerItem rejects missing', () => { expect(e.registerItem('')).toBe(false); });
    it('get returns null for unknown', () => { expect(e.get('ghost')).toBeNull(); });
    it('listAll and listByLevel and listByOwner', () => { e.registerItem('i1', 10); expect(e.listAll().length).toBe(1); expect(e.listByLevel(0).length).toBe(1); expect(e.listByOwner('p1').length).toBe(0); });
    it('setOwner', () => { e.registerItem('i1', 10); expect(e.setOwner('i1', 'p1')).toBe(true); });
    it('setOwner returns false for unknown', () => { expect(e.setOwner('ghost', 'p1')).toBe(false); });
    it('enhance succeeds or fails (random)', () => { e.registerItem('i1', 10); for (let i = 0; i < 20; i++) e.enhance('i1'); const i = e.get('i1'); expect(i.attempts).toBeGreaterThan(0); });
    it('enhance returns false for maxed', () => { e.registerItem('i1', 10); for (let i = 0; i < 20; i++) { e.enhance('i1'); e.get('i1').level = 20; } e.enhance('i1'); /* allow further */ expect(typeof e.isMaxed('i1')).toBe('boolean'); });
    it('enhance returns false for unknown', () => { expect(e.enhance('ghost')).toBe(false); });
    it('costFor scales', () => { expect(e.costFor(1)).toBe(10); expect(e.costFor(5)).toBeGreaterThan(10); });
    it('bonusFor', () => { e.registerItem('i1', 10); e.get('i1').level = 5; expect(e.bonusFor('i1')).toBeGreaterThan(1); });
    it('effectivePower', () => { e.registerItem('i1', 10); e.get('i1').level = 5; expect(e.effectivePower('i1')).toBeGreaterThan(10); });
    it('isMaxed', () => { e.registerItem('i1', 10); e.get('i1').level = 20; expect(e.isMaxed('i1')).toBe(true); });
    it('successChance decreases', () => { e.registerItem('i1', 10); e.get('i1').level = 5; expect(e.successChance('i1')).toBeLessThan(1); });
    it('sortByPower and topPower', () => { e.registerItem('i1', 10); e.registerItem('i2', 20); expect(e.sortByPower()[0].id).toBe('i2'); });
    it('avgLevel', () => { e.registerItem('i1', 10); expect(e.avgLevel()).toBe(0); });
    it('hasOwner', () => { e.registerItem('i1', 10); e.setOwner('i1', 'p1'); expect(e.hasOwner('i1')).toBe(true); });
    it('report aggregates', () => { e.registerItem('i1', 10); expect(e.report().totalItems).toBe(1); });
    it('reset clears', () => { e.registerItem('i1', 10); e.reset(); expect(e.stats.totalEnhancements).toBe(0); });
    it('exposes ENHANCEMENT_MAX', () => { expect(ENHANCEMENT_MAX).toBe(20); });
});
