/**
 * ProposalStateMachine.js - 提案状态机
 * V988 P-20260614-148 Round 38 Iter 11/30
 */
export const PROPOSAL_STATES = ['draft', 'submitted', 'deliberation', 'voting', 'passed', 'rejected', 'executed', 'archived'];
export const STATE_TRANSITIONS = {
    draft: ['submitted', 'archived'],
    submitted: ['deliberation', 'rejected', 'archived'],
    deliberation: ['voting', 'rejected', 'archived'],
    voting: ['passed', 'rejected', 'archived'],
    passed: ['executed', 'archived'],
    rejected: ['archived'],
    executed: ['archived'],
    archived: [],
};

export class ProposalStateMachine {
    constructor(config = {}) {
        this.config = { ...config };
        this.state = new Map();   // proposalId -> { current, history }
        this.hooks = new Map();
        this.stats = { transitions: 0, invalid: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    init(proposalId, initial = 'draft') {
        if (!PROPOSAL_STATES.includes(initial)) return false;
        if (this.state.has(proposalId)) return false;
        this.state.set(proposalId, { current: initial, history: [{ state: initial, ts: Date.now() }] });
        return true;
    }
    get(proposalId) { return this.state.get(proposalId) || null; }
    currentState(proposalId) { return this.state.get(proposalId)?.current || null; }
    history(proposalId) { return [...(this.state.get(proposalId)?.history || [])]; }

    canTransition(proposalId, toState) {
        if (!PROPOSAL_STATES.includes(toState)) return false;
        const s = this.state.get(proposalId);
        if (!s) return false;
        return STATE_TRANSITIONS[s.current].includes(toState);
    }

    transition(proposalId, toState, reason = '') {
        if (!this.canTransition(proposalId, toState)) {
            this.stats.invalid++;
            this._emit('invalidTransition', { proposalId, toState });
            return false;
        }
        const s = this.state.get(proposalId);
        const from = s.current;
        s.current = toState;
        s.history.push({ from, to: toState, reason, ts: Date.now() });
        this.stats.transitions++;
        this._emit('transitioned', { proposalId, from, to: toState });
        return true;
    }

    allowedFrom(proposalId) {
        const s = this.state.get(proposalId);
        if (!s) return [];
        return STATE_TRANSITIONS[s.current] || [];
    }
    isTerminal(proposalId) {
        const s = this.state.get(proposalId);
        if (!s) return false;
        return STATE_TRANSITIONS[s.current].length === 0;
    }
    isInState(proposalId, st) { return this.currentState(proposalId) === st; }
    isPassed(proposalId) { return this.isInState(proposalId, 'passed') || this.isInState(proposalId, 'executed'); }
    isRejected(proposalId) { return this.isInState(proposalId, 'rejected'); }
    isActive(proposalId) {
        const cur = this.currentState(proposalId);
        return cur === 'submitted' || cur === 'deliberation' || cur === 'voting';
    }
    submit(proposalId) { return this.transition(proposalId, 'submitted'); }
    deliberate(proposalId) { return this.transition(proposalId, 'deliberation'); }
    vote(proposalId) { return this.transition(proposalId, 'voting'); }
    pass(proposalId) { return this.transition(proposalId, 'passed'); }
    reject(proposalId) { return this.transition(proposalId, 'rejected'); }
    execute(proposalId) { return this.transition(proposalId, 'executed'); }
    archive(proposalId) { return this.transition(proposalId, 'archived'); }
    countByState() {
        const c = {};
        for (const st of PROPOSAL_STATES) c[st] = 0;
        for (const s of this.state.values()) c[s.current] = (c[s.current] || 0) + 1;
        return c;
    }
    report() {
        return { total: this.state.size, transitions: this.stats.transitions, invalid: this.stats.invalid, byState: this.countByState() };
    }
    reset() { this.state.clear(); this.stats = { transitions: 0, invalid: 0 }; }
}
