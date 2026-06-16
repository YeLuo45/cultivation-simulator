/**
 * ContributionTracker.js - 贡献追踪器
 * V995 P-20260614-155 Round 38 Iter 18/30
 */
export const CONTRIBUTION_TYPES = ['quest_completed', 'resource_donated', 'mentoring', 'research', 'defense', 'cultivation_breakthrough'];

export class ContributionTracker {
    constructor(config = {}) {
        this.config = { ...config };
        this.points = new Map();   // memberId -> total points
        this.history = new Map();  // memberId -> [{ type, points, ts }]
        this.hooks = new Map();
        this.stats = { totalEvents: 0, totalPoints: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    record(memberId, type, points = 1) {
        if (!memberId) return null;
        if (!CONTRIBUTION_TYPES.includes(type)) return null;
        if (typeof points !== 'number' || points <= 0) return null;
        this.points.set(memberId, (this.points.get(memberId) || 0) + points);
        if (!this.history.has(memberId)) this.history.set(memberId, []);
        const event = { type, points, ts: Date.now() };
        this.history.get(memberId).push(event);
        if (this.history.get(memberId).length > 100) this.history.get(memberId).shift();
        this.stats.totalEvents++;
        this.stats.totalPoints += points;
        this._emit('recorded', { memberId, ...event });
        return this.points.get(memberId);
    }

    get(memberId) { return this.points.get(memberId) || 0; }
    getHistory(memberId) { return [...(this.history.get(memberId) || [])]; }
    getByType(memberId, type) {
        return this.getHistory(memberId).filter(e => e.type === type);
    }
    pointsByType(memberId) {
        const result = {};
        for (const t of CONTRIBUTION_TYPES) result[t] = 0;
        for (const e of this.getHistory(memberId)) result[e.type] = (result[e.type] || 0) + e.points;
        return result;
    }

    topContributors(n = 5) {
        return [...this.points.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
    }
    isTopContributor(memberId, top = 10) {
        const topList = this.topContributors(top);
        return topList.some(([id]) => id === memberId);
    }
    totalContributions() {
        let s = 0;
        for (const v of this.points.values()) s += v;
        return s;
    }
    averageContribution() {
        if (this.points.size === 0) return 0;
        return this.totalContributions() / this.points.size;
    }

    resetMember(memberId) {
        this.points.set(memberId, 0);
        this.history.set(memberId, []);
    }
    report() {
        return { totalEvents: this.stats.totalEvents, totalPoints: this.stats.totalPoints, members: this.points.size, average: this.averageContribution() };
    }
    reset() { this.points.clear(); this.history.clear(); this.stats = { totalEvents: 0, totalPoints: 0 }; }
}
