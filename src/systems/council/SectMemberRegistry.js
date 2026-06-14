/**
 * SectMemberRegistry.js - 宗门成员注册表
 * V979 P-20260614-139 Round 38 Iter 2/30
 */
export const SECT_ROLES = ['master', 'elder', 'core_disciple', 'inner_disciple', 'outer_disciple'];
export const SECT_STATUS = ['active', 'in_seclusion', 'exiled', 'deceased'];

export class SectMemberRegistry {
    constructor(config = {}) {
        this.config = { ...config };
        this.members = new Map();      // memberId -> { id, name, role, status, joinedAt }
        this.byRole = new Map();       // role -> Set<memberId>
        this.hooks = new Map();
        this.stats = { total: 0, active: 0 };
        for (const r of SECT_ROLES) this.byRole.set(r, new Set());
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    register(id, name, role = 'outer_disciple') {
        if (!id || !name) return null;
        if (!SECT_ROLES.includes(role)) role = 'outer_disciple';
        const m = { id, name, role, status: 'active', joinedAt: Date.now() };
        this.members.set(id, m);
        this.byRole.get(role).add(id);
        this.stats.total++;
        this.stats.active++;
        this._emit('registered', m);
        return m;
    }
    get(id) { return this.members.get(id) || null; }
    listAll() { return [...this.members.values()]; }
    listByRole(role) {
        const ids = this.byRole.get(role) || new Set();
        return [...ids].map(id => this.members.get(id)).filter(Boolean);
    }
    listActive() { return this.listAll().filter(m => m.status === 'active'); }
    countByRole(role) { return (this.byRole.get(role) || new Set()).size; }
    setRole(id, role) {
        const m = this.members.get(id);
        if (!m) return false;
        if (!SECT_ROLES.includes(role)) return false;
        this.byRole.get(m.role).delete(id);
        m.role = role;
        this.byRole.get(role).add(id);
        return true;
    }
    setStatus(id, status) {
        const m = this.members.get(id);
        if (!m) return false;
        if (!SECT_STATUS.includes(status)) return false;
        const wasActive = m.status === 'active';
        const isActive = status === 'active';
        if (wasActive && !isActive) this.stats.active--;
        else if (!wasActive && isActive) this.stats.active++;
        m.status = status;
        m.statusTs = Date.now();
        this._emit('statusChanged', m);
        return true;
    }
    isMember(id) { return this.members.has(id); }
    isActive(id) {
        const m = this.members.get(id);
        return m ? m.status === 'active' : false;
    }
    hasRole(id, role) {
        const m = this.members.get(id);
        return m ? m.role === role : false;
    }
    getRole(id) {
        const m = this.members.get(id);
        return m ? m.role : null;
    }
    report() {
        const byRole = {};
        for (const r of SECT_ROLES) byRole[r] = this.countByRole(r);
        return { total: this.stats.total, active: this.stats.active, byRole };
    }
    reset() {
        this.members.clear();
        for (const r of SECT_ROLES) this.byRole.set(r, new Set());
        this.stats = { total: 0, active: 0 };
    }
}
