/**
 * InkRefinery.js - 灵墨精炼
 * V1129 Round 43 Iter 2/30
 */
export const INK_TYPES = ['cinnabar', 'gold', 'jade', 'blood', 'shadow', 'spirit'];
export const INK_GRADES = ['diluted', 'normal', 'concentrated', 'pure', 'transcendent'];

export class InkRefinery {
    constructor(config = {}) {
        this.config = { ...config };
        this.inks = new Map();   // iid -> { id, type, grade, potency, mana, owner, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalPotency: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ir_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    refine(type, grade = 'normal', potency = 1, mana = 0, owner = null) {
        if (!INK_TYPES.includes(type)) type = 'cinnabar';
        if (!INK_GRADES.includes(grade)) grade = 'normal';
        const id = this._newId();
        const i = { id, type, grade, potency, mana, owner, ts: Date.now() };
        this.inks.set(id, i);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        this.stats.total++;
        this.stats.totalPotency += potency;
        this._emit('refined', i);
        return i;
    }
    get(id) { return this.inks.get(id) || null; }
    listAll() { return [...this.inks.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.inks.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(i => i.type === type); }
    listByGrade(g) { return this.listAll().filter(i => i.grade === g); }
    listTranscendent() { return this.listByGrade('transcendent'); }

    setPotency(id, potency) {
        const i = this.inks.get(id);
        if (!i) return false;
        i.potency = Math.max(0, potency);
        this.stats.totalPotency = this.listAll().reduce((s, x) => s + x.potency, 0);
        return true;
    }
    setMana(id, mana) {
        const i = this.inks.get(id);
        if (!i) return false;
        i.mana = Math.max(0, mana);
        return true;
    }
    setGrade(id, grade) {
        const i = this.inks.get(id);
        if (!i) return false;
        if (!INK_GRADES.includes(grade)) return false;
        i.grade = grade;
        return true;
    }
    isTranscendent(id) { return this.inks.get(id)?.grade === 'transcendent'; }
    isPure(id) { return this.inks.get(id)?.grade === 'pure' || this.inks.get(id)?.grade === 'transcendent'; }
    potencyOf(id) { return this.inks.get(id)?.potency || 0; }
    manaOf(id) { return this.inks.get(id)?.mana || 0; }
    typeOf(id) { return this.inks.get(id)?.type || null; }
    gradeOf(id) { return this.inks.get(id)?.grade || null; }
    averagePotency() { return this.stats.total === 0 ? 0 : this.stats.totalPotency / this.stats.total; }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    bestPotency() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, i) => !best || i.potency > best.potency ? i : best, null);
    }
    countByType() {
        const c = {};
        for (const t of INK_TYPES) c[t] = 0;
        for (const i of this.inks.values()) c[i.type] = (c[i.type] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, averagePotency: this.averagePotency() }; }
    reset() { this.inks.clear(); this.byOwner.clear(); this.stats = { total: 0, totalPotency: 0 }; }
}
