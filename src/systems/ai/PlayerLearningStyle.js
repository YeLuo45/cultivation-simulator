/**
 * PlayerLearningStyle.js - 玩家学习风格识别
 * V959 P-20260614-012 Iteration 12/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (ruflo hierarchical structure):
 * - 识别玩家学习风格 (visual/kinesthetic/reading/social)
 * - 统计行为模式对应风格
 * - 推荐匹配的学习内容
 */

export const LEARNING_STYLES = ['visual', 'kinesthetic', 'reading', 'social', 'trial_error'];
export const STYLE_THRESHOLDS = {
    dominant: 0.5,
    secondary: 0.25,
};

export const STYLE_SIGNALS = {
    visual: ['watch_demo', 'view_map', 'inspect_item'],
    kinesthetic: ['practice_combat', 'manual_craft', 'movement'],
    reading: ['read_manual', 'check_help', 'browse_lore'],
    social: ['ask_npc', 'chat_player', 'visit_sect'],
    trial_error: ['random_explore', 'try_skill', 'experiment'],
};

export class PlayerLearningStyle {
    constructor(config = {}) {
        this.config = { ...config };
        this.signals = new Map();        // signalId -> signal
        this.playerSignals = new Map();  // playerId -> signalId[]
        this.profiles = new Map();       // playerId -> { style: ratio, lastUpdated }
        this.hooks = new Map();
        this.stats = { totalSignals: 0, totalProfiles: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    _newId() { return `lsg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    recordSignal(playerId, signalType) {
        const allSignals = Object.values(STYLE_SIGNALS).flat();
        if (!playerId || !allSignals.includes(signalType)) return null;
        const id = this._newId();
        const sig = { id, playerId, signalType, ts: Date.now() };
        this.signals.set(id, sig);
        if (!this.playerSignals.has(playerId)) this.playerSignals.set(playerId, []);
        this.playerSignals.get(playerId).push(id);
        this.stats.totalSignals++;
        this._updateProfile(playerId);
        this._emit('signalRecorded', sig);
        return sig;
    }

    _styleFor(signalType) {
        for (const [style, sigs] of Object.entries(STYLE_SIGNALS)) {
            if (sigs.includes(signalType)) return style;
        }
        return null;
    }

    _updateProfile(playerId) {
        const ids = this.playerSignals.get(playerId) || [];
        if (ids.length === 0) return;
        const counts = {};
        for (const s of LEARNING_STYLES) counts[s] = 0;
        for (const id of ids) {
            const sig = this.signals.get(id);
            if (!sig) continue;
            const style = this._styleFor(sig.signalType);
            if (style) counts[style] = (counts[style] || 0) + 1;
        }
        const total = Object.values(counts).reduce((s, n) => s + n, 0);
        const ratios = {};
        for (const [s, c] of Object.entries(counts)) ratios[s] = total > 0 ? c / total : 0;
        this.profiles.set(playerId, { ratios, total, lastUpdated: Date.now() });
        this.stats.totalProfiles++;
    }

    getStyleRatios(playerId) {
        return this.profiles.get(playerId)?.ratios || null;
    }

    dominantStyle(playerId) {
        const ratios = this.getStyleRatios(playerId);
        if (!ratios) return null;
        let maxStyle = null, maxRatio = 0;
        for (const [s, r] of Object.entries(ratios)) {
            if (r > maxRatio) { maxRatio = r; maxStyle = s; }
        }
        if (maxRatio > STYLE_THRESHOLDS.dominant) return maxStyle;
        return null;
    }

    secondaryStyle(playerId) {
        const ratios = this.getStyleRatios(playerId);
        if (!ratios) return null;
        const sorted = Object.entries(ratios).sort((a, b) => b[1] - a[1]);
        if (sorted.length < 2) return null;
        return sorted[1][1] >= STYLE_THRESHOLDS.secondary ? sorted[1][0] : null;
    }

    isMultimodal(playerId) {
        const ratios = this.getStyleRatios(playerId);
        if (!ratios) return false;
        const above = Object.values(ratios).filter(r => r >= STYLE_THRESHOLDS.secondary).length;
        return above >= 2;
    }

    recommendedContent(playerId) {
        const dominant = this.dominantStyle(playerId);
        const secondary = this.secondaryStyle(playerId);
        return {
            primary: dominant ? STYLE_SIGNALS[dominant] : [],
            secondary: secondary ? STYLE_SIGNALS[secondary] : [],
        };
    }

    getSignal(signalId) { return this.signals.get(signalId) || null; }
    listSignals(playerId) { return (this.playerSignals.get(playerId) || []).map(id => this.signals.get(id)).filter(Boolean); }

    report(playerId) {
        return {
            playerId,
            ratios: this.getStyleRatios(playerId),
            dominant: this.dominantStyle(playerId),
            secondary: this.secondaryStyle(playerId),
            isMultimodal: this.isMultimodal(playerId),
            totalSignals: this.listSignals(playerId).length,
        };
    }

    reset() {
        this.signals.clear();
        this.playerSignals.clear();
        this.profiles.clear();
        this.stats = { totalSignals: 0, totalProfiles: 0 };
    }
}
