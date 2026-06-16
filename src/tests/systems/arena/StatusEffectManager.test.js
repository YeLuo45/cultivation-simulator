import { describe, it, expect, beforeEach } from 'vitest';
import { StatusEffectManager, EFFECT_TYPES } from '../../../systems/arena/StatusEffectManager.js';

describe('StatusEffectManager', () => {
    let e;
    beforeEach(() => { e = new StatusEffectManager(); });
    it('initializes with defaults', () => { expect(e.stats.totalApplied).toBe(0); });
    it('apply creates effect', () => { expect(e.apply('buff', 'p1', 'src1', 10, 3)).not.toBeNull(); });
    it('apply rejects invalid type', () => { expect(e.apply('invalid', 'p1', 'src1')).toBeNull(); });
    it('apply rejects missing target', () => { expect(e.apply('buff', '', 'src1')).toBeNull(); });
    it('remove', () => { const x = e.apply('buff', 'p1', 'src1'); expect(e.remove(x.id)).toBe(true); });
    it('remove returns false for unknown', () => { expect(e.remove('ghost')).toBe(false); });
    it('removeAllFromTarget', () => { e.apply('buff', 'p1', 'src1'); e.apply('debuff', 'p1', 'src1'); expect(e.removeAllFromTarget('p1')).toBe(2); });
    it('removeAllFromTarget by type', () => { e.apply('buff', 'p1', 'src1'); e.apply('debuff', 'p1', 'src1'); expect(e.removeAllFromTarget('p1', 'buff')).toBe(1); });
    it('tick reduces remaining', () => { const x = e.apply('buff', 'p1', 'src1', 10, 3); e.tick(1); expect(x.remaining).toBe(2); });
    it('cleanup removes expired', () => { e.apply('buff', 'p1', 'src1', 10, 1); e.tick(1); expect(e.cleanup()).toBe(1); });
    it('get returns null for unknown', () => { expect(e.get('ghost')).toBeNull(); });
    it('listAll and listForTarget', () => { e.apply('buff', 'p1', 'src1'); e.apply('debuff', 'p2', 'src1'); expect(e.listAll().length).toBe(2); expect(e.listForTarget('p1').length).toBe(1); });
    it('listByType and listFromSource', () => { e.apply('buff', 'p1', 'src1'); expect(e.listByType('buff').length).toBe(1); expect(e.listFromSource('src1').length).toBe(1); });
    it('isAffected', () => { e.apply('buff', 'p1', 'src1'); expect(e.isAffected('p1', 'buff')).toBe(true); });
    it('effectCount', () => { e.apply('buff', 'p1', 'src1'); expect(e.effectCount('p1')).toBe(1); });
    it('effectCount by type', () => { e.apply('buff', 'p1', 'src1'); expect(e.effectCount('p1', 'buff')).toBe(1); });
    it('totalValue', () => { e.apply('buff', 'p1', 'src1', 10); e.apply('buff', 'p1', 'src1', 5); expect(e.totalValue('p1', 'buff')).toBe(15); });
    it('isStunned/isSilenced/isStealthed/hasShield', () => { e.apply('stun', 'p1', 'src1'); expect(e.isStunned('p1')).toBe(true); expect(e.isSilenced('p1')).toBe(false); });
    it('report aggregates', () => { e.apply('buff', 'p1', 'src1'); expect(e.report().totalApplied).toBe(1); });
    it('reset clears', () => { e.apply('buff', 'p1', 'src1'); e.reset(); expect(e.stats.totalApplied).toBe(0); });
    it('exposes EFFECT_TYPES', () => { expect(EFFECT_TYPES).toContain('buff'); });
});
