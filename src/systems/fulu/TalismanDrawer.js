/**
 * TalismanDrawer.js - 符箓绘制
 * V1134 Round 43 Iter 7/30
 */
export const DRAW_STATUS = ['idle', 'starting', 'drawing', 'sealing', 'completed', 'failed'];
export const DRAW_TOOLS = ['pen', 'brush', 'finger', 'spirit', 'auto'];

export class TalismanDrawer {
    constructor(config = {}) {
        this.config = { ...config };
        this.draws = new Map();   // did -> { id, talisman, tool, status, strokes, startedAt, endedAt }
        this.hooks = new Map();
        this.stats = { total: 0, totalCompleted: 0, totalFailed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `td_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    start(talisman, tool = 'pen') {
        if (!talisman) return null;
        if (!DRAW_TOOLS.includes(tool)) tool = 'pen';
        const id = this._newId();
        const d = { id, talisman, tool, status: 'starting', strokes: 0, startedAt: Date.now(), endedAt: null };
        this.draws.set(id, d);
        this.stats.total++;
        return d;
    }
    get(id) { return this.draws.get(id) || null; }
    listAll() { return [...this.draws.values()]; }
    listByTalisman(tal) { return this.listAll().filter(d => d.talisman === tal); }
    listByStatus(st) { return this.listAll().filter(d => d.status === st); }
    listByTool(tool) { return this.listAll().filter(d => d.tool === tool); }
    listActive() { return this.listAll().filter(d => d.status === 'starting' || d.status === 'drawing' || d.status === 'sealing'); }
    listCompleted() { return this.listByStatus('completed'); }

    setStatus(id, status) {
        const d = this.draws.get(id);
        if (!d) return false;
        if (!DRAW_STATUS.includes(status)) return false;
        d.status = status;
        if (status === 'completed') {
            d.endedAt = Date.now();
            this.stats.totalCompleted++;
            this._emit('completed', d);
        } else if (status === 'failed') {
            d.endedAt = Date.now();
            this.stats.totalFailed++;
        }
        return true;
    }
    beginDrawing(id) { return this.setStatus(id, 'drawing'); }
    seal(id) { return this.setStatus(id, 'sealing'); }
    complete(id) { return this.setStatus(id, 'completed'); }
    fail(id) { return this.setStatus(id, 'failed'); }
    addStroke(id) {
        const d = this.draws.get(id);
        if (!d) return false;
        d.strokes++;
        return true;
    }
    setTool(id, tool) {
        const d = this.draws.get(id);
        if (!d) return false;
        if (!DRAW_TOOLS.includes(tool)) return false;
        d.tool = tool;
        return true;
    }
    isActive(id) {
        const s = this.draws.get(id)?.status;
        return s === 'starting' || s === 'drawing' || s === 'sealing';
    }
    isCompleted(id) { return this.draws.get(id)?.status === 'completed'; }
    isFailed(id) { return this.draws.get(id)?.status === 'failed'; }
    strokeCount(id) { return this.draws.get(id)?.strokes || 0; }
    toolOf(id) { return this.draws.get(id)?.tool || null; }
    duration(id) {
        const d = this.draws.get(id);
        if (!d || !d.endedAt) return 0;
        return d.endedAt - d.startedAt;
    }
    successRate() { return this.stats.total === 0 ? 0 : this.stats.totalCompleted / this.stats.total; }
    talismanCount(tal) { return this.listByTalisman(tal).length; }
    averageStrokes() {
        if (this.draws.size === 0) return 0;
        return this.listAll().reduce((s, d) => s + d.strokes, 0) / this.draws.size;
    }
    countByStatus() {
        const c = {};
        for (const st of DRAW_STATUS) c[st] = 0;
        for (const d of this.draws.values()) c[d.status] = (c[d.status] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalCompleted: this.stats.totalCompleted, successRate: this.successRate() }; }
    reset() { this.draws.clear(); this.stats = { total: 0, totalCompleted: 0, totalFailed: 0 }; }
}
