/**
 * Disinformation.js - 假情报
 * V1087 P-20260614-414 Round 41 Iter 20/30
 */
export const DISINFO_STATUS = ['drafting', 'circulating', 'believed', 'exposed', 'archived'];
export const DISINFO_AUDIENCE = ['public', 'rival', 'ally', 'neutral', 'target'];

export class Disinformation {
    constructor(config = {}) {
        this.config = { ...config };
        this.campaigns = new Map();   // campId -> { id, content, audience, status, spread, createdAt, exposedAt }
        this.hooks = new Map();
        this.stats = { total: 0, totalBelieved: 0, totalExposed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `diz_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(content, audience = 'public') {
        if (!content) return null;
        if (!DISINFO_AUDIENCE.includes(audience)) audience = 'public';
        const id = this._newId();
        const c = { id, content, audience, status: 'drafting', spread: 0, createdAt: Date.now() };
        this.campaigns.set(id, c);
        this.stats.total++;
        return c;
    }
    get(id) { return this.campaigns.get(id) || null; }
    listAll() { return [...this.campaigns.values()]; }
    listByStatus(st) { return this.listAll().filter(c => c.status === st); }
    listByAudience(a) { return this.listAll().filter(c => c.audience === a); }

    setStatus(id, status) {
        const c = this.campaigns.get(id);
        if (!c) return false;
        if (!DISINFO_STATUS.includes(status)) return false;
        c.status = status;
        if (status === 'believed') this.stats.totalBelieved++;
        if (status === 'exposed') {
            this.stats.totalExposed++;
            c.exposedAt = Date.now();
        }
        return true;
    }
    circulate(id) { return this.setStatus(id, 'circulating'); }
    markBelieved(id) { return this.setStatus(id, 'believed'); }
    expose(id) { return this.setStatus(id, 'exposed'); }
    archive(id) { return this.setStatus(id, 'archived'); }
    spread(id, amount) {
        const c = this.campaigns.get(id);
        if (!c) return false;
        if (typeof amount !== 'number' || amount <= 0) return false;
        c.spread += amount;
        return true;
    }
    isBelieved(id) { return this.campaigns.get(id)?.status === 'believed'; }
    isExposed(id) { return this.campaigns.get(id)?.status === 'exposed'; }
    isCirculating(id) { return this.campaigns.get(id)?.status === 'circulating'; }
    spreadOf(id) { return this.campaigns.get(id)?.spread || 0; }
    believeRate() { return this.stats.total === 0 ? 0 : this.stats.totalBelieved / this.stats.total; }
    exposeRate() { return this.stats.total === 0 ? 0 : this.stats.totalExposed / this.stats.total; }
    mostSpread() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, c) => !best || c.spread > best.spread ? c : best, null);
    }
    report() { return { total: this.stats.total, believed: this.stats.totalBelieved, exposed: this.stats.totalExposed }; }
    reset() { this.campaigns.clear(); this.stats = { total: 0, totalBelieved: 0, totalExposed: 0 }; }
}
