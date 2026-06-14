import { describe, it, expect, beforeEach } from 'vitest';
import { ManaScribe, SCRIBE_MATERIALS } from '../../../systems/fulu/ManaScribe.js';

describe('ManaScribe', () => {
    let s;
    beforeEach(() => { s = new ManaScribe(); });
    it('initializes with defaults', () => { expect(s.stats.total).toBe(0); });
    it('scribe', () => { expect(s.scribe('A1')).not.toBeNull(); });
    it('scribe rejects missing', () => { expect(s.scribe('')).toBeNull(); });
    it('scribe normalizes invalid material', () => { const x = s.scribe('A1', 'invalid'); expect(x.material).toBe('paper'); });
    it('get returns null for unknown', () => { expect(s.get('ghost')).toBeNull(); });
    it('listAll and listByStatus and listByMaterial and listCompleted', () => {
        s.scribe('A1');
        s.scribe('B1', 'crystal');
        expect(s.listAll().length).toBe(2);
        expect(s.listByStatus('drafting').length).toBe(2);
        expect(s.listByMaterial('crystal').length).toBe(1);
    });
    it('setStatus', () => { const x = s.scribe('A1'); expect(s.setStatus(x.id, 'inscribing')).toBe(true); });
    it('setStatus rejects invalid', () => { const x = s.scribe('A1'); expect(s.setStatus(x.id, 'invalid')).toBe(false); });
    it('setStatus returns false for unknown', () => { expect(s.setStatus('ghost', 'inscribing')).toBe(false); });
    it('inscribe and complete and fail and erase', () => { const x = s.scribe('A1'); s.inscribe(x.id); s.complete(x.id); expect(s.isCompleted(x.id)).toBe(true); const y = s.scribe('B1'); s.fail(y.id); const z = s.scribe('C1'); s.erase(z.id); expect(s.isErased(z.id)).toBe(true); });
    it('setPower and setMana', () => { const x = s.scribe('A1'); s.setPower(x.id, 50); s.setMana(x.id, 20); expect(x.power).toBe(50); expect(x.mana).toBe(20); });
    it('setPower clamps', () => { const x = s.scribe('A1'); s.setPower(x.id, -5); expect(x.power).toBe(0); });
    it('setPower and setMana return false for unknown', () => { expect(s.setPower('ghost', 50)).toBe(false); expect(s.setMana('ghost', 20)).toBe(false); });
    it('setMaterial', () => { const x = s.scribe('A1'); expect(s.setMaterial(x.id, 'crystal')).toBe(true); });
    it('setMaterial rejects invalid', () => { const x = s.scribe('A1'); expect(s.setMaterial(x.id, 'invalid')).toBe(false); });
    it('setMaterial returns false for unknown', () => { expect(s.setMaterial('ghost', 'crystal')).toBe(false); });
    it('isCompleted and isFailed and isErased and isInscribing', () => { const x = s.scribe('A1'); s.inscribe(x.id); expect(s.isInscribing(x.id)).toBe(true); });
    it('isCompleted for unknown', () => { expect(s.isCompleted('ghost')).toBe(false); });
    it('powerOf and manaOf and materialOf for unknown', () => { expect(s.powerOf('ghost')).toBe(0); expect(s.manaOf('ghost')).toBe(0); expect(s.materialOf('ghost')).toBeNull(); });
    it('averagePower', () => { s.scribe('A1', 'paper', 50); expect(s.averagePower()).toBe(50); });
    it('best', () => { s.scribe('A1', 'paper', 50); s.scribe('B1', 'paper', 100); expect(s.best().power).toBe(100); });
    it('best null for empty', () => { expect(s.best()).toBeNull(); });
    it('countByMaterial', () => { s.scribe('A1', 'crystal'); expect(s.countByMaterial().crystal).toBe(1); });
    it('report aggregates', () => { s.scribe('A1'); expect(s.report().total).toBe(1); });
    it('reset clears', () => { s.scribe('A1'); s.reset(); expect(s.stats.total).toBe(0); });
    it('exposes SCRIBE_MATERIALS', () => { expect(SCRIBE_MATERIALS).toContain('paper'); });
});
