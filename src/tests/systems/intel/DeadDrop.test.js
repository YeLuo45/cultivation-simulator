import { describe, it, expect, beforeEach } from 'vitest';
import { DeadDrop, DROP_STATUS } from '../../../systems/intel/DeadDrop.js';

describe('DeadDrop', () => {
    let d;
    beforeEach(() => { d = new DeadDrop(); });
    it('initializes with defaults', () => { expect(d.stats.total).toBe(0); });
    it('create', () => { expect(d.create('Park')).not.toBeNull(); });
    it('create rejects missing', () => { expect(d.create('')).toBeNull(); });
    it('get returns null for unknown', () => { expect(d.get('ghost')).toBeNull(); });
    it('listAll and listByStatus and listActive', () => {
        d.create('A');
        d.create('B');
        expect(d.listAll().length).toBe(2);
        expect(d.listByStatus('active').length).toBe(2);
    });
    it('place', () => { const x = d.create('A'); expect(d.place(x.id, 'item1')).toBe(true); });
    it('place rejects non-active', () => { const x = d.create('A'); d.seal(x.id); expect(d.place(x.id, 'a')).toBe(false); });
    it('place rejects full', () => { const x = d.create('A', 1); d.place(x.id, 'a'); expect(d.place(x.id, 'b')).toBe(false); });
    it('place returns false for unknown', () => { expect(d.place('ghost', 'a')).toBe(false); });
    it('retrieve', () => { const x = d.create('A'); d.place(x.id, 'item1'); expect(d.retrieve(x.id)).toEqual(['item1']); });
    it('retrieve returns null for non-active', () => { const x = d.create('A'); expect(d.retrieve(x.id)).toBeNull(); });
    it('retrieve returns null for empty', () => { const x = d.create('A'); expect(d.retrieve(x.id)).toBeNull(); });
    it('retrieve returns null for unknown', () => { expect(d.retrieve('ghost')).toBeNull(); });
    it('setStatus', () => { const x = d.create('A'); expect(d.setStatus(x.id, 'sealed')).toBe(true); });
    it('setStatus rejects invalid', () => { const x = d.create('A'); expect(d.setStatus(x.id, 'invalid')).toBe(false); });
    it('setStatus returns false for unknown', () => { expect(d.setStatus('ghost', 'active')).toBe(false); });
    it('seal and discover and compromise', () => { const x = d.create('A'); d.seal(x.id); d.discover(x.id); d.compromise(x.id); expect(x.status).toBe('compromised'); });
    it('isActive and isFull and isEmpty', () => { const x = d.create('A', 2); expect(d.isActive(x.id)).toBe(true); expect(d.isEmpty(x.id)).toBe(true); d.place(x.id, 'a'); expect(d.isFull(x.id)).toBe(false); });
    it('isActive for unknown', () => { expect(d.isActive('ghost')).toBe(false); });
    it('isEmpty and isFull for unknown', () => { expect(d.isEmpty('ghost')).toBe(true); expect(d.isFull('ghost')).toBe(false); });
    it('itemCount and capacityOf and contents', () => { const x = d.create('A', 3); d.place(x.id, 'a'); expect(d.itemCount(x.id)).toBe(1); expect(d.capacityOf(x.id)).toBe(3); expect(d.contents(x.id).length).toBe(1); });
    it('itemCount for unknown', () => { expect(d.itemCount('ghost')).toBe(0); });
    it('capacityOf for unknown', () => { expect(d.capacityOf('ghost')).toBe(0); });
    it('averageFill', () => { d.create('A', 2); expect(d.averageFill()).toBe(0); });
    it('report aggregates', () => { d.create('A'); expect(d.report().total).toBe(1); });
    it('reset clears', () => { d.create('A'); d.reset(); expect(d.stats.total).toBe(0); });
    it('exposes DROP_STATUS', () => { expect(DROP_STATUS).toContain('active'); });
});
