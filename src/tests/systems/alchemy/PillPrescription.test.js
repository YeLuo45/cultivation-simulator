import { describe, it, expect, beforeEach } from 'vitest';
import { PillPrescription, PRESCRIPTION_STATUS } from '../../../systems/alchemy/PillPrescription.js';

describe('PillPrescription', () => {
    let p;
    beforeEach(() => { p = new PillPrescription(); });
    it('initializes with defaults', () => { expect(p.stats.total).toBe(0); });
    it('prescribe', () => { expect(p.prescribe('p1', 'pill1', 1, 2)).not.toBeNull(); });
    it('prescribe rejects missing', () => { expect(p.prescribe('', 'pill1')).toBeNull(); expect(p.prescribe('p1', '')).toBeNull(); });
    it('prescribe rejects non-positive dosage', () => { expect(p.prescribe('p1', 'pill1', 0)).toBeNull(); });
    it('prescribe rejects non-positive frequency', () => { expect(p.prescribe('p1', 'pill1', 1, 0)).toBeNull(); });
    it('get returns null for unknown', () => { expect(p.get('ghost')).toBeNull(); });
    it('listAll and listByPatient and listByPill and listByStatus', () => {
        p.prescribe('p1', 'pill1');
        p.prescribe('p1', 'pill2');
        p.prescribe('p2', 'pill1');
        expect(p.listAll().length).toBe(3);
        expect(p.listByPatient('p1').length).toBe(2);
        expect(p.listByPill('pill1').length).toBe(2);
        expect(p.listByStatus('active').length).toBe(3);
    });
    it('pause and resume', () => { const x = p.prescribe('p1', 'pill1'); expect(p.pause(x.id)).toBe(true); expect(p.resume(x.id)).toBe(true); });
    it('pause returns false for unknown', () => { expect(p.pause('ghost')).toBe(false); });
    it('complete and abandon', () => { const x = p.prescribe('p1', 'pill1'); expect(p.complete(x.id)).toBe(true); const y = p.prescribe('p1', 'pill2'); expect(p.abandon(y.id)).toBe(true); });
    it('complete and abandon return false for unknown', () => { expect(p.complete('ghost')).toBe(false); expect(p.abandon('ghost')).toBe(false); });
    it('setDosage and setFrequency', () => { const x = p.prescribe('p1', 'pill1'); p.setDosage(x.id, 3); p.setFrequency(x.id, 2); expect(p.get(x.id).dosage).toBe(3); });
    it('setDosage returns false for unknown', () => { expect(p.setDosage('ghost', 3)).toBe(false); });
    it('setFrequency returns false for unknown', () => { expect(p.setFrequency('ghost', 3)).toBe(false); });
    it('isActive and isCompleted', () => { const x = p.prescribe('p1', 'pill1'); expect(p.isActive(x.id)).toBe(true); p.complete(x.id); expect(p.isCompleted(x.id)).toBe(true); });
    it('activeFor and patientCount', () => { p.prescribe('p1', 'pill1'); p.prescribe('p1', 'pill2'); p.complete(p.listByPatient('p1')[0].id); expect(p.activeFor('p1').length).toBe(1); expect(p.patientCount('p1')).toBe(2); });
    it('dailyDose', () => { p.prescribe('p1', 'pill1', 2, 3); p.prescribe('p1', 'pill2', 1, 2); expect(p.dailyDose('p1')).toBe(8); });
    it('dailyDose for no active', () => { expect(p.dailyDose('p1')).toBe(0); });
    it('report aggregates', () => { p.prescribe('p1', 'pill1'); expect(p.report().total).toBe(1); });
    it('reset clears', () => { p.prescribe('p1', 'pill1'); p.reset(); expect(p.stats.total).toBe(0); });
    it('exposes PRESCRIPTION_STATUS', () => { expect(PRESCRIPTION_STATUS).toContain('active'); });
});
