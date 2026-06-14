/**
 * SpiritualVein.js - 灵脉系统
 * V1101 P-20260614-603 Round 42 Iter 4/30
 */
export const VEIN_TYPES = ['major', 'minor', 'lateral', 'deep', 'surface'];
export const VEIN_QUALITY = ['poor', 'normal', 'rich', 'abundant', 'primordial'];

export class SpiritualVein {
    constructor(config = {}) {
        this.config = { ...config };
        this.veins = new Map();   // veinId -> { id, name, type, quality, capacity, currentLoad, location }
        this.byLocation = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalCapacity: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `vn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    discover(name, type, location, quality = 'normal', capacity = 100) {
        if (!name) return null;
        if (!VEIN_TYPES.includes(type)) type = 'minor';
        if (!VEIN_QUALITY.includes(quality)) quality = 'normal';
        const id = this._newId();
        const v = { id, name, type, quality, capacity, currentLoad: 0, location };
        this.veins.set(id, v);
        if (!this.byLocation.has(location)) this.byLocation.set(location, []);
        this.byLocation.get(location).push(id);
        this.stats.total++;
        this.stats.totalCapacity += capacity;
        this._emit('discovered', v);
        return v;
    }
    get(id) { return this.veins.get(id) || null; }
    listAll() { return [...this.veins.values()]; }
    listByType(type) { return this.listAll().filter(v => v.type === type); }
    listByQuality(q) { return this.listAll().filter(v => v.quality === q); }
    listByLocation(loc) {
        const ids = this.byLocation.get(loc) || [];
        return ids.map(id => this.veins.get(id)).filter(Boolean);
    }

    draw(id, amount) {
        const v = this.veins.get(id);
        if (!v) return false;
        if (typeof amount !== 'number' || amount <= 0) return false;
        if (v.currentLoad + amount > v.capacity) return false;
        v.currentLoad += amount;
        this._emit('draw', { veinId: id, amount });
        return true;
    }
    refill(id, amount) {
        const v = this.veins.get(id);
        if (!v) return false;
        if (typeof amount !== 'number' || amount <= 0) return false;
        v.currentLoad = Math.max(0, v.currentLoad - amount);
        return true;
    }
    setQuality(id, quality) {
        const v = this.veins.get(id);
        if (!v) return false;
        if (!VEIN_QUALITY.includes(quality)) return false;
        v.quality = quality;
        return true;
    }
    setCapacity(id, capacity) {
        const v = this.veins.get(id);
        if (!v) return false;
        v.capacity = Math.max(0, capacity);
        this.stats.totalCapacity = this.listAll().reduce((s, x) => s + x.capacity, 0);
        return true;
    }
    isPrimordial(id) { return this.veins.get(id)?.quality === 'primordial'; }
    isDepleted(id) { return (this.veins.get(id)?.currentLoad || 0) >= (this.veins.get(id)?.capacity || 0); }
    capacityOf(id) { return this.veins.get(id)?.capacity || 0; }
    loadOf(id) { return this.veins.get(id)?.currentLoad || 0; }
    qualityOf(id) { return this.veins.get(id)?.quality || null; }
    loadPercent(id) {
        const v = this.veins.get(id);
        return !v || v.capacity === 0 ? 0 : v.currentLoad / v.capacity;
    }
    totalCapacity() { return this.stats.totalCapacity; }
    totalLoad() { return this.listAll().reduce((s, v) => s + v.currentLoad, 0); }
    averageLoad() {
        if (this.veins.size === 0) return 0;
        return this.listAll().reduce((s, v) => s + v.currentLoad / v.capacity, 0) / this.veins.size;
    }
    best() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, v) => !best || v.capacity > best.capacity ? v : best, null);
    }
    report() { return { total: this.stats.total, totalCapacity: this.stats.totalCapacity }; }
    reset() { this.veins.clear(); this.byLocation.clear(); this.stats = { total: 0, totalCapacity: 0 }; }
}
