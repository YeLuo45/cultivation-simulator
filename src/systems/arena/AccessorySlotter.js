/**
 * AccessorySlotter.js - 饰品装配器
 * V1025 P-20260614-185 Round 39 Iter 18/30
 */
export const ACCESSORY_SLOTS = ['ring1', 'ring2', 'amulet', 'belt', 'cape', 'charm'];
export const MAX_SLOTS = ACCESSORY_SLOTS.length;

export class AccessorySlotter {
    constructor(config = {}) {
        this.config = { maxSlots: config.maxSlots || MAX_SLOTS, ...config };
        this.accessories = new Map();  // accId -> { id, name, slot, stats }
        this.equipped = new Map();     // playerId -> { slot: accId }
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(name, slot, stats = {}) {
        if (!name || !ACCESSORY_SLOTS.includes(slot)) return null;
        const id = this._newId();
        const a = { id, name, slot, stats, createdAt: Date.now() };
        this.accessories.set(id, a);
        this.stats.total++;
        return a;
    }
    get(id) { return this.accessories.get(id) || null; }
    listAll() { return [...this.accessories.values()]; }
    listBySlot(slot) { return this.listAll().filter(a => a.slot === slot); }
    listUnequipped() {
        const equipped = new Set();
        for (const eq of this.equipped.values()) for (const id of Object.values(eq)) equipped.add(id);
        return this.listAll().filter(a => !equipped.has(a.id));
    }

    equip(playerId, accId) {
        const a = this.accessories.get(accId);
        if (!a) return false;
        if (!this.equipped.has(playerId)) this.equipped.set(playerId, {});
        const eq = this.equipped.get(playerId);
        const filled = Object.keys(eq).length;
        if (!eq[a.slot] && filled >= this.config.maxSlots) return false;
        eq[a.slot] = accId;
        this._emit('equipped', { playerId, accId, slot: a.slot });
        return true;
    }
    unequip(playerId, accId) {
        const eq = this.equipped.get(playerId);
        if (!eq) return false;
        for (const [slot, id] of Object.entries(eq)) {
            if (id === accId) { delete eq[slot]; return true; }
        }
        return false;
    }
    getEquipped(playerId) { return { ...(this.equipped.get(playerId) || {}) }; }
    hasEmptySlot(playerId) { return Object.keys(this.equipped.get(playerId) || {}).length < this.config.maxSlots; }
    totalSlots(playerId) { return Object.keys(this.equipped.get(playerId) || {}).length; }
    isEquipped(playerId, accId) {
        for (const id of Object.values(this.equipped.get(playerId) || {})) {
            if (id === accId) return true;
        }
        return false;
    }
    stat(playerId, stat) {
        let total = 0;
        for (const id of Object.values(this.equipped.get(playerId) || {})) {
            const a = this.accessories.get(id);
            if (a) total += a.stats[stat] || 0;
        }
        return total;
    }
    allStats(playerId) {
        const result = {};
        for (const id of Object.values(this.equipped.get(playerId) || {})) {
            const a = this.accessories.get(id);
            if (a) for (const [k, v] of Object.entries(a.stats)) result[k] = (result[k] || 0) + v;
        }
        return result;
    }
    report() { return { total: this.stats.total, players: this.equipped.size }; }
    reset() { this.accessories.clear(); this.equipped.clear(); this.stats = { total: 0 }; }
}
