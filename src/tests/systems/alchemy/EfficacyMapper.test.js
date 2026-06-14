import { describe, it, expect, beforeEach } from 'vitest';
import { EfficacyMapper, EFFICACY_TYPES } from '../../../systems/alchemy/EfficacyMapper.js';

describe('EfficacyMapper', () => {
    let m;
    beforeEach(() => { m = new EfficacyMapper(); });
    it('initializes with defaults', () => { expect(m.stats.total).toBe(0); });
    it('registerPill', () => { expect(m.registerPill('p1', 'Heal Pill', 'heal', 100)).toBe(true); });
    it('registerPill rejects missing', () => { expect(m.registerPill('', 'A', 'heal')).toBe(false); });
    it('registerPill normalizes invalid type', () => { expect(m.registerPill('p1', 'A', 'invalid', 100)).toBe(true); expect(m.get('p1').type).toBe('heal'); });
    it('get returns null for unknown', () => { expect(m.get('ghost')).toBeNull(); });
    it('listAll and listByType', () => {
        m.registerPill('p1', 'A', 'heal');
        m.registerPill('p2', 'B', 'attack');
        expect(m.listAll().length).toBe(2);
        expect(m.listByType('heal').length).toBe(1);
    });
    it('setValue', () => { m.registerPill('p1', 'A', 'heal', 100); m.setValue('p1', 200); expect(m.pillValue('p1')).toBe(200); });
    it('setValue clamps to 0', () => { m.registerPill('p1', 'A', 'heal', 100); m.setValue('p1', -100); expect(m.pillValue('p1')).toBe(0); });
    it('setValue returns false for unknown', () => { expect(m.setValue('ghost', 100)).toBe(false); });
    it('boost', () => { m.registerPill('p1', 'A', 'heal', 100); m.boost('p1', 50); expect(m.pillValue('p1')).toBe(150); });
    it('boost returns false for unknown', () => { expect(m.boost('ghost', 50)).toBe(false); });
    it('addSideEffect and hasSideEffect', () => { m.registerPill('p1', 'A', 'heal'); m.addSideEffect('p1', 'nausea'); expect(m.hasSideEffect('p1', 'nausea')).toBe(true); });
    it('addSideEffect returns false for unknown', () => { expect(m.addSideEffect('ghost', 'x')).toBe(false); });
    it('hasSideEffect for unknown', () => { expect(m.hasSideEffect('ghost', 'x')).toBe(false); });
    it('sideEffectCount', () => { m.registerPill('p1', 'A', 'heal'); m.addSideEffect('p1', 'x'); m.addSideEffect('p1', 'y'); expect(m.sideEffectCount('p1')).toBe(2); });
    it('strongest', () => {
        m.registerPill('p1', 'A', 'heal', 100);
        m.registerPill('p2', 'B', 'heal', 200);
        expect(m.strongest('heal').length).toBe(2);
    });
    it('averageValue', () => { m.registerPill('p1', 'A', 'heal', 100); expect(m.averageValue()).toBe(100); });
    it('bestFor', () => { m.registerPill('p1', 'A', 'heal', 100); m.registerPill('p2', 'B', 'heal', 200); expect(m.bestFor('heal').id).toBe('p2'); });
    it('bestFor null', () => { expect(m.bestFor('heal')).toBeNull(); });
    it('isEffective', () => { m.registerPill('p1', 'A', 'heal', 150); expect(m.isEffective('p1', 100)).toBe(true); });
    it('isEffective for unknown', () => { expect(m.isEffective('ghost')).toBe(false); });
    it('pillValue for unknown', () => { expect(m.pillValue('ghost')).toBe(0); });
    it('countByType', () => { m.registerPill('p1', 'A', 'heal'); expect(m.countByType().heal).toBe(1); });
    it('report aggregates', () => { m.registerPill('p1', 'A', 'heal'); expect(m.report().total).toBe(1); });
    it('reset clears', () => { m.registerPill('p1', 'A', 'heal'); m.reset(); expect(m.stats.total).toBe(0); });
    it('exposes EFFICACY_TYPES', () => { expect(EFFICACY_TYPES).toContain('heal'); });
});
