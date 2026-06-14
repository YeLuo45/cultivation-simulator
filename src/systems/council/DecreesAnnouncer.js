/**
 * DecreesAnnouncer.js - 法令公布器
 * V991 P-20260614-151 Round 38 Iter 14/30
 */
export const DECREE_TYPES = ['royal', 'sect', 'tribunal', 'emergency', 'ceremonial'];
export const ANNOUNCEMENT_FORMATS = ['scroll', 'sermon', 'bulletin', 'pill'];

export class DecreesAnnouncer {
    constructor(config = {}) {
        this.config = { ...config };
        this.decrees = new Map();     // decreeId -> { id, title, type, content, format, issuedAt, recipients, status }
        this.byType = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, read: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `dec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    issue(title, type, content, format = 'scroll', recipients = []) {
        if (!title || !type) return null;
        if (!DECREE_TYPES.includes(type)) type = 'sect';
        if (!ANNOUNCEMENT_FORMATS.includes(format)) format = 'scroll';
        const id = this._newId();
        const d = { id, title, type, content, format, recipients: new Set(recipients), status: 'issued', issuedAt: Date.now(), readBy: new Set() };
        this.decrees.set(id, d);
        if (!this.byType.has(type)) this.byType.set(type, new Set());
        this.byType.get(type).add(id);
        this.stats.total++;
        this._emit('issued', d);
        return d;
    }
    get(id) { return this.decrees.get(id) || null; }
    listAll() { return [...this.decrees.values()]; }
    listByType(type) {
        const ids = this.byType.get(type) || new Set();
        return [...ids].map(id => this.decrees.get(id)).filter(Boolean);
    }
    listForRecipient(memberId) { return this.listAll().filter(d => d.recipients.has(memberId) || d.recipients.size === 0); }

    markRead(decreeId, memberId) {
        const d = this.decrees.get(decreeId);
        if (!d) return false;
        d.readBy.add(memberId);
        this.stats.read++;
        this._emit('read', { decreeId, memberId });
        return true;
    }
    isReadBy(decreeId, memberId) {
        const d = this.decrees.get(decreeId);
        return d ? d.readBy.has(memberId) : false;
    }
    readRatio(decreeId) {
        const d = this.decrees.get(decreeId);
        if (!d || d.recipients.size === 0) return 1;
        return d.readBy.size / d.recipients.size;
    }

    revoke(decreeId, reason = '') {
        const d = this.decrees.get(decreeId);
        if (!d) return false;
        d.status = 'revoked';
        d.revokeReason = reason;
        this._emit('revoked', d);
        return true;
    }
    archive(decreeId) {
        const d = this.decrees.get(decreeId);
        if (!d) return false;
        d.status = 'archived';
        return true;
    }

    searchByTitle(query) {
        const q = (query || '').toLowerCase();
        return this.listAll().filter(d => d.title.toLowerCase().includes(q));
    }
    recent(n = 5) {
        return [...this.listAll()].sort((a, b) => b.issuedAt - a.issuedAt).slice(0, n);
    }
    report() { return { total: this.stats.total, read: this.stats.read, byType: Object.fromEntries([...this.byType.entries()].map(([k, v]) => [k, v.size])) }; }
    reset() { this.decrees.clear(); this.byType.clear(); this.stats = { total: 0, read: 0 }; }
}
