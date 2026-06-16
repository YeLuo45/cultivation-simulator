/**
 * TalismanLibrarian.js - 符箓司书
 * V1155 Round 43 Iter 28/30
 */
export const LIBRARIAN_STATUS = ['available', 'busy', 'researching', 'teaching', 'resting'];
export const LIBRARIAN_RANKS = ['apprentice', 'journeyman', 'expert', 'master', 'grandmaster'];

export class TalismanLibrarian {
    constructor(config = {}) {
        this.config = { ...config };
        this.librarians = new Map();   // lid -> { id, name, rank, status, transactions, owner, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalTransactions: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `tl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    hire(name, rank = 'apprentice', owner = null) {
        if (!name) return null;
        if (!LIBRARIAN_RANKS.includes(rank)) rank = 'apprentice';
        const id = this._newId();
        const l = { id, name, rank, status: 'available', transactions: 0, owner, ts: Date.now() };
        this.librarians.set(id, l);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        this.stats.total++;
        return l;
    }
    get(id) { return this.librarians.get(id) || null; }
    listAll() { return [...this.librarians.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.librarians.get(id)).filter(Boolean);
    }
    listByRank(r) { return this.listAll().filter(l => l.rank === r); }
    listByStatus(st) { return this.listAll().filter(l => l.status === st); }
    listAvailable() { return this.listByStatus('available'); }
    listGrandmaster() { return this.listByRank('grandmaster'); }

    setStatus(id, status) {
        const l = this.librarians.get(id);
        if (!l) return false;
        if (!LIBRARIAN_STATUS.includes(status)) return false;
        l.status = status;
        return true;
    }
    setRank(id, rank) {
        const l = this.librarians.get(id);
        if (!l) return false;
        if (!LIBRARIAN_RANKS.includes(rank)) return false;
        l.rank = rank;
        return true;
    }
    transaction(id) {
        const l = this.librarians.get(id);
        if (!l) return false;
        l.transactions++;
        this.stats.totalTransactions++;
        this._emit('transacted', l);
        return true;
    }
    promote(id) {
        const l = this.librarians.get(id);
        if (!l) return null;
        const idx = LIBRARIAN_RANKS.indexOf(l.rank);
        if (idx === -1 || idx === LIBRARIAN_RANKS.length - 1) return null;
        l.rank = LIBRARIAN_RANKS[idx + 1];
        return l.rank;
    }
    rest(id) { return this.setStatus(id, 'resting'); }
    startResearch(id) { return this.setStatus(id, 'researching'); }
    startTeaching(id) { return this.setStatus(id, 'teaching'); }
    isAvailable(id) { return this.librarians.get(id)?.status === 'available'; }
    isGrandmaster(id) { return this.librarians.get(id)?.rank === 'grandmaster'; }
    transactionCount(id) { return this.librarians.get(id)?.transactions || 0; }
    rankOf(id) { return this.librarians.get(id)?.rank || null; }
    rankIndex(id) { return LIBRARIAN_RANKS.indexOf(this.librarians.get(id)?.rank || ''); }
    averageTransactions() {
        if (this.librarians.size === 0) return 0;
        return this.listAll().reduce((s, l) => s + l.transactions, 0) / this.librarians.size;
    }
    best() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, l) => !best || l.transactions > best.transactions ? l : best, null);
    }
    countByRank() {
        const c = {};
        for (const r of LIBRARIAN_RANKS) c[r] = 0;
        for (const l of this.librarians.values()) c[l.rank] = (c[l.rank] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalTransactions: this.stats.totalTransactions }; }
    reset() { this.librarians.clear(); this.byOwner.clear(); this.stats = { total: 0, totalTransactions: 0 }; }
}
