/**
 * SecureChannel.js - 安全信道
 * V1080 P-20260614-407 Round 41 Iter 13/30
 */
export const CHANNEL_STATUS = ['active', 'compromised', 'dormant', 'archived'];
export const ENCRYPTION_LEVELS = ['none', 'basic', 'strong', 'military'];

export class SecureChannel {
    constructor(config = {}) {
        this.config = { ...config };
        this.channels = new Map();   // chanId -> { id, from, to, encryption, status, usedAt }
        this.byStatus = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalMessages: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `chn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    open(from, to, encryption = 'strong') {
        if (!from || !to) return null;
        if (!ENCRYPTION_LEVELS.includes(encryption)) encryption = 'strong';
        const id = this._newId();
        const c = { id, from, to, encryption, status: 'active', usedAt: null, messageCount: 0 };
        this.channels.set(id, c);
        if (!this.byStatus.has(c.status)) this.byStatus.set(c.status, new Set());
        this.byStatus.get(c.status).add(id);
        this.stats.total++;
        return c;
    }
    get(id) { return this.channels.get(id) || null; }
    listAll() { return [...this.channels.values()]; }
    listByStatus(st) {
        const ids = this.byStatus.get(st) || new Set();
        return [...ids].map(id => this.channels.get(id)).filter(Boolean);
    }
    listByEncryption(enc) { return this.listAll().filter(c => c.encryption === enc); }
    listActive() { return this.listByStatus('active'); }

    setStatus(id, status) {
        const c = this.channels.get(id);
        if (!c) return false;
        if (!CHANNEL_STATUS.includes(status)) return false;
        if (this.byStatus.has(c.status)) this.byStatus.get(c.status).delete(id);
        c.status = status;
        if (!this.byStatus.has(status)) this.byStatus.set(status, new Set());
        this.byStatus.get(status).add(id);
        return true;
    }
    setEncryption(id, level) {
        const c = this.channels.get(id);
        if (!c) return false;
        if (!ENCRYPTION_LEVELS.includes(level)) return false;
        c.encryption = level;
        return true;
    }
    use(id) {
        const c = this.channels.get(id);
        if (!c) return null;
        if (c.status !== 'active') return null;
        c.messageCount++;
        c.usedAt = Date.now();
        this.stats.totalMessages++;
        this._emit('used', c);
        return c;
    }
    compromise(id) {
        const c = this.channels.get(id);
        if (!c) return false;
        this.setStatus(id, 'compromised');
        this._emit('compromised', c);
        return true;
    }
    archive(id) { return this.setStatus(id, 'archived'); }
    isActive(id) { return this.channels.get(id)?.status === 'active'; }
    isCompromised(id) { return this.channels.get(id)?.status === 'compromised'; }
    messageCount(id) { return this.channels.get(id)?.messageCount || 0; }
    encryptionOf(id) { return this.channels.get(id)?.encryption || null; }
    mostUsed() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, c) => !best || c.messageCount > best.messageCount ? c : best, null);
    }
    report() { return { total: this.stats.total, totalMessages: this.stats.totalMessages }; }
    reset() { this.channels.clear(); this.byStatus.clear(); this.stats = { total: 0, totalMessages: 0 }; }
}
