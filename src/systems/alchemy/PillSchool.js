/**
 * PillSchool.js - 炼丹流派
 * V1058 P-20260614-248 Round 40 Iter 21/30
 */
export const SCHOOL_TYPES = ['fire', 'water', 'wood', 'metal', 'earth', 'thunder', 'wind', 'void'];
export const SCHOOL_STATUS = ['active', 'historic', 'forbidden', 'rising'];

export class PillSchool {
    constructor(config = {}) {
        this.config = { ...config };
        this.schools = new Map();   // schoolId -> { id, name, schoolType, doctrine, members, leader, status, createdAt }
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `sch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(name, schoolType, doctrine = '') {
        if (!name) return null;
        if (!SCHOOL_TYPES.includes(schoolType)) schoolType = 'fire';
        const id = this._newId();
        const s = { id, name, schoolType, doctrine, members: new Set(), leader: null, status: 'active', createdAt: Date.now() };
        this.schools.set(id, s);
        this.stats.total++;
        return s;
    }
    get(id) { return this.schools.get(id) || null; }
    listAll() { return [...this.schools.values()]; }
    listByType(type) { return this.listAll().filter(s => s.schoolType === type); }
    listByStatus(st) { return this.listAll().filter(s => s.status === st); }

    join(schoolId, memberId) {
        const s = this.schools.get(schoolId);
        if (!s) return false;
        s.members.add(memberId);
        return true;
    }
    leave(schoolId, memberId) {
        const s = this.schools.get(schoolId);
        if (!s) return false;
        s.members.delete(memberId);
        if (s.leader === memberId) s.leader = null;
        return true;
    }
    setLeader(schoolId, memberId) {
        const s = this.schools.get(schoolId);
        if (!s) return false;
        s.leader = memberId;
        if (memberId) s.members.add(memberId);
        return true;
    }
    setDoctrine(schoolId, doctrine) {
        const s = this.schools.get(schoolId);
        if (!s) return false;
        s.doctrine = doctrine;
        return true;
    }
    setStatus(schoolId, status) {
        const s = this.schools.get(schoolId);
        if (!s) return false;
        if (!SCHOOL_STATUS.includes(status)) return false;
        s.status = status;
        return true;
    }
    isMember(schoolId, memberId) { return this.schools.get(schoolId)?.members.has(memberId) || false; }
    memberCount(schoolId) { return this.schools.get(schoolId)?.members.size || 0; }
    leaderOf(schoolId) { return this.schools.get(schoolId)?.leader || null; }
    schoolsForMember(memberId) {
        return this.listAll().filter(s => s.members.has(memberId));
    }
    largest() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, s) => !best || s.members.size > best.members.size ? s : best, null);
    }
    report() { return { total: this.stats.total }; }
    reset() { this.schools.clear(); this.stats = { total: 0 }; }
}
