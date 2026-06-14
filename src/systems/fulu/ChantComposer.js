/**
 * ChantComposer.js - 咒语创作
 * V1144 Round 43 Iter 17/30
 */
export const CHANT_STATUS = ['drafting', 'composing', 'tuning', 'ready', 'archived'];
export const CHANT_STYLES = ['classical', 'modern', 'ancient', 'chaotic', 'harmonic'];

export class ChantComposer {
    constructor(config = {}) {
        this.config = { ...config };
        this.chants = new Map();   // cid -> { id, name, status, style, syllables, power, owner, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalSyllables: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `cc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    compose(name, syllables = [], style = 'classical', power = 1, owner = null) {
        if (!name) return null;
        if (!CHANT_STYLES.includes(style)) style = 'classical';
        if (!Array.isArray(syllables)) syllables = [];
        const id = this._newId();
        const c = { id, name, status: 'drafting', style, syllables: [...syllables], power, owner, ts: Date.now() };
        this.chants.set(id, c);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        this.stats.total++;
        this.stats.totalSyllables += syllables.length;
        return c;
    }
    get(id) { return this.chants.get(id) || null; }
    listAll() { return [...this.chants.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.chants.get(id)).filter(Boolean);
    }
    listByStatus(st) { return this.listAll().filter(c => c.status === st); }
    listByStyle(st) { return this.listAll().filter(c => c.style === st); }
    listReady() { return this.listByStatus('ready'); }

    setStatus(id, status) {
        const c = this.chants.get(id);
        if (!c) return false;
        if (!CHANT_STATUS.includes(status)) return false;
        c.status = status;
        if (status === 'ready') this._emit('ready', c);
        return true;
    }
    composing(id) { return this.setStatus(id, 'composing'); }
    tuning(id) { return this.setStatus(id, 'tuning'); }
    archive(id) { return this.setStatus(id, 'archived'); }
    addSyllable(id, syllable) {
        const c = this.chants.get(id);
        if (!c) return false;
        c.syllables.push(syllable);
        this.stats.totalSyllables++;
        return true;
    }
    removeSyllable(id, idx) {
        const c = this.chants.get(id);
        if (!c) return false;
        if (idx < 0 || idx >= c.syllables.length) return false;
        c.syllables.splice(idx, 1);
        this.stats.totalSyllables--;
        return true;
    }
    setStyle(id, style) {
        const c = this.chants.get(id);
        if (!c) return false;
        if (!CHANT_STYLES.includes(style)) return false;
        c.style = style;
        return true;
    }
    setPower(id, power) {
        const c = this.chants.get(id);
        if (!c) return false;
        c.power = Math.max(0, power);
        return true;
    }
    isReady(id) { return this.chants.get(id)?.status === 'ready'; }
    isComposing(id) { return this.chants.get(id)?.status === 'composing'; }
    isArchived(id) { return this.chants.get(id)?.status === 'archived'; }
    syllableCount(id) { return this.chants.get(id)?.syllables.length || 0; }
    styleOf(id) { return this.chants.get(id)?.style || null; }
    powerOf(id) { return this.chants.get(id)?.power || 0; }
    averageSyllables() { return this.stats.total === 0 ? 0 : this.stats.totalSyllables / this.stats.total; }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    best() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, c) => !best || c.syllables.length > best.syllables.length ? c : best, null);
    }
    countByStatus() {
        const c = {};
        for (const st of CHANT_STATUS) c[st] = 0;
        for (const ch of this.chants.values()) c[ch.status] = (c[ch.status] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalSyllables: this.stats.totalSyllables, averageSyllables: this.averageSyllables() }; }
    reset() { this.chants.clear(); this.byOwner.clear(); this.stats = { total: 0, totalSyllables: 0 }; }
}
