/**
 * DiplomacyMesh.js - 外交网络
 * V998 P-20260614-158 Round 38 Iter 21/30
 */
export const RELATION_STATUS = ['hostile', 'neutral', 'friendly', 'allied', 'subordinate'];
export const DEFAULT_INITIAL = 'neutral';

export class DiplomacyMesh {
    constructor(config = {}) {
        this.config = { ...config };
        this.sects = new Map();        // sectId -> { id, name }
        this.relations = new Map();    // "a:b" -> { status, since, history }
        this.hooks = new Map();
        this.stats = { relations: 0, upgrades: 0, downgrades: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    addSect(sectId, name) {
        if (!sectId) return false;
        this.sects.set(sectId, { id: sectId, name });
        return true;
    }
    getSect(sectId) { return this.sects.get(sectId) || null; }
    listSects() { return [...this.sects.values()]; }

    _key(a, b) { return [a, b].sort().join(':'); }
    setRelation(a, b, status) {
        if (!this.sects.has(a) || !this.sects.has(b)) return false;
        if (!RELATION_STATUS.includes(status)) return false;
        const key = this._key(a, b);
        const prev = this.relations.get(key);
        const r = { status, since: Date.now(), history: prev?.history || [] };
        r.history.push({ from: prev?.status || 'neutral', to: status, ts: Date.now() });
        if (r.history.length > 20) r.history.shift();
        this.relations.set(key, r);
        this.stats.relations++;
        const lvl = { hostile: 0, neutral: 1, friendly: 2, allied: 3, subordinate: -1 };
        if (prev && lvl[status] > lvl[prev.status]) this.stats.upgrades++;
        else if (prev && lvl[status] < lvl[prev.status]) this.stats.downgrades++;
        this._emit('relationSet', { a, b, status });
        return true;
    }
    getRelation(a, b) {
        if (!this.sects.has(a) || !this.sects.has(b)) return null;
        return this.relations.get(this._key(a, b)) || { status: DEFAULT_INITIAL, since: null, history: [] };
    }
    statusOf(a, b) { return this.getRelation(a, b)?.status || DEFAULT_INITIAL; }
    isAllied(a, b) { return this.statusOf(a, b) === 'allied'; }
    isHostile(a, b) { return this.statusOf(a, b) === 'hostile'; }
    isFriendly(a, b) { return ['friendly', 'allied'].includes(this.statusOf(a, b)); }

    alliesOf(sectId) {
        return [...this.relations.entries()]
            .filter(([k, r]) => r.status === 'allied' && k.includes(sectId))
            .map(([k]) => k.split(':').find(x => x !== sectId));
    }
    enemiesOf(sectId) {
        return [...this.relations.entries()]
            .filter(([k, r]) => r.status === 'hostile' && k.includes(sectId))
            .map(([k]) => k.split(':').find(x => x !== sectId));
    }

    distance(a, b) {
        // BFS for indirect relation
        if (a === b) return 0;
        const visited = new Set([a]);
        const queue = [[a, 0]];
        while (queue.length > 0) {
            const [cur, d] = queue.shift();
            for (const r of this.relations.entries()) {
                const [k, rel] = r;
                if (!rel.status || !['friendly', 'allied'].includes(rel.status)) continue;
                if (!k.includes(cur)) continue;
                const other = k.split(':').find(x => x !== cur);
                if (visited.has(other)) continue;
                if (other === b) return d + 1;
                visited.add(other);
                queue.push([other, d + 1]);
            }
        }
        return -1;
    }

    historyOf(a, b) { return [...(this.getRelation(a, b)?.history || [])]; }
    listAll() { return [...this.relations.entries()].map(([k, r]) => ({ key: k, ...r })); }
    report() { return { totalSects: this.sects.size, relations: this.stats.relations, upgrades: this.stats.upgrades, downgrades: this.stats.downgrades }; }
    reset() { this.sects.clear(); this.relations.clear(); this.stats = { relations: 0, upgrades: 0, downgrades: 0 }; }
}
