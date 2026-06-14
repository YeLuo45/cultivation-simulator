/**
 * TalismanCrafter.js - 符箓制作
 * V1136 Round 43 Iter 9/30
 */
export const CRAFT_STATUS = ['queued', 'crafting', 'success', 'failed', 'mastered'];
export const CRAFT_DIFFICULTY = ['easy', 'normal', 'hard', 'expert', 'master'];

export class TalismanCrafter {
    constructor(config = {}) {
        this.config = { ...config };
        this.crafts = new Map();   // cid -> { id, talisman, difficulty, status, progress, startedAt, endedAt }
        this.hooks = new Map();
        this.stats = { total: 0, totalSuccess: 0, totalFailed: 0, totalMastered: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `tc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    start(talisman, difficulty = 'normal') {
        if (!talisman) return null;
        if (!CRAFT_DIFFICULTY.includes(difficulty)) difficulty = 'normal';
        const id = this._newId();
        const c = { id, talisman, difficulty, status: 'crafting', progress: 0, startedAt: Date.now(), endedAt: null };
        this.crafts.set(id, c);
        this.stats.total++;
        return c;
    }
    get(id) { return this.crafts.get(id) || null; }
    listAll() { return [...this.crafts.values()]; }
    listByTalisman(tal) { return this.listAll().filter(c => c.talisman === tal); }
    listByStatus(st) { return this.listAll().filter(c => c.status === st); }
    listByDifficulty(d) { return this.listAll().filter(c => c.difficulty === d); }
    listActive() { return this.listByStatus('crafting'); }

    setStatus(id, status) {
        const c = this.crafts.get(id);
        if (!c) return false;
        if (!CRAFT_STATUS.includes(status)) return false;
        c.status = status;
        if (status === 'success') {
            c.endedAt = Date.now();
            this.stats.totalSuccess++;
            this._emit('success', c);
        } else if (status === 'failed') {
            c.endedAt = Date.now();
            this.stats.totalFailed++;
        } else if (status === 'mastered') {
            this.stats.totalMastered++;
        }
        return true;
    }
    succeed(id) { return this.setStatus(id, 'success'); }
    fail(id) { return this.setStatus(id, 'failed'); }
    master(id) { return this.setStatus(id, 'mastered'); }
    setProgress(id, progress) {
        const c = this.crafts.get(id);
        if (!c) return false;
        c.progress = Math.max(0, Math.min(100, progress));
        return true;
    }
    setDifficulty(id, difficulty) {
        const c = this.crafts.get(id);
        if (!c) return false;
        if (!CRAFT_DIFFICULTY.includes(difficulty)) return false;
        c.difficulty = difficulty;
        return true;
    }
    isActive(id) { return this.crafts.get(id)?.status === 'crafting'; }
    isSuccess(id) { return this.crafts.get(id)?.status === 'success'; }
    isFailed(id) { return this.crafts.get(id)?.status === 'failed'; }
    isMastered(id) { return this.crafts.get(id)?.status === 'mastered'; }
    progressOf(id) { return this.crafts.get(id)?.progress || 0; }
    difficultyOf(id) { return this.crafts.get(id)?.difficulty || null; }
    duration(id) {
        const c = this.crafts.get(id);
        if (!c || !c.endedAt) return 0;
        return c.endedAt - c.startedAt;
    }
    successRate() { return this.stats.total === 0 ? 0 : this.stats.totalSuccess / this.stats.total; }
    talismanCount(tal) { return this.listByTalisman(tal).length; }
    averageProgress() {
        if (this.crafts.size === 0) return 0;
        return this.listAll().reduce((s, c) => s + c.progress, 0) / this.crafts.size;
    }
    countByStatus() {
        const c = {};
        for (const st of CRAFT_STATUS) c[st] = 0;
        for (const cr of this.crafts.values()) c[cr.status] = (c[cr.status] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalSuccess: this.stats.totalSuccess, totalFailed: this.stats.totalFailed, successRate: this.successRate() }; }
    reset() { this.crafts.clear(); this.stats = { total: 0, totalSuccess: 0, totalFailed: 0, totalMastered: 0 }; }
}
