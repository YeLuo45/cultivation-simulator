/**
 * ProgressVelocityTracker.js - 进度速度追踪器
 * V956 P-20260614-009 Iteration 9/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (nanobot velocity tracking):
 * - 追踪玩家在每类目标上的进度速度
 * - 维护历史速度序列
 * - 计算 ETA (estimated time to arrival)
 * - 检测速度异常 (slowing / stalled)
 */

export const TRACKABLE_GOALS = ['cultivate', 'combat', 'quest', 'craft', 'explore'];
export const VELOCITY_WINDOW = 5;
export const STALL_FACTOR = 0.2;

export class ProgressVelocityTracker {
    constructor(config = {}) {
        this.config = {
            velocityWindow: config.velocityWindow !== undefined ? config.velocityWindow : VELOCITY_WINDOW,
            stallFactor: config.stallFactor !== undefined ? config.stallFactor : STALL_FACTOR,
            ...config,
        };
        this.progress = new Map();      // progressId -> { playerId, goal, delta, currentTotal, ts }
        this.playerProgress = new Map(); // playerId -> Map<goal, progressId[]>
        this.hooks = new Map();
        this.stats = { totalProgress: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    _newId() { return `prg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    recordProgress(playerId, goal, delta, currentTotal = 0) {
        if (!playerId || !TRACKABLE_GOALS.includes(goal)) return null;
        if (typeof delta !== 'number') return null;
        const id = this._newId();
        const p = { id, playerId, goal, delta, currentTotal, ts: Date.now() };
        this.progress.set(id, p);
        if (!this.playerProgress.has(playerId)) this.playerProgress.set(playerId, new Map());
        const pmap = this.playerProgress.get(playerId);
        if (!pmap.has(goal)) pmap.set(goal, []);
        pmap.get(goal).push(id);
        this.stats.totalProgress++;
        this._emit('progressRecorded', p);
        return p;
    }

    _progressFor(playerId, goal) {
        const pmap = this.playerProgress.get(playerId);
        if (!pmap) return [];
        const ids = pmap.get(goal) || [];
        return ids.map(id => this.progress.get(id)).filter(Boolean);
    }

    velocity(playerId, goal) {
        const list = this._progressFor(playerId, goal);
        if (list.length < 2) return 0;
        const recent = list.slice(-this.config.velocityWindow);
        const totalDelta = recent.reduce((s, p) => s + p.delta, 0);
        const first = recent[0].ts;
        const last = recent[recent.length - 1].ts;
        const spanMs = last - first;
        if (spanMs <= 0) return 0;
        return (totalDelta / spanMs) * 1000;  // per second
    }

    averageVelocity(playerId, goal) {
        const list = this._progressFor(playerId, goal);
        if (list.length === 0) return 0;
        const total = list.reduce((s, p) => s + p.delta, 0);
        const first = list[0].ts;
        const last = list[list.length - 1].ts;
        const spanMs = last - first;
        return spanMs > 0 ? (total / spanMs) * 1000 : 0;
    }

    isStalled(playerId, goal) {
        const list = this._progressFor(playerId, goal);
        if (list.length < 3) return false;
        const v = this.velocity(playerId, goal);
        const avg = this.averageVelocity(playerId, goal);
        if (avg <= 0) return v === 0;
        return v < avg * this.config.stallFactor;
    }

    isSlowing(playerId, goal) {
        const list = this._progressFor(playerId, goal);
        if (list.length < this.config.velocityWindow) return false;
        const half = Math.floor(list.length / 2);
        const early = list.slice(0, half);
        const recent = list.slice(half);
        const earlySum = early.reduce((s, p) => s + p.delta, 0);
        const recentSum = recent.reduce((s, p) => s + p.delta, 0);
        return earlySum > 0 && recentSum < earlySum * this.config.stallFactor;
    }

    estimateETA(playerId, goal, target) {
        const list = this._progressFor(playerId, goal);
        if (list.length === 0 || target <= 0) return null;
        const v = this.averageVelocity(playerId, goal);
        if (v <= 0) return null;
        const currentTotal = list[list.length - 1].currentTotal;
        const remaining = target - currentTotal;
        if (remaining <= 0) return 0;
        return Math.ceil(remaining / v);
    }

    getProgress(progressId) { return this.progress.get(progressId) || null; }

    report(playerId) {
        const byGoal = {};
        for (const g of TRACKABLE_GOALS) {
            const v = this.velocity(playerId, g);
            const avg = this.averageVelocity(playerId, g);
            byGoal[g] = {
                velocity: v,
                avgVelocity: avg,
                stalled: this.isStalled(playerId, g),
                slowing: this.isSlowing(playerId, g),
            };
        }
        return { playerId, byGoal };
    }

    reset() {
        this.progress.clear();
        this.playerProgress.clear();
        this.stats = { totalProgress: 0 };
    }
}
