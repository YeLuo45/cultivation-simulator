/**
 * ArtifactRefinery.js - 法宝精炼
 * V1114 P-20260614-807 Round 42 Iter 17/30
 */
export const REFINEMENT_STATUS = ['idle', 'heating', 'infusing', 'cooling', 'success', 'failed', 'destroyed'];
export const REFINEMENT_MATERIALS = ['meteorite_iron', 'phoenix_feather', 'dragon_scale', 'spirit_stone', 'divine_water', 'chaos_essence'];

export class ArtifactRefinery {
    constructor(config = {}) {
        this.config = { ...config };
        this.refinements = new Map();   // rid -> { id, artifact, material, status, powerGain, startedAt, endedAt }
        this.hooks = new Map();
        this.stats = { total: 0, totalSuccess: 0, totalFailed: 0, totalDestroyed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ar_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    start(artifact, material = 'spirit_stone') {
        if (!artifact) return null;
        if (!REFINEMENT_MATERIALS.includes(material)) material = 'spirit_stone';
        const id = this._newId();
        const r = { id, artifact, material, status: 'heating', powerGain: 0, startedAt: Date.now(), endedAt: null };
        this.refinements.set(id, r);
        this.stats.total++;
        this._emit('started', r);
        return r;
    }
    get(id) { return this.refinements.get(id) || null; }
    listAll() { return [...this.refinements.values()]; }
    listByArtifact(art) { return this.listAll().filter(r => r.artifact === art); }
    listByStatus(st) { return this.listAll().filter(r => r.status === st); }
    listByMaterial(m) { return this.listAll().filter(r => r.material === m); }
    listActive() { return this.listAll().filter(r => r.status === 'heating' || r.status === 'infusing' || r.status === 'cooling'); }

    setStatus(id, status) {
        const r = this.refinements.get(id);
        if (!r) return false;
        if (!REFINEMENT_STATUS.includes(status)) return false;
        r.status = status;
        if (status === 'success') {
            r.endedAt = Date.now();
            this.stats.totalSuccess++;
            this._emit('success', r);
        } else if (status === 'failed') {
            r.endedAt = Date.now();
            this.stats.totalFailed++;
        } else if (status === 'destroyed') {
            r.endedAt = Date.now();
            this.stats.totalDestroyed++;
        }
        return true;
    }
    infuse(id) { return this.setStatus(id, 'infusing'); }
    cool(id) { return this.setStatus(id, 'cooling'); }
    succeed(id) { return this.setStatus(id, 'success'); }
    fail(id) { return this.setStatus(id, 'failed'); }
    destroy(id) { return this.setStatus(id, 'destroyed'); }
    setPowerGain(id, gain) {
        const r = this.refinements.get(id);
        if (!r) return false;
        r.powerGain = Math.max(0, gain);
        return true;
    }
    isActive(id) {
        const s = this.refinements.get(id)?.status;
        return s === 'heating' || s === 'infusing' || s === 'cooling';
    }
    isSuccess(id) { return this.refinements.get(id)?.status === 'success'; }
    isFailed(id) { return this.refinements.get(id)?.status === 'failed'; }
    isDestroyed(id) { return this.refinements.get(id)?.status === 'destroyed'; }
    powerGainOf(id) { return this.refinements.get(id)?.powerGain || 0; }
    materialOf(id) { return this.refinements.get(id)?.material || null; }
    duration(id) {
        const r = this.refinements.get(id);
        if (!r || !r.endedAt) return 0;
        return r.endedAt - r.startedAt;
    }
    successRate() { return this.stats.total === 0 ? 0 : this.stats.totalSuccess / this.stats.total; }
    artifactCount(art) { return this.listByArtifact(art).length; }
    averageGain() {
        if (this.refinements.size === 0) return 0;
        return this.listAll().reduce((s, r) => s + r.powerGain, 0) / this.refinements.size;
    }
    bestFor(artifact) {
        const list = this.listByArtifact(artifact).filter(r => r.status === 'success');
        if (list.length === 0) return null;
        return list.reduce((best, r) => !best || r.powerGain > best.powerGain ? r : best, null);
    }
    countByMaterial() {
        const c = {};
        for (const m of REFINEMENT_MATERIALS) c[m] = 0;
        for (const r of this.refinements.values()) c[r.material] = (c[r.material] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalSuccess: this.stats.totalSuccess, successRate: this.successRate() }; }
    reset() { this.refinements.clear(); this.stats = { total: 0, totalSuccess: 0, totalFailed: 0, totalDestroyed: 0 }; }
}
