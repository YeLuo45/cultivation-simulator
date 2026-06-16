/**
 * ElementalAffinity.js - 元素亲和
 * V1021 P-20260614-181 Round 39 Iter 14/30
 */
export const ELEMENTS = ['fire', 'water', 'wood', 'metal', 'earth', 'wind', 'thunder', 'light', 'dark'];
export const STRONG_AGAINST = {
    fire: 'metal', metal: 'wood', wood: 'earth', earth: 'water', water: 'fire',
    wind: 'thunder', thunder: 'earth', light: 'dark', dark: 'light',
};

export class ElementalAffinity {
    constructor(config = {}) {
        this.config = { ...config };
        this.affinities = new Map();   // playerId -> { element: affinity 0-100 }
        this.hooks = new Map();
        this.stats = { totalPlayers: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    setAffinity(playerId, element, value) {
        if (!playerId || !ELEMENTS.includes(element)) return false;
        const v = Math.max(0, Math.min(100, value));
        if (!this.affinities.has(playerId)) this.affinities.set(playerId, {});
        this.affinities.get(playerId)[element] = v;
        if (Object.keys(this.affinities.get(playerId)).length === 1) this.stats.totalPlayers++;
        return true;
    }
    get(playerId) { return this.affinities.get(playerId) || {}; }
    getAffinity(playerId, element) { return this.affinities.get(playerId)?.[element] || 0; }

    primaryElement(playerId) {
        const a = this.affinities.get(playerId);
        if (!a) return null;
        let best = null, bestV = -1;
        for (const [k, v] of Object.entries(a)) {
            if (v > bestV) { bestV = v; best = k; }
        }
        return best;
    }
    secondaryElement(playerId) {
        const a = this.affinities.get(playerId);
        if (!a) return null;
        const sorted = Object.entries(a).sort((x, y) => y[1] - x[1]);
        return sorted[1]?.[0] || null;
    }
    hasElement(playerId, element, threshold = 30) {
        return this.getAffinity(playerId, element) >= threshold;
    }

    isStronger(attacker, defender) {
        const atk = this.primaryElement(attacker);
        const def = this.primaryElement(defender);
        if (!atk || !def) return false;
        return STRONG_AGAINST[atk] === def;
    }
    advantageBonus(attacker, defender) {
        if (this.isStronger(attacker, defender)) return 1.25;
        if (this.isStronger(defender, attacker)) return 0.8;
        return 1.0;
    }
    weakAgainst(element) { return Object.entries(STRONG_AGAINST).filter(([k, v]) => v === element).map(([k]) => k); }
    strongAgainst(element) { return STRONG_AGAINST[element] || null; }
    mastery(playerId, element) {
        const v = this.getAffinity(playerId, element);
        if (v >= 80) return 'mastered';
        if (v >= 50) return 'proficient';
        if (v >= 20) return 'learning';
        return 'novice';
    }
    distribution(playerId) {
        const result = {};
        for (const e of ELEMENTS) result[e] = this.getAffinity(playerId, e);
        return result;
    }
    totalAffinity(playerId) {
        return Object.values(this.affinities.get(playerId) || {}).reduce((s, v) => s + v, 0);
    }
    report() { return { totalPlayers: this.stats.totalPlayers }; }
    reset() { this.affinities.clear(); this.stats = { totalPlayers: 0 }; }
}
