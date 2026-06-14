/**
 * ManaScribe.js - 法力铭文
 * V1147 Round 43 Iter 20/30
 */
export const SCRIBE_STATUS = ['drafting', 'inscribing', 'completed', 'failed', 'erased'];
export const SCRIBE_MATERIALS = ['paper', 'bone', 'stone', 'metal', 'crystal', 'void'];

export class ManaScribe {
    constructor(config = {}) {
        this.config = { ...config };
        this.scribes = new Map();   // sid -> { id, text, status, material, power, mana, ts }
        this.hooks = new Map();
        this.stats = { total: 0, totalPower: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ms_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    scribe(text, material = 'paper', power = 1, mana = 10) {
        if (!text) return null;
        if (!SCRIBE_MATERIALS.includes(material)) material = 'paper';
        const id = this._newId();
        const s = { id, text, status: 'drafting', material, power, mana, ts: Date.now() };
        this.scribes.set(id, s);
        this.stats.total++;
        this.stats.totalPower += power;
        this._emit('scribed', s);
        return s;
    }
    get(id) { return this.scribes.get(id) || null; }
    listAll() { return [...this.scribes.values()]; }
    listByStatus(st) { return this.listAll().filter(s => s.status === st); }
    listByMaterial(m) { return this.listAll().filter(s => s.material === m); }
    listCompleted() { return this.listByStatus('completed'); }

    setStatus(id, status) {
        const s = this.scribes.get(id);
        if (!s) return false;
        if (!SCRIBE_STATUS.includes(status)) return false;
        s.status = status;
        if (status === 'completed') this._emit('completed', s);
        return true;
    }
    inscribe(id) { return this.setStatus(id, 'inscribing'); }
    complete(id) { return this.setStatus(id, 'completed'); }
    fail(id) { return this.setStatus(id, 'failed'); }
    erase(id) { return this.setStatus(id, 'erased'); }
    setPower(id, power) {
        const s = this.scribes.get(id);
        if (!s) return false;
        s.power = Math.max(0, power);
        this.stats.totalPower = this.listAll().reduce((sum, x) => sum + x.power, 0);
        return true;
    }
    setMana(id, mana) {
        const s = this.scribes.get(id);
        if (!s) return false;
        s.mana = Math.max(0, mana);
        return true;
    }
    setMaterial(id, material) {
        const s = this.scribes.get(id);
        if (!s) return false;
        if (!SCRIBE_MATERIALS.includes(material)) return false;
        s.material = material;
        return true;
    }
    isCompleted(id) { return this.scribes.get(id)?.status === 'completed'; }
    isFailed(id) { return this.scribes.get(id)?.status === 'failed'; }
    isErased(id) { return this.scribes.get(id)?.status === 'erased'; }
    isInscribing(id) { return this.scribes.get(id)?.status === 'inscribing'; }
    powerOf(id) { return this.scribes.get(id)?.power || 0; }
    manaOf(id) { return this.scribes.get(id)?.mana || 0; }
    materialOf(id) { return this.scribes.get(id)?.material || null; }
    averagePower() { return this.stats.total === 0 ? 0 : this.stats.totalPower / this.stats.total; }
    best() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, s) => !best || s.power > best.power ? s : best, null);
    }
    countByMaterial() {
        const c = {};
        for (const m of SCRIBE_MATERIALS) c[m] = 0;
        for (const s of this.scribes.values()) c[s.material] = (c[s.material] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalPower: this.stats.totalPower, averagePower: this.averagePower() }; }
    reset() { this.scribes.clear(); this.stats = { total: 0, totalPower: 0 }; }
}
