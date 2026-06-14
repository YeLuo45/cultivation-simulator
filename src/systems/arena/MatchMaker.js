/**
 * MatchMaker.js - 对战匹配器
 * V1008 P-20260614-168 Round 39 Iter 1/30 Direction B 仙道演武场
 *
 * 根据修为/Elo/偏好匹配对手
 */
export const MATCH_STRATEGIES = ['elo', 'bracket', 'tier', 'random', 'manual'];

export class MatchMaker {
    constructor(config = {}) {
        this.config = { strategy: config.strategy || 'elo', ...config };
        this.players = new Map();     // playerId -> { id, elo, tier, prefs, recent }
        this.matches = new Map();     // matchId -> { a, b, ts, reason }
        this.hooks = new Map();
        this.stats = { totalMatches: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `match_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    registerPlayer(id, elo = 1000, tier = 'bronze') {
        if (!id) return null;
        this.players.set(id, { id, elo, tier, prefs: {}, recent: [], losses: 0, wins: 0 });
        return this.players.get(id);
    }
    getPlayer(id) { return this.players.get(id) || null; }
    setElo(id, elo) {
        const p = this.players.get(id);
        if (!p) return false;
        p.elo = Math.max(0, elo);
        return true;
    }
    setTier(id, tier) {
        const p = this.players.get(id);
        if (!p) return false;
        p.tier = tier;
        return true;
    }
    setPrefs(id, prefs) {
        const p = this.players.get(id);
        if (!p) return false;
        p.prefs = { ...p.prefs, ...prefs };
        return true;
    }
    listByTier(tier) { return [...this.players.values()].filter(p => p.tier === tier); }
    listByEloRange(min, max) { return [...this.players.values()].filter(p => p.elo >= min && p.elo <= max); }

    recordResult(playerId, won) {
        const p = this.players.get(playerId);
        if (!p) return false;
        if (won) p.wins++;
        else p.losses++;
        p.recent.push(won);
        if (p.recent.length > 10) p.recent.shift();
        return true;
    }
    winRate(playerId) {
        const p = this.players.get(playerId);
        if (!p) return 0;
        const total = p.wins + p.losses;
        if (total === 0) return 0;
        return p.wins / total;
    }
    isOnStreak(playerId, n = 3) {
        const p = this.players.get(playerId);
        if (!p || p.recent.length < n) return false;
        return p.recent.slice(-n).every(x => x);
    }

    eloUpdate(winnerElo, loserElo, k = 32) {
        const expected = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
        const score = 1;
        return { winnerNew: Math.round(winnerElo + k * (score - expected)), loserNew: Math.round(loserElo + k * ((1 - score) - (1 - expected))) };
    }

    findMatch(playerId) {
        const p = this.players.get(playerId);
        if (!p) return null;
        const candidates = [...this.players.values()].filter(x => x.id !== playerId);
        if (candidates.length === 0) return null;
        if (this.config.strategy === 'elo') {
            candidates.sort((a, b) => Math.abs(a.elo - p.elo) - Math.abs(b.elo - p.elo));
        } else if (this.config.strategy === 'tier') {
            candidates.sort((a, b) => a.tier === p.tier ? -1 : 1);
        } else if (this.config.strategy === 'random') {
            candidates.sort(() => Math.random() - 0.5);
        }
        return candidates[0]?.id || null;
    }

    createMatch(a, b) {
        if (!this.players.has(a) || !this.players.has(b)) return null;
        if (a === b) return null;
        const id = this._newId();
        const m = { id, a, b, ts: Date.now(), reason: 'match' };
        this.matches.set(id, m);
        this.stats.totalMatches++;
        this._emit('matched', m);
        return m;
    }
    get(id) { return this.matches.get(id) || null; }
    listAll() { return [...this.matches.values()]; }
    isValid(matchId) { return this.matches.has(matchId); }
    matchCount(playerId) { return this.listAll().filter(m => m.a === playerId || m.b === playerId).length; }
    report() { return { totalMatches: this.stats.totalMatches, players: this.players.size }; }
    reset() { this.players.clear(); this.matches.clear(); this.stats = { totalMatches: 0 }; }
}
