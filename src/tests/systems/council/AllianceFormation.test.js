import { describe, it, expect, beforeEach } from 'vitest';
import { AllianceFormation, ALLIANCE_STATUS } from '../../../systems/council/AllianceFormation.js';

describe('AllianceFormation', () => {
    let a;
    beforeEach(() => { a = new AllianceFormation(); });
    it('initializes with defaults', () => { expect(a.stats.total).toBe(0); });
    it('form creates alliance', () => { expect(a.form('A1', 'm1')).not.toBeNull(); });
    it('form rejects missing', () => { expect(a.form('', 'm1')).toBeNull(); expect(a.form('A1', '')).toBeNull(); });
    it('get returns null for unknown', () => { expect(a.get('ghost')).toBeNull(); });
    it('listAll', () => { a.form('A1', 'm1'); expect(a.listAll().length).toBe(1); });
    it('listByStatus', () => { a.form('A1', 'm1'); expect(a.listByStatus('forming').length).toBe(1); });
    it('listForMember', () => { a.form('A1', 'm1'); expect(a.listForMember('m1').length).toBe(1); });
    it('listFoundedBy', () => { a.form('A1', 'm1'); a.form('A2', 'm2'); expect(a.listFoundedBy('m1').length).toBe(1); });
    it('activate', () => {
        const x = a.form('A1', 'm1', ['m2']);
        expect(a.activate(x.id)).toBe(true);
    });
    it('activate fails for single member', () => {
        const x = a.form('A1', 'm1');
        expect(a.activate(x.id)).toBe(false);
    });
    it('activate fails for unknown', () => { expect(a.activate('ghost')).toBe(false); });
    it('dissolve', () => {
        const x = a.form('A1', 'm1');
        expect(a.dissolve(x.id, 'test')).toBe(true);
    });
    it('dissolve returns false for unknown', () => { expect(a.dissolve('ghost')).toBe(false); });
    it('invite and acceptInvite', () => {
        const x = a.form('A1', 'm1');
        a.invite(x.id, 'm2');
        expect(a.acceptInvite(x.id, 'm2')).toBe(true);
    });
    it('invite returns false for unknown', () => { expect(a.invite('ghost', 'm1')).toBe(false); });
    it('acceptInvite fails for no invite', () => {
        const x = a.form('A1', 'm1');
        expect(a.acceptInvite(x.id, 'm2')).toBe(false);
    });
    it('declineInvite', () => {
        const x = a.form('A1', 'm1');
        a.invite(x.id, 'm2');
        expect(a.declineInvite(x.id, 'm2')).toBe(true);
    });
    it('join and leave', () => {
        const x = a.form('A1', 'm1');
        expect(a.join(x.id, 'm2')).toBe(true);
        expect(a.leave(x.id, 'm2')).toBe(true);
    });
    it('leave triggers dissolve if min', () => {
        const x = a.form('A1', 'm1', ['m2']);
        a.activate(x.id);
        a.leave(x.id, 'm2');
        expect(x.status).toBe('dissolved');
    });
    it('kick', () => {
        const x = a.form('A1', 'm1', ['m2']);
        expect(a.kick(x.id, 'm2')).toBe(true);
    });
    it('isMember and sizeOf', () => {
        const x = a.form('A1', 'm1', ['m2']);
        expect(a.isMember(x.id, 'm1')).toBe(true);
        expect(a.sizeOf(x.id)).toBe(2);
    });
    it('inviteStatus', () => {
        const x = a.form('A1', 'm1');
        a.invite(x.id, 'm2');
        expect(a.inviteStatus(x.id, 'm2')).toBe('pending');
    });
    it('report aggregates', () => { a.form('A1', 'm1'); expect(a.report().total).toBe(1); });
    it('reset clears', () => { a.form('A1', 'm1'); a.reset(); expect(a.stats.total).toBe(0); });
    it('exposes ALLIANCE_STATUS', () => { expect(ALLIANCE_STATUS).toContain('active'); });
});
