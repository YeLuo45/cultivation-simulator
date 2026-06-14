import { describe, it, expect, beforeEach } from 'vitest';
import { ArrayPlacer, PLACE_POSITIONS } from '../../../systems/fulu/ArrayPlacer.js';

describe('ArrayPlacer', () => {
    let p;
    beforeEach(() => { p = new ArrayPlacer(); });
    it('initializes with defaults', () => { expect(p.stats.total).toBe(0); });
    it('plan', () => { expect(p.plan('A1', ['north', 'south'])).not.toBeNull(); });
    it('plan rejects missing', () => { expect(p.plan('', ['north'])).toBeNull(); });
    it('plan normalizes non-array positions', () => { const x = p.plan('A1', 'not array'); expect(x.positions).toEqual([]); });
    it('get returns null for unknown', () => { expect(p.get('ghost')).toBeNull(); });
    it('listAll and listByArray and listByOwner and listByStatus and listActive', () => {
        p.plan('A1', ['north']);
        p.plan('A1', ['south'], 'p1');
        p.plan('A2');
        expect(p.listAll().length).toBe(3);
        expect(p.listByArray('A1').length).toBe(2);
        expect(p.listByOwner('p1').length).toBe(1);
        expect(p.listByStatus('planning').length).toBe(3);
    });
    it('setStatus', () => { const x = p.plan('A1'); expect(p.setStatus(x.id, 'placing')).toBe(true); });
    it('setStatus rejects invalid', () => { const x = p.plan('A1'); expect(p.setStatus(x.id, 'invalid')).toBe(false); });
    it('setStatus returns false for unknown', () => { expect(p.setStatus('ghost', 'placing')).toBe(false); });
    it('startPlacing and align and complete and disrupt', () => { const x = p.plan('A1'); p.startPlacing(x.id); p.align(x.id); p.complete(x.id); expect(p.isCompleted(x.id)).toBe(true); const y = p.plan('A2'); p.disrupt(y.id); expect(p.isDisrupted(y.id)).toBe(true); });
    it('addPosition', () => { const x = p.plan('A1', []); expect(p.addPosition(x.id, 'north')).toBe(true); });
    it('addPosition rejects invalid', () => { const x = p.plan('A1', []); expect(p.addPosition(x.id, 'invalid')).toBe(false); });
    it('addPosition returns false for unknown', () => { expect(p.addPosition('ghost', 'north')).toBe(false); });
    it('isActive and isCompleted and isDisrupted', () => { const x = p.plan('A1'); p.startPlacing(x.id); expect(p.isActive(x.id)).toBe(true); });
    it('isCompleted for unknown', () => { expect(p.isCompleted('ghost')).toBe(false); });
    it('positionCount and positionsOf for unknown', () => { expect(p.positionCount('ghost')).toBe(0); expect(p.positionsOf('ghost')).toEqual([]); });
    it('arrayCount', () => { p.plan('A1'); p.plan('A1'); expect(p.arrayCount('A1')).toBe(2); });
    it('arrayCount for unknown', () => { expect(p.arrayCount('ghost')).toBe(0); });
    it('completionRate', () => { const x = p.plan('A1'); p.complete(x.id); expect(p.completionRate()).toBe(1); });
    it('averagePositions', () => { p.plan('A1', ['north', 'south']); expect(p.averagePositions()).toBe(2); });
    it('countByStatus', () => { p.plan('A1'); expect(p.countByStatus().planning).toBe(1); });
    it('report aggregates', () => { p.plan('A1'); expect(p.report().total).toBe(1); });
    it('reset clears', () => { p.plan('A1'); p.reset(); expect(p.stats.total).toBe(0); });
    it('exposes PLACE_POSITIONS', () => { expect(PLACE_POSITIONS).toContain('north'); });
});
