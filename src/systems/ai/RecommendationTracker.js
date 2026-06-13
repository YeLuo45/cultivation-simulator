/**
 * RecommendationTracker.js - 建议追踪器
 * V973 P-20260614-026 Iteration 26/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (generic-agent feedback loops):
 * - 追踪每条建议 (advice → action → outcome)
 * - 标记 accepted/ignored
 * - 计算 acceptance rate
 */

export const RECOMMENDATION_STATUS = ['pending', 'accepted', 'ignored', 'completed'];
export const DEFAULT_MAX_RECOMMENDATIONS = 200;

export class RecommendationTracker {
    constructor(config = {}) {
        this.config = { maxRecommendations: config.maxRecommendations || DEFAULT_MAX_RECOMMENDATIONS, ...config };
        this.recommendations = new Map();   // recId -> { playerId, advice, status, ts, action, outcome }
        this.playerRecs = new Map();        // playerId -> [recId]
        this.hooks = new Map();
        this.stats = { total: 0, accepted: 0, completed: 0, ignored: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    _newId() { return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    record(playerId, advice) {
        if (!playerId || !advice) return null;
        const id = this._newId();
        const rec = { id, playerId, advice, status: 'pending', ts: Date.now() };
        this.recommendations.set(id, rec);
        if (!this.playerRecs.has(playerId)) this.playerRecs.set(playerId, []);
        this.playerRecs.get(playerId).push(id);
        if (this.playerRecs.get(playerId).length > this.config.maxRecommendations) this.playerRecs.get(playerId).shift();
        this.stats.total++;
        this._emit('recorded', rec);
        return rec;
    }

    accept(recId) {
        const r = this.recommendations.get(recId);
        if (!r) return null;
        r.status = 'accepted';
        r.actionTs = Date.now();
        this.stats.accepted++;
        this._emit('accepted', r);
        return r;
    }

    ignore(recId) {
        const r = this.recommendations.get(recId);
        if (!r) return null;
        r.status = 'ignored';
        r.ignoreTs = Date.now();
        this.stats.ignored++;
        this._emit('ignored', r);
        return r;
    }

    complete(recId, outcome = {}) {
        const r = this.recommendations.get(recId);
        if (!r) return null;
        r.status = 'completed';
        r.completedTs = Date.now();
        r.outcome = outcome;
        this.stats.completed++;
        this._emit('completed', r);
        return r;
    }

    getRecommendation(recId) { return this.recommendations.get(recId) || null; }

    listPlayerRecs(playerId, status = null) {
        const ids = this.playerRecs.get(playerId) || [];
        const recs = ids.map(id => this.recommendations.get(id)).filter(Boolean);
        if (status) return recs.filter(r => r.status === status);
        return recs;
    }

    acceptanceRate(playerId) {
        const list = this.listPlayerRecs(playerId);
        if (list.length === 0) return 0;
        return list.filter(r => r.status === 'accepted' || r.status === 'completed').length / list.length;
    }

    completionRate(playerId) {
        const list = this.listPlayerRecs(playerId);
        if (list.length === 0) return 0;
        return list.filter(r => r.status === 'completed').length / list.length;
    }

    pendingCount(playerId) {
        return this.listPlayerRecs(playerId, 'pending').length;
    }

    report(playerId) {
        return {
            playerId,
            total: this.listPlayerRecs(playerId).length,
            pending: this.pendingCount(playerId),
            accepted: this.listPlayerRecs(playerId, 'accepted').length,
            completed: this.listPlayerRecs(playerId, 'completed').length,
            ignored: this.listPlayerRecs(playerId, 'ignored').length,
            acceptanceRate: this.acceptanceRate(playerId),
            completionRate: this.completionRate(playerId),
        };
    }

    reset() {
        this.recommendations.clear();
        this.playerRecs.clear();
        this.stats = { total: 0, accepted: 0, completed: 0, ignored: 0 };
    }
}
