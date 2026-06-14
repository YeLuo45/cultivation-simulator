/**
 * MissionControl.js - 任务控制
 * V1090 P-20260614-417 Round 41 Iter 23/30
 */
export const MISSION_STATUS = ['planning', 'approved', 'active', 'completed', 'aborted', 'failed'];
export const MISSION_TYPES = ['recon', 'infiltration', 'extraction', 'sabotage', 'assassination', 'surveillance'];

export class MissionControl {
    constructor(config = {}) {
        this.config = { ...config };
        this.missions = new Map();   // missionId -> { id, name, type, status, agents, priority, ts }
        this.hooks = new Map();
        this.stats = { total: 0, completed: 0, failed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `msn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(name, type, priority = 'normal') {
        if (!name) return null;
        if (!MISSION_TYPES.includes(type)) type = 'recon';
        const id = this._newId();
        const m = { id, name, type, status: 'planning', agents: [], priority, ts: Date.now() };
        this.missions.set(id, m);
        this.stats.total++;
        return m;
    }
    get(id) { return this.missions.get(id) || null; }
    listAll() { return [...this.missions.values()]; }
    listByStatus(st) { return this.listAll().filter(m => m.status === st); }
    listByType(type) { return this.listAll().filter(m => m.type === type); }
    listActive() { return this.listByStatus('active'); }
    listPlanning() { return this.listByStatus('planning'); }

    setStatus(id, status) {
        const m = this.missions.get(id);
        if (!m) return false;
        if (!MISSION_STATUS.includes(status)) return false;
        m.status = status;
        if (status === 'completed') this.stats.completed++;
        if (status === 'failed') this.stats.failed++;
        return true;
    }
    approve(id) { return this.setStatus(id, 'approved'); }
    launch(id) { return this.setStatus(id, 'active'); }
    complete(id) { return this.setStatus(id, 'completed'); }
    abort(id) { return this.setStatus(id, 'aborted'); }
    fail(id) { return this.setStatus(id, 'failed'); }
    assignAgent(missionId, agentId) {
        const m = this.missions.get(missionId);
        if (!m) return false;
        if (m.agents.includes(agentId)) return false;
        m.agents.push(agentId);
        return true;
    }
    unassignAgent(missionId, agentId) {
        const m = this.missions.get(missionId);
        if (!m) return false;
        m.agents = m.agents.filter(a => a !== agentId);
        return true;
    }
    setPriority(missionId, priority) {
        const m = this.missions.get(missionId);
        if (!m) return false;
        m.priority = priority;
        return true;
    }
    isActive(id) { return this.missions.get(id)?.status === 'active'; }
    isCompleted(id) { return this.missions.get(id)?.status === 'completed'; }
    isFailed(id) { return this.missions.get(id)?.status === 'failed'; }
    agentsFor(id) { return [...(this.missions.get(id)?.agents || [])]; }
    agentCount(id) { return this.missions.get(id)?.agents.length || 0; }
    successRate() { return this.stats.total === 0 ? 0 : this.stats.completed / this.stats.total; }
    report() { return { total: this.stats.total, completed: this.stats.completed, failed: this.stats.failed }; }
    reset() { this.missions.clear(); this.stats = { total: 0, completed: 0, failed: 0 }; }
}
