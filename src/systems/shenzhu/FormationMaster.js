/**
 * FormationMaster.js - 阵法大师
 * V1120 P-20260614-813 Round 42 Iter 23/30
 */
export const MASTER_LEVELS = ['apprentice', 'adept', 'expert', 'master', 'grandmaster'];
export const MASTER_STATUS = ['training', 'deploying', 'resting', 'retired'];

export class FormationMaster {
    constructor(config = {}) {
        this.config = { ...config };
        this.masters = new Map();   // mid -> { id, name, level, status, formationsDeployed, owner, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalDeployed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `fm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    train(name, level = 'apprentice', owner = null) {
        if (!name) return null;
        if (!MASTER_LEVELS.includes(level)) level = 'apprentice';
        const id = this._newId();
        const m = { id, name, level, status: 'training', formationsDeployed: 0, owner, ts: Date.now() };
        this.masters.set(id, m);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        this.stats.total++;
        return m;
    }
    get(id) { return this.masters.get(id) || null; }
    listAll() { return [...this.masters.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.masters.get(id)).filter(Boolean);
    }
    listByLevel(level) { return this.listAll().filter(m => m.level === level); }
    listByStatus(st) { return this.listAll().filter(m => m.status === st); }
    listGrandmasters() { return this.listByLevel('grandmaster'); }

    setLevel(id, level) {
        const m = this.masters.get(id);
        if (!m) return false;
        if (!MASTER_LEVELS.includes(level)) return false;
        m.level = level;
        return true;
    }
    setStatus(id, status) {
        const m = this.masters.get(id);
        if (!m) return false;
        if (!MASTER_STATUS.includes(status)) return false;
        m.status = status;
        return true;
    }
    deploy(id) {
        const m = this.masters.get(id);
        if (!m) return false;
        if (m.status === 'retired') return false;
        m.status = 'deploying';
        m.formationsDeployed++;
        this.stats.totalDeployed++;
        this._emit('deployed', m);
        return true;
    }
    rest(id) { return this.setStatus(id, 'resting'); }
    retire(id) { return this.setStatus(id, 'retired'); }
    promote(id) {
        const m = this.masters.get(id);
        if (!m) return null;
        const idx = MASTER_LEVELS.indexOf(m.level);
        if (idx === -1 || idx === MASTER_LEVELS.length - 1) return null;
        m.level = MASTER_LEVELS[idx + 1];
        return m.level;
    }
    isGrandmaster(id) { return this.masters.get(id)?.level === 'grandmaster'; }
    isRetired(id) { return this.masters.get(id)?.status === 'retired'; }
    isActive(id) { return this.masters.get(id)?.status === 'deploying'; }
    deployedCount(id) { return this.masters.get(id)?.formationsDeployed || 0; }
    levelOf(id) { return this.masters.get(id)?.level || null; }
    ownerOf(id) { return this.masters.get(id)?.owner || null; }
    levelIndex(id) { return MASTER_LEVELS.indexOf(this.masters.get(id)?.level || ''); }
    best() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, m) => !best || m.formationsDeployed > best.formationsDeployed ? m : best, null);
    }
    averageDeployed() {
        if (this.masters.size === 0) return 0;
        return this.listAll().reduce((s, m) => s + m.formationsDeployed, 0) / this.masters.size;
    }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    countByLevel() {
        const c = {};
        for (const l of MASTER_LEVELS) c[l] = 0;
        for (const m of this.masters.values()) c[m.level] = (c[m.level] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalDeployed: this.stats.totalDeployed }; }
    reset() { this.masters.clear(); this.byOwner.clear(); this.stats = { total: 0, totalDeployed: 0 }; }
}
