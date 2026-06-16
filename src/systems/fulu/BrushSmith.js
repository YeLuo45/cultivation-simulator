/**
 * BrushSmith.js - 符笔铸造
 * V1130 Round 43 Iter 3/30
 */
export const BRUSH_TYPES = ['weasel_hair', 'wolf_hair', 'phoenix_feather', 'dragon_beard', 'spirit_wood', 'blood_brush'];
export const BRUSH_QUALITY = ['flawed', 'normal', 'fine', 'excellent', 'perfect'];

export class BrushSmith {
    constructor(config = {}) {
        this.config = { ...config };
        this.brushes = new Map();   // bid -> { id, type, quality, inkCapacity, durability, owner, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalDurability: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `bs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    forge(type, inkCapacity = 100, durability = 100, quality = 'normal', owner = null) {
        if (!BRUSH_TYPES.includes(type)) type = 'weasel_hair';
        if (!BRUSH_QUALITY.includes(quality)) quality = 'normal';
        const id = this._newId();
        const b = { id, type, quality, inkCapacity, durability, owner, ts: Date.now() };
        this.brushes.set(id, b);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        this.stats.total++;
        this.stats.totalDurability += durability;
        this._emit('forged', b);
        return b;
    }
    get(id) { return this.brushes.get(id) || null; }
    listAll() { return [...this.brushes.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.brushes.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(b => b.type === type); }
    listByQuality(q) { return this.listAll().filter(b => b.quality === q); }

    setDurability(id, durability) {
        const b = this.brushes.get(id);
        if (!b) return false;
        b.durability = Math.max(0, Math.min(b.inkCapacity, durability));
        this.stats.totalDurability = this.listAll().reduce((s, x) => s + x.durability, 0);
        return true;
    }
    setInkCapacity(id, cap) {
        const b = this.brushes.get(id);
        if (!b) return false;
        b.inkCapacity = Math.max(0, cap);
        return true;
    }
    setQuality(id, quality) {
        const b = this.brushes.get(id);
        if (!b) return false;
        if (!BRUSH_QUALITY.includes(quality)) return false;
        b.quality = quality;
        return true;
    }
    use(id, amount) {
        const b = this.brushes.get(id);
        if (!b) return false;
        if (b.durability < amount) return false;
        b.durability -= amount;
        this.stats.totalDurability = this.listAll().reduce((s, x) => s + x.durability, 0);
        return true;
    }
    repair(id, amount) {
        const b = this.brushes.get(id);
        if (!b) return false;
        b.durability = Math.min(b.inkCapacity, b.durability + amount);
        this.stats.totalDurability = this.listAll().reduce((s, x) => s + x.durability, 0);
        return true;
    }
    isPerfect(id) { return this.brushes.get(id)?.quality === 'perfect'; }
    isBroken(id) { return (this.brushes.get(id)?.durability || 0) === 0; }
    durabilityOf(id) { return this.brushes.get(id)?.durability || 0; }
    capacityOf(id) { return this.brushes.get(id)?.inkCapacity || 0; }
    qualityOf(id) { return this.brushes.get(id)?.quality || null; }
    averageDurability() { return this.stats.total === 0 ? 0 : this.stats.totalDurability / this.stats.total; }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    bestDurability() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, b) => !best || b.durability > best.durability ? b : best, null);
    }
    report() { return { total: this.stats.total, averageDurability: this.averageDurability() }; }
    reset() { this.brushes.clear(); this.byOwner.clear(); this.stats = { total: 0, totalDurability: 0 }; }
}
