/**
 * SetBonusCalculator.js - 套装加成计算器
 * V1026 P-20260614-186 Round 39 Iter 19/30
 */
export const TIER_BONUSES = [0, 5, 10, 20, 30, 50];

export class SetBonusCalculator {
    constructor(config = {}) {
        this.config = { ...config };
        this.definitions = new Map();  // setId -> { setId, name, thresholds, bonuses }
        this.hooks = new Map();
        this.stats = { totalSets: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    registerSet(setId, name, thresholds, bonuses) {
        if (!setId || !Array.isArray(thresholds) || !Array.isArray(bonuses)) return false;
        if (thresholds.length !== bonuses.length) return false;
        this.definitions.set(setId, { setId, name, thresholds, bonuses });
        this.stats.totalSets++;
        return true;
    }
    get(setId) { return this.definitions.get(setId) || null; }
    listAll() { return [...this.definitions.values()]; }

    calculateBonus(setId, equippedCount) {
        const def = this.definitions.get(setId);
        if (!def) return null;
        let activeBonus = {};
        let activeTier = 0;
        for (let i = 0; i < def.thresholds.length; i++) {
            if (equippedCount >= def.thresholds[i]) {
                activeBonus = { ...activeBonus, ...def.bonuses[i] };
                activeTier = i + 1;
            }
        }
        return { tier: activeTier, bonus: activeBonus, next: def.thresholds[activeTier] || null };
    }
    nextThreshold(setId, equippedCount) {
        const def = this.definitions.get(setId);
        if (!def) return null;
        return def.thresholds.find(t => t > equippedCount) || null;
    }
    progressToNext(setId, equippedCount) {
        const def = this.definitions.get(setId);
        if (!def) return 0;
        const next = this.nextThreshold(setId, equippedCount);
        if (next === null) return 1;
        const cur = [...def.thresholds].reverse().find(t => t <= equippedCount) || 0;
        return (equippedCount - cur) / (next - cur);
    }
    hasBonus(setId, equippedCount) { return this.calculateBonus(setId, equippedCount).tier > 0; }
    isMaxed(setId, equippedCount) {
        const def = this.definitions.get(setId);
        if (!def) return false;
        return equippedCount >= def.thresholds[def.thresholds.length - 1];
    }
    aggregateForPlayer(setCounts) {
        const result = {};
        for (const [setId, count] of Object.entries(setCounts)) {
            const b = this.calculateBonus(setId, count);
            if (b) for (const [k, v] of Object.entries(b.bonus)) result[k] = (result[k] || 0) + v;
        }
        return result;
    }
    totalBonusValue(setId, equippedCount) {
        const b = this.calculateBonus(setId, equippedCount);
        if (!b) return 0;
        return Object.values(b.bonus).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0);
    }
    report() { return { totalSets: this.stats.totalSets }; }
    reset() { this.definitions.clear(); this.stats = { totalSets: 0 }; }
}
