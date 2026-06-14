import { describe, it, expect, beforeEach } from 'vitest';
import { SectRoleHierarchy, HIERARCHY_LEVELS } from '../../../systems/council/SectRoleHierarchy.js';

describe('SectRoleHierarchy', () => {
    let h;
    beforeEach(() => { h = new SectRoleHierarchy(); });
    it('initializes with defaults', () => { expect(h.assignments.size).toBe(0); });
    it('assign sets role', () => {
        expect(h.assign('m1', 'master')).toBe(true);
    });
    it('assign rejects invalid role', () => { expect(h.assign('m1', 'invalid')).toBe(false); });
    it('getRole returns null for unknown', () => { expect(h.getRole('m1')).toBeNull(); });
    it('getLevel returns 0 for unknown', () => { expect(h.getLevel('m1')).toBe(0); });
    it('getLevel returns correct level', () => {
        h.assign('m1', 'master');
        expect(h.getLevel('m1')).toBe(5);
    });
    it('getPerms returns null for unknown', () => { expect(h.getPerms('m1')).toBeNull(); });
    it('canVote/canPropose/canVeto', () => {
        h.assign('m1', 'master');
        expect(h.canVote('m1')).toBe(true);
        expect(h.canVeto('m1')).toBe(true);
    });
    it('canActOn', () => {
        h.assign('m1', 'master');
        h.assign('m2', 'elder');
        expect(h.canActOn('m1', 'elder')).toBe(true);
    });
    it('promote increases role', () => {
        h.assign('m1', 'outer_disciple');
        h.assign('m2', 'master');
        expect(h.promote('m1')).toBe(true);
    });
    it('promote fails for master', () => {
        h.assign('m1', 'master');
        expect(h.promote('m1')).toBe(false);
    });
    it('demote decreases role', () => {
        h.assign('m1', 'master');
        expect(h.demote('m1')).toBe(true);
    });
    it('demote fails for outer', () => {
        h.assign('m1', 'outer_disciple');
        expect(h.demote('m1')).toBe(false);
    });
    it('higherThan and sameLevel', () => {
        h.assign('m1', 'master');
        h.assign('m2', 'elder');
        expect(h.higherThan('m1', 'm2')).toBe(true);
    });
    it('distribution', () => {
        h.assign('m1', 'master');
        h.assign('m2', 'elder');
        const d = h.distribution();
        expect(d.master).toBe(1);
    });
    it('report aggregates', () => { h.assign('m1', 'master'); expect(h.report().total).toBe(1); });
    it('reset clears', () => { h.assign('m1', 'master'); h.reset(); expect(h.assignments.size).toBe(0); });
    it('exposes HIERARCHY_LEVELS', () => { expect(HIERARCHY_LEVELS.length).toBe(5); });
});
