/**
 * CourierScheduler.js - 信使调度
 * V1082 P-20260614-409 Round 41 Iter 15/30
 */
export const COURIER_STATUS = ['available', 'en_route', 'delayed', 'captured', 'resting'];
export const COURIER_TYPES = ['foot', 'beast', 'bird', 'formation', 'teleport'];

export class CourierScheduler {
    constructor(config = {}) {
        this.config = { ...config };
        this.couriers = new Map();   // courierId -> { id, name, type, status, speed, reliability, currentTask }
        this.hooks = new Map();
        this.stats = { total: 0, totalDelivered: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `cur_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    hire(name, type = 'foot', speed = 1, reliability = 0.8) {
        if (!name) return null;
        if (!COURIER_TYPES.includes(type)) type = 'foot';
        const id = this._newId();
        const c = { id, name, type, status: 'available', speed, reliability: Math.max(0, Math.min(1, reliability)), currentTask: null };
        this.couriers.set(id, c);
        this.stats.total++;
        return c;
    }
    setReliability(id, reliability) {
        const c = this.couriers.get(id);
        if (!c) return false;
        c.reliability = Math.max(0, Math.min(1, reliability));
        return true;
    }
    get(id) { return this.couriers.get(id) || null; }
    listAll() { return [...this.couriers.values()]; }
    listByStatus(st) { return this.listAll().filter(c => c.status === st); }
    listByType(type) { return this.listAll().filter(c => c.type === type); }
    listAvailable() { return this.listByStatus('available'); }

    assign(courierId, taskId) {
        const c = this.couriers.get(courierId);
        if (!c) return false;
        if (c.status !== 'available') return false;
        c.status = 'en_route';
        c.currentTask = taskId;
        return true;
    }
    setStatus(id, status) {
        const c = this.couriers.get(id);
        if (!c) return false;
        if (!COURIER_STATUS.includes(status)) return false;
        c.status = status;
        if (status !== 'en_route') c.currentTask = null;
        return true;
    }
    deliver(id) {
        const c = this.couriers.get(id);
        if (!c) return false;
        c.status = 'available';
        c.currentTask = null;
        this.stats.totalDelivered++;
        this._emit('delivered', c);
        return true;
    }
    delay(id) { return this.setStatus(id, 'delayed'); }
    capture(id) { return this.setStatus(id, 'captured'); }
    rest(id) { return this.setStatus(id, 'resting'); }
    isAvailable(id) { return this.couriers.get(id)?.status === 'available'; }
    isCaptured(id) { return this.couriers.get(id)?.status === 'captured'; }
    currentTask(id) { return this.couriers.get(id)?.currentTask || null; }
    speedOf(id) { return this.couriers.get(id)?.speed || 0; }
    reliabilityOf(id) { return this.couriers.get(id)?.reliability || 0; }
    bestAvailable() {
        const list = this.listAvailable();
        if (list.length === 0) return null;
        return list.reduce((best, c) => !best || c.speed > best.speed ? c : best, null);
    }
    averageReliability() {
        if (this.couriers.size === 0) return 0;
        return this.listAll().reduce((s, c) => s + c.reliability, 0) / this.couriers.size;
    }
    report() { return { total: this.stats.total, delivered: this.stats.totalDelivered }; }
    reset() { this.couriers.clear(); this.stats = { total: 0, totalDelivered: 0 }; }
}
