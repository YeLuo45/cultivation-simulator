/**
 * HeavenResponse.js - 天道感应
 * V392 Iteration 8/9 Round 12
 */
export class HeavenResponse {
    constructor(config = {}) {
        this.config = { maxResponses: config.maxResponses || 100, baseFavor: config.baseFavor || 0, ...config };
        this.responses = new Map();
        this.cultivatorFavor = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalResponses: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getResponse', (ctx) => this.getResponse(ctx.responseId));
        this.registerTool('recordResponse', (ctx) => this.recordResponse(ctx));
    }

    recordResponse(data) {
        const id = data.id || `hr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const response = { responseId: id, cultivatorId: data.cultivatorId, type: data.type || 'blessing', favorDelta: data.favorDelta || 0, message: data.message || '', recordedAt: Date.now() };
        this.responses.set(id, response);
        this.stats.totalResponses++;
        const current = this.cultivatorFavor.get(data.cultivatorId) || this.config.baseFavor;
        this.cultivatorFavor.set(data.cultivatorId, current + (data.favorDelta || 0));
        this._triggerHook('responseRecorded', { responseId: id, cultivatorId: data.cultivatorId });
        return { success: true, response };
    }

    getResponse(id) { return this.responses.get(id) ? { ...this.responses.get(id) } : null; }
    listResponses() { return Array.from(this.responses.values()).map(r => ({ ...r })); }
    listByCultivator(cultivatorId) { return Array.from(this.responses.values()).filter(r => r.cultivatorId === cultivatorId).map(r => ({ ...r })); }
    listByType(type) { return Array.from(this.responses.values()).filter(r => r.type === type).map(r => ({ ...r })); }

    getFavor(cultivatorId) { return this.cultivatorFavor.get(cultivatorId) || 0; }
    listTopFavored(n = 10) {
        return Array.from(this.cultivatorFavor.entries()).sort((a, b) => b[1] - a[1]).slice(0, n).map(([cultivatorId, favor]) => ({ cultivatorId, favor }));
    }

    bestowBlessing(cultivatorId, amount) { return this.recordResponse({ cultivatorId, type: 'blessing', favorDelta: amount }); }
    bestowCurse(cultivatorId, amount) { return this.recordResponse({ cultivatorId, type: 'curse', favorDelta: -amount }); }

    calculateTotalFavor() { return Array.from(this.cultivatorFavor.values()).reduce((s, f) => s + f, 0); }
    calculateAverageFavor() {
        if (this.cultivatorFavor.size === 0) return 0;
        return this.calculateTotalFavor() / this.cultivatorFavor.size;
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

    autoEvolve() {
        if (this.stats.totalResponses < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxResponses += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { responses: Array.from(this.responses.entries()), cultivatorFavor: Array.from(this.cultivatorFavor.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.responses) this.responses = new Map(data.responses);
        if (data.cultivatorFavor) this.cultivatorFavor = new Map(data.cultivatorFavor);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, responseCount: this.responses.size }; }
}