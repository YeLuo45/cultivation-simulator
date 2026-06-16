import { describe, it, expect, beforeEach } from 'vitest';
import { TalismanActivator, ACTIVATION_TRIGGERS } from '../../../systems/fulu/TalismanActivator.js';

describe('TalismanActivator', () => {
    let a;
    beforeEach(() => { a = new TalismanActivator(); });
    it('initializes with defaults', () => { expect(a.stats.total).toBe(0); });
    it('arm', () => { expect(a.arm('T1')).not.toBeNull(); });
    it('arm rejects missing', () => { expect(a.arm('')).toBeNull(); });
    it('arm normalizes invalid trigger', () => { const x = a.arm('T1', 'invalid'); expect(x.trigger).toBe('touch'); });
    it('get returns null for unknown', () => { expect(a.get('ghost')).toBeNull(); });
    it('listAll and listByTalisman and listByStatus and listByTrigger and listDormant and listActive', () => {
        a.arm('T1');
        a.arm('T1', 'time');
        a.arm('T2');
        expect(a.listAll().length).toBe(3);
        expect(a.listByTalisman('T1').length).toBe(2);
        expect(a.listByStatus('dormant').length).toBe(3);
    });
    it('setStatus', () => { const x = a.arm('T1'); expect(a.setStatus(x.id, 'active')).toBe(true); });
    it('setStatus rejects invalid', () => { const x = a.arm('T1'); expect(a.setStatus(x.id, 'invalid')).toBe(false); });
    it('setStatus returns false for unknown', () => { expect(a.setStatus('ghost', 'active')).toBe(false); });
    it('prime and activate and cool and exhaust', () => { const x = a.arm('T1'); a.prime(x.id); a.activate(x.id); a.cool(x.id); a.exhaust(x.id); expect(a.isExhausted(x.id)).toBe(true); });
    it('setPower and setTrigger', () => { const x = a.arm('T1'); a.setPower(x.id, 50); a.setTrigger(x.id, 'time'); expect(x.power).toBe(50); expect(x.trigger).toBe('time'); });
    it('setTrigger rejects invalid', () => { const x = a.arm('T1'); expect(a.setTrigger(x.id, 'invalid')).toBe(false); });
    it('setPower and setTrigger return false for unknown', () => { expect(a.setPower('ghost', 50)).toBe(false); expect(a.setTrigger('ghost', 'time')).toBe(false); });
    it('isDormant and isActive and isPriming and isCooling and isExhausted', () => { const x = a.arm('T1'); a.prime(x.id); expect(a.isPriming(x.id)).toBe(true); });
    it('isDormant for unknown', () => { expect(a.isDormant('ghost')).toBe(false); });
    it('powerOf and triggerOf for unknown', () => { expect(a.powerOf('ghost')).toBe(0); expect(a.triggerOf('ghost')).toBeNull(); });
    it('talismanCount', () => { a.arm('T1'); expect(a.talismanCount('T1')).toBe(1); });
    it('talismanCount for unknown', () => { expect(a.talismanCount('ghost')).toBe(0); });
    it('activeCount and averagePower', () => { a.arm('T1'); a.activate(a.listAll()[0].id); expect(a.activeCount()).toBe(1); expect(a.averagePower()).toBe(1); });
    it('bestPower', () => { a.arm('T1', 'touch', 50); expect(a.bestPower().power).toBe(50); });
    it('bestPower null for empty', () => { expect(a.bestPower()).toBeNull(); });
    it('countByStatus', () => { a.arm('T1'); expect(a.countByStatus().dormant).toBe(1); });
    it('report aggregates', () => { a.arm('T1'); expect(a.report().total).toBe(1); });
    it('reset clears', () => { a.arm('T1'); a.reset(); expect(a.stats.total).toBe(0); });
    it('exposes ACTIVATION_TRIGGERS', () => { expect(ACTIVATION_TRIGGERS).toContain('touch'); });
});
