import { describe, it, expect, beforeEach } from 'vitest';
import { DamageCalculator, DAMAGE_TYPES } from '../../../systems/arena/DamageCalculator.js';

describe('DamageCalculator', () => {
    let c;
    beforeEach(() => { c = new DamageCalculator(); });
    it('initializes with defaults', () => { expect(c.stats.totalCalcs).toBe(0); });
    it('setAttacker and setDefender', () => { expect(c.setAttacker('a', { atk: 10 })).toBe(true); expect(c.setDefender('d', { def: 5 })).toBe(true); });
    it('setAttacker rejects invalid', () => { expect(c.setAttacker('', {})).toBe(false); expect(c.setAttacker('a', null)).toBe(false); });
    it('getAttacker and getDefender return null', () => { expect(c.getAttacker('ghost')).toBeNull(); expect(c.getDefender('ghost')).toBeNull(); });
    it('calculate physical', () => { c.setAttacker('a', { str: 100 }); c.setDefender('d', { def: 10 }); const r = c.calculate('a', 'd', 50, 'physical'); expect(r.damage).toBeGreaterThan(0); });
    it('calculate magical', () => { c.setAttacker('a', { int: 100 }); c.setDefender('d', { resist: 10 }); const r = c.calculate('a', 'd', 50, 'magical'); expect(r.damage).toBeGreaterThan(0); });
    it('calculate true', () => { const r = c.calculate('a', 'd', 50, 'true'); expect(r.damage).toBeGreaterThanOrEqual(0); });
    it('calculate normalizes invalid type', () => { c.setAttacker('a', { str: 50 }); const r = c.calculate('a', 'd', 50, 'invalid'); expect(r.type).toBe('physical'); });
    it('calculate uses defaults when no stats', () => { const r = c.calculate('a', 'd', 50); expect(r.damage).toBe(50); });
    it('isLethal', () => { c.setDefender('d', { hp: 100 }); expect(c.isLethal(100, 'd')).toBe(true); });
    it('isLethal for unknown', () => { expect(c.isLethal(50, 'ghost')).toBe(false); });
    it('remainingHp', () => { c.setDefender('d', { hp: 100 }); expect(c.remainingHp('d', 30)).toBe(70); });
    it('percentDamage', () => { c.setDefender('d', { hp: 50, maxHp: 100 }); expect(c.percentDamage(25, 'd')).toBe(0.25); });
    it('expectedDps', () => { c.setAttacker('a', { str: 50 }); c.setDefender('d', { def: 10 }); const r = c.expectedDps('a', 'd', 50, 'physical', 2); expect(r).toBeGreaterThan(0); });
    it('critChance', () => { c.setAttacker('a', { crit: 0.5 }); expect(c.critChance('a')).toBe(0.5); });
    it('effectiveDef', () => { c.setDefender('d', { def: 10, resist: 5 }); expect(c.effectiveDef('d', 'physical')).toBe(10); expect(c.effectiveDef('d', 'magical')).toBe(5); });
    it('report aggregates', () => { c.calculate('a', 'd', 50); expect(c.report().totalCalcs).toBe(1); });
    it('reset clears', () => { c.setAttacker('a', {}); c.reset(); expect(c.attacker.size).toBe(0); });
    it('exposes DAMAGE_TYPES', () => { expect(DAMAGE_TYPES).toContain('physical'); });
});
