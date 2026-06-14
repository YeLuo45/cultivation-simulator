/**
 * PotionPotency.js - 药效强度
 * V1063 P-20260614-253 Round 40 Iter 26/30
 */
export const POTENCY_LEVELS = ['weak', 'normal', 'strong', 'extreme', 'overwhelming'];
export const BASE_POTENCY = 1.0;

export class PotionPotency {
    constructor(config = {}) {
        this.config = { base: config.base || BASE_POTENCY, ...config };
        this.potions = new Map();   // potionId -> { id, basePotency, modifiers, finalPotency, level }
        this.hooks = new Map();
        this.stats = { total: 0, totalPotency: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    register(potionId, basePotency = BASE_POTENCY, modifiers = []) {
        if (!potionId) return false;
        const final = this._compute(basePotency, modifiers);
        this.potions.set(potionId, { id: potionId, basePotency, modifiers, finalPotency: final, level: this._levelFor(final) });
        this.stats.total++;
        this.stats.totalPotency += final;
        return true;
    }
    _compute(base, mods) {
        let result = base;
        for (const m of mods) result = result * (1 + m);
        return result;
    }
    _levelFor(potency) {
        if (potency < 1) return 'weak';
        if (potency < 2) return 'normal';
        if (potency < 4) return 'strong';
        if (potency < 8) return 'extreme';
        return 'overwhelming';
    }
    get(potionId) { return this.potions.get(potionId) || null; }
    listAll() { return [...this.potions.values()]; }
    listByLevel(level) { return this.listAll().filter(p => p.level === level); }

    addModifier(potionId, modifier) {
        const p = this.potions.get(potionId);
        if (!p) return false;
        p.modifiers.push(modifier);
        p.finalPotency = this._compute(p.basePotency, p.modifiers);
        p.level = this._levelFor(p.finalPotency);
        return true;
    }
    setBase(potionId, base) {
        const p = this.potions.get(potionId);
        if (!p) return false;
        p.basePotency = base;
        p.finalPotency = this._compute(base, p.modifiers);
        p.level = this._levelFor(p.finalPotency);
        return true;
    }
    clearModifiers(potionId) {
        const p = this.potions.get(potionId);
        if (!p) return false;
        p.modifiers = [];
        p.finalPotency = p.basePotency;
        p.level = this._levelFor(p.finalPotency);
        return true;
    }
    potencyOf(potionId) { return this.potions.get(potionId)?.finalPotency || 0; }
    levelOf(potionId) { return this.potions.get(potionId)?.level || null; }
    isExtreme(potionId) {
        const l = this.levelOf(potionId);
        return l === 'extreme' || l === 'overwhelming';
    }
    isOverwhelming(potionId) { return this.levelOf(potionId) === 'overwhelming'; }
    strongest(n = 5) { return this.listAll().sort((a, b) => b.finalPotency - a.finalPotency).slice(0, n); }
    averagePotency() { return this.stats.total === 0 ? 0 : this.stats.totalPotency / this.stats.total; }
    report() { return { total: this.stats.total, averagePotency: this.averagePotency() }; }
    reset() { this.potions.clear(); this.stats = { total: 0, totalPotency: 0 }; }
}
