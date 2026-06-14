/**
 * SealVault.js - 封印仓库
 * V1142 Round 43 Iter 15/30
 */
export const VAULT_LEVELS = ['public', 'restricted', 'confidential', 'top_secret', 'forbidden'];
export const VAULT_SIZES = ['small', 'medium', 'large', 'vast', 'infinite'];

export class SealVault {
    constructor(config = {}) {
        this.config = { ...config };
        this.vaults = new Map();   // vid -> { id, owner, name, level, size, seals, capacity }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalCapacity: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `sv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    openVault(owner, name, size = 'medium', level = 'public', capacity = 50) {
        if (!owner || !name) return null;
        if (!VAULT_LEVELS.includes(level)) level = 'public';
        if (!VAULT_SIZES.includes(size)) size = 'medium';
        const id = this._newId();
        const v = { id, owner, name, level, size, seals: [], capacity, count: 0 };
        this.vaults.set(id, v);
        if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
        this.byOwner.get(owner).push(id);
        this.stats.total++;
        this.stats.totalCapacity += capacity;
        this._emit('opened', v);
        return v;
    }
    get(id) { return this.vaults.get(id) || null; }
    listAll() { return [...this.vaults.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.vaults.get(id)).filter(Boolean);
    }
    listByLevel(l) { return this.listAll().filter(v => v.level === l); }
    listBySize(s) { return this.listAll().filter(v => v.size === s); }
    listForbidden() { return this.listByLevel('forbidden'); }

    store(vaultId, seal) {
        const v = this.vaults.get(vaultId);
        if (!v) return false;
        if (v.count >= v.capacity) return false;
        v.seals.push(seal);
        v.count++;
        this._emit('stored', { vaultId, seal });
        return true;
    }
    retrieve(vaultId, seal) {
        const v = this.vaults.get(vaultId);
        if (!v) return false;
        const idx = v.seals.indexOf(seal);
        if (idx === -1) return false;
        v.seals.splice(idx, 1);
        v.count--;
        return true;
    }
    setLevel(vaultId, level) {
        const v = this.vaults.get(vaultId);
        if (!v) return false;
        if (!VAULT_LEVELS.includes(level)) return false;
        v.level = level;
        return true;
    }
    setSize(vaultId, size) {
        const v = this.vaults.get(vaultId);
        if (!v) return false;
        if (!VAULT_SIZES.includes(size)) return false;
        v.size = size;
        return true;
    }
    setCapacity(vaultId, capacity) {
        const v = this.vaults.get(vaultId);
        if (!v) return false;
        v.capacity = Math.max(0, capacity);
        this.stats.totalCapacity = this.listAll().reduce((s, x) => s + x.capacity, 0);
        return true;
    }
    isFull(vaultId) { const v = this.vaults.get(vaultId); return v ? v.count >= v.capacity : false; }
    isEmpty(vaultId) { return (this.vaults.get(vaultId)?.count || 0) === 0; }
    hasSeal(vaultId, seal) { return (this.vaults.get(vaultId)?.seals || []).includes(seal); }
    countOf(vaultId) { return this.vaults.get(vaultId)?.count || 0; }
    capacityOf(vaultId) { return this.vaults.get(vaultId)?.capacity || 0; }
    levelOf(vaultId) { return this.vaults.get(vaultId)?.level || null; }
    sealsOf(vaultId) { return [...(this.vaults.get(vaultId)?.seals || [])]; }
    utilization(vaultId) {
        const v = this.vaults.get(vaultId);
        return !v || v.capacity === 0 ? 0 : v.count / v.capacity;
    }
    averageUtilization() {
        if (this.vaults.size === 0) return 0;
        return this.listAll().reduce((s, v) => s + v.count / v.capacity, 0) / this.vaults.size;
    }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    countByLevel() {
        const c = {};
        for (const l of VAULT_LEVELS) c[l] = 0;
        for (const v of this.vaults.values()) c[v.level] = (c[v.level] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalCapacity: this.stats.totalCapacity, averageUtilization: this.averageUtilization() }; }
    reset() { this.vaults.clear(); this.byOwner.clear(); this.stats = { total: 0, totalCapacity: 0 }; }
}
