/**
 * ResolutionExecutor.js - 决议执行器
 * V990 P-20260614-150 Round 38 Iter 13/30
 */
export const EXEC_STATUS = ['pending', 'in_progress', 'completed', 'failed', 'cancelled'];
export const ACTION_TYPES = ['resource_transfer', 'policy_change', 'expansion', 'discipline', 'alliance', 'tax'];

export class ResolutionExecutor {
    constructor(config = {}) {
        this.config = { ...config };
        this.executions = new Map();   // execId -> { id, resolutionId, action, status, progress, startedAt, completedAt, result }
        this.byResolution = new Map(); // resolutionId -> execId
        this.hooks = new Map();
        this.stats = { total: 0, completed: 0, failed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `exec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    execute(resolutionId, action, params = {}) {
        if (!resolutionId || !action) return null;
        if (!ACTION_TYPES.includes(action.type)) return null;
        const id = this._newId();
        const e = { id, resolutionId, action, params, status: 'pending', progress: 0, startedAt: Date.now(), completedAt: null, result: null };
        this.executions.set(id, e);
        this.byResolution.set(resolutionId, id);
        this.stats.total++;
        this._emit('queued', e);
        return e;
    }

    start(execId) {
        const e = this.executions.get(execId);
        if (!e || e.status !== 'pending') return false;
        e.status = 'in_progress';
        e.startedAt = e.startedAt || Date.now();
        this._emit('started', e);
        return true;
    }

    updateProgress(execId, progress) {
        const e = this.executions.get(execId);
        if (!e) return false;
        e.progress = Math.max(0, Math.min(100, progress));
        return true;
    }

    complete(execId, result = null) {
        const e = this.executions.get(execId);
        if (!e || e.status === 'completed' || e.status === 'cancelled') return false;
        e.status = 'completed';
        e.progress = 100;
        e.completedAt = Date.now();
        e.result = result;
        this.stats.completed++;
        this._emit('completed', e);
        return true;
    }
    fail(execId, error = '') {
        const e = this.executions.get(execId);
        if (!e) return false;
        e.status = 'failed';
        e.error = error;
        e.completedAt = Date.now();
        this.stats.failed++;
        this._emit('failed', e);
        return true;
    }
    cancel(execId) {
        const e = this.executions.get(execId);
        if (!e) return false;
        e.status = 'cancelled';
        e.completedAt = Date.now();
        return true;
    }

    get(execId) { return this.executions.get(execId) || null; }
    getByResolution(resolutionId) { return this.executions.get(this.byResolution.get(resolutionId)) || null; }
    isComplete(execId) { return this.executions.get(execId)?.status === 'completed'; }
    isFailed(execId) { return this.executions.get(execId)?.status === 'failed'; }
    isPending(execId) { return this.executions.get(execId)?.status === 'pending'; }
    isInProgress(execId) { return this.executions.get(execId)?.status === 'in_progress'; }

    listByStatus(st) { return [...this.executions.values()].filter(e => e.status === st); }
    queue() { return this.listByStatus('pending'); }
    active() { return this.listByStatus('in_progress'); }
    completed() { return this.listByStatus('completed'); }
    failed() { return this.listByStatus('failed'); }

    report() { return { total: this.stats.total, completed: this.stats.completed, failed: this.stats.failed, inProgress: this.active().length }; }
    reset() { this.executions.clear(); this.byResolution.clear(); this.stats = { total: 0, completed: 0, failed: 0 }; }
}
