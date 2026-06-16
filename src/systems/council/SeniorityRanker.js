/**
 * SeniorityRanker.js - 资历排名器
 * V997 P-20260614-157 Round 38 Iter 20/30
 */
export const SENIORITY_TIERS = ['novice', 'junior', 'senior', 'veteran', 'elder'];
export const DEFAULT_TIER_THRESHOLDS = [30, 90, 365, 1095, 3650];  // days

export class SeniorityRanker {
    constructor(config = {}) {
        this.config = { tierThresholds: DEFAULT_TIER_THRESHOLDS, ...config };
        this.joined = new Map();      // memberId -> joinDate
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    recordJoin(memberId, joinDate = null) {
        if (!memberId) return false;
        this.joined.set(memberId, joinDate || Date.now());
        this.stats.total++;
        return true;
    }
    removeJoin(memberId) { return this.joined.delete(memberId); }
    getJoinDate(memberId) { return this.joined.get(memberId) || null; }

    daysSinceJoin(memberId) {
        const d = this.joined.get(memberId);
        if (!d) return 0;
        return Math.floor((Date.now() - d) / (24 * 60 * 60 * 1000));
    }
    seniorityScore(memberId) {
        return this.daysSinceJoin(memberId);
    }

    getTier(memberId) {
        const days = this.daysSinceJoin(memberId);
        const t = this.config.tierThresholds;
        if (days >= t[4]) return 'elder';
        if (days >= t[3]) return 'veteran';
        if (days >= t[2]) return 'senior';
        if (days >= t[1]) return 'junior';
        return 'novice';
    }

    isTier(memberId, tier) { return this.getTier(memberId) === tier; }
    byTier(tier) { return [...this.joined.keys()].filter(id => this.getTier(id) === tier); }

    rankBySeniority() {
        return [...this.joined.entries()]
            .map(([id, ts]) => ({ memberId: id, joinDate: ts, days: this.daysSinceJoin(id), tier: this.getTier(id) }))
            .sort((a, b) => a.joinDate - b.joinDate);
    }

    topSenior(n = 5) { return this.rankBySeniority().slice(0, n); }
    bottomSenior(n = 5) {
        return this.rankBySeniority().reverse().slice(0, n);
    }

    isMoreSenior(a, b) {
        const da = this.joined.get(a);
        const db = this.joined.get(b);
        if (!da || !db) return false;
        return da < db;
    }
    seniorityGap(a, b) {
        return Math.abs(this.daysSinceJoin(a) - this.daysSinceJoin(b));
    }
    distribution() {
        const dist = {};
        for (const t of SENIORITY_TIERS) dist[t] = 0;
        for (const id of this.joined.keys()) {
            const t = this.getTier(id);
            dist[t] = (dist[t] || 0) + 1;
        }
        return dist;
    }
    report() { return { total: this.stats.total, distribution: this.distribution() }; }
    reset() { this.joined.clear(); this.stats = { total: 0 }; }
}
