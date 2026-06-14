/**
 * StrategicPlanner.js - 战略规划师
 * V1096 P-20260614-423 Round 41 Iter 29/30
 */
export const PLAN_STATUS = ['drafting', 'approved', 'executing', 'completed', 'cancelled'];
export const PLAN_TIMEFRAMES = ['short', 'medium', 'long', 'generational'];

export class StrategicPlanner {
    constructor(config = {}) {
        this.config = { ...config };
        this.plans = new Map();   // planId -> { id, name, timeframe, status, objectives, progress, createdAt }
        this.hooks = new Map();
        this.stats = { total: 0, completed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `pln_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(name, timeframe = 'medium', objectives = []) {
        if (!name) return null;
        if (!PLAN_TIMEFRAMES.includes(timeframe)) timeframe = 'medium';
        if (!Array.isArray(objectives)) objectives = [];
        const id = this._newId();
        const p = { id, name, timeframe, status: 'drafting', objectives: [...objectives], progress: 0, createdAt: Date.now() };
        this.plans.set(id, p);
        this.stats.total++;
        return p;
    }
    get(id) { return this.plans.get(id) || null; }
    listAll() { return [...this.plans.values()]; }
    listByStatus(st) { return this.listAll().filter(p => p.status === st); }
    listByTimeframe(tf) { return this.listAll().filter(p => p.timeframe === tf); }
    listActive() { return this.listByStatus('executing'); }

    setStatus(id, status) {
        const p = this.plans.get(id);
        if (!p) return false;
        if (!PLAN_STATUS.includes(status)) return false;
        p.status = status;
        if (status === 'completed') this.stats.completed++;
        return true;
    }
    approve(id) { return this.setStatus(id, 'approved'); }
    execute(id) { return this.setStatus(id, 'executing'); }
    complete(id) { return this.setStatus(id, 'completed'); }
    cancel(id) { return this.setStatus(id, 'cancelled'); }
    addObjective(id, objective) {
        const p = this.plans.get(id);
        if (!p) return false;
        p.objectives.push(objective);
        return true;
    }
    setProgress(id, progress) {
        const p = this.plans.get(id);
        if (!p) return false;
        p.progress = Math.max(0, Math.min(1, progress));
        if (p.progress >= 1 && p.status === 'executing') p.status = 'completed';
        return true;
    }
    completeObjective(id, index) {
        const p = this.plans.get(id);
        if (!p) return false;
        if (index < 0 || index >= p.objectives.length) return false;
        p.objectives[index] = { ...p.objectives[index], completed: true, completedAt: Date.now() };
        this._recalculateProgress(id);
        return true;
    }
    _recalculateProgress(id) {
        const p = this.plans.get(id);
        if (!p) return;
        const completed = p.objectives.filter(o => o.completed).length;
        p.progress = p.objectives.length === 0 ? 0 : completed / p.objectives.length;
    }
    isExecuting(id) { return this.plans.get(id)?.status === 'executing'; }
    isCompleted(id) { return this.plans.get(id)?.status === 'completed'; }
    progressOf(id) { return this.plans.get(id)?.progress || 0; }
    objectiveCount(id) { return this.plans.get(id)?.objectives.length || 0; }
    timeframeOf(id) { return this.plans.get(id)?.timeframe || null; }
    averageProgress() {
        if (this.plans.size === 0) return 0;
        return this.listAll().reduce((s, p) => s + p.progress, 0) / this.plans.size;
    }
    report() { return { total: this.stats.total, completed: this.stats.completed, averageProgress: this.averageProgress() }; }
    reset() { this.plans.clear(); this.stats = { total: 0, completed: 0 }; }
}
