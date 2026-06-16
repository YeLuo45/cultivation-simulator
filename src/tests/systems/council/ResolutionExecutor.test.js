import { describe, it, expect, beforeEach } from 'vitest';
import { ResolutionExecutor, ACTION_TYPES } from '../../../systems/council/ResolutionExecutor.js';

describe('ResolutionExecutor', () => {
    let e;
    beforeEach(() => { e = new ResolutionExecutor(); });
    it('initializes with defaults', () => { expect(e.stats.total).toBe(0); });
    it('execute creates exec', () => {
        const x = e.execute('r1', { type: 'policy_change' });
        expect(x).not.toBeNull();
    });
    it('execute rejects invalid action', () => { expect(e.execute('r1', { type: 'invalid' })).toBeNull(); });
    it('execute rejects missing id', () => { expect(e.execute('', {})).toBeNull(); });
    it('start', () => {
        const x = e.execute('r1', { type: 'policy_change' });
        expect(e.start(x.id)).toBe(true);
    });
    it('start fails for non-pending', () => {
        const x = e.execute('r1', { type: 'policy_change' });
        e.start(x.id);
        expect(e.start(x.id)).toBe(false);
    });
    it('updateProgress', () => {
        const x = e.execute('r1', { type: 'policy_change' });
        expect(e.updateProgress(x.id, 50)).toBe(true);
    });
    it('updateProgress clamps to 0-100', () => {
        const x = e.execute('r1', { type: 'policy_change' });
        e.updateProgress(x.id, 200);
        expect(x.progress).toBe(100);
    });
    it('complete', () => {
        const x = e.execute('r1', { type: 'policy_change' });
        e.start(x.id);
        expect(e.complete(x.id, { ok: true })).toBe(true);
    });
    it('complete fails for completed', () => {
        const x = e.execute('r1', { type: 'policy_change' });
        e.start(x.id);
        e.complete(x.id);
        expect(e.complete(x.id)).toBe(false);
    });
    it('fail', () => {
        const x = e.execute('r1', { type: 'policy_change' });
        e.start(x.id);
        expect(e.fail(x.id, 'oops')).toBe(true);
    });
    it('cancel', () => {
        const x = e.execute('r1', { type: 'policy_change' });
        expect(e.cancel(x.id)).toBe(true);
    });
    it('get returns null for unknown', () => { expect(e.get('ghost')).toBeNull(); });
    it('getByResolution', () => {
        const x = e.execute('r1', { type: 'policy_change' });
        expect(e.getByResolution('r1').id).toBe(x.id);
    });
    it('isComplete/isFailed/isPending/isInProgress', () => {
        const x = e.execute('r1', { type: 'policy_change' });
        e.start(x.id);
        expect(e.isInProgress(x.id)).toBe(true);
    });
    it('listByStatus/queue/active/completed/failed', () => {
        e.execute('r1', { type: 'policy_change' });
        expect(e.queue().length).toBe(1);
    });
    it('report aggregates', () => { e.execute('r1', { type: 'policy_change' }); expect(e.report().total).toBe(1); });
    it('reset clears', () => { e.execute('r1', { type: 'policy_change' }); e.reset(); expect(e.stats.total).toBe(0); });
    it('exposes ACTION_TYPES', () => { expect(ACTION_TYPES).toContain('policy_change'); });
});
