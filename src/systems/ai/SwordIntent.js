/**
 * SwordIntent.js - 剑意
 * V409 Iteration 1/15 Round 14 - Sword Intent
 */
export class SwordIntent {
    constructor(config = {}) {
        this.config = { maxIntents: config.maxIntents || 100, baseSharpness: config.baseSharpness || 10, ...config };
        this.intents = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalIntents: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getIntent', (ctx) => this.getIntent(ctx.intentId));
        this.registerTool('forgeIntent', (ctx) => this.forgeIntent(ctx));
    }

    forgeIntent(data) {
        const id = data.id || `si_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const intent = { intentId: id, cultivatorId: data.cultivatorId, sharpness: data.sharpness || this.config.baseSharpness, range: data.range || 5, element: data.element || 'none', mastery: 0, status: 'forged', forgedAt: Date.now() };
        this.intents.set(id, intent);
        this.stats.totalIntents++;
        this._triggerHook('intentForged', { intentId: id });
        return { success: true, intent };
    }

    getIntent(id) { return this.intents.get(id) ? { ...this.intents.get(id) } : null; }
    listIntents() { return Array.from(this.intents.values()).map(i => ({ ...i })); }
    listByCultivator(cultivatorId) { return Array.from(this.intents.values()).filter(i => i.cultivatorId === cultivatorId).map(i => ({ ...i })); }
    listByElement(element) { return Array.from(this.intents.values()).filter(i => i.element === element).map(i => ({ ...i })); }
    listBySharpness(min) { return Array.from(this.intents.values()).filter(i => i.sharpness >= min).map(i => ({ ...i })); }

    sharpen(intentId, amount = 5) {
        const intent = this.intents.get(intentId);
        if (!intent) return { success: false, error: 'INTENT_NOT_FOUND' };
        intent.sharpness += amount;
        this._triggerHook('intentSharpened', { intentId, newSharpness: intent.sharpness });
        return { success: true };
    }

    practice(intentId, amount = 5) {
        const intent = this.intents.get(intentId);
        if (!intent) return { success: false, error: 'INTENT_NOT_FOUND' };
        intent.mastery += amount;
        this._triggerHook('intentPracticed', { intentId, newMastery: intent.mastery });
        return { success: true };
    }

    extendRange(intentId, amount = 2) {
        const intent = this.intents.get(intentId);
        if (!intent) return { success: false, error: 'INTENT_NOT_FOUND' };
        intent.range += amount;
        this._triggerHook('intentRangeExtended', { intentId });
        return { success: true };
    }

    calculatePower(intentId) {
        const intent = this.intents.get(intentId);
        if (!intent) return 0;
        return intent.sharpness * (1 + intent.mastery / 100) * intent.range;
    }

    listSharp() { return this.listBySharpness(50); }

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
        if (this.stats.totalIntents < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxIntents += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { intents: Array.from(this.intents.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.intents) this.intents = new Map(data.intents);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, intentCount: this.intents.size }; }
}