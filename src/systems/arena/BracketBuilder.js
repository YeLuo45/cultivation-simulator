/**
 * BracketBuilder.js - 赛程构造器
 * V1009 P-20260614-169 Round 39 Iter 2/30
 */
export const BRACKET_TYPES = ['single_elim', 'double_elim', 'round_robin', 'swiss'];
export const ROUND_STATUS = ['pending', 'in_progress', 'completed'];

export class BracketBuilder {
    constructor(config = {}) {
        this.config = { ...config };
        this.brackets = new Map();   // bracketId -> { id, type, players, rounds, status, createdAt }
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `brk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(type, players) {
        if (!BRACKET_TYPES.includes(type)) return null;
        if (!Array.isArray(players) || players.length < 2) return null;
        const id = this._newId();
        const b = { id, type, players: [...players], rounds: [], status: 'pending', createdAt: Date.now() };
        if (type === 'single_elim' || type === 'double_elim') {
            b.rounds = this._buildSingleElim(players);
        } else if (type === 'round_robin') {
            b.rounds = this._buildRoundRobin(players);
        } else if (type === 'swiss') {
            b.rounds = [{ matches: this._pairFirst(players), status: 'pending' }];
        }
        this.brackets.set(id, b);
        this.stats.total++;
        this._emit('created', b);
        return b;
    }

    _buildSingleElim(players) {
        const size = Math.pow(2, Math.ceil(Math.log2(players.length)));
        const padded = [...players, ...new Array(size - players.length).fill(null)];
        const matches = [];
        for (let i = 0; i < size / 2; i++) {
            matches.push({ a: padded[i * 2], b: padded[i * 2 + 1], winner: null, status: 'pending' });
        }
        return [{ matches, status: 'pending', round: 1 }];
    }

    _buildRoundRobin(players) {
        const matches = [];
        for (let i = 0; i < players.length; i++) {
            for (let j = i + 1; j < players.length; j++) {
                matches.push({ a: players[i], b: players[j], winner: null, status: 'pending' });
            }
        }
        return [{ matches, status: 'pending', round: 1 }];
    }

    _pairFirst(players) {
        const matches = [];
        for (let i = 0; i < players.length; i += 2) {
            matches.push({ a: players[i], b: players[i + 1] || null, winner: null, status: 'pending' });
        }
        return matches;
    }

    get(id) { return this.brackets.get(id) || null; }
    listAll() { return [...this.brackets.values()]; }
    listByType(type) { return this.listAll().filter(b => b.type === type); }
    listByStatus(st) { return this.listAll().filter(b => b.status === st); }

    advance(bracketId, matchIdx, winner) {
        const b = this.brackets.get(bracketId);
        if (!b) return false;
        if (b.rounds.length === 0) return false;
        const match = b.rounds[b.rounds.length - 1].matches[matchIdx];
        if (!match) return false;
        match.winner = winner;
        match.status = 'completed';
        return true;
    }

    startNextRound(bracketId) {
        const b = this.brackets.get(bracketId);
        if (!b) return null;
        const prev = b.rounds[b.rounds.length - 1];
        if (!prev) return null;
        if (prev.matches.some(m => m.status !== 'completed')) return null;
        const winners = prev.matches.map(m => m.winner).filter(Boolean);
        if (winners.length < 2) {
            b.status = 'completed';
            b.winner = winners[0] || null;
            return b;
        }
        const newMatches = this._pairFirst(winners);
        b.rounds.push({ matches: newMatches, status: 'in_progress', round: b.rounds.length + 1 });
        b.status = 'in_progress';
        return b;
    }

    isComplete(bracketId) { return this.brackets.get(bracketId)?.status === 'completed'; }
    winner(bracketId) { return this.brackets.get(bracketId)?.winner || null; }
    currentRound(bracketId) { return this.brackets.get(bracketId)?.rounds.length || 0; }
    matchCount(bracketId) {
        return (this.brackets.get(bracketId)?.rounds || []).reduce((s, r) => s + r.matches.length, 0);
    }
    playerMatches(bracketId, playerId) {
        const b = this.brackets.get(bracketId);
        if (!b) return [];
        const result = [];
        for (const r of b.rounds) {
            for (const m of r.matches) {
                if (m.a === playerId || m.b === playerId) result.push(m);
            }
        }
        return result;
    }
    report() { return { total: this.stats.total }; }
    reset() { this.brackets.clear(); this.stats = { total: 0 }; }
}
