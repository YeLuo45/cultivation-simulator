/**
 * MasteryTracker.js - 熟练度追踪器
 * V1059 P-20260614-249 Round 40 Iter 22/30
 */
export const MASTERY_LEVELS = ['novice', 'apprentice', 'journeyman', 'expert', 'master', 'grandmaster'];
export const DEFAULT_THRESHOLDS = [0, 100, 500, 2000, 8000, 30000];

export class MasteryTracker {
    constructor(config = {}) {
        this.config = { thresholds: DEFAULT_THRESHOLDS, ...config };
        this.mastery = new Map();   // playerId -> { id, exp, level, history }
        this.hooks = new Map();
        this.stats = { totalExp: 0, levelups: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    init(playerId, startExp = 0) {
        if (!playerId) return false;
        this.mastery.set(playerId, { id: playerId, exp: startExp, level: this._levelFor(startExp), history: [] });
        return true;
    }
    get(playerId) { return this.mastery.get(playerId) || null; }
    listAll() { return [...this.mastery.values()]; }
    listByLevel(level) { return this.listAll().filter(m => m.level === level); }
    _levelFor(exp) {
        const t = this.config.thresholds;
        let lvl = MASTERY_LEVELS[0];
        for (let i = t.length - 1; i >= 0; i--) {
            if (exp >= t[i]) { lvl = MASTERY_LEVELS[i]; break; }
        }
        return lvl;
    }

    gain(playerId, amount) {
        if (!this.mastery.has(playerId)) this.init(playerId, 0);
        const m = this.mastery.get(playerId);
        const oldLevel = m.level;
        m.exp += amount;
        m.level = this._levelFor(m.exp);
        m.history.push({ change: amount, exp: m.exp, ts: Date.now() });
        if (m.history.length > 50) m.history.shift();
        this.stats.totalExp += amount;
        if (m.level !== oldLevel) this.stats.levelups++;
        return m.exp;
    }
    currentLevel(playerId) { return this.mastery.get(playerId)?.level || null; }
    currentExp(playerId) { return this.mastery.get(playerId)?.exp || 0; }
    expToNext(playerId) {
        const m = this.mastery.get(playerId);
        if (!m) return 0;
        const idx = MASTERY_LEVELS.indexOf(m.level);
        if (idx === MASTERY_LEVELS.length - 1) return 0;
        return this.config.thresholds[idx + 1] - m.exp;
    }
    progressToNext(playerId) {
        const m = this.mastery.get(playerId);
        if (!m) return 0;
        const idx = MASTERY_LEVELS.indexOf(m.level);
        if (idx === MASTERY_LEVELS.length - 1) return 1;
        const cur = this.config.thresholds[idx];
        const next = this.config.thresholds[idx + 1];
        return Math.max(0, Math.min(1, (m.exp - cur) / (next - cur)));
    }
    isMax(playerId) { return this.mastery.get(playerId)?.level === MASTERY_LEVELS[MASTERY_LEVELS.length - 1]; }
    isAtLeast(playerId, level) {
        return MASTERY_LEVELS.indexOf(this.currentLevel(playerId)) >= MASTERY_LEVELS.indexOf(level);
    }
    isMaster(playerId) {
        const l = this.currentLevel(playerId);
        return l === 'master' || l === 'grandmaster';
    }
    countByLevel() {
        const c = {};
        for (const l of MASTERY_LEVELS) c[l] = 0;
        for (const m of this.mastery.values()) c[m.level] = (c[m.level] || 0) + 1;
        return c;
    }
    history(playerId) { return [...(this.mastery.get(playerId)?.history || [])]; }
    report() { return { totalExp: this.stats.totalExp, levelups: this.stats.levelups }; }
    reset() { this.mastery.clear(); this.stats = { totalExp: 0, levelups: 0 }; }
}
