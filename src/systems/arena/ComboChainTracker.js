/**
 * ComboChainTracker.js - 连击追踪器
 * V1017 P-20260614-177 Round 39 Iter 10/30
 */
export const COMBO_BONUSES = [0, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0];
export const COMBO_TIMEOUT = 3000;

export class ComboChainTracker {
    constructor(config = {}) {
        this.config = { timeout: config.timeout || COMBO_TIMEOUT, bonuses: config.bonuses || COMBO_BONUSES, ...config };
        this.active = new Map();     // playerId -> { count, lastHit, maxThisFight, damageBonus }
        this.history = new Map();    // playerId -> [{ count, endedAt, damage }]
        this.hooks = new Map();
        this.stats = { totalHits: 0, totalCombos: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    hit(playerId, damage = 0) {
        this.stats.totalHits++;
        const now = Date.now();
        let c = this.active.get(playerId);
        if (!c || now - c.lastHit > this.config.timeout) {
            c = { count: 0, lastHit: now, maxThisFight: 0, damage: 0 };
        }
        c.count++;
        c.lastHit = now;
        c.damage += damage;
        if (c.count > c.maxThisFight) c.maxThisFight = c.count;
        c.damageBonus = this.config.bonuses[Math.min(c.count, this.config.bonuses.length - 1)] || 0;
        this.active.set(playerId, c);
        this._emit('hit', { playerId, ...c });
        return c.count;
    }
    breakChain(playerId) {
        const c = this.active.get(playerId);
        if (!c) return null;
        const ended = { count: c.count, maxThisFight: c.maxThisFight, damage: c.damage, endedAt: Date.now() };
        if (!this.history.has(playerId)) this.history.set(playerId, []);
        this.history.get(playerId).push(ended);
        if (c.count >= 3) this.stats.totalCombos++;
        this.active.delete(playerId);
        this._emit('broken', { playerId, ...ended });
        return ended;
    }
    breakAll() {
        const ended = [];
        for (const id of this.active.keys()) {
            const e = this.breakChain(id);
            if (e) ended.push({ playerId: id, ...e });
        }
        return ended;
    }

    get(playerId) { return this.active.get(playerId) || null; }
    currentCount(playerId) { return this.active.get(playerId)?.count || 0; }
    isInCombo(playerId) { return this.active.has(playerId) && this.active.get(playerId).count > 0; }
    damageBonus(playerId) { return this.active.get(playerId)?.damageBonus || 0; }
    isExpired(playerId) {
        const c = this.active.get(playerId);
        if (!c) return true;
        return Date.now() - c.lastHit > this.config.timeout;
    }
    maxComboFor(playerId) { return this.active.get(playerId)?.maxThisFight || 0; }
    history_(playerId) { return [...(this.history.get(playerId) || [])]; }
    bestCombo(playerId) {
        const h = this.history.get(playerId) || [];
        return h.length === 0 ? 0 : Math.max(...h.map(x => x.count));
    }
    avgCombo(playerId) {
        const h = this.history.get(playerId) || [];
        if (h.length === 0) return 0;
        return h.reduce((s, x) => s + x.count, 0) / h.length;
    }
    isHotStreak(playerId, threshold = 5) { return this.currentCount(playerId) >= threshold; }
    report() { return { totalHits: this.stats.totalHits, totalCombos: this.stats.totalCombos, active: this.active.size }; }
    reset() { this.active.clear(); this.history.clear(); this.stats = { totalHits: 0, totalCombos: 0 }; }
}
