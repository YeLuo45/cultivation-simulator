/**
 * SpyGrid.js - 间谍网格
 * V1070 P-20260614-264 Round 41 Iter 3/30
 */
export const GRID_STATUS = ['empty', 'occupied', 'monitored', 'compromised'];
export const GRID_RESOLUTION = ['low', 'medium', 'high', 'critical'];

export class SpyGrid {
    constructor(config = {}) {
        this.config = { ...config };
        this.cells = new Map();   // cellId -> { id, x, y, status, agent, coverage }
        this.hooks = new Map();
        this.stats = { total: 0, occupied: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `grd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    createCell(x, y, resolution = 'medium') {
        if (typeof x !== 'number' || typeof y !== 'number') return null;
        if (!GRID_RESOLUTION.includes(resolution)) resolution = 'medium';
        const id = this._newId();
        const c = { id, x, y, resolution, status: 'empty', agent: null, coverage: 0 };
        this.cells.set(id, c);
        this.stats.total++;
        return c;
    }
    get(id) { return this.cells.get(id) || null; }
    listAll() { return [...this.cells.values()]; }
    listByStatus(st) { return this.listAll().filter(c => c.status === st); }
    listByResolution(res) { return this.listAll().filter(c => c.resolution === res); }
    listAt(x, y) { return this.listAll().filter(c => c.x === x && c.y === y); }
    listOccupied() { return this.listByStatus('occupied'); }

    assign(id, agentId) {
        const c = this.cells.get(id);
        if (!c) return false;
        if (c.status !== 'empty') return false;
        c.agent = agentId;
        c.status = 'occupied';
        c.coverage = 1.0;
        this.stats.occupied++;
        this._emit('assigned', { cellId: id, agentId });
        return true;
    }
    unassign(id) {
        const c = this.cells.get(id);
        if (!c) return false;
        const prev = c.agent;
        c.agent = null;
        c.status = 'empty';
        c.coverage = 0;
        if (this.stats.occupied > 0) this.stats.occupied--;
        this._emit('unassigned', { cellId: id, prev });
        return true;
    }
    monitor(id) {
        const c = this.cells.get(id);
        if (!c) return false;
        c.status = 'monitored';
        c.coverage = 0.5;
        return true;
    }
    compromise(id) {
        const c = this.cells.get(id);
        if (!c) return false;
        c.status = 'compromised';
        c.coverage = 0;
        this._emit('compromised', c);
        return true;
    }
    setCoverage(id, value) {
        const c = this.cells.get(id);
        if (!c) return false;
        c.coverage = Math.max(0, Math.min(1, value));
        return true;
    }
    isOccupied(id) { return this.cells.get(id)?.status === 'occupied'; }
    isCompromised(id) { return this.cells.get(id)?.status === 'compromised'; }
    coverageOf(id) { return this.cells.get(id)?.coverage || 0; }
    agentOf(id) { return this.cells.get(id)?.agent || null; }
    averageCoverage() {
        if (this.cells.size === 0) return 0;
        return this.listAll().reduce((s, c) => s + c.coverage, 0) / this.cells.size;
    }
    report() { return { total: this.stats.total, occupied: this.stats.occupied, averageCoverage: this.averageCoverage() }; }
    reset() { this.cells.clear(); this.stats = { total: 0, occupied: 0 }; }
}
