/**
 * HoneypotManager.js - 蜜罐管理器
 * V1086 P-20260614-413 Round 41 Iter 19/30
 */
export const POT_STATUS = ['active', 'triggered', 'burned', 'archived'];
export const POT_LURE_TYPES = ['document', 'treasure', 'meeting', 'secret', 'formation'];

export class HoneypotManager {
    constructor(config = {}) {
        this.config = { ...config };
        this.pots = new Map();   // potId -> { id, name, lure, status, triggers, deployedAt }
        this.hooks = new Map();
        this.stats = { total: 0, totalTriggered: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `hny_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    deploy(name, lure = 'document') {
        if (!name) return null;
        if (!POT_LURE_TYPES.includes(lure)) lure = 'document';
        const id = this._newId();
        const p = { id, name, lure, status: 'active', triggers: [], deployedAt: Date.now() };
        this.pots.set(id, p);
        this.stats.total++;
        this._emit('deployed', p);
        return p;
    }
    get(id) { return this.pots.get(id) || null; }
    listAll() { return [...this.pots.values()]; }
    listByStatus(st) { return this.listAll().filter(p => p.status === st); }
    listByLure(lure) { return this.listAll().filter(p => p.lure === lure); }
    listActive() { return this.listByStatus('active'); }

    trigger(potId, targetId) {
        const p = this.pots.get(potId);
        if (!p) return false;
        if (p.status !== 'active') return false;
        p.status = 'triggered';
        p.triggers.push({ targetId, ts: Date.now() });
        this.stats.totalTriggered++;
        this._emit('triggered', { potId, targetId });
        return true;
    }
    burn(potId) {
        const p = this.pots.get(potId);
        if (!p) return false;
        p.status = 'burned';
        return true;
    }
    archive(potId) {
        const p = this.pots.get(potId);
        if (!p) return false;
        p.status = 'archived';
        return true;
    }
    setStatus(id, status) {
        const p = this.pots.get(id);
        if (!p) return false;
        if (!POT_STATUS.includes(status)) return false;
        p.status = status;
        return true;
    }
    isActive(id) { return this.pots.get(id)?.status === 'active'; }
    isTriggered(id) { return this.pots.get(id)?.status === 'triggered'; }
    isBurned(id) { return this.pots.get(id)?.status === 'burned'; }
    triggerCount(id) { return this.pots.get(id)?.triggers.length || 0; }
    hasTriggered(id) { return this.triggerCount(id) > 0; }
    triggerRate() { return this.stats.total === 0 ? 0 : this.stats.totalTriggered / this.stats.total; }
    triggerList(id) { return [...(this.pots.get(id)?.triggers || [])]; }
    triggeredBy(potId, targetId) {
        return (this.pots.get(potId)?.triggers || []).some(t => t.targetId === targetId);
    }
    report() { return { total: this.stats.total, totalTriggered: this.stats.totalTriggered, triggerRate: this.triggerRate() }; }
    reset() { this.pots.clear(); this.stats = { total: 0, totalTriggered: 0 }; }
}
