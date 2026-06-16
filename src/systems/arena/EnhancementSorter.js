/**
 * EnhancementSorter.js - 强化排序器
 * V1027 P-20260614-187 Round 39 Iter 20/30
 */
export const ENHANCEMENT_MAX = 20;
export const ENHANCEMENT_BONUS = 0.05;  // 5% per level

export class EnhancementSorter {
    constructor(config = {}) {
        this.config = { maxLevel: config.maxLevel || ENHANCEMENT_MAX, bonus: config.bonus || ENHANCEMENT_BONUS, ...config };
        this.items = new Map();   // itemId -> { id, level, exp, owner, attempts }
        this.hooks = new Map();
        this.stats = { totalEnhancements: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `enh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    registerItem(id, basePower) {
        if (!id) return false;
        this.items.set(id, { id, level: 0, exp: 0, basePower, attempts: 0, owner: null });
        return true;
    }
    get(id) { return this.items.get(id) || null; }
    listAll() { return [...this.items.values()]; }
    listByLevel(level) { return this.listAll().filter(i => i.level === level); }
    listByOwner(owner) { return this.listAll().filter(i => i.owner === owner); }
    setOwner(itemId, owner) {
        const i = this.items.get(itemId);
        if (!i) return false;
        i.owner = owner;
        return true;
    }

    enhance(itemId) {
        const i = this.items.get(itemId);
        if (!i) return false;
        if (i.level >= this.config.maxLevel) return false;
        const cost = this.costFor(i.level + 1);
        const successChance = 1 - (i.level + 1) * 0.03;
        i.attempts++;
        this.stats.totalEnhancements++;
        if (Math.random() < successChance) {
            i.level++;
            this._emit('enhanced', { itemId, level: i.level });
            return true;
        }
        this._emit('failed', { itemId, level: i.level });
        return false;
    }
    costFor(level) { return Math.floor(10 * Math.pow(1.5, level - 1)); }
    bonusFor(itemId) {
        const i = this.items.get(itemId);
        if (!i) return 0;
        return 1 + i.level * this.config.bonus;
    }
    effectivePower(itemId) {
        const i = this.items.get(itemId);
        if (!i) return 0;
        return Math.floor((i.basePower || 10) * this.bonusFor(itemId));
    }
    isMaxed(itemId) { return this.items.get(itemId)?.level >= this.config.maxLevel; }
    successChance(itemId) {
        const i = this.items.get(itemId);
        if (!i) return 0;
        return Math.max(0, 1 - (i.level + 1) * 0.03);
    }
    sortByPower() { return this.listAll().sort((a, b) => this.effectivePower(b.id) - this.effectivePower(a.id)); }
    topPower(n = 5) { return this.sortByPower().slice(0, n); }
    avgLevel() {
        if (this.items.size === 0) return 0;
        return [...this.items.values()].reduce((s, i) => s + i.level, 0) / this.items.size;
    }
    hasOwner(itemId) { return !!this.items.get(itemId)?.owner; }
    report() { return { totalEnhancements: this.stats.totalEnhancements, totalItems: this.items.size, avgLevel: this.avgLevel() }; }
    reset() { this.items.clear(); this.stats = { totalEnhancements: 0 }; }
}
