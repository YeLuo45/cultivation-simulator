/**
 * ArmorSetManager.js - 套装管理器
 * V1024 P-20260614-184 Round 39 Iter 17/30
 */
export const ARMOR_SLOTS = ['head', 'chest', 'legs', 'feet', 'hands', 'shoulders'];
export const RARITY = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export class ArmorSetManager {
    constructor(config = {}) {
        this.config = { ...config };
        this.pieces = new Map();   // pieceId -> { id, slot, name, setId, rarity, def }
        this.equipped = new Map(); // playerId -> { slot: pieceId }
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `arm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    createPiece(name, slot, setId = null, rarity = 'common', def = 5) {
        if (!name || !ARMOR_SLOTS.includes(slot)) return null;
        if (!RARITY.includes(rarity)) rarity = 'common';
        const id = this._newId();
        const p = { id, name, slot, setId, rarity, def };
        this.pieces.set(id, p);
        this.stats.total++;
        return p;
    }
    get(id) { return this.pieces.get(id) || null; }
    listAll() { return [...this.pieces.values()]; }
    listBySlot(slot) { return this.listAll().filter(p => p.slot === slot); }
    listBySet(setId) { return this.listAll().filter(p => p.setId === setId); }
    listUnset() { return this.listAll().filter(p => !p.setId); }

    equip(playerId, pieceId) {
        const p = this.pieces.get(pieceId);
        if (!p) return false;
        if (!this.equipped.has(playerId)) this.equipped.set(playerId, {});
        this.equipped.get(playerId)[p.slot] = pieceId;
        this._emit('equipped', { playerId, pieceId });
        return true;
    }
    unequip(playerId, slot) {
        const eq = this.equipped.get(playerId);
        if (!eq) return false;
        return delete eq[slot];
    }
    getEquipped(playerId) { return { ...(this.equipped.get(playerId) || {}) }; }
    pieceInSlot(playerId, slot) {
        const id = this.equipped.get(playerId)?.[slot];
        return id ? this.pieces.get(id) : null;
    }
    isEquipped(playerId, pieceId) {
        for (const v of Object.values(this.equipped.get(playerId) || {})) {
            if (v === pieceId) return true;
        }
        return false;
    }
    totalDef(playerId) {
        let total = 0;
        for (const id of Object.values(this.equipped.get(playerId) || {})) {
            const p = this.pieces.get(id);
            if (p) total += p.def;
        }
        return total;
    }
    filledSlots(playerId) { return Object.keys(this.equipped.get(playerId) || {}).length; }
    hasFullSet(playerId, setId) {
        const setPieces = this.listBySet(setId);
        if (setPieces.length === 0) return false;
        const slots = new Set(setPieces.map(p => p.slot));
        const eq = this.equipped.get(playerId) || {};
        for (const slot of slots) if (!eq[slot]) return false;
        return true;
    }
    setPiecesEquipped(playerId, setId) {
        const setPieces = this.listBySet(setId);
        return setPieces.filter(p => this.isEquipped(playerId, p.id)).length;
    }
    report() { return { total: this.stats.total, totalEquipped: this.equipped.size }; }
    reset() { this.pieces.clear(); this.equipped.clear(); this.stats = { total: 0 }; }
}
