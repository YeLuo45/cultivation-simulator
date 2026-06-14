/**
 * DeadDrop.js - 死信箱
 * V1081 P-20260614-408 Round 41 Iter 14/30
 */
export const DROP_STATUS = ['active', 'discovered', 'sealed', 'compromised'];
export const DEFAULT_DROP_CAPACITY = 10;

export class DeadDrop {
    constructor(config = {}) {
        this.config = { capacity: config.capacity || DEFAULT_DROP_CAPACITY, ...config };
        this.drops = new Map();   // dropId -> { id, location, status, items, capacity, lastAccessed }
        this.hooks = new Map();
        this.stats = { total: 0, totalItems: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ddp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(location, capacity = null) {
        if (!location) return null;
        const id = this._newId();
        const d = { id, location, status: 'active', items: [], capacity: capacity || this.config.capacity, lastAccessed: null };
        this.drops.set(id, d);
        this.stats.total++;
        return d;
    }
    get(id) { return this.drops.get(id) || null; }
    listAll() { return [...this.drops.values()]; }
    listByStatus(st) { return this.listAll().filter(d => d.status === st); }
    listActive() { return this.listByStatus('active'); }

    place(id, item) {
        const d = this.drops.get(id);
        if (!d) return false;
        if (d.status !== 'active') return false;
        if (d.items.length >= d.capacity) return false;
        d.items.push({ item, ts: Date.now() });
        this.stats.totalItems++;
        this._emit('placed', { dropId: id, item });
        return true;
    }
    retrieve(id) {
        const d = this.drops.get(id);
        if (!d) return null;
        if (d.status !== 'active') return null;
        if (d.items.length === 0) return null;
        const items = d.items.map(i => i.item);
        d.items = [];
        d.lastAccessed = Date.now();
        this._emit('retrieved', { dropId: id, items });
        return items;
    }
    setStatus(id, status) {
        const d = this.drops.get(id);
        if (!d) return false;
        if (!DROP_STATUS.includes(status)) return false;
        d.status = status;
        return true;
    }
    seal(id) { return this.setStatus(id, 'sealed'); }
    discover(id) { return this.setStatus(id, 'discovered'); }
    compromise(id) { return this.setStatus(id, 'compromised'); }
    isActive(id) { return this.drops.get(id)?.status === 'active'; }
    isFull(id) { const d = this.drops.get(id); return d ? d.items.length >= d.capacity : false; }
    isEmpty(id) { const d = this.drops.get(id); return d ? d.items.length === 0 : true; }
    itemCount(id) { return this.drops.get(id)?.items.length || 0; }
    capacityOf(id) { return this.drops.get(id)?.capacity || 0; }
    contents(id) { return [...(this.drops.get(id)?.items || [])]; }
    averageFill() {
        if (this.drops.size === 0) return 0;
        return this.listAll().reduce((s, d) => s + d.items.length / d.capacity, 0) / this.drops.size;
    }
    report() { return { total: this.stats.total, totalItems: this.stats.totalItems, averageFill: this.averageFill() }; }
    reset() { this.drops.clear(); this.stats = { total: 0, totalItems: 0 }; }
}
