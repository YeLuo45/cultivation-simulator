/**
 * ArenaSelector.js - 场地选择器
 * V1011 P-20260614-171 Round 39 Iter 4/30
 */
export const ARENA_TYPES = ['plain', 'mountain', 'forest', 'desert', 'lake', 'volcano', 'sky', 'underwater'];
export const ARENA_STATUS = ['available', 'occupied', 'maintenance'];

export class ArenaSelector {
    constructor(config = {}) {
        this.config = { ...config };
        this.arenas = new Map();    // arenaId -> { id, name, type, status, bonuses, capacity }
        this.bookings = new Map();   // arenaId -> [{ matchId, ts, duration }]
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `arn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    addArena(name, type, capacity = 2) {
        if (!name || !ARENA_TYPES.includes(type)) return null;
        const id = this._newId();
        const a = { id, name, type, status: 'available', bonuses: this._defaultBonuses(type), capacity, createdAt: Date.now() };
        this.arenas.set(id, a);
        this.stats.total++;
        return a;
    }
    _defaultBonuses(type) {
        const m = { plain: {}, mountain: { physical: 5 }, forest: { wood: 5 }, desert: { fire: 5 }, lake: { water: 5 }, volcano: { fire: 10 }, sky: { wind: 5 }, underwater: { water: 10 } };
        return m[type] || {};
    }
    get(id) { return this.arenas.get(id) || null; }
    listAll() { return [...this.arenas.values()]; }
    listByType(type) { return this.listAll().filter(a => a.type === type); }
    listByStatus(st) { return this.listAll().filter(a => a.status === st); }
    setStatus(id, status) {
        const a = this.arenas.get(id);
        if (!a) return false;
        if (!ARENA_STATUS.includes(status)) return false;
        a.status = status;
        return true;
    }
    setBonus(id, element, value) {
        const a = this.arenas.get(id);
        if (!a) return false;
        a.bonuses[element] = value;
        return true;
    }

    book(arenaId, matchId, durationMs = 30 * 60 * 1000) {
        const a = this.arenas.get(arenaId);
        if (!a) return false;
        if (a.status !== 'available') return false;
        a.status = 'occupied';
        if (!this.bookings.has(arenaId)) this.bookings.set(arenaId, []);
        this.bookings.get(arenaId).push({ matchId, ts: Date.now(), duration: durationMs, status: 'active' });
        this._emit('booked', { arenaId, matchId });
        return true;
    }
    release(arenaId, matchId) {
        const a = this.arenas.get(arenaId);
        if (!a) return false;
        const bs = this.bookings.get(arenaId) || [];
        for (const b of bs) if (b.matchId === matchId) b.status = 'completed';
        a.status = 'available';
        return true;
    }
    bookingHistory(arenaId) { return [...(this.bookings.get(arenaId) || [])]; }
    isBooked(arenaId) { return this.arenas.get(arenaId)?.status === 'occupied'; }

    select(requirements = {}) {
        const candidates = this.listByStatus('available');
        if (candidates.length === 0) return null;
        if (requirements.type) {
            const filtered = candidates.filter(a => a.type === requirements.type);
            if (filtered.length > 0) return filtered[0];
        }
        return candidates[0];
    }
    isElementStrong(arenaId, element) {
        const a = this.arenas.get(arenaId);
        if (!a) return false;
        return (a.bonuses[element] || 0) > 5;
    }
    countByType() {
        const c = {};
        for (const t of ARENA_TYPES) c[t] = 0;
        for (const a of this.arenas.values()) c[a.type] = (c[a.type] || 0) + 1;
        return c;
    }
    report_() { return { total: this.stats.total, byType: this.countByType() }; }
    reset() { this.arenas.clear(); this.bookings.clear(); this.stats = { total: 0 }; }
}
