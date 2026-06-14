/**
 * FormSequence.js - 招式序贯器
 * V1020 P-20260614-180 Round 39 Iter 13/30
 */
export const MAX_FORM_LENGTH = 8;
export const FORM_STATUS = ['learning', 'mastered', 'forgotten'];

export class FormSequence {
    constructor(config = {}) {
        this.config = { maxLength: config.maxLength || MAX_FORM_LENGTH, ...config };
        this.forms = new Map();      // formId -> { id, name, sequence, status, learnedAt, mastery }
        this.byPlayer = new Map();   // playerId -> [formId]
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `frm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(name, sequence, status = 'learning') {
        if (!name || !Array.isArray(sequence)) return null;
        if (sequence.length > this.config.maxLength) return null;
        if (!FORM_STATUS.includes(status)) status = 'learning';
        const id = this._newId();
        const f = { id, name, sequence: [...sequence], status, learnedAt: Date.now(), mastery: 0 };
        this.forms.set(id, f);
        this.stats.total++;
        this._emit('created', f);
        return f;
    }
    get(id) { return this.forms.get(id) || null; }
    listAll() { return [...this.forms.values()]; }
    listByStatus(st) { return this.listAll().filter(f => f.status === st); }

    assign(formId, playerId) {
        const f = this.forms.get(formId);
        if (!f) return false;
        if (!this.byPlayer.has(playerId)) this.byPlayer.set(playerId, []);
        this.byPlayer.get(playerId).push(formId);
        return true;
    }
    learn(playerId, formId) {
        return this.assign(formId, playerId);
    }
    unlearn(playerId, formId) {
        const arr = this.byPlayer.get(playerId);
        if (!arr) return false;
        const idx = arr.indexOf(formId);
        if (idx < 0) return false;
        arr.splice(idx, 1);
        return true;
    }
    forPlayer(playerId) {
        return (this.byPlayer.get(playerId) || []).map(id => this.forms.get(id)).filter(Boolean);
    }
    learnedCount(playerId) { return this.byPlayer.get(playerId)?.length || 0; }
    hasForm(playerId, formId) { return (this.byPlayer.get(playerId) || []).includes(formId); }
    practice(formId, amount = 10) {
        const f = this.forms.get(formId);
        if (!f) return false;
        f.mastery = Math.min(100, f.mastery + amount);
        if (f.mastery >= 100) f.status = 'mastered';
        return true;
    }
    masteryOf(formId) { return this.forms.get(formId)?.mastery || 0; }
    isMastered(formId) { return this.forms.get(formId)?.status === 'mastered'; }
    canPerform(formId, playerId) {
        if (!this.hasForm(playerId, formId)) return false;
        return this.isMastered(formId);
    }
    execute(formId, playerId) {
        const f = this.forms.get(formId);
        if (!f) return null;
        if (!this.canPerform(formId, playerId)) return null;
        return { name: f.name, sequence: f.sequence, mastery: f.mastery };
    }
    setStatus(formId, status) {
        const f = this.forms.get(formId);
        if (!f || !FORM_STATUS.includes(status)) return false;
        f.status = status;
        return true;
    }
    report() { return { total: this.stats.total, mastered: this.listByStatus('mastered').length }; }
    reset() { this.forms.clear(); this.byPlayer.clear(); this.stats = { total: 0 }; }
}
