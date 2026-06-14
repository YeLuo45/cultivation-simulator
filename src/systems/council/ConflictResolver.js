/**
 * ConflictResolver.js - 冲突解决器
 * V1001 P-20260614-161 Round 38 Iter 24/30
 */
export const CONFLICT_TYPES = ['dispute', 'border', 'resource', 'succession', 'ideology', 'trade'];
export const RESOLUTION_METHODS = ['arbitration', 'duel', 'negotiation', 'vote', 'drawing_lots', 'subordination'];
export const RESOLUTION_STATUS = ['open', 'mediating', 'resolved', 'escalated', 'abandoned'];

export class ConflictResolver {
    constructor(config = {}) {
        this.config = { ...config };
        this.conflicts = new Map();   // conflictId -> { id, type, parties, status, method, resolution, history }
        this.hooks = new Map();
        this.stats = { total: 0, resolved: 0, escalated: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `cfl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    open(type, parties, description = '') {
        if (!CONFLICT_TYPES.includes(type)) return null;
        if (!Array.isArray(parties) || parties.length < 2) return null;
        const id = this._newId();
        const c = { id, type, parties: [...parties], description, status: 'open', method: null, resolution: null, history: [{ event: 'opened', ts: Date.now() }] };
        this.conflicts.set(id, c);
        this.stats.total++;
        this._emit('opened', c);
        return c;
    }
    get(id) { return this.conflicts.get(id) || null; }
    listAll() { return [...this.conflicts.values()]; }
    listByStatus(st) { return this.listAll().filter(c => c.status === st); }
    listByParty(p) { return this.listAll().filter(c => c.parties.includes(p)); }
    listByType(type) { return this.listAll().filter(c => c.type === type); }

    chooseMethod(conflictId, method) {
        const c = this.conflicts.get(conflictId);
        if (!c || c.status !== 'open') return false;
        if (!RESOLUTION_METHODS.includes(method)) return false;
        c.method = method;
        c.status = 'mediating';
        c.history.push({ event: 'methodChosen', method, ts: Date.now() });
        this._emit('methodChosen', c);
        return true;
    }

    resolve(conflictId, resolution) {
        const c = this.conflicts.get(conflictId);
        if (!c || (c.status !== 'mediating' && c.status !== 'open')) return false;
        c.status = 'resolved';
        c.resolution = resolution;
        c.resolvedAt = Date.now();
        c.history.push({ event: 'resolved', resolution, ts: Date.now() });
        this.stats.resolved++;
        this._emit('resolved', c);
        return true;
    }
    escalate(conflictId) {
        const c = this.conflicts.get(conflictId);
        if (!c) return false;
        c.status = 'escalated';
        c.escalatedAt = Date.now();
        c.history.push({ event: 'escalated', ts: Date.now() });
        this.stats.escalated++;
        this._emit('escalated', c);
        return true;
    }
    abandon(conflictId) {
        const c = this.conflicts.get(conflictId);
        if (!c) return false;
        c.status = 'abandoned';
        c.abandonedAt = Date.now();
        c.history.push({ event: 'abandoned', ts: Date.now() });
        return true;
    }

    isOpen(conflictId) { return this.conflicts.get(conflictId)?.status === 'open'; }
    isMediating(conflictId) { return this.conflicts.get(conflictId)?.status === 'mediating'; }
    isResolved(conflictId) { return this.conflicts.get(conflictId)?.status === 'resolved'; }
    isEscalated(conflictId) { return this.conflicts.get(conflictId)?.status === 'escalated'; }

    isInConflict(memberA, memberB) {
        return this.listAll().some(c => c.parties.includes(memberA) && c.parties.includes(memberB) && (c.status === 'open' || c.status === 'mediating' || c.status === 'escalated'));
    }

    history(conflictId) { return [...(this.conflicts.get(conflictId)?.history || [])]; }
    report() { return { total: this.stats.total, resolved: this.stats.resolved, escalated: this.stats.escalated, open: this.listByStatus('open').length }; }
    reset() { this.conflicts.clear(); this.stats = { total: 0, resolved: 0, escalated: 0 }; }
}
