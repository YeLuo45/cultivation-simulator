/**
 * OutpostRegistry.js - 情报站登记
 * V1088 P-20260614-415 Round 41 Iter 21/30
 */
export const OUTPOST_TYPES = ['listening', 'forward', 'safe_house', 'command', 'communication'];
export const OUTPOST_STATUS = ['active', 'compromised', 'dormant', 'abandoned'];

export class OutpostRegistry {
    constructor(config = {}) {
        this.config = { ...config };
        this.outposts = new Map();   // outpostId -> { id, name, type, location, status, capacity, currentAgents }
        this.hooks = new Map();
        this.stats = { total: 0, totalActive: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `out_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    register(name, type, location, capacity = 5) {
        if (!name) return null;
        if (!OUTPOST_TYPES.includes(type)) type = 'listening';
        const id = this._newId();
        const o = { id, name, type, location, status: 'active', capacity, currentAgents: [] };
        this.outposts.set(id, o);
        this.stats.total++;
        this.stats.totalActive++;
        return o;
    }
    get(id) { return this.outposts.get(id) || null; }
    listAll() { return [...this.outposts.values()]; }
    listByType(type) { return this.listAll().filter(o => o.type === type); }
    listByStatus(st) { return this.listAll().filter(o => o.status === st); }
    listByLocation(loc) { return this.listAll().filter(o => o.location === loc); }
    listActive() { return this.listByStatus('active'); }

    setStatus(id, status) {
        const o = this.outposts.get(id);
        if (!o) return false;
        if (!OUTPOST_STATUS.includes(status)) return false;
        o.status = status;
        return true;
    }
    assignAgent(id, agentId) {
        const o = this.outposts.get(id);
        if (!o) return false;
        if (o.currentAgents.length >= o.capacity) return false;
        o.currentAgents.push(agentId);
        return true;
    }
    removeAgent(id, agentId) {
        const o = this.outposts.get(id);
        if (!o) return false;
        o.currentAgents = o.currentAgents.filter(a => a !== agentId);
        return true;
    }
    compromise(id) {
        const o = this.outposts.get(id);
        if (!o) return false;
        o.status = 'compromised';
        this._emit('compromised', o);
        return true;
    }
    abandon(id) {
        const o = this.outposts.get(id);
        if (!o) return false;
        o.status = 'abandoned';
        return true;
    }
    isActive(id) { return this.outposts.get(id)?.status === 'active'; }
    isCompromised(id) { return this.outposts.get(id)?.status === 'compromised'; }
    isFull(id) { const o = this.outposts.get(id); return o ? o.currentAgents.length >= o.capacity : false; }
    agentCount(id) { return this.outposts.get(id)?.currentAgents.length || 0; }
    capacityOf(id) { return this.outposts.get(id)?.capacity || 0; }
    listAgents(id) { return [...(this.outposts.get(id)?.currentAgents || [])]; }
    hasAgent(id, agentId) { return (this.outposts.get(id)?.currentAgents || []).includes(agentId); }
    averageFill() {
        if (this.outposts.size === 0) return 0;
        return this.listAll().reduce((s, o) => s + o.currentAgents.length / o.capacity, 0) / this.outposts.size;
    }
    report() { return { total: this.stats.total, totalActive: this.listActive().length }; }
    reset() { this.outposts.clear(); this.stats = { total: 0, totalActive: 0 }; }
}
