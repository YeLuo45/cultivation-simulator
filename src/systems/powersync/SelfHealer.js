/**
 * SelfHealer.js - 自愈器
 * V1185 Round 45 Iter 29/30 Direction A PowerSync Federation (chatdev)
 * 灵感: generic-agent self-healer - 异常检测 + 自动恢复 + 回滚
 */

export const HEALTH_STATES = ['healthy', 'degraded', 'failed'];
export const ANOMALY_DEGRADED = 0.3;
export const ANOMALY_FAILED = 0.7;
export const MAX_ANOMALIES = 100;
export const MAX_ATTEMPTS = 200;

export class SelfHealer {
    constructor(config = {}) {
        this.config = { maxRetries: 3, backoffMs: 1, ...config };
        this.recoveries = new Map();   // anomalyType -> fn
        this.checkpoints = new Map();  // id -> state (deep copy)
        this.attempts = [];            // { anomalyType, ok, attempts, ts, error? }
        this.anomalies = [];           // { score, ts, metrics }
        this.hooks = new Map();
        this.stats = { detections: 0, recoveries: 0, rollbacks: 0, failures: 0, checkpoints: 0 };
        this.health = { status: 'healthy', score: 1 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }

    // ---- anomaly detection ----
    detectAnomaly(metrics) {
        if (!metrics || typeof metrics !== 'object') return 0;
        const {
            errorRate = 0,
            latencyMs = 0,
            queueDepth = 0,
            throughput = 0,
            memoryPct = 0,
        } = metrics;
        let score = 0;
        if (errorRate > 0.5)      score += 0.5;
        else if (errorRate > 0.1) score += 0.2;
        if (latencyMs > 5000)     score += 0.3;
        else if (latencyMs > 1000) score += 0.15;
        if (queueDepth > 1000)    score += 0.2;
        else if (queueDepth > 100) score += 0.1;
        if (throughput === 0 && errorRate > 0.1) score += 0.2;
        if (memoryPct > 0.95)     score += 0.25;
        else if (memoryPct > 0.8) score += 0.1;
        if (score > 1) score = 1;

        this.anomalies.push({ score, ts: Date.now(), metrics });
        if (this.anomalies.length > MAX_ANOMALIES) this.anomalies.shift();
        this.stats.detections++;
        this._updateHealth(score);
        this._emit('anomalyDetected', { score, metrics });
        return score;
    }

    _updateHealth(score) {
        if (score >= ANOMALY_FAILED) {
            this.health = { status: 'failed', score: Math.max(0, 1 - score) };
        } else if (score >= ANOMALY_DEGRADED) {
            this.health = { status: 'degraded', score: Math.max(0, 1 - score) };
        } else {
            this.health = { status: 'healthy', score: Math.max(0, 1 - score) };
        }
    }

    // ---- recovery ----
    registerRecovery(anomalyType, recoveryFn) {
        if (!anomalyType || typeof recoveryFn !== 'function') return false;
        this.recoveries.set(anomalyType, recoveryFn);
        return true;
    }

    unregisterRecovery(anomalyType) {
        return this.recoveries.delete(anomalyType);
    }

    hasRecovery(anomalyType) { return this.recoveries.has(anomalyType); }

    listRecoveryTypes() { return Array.from(this.recoveries.keys()); }

    async attemptRecovery(anomalyType, context = {}) {
        const fn = this.recoveries.get(anomalyType);
        if (!fn) {
            const entry = { anomalyType, ok: false, attempts: 0, ts: Date.now(), error: 'no_handler' };
            this._pushAttempt(entry);
            this.stats.failures++;
            return { ok: false, error: 'no_handler', attempts: 0 };
        }

        let lastError = null;
        for (let i = 0; i < this.config.maxRetries; i++) {
            try {
                const ok = await fn(context);
                if (ok) {
                    const entry = { anomalyType, ok: true, attempts: i + 1, ts: Date.now() };
                    this._pushAttempt(entry);
                    this.stats.recoveries++;
                    this._emit('recovered', entry);
                    return { ok: true, attempts: i + 1 };
                }
                lastError = 'returned_false';
            } catch (e) {
                lastError = (e && e.message) || String(e);
            }
            // backoff between attempts
            if (i < this.config.maxRetries - 1 && this.config.backoffMs > 0) {
                await new Promise((r) => setTimeout(r, this.config.backoffMs));
            }
        }
        const entry = { anomalyType, ok: false, attempts: this.config.maxRetries, ts: Date.now(), error: lastError };
        this._pushAttempt(entry);
        this.stats.failures++;
        this._emit('recoveryFailed', entry);
        return { ok: false, attempts: this.config.maxRetries, error: lastError };
    }

    _pushAttempt(entry) {
        this.attempts.push(entry);
        if (this.attempts.length > MAX_ATTEMPTS) this.attempts.shift();
    }

    // ---- checkpoints ----
    saveCheckpoint(id, state) {
        if (!id) return false;
        this.checkpoints.set(id, JSON.parse(JSON.stringify(state)));
        this.stats.checkpoints = this.checkpoints.size;
        return true;
    }

    rollback(checkpointId) {
        const state = this.checkpoints.get(checkpointId);
        if (state === undefined) return null;
        this.stats.rollbacks++;
        this._emit('rolledBack', { checkpointId });
        return JSON.parse(JSON.stringify(state));
    }

    deleteCheckpoint(id) {
        const ok = this.checkpoints.delete(id);
        if (ok) this.stats.checkpoints = this.checkpoints.size;
        return ok;
    }

    listCheckpoints() { return Array.from(this.checkpoints.keys()); }

    hasCheckpoint(id) { return this.checkpoints.has(id); }

    getCheckpointCount() { return this.checkpoints.size; }

    // ---- queries ----
    getAttempts() { return this.attempts.slice(); }

    getAnomalies() { return this.anomalies.slice(); }

    getHealth() { return { ...this.health }; }

    setMaxRetries(n) {
        if (typeof n !== 'number' || n < 0) return false;
        this.config.maxRetries = n;
        return true;
    }

    setBackoffMs(ms) {
        if (typeof ms !== 'number' || ms < 0) return false;
        this.config.backoffMs = ms;
        return true;
    }

    getStats() {
        return {
            ...this.stats,
            health: { ...this.health },
            recoveries: this.recoveries.size,
            anomalies: this.anomalies.length,
            attempts: this.attempts.length,
        };
    }

    reset() {
        this.attempts = [];
        this.anomalies = [];
        this.checkpoints.clear();
        this.health = { status: 'healthy', score: 1 };
        this.stats = { detections: 0, recoveries: 0, rollbacks: 0, failures: 0, checkpoints: 0 };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.SelfHealer = SelfHealer;
    globalThis.HEALTH_STATES = HEALTH_STATES;
}
