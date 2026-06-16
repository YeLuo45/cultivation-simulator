/**
 * RootProfiler.js - 灵根分析器
 * V1098 P-20260614-600 Round 42 Iter 1/30 Direction F 仙道灵枢阁 (ruflo)
 */
export const ROOT_TYPES = ['metal', 'wood', 'water', 'fire', 'earth', 'wind', 'thunder', 'ice', 'light', 'dark'];
export const ROOT_GRADES = ['common', 'spirit', 'immortal', 'chaos'];

export class RootProfiler {
    constructor(config = {}) {
        this.config = { ...config };
        this.roots = new Map();   // rootId -> { id, owner, primary, secondary, grade, purity, ts }
        this.hooks = new Map();
        this.stats = { total: 0, totalPurity: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `rt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    profile(owner, primary, secondary = null, grade = 'common') {
        if (!owner) return null;
        if (!ROOT_TYPES.includes(primary)) primary = 'wood';
        if (secondary && !ROOT_TYPES.includes(secondary)) secondary = null;
        if (!ROOT_GRADES.includes(grade)) grade = 'common';
        const id = this._newId();
        const purity = Math.random() * 0.4 + 0.6;  // 0.6-1.0
        const r = { id, owner, primary, secondary, grade, purity, ts: Date.now() };
        this.roots.set(id, r);
        this.stats.total++;
        this.stats.totalPurity += purity;
        this._emit('profiled', r);
        return r;
    }
    get(id) { return this.roots.get(id) || null; }
    listAll() { return [...this.roots.values()]; }
    listByOwner(owner) { return this.listAll().filter(r => r.owner === owner); }
    listByPrimary(type) { return this.listAll().filter(r => r.primary === type); }
    listByGrade(grade) { return this.listAll().filter(r => r.grade === grade); }

    setGrade(id, grade) {
        const r = this.roots.get(id);
        if (!r) return false;
        if (!ROOT_GRADES.includes(grade)) return false;
        r.grade = grade;
        return true;
    }
    setPurity(id, purity) {
        const r = this.roots.get(id);
        if (!r) return false;
        r.purity = Math.max(0, Math.min(1, purity));
        this.stats.totalPurity = this.listAll().reduce((s, x) => s + x.purity, 0);
        return true;
    }
    isImmortal(id) { return this.roots.get(id)?.grade === 'immortal' || this.roots.get(id)?.grade === 'chaos'; }
    isTwin(id) { return !!this.roots.get(id)?.secondary; }
    isPure(id) { return (this.roots.get(id)?.purity || 0) >= 0.9; }
    purityOf(id) { return this.roots.get(id)?.purity || 0; }
    gradeOf(id) { return this.roots.get(id)?.grade || null; }
    primaryOf(id) { return this.roots.get(id)?.primary || null; }
    secondaryOf(id) { return this.roots.get(id)?.secondary || null; }
    averagePurity() { return this.stats.total === 0 ? 0 : this.stats.totalPurity / this.stats.total; }
    bestPurity() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, r) => !best || r.purity > best.purity ? r : best, null);
    }
    countByGrade() {
        const c = {};
        for (const g of ROOT_GRADES) c[g] = 0;
        for (const r of this.roots.values()) c[r.grade] = (c[r.grade] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, averagePurity: this.averagePurity() }; }
    reset() { this.roots.clear(); this.stats = { total: 0, totalPurity: 0 }; }
}
