/**
 * ArrayPlacer.js - 符阵布置
 * V1149 Round 43 Iter 22/30
 */
export const PLACE_STATUS = ['planning', 'placing', 'aligned', 'completed', 'disrupted'];
export const PLACE_POSITIONS = ['north', 'south', 'east', 'west', 'center', 'corner', 'edge'];

export class ArrayPlacer {
    constructor(config = {}) {
        this.config = { ...config };
        this.placements = new Map();   // pid -> { id, array, status, positions, owner, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalCompleted: 0, totalDisrupted: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    plan(array, positions = [], owner = null) {
        if (!array) return null;
        if (!Array.isArray(positions)) positions = [];
        const id = this._newId();
        const p = { id, array, status: 'planning', positions: [...positions], owner, ts: Date.now() };
        this.placements.set(id, p);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        this.stats.total++;
        return p;
    }
    get(id) { return this.placements.get(id) || null; }
    listAll() { return [...this.placements.values()]; }
    listByArray(a) { return this.listAll().filter(p => p.array === a); }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.placements.get(id)).filter(Boolean);
    }
    listByStatus(st) { return this.listAll().filter(p => p.status === st); }
    listActive() { return this.listAll().filter(p => p.status === 'placing' || p.status === 'aligned'); }

    setStatus(id, status) {
        const p = this.placements.get(id);
        if (!p) return false;
        if (!PLACE_STATUS.includes(status)) return false;
        p.status = status;
        if (status === 'completed') this.stats.totalCompleted++;
        else if (status === 'disrupted') this.stats.totalDisrupted++;
        if (status === 'completed' || status === 'disrupted') this._emit('concluded', p);
        return true;
    }
    startPlacing(id) { return this.setStatus(id, 'placing'); }
    align(id) { return this.setStatus(id, 'aligned'); }
    complete(id) { return this.setStatus(id, 'completed'); }
    disrupt(id) { return this.setStatus(id, 'disrupted'); }
    addPosition(id, position) {
        const p = this.placements.get(id);
        if (!p) return false;
        if (!PLACE_POSITIONS.includes(position)) return false;
        p.positions.push(position);
        return true;
    }
    isActive(id) {
        const s = this.placements.get(id)?.status;
        return s === 'placing' || s === 'aligned';
    }
    isCompleted(id) { return this.placements.get(id)?.status === 'completed'; }
    isDisrupted(id) { return this.placements.get(id)?.status === 'disrupted'; }
    positionCount(id) { return this.placements.get(id)?.positions.length || 0; }
    positionsOf(id) { return [...(this.placements.get(id)?.positions || [])]; }
    arrayCount(arr) { return this.listByArray(arr).length; }
    completionRate() { return this.stats.total === 0 ? 0 : this.stats.totalCompleted / this.stats.total; }
    averagePositions() {
        if (this.placements.size === 0) return 0;
        return this.listAll().reduce((s, p) => s + p.positions.length, 0) / this.placements.size;
    }
    countByStatus() {
        const c = {};
        for (const st of PLACE_STATUS) c[st] = 0;
        for (const p of this.placements.values()) c[p.status] = (c[p.status] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalCompleted: this.stats.totalCompleted, totalDisrupted: this.stats.totalDisrupted, completionRate: this.completionRate() }; }
    reset() { this.placements.clear(); this.byOwner.clear(); this.stats = { total: 0, totalCompleted: 0, totalDisrupted: 0 }; }
}
