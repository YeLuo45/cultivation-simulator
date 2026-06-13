/**
 * StuckPointDetector.js - 卡点识别器
 * V953 P-20260614-006 Iteration 6/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (nanobot mesh + 状态检测):
 * - 监测玩家在某任务上的重复失败/卡顿
 * - 标记 stuck point (连续 N 次失败/超时)
 * - 恢复后自动消除标记
 * - 通知下游教练系统
 */

export const STUCK_THRESHOLDS = {
    consecutive_failures: 3,
    repeated_actions: 5,
    time_overrun_factor: 1.5,
};

export const STUCK_SEVERITY = ['mild', 'moderate', 'severe', 'critical'];

export const DEFAULT_MAX_STUCK_RECORDS = 200;

export class StuckPointDetector {
    constructor(config = {}) {
        this.config = {
            consecutiveFailures: config.consecutiveFailures !== undefined ? config.consecutiveFailures : STUCK_THRESHOLDS.consecutive_failures,
            repeatedActions: config.repeatedActions !== undefined ? config.repeatedActions : STUCK_THRESHOLDS.repeated_actions,
            timeOverrunFactor: config.timeOverrunFactor !== undefined ? config.timeOverrunFactor : STUCK_THRESHOLDS.time_overrun_factor,
            maxStuckRecords: config.maxStuckRecords !== undefined ? config.maxStuckRecords : DEFAULT_MAX_STUCK_RECORDS,
            ...config,
        };
        this.attempts = new Map();       // playerId -> Map<taskType, { failures, lastAction, avgDuration }>
        this.stuckRecords = new Map();   // recordId -> stuck point
        this.playerStucks = new Map();   // playerId -> Set<recordId>
        this.hooks = new Map();
        this.stats = { totalDetected: 0, totalRecovered: 0, totalCleared: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    _newId() { return `stk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    recordAttempt(playerId, taskType, success, durationMs = 0, expectedDuration = 0) {
        if (!playerId || !taskType) return null;
        if (!this.attempts.has(playerId)) this.attempts.set(playerId, new Map());
        const pmap = this.attempts.get(playerId);
        if (!pmap.has(taskType)) {
            pmap.set(taskType, { failures: 0, successes: 0, lastAction: null, durations: [], avgDuration: 0 });
        }
        const state = pmap.get(taskType);
        if (success) {
            state.failures = 0;
            state.successes++;
            state.lastAction = 'success';
        } else {
            state.failures++;
            state.lastAction = 'failure';
        }
        if (durationMs > 0) {
            state.durations.push(durationMs);
            if (state.durations.length > 10) state.durations.shift();
            state.avgDuration = state.durations.reduce((s, x) => s + x, 0) / state.durations.length;
        }
        const stuck = this._checkStuck(playerId, taskType, state, expectedDuration);
        if (stuck) {
            this.stats.totalDetected++;
            this._emit('stuckDetected', stuck);
        }
        return stuck;
    }

    _checkStuck(playerId, taskType, state, expectedDuration) {
        let severity = null;
        if (state.failures >= this.config.consecutiveFailures) {
            severity = state.failures >= this.config.consecutiveFailures * 3 ? 'critical' :
                       state.failures >= this.config.consecutiveFailures * 2 ? 'severe' : 'moderate';
        }
        let timeOverrun = false;
        if (expectedDuration > 0 && state.avgDuration > expectedDuration * this.config.timeOverrunFactor) {
            timeOverrun = true;
        }
        if (!severity && !timeOverrun) return null;
        const id = this._newId();
        const record = {
            id, playerId, taskType,
            severity: severity || 'mild',
            failureCount: state.failures,
            avgDuration: state.avgDuration,
            timeOverrun,
            detectedAt: Date.now(),
        };
        this.stuckRecords.set(id, record);
        if (!this.playerStucks.has(playerId)) this.playerStucks.set(playerId, new Set());
        this.playerStucks.get(playerId).add(id);
        if (this.stuckRecords.size > this.config.maxStuckRecords) this._pruneOld();
        return record;
    }

    _pruneOld() {
        const sorted = [...this.stuckRecords.values()].sort((a, b) => a.detectedAt - b.detectedAt);
        const toRemove = this.stuckRecords.size - this.config.maxStuckRecords;
        for (let i = 0; i < toRemove; i++) {
            const r = sorted[i];
            this.stuckRecords.delete(r.id);
            const set = this.playerStucks.get(r.playerId);
            if (set) set.delete(r.id);
        }
    }

    markRecovered(stuckId) {
        const r = this.stuckRecords.get(stuckId);
        if (!r) return null;
        r.recoveredAt = Date.now();
        this.stats.totalRecovered++;
        this._emit('recovered', r);
        return r;
    }

    clearStuck(stuckId) {
        const r = this.stuckRecords.get(stuckId);
        if (!r) return false;
        this.stuckRecords.delete(stuckId);
        const set = this.playerStucks.get(r.playerId);
        if (set) set.delete(stuckId);
        this.stats.totalCleared++;
        return true;
    }

    getStuck(stuckId) { return this.stuckRecords.get(stuckId) || null; }

    listPlayerStucks(playerId) {
        const set = this.playerStucks.get(playerId);
        if (!set) return [];
        return [...set].map(id => this.stuckRecords.get(id)).filter(Boolean);
    }

    isPlayerStuck(playerId, taskType = null) {
        const list = this.listPlayerStucks(playerId);
        if (!taskType) return list.length > 0;
        return list.some(s => s.taskType === taskType);
    }

    report(playerId) {
        const list = this.listPlayerStucks(playerId);
        const bySeverity = {};
        for (const s of STUCK_SEVERITY) bySeverity[s] = 0;
        const byTask = {};
        for (const s of list) {
            bySeverity[s.severity] = (bySeverity[s.severity] || 0) + 1;
            byTask[s.taskType] = (byTask[s.taskType] || 0) + 1;
        }
        return { playerId, totalStuck: list.length, bySeverity, byTask };
    }

    reset() {
        this.attempts.clear();
        this.stuckRecords.clear();
        this.playerStucks.clear();
        this.stats = { totalDetected: 0, totalRecovered: 0, totalCleared: 0 };
    }
}
