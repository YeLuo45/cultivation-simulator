/**
 * AntidoteMixer.js - 解毒调和器
 * V1051 P-20260614-241 Round 40 Iter 14/30
 */
export const POISON_TYPES = ['toxic', 'paralysis', 'corrosion', 'curse', 'spiritual'];
export const ANTIDOTE_STATUS = ['pending', 'brewing', 'ready', 'consumed', 'failed'];

export class AntidoteMixer {
    constructor(config = {}) {
        this.config = { ...config };
        this.antidotes = new Map();   // antiId -> { id, poisonType, ingredients, status, effectiveness, ts }
        this.hooks = new Map();
        this.stats = { total: 0, successful: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ant_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    mix(poisonType, ingredients) {
        if (!POISON_TYPES.includes(poisonType)) return null;
        if (!Array.isArray(ingredients)) return null;
        const id = this._newId();
        const a = { id, poisonType, ingredients: [...ingredients], status: 'pending', effectiveness: 0, ts: Date.now() };
        this.antidotes.set(id, a);
        this.stats.total++;
        return a;
    }
    get(id) { return this.antidotes.get(id) || null; }
    listAll() { return [...this.antidotes.values()]; }
    listByPoison(poison) { return this.listAll().filter(a => a.poisonType === poison); }
    listByStatus(st) { return this.listAll().filter(a => a.status === st); }

    setStatus(id, status) {
        const a = this.antidotes.get(id);
        if (!a) return false;
        if (!ANTIDOTE_STATUS.includes(status)) return false;
        a.status = status;
        return true;
    }
    setEffectiveness(id, value) {
        const a = this.antidotes.get(id);
        if (!a) return false;
        a.effectiveness = Math.max(0, Math.min(100, value));
        return true;
    }
    brew(id) {
        const a = this.antidotes.get(id);
        if (!a) return false;
        if (a.status !== 'pending') return false;
        a.status = 'brewing';
        a.effectiveness = 50 + Math.random() * 50;
        return true;
    }
    finalize(id, success = true) {
        const a = this.antidotes.get(id);
        if (!a) return false;
        a.status = success ? 'ready' : 'failed';
        if (success) this.stats.successful++;
        return true;
    }
    consume(id) {
        const a = this.antidotes.get(id);
        if (!a) return false;
        if (a.status !== 'ready') return false;
        a.status = 'consumed';
        a.consumedAt = Date.now();
        return true;
    }
    isReady(id) { return this.antidotes.get(id)?.status === 'ready'; }
    isConsumed(id) { return this.antidotes.get(id)?.status === 'consumed'; }
    isFailed(id) { return this.antidotes.get(id)?.status === 'failed'; }
    canCure(id, poisonStrength) {
        const a = this.antidotes.get(id);
        return a ? a.effectiveness >= poisonStrength : false;
    }
    averageEffectiveness() {
        const ready = this.listByStatus('ready');
        if (ready.length === 0) return 0;
        return ready.reduce((s, a) => s + a.effectiveness, 0) / ready.length;
    }
    successRate() { return this.stats.total === 0 ? 0 : this.stats.successful / this.stats.total; }
    report() { return { total: this.stats.total, successful: this.stats.successful, successRate: this.successRate() }; }
    reset() { this.antidotes.clear(); this.stats = { total: 0, successful: 0 }; }
}
