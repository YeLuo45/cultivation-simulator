/**
 * ArtifactForge.js - 法宝锻造
 * V1113 P-20260614-806 Round 42 Iter 16/30
 */
export const ARTIFACT_TYPES = ['sword', 'blade', 'staff', 'cauldron', 'mirror', 'bead', 'banner', 'seal', 'pagoda', 'umbrella'];
export const ARTIFACT_RARITY = ['common', 'rare', 'epic', 'legendary', 'divine', 'chaos'];

export class ArtifactForge {
    constructor(config = {}) {
        this.config = { ...config };
        this.artifacts = new Map();   // aid -> { id, name, type, rarity, power, owner, ts }
        this.byOwner = new Map();
        this.byType = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalPower: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `af_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    forge(name, type, rarity = 'common', power = 1, owner = null) {
        if (!name) return null;
        if (!ARTIFACT_TYPES.includes(type)) type = 'sword';
        if (!ARTIFACT_RARITY.includes(rarity)) rarity = 'common';
        const id = this._newId();
        const a = { id, name, type, rarity, power, owner, ts: Date.now() };
        this.artifacts.set(id, a);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        if (!this.byType.has(type)) this.byType.set(type, new Set());
        this.byType.get(type).add(id);
        this.stats.total++;
        this.stats.totalPower += power;
        this._emit('forged', a);
        return a;
    }
    get(id) { return this.artifacts.get(id) || null; }
    listAll() { return [...this.artifacts.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.artifacts.get(id)).filter(Boolean);
    }
    listByType(type) {
        const ids = this.byType.get(type) || new Set();
        return [...ids].map(id => this.artifacts.get(id)).filter(Boolean);
    }
    listByRarity(r) { return this.listAll().filter(a => a.rarity === r); }
    listDivine() { return this.listAll().filter(a => a.rarity === 'divine' || a.rarity === 'chaos'); }

    setPower(id, power) {
        const a = this.artifacts.get(id);
        if (!a) return false;
        a.power = Math.max(0, power);
        this.stats.totalPower = this.listAll().reduce((s, x) => s + x.power, 0);
        return true;
    }
    setOwner(id, owner) {
        const a = this.artifacts.get(id);
        if (!a) return false;
        a.owner = owner;
        return true;
    }
    isDivine(id) { const r = this.artifacts.get(id)?.rarity; return r === 'divine' || r === 'chaos'; }
    isChaos(id) { return this.artifacts.get(id)?.rarity === 'chaos'; }
    powerOf(id) { return this.artifacts.get(id)?.power || 0; }
    typeOf(id) { return this.artifacts.get(id)?.type || null; }
    rarityOf(id) { return this.artifacts.get(id)?.rarity || null; }
    ownerOf(id) { return this.artifacts.get(id)?.owner || null; }
    averagePower() { return this.stats.total === 0 ? 0 : this.stats.totalPower / this.stats.total; }
    bestPower() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, a) => !best || a.power > best.power ? a : best, null);
    }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    countByRarity() {
        const c = {};
        for (const r of ARTIFACT_RARITY) c[r] = 0;
        for (const a of this.artifacts.values()) c[a.rarity] = (c[a.rarity] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalPower: this.stats.totalPower, averagePower: this.averagePower() }; }
    reset() { this.artifacts.clear(); this.byOwner.clear(); this.byType.clear(); this.stats = { total: 0, totalPower: 0 }; }
}
