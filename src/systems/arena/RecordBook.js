/**
 * RecordBook.js - 纪录之书
 * V1032 P-20260614-192 Round 39 Iter 25/30
 */
export const RECORD_TYPES = ['fastest_kill', 'longest_combo', 'highest_damage', 'most_wins', 'longest_streak', 'quickest_tournament'];

export class RecordBook {
    constructor(config = {}) {
        this.config = { ...config };
        this.records = new Map();   // recordId -> { id, type, value, holder, setAt, context }
        this.byType = new Map();
        this.byPlayer = new Map();
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    submit(type, value, holder, context = '') {
        if (!RECORD_TYPES.includes(type)) return null;
        if (!holder) return null;
        const id = this._newId();
        const r = { id, type, value, holder, context, setAt: Date.now() };
        this.records.set(id, r);
        if (!this.byType.has(type)) this.byType.set(type, []);
        this.byType.get(type).push(id);
        if (!this.byPlayer.has(holder)) this.byPlayer.set(holder, []);
        this.byPlayer.get(holder).push(id);
        this.stats.total++;
        this._emit('submitted', r);
        return r;
    }
    get(id) { return this.records.get(id) || null; }
    listAll() { return [...this.records.values()]; }
    listByType(type) { return (this.byType.get(type) || []).map(id => this.records.get(id)).filter(Boolean); }
    listByPlayer(player) { return (this.byPlayer.get(player) || []).map(id => this.records.get(id)).filter(Boolean); }
    forPlayer(player) { return this.listByPlayer(player); }

    bestFor(type) {
        const list = this.listByType(type);
        if (list.length === 0) return null;
        const isMin = ['fastest_kill', 'quickest_tournament'].includes(type);
        return list.reduce((best, r) => {
            if (!best) return r;
            if (isMin) return r.value < best.value ? r : best;
            return r.value > best.value ? r : best;
        }, null);
    }
    bestHolderFor(type) { return this.bestFor(type)?.holder || null; }
    bestValueFor(type) { return this.bestFor(type)?.value || 0; }
    playerHoldsRecord(player, type) { return this.bestHolderFor(type) === player; }
    recordCount(type) { return this.byType.get(type)?.length || 0; }
    playerRecordCount(player) { return this.byPlayer.get(player)?.length || 0; }
    isMinimumRecord(type) { return ['fastest_kill', 'quickest_tournament'].includes(type); }
    exceedsRecord(type, value) {
        const best = this.bestValueFor(type);
        if (best === 0) return true;
        return this.isMinimumRecord(type) ? value < best : value > best;
    }

    topHolders(n = 5) {
        return [...this.byPlayer.entries()].map(([p, ids]) => ({ player: p, count: ids.length })).sort((a, b) => b.count - a.count).slice(0, n);
    }
    typeStats() {
        const result = {};
        for (const t of RECORD_TYPES) result[t] = this.recordCount(t);
        return result;
    }
    report() { return { total: this.stats.total, byType: this.typeStats() }; }
    reset() { this.records.clear(); this.byType.clear(); this.byPlayer.clear(); this.stats = { total: 0 }; }
}
