/**
 * TribulationSystem.js - 渡劫系统
 * V388 Iteration 4/9 Round 12
 */
export class TribulationSystem {
    constructor(config = {}) {
        this.config = { maxTribulations: config.maxTribulations || 100, baseLightningStrikes: config.baseLightningStrikes || 9, ...config };
        this.tribulations = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTribulations: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTribulation', (ctx) => this.getTribulation(ctx.tribulationId));
        this.registerTool('startTribulation', (ctx) => this.startTribulation(ctx));
    }

    startTribulation(data) {
        const id = data.id || `tri_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const tribulation = { tribulationId: id, cultivatorId: data.cultivatorId, realm: data.realm || 'core_formation', lightningStrikes: data.lightningStrikes || this.config.baseLightningStrikes, strikesSurvived: 0, status: 'ongoing', startedAt: Date.now() };
        this.tribulations.set(id, tribulation);
        this.stats.totalTribulations++;
        this._triggerHook('tribulationStarted', { tribulationId: id, cultivatorId: data.cultivatorId });
        return { success: true, tribulation };
    }

    getTribulation(id) { return this.tribulations.get(id) ? { ...this.tribulations.get(id) } : null; }
    listTribulations() { return Array.from(this.tribulations.values()).map(t => ({ ...t })); }
    listOngoing() { return Array.from(this.tribulations.values()).filter(t => t.status === 'ongoing').map(t => ({ ...t })); }
    listByCultivator(cultivatorId) { return Array.from(this.tribulations.values()).filter(t => t.cultivatorId === cultivatorId).map(t => ({ ...t })); }
    listByRealm(realm) { return Array.from(this.tribulations.values()).filter(t => t.realm === realm).map(t => ({ ...t })); }

    surviveStrike(tribulationId) {
        const tribulation = this.tribulations.get(tribulationId);
        if (!tribulation) return { success: false, error: 'TRIBULATION_NOT_FOUND' };
        if (tribulation.status !== 'ongoing') return { success: false, error: 'TRIBULATION_INACTIVE' };
        tribulation.strikesSurvived++;
        this._triggerHook('strikeSurvived', { tribulationId, count: tribulation.strikesSurvived });
        if (tribulation.strikesSurvived >= tribulation.lightningStrikes) {
            tribulation.status = 'passed';
            this._triggerHook('tribulationPassed', { tribulationId });
        }
        return { success: true };
    }

    failTribulation(tribulationId) {
        const tribulation = this.tribulations.get(tribulationId);
        if (!tribulation) return { success: false, error: 'TRIBULATION_NOT_FOUND' };
        tribulation.status = 'failed';
        this._triggerHook('tribulationFailed', { tribulationId });
        return { success: true };
    }

    calculateSurvivalRate(tribulationId) {
        const tribulation = this.tribulations.get(tribulationId);
        if (!tribulation) return null;
        return tribulation.strikesSurvived / tribulation.lightningStrikes;
    }

    countPasses() { return Array.from(this.tribulations.values()).filter(t => t.status === 'passed').length; }
    countFailures() { return Array.from(this.tribulations.values()).filter(t => t.status === 'failed').length; }

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