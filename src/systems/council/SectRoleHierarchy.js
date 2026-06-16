/**
 * SectRoleHierarchy.js - 角色层级
 * V981 P-20260614-141 Round 38 Iter 4/30
 */
export const HIERARCHY_LEVELS = [
    { role: 'master', level: 5, canVote: true, canPropose: true, canVeto: true },
    { role: 'elder', level: 4, canVote: true, canPropose: true, canVeto: false },
    { role: 'core_disciple', level: 3, canVote: true, canPropose: true, canVeto: false },
    { role: 'inner_disciple', level: 2, canVote: true, canPropose: false, canVeto: false },
    { role: 'outer_disciple', level: 1, canVote: false, canPropose: false, canVeto: false },
];

export class SectRoleHierarchy {
    constructor(config = {}) {
        this.config = { ...config };
        this.assignments = new Map();  // memberId -> { role, since }
        this.hooks = new Map();
        this.stats = { promotions: 0, demotions: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    _getLevel(role) {
        const h = HIERARCHY_LEVELS.find(l => l.role === role);
        return h ? h.level : 0;
    }
    _getPerms(role) {
        const h = HIERARCHY_LEVELS.find(l => l.role === role);
        return h || null;
    }

    assign(memberId, role) {
        if (!HIERARCHY_LEVELS.find(l => l.role === role)) return false;
        const prev = this.assignments.get(memberId);
        this.assignments.set(memberId, { role, since: Date.now(), previous: prev?.role });
        if (prev) {
            if (this._getLevel(role) > this._getLevel(prev.role)) this.stats.promotions++;
            else if (this._getLevel(role) < this._getLevel(prev.role)) this.stats.demotions++;
        }
        this._emit('assigned', { memberId, role });
        return true;
    }
    getRole(memberId) { return this.assignments.get(memberId)?.role || null; }
    getLevel(memberId) { return this._getLevel(this.getRole(memberId)); }
    getPerms(memberId) { return this._getPerms(this.getRole(memberId)); }
    canVote(memberId) { return this.getPerms(memberId)?.canVote || false; }
    canPropose(memberId) { return this.getPerms(memberId)?.canPropose || false; }
    canVeto(memberId) { return this.getPerms(memberId)?.canVeto || false; }
    canActOn(memberId, targetRole) {
        return this.getLevel(memberId) > this._getLevel(targetRole);
    }
    promote(memberId) {
        const cur = this.getRole(memberId);
        if (!cur) return false;
        const idx = HIERARCHY_LEVELS.findIndex(l => l.role === cur);
        if (idx <= 0) return false;
        return this.assign(memberId, HIERARCHY_LEVELS[idx - 1].role);
    }
    demote(memberId) {
        const cur = this.getRole(memberId);
        if (!cur) return false;
        const idx = HIERARCHY_LEVELS.findIndex(l => l.role === cur);
        if (idx === -1 || idx === HIERARCHY_LEVELS.length - 1) return false;
        return this.assign(memberId, HIERARCHY_LEVELS[idx + 1].role);
    }
    higherThan(a, b) { return this.getLevel(a) > this.getLevel(b); }
    sameLevel(a, b) { return this.getLevel(a) === this.getLevel(b); }
    distribution() {
        const dist = {};
        for (const l of HIERARCHY_LEVELS) dist[l.role] = 0;
        for (const a of this.assignments.values()) dist[a.role] = (dist[a.role] || 0) + 1;
        return dist;
    }
    report() { return { total: this.assignments.size, promotions: this.stats.promotions, demotions: this.stats.demotions, distribution: this.distribution() }; }
    reset() { this.assignments.clear(); this.stats = { promotions: 0, demotions: 0 }; }
}
