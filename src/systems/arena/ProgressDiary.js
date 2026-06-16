/**
 * ProgressDiary.js - 精进日志
 * V1036 P-20260614-196 Round 39 Iter 29/30
 */
export const ENTRY_TYPES = ['training', 'match', 'breakthrough', 'quest', 'meditation', 'discovery'];
export const ENTRY_MOOD = ['frustrated', 'neutral', 'satisfied', 'inspired', 'enlightened'];

export class ProgressDiary {
    constructor(config = {}) {
        this.config = { ...config };
        this.entries = new Map();   // entryId -> { id, type, mood, content, exp, ts }
        this.byPlayer = new Map();  // playerId -> [entryId]
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    log(playerId, type, content, mood = 'neutral', exp = 0) {
        if (!playerId) return null;
        if (!ENTRY_TYPES.includes(type)) return null;
        if (!ENTRY_MOOD.includes(mood)) mood = 'neutral';
        const id = this._newId();
        const e = { id, playerId, type, content, mood, exp, ts: Date.now() };
        this.entries.set(id, e);
        if (!this.byPlayer.has(playerId)) this.byPlayer.set(playerId, []);
        this.byPlayer.get(playerId).push(id);
        this.stats.total++;
        this._emit('logged', e);
        return e;
    }
    get(id) { return this.entries.get(id) || null; }
    listAll() { return [...this.entries.values()]; }
    forPlayer(playerId) {
        return (this.byPlayer.get(playerId) || []).map(id => this.entries.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(e => e.type === type); }
    listByMood(mood) { return this.listAll().filter(e => e.mood === mood); }
    forPlayerByType(playerId, type) { return this.forPlayer(playerId).filter(e => e.type === type); }
    forPlayerByMood(playerId, mood) { return this.forPlayer(playerId).filter(e => e.mood === mood); }

    deleteEntry(id) {
        const e = this.entries.get(id);
        if (!e) return false;
        this.entries.delete(id);
        if (this.byPlayer.has(e.playerId)) this.byPlayer.set(e.playerId, this.byPlayer.get(e.playerId).filter(x => x !== id));
        return true;
    }
    updateMood(id, mood) {
        const e = this.entries.get(id);
        if (!e || !ENTRY_MOOD.includes(mood)) return false;
        e.mood = mood;
        return true;
    }
    totalExp(playerId) { return this.forPlayer(playerId).reduce((s, e) => s + e.exp, 0); }
    entryCount(playerId) { return this.byPlayer.get(playerId)?.length || 0; }
    typeCount(playerId, type) { return this.forPlayerByType(playerId, type).length; }
    mostCommonType(playerId) {
        const e = this.forPlayer(playerId);
        if (e.length === 0) return null;
        const c = {};
        for (const x of e) c[x.type] = (c[x.type] || 0) + 1;
        return Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
    }
    dominantMood(playerId) {
        const e = this.forPlayer(playerId);
        if (e.length === 0) return null;
        const c = {};
        for (const x of e) c[x.mood] = (c[x.mood] || 0) + 1;
        return Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
    }
    isInspired(playerId) { return this.dominantMood(playerId) === 'inspired' || this.dominantMood(playerId) === 'enlightened'; }
    recent(playerId, n = 10) { return this.forPlayer(playerId).sort((a, b) => b.ts - a.ts).slice(0, n); }
    report() { return { total: this.stats.total, players: this.byPlayer.size }; }
    reset() { this.entries.clear(); this.byPlayer.clear(); this.stats = { total: 0 }; }
}
