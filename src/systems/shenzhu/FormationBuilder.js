/**
 * FormationBuilder.js - 阵法构建
 * V1119 P-20260614-812 Round 42 Iter 22/30
 */
export const BUILD_STATUS = ['planning', 'placing', 'anchoring', 'activating', 'complete', 'failed'];
export const NODE_TYPES = ['eye', 'anchor', 'pillar', 'core', 'edge'];

export class FormationBuilder {
    constructor(config = {}) {
        this.config = { ...config };
        this.builds = new Map();   // bid -> { id, formation, status, nodes, startedAt, endedAt }
        this.hooks = new Map();
        this.stats = { total: 0, totalComplete: 0, totalFailed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `fb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    start(formation) {
        if (!formation) return null;
        const id = this._newId();
        const b = { id, formation, status: 'planning', nodes: [], startedAt: Date.now(), endedAt: null };
        this.builds.set(id, b);
        this.stats.total++;
        return b;
    }
    get(id) { return this.builds.get(id) || null; }
    listAll() { return [...this.builds.values()]; }
    listByFormation(formation) { return this.listAll().filter(b => b.formation === formation); }
    listByStatus(st) { return this.listAll().filter(b => b.status === st); }
    listActive() { return this.listAll().filter(b => b.status === 'placing' || b.status === 'anchoring' || b.status === 'activating'); }
    listComplete() { return this.listByStatus('complete'); }

    setStatus(id, status) {
        const b = this.builds.get(id);
        if (!b) return false;
        if (!BUILD_STATUS.includes(status)) return false;
        b.status = status;
        if (status === 'complete') {
            b.endedAt = Date.now();
            this.stats.totalComplete++;
            this._emit('complete', b);
        } else if (status === 'failed') {
            b.endedAt = Date.now();
            this.stats.totalFailed++;
        }
        return true;
    }
    addNode(id, type, x, y) {
        const b = this.builds.get(id);
        if (!b) return false;
        if (!NODE_TYPES.includes(type)) return false;
        b.nodes.push({ type, x, y, ts: Date.now() });
        return true;
    }
    removeNode(id, index) {
        const b = this.builds.get(id);
        if (!b) return false;
        if (index < 0 || index >= b.nodes.length) return false;
        b.nodes.splice(index, 1);
        return true;
    }
    place(id) { return this.setStatus(id, 'placing'); }
    anchor(id) { return this.setStatus(id, 'anchoring'); }
    activate(id) { return this.setStatus(id, 'activating'); }
    complete(id) { return this.setStatus(id, 'complete'); }
    fail(id) { return this.setStatus(id, 'failed'); }
    isComplete(id) { return this.builds.get(id)?.status === 'complete'; }
    isFailed(id) { return this.builds.get(id)?.status === 'failed'; }
    isActive(id) {
        const s = this.builds.get(id)?.status;
        return s === 'placing' || s === 'anchoring' || s === 'activating';
    }
    nodeCount(id) { return this.builds.get(id)?.nodes.length || 0; }
    nodesOf(id) { return [...(this.builds.get(id)?.nodes || [])]; }
    hasNode(id, type) { return (this.builds.get(id)?.nodes || []).some(n => n.type === type); }
    duration(id) {
        const b = this.builds.get(id);
        if (!b || !b.endedAt) return 0;
        return b.endedAt - b.startedAt;
    }
    successRate() { return this.stats.total === 0 ? 0 : this.stats.totalComplete / this.stats.total; }
    averageNodes() {
        if (this.builds.size === 0) return 0;
        return this.listAll().reduce((s, b) => s + b.nodes.length, 0) / this.builds.size;
    }
    countByStatus() {
        const c = {};
        for (const st of BUILD_STATUS) c[st] = 0;
        for (const b of this.builds.values()) c[b.status] = (c[b.status] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalComplete: this.stats.totalComplete, totalFailed: this.stats.totalFailed, successRate: this.successRate() }; }
    reset() { this.builds.clear(); this.stats = { total: 0, totalComplete: 0, totalFailed: 0 }; }
}
