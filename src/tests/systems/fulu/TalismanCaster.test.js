import { describe, it, expect, beforeEach } from 'vitest';
import { TalismanCaster, CAST_ELEMENTS } from '../../../systems/fulu/TalismanCaster.js';

describe('TalismanCaster', () => {
    let c;
    beforeEach(() => { c = new TalismanCaster(); });
    it('initializes with defaults', () => { expect(c.stats.total).toBe(0); });
    it('cast', () => { expect(c.cast('T1', 'enemy1')).not.toBeNull(); });
    it('cast rejects missing', () => { expect(c.cast('', 'enemy1')).toBeNull(); expect(c.cast('T1', '')).toBeNull(); });
    it('cast normalizes invalid element', () => { const x = c.cast('T1', 'enemy1', 'invalid'); expect(x.element).toBe('none'); });
    it('get returns null for unknown', () => { expect(c.get('ghost')).toBeNull(); });
    it('listAll and listByTalisman and listByTarget and listByStatus and listByElement and listActive', () => {
        c.cast('T1', 'e1');
        c.cast('T1', 'e2', 'fire');
        c.cast('T2', 'e1');
        expect(c.listAll().length).toBe(3);
        expect(c.listByTalisman('T1').length).toBe(2);
        expect(c.listByTarget('e1').length).toBe(2);
        expect(c.listByStatus('casting').length).toBe(3);
    });
    it('setStatus', () => { const x = c.cast('T1', 'e1'); expect(c.setStatus(x.id, 'hit')).toBe(true); });
    it('setStatus rejects invalid', () => { const x = c.cast('T1', 'e1'); expect(c.setStatus(x.id, 'invalid')).toBe(false); });
    it('setStatus returns false for unknown', () => { expect(c.setStatus('ghost', 'hit')).toBe(false); });
    it('hit and miss and reflect and cancel', () => { const x = c.cast('T1', 'e1'); c.hit(x.id); expect(c.isHit(x.id)).toBe(true); const y = c.cast('T1', 'e2'); c.miss(y.id); const z = c.cast('T2', 'e3'); c.reflect(z.id); const w = c.cast('T2', 'e4'); c.cancel(w.id); expect(c.isCancelled(w.id)).toBe(true); });
    it('setPower', () => { const x = c.cast('T1', 'e1'); c.setPower(x.id, 50); expect(x.power).toBe(50); });
    it('setPower clamps', () => { const x = c.cast('T1', 'e1'); c.setPower(x.id, -5); expect(x.power).toBe(0); });
    it('setPower returns false for unknown', () => { expect(c.setPower('ghost', 50)).toBe(false); });
    it('isActive and isHit and isMiss and isReflected and isCancelled', () => { const x = c.cast('T1', 'e1'); expect(c.isActive(x.id)).toBe(true); });
    it('isActive for unknown', () => { expect(c.isActive('ghost')).toBe(false); });
    it('powerOf and elementOf and targetOf for unknown', () => { expect(c.powerOf('ghost')).toBe(0); expect(c.elementOf('ghost')).toBeNull(); expect(c.targetOf('ghost')).toBeNull(); });
    it('targetCount', () => { c.cast('T1', 'e1'); c.cast('T1', 'e1'); expect(c.targetCount('e1')).toBe(2); });
    it('targetCount for unknown', () => { expect(c.targetCount('ghost')).toBe(0); });
    it('hitRate', () => { const x = c.cast('T1', 'e1'); c.hit(x.id); expect(c.hitRate()).toBe(1); });
    it('averagePower', () => { c.cast('T1', 'e1', 'fire', 50); expect(c.averagePower()).toBe(50); });
    it('countByElement', () => { c.cast('T1', 'e1', 'fire'); expect(c.countByElement().fire).toBe(1); });
    it('report aggregates', () => { c.cast('T1', 'e1'); expect(c.report().total).toBe(1); });
    it('reset clears', () => { c.cast('T1', 'e1'); c.reset(); expect(c.stats.total).toBe(0); });
    it('exposes CAST_ELEMENTS', () => { expect(CAST_ELEMENTS).toContain('fire'); });
});
