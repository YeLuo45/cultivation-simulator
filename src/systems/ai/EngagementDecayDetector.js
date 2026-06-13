/**
 * EngagementDecayDetector.js - 投入度衰减检测器
 * V957 P-20260614-010 Iteration 10/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (nanobot engagement tracking):
 * - 追踪玩家会话频率/时长/活动密度
 * - 计算 engagement score
 * - 检测 engagement decay (持续下降)
 * - 触发 retention intervention
 */

export const ENGAGEMENT_SIGNALS = ['login', 'action', 'session_length', 'session_count'];
export const DECAY_WINDOW = 5;
export const DECAY_THRESHOLD = 0.3;

export class EngagementDecayDetector {
    constructor(config = {}) {
        this.config = {
            decayWindow: config.decayWindow !== undefined ? config.decayWindow : DECAY_WINDOW,
            decayThreshold: config.decayThreshold !== undefined ? config.decayThreshold : DECAY_THRESHOLD,
            ...config,
        };
        this.signals = new Map();        // signalId -> { playerId, signalType, value, ts }
        this.playerSignals = new Map();  // playerId -> Map<signalType, signalId[]>
        this.interventions = new Map();  // interventionId -> intervention
        this.hooks = new Map();
        this.stats = { totalSignals: 0, totalInterventions: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    _newId(prefix) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    recordSignal(playerId, signalType, value) {
        if (!playerId || !ENGAGEMENT_SIGNALS.includes(signalType)) return null;
        if (typeof value !== 'number') return null;
        const id = this._newId('sig');
        const sig = { id, playerId, signalType, value, ts: Date.now() };
        this.signals.set(id, sig);
        if (!this.playerSignals.has(playerId)) this.playerSignals.set(playerId, new Map());
        const smap = this.playerSignals.get(playerId);
        if (!smap.has(signalType)) smap.set(signalType, []);
        smap.get(signalType).push(id);
        this.stats.totalSignals++;
        this._checkDecay(playerId);
        this._emit('signalRecorded', sig);
        return sig;
    }

    _signalsFor(playerId, signalType) {
        const smap = this.playerSignals.get(playerId);
        if (!smap) return [];
        const ids = smap.get(signalType) || [];
        return ids.map(id => this.signals.get(id)).filter(Boolean);
    }

    _averageRecent(playerId, signalType) {
        const list = this._signalsFor(playerId, signalType);
        if (list.length === 0) return 0;
        const recent = list.slice(-this.config.decayWindow);
        return recent.reduce((s, x) => s + x.value, 0) / recent.length;
    }

    _averageHistorical(playerId, signalType) {
        const list = this._signalsFor(playerId, signalType);
        if (list.length === 0) return 0;
        return list.reduce((s, x) => s + x.value, 0) / list.length;
    }

    _checkDecay(playerId) {
        for (const st of ENGAGEMENT_SIGNALS) {
            const historical = this._averageHistorical(playerId, st);
            const recent = this._averageRecent(playerId, st);
            if (historical === 0 || recent >= historical) continue;
            const decay = (historical - recent) / historical;
            if (decay >= this.config.decayThreshold) {
                this._triggerIntervention(playerId, st, decay, recent, historical);
            }
        }
    }

    _triggerIntervention(playerId, signalType, decayRate, recent, historical) {
        const id = this._newId('int');
        const intervention = {
            id, playerId, signalType, decayRate, recent, historical, ts: Date.now(),
        };
        this.interventions.set(id, intervention);
        this.stats.totalInterventions++;
        this._emit('interventionTriggered', intervention);
        return intervention;
    }

    engagementScore(playerId) {
        let total = 0, count = 0;
        for (const st of ENGAGEMENT_SIGNALS) {
            const list = this._signalsFor(playerId, st);
            if (list.length > 0) {
                total += this._averageRecent(playerId, st);
                count++;
            }
        }
        if (count === 0) return 0.5;
        return total / count;
    }

    isDecaying(playerId) {
        return this.listInterventions(playerId).length > 0;
    }

    listInterventions(playerId) {
        return [...this.interventions.values()].filter(i => i.playerId === playerId);
    }

    getIntervention(interventionId) { return this.interventions.get(interventionId) || null; }
    getSignal(signalId) { return this.signals.get(signalId) || null; }

    report(playerId) {
        const signalAverages = {};
        for (const st of ENGAGEMENT_SIGNALS) {
            const list = this._signalsFor(playerId, st);
            signalAverages[st] = {
                count: list.length,
                recent: this._averageRecent(playerId, st),
                historical: this._averageHistorical(playerId, st),
            };
        }
        return {
            playerId,
            engagementScore: this.engagementScore(playerId),
            signalAverages,
            totalInterventions: this.listInterventions(playerId).length,
            isDecaying: this.isDecaying(playerId),
        };
    }

    reset() {
        this.signals.clear();
        this.playerSignals.clear();
        this.interventions.clear();
        this.stats = { totalSignals: 0, totalInterventions: 0 };
    }
}
