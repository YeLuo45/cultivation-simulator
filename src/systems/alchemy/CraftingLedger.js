/**
 * CraftingLedger.js - 炼制账簿
 * V1065 P-20260614-255 Round 40 Iter 28/30
 */
export const LEDGER_ENTRY_TYPES = ['craft', 'consume', 'sell', 'buy', 'gift'];
export const LEDGER_STATUS = ['pending', 'committed', 'reversed'];

export class CraftingLedger {
    constructor(config = {}) {
        this.config = { ...config };
        this.entries = new Map();   // entryId -> { id, type, amount, item, balance, status, ts }
        this.balance = 0;
        this.hooks = new Map();
        this.stats = { totalEntries: 0, totalIncome: 0, totalExpense: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ldg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    record(type, amount, item = null) {
        if (!LEDGER_ENTRY_TYPES.includes(type)) return null;
        if (typeof amount !== 'number' || amount < 0) return null;
        const id = this._newId();
        const e = { id, type, amount, item, balance: this.balance, status: 'pending', ts: Date.now() };
        this.entries.set(id, e);
        this.stats.totalEntries++;
        return e;
    }
    commit(entryId) {
        const e = this.entries.get(entryId);
        if (!e) return false;
        if (e.status !== 'pending') return false;
        if (e.type === 'sell' || e.type === 'gift') {
            this.balance += e.amount;
            this.stats.totalIncome += e.amount;
        } else if (e.type === 'craft' || e.type === 'consume' || e.type === 'buy') {
            this.balance -= e.amount;
            this.stats.totalExpense += e.amount;
        }
        e.status = 'committed';
        e.balance = this.balance;
        e.committedAt = Date.now();
        this._emit('committed', e);
        return true;
    }
    reverse(entryId) {
        const e = this.entries.get(entryId);
        if (!e) return false;
        if (e.status !== 'committed') return false;
        if (e.type === 'sell' || e.type === 'gift') {
            this.balance -= e.amount;
        } else {
            this.balance += e.amount;
        }
        e.status = 'reversed';
        return true;
    }
    get(entryId) { return this.entries.get(entryId) || null; }
    listAll() { return [...this.entries.values()]; }
    listByType(type) { return this.listAll().filter(e => e.type === type); }
    listByStatus(st) { return this.listAll().filter(e => e.status === st); }
    listForItem(item) { return this.listAll().filter(e => e.item === item); }

    currentBalance() { return this.balance; }
    isCommitted(id) { return this.entries.get(id)?.status === 'committed'; }
    isReversed(id) { return this.entries.get(id)?.status === 'reversed'; }
    isPending(id) { return this.entries.get(id)?.status === 'pending'; }
    incomeTotal() { return this.stats.totalIncome; }
    expenseTotal() { return this.stats.totalExpense; }
    netChange() { return this.stats.totalIncome - this.stats.totalExpense; }
    pendingCount() { return this.listByStatus('pending').length; }
    committedCount() { return this.listByStatus('committed').length; }
    report() { return { balance: this.balance, totalEntries: this.stats.totalEntries, income: this.stats.totalIncome, expense: this.stats.totalExpense }; }
    reset() { this.entries.clear(); this.balance = 0; this.stats = { totalEntries: 0, totalIncome: 0, totalExpense: 0 }; }
}
