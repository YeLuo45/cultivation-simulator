import { describe, it, expect, beforeEach } from 'vitest';
import { SchedulePlanner, SCHEDULE_STATUS } from '../../../systems/arena/SchedulePlanner.js';

describe('SchedulePlanner', () => {
    let p;
    beforeEach(() => { p = new SchedulePlanner(); });
    it('initializes with defaults', () => { expect(p.stats.total).toBe(0); });
    it('create with title', () => { expect(p.create('Season 1')).not.toBeNull(); });
    it('create with matches', () => { expect(p.create('S1', [{ id: 'm1' }])).not.toBeNull(); });
    it('create rejects missing title', () => { expect(p.create('')).toBeNull(); });
    it('get returns null for unknown', () => { expect(p.get('ghost')).toBeNull(); });
    it('listAll and listByStatus', () => { p.create('S1'); expect(p.listAll().length).toBe(1); expect(p.listByStatus('draft').length).toBe(1); });
    it('listByMatch', () => {
        const x = p.create('S1', [{ id: 'm1' }]);
        expect(p.listByMatch('m1').id).toBe(x.id);
    });
    it('listByMatch for unknown', () => { expect(p.listByMatch('ghost')).toBeNull(); });
    it('confirm', () => { const x = p.create('S1'); expect(p.confirm(x.id)).toBe(true); });
    it('confirm fails for non-draft', () => { const x = p.create('S1'); p.confirm(x.id); expect(p.confirm(x.id)).toBe(false); });
    it('start', () => { const x = p.create('S1'); p.confirm(x.id); expect(p.start(x.id)).toBe(true); });
    it('start fails for non-confirmed', () => { const x = p.create('S1'); expect(p.start(x.id)).toBe(false); });
    it('complete', () => { const x = p.create('S1'); expect(p.complete(x.id)).toBe(true); });
    it('cancel', () => { const x = p.create('S1'); expect(p.cancel(x.id, 'test')).toBe(true); });
    it('cancel returns false for unknown', () => { expect(p.cancel('ghost')).toBe(false); });
    it('addMatch and removeMatch', () => {
        const x = p.create('S1');
        p.addMatch(x.id, { id: 'm1' });
        expect(p.removeMatch('m1')).toBe(true);
    });
    it('addMatch returns false for unknown', () => { expect(p.addMatch('ghost', { id: 'm1' })).toBe(false); });
    it('updateMatchStatus', () => {
        const x = p.create('S1', [{ id: 'm1' }]);
        expect(p.updateMatchStatus('m1', 'completed')).toBe(true);
    });
    it('updateMatchStatus for unknown', () => { expect(p.updateMatchStatus('ghost', 'x')).toBe(false); });
    it('isMatchScheduled', () => { p.create('S1', [{ id: 'm1' }]); expect(p.isMatchScheduled('m1')).toBe(true); expect(p.isMatchScheduled('ghost')).toBe(false); });
    it('progress', () => { const x = p.create('S1', [{ id: 'm1' }, { id: 'm2' }]); p.updateMatchStatus('m1', 'completed'); expect(p.progress(x.id)).toBe(0.5); });
    it('progress for empty', () => { const x = p.create('S1'); expect(p.progress(x.id)).toBe(0); });
    it('nextMatch', () => { p.create('S1', [{ id: 'm1' }, { id: 'm2' }]); expect(p.nextMatch(p.listAll()[0].id)).not.toBeNull(); });
    it('nextMatch for unknown', () => { expect(p.nextMatch('ghost')).toBeNull(); });
    it('report aggregates', () => { p.create('S1'); expect(p.report().total).toBe(1); });
    it('reset clears', () => { p.create('S1'); p.reset(); expect(p.stats.total).toBe(0); });
    it('exposes SCHEDULE_STATUS', () => { expect(SCHEDULE_STATUS).toContain('draft'); });
});
