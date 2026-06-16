/**
 * BreakthroughCatalyst.js - 突破催化器
 * V1034 P-20260614-194 Round 39 Iter 27/30
 */
export const CATALYST_TYPES = ['pill', 'tribulation', 'insight', 'technique', 'mentor', 'env_pill'];
export const CATALYST_RARITY = ['common', 'rare', 'epic', 'legendary'];
export const RARITY_MULT = [1, 1.5, 2.5, 5];

export class BreakthroughCatalyst {
    constructor(config = {}) {
        this.config = { ...config };
        this.catalysts = new Map();   // catalystId -> { id, type, rarity, boost, owner, used }
        this.history = new Map();     // playerId -> [catalystId]
        this.hooks = new Map();
        this.stats = { total: 0, totalUsed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(type, rarity, baseBoost = 10) {
        if (!CATALYST_TYPES.includes(type)) return null;
        if (!CATALYST_RARITY.includes(rarity)) rarity = 'common';
        const id = this._newId();
        const c = { id, type, rarity, boost: baseBoost * (RARITY_MULT[CATALYST_RARITY.indexOf(rarity)] || 1), used: false, owner: null, createdAt: Date.now() };
        this.catalysts.set(id, c);
        this.stats.total++;
        return c;
    }
    get(id) { return this.catalysts.get(id) || null; }
    listAll() { return [...this.catalysts.values()]; }
    listByType(type) { return this.listAll().filter(c => c.type === type); }
    listByRarity(rarity) { return this.listAll().filter(c => c.rarity === rarity); }
    listOwned(owner) { return this.listAll().filter(c => c.owner === owner); }
    listUnused() { return this.listAll().filter(c => !c.used); }
    setOwner(catalystId, owner) {
        const c = this.catalysts.get(catalystId);
        if (!c) return false;
        c.owner = owner;
        return true;
    }

    use(catalystId) {
        const c = this.catalysts.get(catalystId);
        if (!c) return null;
        if (c.used) return null;
        c.used = true;
        c.usedAt = Date.now();
        if (c.owner) {
            if (!this.history.has(c.owner)) this.history.set(c.owner, []);
            this.history.get(c.owner).push(catalystId);
        }
        this.stats.totalUsed++;
        this._emit('used', { catalystId, owner: c.owner, boost: c.boost });
        return c;
    }
    totalBoostFor(playerId) {
        return this.listOwned(playerId).filter(c => c.used).reduce((s, c) => s + c.boost, 0);
    }
    bestForType(playerId, type) {
        const owned = this.listOwned(playerId).filter(c => c.type === type && !c.used);
        if (owned.length === 0) return null;
        return owned.reduce((best, c) => !best || c.boost > best.boost ? c : best, null);
    }
    hasUnused(playerId) { return this.listOwned(playerId).some(c => !c.used); }
    unusedCount(playerId) { return this.listOwned(playerId).filter(c => !c.used).length; }
    history_(playerId) { return [...(this.history.get(playerId) || [])]; }
    isUsable(catalystId) {
        const c = this.catalysts.get(catalystId);
        return c ? !c.used : false;
    }
    report() { return { total: this.stats.total, totalUsed: this.stats.totalUsed }; }
    reset() { this.catalysts.clear(); this.history.clear(); this.stats = { total: 0, totalUsed: 0 }; }
}
