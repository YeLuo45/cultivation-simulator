/**
 * FactionDynamics.js - 派系动态
 * V996 P-20260614-156 Round 38 Iter 19/30
 */
export const FACTION_STATUS = ['forming', 'active', 'rival', 'merged', 'dissolved'];

export class FactionDynamics {
    constructor(config = {}) {
        this.config = { ...config };
        this.factions = new Map();     // factionId -> { id, name, ideology, members, leader, status, rival }
        this.membership = new Map();   // memberId -> factionId
        this.hooks = new Map();
        this.stats = { total: 0, dissolved: 0, merged: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `fac_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(name, ideology = 'neutral', leader = null) {
        if (!name) return null;
        const id = this._newId();
        const f = { id, name, ideology, leader, members: new Set(), status: 'forming', createdAt: Date.now() };
        if (leader) f.members.add(leader);
        this.factions.set(id, f);
        if (leader) this.membership.set(leader, id);
        this.stats.total++;
        this._emit('created', f);
        return f;
    }
    get(id) { return this.factions.get(id) || null; }
    listAll() { return [...this.factions.values()]; }
    listByStatus(st) { return this.listAll().filter(f => f.status === st); }

    activate(id) {
        const f = this.factions.get(id);
        if (!f || f.status !== 'forming') return false;
        f.status = 'active';
        return true;
    }
    dissolve(id) {
        const f = this.factions.get(id);
        if (!f) return false;
        f.status = 'dissolved';
        for (const m of f.members) this.membership.delete(m);
        this.stats.dissolved++;
        this._emit('dissolved', f);
        return true;
    }
    merge(intoId, fromId) {
        const target = this.factions.get(intoId);
        const src = this.factions.get(fromId);
        if (!target || !src) return false;
        for (const m of src.members) {
            target.members.add(m);
            this.membership.set(m, intoId);
        }
        src.status = 'merged';
        src.mergedInto = intoId;
        this.stats.merged++;
        this._emit('merged', { intoId, fromId });
        return true;
    }
    setRival(aId, bId) {
        const a = this.factions.get(aId);
        const b = this.factions.get(bId);
        if (!a || !b) return false;
        a.rival = bId;
        b.rival = aId;
        a.status = 'rival';
        b.status = 'rival';
        return true;
    }
    clearRival(id) {
        const f = this.factions.get(id);
        if (!f) return false;
        if (f.rival) {
            const r = this.factions.get(f.rival);
            if (r) r.rival = null;
        }
        f.rival = null;
        if (f.status === 'rival') f.status = 'active';
        return true;
    }

    join(factionId, memberId) {
        const f = this.factions.get(factionId);
        if (!f) return false;
        if (this.membership.has(memberId)) this.leave(memberId);
        f.members.add(memberId);
        this.membership.set(memberId, factionId);
        return true;
    }
    leave(memberId) {
        const fId = this.membership.get(memberId);
        if (!fId) return false;
        const f = this.factions.get(fId);
        if (f) f.members.delete(memberId);
        this.membership.delete(memberId);
        return true;
    }
    factionOf(memberId) {
        const fId = this.membership.get(memberId);
        return fId ? this.factions.get(fId) : null;
    }
    isInFaction(memberId) { return this.membership.has(memberId); }
    membersOf(factionId) { return [...(this.factions.get(factionId)?.members || [])]; }
    sizeOf(factionId) { return this.factions.get(factionId)?.members.size || 0; }

    rivalOf(factionId) {
        const f = this.factions.get(factionId);
        if (!f?.rival) return null;
        return this.factions.get(f.rival);
    }
    areRivals(aId, bId) {
        const a = this.factions.get(aId);
        return a ? a.rival === bId : false;
    }

    report() { return { total: this.stats.total, dissolved: this.stats.dissolved, merged: this.stats.merged, active: this.listByStatus('active').length }; }
    reset() { this.factions.clear(); this.membership.clear(); this.stats = { total: 0, dissolved: 0, merged: 0 }; }
}
