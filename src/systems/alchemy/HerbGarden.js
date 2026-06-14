/**
 * HerbGarden.js - 灵草园
 * V1062 P-20260614-252 Round 40 Iter 25/30
 */
export const HERB_RARITY = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
export const GROWTH_STAGES = ['seed', 'sprout', 'growing', 'mature', 'withering'];

export class HerbGarden {
    constructor(config = {}) {
        this.config = { ...config };
        this.plots = new Map();   // plotId -> { id, herbName, rarity, growth, water, plantedAt, harvestedAt }
        this.hooks = new Map();
        this.stats = { total: 0, harvested: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `hrb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    plant(herbName, rarity = 'common') {
        if (!herbName) return null;
        if (!HERB_RARITY.includes(rarity)) rarity = 'common';
        const id = this._newId();
        const p = { id, herbName, rarity, growth: 0, water: 50, stage: 'seed', plantedAt: Date.now(), harvestedAt: null };
        this.plots.set(id, p);
        this.stats.total++;
        return p;
    }
    get(id) { return this.plots.get(id) || null; }
    listAll() { return [...this.plots.values()]; }
    listByStage(stage) { return this.listAll().filter(p => p.stage === stage); }
    listByRarity(rarity) { return this.listAll().filter(p => p.rarity === rarity); }
    listHarvestable() { return this.listByStage('mature'); }

    water(id, amount = 20) {
        const p = this.plots.get(id);
        if (!p) return false;
        p.water = Math.min(100, p.water + amount);
        if (p.growth < 100) p.growth = Math.min(100, p.growth + amount / 2);
        this._updateStage(id);
        return true;
    }
    grow(id, amount) {
        const p = this.plots.get(id);
        if (!p) return false;
        p.growth = Math.min(100, p.growth + amount);
        this._updateStage(id);
        return true;
    }
    _updateStage(id) {
        const p = this.plots.get(id);
        if (!p) return;
        let stage;
        if (p.growth < 20) stage = 'seed';
        else if (p.growth < 40) stage = 'sprout';
        else if (p.growth < 80) stage = 'growing';
        else if (p.growth < 100) stage = 'mature';
        else stage = 'withering';
        p.stage = stage;
    }
    harvest(id) {
        const p = this.plots.get(id);
        if (!p) return null;
        if (p.stage !== 'mature') return null;
        const yield_ = { id, name: p.herbName, rarity: p.rarity, harvestedAt: Date.now() };
        p.harvestedAt = Date.now();
        this.stats.harvested++;
        this._emit('harvested', yield_);
        return yield_;
    }
    remove(id) { return this.plots.delete(id); }
    isMature(id) { return this.plots.get(id)?.stage === 'mature'; }
    growthOf(id) { return this.plots.get(id)?.growth || 0; }
    waterOf(id) { return this.plots.get(id)?.water || 0; }
    stageOf(id) { return this.plots.get(id)?.stage || null; }
    averageGrowth() {
        if (this.plots.size === 0) return 0;
        return this.listAll().reduce((s, p) => s + p.growth, 0) / this.plots.size;
    }
    countByStage() {
        const c = {};
        for (const s of GROWTH_STAGES) c[s] = 0;
        for (const p of this.plots.values()) c[p.stage] = (c[p.stage] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, harvested: this.stats.harvested }; }
    reset() { this.plots.clear(); this.stats = { total: 0, harvested: 0 }; }
}
