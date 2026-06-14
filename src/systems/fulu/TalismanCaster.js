/**
 * TalismanCaster.js - 符箓施放
 * V1137 Round 43 Iter 10/30
 */
export const CAST_STATUS = ['ready', 'casting', 'hit', 'miss', 'reflected', 'cancelled'];
export const CAST_ELEMENTS = ['fire', 'water', 'thunder', 'wind', 'earth', 'light', 'dark', 'none'];

export class TalismanCaster {
    constructor(config = {}) {
        this.config = { ...config };
        this.casts = new Map();   // cid -> { id, talisman, element, status, power, target, ts }
        this.byTarget = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalHit: 0, totalMiss: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `tc2_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    cast(talisman, target, element = 'none', power = 1) {
        if (!talisman || !target) return null;
        if (!CAST_ELEMENTS.includes(element)) element = 'none';
        const id = this._newId();
        const c = { id, talisman, element, status: 'casting', power, target, ts: Date.now() };
        this.casts.set(id, c);
        if (!this.byTarget.has(target)) this.byTarget.set(target, []);
        this.byTarget.get(target).push(id);
        this.stats.total++;
        this._emit('cast', c);
        return c;
    }
    get(id) { return this.casts.get(id) || null; }
    listAll() { return [...this.casts.values()]; }
    listByTalisman(tal) { return this.listAll().filter(c => c.talisman === tal); }
    listByTarget(target) {
        const ids = this.byTarget.get(target) || [];
        return ids.map(id => this.casts.get(id)).filter(Boolean);
    }
    listByStatus(st) { return this.listAll().filter(c => c.status === st); }
    listByElement(el) { return this.listAll().filter(c => c.element === el); }
    listActive() { return this.listByStatus('casting'); }

    setStatus(id, status) {
        const c = this.casts.get(id);
        if (!c) return false;
        if (!CAST_STATUS.includes(status)) return false;
        c.status = status;
        if (status === 'hit') this.stats.totalHit++;
        else if (status === 'miss') this.stats.totalMiss++;
        if (status === 'hit' || status === 'miss' || status === 'reflected') this._emit('resolved', c);
        return true;
    }
    hit(id) { return this.setStatus(id, 'hit'); }
    miss(id) { return this.setStatus(id, 'miss'); }
    reflect(id) { return this.setStatus(id, 'reflected'); }
    cancel(id) { return this.setStatus(id, 'cancelled'); }
    setPower(id, power) {
        const c = this.casts.get(id);
        if (!c) return false;
        c.power = Math.max(0, power);
        return true;
    }
    isActive(id) { return this.casts.get(id)?.status === 'casting'; }
    isHit(id) { return this.casts.get(id)?.status === 'hit'; }
    isMiss(id) { return this.casts.get(id)?.status === 'miss'; }
    isReflected(id) { return this.casts.get(id)?.status === 'reflected'; }
    isCancelled(id) { return this.casts.get(id)?.status === 'cancelled'; }
    powerOf(id) { return this.casts.get(id)?.power || 0; }
    elementOf(id) { return this.casts.get(id)?.element || null; }
    targetOf(id) { return this.casts.get(id)?.target || null; }
    targetCount(target) { return this.listByTarget(target).length; }
    hitRate() { return this.stats.total === 0 ? 0 : this.stats.totalHit / this.stats.total; }
    averagePower() {
        if (this.casts.size === 0) return 0;
        return this.listAll().reduce((s, c) => s + c.power, 0) / this.casts.size;
    }
    countByElement() {
        const c = {};
        for (const e of CAST_ELEMENTS) c[e] = 0;
        for (const ca of this.casts.values()) c[ca.element] = (c[ca.element] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalHit: this.stats.totalHit, totalMiss: this.stats.totalMiss, hitRate: this.hitRate() }; }
    reset() { this.casts.clear(); this.byTarget.clear(); this.stats = { total: 0, totalHit: 0, totalMiss: 0 }; }
}
