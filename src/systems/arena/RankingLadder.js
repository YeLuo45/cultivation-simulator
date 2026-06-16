/**
 * RankingLadder.js - 天梯排名
 * V1029 P-20260614-189 Round 39 Iter 22/30
 */
export const TIER_BANDS = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster'];
export const DEFAULT_TIER_THRESHOLDS = [0, 1000, 1200, 1400, 1600, 1800, 2000];

export class RankingLadder {
    constructor(config = {}) {
        this.config = { tierThresholds: DEFAULT_TIER_THRESHOLDS, ...config };
        this.entries = new Map();   // playerId -> { id, elo, tier, rank, peak, history, lastMatch }
        this.hooks = new Map();
        this.stats = { totalUpdates: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    registerPlayer(id, elo = 1000) {
        if (!id) return null;
        this.entries.set(id, { id, elo, tier: this._tierFor(elo), rank: 0, peak: elo, history: [], lastMatch: null });
        this._recalculate();
        return this.entries.get(id);
    }
    get(id) { return this.entries.get(id) || null; }
    listAll() { return [...this.entries.values()]; }

    _tierFor(elo) {
        const t = this.config.tierThresholds;
        let tier = TIER_BANDS[0];
        for (let i = t.length - 1; i >= 0; i--) {
            if (elo >= t[i]) { tier = TIER_BANDS[i]; break; }
        }
        return tier;
    }

    updateElo(winnerId, loserId, k = 32) {
        const w = this.entries.get(winnerId);
        const l = this.entries.get(loserId);
        if (!w || !l) return null;
        const expectedW = 1 / (1 + Math.pow(10, (l.elo - w.elo) / 400));
        const delta = Math.round(k * (1 - expectedW));
        w.elo += delta;
        l.elo -= delta;
        w.tier = this._tierFor(w.elo);
        l.tier = this._tierFor(l.elo);
        if (w.elo > w.peak) w.peak = w.elo;
        w.history.push({ ts: Date.now(), change: delta, type: 'win' });
        l.history.push({ ts: Date.now(), change: -delta, type: 'loss' });
        w.lastMatch = Date.now();
        l.lastMatch = Date.now();
        this.stats.totalUpdates++;
        this._recalculate();
        this._emit('updated', { winnerId, loserId });
        return { delta, winnerNewElo: w.elo, loserNewElo: l.elo };
    }

    _recalculate() {
        const sorted = [...this.entries.values()].sort((a, b) => b.elo - a.elo);
        sorted.forEach((e, i) => { e.rank = i + 1; });
    }

    rankOf(id) { return this.entries.get(id)?.rank || 0; }
    eloOf(id) { return this.entries.get(id)?.elo || 0; }
    tierOf(id) { return this.entries.get(id)?.tier || null; }
    peakElo(id) { return this.entries.get(id)?.peak || 0; }
    isTop(id, n = 10) { return this.rankOf(id) <= n; }
    top(n = 10) { return [...this.entries.values()].sort((a, b) => b.elo - a.elo).slice(0, n); }
    byTier(tier) { return this.listAll().filter(e => e.tier === tier); }
    countByTier() {
        const c = {};
        for (const t of TIER_BANDS) c[t] = 0;
        for (const e of this.entries.values()) c[e.tier] = (c[e.tier] || 0) + 1;
        return c;
    }
    rankGap(a, b) {
        return Math.abs(this.rankOf(a) - this.rankOf(b));
    }
    eloGap(a, b) {
        return Math.abs(this.eloOf(a) - this.eloOf(b));
    }
    report() { return { totalUpdates: this.stats.totalUpdates, totalPlayers: this.entries.size, topElo: this.top(1)[0]?.elo || 0 }; }
    reset() { this.entries.clear(); this.stats = { totalUpdates: 0 }; }
}
