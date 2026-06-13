/**
 * PillEffectEngine.js - 丹药效果引擎
 * V328 Iteration 7/9 Round 5
 */
export class PillEffectEngine {
    constructor(config = {}) {
        this.config = { maxEffects: config.maxEffects || 100, baseDuration: config.baseDuration || 60000, ...config };
        this.effects = new Map();
        this.effectTemplates = new Map();
        this.activeEffects = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEffects: 0, totalApplied: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const templates = [
            { templateId: 'qi_boost', name: 'Qi Boost', type: 'buff', modifiers: { qi: 50 } },
            { templateId: 'heal', name: 'Heal', type: 'instant', modifiers: { hp: 100 } },
            { templateId: 'detox', name: 'Detox', type: 'instant', modifiers: { poison: -100 } },
            { templateId: 'enlighten', name: 'Enlighten', type: 'buff', modifiers: { comprehension: 0.2 } }
        ];
        for (const t of templates) this.effectTemplates.set(t.templateId, t);
    }

    _registerDefaultTools() {
        this.registerTool('getEffect', (ctx) => this.getEffect(ctx.effectId));
        this.registerTool('listEffects', () => Array.from(this.effects.values()).map(e => ({...e})));
    }

    createEffect(data) {
        const id = data.id || `eff_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const effect = { effectId: id, templateId: data.templateId, targetId: data.targetId, modifiers: data.modifiers || {}, duration: data.duration || this.config.baseDuration, startedAt: Date.now(), expiresAt: data.duration ? Date.now() + data.duration : null };
        this.effects.set(id, effect);
        this.stats.totalEffects++;
        this._triggerHook('effectCreated', { effectId: id });
        return { success: true, effect };
    }

    getEffect(id) { return this.effects.get(id) ? { ...this.effects.get(id) } : null; }
    listEffects() { return Array.from(this.effects.values()).map(e => ({ ...e })); }

    applyEffect(effectId, targetId) {
        const effect = this.effects.get(effectId);
        if (!effect) return { success: false, error: 'EFFECT_NOT_FOUND' };
        if (!this.activeEffects.has(targetId)) this.activeEffects.set(targetId, []);
        this.activeEffects.get(targetId).push(effect);
        this.stats.totalApplied++;
        this._triggerHook('effectApplied', { effectId, targetId });
        return { success: true, effect: { ...effect } };
    }

    removeEffect(effectId, targetId) {
        const targetEffects = this.activeEffects.get(targetId);
        if (!targetEffects) return { success: false, error: 'TARGET_NOT_FOUND' };
        const idx = targetEffects.findIndex(e => e.effectId === effectId);
        if (idx < 0) return { success: false, error: 'EFFECT_NOT_ACTIVE' };
        targetEffects.splice(idx, 1);
        this._triggerHook('effectRemoved', { effectId, targetId });
        return { success: true };
    }

    getTargetEffects(targetId) { return this.activeEffects.get(targetId) || []; }

    calculateCombinedEffect(targetId) {
        const effects = this.getTargetEffects(targetId);
        const combined = {};
        for (const effect of effects) {
            for (const [k, v] of Object.entries(effect.modifiers)) {
                combined[k] = (combined[k] || 0) + v;
            }
        }
        return combined;
    }

    getEffectTemplate(id) { return this.effectTemplates.get(id) ? { ...this.effectTemplates.get(id) } : null; }
    listEffectTemplates() { return Array.from(this.effectTemplates.values()).map(t => ({ ...t })); }

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

    autoEvolve() {
        if (this.stats.totalApplied < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseDuration *= 1.5;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { effects: Array.from(this.effects.entries()), effectTemplates: Array.from(this.effectTemplates.entries()), activeEffects: Array.from(this.activeEffects.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.effects) this.effects = new Map(data.effects);
        if (data.effectTemplates) this.effectTemplates = new Map(data.effectTemplates);
        if (data.activeEffects) this.activeEffects = new Map(data.activeEffects);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, effectCount: this.effects.size, templateCount: this.effectTemplates.size }; }
}