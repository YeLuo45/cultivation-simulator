/**
 * StanceManager.js - 架势管理器
 * V1019 P-20260614-179 Round 39 Iter 12/30
 */
export const STANCE_TYPES = ['offensive', 'defensive', 'neutral', 'berserk', 'stealth', 'meditative'];
export const STANCE_TRANSITIONS = {
    offensive: ['neutral', 'berserk'],
    defensive: ['neutral', 'meditative'],
    neutral: ['offensive', 'defensive', 'stealth'],
    berserk: ['offensive', 'defensive'],
    stealth: ['offensive', 'neutral'],
    meditative: ['defensive', 'neutral'],
};

export class StanceManager {
    constructor(config = {}) {
        this.config = { ...config };
        this.stances = new Map();   // playerId -> { current, enteredAt, history }
        this.hooks = new Map();
        this.stats = { totalChanges: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    enter(playerId, stance) {
        if (!STANCE_TYPES.includes(stance)) return false;
        const cur = this.stances.get(playerId);
        if (cur && !STANCE_TRANSITIONS[cur.current].includes(stance) && cur.current !== stance) return false;
        const prev = cur?.current || null;
        this.stances.set(playerId, { current: stance, enteredAt: Date.now(), history: [...(cur?.history || []), { from: prev, to: stance, ts: Date.now() }] });
        if (this.stances.get(playerId).history.length > 20) this.stances.get(playerId).history.shift();
        this.stats.totalChanges++;
        this._emit('changed', { playerId, from: prev, to: stance });
        return true;
    }
    get(playerId) { return this.stances.get(playerId) || null; }
    currentStance(playerId) { return this.stances.get(playerId)?.current || null; }
    isInStance(playerId, stance) { return this.currentStance(playerId) === stance; }
    timeInStance(playerId) {
        const s = this.stances.get(playerId);
        if (!s) return 0;
        return Date.now() - s.enteredAt;
    }
    history(playerId) { return [...(this.stances.get(playerId)?.history || [])]; }
    canTransition(playerId, toStance) {
        const cur = this.currentStance(playerId);
        if (!cur) return true;
        return STANCE_TRANSITIONS[cur].includes(toStance);
    }
    allowed(playerId) {
        const cur = this.currentStance(playerId);
        if (!cur) return STANCE_TYPES;
        return STANCE_TRANSITIONS[cur] || [];
    }
    bonus(playerId) {
        const s = this.currentStance(playerId);
        const m = { offensive: { atk: 0.2 }, defensive: { def: 0.2 }, neutral: {}, berserk: { atk: 0.5, def: -0.2 }, stealth: { dodge: 0.3 }, meditative: { qi: 0.3 } };
        return m[s] || {};
    }
    hasBonus(playerId, stat) {
        return (this.bonus(playerId)[stat] || 0) > 0;
    }
    isAggressive(playerId) {
        const s = this.currentStance(playerId);
        return s === 'offensive' || s === 'berserk';
    }
    isDefensive(playerId) {
        const s = this.currentStance(playerId);
        return s === 'defensive' || s === 'meditative' || s === 'stealth';
    }
    mostCommon(playerId) {
        const h = this.history(playerId);
        if (h.length === 0) return null;
        const counts = {};
        for (const e of h) counts[e.to] = (counts[e.to] || 0) + 1;
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    }
    report() { return { totalChanges: this.stats.totalChanges, players: this.stances.size }; }
    reset() { this.stances.clear(); this.stats = { totalChanges: 0 }; }
}
