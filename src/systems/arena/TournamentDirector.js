/**
 * TournamentDirector.js - 赛事总监
 * V1028 P-20260614-188 Round 39 Iter 21/30
 */
export const TOURNAMENT_STATUS = ['planning', 'registration', 'in_progress', 'completed', 'cancelled'];
export const TOURNAMENT_FORMATS = ['single_elim', 'double_elim', 'round_robin', 'swiss'];

export class TournamentDirector {
    constructor(config = {}) {
        this.config = { ...config };
        this.tournaments = new Map();   // tournamentId -> { id, name, format, maxPlayers, prizePool, status, registered, bracket }
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `trn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(name, format, maxPlayers = 16, prizePool = 0) {
        if (!name || !TOURNAMENT_FORMATS.includes(format)) return null;
        const id = this._newId();
        const t = { id, name, format, maxPlayers, prizePool, status: 'planning', registered: [], bracket: null, createdAt: Date.now() };
        this.tournaments.set(id, t);
        this.stats.total++;
        this._emit('created', t);
        return t;
    }
    get(id) { return this.tournaments.get(id) || null; }
    listAll() { return [...this.tournaments.values()]; }
    listByStatus(st) { return this.listAll().filter(t => t.status === st); }

    openRegistration(id) {
        const t = this.tournaments.get(id);
        if (!t || t.status !== 'planning') return false;
        t.status = 'registration';
        return true;
    }
    registerPlayer(tournamentId, playerId) {
        const t = this.tournaments.get(tournamentId);
        if (!t) return false;
        if (t.status !== 'registration') return false;
        if (t.registered.length >= t.maxPlayers) return false;
        if (t.registered.includes(playerId)) return false;
        t.registered.push(playerId);
        this._emit('registered', { tournamentId, playerId });
        return true;
    }
    unregister(tournamentId, playerId) {
        const t = this.tournaments.get(tournamentId);
        if (!t) return false;
        t.registered = t.registered.filter(p => p !== playerId);
        return true;
    }
    start(tournamentId) {
        const t = this.tournaments.get(tournamentId);
        if (!t) return false;
        if (t.registered.length < 2) return false;
        if (t.status !== 'registration') return false;
        t.status = 'in_progress';
        return true;
    }
    complete(tournamentId, winner) {
        const t = this.tournaments.get(tournamentId);
        if (!t) return false;
        t.status = 'completed';
        t.winner = winner;
        t.completedAt = Date.now();
        return true;
    }
    cancel(tournamentId, reason = '') {
        const t = this.tournaments.get(tournamentId);
        if (!t) return false;
        t.status = 'cancelled';
        t.cancelReason = reason;
        return true;
    }
    setBracket(tournamentId, bracket) {
        const t = this.tournaments.get(tournamentId);
        if (!t) return false;
        t.bracket = bracket;
        return true;
    }
    isFull(tournamentId) {
        const t = this.tournaments.get(tournamentId);
        return t ? t.registered.length >= t.maxPlayers : false;
    }
    registered(tournamentId) {
        return [...(this.tournaments.get(tournamentId)?.registered || [])];
    }
    count(tournamentId) { return this.registered(tournamentId).length; }
    isRegistered(tournamentId, playerId) {
        return this.registered(tournamentId).includes(playerId);
    }
    winner(tournamentId) { return this.tournaments.get(tournamentId)?.winner || null; }
    prizePerWinner(tournamentId) {
        const t = this.tournaments.get(tournamentId);
        if (!t || t.registered.length === 0) return 0;
        return Math.floor(t.prizePool / Math.min(t.registered.length, 4));
    }
    report() { return { total: this.stats.total, byStatus: this.listAll().reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {}) }; }
    reset() { this.tournaments.clear(); this.stats = { total: 0 }; }
}
