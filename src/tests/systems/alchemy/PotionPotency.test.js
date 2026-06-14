import { describe, it, expect, beforeEach } from 'vitest';
import { PotionPotency, POTENCY_LEVELS } from '../../../systems/alchemy/PotionPotency.js';

describe('PotionPotency', () => {
    let p;
    beforeEach(() => { p = new PotionPotency(); });
    it('initializes with defaults', () => { expect(p.stats.total).toBe(0); });
    it('register potion', () => { expect(p.register('p1', 1.5, [0.1])).toBe(true); });
    it('register rejects missing', () => { expect(p.register('')).toBe(false); });
    it('compute modifiers', () => { expect(p._compute(2, [0.5, 0.5])).toBeCloseTo(4.5); });
    it('levelFor potency', () => { expect(p._levelFor(0.5)).toBe('weak'); expect(p._levelFor(2)).toBe('strong'); expect(p._levelFor(10)).toBe('overwhelming'); });
    it('get returns null for unknown', () => { expect(p.get('ghost')).toBeNull(); });
    it('listAll and listByLevel', () => {
        p.register('p1', 0.5);
        p.register('p2', 5);
        expect(p.listAll().length).toBe(2);
        expect(p.listByLevel('weak').length).toBe(1);
    });
    it('addModifier', () => { p.register('p1', 1, [0.1]); p.addModifier('p1', 0.5); expect(p.potencyOf('p1')).toBeCloseTo(1.65); });
    it('addModifier returns false for unknown', () => { expect(p.addModifier('ghost', 0.1)).toBe(false); });
    it('setBase', () => { p.register('p1', 1); p.setBase('p1', 5); expect(p.potencyOf('p1')).toBe(5); });
    it('setBase returns false for unknown', () => { expect(p.setBase('ghost', 5)).toBe(false); });
    it('clearModifiers', () => { p.register('p1', 1, [0.5, 0.5]); p.clearModifiers('p1'); expect(p.potencyOf('p1')).toBe(1); });
    it('clearModifiers returns false for unknown', () => { expect(p.clearModifiers('ghost')).toBe(false); });
    it('potencyOf and levelOf', () => { p.register('p1', 3); expect(p.potencyOf('p1')).toBe(3); expect(p.levelOf('p1')).toBe('strong'); });
    it('potencyOf for unknown', () => { expect(p.potencyOf('ghost')).toBe(0); });
    it('levelOf for unknown', () => { expect(p.levelOf('ghost')).toBeNull(); });
    it('isExtreme and isOverwhelming', () => { p.register('p1', 5); expect(p.isExtreme('p1')).toBe(true); p.register('p2', 10); expect(p.isOverwhelming('p2')).toBe(true); });
    it('isExtreme for unknown', () => { expect(p.isExtreme('ghost')).toBe(false); });
    it('isOverwhelming for unknown', () => { expect(p.isOverwhelming('ghost')).toBe(false); });
    it('strongest', () => { p.register('p1', 1); p.register('p2', 5); expect(p.strongest()[0].id).toBe('p2'); });
    it('averagePotency', () => { p.register('p1', 2); p.register('p2', 4); expect(p.averagePotency()).toBe(3); });
    it('report aggregates', () => { p.register('p1', 1); expect(p.report().total).toBe(1); });
    it('reset clears', () => { p.register('p1', 1); p.reset(); expect(p.stats.total).toBe(0); });
    it('exposes POTENCY_LEVELS', () => { expect(POTENCY_LEVELS).toContain('weak'); });
});
