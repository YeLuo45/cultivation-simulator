/**
 * DesertCultivation.js - 沙漠求生系统
 * V466 Iteration 13/15 Round 17
 */
export class DesertCultivation {
    constructor(config = {}) {
        this.config = { maxOases: config.maxOases || 50, baseWater: config.baseWater || 30, ...config };
        this.oases = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalOases: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getOasis', (ctx) => this.getOasis(ctx.oasisId));
        this.registerTool('discoverOasis', (ctx) => this.discoverOasis(ctx));
    }

    discoverOasis(data) {
        const id = data.id || `oas_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const oasis = { oasisId: id, explorerId: data.explorerId, name: data.name || 'Unnamed Oasis', water: this.config.baseWater, sandstorms: 0, ruins: [], relics: [], status: 'peaceful', discoveredAt: Date.now() };
        this.oases.set(id, oasis);
        this.stats.totalOases++;
        this._triggerHook('oasisDiscovered', { oasisId: id });
        return { success: true, oasis };
    }

    getOasis(id) { return this.oases.get(id) ? { ...this.oases.get(id) } : null; }
    listOases() { return Array.from(this.oases.values()).map(o => ({ ...o })); }
    listByExplorer(explorerId) { return Array.from(this.oases.values()).filter(o => o.explorerId === explorerId).map(o => ({ ...o })); }
    listDangerous() { return Array.from(this.oases.values()).filter(o => o.status === 'dangerous').map(o => ({ ...o })); }

    gatherWater(oasisId, amount = 5) {
        const oasis = this.oases.get(oasisId);
        if (!oasis) return { success: false, error: 'OASIS_NOT_FOUND' };
        oasis.water += amount;
        this._triggerHook('waterGathered', { oasisId, amount, totalWater: oasis.water });
        return { success: true };
    }

    endureSandstorm(oasisId) {
        const oasis = this.oases.get(oasisId);
        if (!oasis) return { success: false, error: 'OASIS_NOT_FOUND' };
        oasis.sandstorms += 1;
        oasis.status = 'dangerous';
        this._triggerHook('sandstormEndured', { oasisId, sandstorms: oasis.sandstorms });
        return { success: true };
    }

    exploreRuin(oasisId, ruin) {
        const oasis = this.oases.get(oasisId);
        if (!oasis) return { success: false, error: 'OASIS_NOT_FOUND' };
        oasis.ruins.push(ruin);
        this._triggerHook('ruinExplored', { oasisId, ruin });
        return { success: true };
    }

    findRelic(oasisId, relic) {
        const oasis = this.oases.get(oasisId);
        if (!oasis) return { success: false, error: 'OASIS_NOT_FOUND' };
        oasis.relics.push(relic);
        this._triggerHook('relicFound', { oasisId, relic });
        return { success: true };
    }

    calculateSurvivalPower(oasisId) {
        const oasis = this.oases.get(oasisId);
        if (!oasis) return 0;
        return oasis.water * 2 + oasis.ruins.length * 5 + oasis.relics.length * 10;
    }

    listAbandoned() { return Array.from(this.oases.values()).filter(o => o.status === 'abandoned').map(o => ({ ...o })); }
    listPeaceful() { return Array.from(this.oases.values()).filter(o => o.status === 'peaceful').map(o => ({ ...o })); }

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
        if (this.stats.totalOases < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxOases += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { oases: Array.from(this.oases.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.oases) this.oases = new Map(data.oases);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, oasisCount: this.oases.size }; }
}
