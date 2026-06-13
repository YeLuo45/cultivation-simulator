/**
 * PlayerFrustrationGauge.js - 玩家挫败感测量
 * V962 P-20260614-015 Iteration 15/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (ruflo gauge + intervention):
 * - 综合失败/卡点/退出率计算挫败感指数
 * - 0-100 数值，0=无挫败，100=极度挫败
 * - 超过阈值触发建议 (降低难度/休息提示)
 */

export const FRUSTRATION_THRESHOLDS = {
    mild: 25,
    moderate: 50,
    severe: 75,
    critical: 90,
};

export const FRUSTRATION_FACTORS = {
    failure: 2.0,
    stuck: 3.0,
    session_abandon: 5.0,
    quit_attempt: 10.0,
};

export const DECAY_RATE = 1.5;  // 每次成功降低 1.5 点

export class PlayerFrustrationGauge {
    constructor(config = {}) {
        this.config = {
            decayRate: config.decayRate !== undefined ? config.decayRate : DECAY_RATE,
            ...config,
        };
        this.levels = new Map();         // playerId -> level
        this.history = new Map();        // playerId -> { events: [...] }
        this.hooks = new Map();
        this.stats = { totalUpdates: 0, totalInterventions: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    _initPlayer(playerId) {
        if (!this.levels.has(playerId)) {
            this.levels.set(playerId, 0);
            this.history.set(playerId, { events: [] });
        }
    }

    addFrustration(playerId, factor, amount = 1) {
        this._initPlayer(playerId);
        const w = FRUSTRATION_FACTORS[factor] || 1.0;
        const delta = w * amount;
        const current = this.levels.get(playerId);
        const newLevel = Math.min(100, current + delta);
        this.levels.set(playerId, newLevel);
        this._recordEvent(playerId, { type: 'add', factor, amount, delta, level: newLevel });
        this.stats.totalUpdates++;
        this._checkIntervention(playerId, newLevel);
        return newLevel;
    }

    decayFrustration(playerId, amount = 1) {
        this._initPlayer(playerId);
        const current = this.levels.get(playerId);
        const delta = this.config.decayRate * amount;
        const newLevel = Math.max(0, current - delta);
        this.levels.set(playerId, newLevel);
        this._recordEvent(playerId, { type: 'decay', amount, delta, level: newLevel });
        this.stats.totalUpdates++;
        return newLevel;
    }

    _recordEvent(playerId, event) {
        const h = this.history.get(playerId);
        h.events.push({ ...event, ts: Date.now() });
        if (h.events.length > 100) h.events.shift();
    }

    _checkIntervention(playerId, level) {
        for (const [threshold, severity] of Object.entries(FRUSTRATION_THRESHOLDS)) {
            if (level >= severity) {
                this.stats.totalInterventions++;
                this._emit('intervention', { playerId, level, severity });
                return;
            }
        }
    }

    getLevel(playerId) {
        return this.levels.get(playerId) || 0;
    }

    getSeverity(playerId) {
        const level = this.getLevel(playerId);
        if (level >= FRUSTRATION_THRESHOLDS.critical) return 'critical';
        if (level >= FRUSTRATION_THRESHOLDS.severe) return 'severe';
        if (level >= FRUSTRATION_THRESHOLDS.moderate) return 'moderate';
        if (level >= FRUSTRATION_THRESHOLDS.mild) return 'mild';
        return 'none';
    }

    isInterventionNeeded(playerId) {
        return this.getLevel(playerId) >= FRUSTRATION_THRESHOLDS.moderate;
    }

    shouldSuggestBreak(playerId) {
        return this.getLevel(playerId) >= FRUSTRATION_THRESHOLDS.severe;
    }

    getHistory(playerId) {
        return (this.history.get(playerId)?.events || []).slice();
    }

    report(playerId) {
        const h = this.history.get(playerId) || { events: [] };
        return {
            playerId,
            level: this.getLevel(playerId),
            severity: this.getSeverity(playerId),
            interventionNeeded: this.isInterventionNeeded(playerId),
            suggestBreak: this.shouldSuggestBreak(playerId),
            totalEvents: h.events.length,
        };
    }

    reset() {
        this.levels.clear();
        this.history.clear();
        this.stats = { totalUpdates: 0, totalInterventions: 0 };
    }
}
