/**
 * BeastBond.js - 灵兽羁绊
 * V1110 P-20260614-803 Round 42 Iter 13/30
 */
export const BOND_LEVELS = ['stranger', 'acquaintance', 'companion', 'sworn', 'soulmate'];
export const BOND_STATUS = ['forming', 'active', 'breaking', 'broken'];

export class BeastBond {
    constructor(config = {}) {
        this.config = { ...config };
        this.bonds = new Map();   // bid -> { id, tamer, beast, level, status, strength, ts }
        this.hooks = new Map();
        this.stats = { total: 0, totalStrength: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `bb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    form(tamer, beast) {
        if (!tamer || !beast) return null;
        const id = this._newId();
        const b = { id, tamer, beast, level: 'stranger', status: 'forming', strength: 0.1, ts: Date.now() };
        this.bonds.set(id, b);
        this.stats.total++;
        this.stats.totalStrength += 0.1;
        this._emit('formed', b);
        return b;
    }
    get(id) { return this.bonds.get(id) || null; }
    listAll() { return [...this.bonds.values()]; }
    listByTamer(tamer) { return this.listAll().filter(b => b.tamer === tamer); }
    listByBeast(beast) { return this.listAll().filter(b => b.beast === beast); }
    listByLevel(level) { return this.listAll().filter(b => b.level === level); }
    listActive() { return this.listAll().filter(b => b.status === 'active'); }

    setLevel(id, level) {
        const b = this.bonds.get(id);
        if (!b) return false;
        if (!BOND_LEVELS.includes(level)) return false;
        b.level = level;
        // Update strength based on level
        const strengthMap = { stranger: 0.1, acquaintance: 0.3, companion: 0.5, sworn: 0.8, soulmate: 1.0 };
        b.strength = strengthMap[level];
        this.stats.totalStrength = this.listAll().reduce((s, x) => s + x.strength, 0);
        return true;
    }
    setStatus(id, status) {
        const b = this.bonds.get(id);
        if (!b) return false;
        if (!BOND_STATUS.includes(status)) return false;
        b.status = status;
        if (status === 'active') b.status = 'active';
        if (status === 'broken') this._emit('broken', b);
        return true;
    }
    activate(id) { return this.setStatus(id, 'active'); }
    break_(id) { return this.setStatus(id, 'broken'); }
    startBreaking(id) { return this.setStatus(id, 'breaking'); }
    isSoulmate(id) { return this.bonds.get(id)?.level === 'soulmate'; }
    isActive(id) { return this.bonds.get(id)?.status === 'active'; }
    isBroken(id) { return this.bonds.get(id)?.status === 'broken'; }
    strengthOf(id) { return this.bonds.get(id)?.strength || 0; }
    levelOf(id) { return this.bonds.get(id)?.level || null; }
    levelIndex(id) { return BOND_LEVELS.indexOf(this.bonds.get(id)?.level || ''); }
    promote(id) {
        const b = this.bonds.get(id);
        if (!b) return null;
        const idx = BOND_LEVELS.indexOf(b.level);
        if (idx === -1 || idx === BOND_LEVELS.length - 1) return null;
        this.setLevel(id, BOND_LEVELS[idx + 1]);
        return b.level;
    }
    tamerCount(tamer) { return this.listByTamer(tamer).length; }
    bestBond(tamer) {
        const list = this.listByTamer(tamer);
        if (list.length === 0) return null;
        return list.reduce((best, b) => !best || b.strength > best.strength ? b : best, null);
    }
    averageStrength() {
        if (this.bonds.size === 0) return 0;
        return this.listAll().reduce((s, b) => s + b.strength, 0) / this.bonds.size;
    }
    countByLevel() {
        const c = {};
        for (const l of BOND_LEVELS) c[l] = 0;
        for (const b of this.bonds.values()) c[b.level] = (c[b.level] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalStrength: this.stats.totalStrength }; }
    reset() { this.bonds.clear(); this.stats = { total: 0, totalStrength: 0 }; }
}
