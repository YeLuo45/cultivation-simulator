/**
 * FailureRecoveryGuide.js - 失败恢复指南
 * V970 P-20260614-023 Iteration 23/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (chatdev multi-agent + recovery):
 * - 失败后给出恢复步骤
 * - 维护 recovery strategy 库
 * - 标记 recommended next action
 */

export const RECOVERY_STEPS = ['assess', 'rest', 'replan', 'retry', 'ask_help', 'abandon'];
export const FAILURE_CATEGORIES = ['timeout', 'resource', 'decision', 'execution'];

export class FailureRecoveryGuide {
    constructor(config = {}) {
        this.config = { ...config };
        this.strategies = new Map();     // category -> [{step, action, priority}]
        this.applied = new Map();        // playerId -> [{strategy, ts, success}]
        this.hooks = new Map();
        this.stats = { totalGuided: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    registerStrategy(category, steps) {
        if (!FAILURE_CATEGORIES.includes(category)) return false;
        if (!Array.isArray(steps)) return false;
        for (const s of steps) {
            if (!RECOVERY_STEPS.includes(s.step)) return false;
        }
        this.strategies.set(category, steps);
        return true;
    }

    getStrategy(category) {
        return this.strategies.get(category) || [];
    }

    guideFor(playerId, category) {
        const strat = this.getStrategy(category);
        if (strat.length === 0) return [];
        this._initPlayer(playerId);
        this.stats.totalGuided++;
        this._emit('guided', { playerId, category, steps: strat });
        return [...strat];
    }

    _initPlayer(playerId) {
        if (!this.applied.has(playerId)) this.applied.set(playerId, []);
    }

    record(playerId, category, success) {
        this._initPlayer(playerId);
        const entry = { category, success, ts: Date.now() };
        this.applied.get(playerId).push(entry);
        return entry;
    }

    nextStep(strategy, completedSteps = []) {
        for (const s of strategy) {
            if (!completedSteps.includes(s.step)) return s;
        }
        return null;
    }

    recoveryRate(playerId) {
        const list = this.applied.get(playerId) || [];
        if (list.length === 0) return 0;
        return list.filter(e => e.success).length / list.length;
    }

    listStrategies() { return [...this.strategies.entries()]; }
    listApplied(playerId) { return [...(this.applied.get(playerId) || [])]; }

    recommendFor(failureType) {
        const map = {
            timeout: 'rest',
            resource: 'replan',
            decision: 'assess',
            execution: 'retry',
        };
        return map[failureType] || 'assess';
    }

    report(playerId) {
        return {
            playerId,
            totalGuided: this.stats.totalGuided,
            recoveryRate: this.recoveryRate(playerId),
            applied: this.listApplied(playerId).length,
        };
    }

    reset() {
        this.strategies.clear();
        this.applied.clear();
        this.stats = { totalGuided: 0 };
    }
}
