import { describe, it, expect, beforeEach } from 'vitest';
import { SealBreaker, BREAK_METHODS } from '../../../systems/fulu/SealBreaker.js';

describe('SealBreaker', () => {
    let b;
    beforeEach(() => { b = new SealBreaker(); });
    it('initializes with defaults', () => { expect(b.stats.total).toBe(0); });
    it('start', () => { expect(b.start('S1')).not.toBeNull(); });
    it('start rejects missing', () => { expect(b.start('')).toBeNull(); });
    it('start normalizes invalid method', () => { const x = b.start('S1', 'invalid'); expect(x.method).toBe('overwhelming_force'); });
    it('get returns null for unknown', () => { expect(b.get('ghost')).toBeNull(); });
    it('listAll and listBySeal and listByStatus and listByMethod and listActive', () => {
        b.start('S1');
        b.start('S1', 'counter_seal');
        b.start('S2');
        expect(b.listAll().length).toBe(3);
        expect(b.listBySeal('S1').length).toBe(2);
        expect(b.listByStatus('analyzing').length).toBe(3);
    });
    it('setStatus', () => { const x = b.start('S1'); expect(b.setStatus(x.id, 'weakening')).toBe(true); });
    it('setStatus rejects invalid', () => { const x = b.start('S1'); expect(b.setStatus(x.id, 'invalid')).toBe(false); });
    it('setStatus returns false for unknown', () => { expect(b.setStatus('ghost', 'weakening')).toBe(false); });
    it('weaken and breaking and succeed and fail and backlash', () => { const x = b.start('S1'); b.weaken(x.id); b.breaking(x.id); b.succeed(x.id); expect(b.isBroken(x.id)).toBe(true); const y = b.start('S2'); b.fail(y.id); const z = b.start('S3'); b.backlash(z.id); expect(b.isBacklash(z.id)).toBe(true); });
    it('setMethod and setPower', () => { const x = b.start('S1'); b.setMethod(x.id, 'time_decay'); b.setPower(x.id, 50); expect(x.method).toBe('time_decay'); expect(x.power).toBe(50); });
    it('setMethod rejects invalid', () => { const x = b.start('S1'); expect(b.setMethod(x.id, 'invalid')).toBe(false); });
    it('setMethod and setPower return false for unknown', () => { expect(b.setMethod('ghost', 'time_decay')).toBe(false); expect(b.setPower('ghost', 50)).toBe(false); });
    it('isActive and isBroken and isFailed and isBacklash', () => { const x = b.start('S1'); expect(b.isActive(x.id)).toBe(true); });
    it('isBroken for unknown', () => { expect(b.isBroken('ghost')).toBe(false); });
    it('powerOf and methodOf for unknown', () => { expect(b.powerOf('ghost')).toBe(0); expect(b.methodOf('ghost')).toBeNull(); });
    it('duration for unknown', () => { expect(b.duration('ghost')).toBe(0); });
    it('successRate', () => { const x = b.start('S1'); b.succeed(x.id); expect(b.successRate()).toBe(1); });
    it('sealCount', () => { b.start('S1'); b.start('S1'); expect(b.sealCount('S1')).toBe(2); });
    it('sealCount for unknown', () => { expect(b.sealCount('ghost')).toBe(0); });
    it('averagePower', () => { b.start('S1', 'overwhelming_force', 50); expect(b.averagePower()).toBe(50); });
    it('countByMethod', () => { b.start('S1', 'time_decay'); expect(b.countByMethod().time_decay).toBe(1); });
    it('report aggregates', () => { b.start('S1'); expect(b.report().total).toBe(1); });
    it('reset clears', () => { b.start('S1'); b.reset(); expect(b.stats.total).toBe(0); });
    it('exposes BREAK_METHODS', () => { expect(BREAK_METHODS).toContain('overwhelming_force'); });
});
