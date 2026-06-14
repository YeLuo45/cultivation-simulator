/**
 * MessageRelay.js - 消息中继
 * V1079 P-20260614-406 Round 41 Iter 12/30
 */
export const RELAY_STATUS = ['pending', 'transit', 'delivered', 'failed', 'interrupted'];
export const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

export class MessageRelay {
    constructor(config = {}) {
        this.config = { ...config };
        this.messages = new Map();   // msgId -> { id, from, to, content, status, priority, hops, createdAt, deliveredAt }
        this.hooks = new Map();
        this.stats = { total: 0, totalDelivered: 0, totalFailed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    send(from, to, content, priority = 'normal') {
        if (!from || !to) return null;
        if (!PRIORITIES.includes(priority)) priority = 'normal';
        const id = this._newId();
        const m = { id, from, to, content, status: 'pending', priority, hops: 0, createdAt: Date.now(), deliveredAt: null };
        this.messages.set(id, m);
        this.stats.total++;
        this._emit('sent', m);
        return m;
    }
    get(id) { return this.messages.get(id) || null; }
    listAll() { return [...this.messages.values()]; }
    listByStatus(st) { return this.listAll().filter(m => m.status === st); }
    listByFrom(from) { return this.listAll().filter(m => m.from === from); }
    listByTo(to) { return this.listAll().filter(m => m.to === to); }
    listByPriority(p) { return this.listAll().filter(m => m.priority === p); }

    setStatus(id, status) {
        const m = this.messages.get(id);
        if (!m) return false;
        if (!RELAY_STATUS.includes(status)) return false;
        m.status = status;
        if (status === 'delivered') {
            m.deliveredAt = Date.now();
            this.stats.totalDelivered++;
        } else if (status === 'failed') {
            this.stats.totalFailed++;
        }
        return true;
    }
    transit(id) {
        const m = this.messages.get(id);
        if (!m) return false;
        if (m.status === 'delivered' || m.status === 'failed') return false;
        m.status = 'transit';
        return true;
    }
    deliver(id) {
        const m = this.messages.get(id);
        if (!m) return false;
        if (m.status === 'delivered' || m.status === 'failed') return false;
        m.status = 'delivered';
        m.deliveredAt = Date.now();
        this.stats.totalDelivered++;
        return true;
    }
    fail(id) {
        const m = this.messages.get(id);
        if (!m) return false;
        if (m.status === 'delivered' || m.status === 'failed') return false;
        m.status = 'failed';
        this.stats.totalFailed++;
        return true;
    }
    interrupt(id) { return this.setStatus(id, 'interrupted'); }
    hop(id) {
        const m = this.messages.get(id);
        if (!m) return false;
        m.hops++;
        return true;
    }
    isDelivered(id) { return this.messages.get(id)?.status === 'delivered'; }
    isPending(id) { return this.messages.get(id)?.status === 'pending'; }
    isFailed(id) { return this.messages.get(id)?.status === 'failed'; }
    hopsOf(id) { return this.messages.get(id)?.hops || 0; }
    duration(id) {
        const m = this.messages.get(id);
        if (!m || !m.deliveredAt) return 0;
        return m.deliveredAt - m.createdAt;
    }
    successRate() { return this.stats.total === 0 ? 0 : this.stats.totalDelivered / this.stats.total; }
    pendingCount() { return this.listByStatus('pending').length; }
    report() { return { total: this.stats.total, totalDelivered: this.stats.totalDelivered, successRate: this.successRate() }; }
    reset() { this.messages.clear(); this.stats = { total: 0, totalDelivered: 0, totalFailed: 0 }; }
}
