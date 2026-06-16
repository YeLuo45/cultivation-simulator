import { describe, it, expect, beforeEach } from 'vitest';
import { Disinformation, DISINFO_AUDIENCE } from '../../../systems/intel/Disinformation.js';

describe('Disinformation', () => {
    let d;
    beforeEach(() => { d = new Disinformation(); });
    it('initializes with defaults', () => { expect(d.stats.total).toBe(0); });
    it('create', () => { expect(d.create('content')).not.toBeNull(); });
    it('create rejects missing', () => { expect(d.create('')).toBeNull(); });
    it('create normalizes invalid audience', () => { const x = d.create('c', 'invalid'); expect(x.audience).toBe('public'); });
    it('get returns null for unknown', () => { expect(d.get('ghost')).toBeNull(); });
    it('listAll and listByStatus and listByAudience', () => {
        d.create('a', 'public');
        d.create('b', 'rival');
        expect(d.listAll().length).toBe(2);
        expect(d.listByStatus('drafting').length).toBe(2);
        expect(d.listByAudience('rival').length).toBe(1);
    });
    it('setStatus', () => { const x = d.create('c'); expect(d.setStatus(x.id, 'circulating')).toBe(true); });
    it('setStatus rejects invalid', () => { const x = d.create('c'); expect(d.setStatus(x.id, 'invalid')).toBe(false); });
    it('setStatus returns false for unknown', () => { expect(d.setStatus('ghost', 'circulating')).toBe(false); });
    it('circulate and markBelieved and expose and archive', () => { const x = d.create('c'); d.circulate(x.id); d.markBelieved(x.id); d.expose(x.id); d.archive(x.id); expect(x.status).toBe('archived'); });
    it('spread', () => { const x = d.create('c'); expect(d.spread(x.id, 100)).toBe(true); });
    it('spread rejects non-positive', () => { const x = d.create('c'); expect(d.spread(x.id, 0)).toBe(false); expect(d.spread(x.id, -1)).toBe(false); });
    it('spread returns false for unknown', () => { expect(d.spread('ghost', 100)).toBe(false); });
    it('isBelieved and isExposed and isCirculating', () => { const x = d.create('c'); d.circulate(x.id); expect(d.isCirculating(x.id)).toBe(true); });
    it('isBelieved for unknown', () => { expect(d.isBelieved('ghost')).toBe(false); });
    it('spreadOf', () => { const x = d.create('c'); d.spread(x.id, 50); expect(d.spreadOf(x.id)).toBe(50); });
    it('spreadOf for unknown', () => { expect(d.spreadOf('ghost')).toBe(0); });
    it('believeRate and exposeRate', () => { const x = d.create('c'); d.markBelieved(x.id); expect(d.believeRate()).toBe(1); });
    it('mostSpread', () => { d.create('a'); d.create('b'); d.spread(d.listAll()[1].id, 100); expect(d.mostSpread().spread).toBe(100); });
    it('mostSpread null for empty', () => { expect(d.mostSpread()).toBeNull(); });
    it('report aggregates', () => { d.create('c'); expect(d.report().total).toBe(1); });
    it('reset clears', () => { d.create('c'); d.reset(); expect(d.stats.total).toBe(0); });
    it('exposes DISINFO_AUDIENCE', () => { expect(DISINFO_AUDIENCE).toContain('public'); });
});
