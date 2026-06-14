import { describe, it, expect, beforeEach } from 'vitest';
import { RumorCollector, RUMOR_TYPES } from '../../../systems/intel/RumorCollector.js';

describe('RumorCollector', () => {
    let r;
    beforeEach(() => { r = new RumorCollector(); });
    it('initializes with defaults', () => { expect(r.stats.total).toBe(0); });
    it('collect', () => { expect(r.collect('gossip', 'content')).not.toBeNull(); });
    it('collect rejects missing content', () => { expect(r.collect('gossip', '')).toBeNull(); });
    it('collect normalizes invalid type', () => { const x = r.collect('invalid', 'c'); expect(x.type).toBe('gossip'); });
    it('get returns null for unknown', () => { expect(r.get('ghost')).toBeNull(); });
    it('listAll and listByType and listByVerification and listBySource', () => {
        r.collect('gossip', 'a');
        r.collect('warning', 'b');
        expect(r.listAll().length).toBe(2);
        expect(r.listByType('gossip').length).toBe(1);
        expect(r.listByVerification('unverified').length).toBe(2);
    });
    it('verify', () => { const x = r.collect('gossip', 'c'); expect(r.verify(x.id, 'confirmed')).toBe(true); });
    it('verify rejects invalid', () => { const x = r.collect('gossip', 'c'); expect(r.verify(x.id, 'invalid')).toBe(false); });
    it('verify returns false for unknown', () => { expect(r.verify('ghost', 'confirmed')).toBe(false); });
    it('isConfirmed and isFalse', () => {
        const x = r.collect('gossip', 'c');
        r.confirm(x.id);
        expect(r.isConfirmed(x.id)).toBe(true);
    });
    it('markFalse', () => { const x = r.collect('gossip', 'c'); expect(r.markFalse(x.id)).toBe(true); expect(r.isFalse(x.id)).toBe(true); });
    it('isFalse for unknown', () => { expect(r.isFalse('ghost')).toBe(false); });
    it('isConfirmed for unknown', () => { expect(r.isConfirmed('ghost')).toBe(false); });
    it('countByType and countByVerification', () => {
        r.collect('gossip', 'a');
        r.collect('warning', 'b');
        expect(r.countByType().gossip).toBe(1);
    });
    it('countByVerification', () => { r.collect('gossip', 'a'); expect(r.countByVerification().unverified).toBe(1); });
    it('recent', () => { r.collect('gossip', 'a'); r.collect('warning', 'b'); expect(r.recent().length).toBe(2); });
    it('averageCredibility', () => { r.collect('gossip', 'a'); r.collect('warning', 'b'); expect(r.averageCredibility()).toBeGreaterThan(0); });
    it('listBySource', () => { r.collect('gossip', 'a', 'src1'); r.collect('warning', 'b', 'src1'); expect(r.listBySource('src1').length).toBe(2); });
    it('report aggregates', () => { r.collect('gossip', 'a'); expect(r.report().total).toBe(1); });
    it('reset clears', () => { r.collect('gossip', 'a'); r.reset(); expect(r.stats.total).toBe(0); });
    it('exposes RUMOR_TYPES', () => { expect(RUMOR_TYPES).toContain('gossip'); });
});
