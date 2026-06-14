/**
 * CrucibleForge.js - 坩埚熔铸
 * V1042 P-20260614-261 Round 40 Iter 5/30
 */
export const CRUCIBLE_STATUS = ['empty', 'loading', 'ready', 'sealed', 'broken'];
export const METAL_TYPES = ['copper', 'iron', 'silver', 'gold', 'jade', 'spirit'];

export class CrucibleForge {
    constructor(config = {}) {
        this.config = { ...config };
        this.crucibles = new Map();   // crucibleId -> { id, name, metal, contents, status, maxContents }
        this.hooks = new Map();
        this.stats = { total: 0, totalForged: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `cru_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(name, metal = 'copper', maxContents = 10) {
        if (!name) return null;
        if (!METAL_TYPES.includes(metal)) metal = 'copper';
        const id = this._newId();
        const c = { id, name, metal, contents: [], status: 'empty', maxContents, createdAt: Date.now() };
        this.crucibles.set(id, c);
        this.stats.total++;
        return c;
    }
    get(id) { return this.crucibles.get(id) || null; }
    listAll() { return [...this.crucibles.values()]; }
    listByMetal(metal) { return this.listAll().filter(c => c.metal === metal); }
    listByStatus(st) { return this.listAll().filter(c => c.status === st); }

    load(crucibleId, item) {
        const c = this.crucibles.get(crucibleId);
        if (!c) return false;
        if (c.contents.length >= c.maxContents) return false;
        if (c.status === 'sealed' || c.status === 'broken') return false;
        c.contents.push(item);
        c.status = 'loading';
        return true;
    }
    unload(crucibleId) {
        const c = this.crucibles.get(crucibleId);
        if (!c) return null;
        const items = c.contents;
        c.contents = [];
        c.status = 'empty';
        return items;
    }
    seal(crucibleId) {
        const c = this.crucibles.get(crucibleId);
        if (!c) return false;
        if (c.contents.length === 0) return false;
        c.status = 'sealed';
        return true;
    }
    unseal(crucibleId) {
        const c = this.crucibles.get(crucibleId);
        if (!c) return false;
        if (c.status !== 'sealed') return false;
        c.status = 'ready';
        return true;
    }
    forge(crucibleId) {
        const c = this.crucibles.get(crucibleId);
        if (!c) return null;
        if (c.status !== 'sealed') return null;
        c.status = 'empty';
        const result = { ...c, forgedAt: Date.now() };
        this.stats.totalForged++;
        this._emit('forged', result);
        c.contents = [];
        return result;
    }
    breakCrucible(crucibleId) {
        const c = this.crucibles.get(crucibleId);
        if (!c) return false;
        c.status = 'broken';
        c.brokenAt = Date.now();
        this._emit('broken', c);
        return true;
    }
    isEmpty(crucibleId) { return (this.crucibles.get(crucibleId)?.contents.length || 0) === 0; }
    isReady(crucibleId) { return this.crucibles.get(crucibleId)?.status === 'sealed'; }
    contentCount(crucibleId) { return this.crucibles.get(crucibleId)?.contents.length || 0; }
    report() { return { total: this.stats.total, totalForged: this.stats.totalForged }; }
    reset() { this.crucibles.clear(); this.stats = { total: 0, totalForged: 0 }; }
}
