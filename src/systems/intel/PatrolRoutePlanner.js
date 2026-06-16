/**
 * PatrolRoutePlanner.js - 巡防路线规划
 * V1071 P-20260614-360 Round 41 Iter 4/30
 */
export const ROUTE_PRIORITY = ['low', 'normal', 'high', 'critical'];
export const ROUTE_STATUS = ['planned', 'active', 'paused', 'completed', 'failed'];

export class PatrolRoutePlanner {
    constructor(config = {}) {
        this.config = { ...config };
        this.routes = new Map();   // routeId -> { id, name, waypoints, priority, status, distance, estimatedTime }
        this.hooks = new Map();
        this.stats = { total: 0, totalDistance: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ptr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(name, waypoints = [], priority = 'normal') {
        if (!name) return null;
        if (!Array.isArray(waypoints)) waypoints = [];
        if (!ROUTE_PRIORITY.includes(priority)) priority = 'normal';
        const id = this._newId();
        const distance = waypoints.length * 10;  // simple heuristic
        const r = { id, name, waypoints: [...waypoints], priority, status: 'planned', distance, estimatedTime: distance * 5 };
        this.routes.set(id, r);
        this.stats.total++;
        this.stats.totalDistance += distance;
        return r;
    }
    get(id) { return this.routes.get(id) || null; }
    listAll() { return [...this.routes.values()]; }
    listByStatus(st) { return this.listAll().filter(r => r.status === st); }
    listByPriority(p) { return this.listAll().filter(r => r.priority === p); }
    listActive() { return this.listByStatus('active'); }

    setStatus(id, status) {
        const r = this.routes.get(id);
        if (!r) return false;
        if (!ROUTE_STATUS.includes(status)) return false;
        if (r.status === status) return false;
        r.status = status;
        return true;
    }
    activate(id) { return this.setStatus(id, 'active'); }
    pause(id) { return this.setStatus(id, 'paused'); }
    complete(id) { return this.setStatus(id, 'completed'); }
    fail(id) { return this.setStatus(id, 'failed'); }
    setPriority(id, priority) {
        const r = this.routes.get(id);
        if (!r) return false;
        if (!ROUTE_PRIORITY.includes(priority)) return false;
        r.priority = priority;
        return true;
    }
    addWaypoint(id, waypoint) {
        const r = this.routes.get(id);
        if (!r) return false;
        r.waypoints.push(waypoint);
        r.distance = r.waypoints.length * 10;
        r.estimatedTime = r.distance * 5;
        return true;
    }
    removeWaypoint(id, index) {
        const r = this.routes.get(id);
        if (!r) return false;
        if (index < 0 || index >= r.waypoints.length) return false;
        r.waypoints.splice(index, 1);
        r.distance = r.waypoints.length * 10;
        r.estimatedTime = r.distance * 5;
        return true;
    }
    waypointCount(id) { return this.routes.get(id)?.waypoints.length || 0; }
    distanceOf(id) { return this.routes.get(id)?.distance || 0; }
    isActive(id) { return this.routes.get(id)?.status === 'active'; }
    report() { return { total: this.stats.total, totalDistance: this.stats.totalDistance }; }
    reset() { this.routes.clear(); this.stats = { total: 0, totalDistance: 0 }; }
}
