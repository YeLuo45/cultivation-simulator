/**
 * BorderWatcher.js - 边境哨兵
 * V1092 P-20260614-419 Round 41 Iter 25/30
 */
export const ALERT_LEVELS = ['green', 'yellow', 'orange', 'red'];
export const THREAT_DIRECTIONS = ['north', 'south', 'east', 'west', 'sky', 'underground'];

export class BorderWatcher {
    constructor(config = {}) {
        this.config = { ...config };
        this.posts = new Map();   // postId -> { id, name, direction, alertLevel, sightings, lastAlert }
        this.hooks = new Map();
        this.stats = { total: 0, totalSightings: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `brd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    addPost(name, direction) {
        if (!name) return null;
        if (!THREAT_DIRECTIONS.includes(direction)) direction = 'north';
        const id = this._newId();
        const p = { id, name, direction, alertLevel: 'green', sightings: [], lastAlert: null };
        this.posts.set(id, p);
        this.stats.total++;
        return p;
    }
    get(id) { return this.posts.get(id) || null; }
    listAll() { return [...this.posts.values()]; }
    listByDirection(d) { return this.listAll().filter(p => p.direction === d); }
    listByAlert(level) { return this.listAll().filter(p => p.alertLevel === level); }
    listRed() { return this.listByAlert('red'); }

    setAlert(id, level) {
        const p = this.posts.get(id);
        if (!p) return false;
        if (!ALERT_LEVELS.includes(level)) return false;
        p.alertLevel = level;
        if (level !== 'green') p.lastAlert = Date.now();
        return true;
    }
    escalate(id) {
        const p = this.posts.get(id);
        if (!p) return null;
        const idx = ALERT_LEVELS.indexOf(p.alertLevel);
        if (idx === -1 || idx === ALERT_LEVELS.length - 1) return null;
        p.alertLevel = ALERT_LEVELS[idx + 1];
        p.lastAlert = Date.now();
        this._emit('escalated', p);
        return p.alertLevel;
    }
    deEscalate(id) {
        const p = this.posts.get(id);
        if (!p) return null;
        const idx = ALERT_LEVELS.indexOf(p.alertLevel);
        if (idx <= 0) return null;
        p.alertLevel = ALERT_LEVELS[idx - 1];
        return p.alertLevel;
    }
    recordSighting(id, target, threat = 'low') {
        const p = this.posts.get(id);
        if (!p) return false;
        p.sightings.push({ target, threat, ts: Date.now() });
        this.stats.totalSightings++;
        this._emit('sighting', { postId: id, target });
        return true;
    }
    isOnAlert(id) { return this.posts.get(id)?.alertLevel !== 'green'; }
    isRed(id) { return this.posts.get(id)?.alertLevel === 'red'; }
    alertOf(id) { return this.posts.get(id)?.alertLevel || null; }
    sightingCount(id) { return this.posts.get(id)?.sightings.length || 0; }
    recentSightings(id, n = 5) {
        return [...(this.posts.get(id)?.sightings || [])].slice(-n).reverse();
    }
    mostActive() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, p) => !best || p.sightings.length > best.sightings.length ? p : best, null);
    }
    report() { return { total: this.stats.total, totalSightings: this.stats.totalSightings }; }
    reset() { this.posts.clear(); this.stats = { total: 0, totalSightings: 0 }; }
}
