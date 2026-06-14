/**
 * BatchProducer.js - 批量产线
 * V1057 P-20260614-247 Round 40 Iter 20/30
 */
export const BATCH_STATUS = ['planning', 'producing', 'completed', 'cancelled', 'failed'];

export class BatchProducer {
    constructor(config = {}) {
        this.config = { ...config };
        this.batches = new Map();   // batchId -> { id, recipeId, quantity, produced, status, startedAt, completedAt }
        this.hooks = new Map();
        this.stats = { total: 0, totalProduced: 0, totalFailed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `bch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    plan(recipeId, quantity) {
        if (!recipeId || typeof quantity !== 'number' || quantity <= 0) return null;
        const id = this._newId();
        const b = { id, recipeId, quantity, produced: 0, status: 'planning', startedAt: null, completedAt: null };
        this.batches.set(id, b);
        this.stats.total++;
        return b;
    }
    get(id) { return this.batches.get(id) || null; }
    listAll() { return [...this.batches.values()]; }
    listByStatus(st) { return this.listAll().filter(b => b.status === st); }
    listByRecipe(recipeId) { return this.listAll().filter(b => b.recipeId === recipeId); }

    start(id) {
        const b = this.batches.get(id);
        if (!b) return false;
        if (b.status !== 'planning') return false;
        b.status = 'producing';
        b.startedAt = Date.now();
        return true;
    }
    progress(id, amount) {
        const b = this.batches.get(id);
        if (!b) return false;
        if (b.status !== 'producing') return false;
        b.produced = Math.min(b.quantity, b.produced + amount);
        if (b.produced >= b.quantity) this.complete(id);
        return true;
    }
    complete(id) {
        const b = this.batches.get(id);
        if (!b) return false;
        b.status = 'completed';
        b.completedAt = Date.now();
        this.stats.totalProduced += b.produced;
        return true;
    }
    fail(id, reason = '') {
        const b = this.batches.get(id);
        if (!b) return false;
        b.status = 'failed';
        b.failReason = reason;
        b.completedAt = Date.now();
        this.stats.totalFailed += b.quantity - b.produced;
        return true;
    }
    cancel(id) {
        const b = this.batches.get(id);
        if (!b) return false;
        b.status = 'cancelled';
        b.completedAt = Date.now();
        return true;
    }
    progressOf(id) {
        const b = this.batches.get(id);
        if (!b || b.quantity === 0) return 0;
        return b.produced / b.quantity;
    }
    isComplete(id) { return this.batches.get(id)?.status === 'completed'; }
    isFailed(id) { return this.batches.get(id)?.status === 'failed'; }
    producedCount(id) { return this.batches.get(id)?.produced || 0; }
    remaining(id) {
        const b = this.batches.get(id);
        return b ? b.quantity - b.produced : 0;
    }
    duration(id) {
        const b = this.batches.get(id);
        if (!b || !b.startedAt) return 0;
        const end = b.completedAt || Date.now();
        return end - b.startedAt;
    }
    report() { return { total: this.stats.total, totalProduced: this.stats.totalProduced, totalFailed: this.stats.totalFailed }; }
    reset() { this.batches.clear(); this.stats = { total: 0, totalProduced: 0, totalFailed: 0 }; }
}
