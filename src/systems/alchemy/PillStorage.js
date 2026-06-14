/**
 * PillStorage.js - 丹药库存
 * V1053 P-20260614-243 Round 40 Iter 16/30
 */
export const PILL_RARITY = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export class PillStorage {
    constructor(config = {}) {
        this.config = { ...config };
        this.storage = new Map();   // pillId -> { id, name, type, rarity, count, owner, createdAt }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalPills: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `pls_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    add(pillName, type, rarity, count = 1, owner = null) {
        if (!pillName) return null;
        if (!PILL_RARITY.includes(rarity)) rarity = 'common';
        if (typeof count !== 'number' || count <= 0) return null;
        const id = this._newId();
        const p = { id, name: pillName, type, rarity, count, owner, createdAt: Date.now() };
        this.storage.set(id, p);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        this.stats.total++;
        this.stats.totalPills += count;
        this._emit('added', p);
        return p;
    }
    get(id) { return this.storage.get(id) || null; }
    listAll() { return [...this.storage.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.storage.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(p => p.type === type); }
    listByRarity(rarity) { return this.listAll().filter(p => p.rarity === rarity); }

    take(id, amount = 1) {
        const p = this.storage.get(id);
        if (!p) return false;
        if (p.count < amount) return false;
        p.count -= amount;
        this.stats.totalPills -= amount;
        if (p.count === 0) this.storage.delete(id);
        this._emit('taken', { id, amount });
        return true;
    }
    consume(id) { return this.take(id, 1); }
    has(id, amount = 1) { return (this.storage.get(id)?.count || 0) >= amount; }
    countOf(id) { return this.storage.get(id)?.count || 0; }
    setOwner(id, owner) {
        const p = this.storage.get(id);
        if (!p) return false;
        if (p.owner) {
            const arr = this.byOwner.get(p.owner);
            if (arr) this.byOwner.set(p.owner, arr.filter(x => x !== id));
        }
        p.owner = owner;
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        return true;
    }
    ownerCount(owner) { return this.listByOwner(owner).reduce((s, p) => s + p.count, 0); }
    totalCount() { return this.listAll().reduce((s, p) => s + p.count, 0); }
    report() { return { total: this.stats.total, totalPills: this.stats.totalPills }; }
    reset() { this.storage.clear(); this.byOwner.clear(); this.stats = { total: 0, totalPills: 0 }; }
}
