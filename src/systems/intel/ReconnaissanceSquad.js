/**
 * ReconnaissanceSquad.js - 侦察小队
 * V1091 P-20260614-418 Round 41 Iter 24/30
 */
export const SQUAD_STATUS = ['forming', 'deployed', 'returning', 'disbanded'];
export const SQUAD_SIZE = [2, 3, 4, 5, 6];

export class ReconnaissanceSquad {
    constructor(config = {}) {
        this.config = { ...config };
        this.squads = new Map();   // squadId -> { id, name, members, status, mission, formedAt }
        this.hooks = new Map();
        this.stats = { total: 0, deployed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `sqd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    form(name, memberIds = []) {
        if (!name) return null;
        if (!Array.isArray(memberIds)) return null;
        const id = this._newId();
        const s = { id, name, members: [...memberIds], status: 'forming', mission: null, formedAt: Date.now() };
        this.squads.set(id, s);
        this.stats.total++;
        return s;
    }
    get(id) { return this.squads.get(id) || null; }
    listAll() { return [...this.squads.values()]; }
    listByStatus(st) { return this.listAll().filter(s => s.status === st); }
    listDeployed() { return this.listByStatus('deployed'); }

    addMember(squadId, memberId) {
        const s = this.squads.get(squadId);
        if (!s) return false;
        if (s.members.includes(memberId)) return false;
        s.members.push(memberId);
        return true;
    }
    removeMember(squadId, memberId) {
        const s = this.squads.get(squadId);
        if (!s) return false;
        s.members = s.members.filter(m => m !== memberId);
        return true;
    }
    setStatus(id, status) {
        const s = this.squads.get(id);
        if (!s) return false;
        if (!SQUAD_STATUS.includes(status)) return false;
        s.status = status;
        return true;
    }
    deploy(id, missionId) {
        const s = this.squads.get(id);
        if (!s) return false;
        if (s.status !== 'forming') return false;
        s.status = 'deployed';
        s.mission = missionId;
        this.stats.deployed++;
        return true;
    }
    recall(id) {
        const s = this.squads.get(id);
        if (!s) return false;
        if (s.status !== 'deployed') return false;
        s.status = 'returning';
        return true;
    }
    disband(id) { return this.setStatus(id, 'disbanded'); }
    isDeployed(id) { return this.squads.get(id)?.status === 'deployed'; }
    isDisbanded(id) { return this.squads.get(id)?.status === 'disbanded'; }
    memberCount(id) { return this.squads.get(id)?.members.length || 0; }
    isFull(id) {
        const s = this.squads.get(id);
        return s ? s.members.length >= SQUAD_SIZE[SQUAD_SIZE.length - 1] : false;
    }
    missionFor(id) { return this.squads.get(id)?.mission || null; }
    averageSize() {
        if (this.squads.size === 0) return 0;
        return this.listAll().reduce((s, x) => s + x.members.length, 0) / this.squads.size;
    }
    report() { return { total: this.stats.total, deployed: this.stats.deployed }; }
    reset() { this.squads.clear(); this.stats = { total: 0, deployed: 0 }; }
}
