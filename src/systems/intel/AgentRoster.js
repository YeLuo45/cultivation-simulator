/**
 * AgentRoster.js - 特工名册
 * V1089 P-20260614-416 Round 41 Iter 22/30
 */
export const AGENT_STATUS = ['active', 'training', 'on_mission', 'wounded', 'deceased', 'retired'];
export const SPECIALIZATIONS = ['combat', 'social', 'technical', 'linguistic', 'martial_arts', 'alchemy'];

export class AgentRoster {
    constructor(config = {}) {
        this.config = { ...config };
        this.agents = new Map();   // agentId -> { id, codename, specialization, status, level, loyalty }
        this.bySpecialization = new Map();
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `agt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    enroll(codename, specialization, level = 1) {
        if (!codename) return null;
        if (!SPECIALIZATIONS.includes(specialization)) specialization = 'combat';
        const id = this._newId();
        const a = { id, codename, specialization, status: 'active', level, loyalty: 0.8 };
        this.agents.set(id, a);
        if (!this.bySpecialization.has(specialization)) this.bySpecialization.set(specialization, new Set());
        this.bySpecialization.get(specialization).add(id);
        this.stats.total++;
        return a;
    }
    get(id) { return this.agents.get(id) || null; }
    listAll() { return [...this.agents.values()]; }
    listByStatus(st) { return this.listAll().filter(a => a.status === st); }
    listBySpecialization(sp) {
        const ids = this.bySpecialization.get(sp) || new Set();
        return [...ids].map(id => this.agents.get(id)).filter(Boolean);
    }
    listActive() { return this.listByStatus('active'); }
    listOnMission() { return this.listByStatus('on_mission'); }

    setStatus(id, status) {
        const a = this.agents.get(id);
        if (!a) return false;
        if (!AGENT_STATUS.includes(status)) return false;
        a.status = status;
        return true;
    }
    setLoyalty(id, loyalty) {
        const a = this.agents.get(id);
        if (!a) return false;
        a.loyalty = Math.max(0, Math.min(1, loyalty));
        return true;
    }
    promote(id, newLevel) {
        const a = this.agents.get(id);
        if (!a) return false;
        a.level = Math.max(1, newLevel);
        return true;
    }
    isActive(id) { return this.agents.get(id)?.status === 'active'; }
    isOnMission(id) { return this.agents.get(id)?.status === 'on_mission'; }
    isDeceased(id) { return this.agents.get(id)?.status === 'deceased'; }
    levelOf(id) { return this.agents.get(id)?.level || 0; }
    loyaltyOf(id) { return this.agents.get(id)?.loyalty || 0; }
    specializationOf(id) { return this.agents.get(id)?.specialization || null; }
    countBySpecialization() {
        const c = {};
        for (const s of SPECIALIZATIONS) c[s] = 0;
        for (const a of this.agents.values()) c[a.specialization] = (c[a.specialization] || 0) + 1;
        return c;
    }
    averageLevel() {
        if (this.agents.size === 0) return 0;
        return this.listAll().reduce((s, a) => s + a.level, 0) / this.agents.size;
    }
    bestAgent(spec) {
        const list = this.listBySpecialization(spec);
        if (list.length === 0) return null;
        return list.reduce((best, a) => !best || a.level > best.level ? a : best, null);
    }
    report() { return { total: this.stats.total, averageLevel: this.averageLevel() }; }
    reset() { this.agents.clear(); this.bySpecialization.clear(); this.stats = { total: 0 }; }
}
