/**
 * FurnaceManager.js - 丹炉管理器
 * V1041 P-20260614-260 Round 40 Iter 4/30
 */
export const FURNACE_STATUS = ['idle', 'heating', 'brewing', 'cooling', 'maintenance'];
export const FURNACE_TYPES = ['basic', 'silver', 'gold', 'jade', 'divine'];

export class FurnaceManager {
    constructor(config = {}) {
        this.config = { ...config };
        this.furnaces = new Map();   // furnaceId -> { id, name, type, status, durability, capacity, maxTemp }
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `frn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    addFurnace(name, type = 'basic', capacity = 10) {
        if (!name) return null;
        if (!FURNACE_TYPES.includes(type)) type = 'basic';
        const id = this._newId();
        const f = { id, name, type, status: 'idle', durability: 100, capacity, maxTemp: this._defaultMaxTemp(type), createdAt: Date.now() };
        this.furnaces.set(id, f);
        this.stats.total++;
        return f;
    }
    _defaultMaxTemp(type) {
        const m = { basic: 100, silver: 200, gold: 400, jade: 800, divine: 1600 };
        return m[type] || 100;
    }
    get(id) { return this.furnaces.get(id) || null; }
    listAll() { return [...this.furnaces.values()]; }
    listByStatus(st) { return this.listAll().filter(f => f.status === st); }
    listByType(type) { return this.listAll().filter(f => f.type === type); }
    listAvailable() { return this.listByStatus('idle'); }

    setStatus(id, status) {
        const f = this.furnaces.get(id);
        if (!f) return false;
        if (!FURNACE_STATUS.includes(status)) return false;
        f.status = status;
        return true;
    }
    setDurability(id, value) {
        const f = this.furnaces.get(id);
        if (!f) return false;
        f.durability = Math.max(0, Math.min(100, value));
        return true;
    }
    damage(id, amount) {
        const f = this.furnaces.get(id);
        if (!f) return false;
        f.durability = Math.max(0, f.durability - amount);
        if (f.durability === 0) f.status = 'maintenance';
        return true;
    }
    repair(id, amount) {
        const f = this.furnaces.get(id);
        if (!f) return false;
        f.durability = Math.min(100, f.durability + amount);
        if (f.durability > 20) f.status = 'idle';
        return true;
    }
    isUsable(id) {
        const f = this.furnaces.get(id);
        return f ? f.status === 'idle' && f.durability > 20 : false;
    }
    isBroken(id) { return (this.furnaces.get(id)?.durability || 0) === 0; }
    averageDurability() {
        if (this.furnaces.size === 0) return 0;
        return this.listAll().reduce((s, f) => s + f.durability, 0) / this.furnaces.size;
    }
    best() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, f) => !best || f.durability > best.durability ? f : best, null);
    }
    report() { return { total: this.stats.total, avgDurability: this.averageDurability() }; }
    reset() { this.furnaces.clear(); this.stats = { total: 0 }; }
}
