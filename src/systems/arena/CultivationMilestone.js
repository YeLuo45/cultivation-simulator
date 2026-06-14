/**
 * CultivationMilestone.js - 修为里程碑
 * V1033 P-20260614-193 Round 39 Iter 26/30
 */
export const REALM_LEVELS = ['qi_refining', 'foundation_building', 'golden_core', 'nascent_soul', 'soul_transformation', 'mahayana', 'tribulation'];
export const DEFAULT_THRESHOLDS = [0, 100, 300, 800, 2000, 5000, 15000];

export class CultivationMilestone {
    constructor(config = {}) {
        this.config = { thresholds: DEFAULT_THRESHOLDS, ...config };
        this.progress = new Map();   // playerId -> { exp, realm, history }
        this.hooks = new Map();
        this.stats = { totalExp: 0, breakthroughs: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    init(playerId, startExp = 0) {
        if (!playerId) return false;
        this.progress.set(playerId, { exp: startExp, realm: this._realmFor(startExp), history: [] });
        return true;
    }
    get(playerId) { return this.progress.get(playerId) || null; }
    listAll() { return [...this.progress.values()]; }
    listByRealm(realm) { return this.listAll().filter(p => p.realm === realm); }

    _realmFor(exp) {
        const t = this.config.thresholds;
        let realm = REALM_LEVELS[0];
        for (let i = t.length - 1; i >= 0; i--) {
            if (exp >= t[i]) { realm = REALM_LEVELS[i]; break; }
        }
        return realm;
    }

    addExp(playerId, amount) {
        if (!this.progress.has(playerId)) this.init(playerId, 0);
        const p = this.progress.get(playerId);
        const oldRealm = p.realm;
        p.exp += amount;
        p.realm = this._realmFor(p.exp);
        p.history.push({ event: 'gain', amount, ts: Date.now() });
        if (this.config.thresholds[REALM_LEVELS.indexOf(p.realm)] <= p.exp && oldRealm !== p.realm) {
            this.stats.breakthroughs++;
            this._emit('breakthrough', { playerId, from: oldRealm, to: p.realm });
        }
        this.stats.totalExp += amount;
        return p.exp;
    }
    removeExp(playerId, amount) {
        const p = this.progress.get(playerId);
        if (!p) return null;
        p.exp = Math.max(0, p.exp - amount);
        p.realm = this._realmFor(p.exp);
        return p.exp;
    }
    currentExp(playerId) { return this.progress.get(playerId)?.exp || 0; }
    currentRealm(playerId) { return this.progress.get(playerId)?.realm || null; }
    expToNext(playerId) {
        const p = this.progress.get(playerId);
        if (!p) return 0;
        const idx = REALM_LEVELS.indexOf(p.realm);
        if (idx === -1 || idx === REALM_LEVELS.length - 1) return 0;
        return this.config.thresholds[idx + 1] - p.exp;
    }
    progressToNext(playerId) {
        const p = this.progress.get(playerId);
        if (!p) return 0;
        const idx = REALM_LEVELS.indexOf(p.realm);
        if (idx === -1 || idx === REALM_LEVELS.length - 1) return 1;
        const cur = this.config.thresholds[idx];
        const next = this.config.thresholds[idx + 1];
        return Math.max(0, Math.min(1, (p.exp - cur) / (next - cur)));
    }
    isAtMax(playerId) {
        return REALM_LEVELS.indexOf(this.currentRealm(playerId)) === REALM_LEVELS.length - 1;
    }
    canBreakthrough(playerId) {
        const p = this.progress.get(playerId);
        if (!p) return false;
        const idx = REALM_LEVELS.indexOf(p.realm);
        if (idx === -1 || idx === REALM_LEVELS.length - 1) return false;
        const cur = this.config.thresholds[idx];
        const next = this.config.thresholds[idx + 1];
        const zone = cur + (next - cur) * 0.5;
        return p.exp >= zone;
    }
    history(playerId) { return [...(this.progress.get(playerId)?.history || [])]; }
    countByRealm() {
        const c = {};
        for (const r of REALM_LEVELS) c[r] = 0;
        for (const p of this.progress.values()) c[p.realm] = (c[p.realm] || 0) + 1;
        return c;
    }
    report() { return { totalExp: this.stats.totalExp, breakthroughs: this.stats.breakthroughs, byRealm: this.countByRealm() }; }
    reset() { this.progress.clear(); this.stats = { totalExp: 0, breakthroughs: 0 }; }
}
