/**
 * InnateAbility.js - 先天异能
 * V1100 P-20260614-602 Round 42 Iter 3/30
 */
export const ABILITY_TYPES = ['combat', 'support', 'control', 'escape', 'utility', 'sealing'];
export const ABILITY_TIERS = ['common', 'rare', 'epic', 'legendary', 'mythic'];

export class InnateAbility {
    constructor(config = {}) {
        this.config = { ...config };
        this.abilities = new Map();   // abilityId -> { id, name, type, tier, power, cooldown, owner }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalPower: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    grant(name, type, tier = 'common', power = 1, owner = null, cooldown = 0) {
        if (!name) return null;
        if (!ABILITY_TYPES.includes(type)) type = 'combat';
        if (!ABILITY_TIERS.includes(tier)) tier = 'common';
        const id = this._newId();
        const a = { id, name, type, tier, power, cooldown, owner };
        this.abilities.set(id, a);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        this.stats.total++;
        this.stats.totalPower += power;
        return a;
    }
    get(id) { return this.abilities.get(id) || null; }
    listAll() { return [...this.abilities.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.abilities.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(a => a.type === type); }
    listByTier(tier) { return this.listAll().filter(a => a.tier === tier); }
    listLegendary() { return this.listAll().filter(a => a.tier === 'legendary' || a.tier === 'mythic'); }

    setPower(id, power) {
        const a = this.abilities.get(id);
        if (!a) return false;
        a.power = Math.max(0, power);
        this.stats.totalPower = this.listAll().reduce((s, x) => s + x.power, 0);
        return true;
    }
    setCooldown(id, cd) {
        const a = this.abilities.get(id);
        if (!a) return false;
        a.cooldown = Math.max(0, cd);
        return true;
    }
    setOwner(id, owner) {
        const a = this.abilities.get(id);
        if (!a) return false;
        a.owner = owner;
        return true;
    }
    isLegendary(id) { return this.abilities.get(id)?.tier === 'legendary' || this.abilities.get(id)?.tier === 'mythic'; }
    isMythic(id) { return this.abilities.get(id)?.tier === 'mythic'; }
    powerOf(id) { return this.abilities.get(id)?.power || 0; }
    typeOf(id) { return this.abilities.get(id)?.type || null; }
    tierOf(id) { return this.abilities.get(id)?.tier || null; }
    ownerOf(id) { return this.abilities.get(id)?.owner || null; }
    averagePower() { return this.stats.total === 0 ? 0 : this.stats.totalPower / this.stats.total; }
    bestPower() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, a) => !best || a.power > best.power ? a : best, null);
    }
    countByTier() {
        const c = {};
        for (const t of ABILITY_TIERS) c[t] = 0;
        for (const a of this.abilities.values()) c[a.tier] = (c[a.tier] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, averagePower: this.averagePower() }; }
    reset() { this.abilities.clear(); this.byOwner.clear(); this.stats = { total: 0, totalPower: 0 }; }
}
