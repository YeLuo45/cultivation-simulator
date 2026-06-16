import { describe, it, expect, beforeEach } from 'vitest';
import { SectMemberRegistry, SECT_ROLES } from '../../../systems/council/SectMemberRegistry.js';

describe('SectMemberRegistry', () => {
    let r;
    beforeEach(() => { r = new SectMemberRegistry(); });
    it('initializes with defaults', () => { expect(r.stats.total).toBe(0); });
    it('register adds member', () => {
        const m = r.register('m1', 'Alice', 'elder');
        expect(m).not.toBeNull();
        expect(r.stats.total).toBe(1);
    });
    it('register rejects invalid', () => {
        expect(r.register('', 'n')).toBeNull();
        expect(r.register('m1', '')).toBeNull();
    });
    it('register normalizes invalid role', () => {
        const m = r.register('m1', 'A', 'invalid');
        expect(m.role).toBe('outer_disciple');
    });
    it('get returns null for unknown', () => { expect(r.get('ghost')).toBeNull(); });
    it('listByRole', () => {
        r.register('m1', 'A', 'elder');
        r.register('m2', 'B', 'elder');
        r.register('m3', 'C', 'master');
        expect(r.listByRole('elder').length).toBe(2);
    });
    it('listActive filters active', () => {
        const m = r.register('m1', 'A');
        r.setStatus('m1', 'exiled');
        expect(r.listActive().length).toBe(0);
    });
    it('countByRole', () => {
        r.register('m1', 'A', 'master');
        r.register('m2', 'B', 'master');
        expect(r.countByRole('master')).toBe(2);
    });
    it('setRole changes role', () => {
        r.register('m1', 'A', 'outer');
        expect(r.setRole('m1', 'elder')).toBe(true);
    });
    it('setRole rejects invalid', () => {
        r.register('m1', 'A');
        expect(r.setRole('m1', 'invalid')).toBe(false);
    });
    it('setStatus changes status', () => {
        r.register('m1', 'A');
        expect(r.setStatus('m1', 'exiled')).toBe(true);
    });
    it('setStatus rejects invalid', () => {
        r.register('m1', 'A');
        expect(r.setStatus('m1', 'invalid')).toBe(false);
    });
    it('isMember and isActive and hasRole', () => {
        r.register('m1', 'A', 'master');
        expect(r.isMember('m1')).toBe(true);
        expect(r.isActive('m1')).toBe(true);
        expect(r.hasRole('m1', 'master')).toBe(true);
    });
    it('isActive returns false for unknown', () => { expect(r.isActive('ghost')).toBe(false); });
    it('getRole for unknown returns null', () => { expect(r.getRole('ghost')).toBeNull(); });
    it('report aggregates', () => {
        r.register('m1', 'A', 'master');
        r.register('m2', 'B', 'elder');
        const rep = r.report();
        expect(rep.total).toBe(2);
    });
    it('reset clears', () => {
        r.register('m1', 'A');
        r.reset();
        expect(r.stats.total).toBe(0);
    });
    it('exposes SECT_ROLES', () => { expect(SECT_ROLES).toContain('master'); });
});
