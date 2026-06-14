import { describe, it, expect, beforeEach } from 'vitest';
import { PillSchool, SCHOOL_TYPES } from '../../../systems/alchemy/PillSchool.js';

describe('PillSchool', () => {
    let s;
    beforeEach(() => { s = new PillSchool(); });
    it('initializes with defaults', () => { expect(s.stats.total).toBe(0); });
    it('create', () => { expect(s.create('Fire School', 'fire')).not.toBeNull(); });
    it('create rejects missing', () => { expect(s.create('', 'fire')).toBeNull(); });
    it('create normalizes invalid type', () => { const x = s.create('A', 'invalid'); expect(x.schoolType).toBe('fire'); });
    it('get returns null for unknown', () => { expect(s.get('ghost')).toBeNull(); });
    it('listAll and listByType and listByStatus', () => {
        s.create('A', 'fire');
        s.create('B', 'water');
        expect(s.listAll().length).toBe(2);
        expect(s.listByType('fire').length).toBe(1);
        expect(s.listByStatus('active').length).toBe(2);
    });
    it('join and leave', () => { const x = s.create('A', 'fire'); s.join(x.id, 'm1'); s.leave(x.id, 'm1'); expect(s.memberCount(x.id)).toBe(0); });
    it('join returns false for unknown', () => { expect(s.join('ghost', 'm1')).toBe(false); });
    it('leave returns false for unknown', () => { expect(s.leave('ghost', 'm1')).toBe(false); });
    it('setLeader and leaderOf', () => { const x = s.create('A', 'fire'); s.setLeader(x.id, 'm1'); expect(s.leaderOf(x.id)).toBe('m1'); });
    it('setLeader returns false for unknown', () => { expect(s.setLeader('ghost', 'm1')).toBe(false); });
    it('setDoctrine', () => { const x = s.create('A', 'fire'); s.setDoctrine(x.id, 'Fire mastery'); expect(s.get(x.id).doctrine).toBe('Fire mastery'); });
    it('setDoctrine returns false for unknown', () => { expect(s.setDoctrine('ghost', 'x')).toBe(false); });
    it('setStatus', () => { const x = s.create('A', 'fire'); expect(s.setStatus(x.id, 'forbidden')).toBe(true); });
    it('setStatus rejects invalid', () => { const x = s.create('A', 'fire'); expect(s.setStatus(x.id, 'invalid')).toBe(false); });
    it('setStatus returns false for unknown', () => { expect(s.setStatus('ghost', 'active')).toBe(false); });
    it('isMember and memberCount', () => { const x = s.create('A', 'fire'); s.join(x.id, 'm1'); expect(s.isMember(x.id, 'm1')).toBe(true); expect(s.memberCount(x.id)).toBe(1); });
    it('isMember for unknown', () => { expect(s.isMember('ghost', 'm1')).toBe(false); });
    it('memberCount for unknown', () => { expect(s.memberCount('ghost')).toBe(0); });
    it('leaderOf for unknown', () => { expect(s.leaderOf('ghost')).toBeNull(); });
    it('schoolsForMember', () => { s.create('A', 'fire'); s.create('B', 'water'); s.join(s.listAll()[0].id, 'm1'); s.join(s.listAll()[1].id, 'm1'); expect(s.schoolsForMember('m1').length).toBe(2); });
    it('largest', () => { const x = s.create('A', 'fire'); s.join(x.id, 'm1'); s.join(x.id, 'm2'); expect(s.largest().members.size).toBe(2); });
    it('largest for empty', () => { expect(s.largest()).toBeNull(); });
    it('report aggregates', () => { s.create('A', 'fire'); expect(s.report().total).toBe(1); });
    it('reset clears', () => { s.create('A', 'fire'); s.reset(); expect(s.stats.total).toBe(0); });
    it('exposes SCHOOL_TYPES', () => { expect(SCHOOL_TYPES).toContain('fire'); });
});
