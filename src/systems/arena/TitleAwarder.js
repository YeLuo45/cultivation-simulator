/**
 * TitleAwarder.js - 头衔授予器
 * V1031 P-20260614-191 Round 39 Iter 24/30
 */
export const TITLE_TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'mythic'];
export const TITLE_CATEGORIES = ['combat', 'tournament', 'season', 'achievement', 'special'];

export class TitleAwarder {
    constructor(config = {}) {
        this.config = { ...config };
        this.titles = new Map();     // titleId -> { id, name, tier, category, requirement, holders }
        this.byPlayer = new Map();   // playerId -> [titleId]
        this.hooks = new Map();
        this.stats = { total: 0, awarded: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ttl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(name, tier, category, requirement) {
        if (!name) return null;
        if (!TITLE_TIERS.includes(tier)) tier = 'bronze';
        if (!TITLE_CATEGORIES.includes(category)) category = 'achievement';
        const id = this._newId();
        const t = { id, name, tier, category, requirement: requirement || '', holders: new Set(), createdAt: Date.now() };
        this.titles.set(id, t);
        this.stats.total++;
        return t;
    }
    get(id) { return this.titles.get(id) || null; }
    listAll() { return [...this.titles.values()]; }
    listByTier(tier) { return this.listAll().filter(t => t.tier === tier); }
    listByCategory(cat) { return this.listAll().filter(t => t.category === cat); }
    listForPlayer(playerId) {
        return (this.byPlayer.get(playerId) || []).map(id => this.titles.get(id)).filter(Boolean);
    }

    award(titleId, playerId) {
        const t = this.titles.get(titleId);
        if (!t) return false;
        t.holders.add(playerId);
        if (!this.byPlayer.has(playerId)) this.byPlayer.set(playerId, []);
        this.byPlayer.get(playerId).push(titleId);
        this.stats.awarded++;
        this._emit('awarded', { titleId, playerId });
        return true;
    }
    revoke(titleId, playerId) {
        const t = this.titles.get(titleId);
        if (!t) return false;
        t.holders.delete(playerId);
        if (this.byPlayer.has(playerId)) {
            this.byPlayer.set(playerId, this.byPlayer.get(playerId).filter(id => id !== titleId));
        }
        return true;
    }
    hasTitle(playerId, titleId) {
        return (this.byPlayer.get(playerId) || []).includes(titleId);
    }
    count(playerId) { return this.byPlayer.get(playerId)?.length || 0; }
    countByTitle(titleId) { return this.titles.get(titleId)?.holders.size || 0; }
    holdersOf(titleId) { return [...(this.titles.get(titleId)?.holders || [])]; }
    bestTierFor(playerId) {
        const t = this.listForPlayer(playerId);
        if (t.length === 0) return null;
        const order = TITLE_TIERS;
        return t.reduce((best, x) => order.indexOf(x.tier) > order.indexOf(best?.tier || 'bronze') ? x : best, null);
    }
    topHolders(n = 5) {
        return [...this.titles.values()].sort((a, b) => b.holders.size - a.holders.size).slice(0, n);
    }
    report() { return { total: this.stats.total, awarded: this.stats.awarded, players: this.byPlayer.size }; }
    reset() { this.titles.clear(); this.byPlayer.clear(); this.stats = { total: 0, awarded: 0 }; }
}
