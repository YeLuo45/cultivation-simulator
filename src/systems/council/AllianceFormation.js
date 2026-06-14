/**
 * AllianceFormation.js - 联盟组建
 * V1000 P-20260614-160 Round 38 Iter 23/30
 */
export const ALLIANCE_STATUS = ['forming', 'active', 'dissolved', 'defunct'];
export const MIN_MEMBERS = 2;

export class AllianceFormation {
    constructor(config = {}) {
        this.config = { minMembers: config.minMembers || MIN_MEMBERS, ...config };
        this.alliances = new Map();   // allianceId -> { id, name, founder, members, status, formedAt }
        this.invites = new Map();      // allianceId -> Map<memberId, status>
        this.hooks = new Map();
        this.stats = { total: 0, active: 0, dissolved: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `all_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    form(name, founder, initialMembers = []) {
        if (!name || !founder) return null;
        const id = this._newId();
        const a = { id, name, founder, members: new Set([founder]), status: 'forming', formedAt: Date.now() };
        for (const m of initialMembers) a.members.add(m);
        this.alliances.set(id, a);
        this.invites.set(id, new Map());
        this.stats.total++;
        this._emit('formed', a);
        return a;
    }
    get(id) { return this.alliances.get(id) || null; }
    listAll() { return [...this.alliances.values()]; }
    listByStatus(st) { return this.listAll().filter(a => a.status === st); }
    listForMember(memberId) {
        return this.listAll().filter(a => a.members.has(memberId));
    }
    listFoundedBy(founder) { return this.listAll().filter(a => a.founder === founder); }

    activate(id) {
        const a = this.alliances.get(id);
        if (!a) return false;
        if (a.members.size < this.config.minMembers) return false;
        a.status = 'active';
        this.stats.active++;
        this._emit('activated', a);
        return true;
    }
    dissolve(id, reason = '') {
        const a = this.alliances.get(id);
        if (!a) return false;
        a.status = 'dissolved';
        a.dissolvedAt = Date.now();
        a.dissolveReason = reason;
        if (a.status === 'active') this.stats.active--;
        this.stats.dissolved++;
        this._emit('dissolved', a);
        return true;
    }

    invite(allianceId, memberId) {
        const a = this.alliances.get(allianceId);
        if (!a) return false;
        if (!this.invites.has(allianceId)) this.invites.set(allianceId, new Map());
        this.invites.get(allianceId).set(memberId, 'pending');
        this._emit('invited', { allianceId, memberId });
        return true;
    }
    acceptInvite(allianceId, memberId) {
        const a = this.alliances.get(allianceId);
        if (!a) return false;
        const inv = this.invites.get(allianceId);
        if (!inv || inv.get(memberId) !== 'pending') return false;
        inv.set(memberId, 'accepted');
        a.members.add(memberId);
        this._emit('inviteAccepted', { allianceId, memberId });
        return true;
    }
    declineInvite(allianceId, memberId) {
        const inv = this.invites.get(allianceId);
        if (!inv) return false;
        inv.set(memberId, 'declined');
        return true;
    }

    join(allianceId, memberId) {
        const a = this.alliances.get(allianceId);
        if (!a) return false;
        a.members.add(memberId);
        return true;
    }
    leave(allianceId, memberId) {
        const a = this.alliances.get(allianceId);
        if (!a) return false;
        a.members.delete(memberId);
        if (a.members.size < this.config.minMembers && a.status === 'active') this.dissolve(allianceId, 'min_members');
        return true;
    }
    kick(allianceId, memberId) { return this.leave(allianceId, memberId); }

    isMember(allianceId, memberId) {
        return this.alliances.get(allianceId)?.members.has(memberId) || false;
    }
    sizeOf(allianceId) { return this.alliances.get(allianceId)?.members.size || 0; }
    inviteStatus(allianceId, memberId) { return this.invites.get(allianceId)?.get(memberId) || null; }

    report() { return { total: this.stats.total, active: this.stats.active, dissolved: this.stats.dissolved }; }
    reset() { this.alliances.clear(); this.invites.clear(); this.stats = { total: 0, active: 0, dissolved: 0 }; }
}
