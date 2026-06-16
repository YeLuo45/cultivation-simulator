import { describe, it, expect, beforeEach } from 'vitest';
import { DistillationApparatus, DISTILL_PHASES } from '../../../systems/alchemy/DistillationApparatus.js';

describe('DistillationApparatus', () => {
    let a;
    beforeEach(() => { a = new DistillationApparatus(); });
    it('initializes with defaults', () => { expect(a.stats.total).toBe(0); });
    it('start', () => { expect(a.start('input1')).not.toBeNull(); });
    it('start rejects missing', () => { expect(a.start('')).toBeNull(); });
    it('get returns null for unknown', () => { expect(a.get('ghost')).toBeNull(); });
    it('listAll and listByPhase and listByQuality', () => {
        const x = a.start('input1');
        expect(a.listAll().length).toBe(1);
        expect(a.listByPhase('input').length).toBe(1);
    });
    it('setPhase', () => { const x = a.start('input1'); expect(a.setPhase(x.id, 'heating')).toBe(true); });
    it('setPhase rejects invalid', () => { const x = a.start('input1'); expect(a.setPhase(x.id, 'invalid')).toBe(false); });
    it('setPhase returns false for unknown', () => { expect(a.setPhase('ghost', 'heating')).toBe(false); });
    it('setYield', () => { const x = a.start('input1'); a.setYield(x.id, 50); expect(a.get(x.id).yield).toBe(50); });
    it('setYield clamps to 0', () => { const x = a.start('input1'); a.setYield(x.id, -10); expect(a.get(x.id).yield).toBe(0); });
    it('setYield returns false for unknown', () => { expect(a.setYield('ghost', 50)).toBe(false); });
    it('setQuality', () => { const x = a.start('input1'); a.setQuality(x.id, 'pure'); expect(a.get(x.id).quality).toBe('pure'); });
    it('setQuality rejects invalid', () => { const x = a.start('input1'); expect(a.setQuality(x.id, 'invalid')).toBe(false); });
    it('setQuality returns false for unknown', () => { expect(a.setQuality('ghost', 'pure')).toBe(false); });
    it('finish', () => { const x = a.start('input1'); expect(a.finish(x.id, 'output')).toBe(true); });
    it('finish returns false for unknown', () => { expect(a.finish('ghost', 'out')).toBe(false); });
    it('cancel', () => { const x = a.start('input1'); expect(a.cancel(x.id)).toBe(true); });
    it('cancel returns false for unknown', () => { expect(a.cancel('ghost')).toBe(false); });
    it('isComplete and isPure', () => { const x = a.start('input1'); a.setQuality(x.id, 'pure'); a.finish(x.id, 'out'); expect(a.isComplete(x.id)).toBe(true); expect(a.isPure(x.id)).toBe(true); });
    it('averageYield', () => { const x = a.start('input1'); a.setYield(x.id, 50); expect(a.averageYield()).toBe(50); });
    it('yieldOf', () => { const x = a.start('input1'); a.setYield(x.id, 100); expect(a.yieldOf(x.id)).toBe(100); });
    it('yieldOf for unknown', () => { expect(a.yieldOf('ghost')).toBe(0); });
    it('listByQuality', () => { const x = a.start('input1'); a.setQuality(x.id, 'pure'); expect(a.listByQuality('pure').length).toBe(1); });
    it('report aggregates', () => { a.start('input1'); expect(a.report().total).toBe(1); });
    it('reset clears', () => { a.start('input1'); a.reset(); expect(a.stats.total).toBe(0); });
    it('exposes DISTILL_PHASES', () => { expect(DISTILL_PHASES).toContain('input'); });
});
