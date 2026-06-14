/**
 * ArtifactEnhancer.js - 法宝强化
 * V1115 P-20260614-808 Round 42 Iter 18/30
 */
export const ENHANCEMENT_STATUS = ['available', 'in_progress', 'succeeded', 'failed', 'destroyed'];
export const ENHANCEMENT_LEVELS = ['+0', '+1', '+2', '+3', '+4', '+5', '+6', '+7', '+8', '+9', '+10', '+11', '+12', '+13', '+14', '+15'];

export class ArtifactEnhancer {
    constructor(config = {}) {
        this.config = { ...config };
        this.enhancements = new Map();   // eid -> { id, artifact, level, status, attempts, successRate }
        this.hooks = new Map();
        this.stats = { total: 0, totalSucceeded: 0, totalDestroyed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ae_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    startEnhancement(artifact, currentLevel = '+0', targetLevel = '+1') {
        if (!artifact) return null;
        if (!ENHANCEMENT_LEVELS.includes(currentLevel)) currentLevel = '+0';
        if (!ENHANCEMENT_LEVELS.includes(targetLevel)) targetLevel = '+1';
        const id = this._newId();
        const successRate = this._calcSuccessRate(currentLevel);
        const e = { id, artifact, level: currentLevel, targetLevel, status: 'in_progress', attempts: 0, successRate };
        this.enhancements.set(id, e);
        this.stats.total++;
        return e;
    }
    _calcSuccessRate(level) {
        const num = parseInt(level.replace('+', ''));
        return Math.max(0.1, 1 - num * 0.06);
    }
    get(id) { return this.enhancements.get(id) || null; }
    listAll() { return [...this.enhancements.values()]; }
    listByArtifact(art) { return this.listAll().filter(e => e.artifact === art); }
    listByStatus(st) { return this.listAll().filter(e => e.status === st); }
    listActive() { return this.listByStatus('in_progress'); }
    listSucceeded() { return this.listByStatus('succeeded'); }

    attempt(id) {
        const e = this.enhancements.get(id);
        if (!e) return false;
        if (e.status !== 'in_progress') return false;
        e.attempts++;
        return true;
    }
    succeed(id) {
        const e = this.enhancements.get(id);
        if (!e) return false;
        e.status = 'succeeded';
        e.level = e.targetLevel;
        this.stats.totalSucceeded++;
        this._emit('succeeded', e);
        return true;
    }
    fail(id) {
        const e = this.enhancements.get(id);
        if (!e) return false;
        e.status = 'failed';
        return true;
    }
    destroy(id) {
        const e = this.enhancements.get(id);
        if (!e) return false;
        e.status = 'destroyed';
        this.stats.totalDestroyed++;
        this._emit('destroyed', e);
        return true;
    }
    isActive(id) { return this.enhancements.get(id)?.status === 'in_progress'; }
    isSucceeded(id) { return this.enhancements.get(id)?.status === 'succeeded'; }
    isDestroyed(id) { return this.enhancements.get(id)?.status === 'destroyed'; }
    isFailed(id) { return this.enhancements.get(id)?.status === 'failed'; }
    levelOf(id) { return this.enhancements.get(id)?.level || null; }
    targetLevelOf(id) { return this.enhancements.get(id)?.targetLevel || null; }
    attemptsOf(id) { return this.enhancements.get(id)?.attempts || 0; }
    successRateOf(id) { return this.enhancements.get(id)?.successRate || 0; }
    artifactCount(art) { return this.listByArtifact(art).length; }
    successRate() { return this.stats.total === 0 ? 0 : this.stats.totalSucceeded / this.stats.total; }
    bestLevel(art) {
        const succeeded = this.listByArtifact(art).filter(e => e.status === 'succeeded');
        if (succeeded.length === 0) return null;
        return succeeded.reduce((best, e) => {
            if (!best) return e;
            const a = parseInt(e.level.replace('+', ''));
            const b = parseInt(best.level.replace('+', ''));
            return a > b ? e : best;
        }, null);
    }
    report() { return { total: this.stats.total, totalSucceeded: this.stats.totalSucceeded, totalDestroyed: this.stats.totalDestroyed }; }
    reset() { this.enhancements.clear(); this.stats = { total: 0, totalSucceeded: 0, totalDestroyed: 0 }; }
}
