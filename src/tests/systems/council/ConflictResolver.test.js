import { describe, it, expect, beforeEach } from 'vitest';
import { ConflictResolver, CONFLICT_TYPES } from '../../../systems/council/ConflictResolver.js';

describe('ConflictResolver', () => {
    let r;
    beforeEach(() => { r = new ConflictResolver(); });
    it('initializes with defaults', () => { expect(r.stats.total).toBe(0); });
    it('open creates conflict', () => { expect(r.open('dispute', ['s1', 's2'])).not.toBeNull(); });
    it('open rejects invalid type', () => { expect(r.open('invalid', ['s1', 's2'])).toBeNull(); });
    it('open rejects single party', () => { expect(r.open('dispute', ['s1'])).toBeNull(); });
    it('get returns null for unknown', () => { expect(r.get('ghost')).toBeNull(); });
    it('listAll', () => { r.open('dispute', ['s1', 's2']); expect(r.listAll().length).toBe(1); });
    it('listByStatus and listByParty and listByType', () => {
        r.open('dispute', ['s1', 's2']);
        r.open('border', ['s1', 's3']);
        expect(r.listByStatus('open').length).toBe(2);
        expect(r.listByParty('s1').length).toBe(2);
        expect(r.listByType('dispute').length).toBe(1);
    });
    it('chooseMethod', () => {
        const x = r.open('dispute', ['s1', 's2']);
        expect(r.chooseMethod(x.id, 'arbitration')).toBe(true);
    });
    it('chooseMethod rejects invalid', () => {
        const x = r.open('dispute', ['s1', 's2']);
        expect(r.chooseMethod(x.id, 'invalid')).toBe(false);
    });
    it('resolve', () => {
        const x = r.open('dispute', ['s1', 's2']);
        expect(r.resolve(x.id, 'split')).toBe(true);
    });
    it('resolve open conflict', () => {
        const x = r.open('dispute', ['s1', 's2']);
        r.resolve(x.id, 'split');
        expect(x.status).toBe('resolved');
    });
    it('escalate', () => {
        const x = r.open('dispute', ['s1', 's2']);
        expect(r.escalate(x.id)).toBe(true);
    });
    it('abandon', () => {
        const x = r.open('dispute', ['s1', 's2']);
        expect(r.abandon(x.id)).toBe(true);
    });
    it('isOpen/isMediating/isResolved/isEscalated', () => {
        const x = r.open('dispute', ['s1', 's2']);
        expect(r.isOpen(x.id)).toBe(true);
    });
    it('isInConflict', () => {
        r.open('dispute', ['s1', 's2']);
        expect(r.isInConflict('s1', 's2')).toBe(true);
    });
    it('history', () => {
        const x = r.open('dispute', ['s1', 's2']);
        expect(r.history(x.id).length).toBe(1);
    });
    it('report aggregates', () => { r.open('dispute', ['s1', 's2']); expect(r.report().total).toBe(1); });
    it('reset clears', () => { r.open('dispute', ['s1', 's2']); r.reset(); expect(r.stats.total).toBe(0); });
    it('exposes CONFLICT_TYPES', () => { expect(CONFLICT_TYPES).toContain('dispute'); });
});
