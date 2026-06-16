/**
 * PlayerPreferenceGraph.js - 玩家偏好图
 * V960 P-20260614-013 Iteration 13/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (ruflo graph structure):
 * - 追踪玩家对各内容类型/活动的偏好
 * - 维护偏好关系图 (correlate/dislike)
 * - 推荐匹配的活动
 */

export const PREFERENCE_CATEGORIES = ['pve', 'pvp', 'craft', 'social', 'explore', 'achievement', 'story'];
export const MAX_NODES = 200;

export class PlayerPreferenceGraph {
    constructor(config = {}) {
        this.config = {
            maxNodes: config.maxNodes !== undefined ? config.maxNodes : MAX_NODES,
            ...config,
        };
        this.preferences = new Map();      // playerId -> Map<category, weight>
        this.relations = new Map();       // playerId -> Map<cat1, Map<cat2, correlation>>
        this.hooks = new Map();
        this.stats = { totalUpdates: 0, totalRelations: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    initPlayer(playerId) {
        if (!this.preferences.has(playerId)) {
            this.preferences.set(playerId, new Map());
            for (const c of PREFERENCE_CATEGORIES) this.preferences.get(playerId).set(c, 0);
        }
    }

    recordPreference(playerId, category, weight) {
        if (!playerId || !PREFERENCE_CATEGORIES.includes(category)) return null;
        if (typeof weight !== 'number') return null;
        this.initPlayer(playerId);
        const current = this.preferences.get(playerId).get(category);
        const newWeight = current + weight;
        this.preferences.get(playerId).set(category, newWeight);
        this.stats.totalUpdates++;
        this._emit('preferenceUpdated', { playerId, category, weight: newWeight });
        return newWeight;
    }

    recordCoPreference(playerId, cat1, cat2) {
        if (!PREFERENCE_CATEGORIES.includes(cat1) || !PREFERENCE_CATEGORIES.includes(cat2)) return null;
        if (cat1 === cat2) return null;
        if (!this.relations.has(playerId)) this.relations.set(playerId, new Map());
        const rmap = this.relations.get(playerId);
        if (!rmap.has(cat1)) rmap.set(cat1, new Map());
        const c1map = rmap.get(cat1);
        c1map.set(cat2, (c1map.get(cat2) || 0) + 1);
        if (!rmap.has(cat2)) rmap.set(cat2, new Map());
        rmap.get(cat2).set(cat1, (rmap.get(cat2).get(cat1) || 0) + 1);
        this.stats.totalRelations++;
        return true;
    }

    getWeight(playerId, category) {
        const pmap = this.preferences.get(playerId);
        if (!pmap) return 0;
        return pmap.get(category) || 0;
    }

    topCategories(playerId, n = 3) {
        const pmap = this.preferences.get(playerId);
        if (!pmap) return [];
        return [...pmap.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([c]) => c);
    }

    dislikedCategories(playerId) {
        const pmap = this.preferences.get(playerId);
        if (!pmap) return [];
        return [...pmap.entries()].filter(([_, w]) => w < 0).map(([c]) => c);
    }

    correlatedWith(playerId, category) {
        const rmap = this.relations.get(playerId);
        if (!rmap) return [];
        const cmap = rmap.get(category);
        if (!cmap) return [];
        return [...cmap.entries()].sort((a, b) => b[1] - a[1]).map(([c, w]) => ({ category: c, weight: w }));
    }

    recommendActivity(playerId) {
        const top = this.topCategories(playerId, 1);
        if (top.length === 0) return null;
        const topCat = top[0];
        const correlated = this.correlatedWith(playerId, topCat);
        return correlated.length > 0 ? correlated[0].category : topCat;
    }

    getPreferences(playerId) {
        return this.preferences.get(playerId) || null;
    }

    getRelations(playerId) {
        return this.relations.get(playerId) || null;
    }

    report(playerId) {
        return {
            playerId,
            topCategories: this.topCategories(playerId),
            disliked: this.dislikedCategories(playerId),
            recommended: this.recommendActivity(playerId),
        };
    }

    reset() {
        this.preferences.clear();
        this.relations.clear();
        this.stats = { totalUpdates: 0, totalRelations: 0 };
    }
}
