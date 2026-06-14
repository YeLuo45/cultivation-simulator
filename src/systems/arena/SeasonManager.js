/**
 * SeasonManager.js - 赛季管理器
 * V1030 P-20260614-190 Round 39 Iter 23/30
 */
export const SEASON_STATUS = ['upcoming', 'active', 'ended'];
export const DEFAULT_SEASON_LENGTH = 30 * 24 * 60 * 60 * 1000;

export class SeasonManager {
    constructor(config = {}) {
        this.config = { seasonLength: config.seasonLength || DEFAULT_SEASON_LENGTH, ...config };
        this.seasons = new Map();   // seasonId -> { id, name, startTs, endTs, status, rewards }
        this.currentSeason = null;
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `seas_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(name, startTs = null, rewards = {}) {
        if (!name) return null;
        const id = this._newId();
        const start = startTs || Date.now();
        const s = { id, name, startTs: start, endTs: start + this.config.seasonLength, status: 'upcoming', rewards, createdAt: Date.now() };
        this.seasons.set(id, s);
        this.stats.total++;
        this._emit('created', s);
        return s;
    }
    get(id) { return this.seasons.get(id) || null; }
    listAll() { return [...this.seasons.values()]; }
    listByStatus(st) { return this.listAll().filter(s => s.status === st); }
    current() { return this.seasons.get(this.currentSeason) || null; }

    start(seasonId) {
        const s = this.seasons.get(seasonId);
        if (!s) return false;
        if (s.status !== 'upcoming') return false;
        s.status = 'active';
        s.startedAt = Date.now();
        this.currentSeason = seasonId;
        this._emit('started', s);
        return true;
    }
    end(seasonId) {
        const s = this.seasons.get(seasonId);
        if (!s) return false;
        s.status = 'ended';
        s.endedAt = Date.now();
        if (this.currentSeason === seasonId) this.currentSeason = null;
        this._emit('ended', s);
        return true;
    }
    setReward(seasonId, reward) {
        const s = this.seasons.get(seasonId);
        if (!s) return false;
        s.rewards = { ...s.rewards, ...reward };
        return true;
    }
    setCurrent(seasonId) {
        if (!this.seasons.has(seasonId)) return false;
        this.currentSeason = seasonId;
        return true;
    }
    isActive(seasonId) { return this.seasons.get(seasonId)?.status === 'active'; }
    isUpcoming(seasonId) { return this.seasons.get(seasonId)?.status === 'upcoming'; }
    isEnded(seasonId) { return this.seasons.get(seasonId)?.status === 'ended'; }
    progress(seasonId) {
        const s = this.seasons.get(seasonId);
        if (!s) return 0;
        if (s.status === 'upcoming') return 0;
        if (s.status === 'ended') return 1;
        return Math.min(1, (Date.now() - s.startTs) / (s.endTs - s.startTs));
    }
    daysLeft(seasonId) {
        const s = this.seasons.get(seasonId);
        if (!s) return 0;
        return Math.max(0, Math.ceil((s.endTs - Date.now()) / (24 * 60 * 60 * 1000)));
    }
    rewardFor(seasonId, playerId) {
        const s = this.seasons.get(seasonId);
        return s ? s.rewards : null;
    }
    report() { return { total: this.stats.total, current: this.currentSeason }; }
    reset() { this.seasons.clear(); this.currentSeason = null; this.stats = { total: 0 }; }
}
