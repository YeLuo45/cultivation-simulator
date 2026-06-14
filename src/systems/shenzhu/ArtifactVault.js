/**
 * ArtifactVault.js - 法宝仓库
 * V1117 P-20260614-810 Round 42 Iter 20/30
 */
export const VAULT_SLOTS = 1000;
export const VAULT_SECTIONS = ['weapons', 'armor', 'accessories', 'consumables', 'treasures'];

export class ArtifactVault {
    constructor(config = {}) {
        this.config = { ...config, slots: config.slots || VAULT_SLOTS };
        this.vaults = new Map();   // vid -> { id, owner, slots, capacity, section }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalSlots: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `av_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    open(owner, capacity = 100, section = 'weapons') {
        if (!owner) return null;
        if (!VAULT_SECTIONS.includes(section)) section = 'weapons';
        const id = this._newId();
        const v = { id, owner, slots: [], capacity, section, count: 0 };
        this.vaults.set(id, v);
        if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
        this.byOwner.get(owner).push(id);
        this.stats.total++;
        this.stats.totalSlots += capacity;
        return v;
    }
    get(id) { return this.vaults.get(id) || null; }
    listAll() { return [...this.vaults.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.vaults.get(id)).filter(Boolean);
    }
    listBySection(section) { return this.listAll().filter(v => v.section === section); }

    deposit(vaultId, artifactId) {
        const v = this.vaults.get(vaultId);
        if (!v) return false;
        if (v.count >= v.capacity) return false;
        v.slots.push(artifactId);
        v.count++;
        this._emit('deposited', { vaultId, artifactId });
        return true;
    }
    withdraw(vaultId, artifactId) {
        const v = this.vaults.get(vaultId);
        if (!v) return false;
        const idx = v.slots.indexOf(artifactId);
        if (idx === -1) return false;
        v.slots.splice(idx, 1);
        v.count--;
        return true;
    }
    setCapacity(vaultId, capacity) {
        const v = this.vaults.get(vaultId);
        if (!v) return false;
        v.capacity = Math.max(0, capacity);
        this.stats.totalSlots = this.listAll().reduce((s, x) => s + x.capacity, 0);
        return true;
    }
    setSection(vaultId, section) {
        const v = this.vaults.get(vaultId);
        if (!v) return false;
        if (!VAULT_SECTIONS.includes(section)) return false;
        v.section = section;
        return true;
    }
    isFull(vaultId) { const v = this.vaults.get(vaultId); return v ? v.count >= v.capacity : false; }
    isEmpty(vaultId) { return (this.vaults.get(vaultId)?.count || 0) === 0; }
    hasArtifact(vaultId, artifactId) { return (this.vaults.get(vaultId)?.slots || []).includes(artifactId); }
    countOf(vaultId) { return this.vaults.get(vaultId)?.count || 0; }
    capacityOf(vaultId) { return this.vaults.get(vaultId)?.capacity || 0; }
    sectionOf(vaultId) { return this.vaults.get(vaultId)?.section || null; }
    slotsOf(vaultId) { return [...(this.vaults.get(vaultId)?.slots || [])]; }
    utilization(vaultId) {
        const v = this.vaults.get(vaultId);
        return !v || v.capacity === 0 ? 0 : v.count / v.capacity;
    }
    averageUtilization() {
        if (this.vaults.size === 0) return 0;
        return this.listAll().reduce((s, v) => s + v.count / v.capacity, 0) / this.vaults.size;
    }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    countBySection() {
        const c = {};
        for (const s of VAULT_SECTIONS) c[s] = 0;
        for (const v of this.vaults.values()) c[v.section] = (c[v.section] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalSlots: this.stats.totalSlots, averageUtilization: this.averageUtilization() }; }
    reset() { this.vaults.clear(); this.byOwner.clear(); this.stats = { total: 0, totalSlots: 0 }; }
}
