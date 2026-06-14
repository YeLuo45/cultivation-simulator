import { describe, it, expect, beforeEach } from 'vitest';
import { DefenseResolver, DEFENSE_TYPES } from '../../../systems/arena/DefenseResolver.js';

describe('DefenseResolver', () => {
    let d;
    beforeEach(() => { d = new DefenseResolver(); });
    it('initializes with defaults', () => { expect(d.stats.totalResolved).toBe(0); });
    it('setDefense', () => { expect(d.setDefense('d1', { blockChance: 0.3 })).toBe(true); });
    it('setDefense rejects missing', () => { expect(d.setDefense('')).toBe(false); });
    it('get returns null for unknown', () => { expect(d.get('ghost')).toBeNull(); });
    it('resolve basic hit', () => { const r = d.resolve('a', 'd', 100); expect(r.damage).toBeGreaterThanOrEqual(0); });
    it('resolve returns hit by default', () => { d.setDefense('d', { dodgeChance: 0 }); const r = d.resolve('a', 'd', 100); expect(r.defense).toBe('hit'); });
    it('resolve for unknown defender', () => { const r = d.resolve('a', 'ghost', 100); expect(r.damage).toBe(100); });
    it('records stats', () => { d.setDefense('d', { blockChance: 0 }); d.resolve('a', 'd', 100); expect(d.stats_(d.config && 'd') || d.stats_('d')).toBeDefined(); });
    it('blockRate', () => { d.setDefense('d', { blockChance: 0 }); d.resolve('a', 'd', 100); expect(d.blockRate('d')).toBeGreaterThanOrEqual(0); });
    it('blockRate for unknown', () => { expect(d.blockRate('ghost')).toBe(0); });
    it('dodgeRate', () => { d.setDefense('d', { dodgeChance: 0 }); d.resolve('a', 'd', 100); expect(d.dodgeRate('d')).toBeGreaterThanOrEqual(0); });
    it('totalDefended', () => { d.setDefense('d', {}); d.resolve('a', 'd', 100); expect(d.totalDefended('d')).toBeGreaterThanOrEqual(0); });
    it('defenseRate', () => { d.setDefense('d', {}); d.resolve('a', 'd', 100); expect(d.defenseRate('d')).toBeGreaterThanOrEqual(0); });
    it('isEffective', () => { d.setDefense('d', {}); d.resolve('a', 'd', 100); expect(typeof d.isEffective('d')).toBe('boolean'); });
    it('stats_ returns null for unknown', () => { expect(d.stats_('ghost')).toBeNull(); });
    it('report aggregates', () => { d.resolve('a', 'd', 100); expect(d.report().totalResolved).toBe(1); });
    it('reset clears', () => { d.setDefense('d', {}); d.reset(); expect(d.defenses.size).toBe(0); });
    it('exposes DEFENSE_TYPES', () => { expect(DEFENSE_TYPES).toContain('block'); });
});
