import { describe, it, expect, beforeEach } from 'vitest';
import { ArrayActivator, ACTIVATE_TRIGGERS } from '../../../systems/fulu/ArrayActivator.js';

describe('ArrayActivator', () => {
    let a;
    beforeEach(() => { a = new ArrayActivator(); });
    it('initializes with defaults', () => { expect(a.stats.total).toBe(0); });
    it('arm', () => { expect(a.arm('A1')).not.toBeNull(); });
    it('arm rejects missing', () => { expect(a.arm('')).toBeNull(); });
    it('arm normalizes invalid trigger', () => { const x = a.arm('A1', 'invalid'); expect(x.trigger).toBe('command'); });
    it('get returns null for unknown', () => { expect(a.get('ghost')).toBeNull(); });
    it('listAll and listByArray and listByStatus and listByTrigger and listActive', () => {
        a.arm('A1');
        a.arm('A1', 'time');
        a.arm('A2');
        expect(a.listAll().length).toBe(3);
        expect(a.listByArray('A1').length).toBe(2);
        expect(a.listByStatus('dormant').length).toBe(3);
    });
    it('setStatus', () => { const x = a.arm('A1'); expect(a.setStatus(x.id, 'active')).toBe(true); });
    it('setStatus rejects invalid', () => { const x = a.arm('A1'); expect(a.setStatus(x.id, 'invalid')).toBe(false); });
    it('setStatus returns false for unknown', () => { expect(a.setStatus('ghost', 'active')).toBe(false); });
    it('prime and activate and cool and expire and overload', () => { const x = a.arm('A1'); a.prime(x.id); a.activate(x.id); a.cool(x.id); a.expire(x.id); expect(a.isExpired(x.id)).toBe(true); const y = a.arm('A2'); a.overload(y.id); expect(a.isOverload(y.id)).toBe(true); });
    it('setPower and setTrigger', () => { const x = a.arm('A1'); a.setPower(x.id, 50); a.setTrigger(x.id, 'time'); expect(x.power).toBe(50); expect(x.trigger).toBe('time'); });
    it('setTrigger rejects invalid', () => { const x = a.arm('A1'); expect(a.setTrigger(x.id, 'invalid')).toBe(false); });
    it('setPower and setTrigger return false for unknown', () => { expect(a.setPower('ghost', 50)).toBe(false); expect(a.setTrigger('ghost', 'time')).toBe(false); });
    it('isDormant and isActive and isOverload and isExpired', () => { const x = a.arm('A1'); expect(a.isDormant(x.id)).toBe(true); });
    it('isDormant for unknown', () => { expect(a.isDormant('ghost')).toBe(false); });
    it('powerOf and triggerOf for unknown', () => { expect(a.powerOf('ghost')).toBe(0); expect(a.triggerOf('ghost')).toBeNull(); });
    it('arrayCount', () => { a.arm('A1'); expect(a.arrayCount('A1')).toBe(1); });
    it('arrayCount for unknown', () => { expect(a.arrayCount('ghost')).toBe(0); });
    it('activeCount and averagePower', () => { a.arm('A1'); expect(a.activeCount()).toBe(0); expect(a.averagePower()).toBe(1); });
    it('countByStatus', () => { a.arm('A1'); expect(a.countByStatus().dormant).toBe(1); });
    it('report aggregates', () => { a.arm('A1'); expect(a.report().total).toBe(1); });
    it('reset clears', () => { a.arm('A1'); a.reset(); expect(a.stats.total).toBe(0); });
    it('exposes ACTIVATE_TRIGGERS', () => { expect(ACTIVATE_TRIGGERS).toContain('command'); });
});
