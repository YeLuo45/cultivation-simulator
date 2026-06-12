/**
 * CultivationDreamKarmicEcho.js - 修真因果回响
 * V870 Iteration 4/30 Round 34
 */
export const KARMIC_ACTIONS = ['mercy', 'greed', 'wrath', 'compassion'];
export const ECHO_STRENGTH_LEVELS = ['faint', 'whisper', 'resonant', 'thunderous', 'cosmic'];
export const AMPLIFICATION_RATES = [1, 2, 3, 5, 8];

export class CultivationDreamKarmicEcho {
    constructor(config = {}) {
        this.config = { maxKarma: config.maxKarma || 100, baseEcho: config.baseEcho ?? 0.1, maxAmplify: config.maxAmplify || 5, ...config };
        this.karma = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRecorded: 0, totalAmplified: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getKarma', (ctx) => this.getKarma(ctx.karmaId));
        this.registerTool('listByAction', (ctx) => this.listByAction(ctx.karmicAction));
    }

    recordKarma(dreamId, karmicAction) {
        if (!KARMIC_ACTIONS.includes(karmicAction)) return { success: false, error: 'INVALID_ACTION' };
        const id = `karma_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const echoStrength = Math.min(1, this.config.baseEcho + Math.random() * 0.15);
        const karma = {
            id, dreamId, karmicAction,
            echoStrength, rippleCount: 1,
            amplified: false, amplificationCount: 0,
            recordedAt: Date.now()
        };
        this.karma.set(id, karma);
        this.stats.totalRecorded++;
        this._triggerHook('karmaRecorded', { id, dreamId, karmicAction });
        return { success: true, karma };
    }

    getKarma(id) { return this.karma.get(id) ? { ...this.karma.get(id) } : null; }
    listKarma() { return Array.from(this.karma.values()).map(k => ({ ...k })); }
    listByAction(karmicAction) { return Array.from(this.karma.values()).filter(k => k.karmicAction === karmicAction).map(k => ({ ...k })); }
    listByDream(dreamId) { return Array.from(this.karma.values()).filter(k => k.dreamId === dreamId).map(k => ({ ...k })); }
    listAmplified() { return Array.from(this.karma.values()).filter(k => k.amplified).map(k => ({ ...k })); }

    traceEcho(karmaId) {
        const karma = this.karma.get(karmaId);
        if (!karma) return { success: false, error: 'KARMA_NOT_FOUND' };
        const trace = {
            id: karma.id, action: karma.karmicAction,
            strength: karma.echoStrength,
            ripples: Array.from({ length: Math.min(5, karma.rippleCount) }, (_, i) => `ripple_${i}`),
            tracedAt: Date.now()
        };
        this._triggerHook('echoTraced', { karmaId, rippleCount: karma.rippleCount });
        return { success: true, trace };
    }

    amplifyEcho(karmaId, intensity = 1) {
        const karma = this.karma.get(karmaId);
        if (!karma) return { success: false, error: 'KARMA_NOT_FOUND' };
        const safeIntensity = Math.max(0, Math.min(this.config.maxAmplify, intensity));
        const rate = AMPLIFICATION_RATES[Math.min(AMPLIFICATION_RATES.length - 1, safeIntensity - 1)] || 1;
        karma.echoStrength = Math.min(1, karma.echoStrength + 0.1 * rate);
        karma.rippleCount += rate;
        karma.amplificationCount++;
        karma.amplified = true;
        const strengthIndex = Math.min(ECHO_STRENGTH_LEVELS.length - 1, Math.floor(karma.echoStrength * ECHO_STRENGTH_LEVELS.length));
        karma.strengthLevel = ECHO_STRENGTH_LEVELS[strengthIndex];
        this.stats.totalAmplified++;
        this._triggerHook('echoAmplified', { karmaId, intensity: safeIntensity });
        return { success: true, echoStrength: karma.echoStrength, rippleCount: karma.rippleCount };
    }

    getStrengthLevel(strength) {
        if (typeof strength !== 'number') return ECHO_STRENGTH_LEVELS[0];
        const idx = Math.min(ECHO_STRENGTH_LEVELS.length - 1, Math.max(0, Math.floor(strength * ECHO_STRENGTH_LEVELS.length)));
        return ECHO_STRENGTH_LEVELS[idx];
    }

    addRipple(karmaId, count = 1) {
        const karma = this.karma.get(karmaId);
        if (!karma) return { success: false, error: 'KARMA_NOT_FOUND' };
        karma.rippleCount = Math.max(1, karma.rippleCount + count);
        return { success: true, rippleCount: karma.rippleCount };
    }

    deleteKarma(karmaId) {
        if (!this.karma.has(karmaId)) return { success: false, error: 'KARMA_NOT_FOUND' };
        this.karma.delete(karmaId);
        this._triggerHook('karmaDeleted', { karmaId });
        return { success: true };
    }

    registerTool(name, handler) { this.tools.set(name, { name, handler }); }
    executeTool(name, context) {
        const tool = this.tools.get(name);
        if (!tool) return { success: false, error: 'TOOL_NOT_FOUND' };
        try { return { success: true, result: tool.handler(context || {}) }; }
        catch (e) { return { success: false, error: e.message }; }
    }
    listTools() { return Array.from(this.tools.keys()); }

    registerHook(event, handler) {
        if (!this.hooks.has(event)) this.hooks.set(event, []);
        this.hooks.get(event).push(handler);
        return () => { const arr = this.hooks.get(event); if (arr) { const idx = arr.indexOf(handler); if (idx >= 0) arr.splice(idx, 1); } };
    }
    _triggerHook(event, data) {
        const handlers = this.hooks.get(event);
        if (!handlers) return;
        for (const h of handlers) { try { h(data); } catch (e) {} }
    }

    toJSON() { return { karma: Array.from(this.karma.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.karma) this.karma = new Map(data.karma);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, karmaCount: this.karma.size }; }
}
