/**
 * StatusEffectManager.js - 状态效果管理器
 * V1016 P-20260614-176 Round 39 Iter 9/30
 */
export const EFFECT_TYPES = ['buff', 'debuff', 'dot', 'hot', 'stun', 'silence', 'stealth', 'shield'];
export const DEFAULT_DURATION = 3;

export class StatusEffectManager {
    constructor(config = {}) {
        this.config = { defaultDuration: config.defaultDuration || DEFAULT_DURATION, ...config };
        this.effects = new Map();    // effectId -> { id, type, target, source, value, duration, remaining, appliedAt }
        this.byTarget = new Map();   // targetId -> [effectId]
        this.hooks = new Map();
        this.stats = { totalApplied: 0, totalExpired: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `eff_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    apply(type, target, source, value = 0, duration = null) {
        if (!EFFECT_TYPES.includes(type)) return null;
        if (!target) return null;
        const id = this._newId();
        const dur = duration || this.config.defaultDuration;
        const e = { id, type, target, source, value, duration: dur, remaining: dur, appliedAt: Date.now() };
        this.effects.set(id, e);
        if (!this.byTarget.has(target)) this.byTarget.set(target, []);
        this.byTarget.get(target).push(id);
        this.stats.totalApplied++;
        this._emit('applied', e);
        return e;
    }
    remove(effectId) {
        const e = this.effects.get(effectId);
        if (!e) return false;
        e.remaining = 0;
        this._emit('removed', e);
        return true;
    }
    removeAllFromTarget(target, type = null) {
        const ids = this.byTarget.get(target) || [];
        let count = 0;
        for (const id of ids) {
            const e = this.effects.get(id);
            if (e && (type === null || e.type === type)) {
                e.remaining = 0;
                count++;
            }
        }
        return count;
    }
    tick(amount = 1) {
        let expired = 0;
        for (const e of this.effects.values()) {
            e.remaining = Math.max(0, e.remaining - amount);
            if (e.remaining === 0) { expired++; this.stats.totalExpired++; this._emit('expired', e); }
        }
        return expired;
    }
    cleanup() {
        const toRemove = [];
        for (const [id, e] of this.effects) if (e.remaining === 0) toRemove.push(id);
        for (const id of toRemove) {
            const e = this.effects.get(id);
            this.effects.delete(id);
            if (e) {
                const arr = this.byTarget.get(e.target);
                if (arr) {
                    const idx = arr.indexOf(id);
                    if (idx >= 0) arr.splice(idx, 1);
                }
            }
        }
        return toRemove.length;
    }

    get(id) { return this.effects.get(id) || null; }
    listAll() { return [...this.effects.values()]; }
    listForTarget(target) {
        return (this.byTarget.get(target) || []).map(id => this.effects.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(e => e.type === type); }
    listFromSource(source) { return this.listAll().filter(e => e.source === source); }

    isAffected(target, type) {
        return (this.byTarget.get(target) || []).some(id => {
            const e = this.effects.get(id);
            return e && e.type === type && e.remaining > 0;
        });
    }
    effectCount(target, type = null) {
        const arr = this.byTarget.get(target) || [];
        if (type === null) return arr.length;
        return arr.filter(id => this.effects.get(id)?.type === type).length;
    }
    totalValue(target, type) {
        return this.listForTarget(target).filter(e => e.type === type).reduce((s, e) => s + e.value, 0);
    }
    isStunned(target) { return this.isAffected(target, 'stun'); }
    isSilenced(target) { return this.isAffected(target, 'silence'); }
    isStealthed(target) { return this.isAffected(target, 'stealth'); }
    hasShield(target) { return this.isAffected(target, 'shield'); }
    report() { return { totalApplied: this.stats.totalApplied, totalExpired: this.stats.totalExpired, active: this.listAll().filter(e => e.remaining > 0).length }; }
    reset() { this.effects.clear(); this.byTarget.clear(); this.stats = { totalApplied: 0, totalExpired: 0 }; }
}
