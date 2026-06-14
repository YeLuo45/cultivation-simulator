/**
 * CombatEngine.js - 战斗引擎
 * V1013 P-20260614-173 Round 39 Iter 6/30
 */
export const COMBAT_PHASES = ['idle', 'engaged', 'resolution', 'concluded'];
export const ATTACK_TYPES = ['melee', 'ranged', 'magic', 'technique'];

export class CombatEngine {
    constructor(config = {}) {
        this.config = { ...config };
        this.fights = new Map();    // fightId -> { a, b, phase, log, winner, ts }
        this.hooks = new Map();
        this.stats = { totalFights: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `fgt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    startFight(a, b) {
        if (!a || !b || a === b) return null;
        const id = this._newId();
        const f = { id, a, b, phase: 'engaged', log: [{ event: 'start', ts: Date.now() }], winner: null, ts: Date.now() };
        this.fights.set(id, f);
        this.stats.totalFights++;
        this._emit('started', f);
        return f;
    }
    get(id) { return this.fights.get(id) || null; }
    listAll() { return [...this.fights.values()]; }

    log(id, event) {
        const f = this.fights.get(id);
        if (!f) return false;
        f.log.push({ ...event, ts: Date.now() });
        return true;
    }
    logEntries(id) {
        const f = this.fights.get(id);
        return f ? [...f.log] : [];
    }
    setPhase(id, phase) {
        const f = this.fights.get(id);
        if (!f) return false;
        if (!COMBAT_PHASES.includes(phase)) return false;
        f.phase = phase;
        return true;
    }
    currentPhase(id) { return this.fights.get(id)?.phase || null; }
    conclude(id, winner) {
        const f = this.fights.get(id);
        if (!f) return false;
        f.winner = winner;
        f.phase = 'concluded';
        f.log.push({ event: 'conclude', winner, ts: Date.now() });
        this._emit('concluded', f);
        return true;
    }
    winner(id) { return this.fights.get(id)?.winner || null; }
    isConcluded(id) { return this.fights.get(id)?.phase === 'concluded'; }
    isEngaged(id) { return this.fights.get(id)?.phase === 'engaged'; }

    duration(id) {
        const f = this.fights.get(id);
        if (!f) return 0;
        return Date.now() - f.ts;
    }
    totalAttacks(id) {
        const f = this.fights.get(id);
        if (!f) return 0;
        return f.log.filter(e => e.event === 'attack').length;
    }
    attackCount(id, player) {
        const f = this.fights.get(id);
        if (!f) return 0;
        return f.log.filter(e => e.event === 'attack' && e.attacker === player).length;
    }
    participation(id, player) {
        const f = this.fights.get(id);
        if (!f) return 0;
        const attacks = this.attackCount(id, player);
        return attacks / Math.max(1, this.totalAttacks(id));
    }
    report() { return { totalFights: this.stats.totalFights, concluded: this.listAll().filter(f => f.phase === 'concluded').length }; }
    reset() { this.fights.clear(); this.stats = { totalFights: 0 }; }
}
