/**
 * SectProposalCollector.js - 提案收集器
 * V978 P-20260614-138 Round 38 Iter 1/30 Direction A 仙道议事厅
 *
 * 收集所有成员提交的提案，按优先级/类型/时间归档
 */
export const PROPOSAL_CATEGORIES = ['tax', 'defense', 'cultivation', 'alliance', 'discipline', 'resource', 'expansion'];
export const PROPOSAL_PRIORITIES = ['low', 'normal', 'high', 'urgent'];

export class SectProposalCollector {
    constructor(config = {}) {
        this.config = { ...config };
        this.proposals = new Map();     // proposalId -> { id, title, category, priority, proposer, content, ts, status }
        this.byCategory = new Map();    // category -> Set<proposalId>
        this.byProposer = new Map();    // memberId -> Set<proposalId>
        this.hooks = new Map();
        this.stats = { total: 0, byCategory: {} };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `prop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    submit(proposer, title, content, opts = {}) {
        if (!proposer || !title) return null;
        const category = PROPOSAL_CATEGORIES.includes(opts.category) ? opts.category : 'cultivation';
        const priority = PROPOSAL_PRIORITIES.includes(opts.priority) ? opts.priority : 'normal';
        const id = this._newId();
        const normalizedOpts = { ...opts, category, priority };
        const p = { id, title, content, category, priority, proposer, status: 'submitted', ts: Date.now(), ...normalizedOpts };
        this.proposals.set(id, p);
        if (!this.byCategory.has(category)) this.byCategory.set(category, new Set());
        this.byCategory.get(category).add(id);
        if (!this.byProposer.has(proposer)) this.byProposer.set(proposer, new Set());
        this.byProposer.get(proposer).add(id);
        this.stats.total++;
        this.stats.byCategory[category] = (this.stats.byCategory[category] || 0) + 1;
        this._emit('proposalSubmitted', p);
        return p;
    }

    get(id) { return this.proposals.get(id) || null; }
    listAll() { return [...this.proposals.values()]; }
    listByCategory(cat) {
        const ids = this.byCategory.get(cat) || new Set();
        return [...ids].map(id => this.proposals.get(id)).filter(Boolean);
    }
    listByProposer(memberId) {
        const ids = this.byProposer.get(memberId) || new Set();
        return [...ids].map(id => this.proposals.get(id)).filter(Boolean);
    }
    listByPriority(priority) { return this.listAll().filter(p => p.priority === priority); }
    countByCategory(cat) { return (this.byCategory.get(cat) || new Set()).size; }
    countByProposer(memberId) { return (this.byProposer.get(memberId) || new Set()).size; }

    updateStatus(id, status) {
        const p = this.proposals.get(id);
        if (!p) return false;
        p.status = status;
        p.statusTs = Date.now();
        this._emit('statusUpdated', p);
        return true;
    }

    withdraw(id) { return this.updateStatus(id, 'withdrawn'); }
    archive(id) { return this.updateStatus(id, 'archived'); }

    filterBy(predicate) { return this.listAll().filter(predicate); }
    sortBy(priority) { return this.listAll().sort((a, b) => PROPOSAL_PRIORITIES.indexOf(b.priority) - PROPOSAL_PRIORITIES.indexOf(a.priority)); }

    report() {
        return {
            total: this.stats.total,
            byCategory: { ...this.stats.byCategory },
            proposers: this.byProposer.size,
            pending: this.listAll().filter(p => p.status === 'submitted').length,
        };
    }
    reset() {
        this.proposals.clear();
        this.byCategory.clear();
        this.byProposer.clear();
        this.stats = { total: 0, byCategory: {} };
    }
}
