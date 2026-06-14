/**
 * FieldCommander.js - 现场指挥官
 * V1094 P-20260614-421 Round 41 Iter 27/30
 */
export const COMMAND_RANKS = ['captain', 'major', 'colonel', 'general'];
export const COMMAND_STATUS = ['assigned', 'active', 'inactive', 'retired', 'kia'];

export class FieldCommander {
    constructor(config = {}) {
        this.config = { ...config };
        this.commanders = new Map();   // cmdrId -> { id, name, rank, status, opsCount, lastOp }
        this.hooks = new Map();
        this.stats = { total: 0, totalOps: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `fld_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    commission(name, rank = 'captain') {
        if (!name) return null;
        if (!COMMAND_RANKS.includes(rank)) rank = 'captain';
        const id = this._newId();
        const c = { id, name, rank, status: 'assigned', opsCount: 0, lastOp: null };
        this.commanders.set(id, c);
        this.stats.total++;
        return c;
    }
    get(id) { return this.commanders.get(id) || null; }
    listAll() { return [...this.commanders.values()]; }
    listByRank(rank) { return this.listAll().filter(c => c.rank === rank); }
    listByStatus(st) { return this.listAll().filter(c => c.status === st); }
    listActive() { return this.listByStatus('active'); }

    setStatus(id, status) {
        const c = this.commanders.get(id);
        if (!c) return false;
        if (!COMMAND_STATUS.includes(status)) return false;
        c.status = status;
        return true;
    }
    promote(id, newRank) {
        const c = this.commanders.get(id);
        if (!c) return false;
        if (!COMMAND_RANKS.includes(newRank)) return false;
        c.rank = newRank;
        return true;
    }
    recordOperation(id) {
        const c = this.commanders.get(id);
        if (!c) return false;
        c.opsCount++;
        c.lastOp = Date.now();
        this.stats.totalOps++;
        return true;
    }
    isActive(id) { return this.commanders.get(id)?.status === 'active'; }
    isKia(id) { return this.commanders.get(id)?.status === 'kia'; }
    isRetired(id) { return this.commanders.get(id)?.status === 'retired'; }
    rankOf(id) { return this.commanders.get(id)?.rank || null; }
    opsCount(id) { return this.commanders.get(id)?.opsCount || 0; }
    highestRank() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, c) => COMMAND_RANKS.indexOf(c.rank) > COMMAND_RANKS.indexOf(best?.rank || 'captain') ? c : best, null);
    }
    mostExperienced() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, c) => !best || c.opsCount > best.opsCount ? c : best, null);
    }
    averageOps() {
        if (this.commanders.size === 0) return 0;
        return this.listAll().reduce((s, c) => s + c.opsCount, 0) / this.commanders.size;
    }
    rankByExperience() { return this.listAll().sort((a, b) => b.opsCount - a.opsCount); }
    report() { return { total: this.stats.total, totalOps: this.stats.totalOps }; }
    reset() { this.commanders.clear(); this.stats = { total: 0, totalOps: 0 }; }
}
