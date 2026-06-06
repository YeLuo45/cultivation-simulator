/**
 * CultivationTribulation.js - 渡劫系统
 * V519 Iteration 1/20 Round 21
 */
export class CultivationTribulation {
    constructor(config = {}) {
        this.config = { maxTribulations: config.maxTribulations || 100, baseLightning: config.baseLightning || 50, ...config };
        this.tribulations = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTribulations: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTribulation', (ctx) => this.getTribulation(ctx.tribulationId));
        this.registerTool('invokeTribulation', (ctx) => this.invokeTribulation(ctx));
    }

    invokeTribulation(data) {
        const id = data.tribulationId || `ctri_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const tribulation = { tribulationId: id, cultivatorId: data.cultivatorId, name: data.name || 'Heavenly Tribulation', type: data.type || 'heartlight', lightning: data.lightning || this.config.baseLightning, karma: data.karma || 0, level: 1, status: 'imminent', invokedAt: Date.now() };
        this.tribulations.set(id, tribulation);
        this.stats.totalTribulations++;
        this._triggerHook('tribulationInvoked', { tribulationId: id, cultivatorId: data.cultivatorId, type: tribulation.type });
        return { success: true, tribulation };
    }

    getTribulation(id) { return this.tribulations.get(id) ? { ...this.tribulations.get(id) } : null; }
    listTribulations() { return Array.from(this.tribulations.values()).map(t => ({ ...t })); }
    listByCultivator(cultivatorId) { return Array.from(this.tribulations.values()).filter(t => t.cultivatorId === cultivatorId).map(t => ({ ...t })); }
    listActive() { return Array.from(this.tribulations.values()).filter(t => t.status === 'active' || t.status === 'imminent').map(t => ({ ...t })); }

    addLightning(tribulationId, amount = 10) {
        const tribulation = this.tribulations.get(tribulationId);
        if (!tribulation) return { success: false, error: 'TRIBULATION_NOT_FOUND' };
        tribulation.lightning += amount;
        if (tribulation.status === 'imminent') tribulation.status = 'active';
        this._triggerHook('lightningAdded', { tribulationId, amount, totalLightning: tribulation.lightning });
        return { success: true };
    }

    reduceKarma(tribulationId, amount = 5) {
        const tribulation = this.tribulations.get(tribulationId);
        if (!tribulation) return { success: false, error: 'TRIBULATION_NOT_FOUND' };
        tribulation.karma = Math.max(0, tribulation.karma - amount);
        this._triggerHook('karmaReduced', { tribulationId, amount, newKarma: tribulation.karma });
        return { success: true };
    }

    increaseLevel(tribulationId) {
        const tribulation = this.tribulations.get(tribulationId);
        if (!tribulation) return { success: false, error: 'TRIBULATION_NOT_FOUND' };
        tribulation.level++;
        this._triggerHook('levelIncreased', { tribulationId, newLevel: tribulation.level });
        return { success: true };
    }

    surviveTribulation(tribulationId) {
        const tribulation = this.tribulations.get(tribulationId);
        if (!tribulation) return { success: false, error: 'TRIBULATION_NOT_FOUND' };
        tribulation.status = 'survived';
        this._triggerHook('tribulationSurvived', { tribulationId, level: tribulation.level });
        return { success: true };
    }

    calculateTribulationPower(tribulationId) {
        const tribulation = this.tribulations.get(tribulationId);
        if (!tribulation) return 0;
        return tribulation.level * 100 + tribulation.lightning * 2 - tribulation.karma;
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
        if (this.stats.totalTribulations < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTribulations += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { tribulations: Array.from(this.tribulations.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.tribulations) this.tribulations = new Map(data.tribulations);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, tribulationCount: this.tribulations.size }; }
}
