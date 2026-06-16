import { describe, it, expect, beforeEach } from 'vitest';
import { AwakeningTracker, AWAKENING_TYPES } from '../../../systems/shenzhu/AwakeningTracker.js';

describe('AwakeningTracker', () => {
    let t;
    beforeEach(() => { t = new AwakeningTracker(); });
    it('initializes with defaults', () => { expect(t.stats.total).toBe(0); });
    it('begin', () => { expect(t.begin('A')).not.toBeNull(); });
    it('begin rejects missing', () => { expect(t.begin('')).toBeNull(); });
    it('begin normalizes invalid type', () => { const x = t.begin('A', 'invalid'); expect(x.type).toBe('natural'); });
    it('get returns null for unknown', () => { expect(t.get('ghost')).toBeNull(); });
    it('listAll and listByOwner and listByType and listByStatus and listCompleted', () => {
        t.begin('A', 'bloodline');
        t.begin('A', 'natural');
        t.begin('B', 'innate');
        expect(t.listAll().length).toBe(3);
        expect(t.listByOwner('A').length).toBe(2);
        expect(t.listByType('bloodline').length).toBe(1);
        expect(t.listByStatus('awakening').length).toBe(3);
    });
    it('setStatus', () => { const x = t.begin('A'); expect(t.setStatus(x.id, 'awakened')).toBe(true); });
    it('setStatus rejects invalid', () => { const x = t.begin('A'); expect(t.setStatus(x.id, 'invalid')).toBe(false); });
    it('setStatus returns false for unknown', () => { expect(t.setStatus('ghost', 'awakened')).toBe(false); });
    it('complete and transcend', () => { const x = t.begin('A'); t.complete(x.id); t.transcend(t.begin('A').id); });
    it('isAwakened and isTranscended and isDormant', () => { const x = t.begin('A'); t.setStatus(x.id, 'awakened'); expect(t.isAwakened(x.id)).toBe(true); });
    it('isAwakened for unknown', () => { expect(t.isAwakened('ghost')).toBe(false); });
    it('powerOf and typeOf for unknown', () => { expect(t.powerOf('ghost')).toBe(0); expect(t.typeOf('ghost')).toBeNull(); });
    it('duration for not completed', () => { const x = t.begin('A'); expect(t.duration(x.id)).toBe(0); });
    it('duration for unknown', () => { expect(t.duration('ghost')).toBe(0); });
    it('ownerCount and totalPowerFor', () => { t.begin('A', 'bloodline', 2); t.begin('A', 'innate', 3); expect(t.ownerCount('A')).toBe(2); expect(t.totalPowerFor('A')).toBe(5); });
    it('ownerCount for unknown', () => { expect(t.ownerCount('ghost')).toBe(0); });
    it('totalPowerFor for unknown', () => { expect(t.totalPowerFor('ghost')).toBe(0); });
    it('averagePower', () => { t.begin('A', 'natural', 5); expect(t.averagePower()).toBe(5); });
    it('completionRate', () => { const x = t.begin('A'); t.complete(x.id); expect(t.completionRate()).toBe(1); });
    it('report aggregates', () => { t.begin('A'); expect(t.report().total).toBe(1); });
    it('reset clears', () => { t.begin('A'); t.reset(); expect(t.stats.total).toBe(0); });
    it('exposes AWAKENING_TYPES', () => { expect(AWAKENING_TYPES).toContain('natural'); });
});
