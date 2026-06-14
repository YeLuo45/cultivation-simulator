/**
 * WeaponForge.js - 武器锻造炉
 * V1023 P-20260614-183 Round 39 Iter 16/30
 */
export const WEAPON_TYPES = ['sword', 'blade', 'spear', 'hammer', 'staff', 'dagger', 'fan', 'whip'];
export const QUALITY_LEVELS = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
export const QUALITY_MULT = [1, 1.2, 1.5, 2.0, 3.0];

export class WeaponForge {
    constructor(config = {}) {
        this.config = { ...config };
        this.weapons = new Map();   // weaponId -> { id, name, type, quality, atk, element, traits, owner }
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `wpn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    forge(name, type, quality = 'common', atk = 10, element = 'none') {
        if (!name || !WEAPON_TYPES.includes(type)) return null;
        if (!QUALITY_LEVELS.includes(quality)) quality = 'common';
        const id = this._newId();
        const w = { id, name, type, quality, atk: atk * (QUALITY_MULT[QUALITY_LEVELS.indexOf(quality)] || 1), element, traits: [], owner: null, forgedAt: Date.now() };
        this.weapons.set(id, w);
        this.stats.total++;
        this._emit('forged', w);
        return w;
    }
    get(id) { return this.weapons.get(id) || null; }
    listAll() { return [...this.weapons.values()]; }
    listByType(type) { return this.listAll().filter(w => w.type === type); }
    listByQuality(quality) { return this.listAll().filter(w => w.quality === quality); }
    listByOwner(owner) { return this.listAll().filter(w => w.owner === owner); }
    listUnowned() { return this.listAll().filter(w => !w.owner); }

    addTrait(weaponId, trait) {
        const w = this.weapons.get(weaponId);
        if (!w) return false;
        w.traits.push(trait);
        return true;
    }
    hasTrait(weaponId, trait) {
        return (this.weapons.get(weaponId)?.traits || []).includes(trait);
    }
    setOwner(weaponId, ownerId) {
        const w = this.weapons.get(weaponId);
        if (!w) return false;
        w.owner = ownerId;
        this._emit('equipped', { weaponId, ownerId });
        return true;
    }
    unequip(weaponId) {
        const w = this.weapons.get(weaponId);
        if (!w) return false;
        const prev = w.owner;
        w.owner = null;
        this._emit('unequipped', { weaponId, prev });
        return true;
    }
    isOwned(weaponId) { return !!this.weapons.get(weaponId)?.owner; }
    ownerOf(weaponId) { return this.weapons.get(weaponId)?.owner || null; }
    countByType() {
        const c = {};
        for (const t of WEAPON_TYPES) c[t] = 0;
        for (const w of this.weapons.values()) c[w.type] = (c[w.type] || 0) + 1;
        return c;
    }
    bestFor(ownerId) {
        const owned = this.listByOwner(ownerId);
        if (owned.length === 0) return null;
        return owned.reduce((best, w) => !best || w.atk > best.atk ? w : best, null);
    }
    countByQuality() {
        const c = {};
        for (const q of QUALITY_LEVELS) c[q] = 0;
        for (const w of this.weapons.values()) c[w.quality] = (c[w.quality] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, byType: this.countByType() }; }
    reset() { this.weapons.clear(); this.stats = { total: 0 }; }
}
