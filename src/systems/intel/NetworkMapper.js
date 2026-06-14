/**
 * NetworkMapper.js - 网络映射器
 * V1075 P-20260614-402 Round 41 Iter 8/30
 */
export const NODE_TYPES = ['agent', 'informant', 'safe_house', 'contact', 'outpost'];
export const EDGE_TYPES = ['reports_to', 'communicates', 'supplies', 'trades'];

export class NetworkMapper {
    constructor(config = {}) {
        this.config = { ...config };
        this.nodes = new Map();   // nodeId -> { id, name, type, x, y, strength }
        this.edges = new Map();   // edgeId -> { id, from, to, type, weight }
        this.hooks = new Map();
        this.stats = { totalNodes: 0, totalEdges: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `net_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    addNode(name, type, x = 0, y = 0, strength = 0.5) {
        if (!name) return null;
        if (!NODE_TYPES.includes(type)) type = 'agent';
        const id = this._newId();
        const n = { id, name, type, x, y, strength: Math.max(0, Math.min(1, strength)) };
        this.nodes.set(id, n);
        this.stats.totalNodes++;
        return n;
    }
    getNode(id) { return this.nodes.get(id) || null; }
    listAllNodes() { return [...this.nodes.values()]; }
    listByType(type) { return this.listAllNodes().filter(n => n.type === type); }

    connect(fromId, toId, type = 'communicates', weight = 0.5) {
        if (!this.nodes.has(fromId) || !this.nodes.has(toId)) return null;
        if (!EDGE_TYPES.includes(type)) type = 'communicates';
        const id = this._newId();
        const e = { id, from: fromId, to: toId, type, weight: Math.max(0, Math.min(1, weight)) };
        this.edges.set(id, e);
        this.stats.totalEdges++;
        return e;
    }
    getEdge(id) { return this.edges.get(id) || null; }
    listAllEdges() { return [...this.edges.values()]; }
    listEdgesFrom(nodeId) { return this.listAllEdges().filter(e => e.from === nodeId); }
    listEdgesTo(nodeId) { return this.listAllEdges().filter(e => e.to === nodeId); }
    listByEdgeType(type) { return this.listAllEdges().filter(e => e.type === type); }

    removeNode(id) {
        if (!this.nodes.delete(id)) return false;
        // Remove connected edges
        for (const [eid, e] of this.edges) {
            if (e.from === id || e.to === id) this.edges.delete(eid);
        }
        return true;
    }
    removeEdge(id) { return this.edges.delete(id); }
    neighbors(nodeId) {
        const out = this.listEdgesFrom(nodeId).map(e => e.to);
        const inb = this.listEdgesTo(nodeId).map(e => e.from);
        return [...new Set([...out, ...inb])];
    }
    degree(nodeId) { return this.neighbors(nodeId).length; }
    setStrength(id, strength) {
        const n = this.nodes.get(id);
        if (!n) return false;
        n.strength = Math.max(0, Math.min(1, strength));
        return true;
    }
    setWeight(id, weight) {
        const e = this.edges.get(id);
        if (!e) return false;
        e.weight = Math.max(0, Math.min(1, weight));
        return true;
    }
    totalStrength() { return this.listAllNodes().reduce((s, n) => s + n.strength, 0); }
    averageDegree() {
        if (this.nodes.size === 0) return 0;
        return [...this.nodes.values()].reduce((s, n) => s + this.degree(n.id), 0) / this.nodes.size;
    }
    report() { return { totalNodes: this.stats.totalNodes, totalEdges: this.stats.totalEdges, averageDegree: this.averageDegree() }; }
    reset() { this.nodes.clear(); this.edges.clear(); this.stats = { totalNodes: 0, totalEdges: 0 }; }
}
