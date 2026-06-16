/**
 * MoleHunter.js - 内鬼猎手
 * V1083 P-20260614-410 Round 41 Iter 16/30
 */
export const SUSPICION_LEVELS = ['none', 'mild', 'moderate', 'high', 'confirmed'];
export const EVIDENCE_TYPES = ['testimony', 'document', 'behavioral', 'financial', 'communication'];

export class MoleHunter {
    constructor(config = {}) {
        this.config = { ...config };
        this.suspects = new Map();   // suspectId -> { id, name, suspicion, evidence, status, investigatedAt }
        this.hooks = new Map();
        this.stats = { total: 0, confirmed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `mol_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    suspect(name) {
        if (!name) return null;
        const id = this._newId();
        const s = { id, name, suspicion: 'none', evidence: [], status: 'under_investigation', investigatedAt: Date.now() };
        this.suspects.set(id, s);
        this.stats.total++;
        return s;
    }
    get(id) { return this.suspects.get(id) || null; }
    listAll() { return [...this.suspects.values()]; }
    listBySuspicion(level) { return this.listAll().filter(s => s.suspicion === level); }
    listConfirmed() { return this.listBySuspicion('confirmed'); }

    addEvidence(suspectId, type, description = '') {
        const s = this.suspects.get(suspectId);
        if (!s) return false;
        if (!EVIDENCE_TYPES.includes(type)) return false;
        s.evidence.push({ type, description, ts: Date.now() });
        this._updateSuspicion(s);
        return true;
    }
    _updateSuspicion(s) {
        const count = s.evidence.length;
        let newLevel;
        if (count === 0) newLevel = 'none';
        else if (count === 1) newLevel = 'mild';
        else if (count === 2) newLevel = 'moderate';
        else if (count === 3) newLevel = 'high';
        else newLevel = 'confirmed';
        s.suspicion = newLevel;
        if (newLevel === 'confirmed') this.stats.confirmed++;
    }
    clear(suspectId) {
        const s = this.suspects.get(suspectId);
        if (!s) return false;
        s.evidence = [];
        s.suspicion = 'none';
        return true;
    }
    confirm(suspectId) {
        const s = this.suspects.get(suspectId);
        if (!s) return false;
        s.suspicion = 'confirmed';
        s.confirmedAt = Date.now();
        this.stats.confirmed++;
        this._emit('confirmed', s);
        return true;
    }
    evidenceCount(suspectId) { return this.suspects.get(suspectId)?.evidence.length || 0; }
    hasEvidence(suspectId, type) {
        return (this.suspects.get(suspectId)?.evidence || []).some(e => e.type === type);
    }
    suspicionOf(suspectId) { return this.suspects.get(suspectId)?.suspicion || null; }
    isConfirmed(suspectId) { return this.suspects.get(suspectId)?.suspicion === 'confirmed'; }
    isHighRisk(suspectId) {
        const l = this.suspects.get(suspectId)?.suspicion;
        return l === 'high' || l === 'confirmed';
    }
    topSuspects(n = 5) {
        const order = SUSPICION_LEVELS;
        return this.listAll().sort((a, b) => order.indexOf(b.suspicion) - order.indexOf(a.suspicion)).slice(0, n);
    }
    averageEvidence() {
        if (this.suspects.size === 0) return 0;
        return this.listAll().reduce((s, x) => s + x.evidence.length, 0) / this.suspects.size;
    }
    report() { return { total: this.stats.total, confirmed: this.stats.confirmed }; }
    reset() { this.suspects.clear(); this.stats = { total: 0, confirmed: 0 }; }
}
