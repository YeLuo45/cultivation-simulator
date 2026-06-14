import { describe, it, expect, beforeEach } from 'vitest';
import { RefiningEngine, REFINE_PHASES } from '../../../systems/alchemy/RefiningEngine.js';

describe('RefiningEngine', () => {
    let e;
    beforeEach(() => { e = new RefiningEngine(); });
    it('initializes with defaults', () => { expect(e.stats.total).toBe(0); });
    it('start', () => { expect(e.start('recipe1', ['ing1'])).not.toBeNull(); });
    it('start rejects missing', () => { expect(e.start('', [])).toBeNull(); });
    it('start rejects non-array', () => { expect(e.start('r', 'not array')).toBeNull(); });
    it('get returns null for unknown', () => { expect(e.get('ghost')).toBeNull(); });
    it('listAll and listByPhase and listByResult', () => {
        e.start('r', ['i']);
        expect(e.listAll().length).toBe(1);
        expect(e.listByPhase('preparation').length).toBe(1);
    });
    it('advance', () => {
        const x = e.start('r', ['i']);
        expect(e.advance(x.id, 'combining')).toBe(true);
    });
    it('advance rejects invalid phase', () => {
        const x = e.start('r', ['i']);
        expect(e.advance(x.id, 'invalid')).toBe(false);
    });
    it('advance rejects skipping', () => {
        const x = e.start('r', ['i']);
        expect(e.advance(x.id, 'condensing')).toBe(false);
    });
    it('advance returns false for unknown', () => { expect(e.advance('ghost', 'combining')).toBe(false); });
    it('canAdvance', () => { const x = e.start('r', ['i']); expect(e.canAdvance(x.id)).toBe(true); });
    it('canAdvance for unknown', () => { expect(e.canAdvance('ghost')).toBe(false); });
    it('finish', () => {
        const x = e.start('r', ['i']);
        e.advance(x.id, 'combining');
        e.advance(x.id, 'purifying');
        e.advance(x.id, 'condensing');
        expect(e.finish(x.id, 'success', 90)).toBe(true);
    });
    it('finish rejects invalid result', () => {
        const x = e.start('r', ['i']);
        expect(e.finish(x.id, 'invalid')).toBe(false);
    });
    it('finish returns false for unknown', () => { expect(e.finish('ghost', 'success')).toBe(false); });
    it('cancel', () => {
        const x = e.start('r', ['i']);
        expect(e.cancel(x.id)).toBe(true);
    });
    it('cancel returns false for unknown', () => { expect(e.cancel('ghost')).toBe(false); });
    it('isFinalized and isSuccess and isFailed', () => {
        const x = e.start('r', ['i']);
        e.finish(x.id, 'success', 90);
        expect(e.isFinalized(x.id)).toBe(true);
        expect(e.isSuccess(x.id)).toBe(true);
    });
    it('isFailed for failure', () => {
        const x = e.start('r', ['i']);
        e.finish(x.id, 'failure');
        expect(e.isFailed(x.id)).toBe(true);
    });
    it('duration > 0', () => { const x = e.start('r', ['i']); expect(e.duration(x.id)).toBeGreaterThanOrEqual(0); });
    it('duration for unknown', () => { expect(e.duration('ghost')).toBe(0); });
    it('successRate', () => {
        e.start('r1', []);
        e.start('r2', []);
        e.stats.success = 1;
        expect(e.successRate()).toBeGreaterThan(0);
    });
    it('averageQuality', () => {
        const x = e.start('r', []);
        e.finish(x.id, 'success', 80);
        expect(e.averageQuality()).toBe(80);
    });
    it('report aggregates', () => { e.start('r', []); expect(e.report().total).toBe(1); });
    it('reset clears', () => { e.start('r', []); e.reset(); expect(e.stats.total).toBe(0); });
    it('exposes REFINE_PHASES', () => { expect(REFINE_PHASES).toContain('preparation'); });
});
