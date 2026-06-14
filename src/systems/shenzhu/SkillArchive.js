/**
 * SkillArchive.js - 技能档案
 * V1123 P-20260614-816 Round 42 Iter 26/30
 */
export const ARCHIVE_CATEGORIES = ['technique', 'ability', 'beast_skill', 'formation', 'artifact_skill'];
export const ARCHIVE_LEVELS = ['novice', 'intermediate', 'advanced', 'master', 'grandmaster'];

export class SkillArchive {
    constructor(config = {}) {
        this.config = { ...config };
        this.entries = new Map();   // eid -> { id, name, category, level, owner, power, ts }
        this.byOwner = new Map();
        this.byCategory = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalPower: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `sa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    archive(name, category, level = 'novice', owner = null, power = 1) {
        if (!name) return null;
        if (!ARCHIVE_CATEGORIES.includes(category)) category = 'technique';
        if (!ARCHIVE_LEVELS.includes(level)) level = 'novice';
        const id = this._newId();
        const e = { id, name, category, level, owner, power, ts: Date.now() };
        this.entries.set(id, e);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        if (!this.byCategory.has(category)) this.byCategory.set(category, new Set());
        this.byCategory.get(category).add(id);
        this.stats.total++;
        this.stats.totalPower += power;
        return e;
    }
    get(id) { return this.entries.get(id) || null; }
    listAll() { return [...this.entries.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.entries.get(id)).filter(Boolean);
    }
    listByCategory(c) {
        const ids = this.byCategory.get(c) || new Set();
        return [...ids].map(id => this.entries.get(id)).filter(Boolean);
    }
    listByLevel(l) { return this.listAll().filter(e => e.level === l); }
    listGrandmaster() { return this.listByLevel('grandmaster'); }

    setLevel(id, level) {
        const e = this.entries.get(id);
        if (!e) return false;
        if (!ARCHIVE_LEVELS.includes(level)) return false;
        e.level = level;
        return true;
    }
    setPower(id, power) {
        const e = this.entries.get(id);
        if (!e) return false;
        e.power = Math.max(0, power);
        this.stats.totalPower = this.listAll().reduce((s, x) => s + x.power, 0);
        return true;
    }
    isGrandmaster(id) { return this.entries.get(id)?.level === 'grandmaster'; }
    levelOf(id) { return this.entries.get(id)?.level || null; }
    powerOf(id) { return this.entries.get(id)?.power || 0; }
    categoryOf(id) { return this.entries.get(id)?.category || null; }
    ownerOf(id) { return this.entries.get(id)?.owner || null; }
    averagePower() { return this.stats.total === 0 ? 0 : this.stats.totalPower / this.stats.total; }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    categoryCount(category) { return this.listByCategory(category).length; }
    bestFor(owner) {
        const list = this.listByOwner(owner);
        if (list.length === 0) return null;
        return list.reduce((best, e) => !best || e.power > best.power ? e : best, null);
    }
    countByLevel() {
        const c = {};
        for (const l of ARCHIVE_LEVELS) c[l] = 0;
        for (const e of this.entries.values()) c[e.level] = (c[e.level] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalPower: this.stats.totalPower, averagePower: this.averagePower() }; }
    reset() { this.entries.clear(); this.byOwner.clear(); this.byCategory.clear(); this.stats = { total: 0, totalPower: 0 }; }
}
