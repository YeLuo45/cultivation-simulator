/**
 * PlayerMotivationMap.js - 玩家动机图谱
 * V961 P-20260614-014 Iteration 14/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (ruflo multi-dimensional motivation):
 * - 识别玩家核心动机 (achievement/social/exploration/mastery/immersion)
 * - 追踪每动机维度的活跃度
 * - 推荐匹配的活动
 */

export const MOTIVATION_TYPES = ['achievement', 'social', 'exploration', 'mastery', 'immersion'];
export const MOTIVATION_THRESHOLDS = { high: 0.4, medium: 0.2, low: 0.1 };

export const MOTIVATION_SIGNALS = {
    achievement: ['complete_quest', 'collect_item', 'reach_milestone', 'level_up'],
    social: ['chat_npc', 'join_sect', 'visit_friend', 'help_player'],
    exploration: ['new_area', 'new_quest', 'discover_secret'],
    mastery: ['perfect_combat', 'optimize_build', 'study_technique'],
    immersion: ['read_lore', 'roleplay', 'view_cutscene'],
};

export class PlayerMotivationMap {
    constructor(config = {}) {
        this.config = { ...config };
        this.signals = new Map();
        this.playerSignals = new Map();
        this.maps = new Map();    // playerId -> Map<motivation, count>
        this.hooks = new Map();
        this.stats = { totalSignals: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    _newId() { return `mot_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    recordSignal(playerId, signalType) {
        const all = Object.values(MOTIVATION_SIGNALS).flat();
        if (!playerId || !all.includes(signalType)) return null;
        const id = this._newId();
        const sig = { id, playerId, signalType, ts: Date.now() };
        this.signals.set(id, sig);
        if (!this.playerSignals.has(playerId)) this.playerSignals.set(playerId, []);
        this.playerSignals.get(playerId).push(id);
        this.stats.totalSignals++;
        this._recomputeMap(playerId);
        this._emit('signalRecorded', sig);
        return sig;
    }

    _motivationFor(signalType) {
        for (const [m, sigs] of Object.entries(MOTIVATION_SIGNALS)) {
            if (sigs.includes(signalType)) return m;
        }
        return null;
    }

    _recomputeMap(playerId) {
        const ids = this.playerSignals.get(playerId) || [];
        const counts = {};
        for (const m of MOTIVATION_TYPES) counts[m] = 0;
        for (const id of ids) {
            const sig = this.signals.get(id);
            if (!sig) continue;
            const m = this._motivationFor(sig.signalType);
            if (m) counts[m]++;
        }
        if (!this.maps.has(playerId)) this.maps.set(playerId, new Map());
        for (const [m, c] of Object.entries(counts)) this.maps.get(playerId).set(m, c);
    }

    getMotivationCount(playerId, motivation) {
        const m = this.maps.get(playerId);
        if (!m) return 0;
        return m.get(motivation) || 0;
    }

    getMap(playerId) {
        return this.maps.get(playerId) || null;
    }

    dominantMotivation(playerId) {
        const m = this.maps.get(playerId);
        if (!m) return null;
        let top = null, topC = -1;
        for (const [mot, c] of m) {
            if (c > topC) { topC = c; top = mot; }
        }
        return top;
    }

    motivationLevel(playerId, motivation) {
        const count = this.getMotivationCount(playerId, motivation);
        if (count === 0) return 'none';
        const total = [...this.maps.get(playerId).values()].reduce((s, n) => s + n, 0);
        if (total === 0) return 'none';
        const ratio = count / total;
        if (ratio >= MOTIVATION_THRESHOLDS.high) return 'high';
        if (ratio >= MOTIVATION_THRESHOLDS.medium) return 'medium';
        if (ratio >= MOTIVATION_THRESHOLDS.low) return 'low';
        return 'minimal';
    }

    recommendedActivity(playerId) {
        const dom = this.dominantMotivation(playerId);
        if (!dom) return null;
        return MOTIVATION_SIGNALS[dom][0];
    }

    getSignal(signalId) { return this.signals.get(signalId) || null; }
    listSignals(playerId) { return (this.playerSignals.get(playerId) || []).map(id => this.signals.get(id)).filter(Boolean); }

    report(playerId) {
        const m = this.maps.get(playerId);
        if (!m) return null;
        const levels = {};
        for (const mot of MOTIVATION_TYPES) levels[mot] = this.motivationLevel(playerId, mot);
        return {
            playerId,
            dominant: this.dominantMotivation(playerId),
            levels,
            counts: Object.fromEntries(m),
            recommended: this.recommendedActivity(playerId),
        };
    }

    reset() {
        this.signals.clear();
        this.playerSignals.clear();
        this.maps.clear();
        this.stats = { totalSignals: 0 };
    }
}
