/**
 * PillPrescription.js - 丹药配方
 * V1056 P-20260614-246 Round 40 Iter 19/30
 */
export const PRESCRIPTION_STATUS = ['active', 'paused', 'completed', 'abandoned'];

export class PillPrescription {
    constructor(config = {}) {
        this.config = { ...config };
        this.prescriptions = new Map();   // prescId -> { id, patientId, pillId, dosage, frequency, status, ts }
        this.byPatient = new Map();
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `prs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    prescribe(patientId, pillId, dosage = 1, frequency = 1) {
        if (!patientId || !pillId) return null;
        if (typeof dosage !== 'number' || dosage <= 0) return null;
        if (typeof frequency !== 'number' || frequency <= 0) return null;
        const id = this._newId();
        const p = { id, patientId, pillId, dosage, frequency, status: 'active', ts: Date.now() };
        this.prescriptions.set(id, p);
        if (!this.byPatient.has(patientId)) this.byPatient.set(patientId, []);
        this.byPatient.get(patientId).push(id);
        this.stats.total++;
        return p;
    }
    get(id) { return this.prescriptions.get(id) || null; }
    listAll() { return [...this.prescriptions.values()]; }
    listByPatient(patientId) {
        const ids = this.byPatient.get(patientId) || [];
        return ids.map(id => this.prescriptions.get(id)).filter(Boolean);
    }
    listByPill(pillId) { return this.listAll().filter(p => p.pillId === pillId); }
    listByStatus(st) { return this.listAll().filter(p => p.status === st); }

    pause(id) { const p = this.prescriptions.get(id); if (!p) return false; p.status = 'paused'; return true; }
    resume(id) { const p = this.prescriptions.get(id); if (!p) return false; p.status = 'active'; return true; }
    complete(id) { const p = this.prescriptions.get(id); if (!p) return false; p.status = 'completed'; p.completedAt = Date.now(); return true; }
    abandon(id) { const p = this.prescriptions.get(id); if (!p) return false; p.status = 'abandoned'; return true; }
    setDosage(id, dosage) { const p = this.prescriptions.get(id); if (!p) return false; p.dosage = Math.max(0, dosage); return true; }
    setFrequency(id, frequency) { const p = this.prescriptions.get(id); if (!p) return false; p.frequency = Math.max(0, frequency); return true; }
    isActive(id) { return this.prescriptions.get(id)?.status === 'active'; }
    isCompleted(id) { return this.prescriptions.get(id)?.status === 'completed'; }
    activeFor(patientId) { return this.listByPatient(patientId).filter(p => p.status === 'active'); }
    patientCount(patientId) { return this.byPatient.get(patientId)?.length || 0; }
    dailyDose(patientId) { return this.listByPatient(patientId).filter(p => p.status === 'active').reduce((s, p) => s + p.dosage * p.frequency, 0); }
    report() { return { total: this.stats.total }; }
    reset() { this.prescriptions.clear(); this.byPatient.clear(); this.stats = { total: 0 }; }
}
