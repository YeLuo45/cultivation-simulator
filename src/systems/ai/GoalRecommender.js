/**
 * GoalRecommender.js - 目标推荐器
 * V969 P-20260614-022 Iteration 22/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (chatdev multi-agent + goal):
 * - 根据玩家当前状态推荐下一步目标
 * - 维护 goal pool + matching logic
 * - 排序按距离+匹配度
 */

export const GOAL_CATEGORIES = ['cultivate', 'combat', 'craft', 'social', 'explore', 'milestone'];
export const DEFAULT_TOP_N = 3;

export class GoalRecommender {
    constructor(config = {}) {
        this.config = { topN: config.topN || DEFAULT_TOP_N, ...config };
        this.goals = [];            // [{id, category, title, weight, requirements}]
        this.assignments = new Map();
        this.hooks = new Map();
        this.stats = { totalRecommended: 0, totalCompleted: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    addGoal(goal) {
        if (!goal || !goal.id || !GOAL_CATEGORIES.includes(goal.category)) return false;
        this.goals.push(goal);
        return true;
    }

    getGoal(id) { return this.goals.find(g => g.id === id) || null; }
    goalCount() { return this.goals.length; }
    listGoals() { return [...this.goals]; }

    _scoreGoal(goal, profile) {
        let score = goal.weight || 1.0;
        if (profile && profile.preferences) {
            const pref = profile.preferences[goal.category];
            if (typeof pref === 'number') score += pref / 10;
        }
        if (profile && profile.level) {
            if (goal.requirements?.minLevel && profile.level < goal.requirements.minLevel) score = 0;
        }
        return score;
    }

    recommend(playerId, profile, count = null) {
        const n = count || this.config.topN;
        const scored = this.goals.map(g => ({ goal: g, score: this._scoreGoal(g, profile) }))
            .filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score);
        const top = scored.slice(0, n).map(s => s.goal);
        this.stats.totalRecommended += top.length;
        this._emit('recommended', { playerId, goals: top });
        return top;
    }

    accept(playerId, goalId) {
        const goal = this.getGoal(goalId);
        if (!goal) return null;
        if (!this.assignments.has(playerId)) this.assignments.set(playerId, []);
        const a = { goalId, ts: Date.now(), status: 'accepted' };
        this.assignments.get(playerId).push(a);
        return a;
    }

    complete(playerId, goalId) {
        const list = this.assignments.get(playerId);
        if (!list) return false;
        const a = list.find(x => x.goalId === goalId);
        if (!a) return false;
        a.status = 'completed';
        a.completedAt = Date.now();
        this.stats.totalCompleted++;
        return true;
    }

    isCompleted(playerId, goalId) {
        const list = this.assignments.get(playerId) || [];
        const a = list.find(x => x.goalId === goalId);
        return a?.status === 'completed';
    }

    listAssignments(playerId) {
        return [...(this.assignments.get(playerId) || [])];
    }

    progress(playerId) {
        const list = this.listAssignments(playerId);
        if (list.length === 0) return 0;
        return list.filter(a => a.status === 'completed').length / list.length;
    }

    report(playerId) {
        const list = this.listAssignments(playerId);
        return {
            playerId,
            totalAssigned: list.length,
            totalCompleted: list.filter(a => a.status === 'completed').length,
            progress: this.progress(playerId),
        };
    }

    reset() {
        this.goals = [];
        this.assignments.clear();
        this.stats = { totalRecommended: 0, totalCompleted: 0 };
    }
}
