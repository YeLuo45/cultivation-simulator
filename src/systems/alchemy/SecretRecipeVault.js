/**
 * SecretRecipeVault.js - 秘方金库
 * V1060 P-20260614-250 Round 40 Iter 23/30
 */
export const VAULT_SECURITY = ['public', 'restricted', 'confidential', 'top_secret'];
export const ACCESS_LEVELS = [0, 1, 2, 3];

export class SecretRecipeVault {
    constructor(config = {}) {
        this.config = { ...config };
        this.vault = new Map();   // recipeId -> { id, name, ingredients, security, owner, ts }
        this.accessLog = [];      // [{ userId, recipeId, ts }]
        this.hooks = new Map();
        this.stats = { total: 0, accesses: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    store(name, ingredients, security = 'restricted', owner = null) {
        if (!name) return null;
        if (!VAULT_SECURITY.includes(security)) security = 'restricted';
        if (!Array.isArray(ingredients)) return null;
        const id = this._newId();
        const r = { id, name, ingredients: [...ingredients], security, owner, createdAt: Date.now() };
        this.vault.set(id, r);
        this.stats.total++;
        return r;
    }
    get(id) { return this.vault.get(id) || null; }
    listAll() { return [...this.vault.values()]; }
    listBySecurity(security) { return this.listAll().filter(r => r.security === security); }
    listPublic() { return this.listBySecurity('public'); }
    listByOwner(owner) { return this.listAll().filter(r => r.owner === owner); }

    canAccess(userLevel, recipeId) {
        const r = this.vault.get(recipeId);
        if (!r) return false;
        const recipeLevel = ACCESS_LEVELS[VAULT_SECURITY.indexOf(r.security)] || 0;
        return userLevel >= recipeLevel;
    }
    access(userId, recipeId, userLevel = 0) {
        if (!this.canAccess(userLevel, recipeId)) return null;
        this.accessLog.push({ userId, recipeId, ts: Date.now() });
        this.stats.accesses++;
        this._emit('accessed', { userId, recipeId });
        return this.vault.get(recipeId);
    }
    setSecurity(recipeId, security) {
        const r = this.vault.get(recipeId);
        if (!r) return false;
        if (!VAULT_SECURITY.includes(security)) return false;
        r.security = security;
        return true;
    }
    transfer(recipeId, newOwner) {
        const r = this.vault.get(recipeId);
        if (!r) return false;
        r.owner = newOwner;
        r.transferredAt = Date.now();
        return true;
    }
    isPublic(id) { return this.vault.get(id)?.security === 'public'; }
    isTopSecret(id) { return this.vault.get(id)?.security === 'top_secret'; }
    recentAccesses(n = 10) { return [...this.accessLog].slice(-n).reverse(); }
    countBySecurity() {
        const c = {};
        for (const s of VAULT_SECURITY) c[s] = 0;
        for (const r of this.vault.values()) c[r.security] = (c[r.security] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, accesses: this.stats.accesses }; }
    reset() { this.vault.clear(); this.accessLog = []; this.stats = { total: 0, accesses: 0 }; }
}
