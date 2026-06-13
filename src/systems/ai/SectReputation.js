/**
 * SectReputation.js - 宗门名声系统
 * V493 Iteration 10/15 Round 19
 */
export class SectReputation {
    constructor(config = {}) {
        this.config = { maxReputations: config.maxReputations || 100, baseScore: config.baseScore || 0, ...config };
        this.reputations = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalReputations: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getReputation', (ctx) => this.getReputation(ctx.reputationId));
        this.registerTool('buildReputation', (ctx) => this.buildReputation(ctx));
    }

    buildReputation(data) {
        const id = data.id || `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const reputation = { reputationId: id, sectId: data.sectId, score: data.score || this.config.baseScore, deeds: [], scandals: [], status: 'stable', createdAt: Date.now() };
        this.reputations.set(id, reputation);
        this.stats.totalReputations++;
        this._triggerHook('reputationBuilt', { reputationId: id });
        return { success: true, reputation };
    }

    getReputation(id) { return this.reputations.get(id) ? { ...this.reputations.get(id) } : null; }
    listReputations() { return Array.from(this.reputations.values()).map(r => ({ ...r })); }
    listBySect(sectId) { return Array.from(this.reputations.values()).filter(r => r.sectId === sectId).map(r => ({ ...r })); }
    listRising() { return Array.from(this.reputations.values()).filter(r => r.status === 'rising').map(r => ({ ...r })); }

    addDeed(reputationId, deed) {
        const reputation = this.reputations.get(reputationId);
        if (!reputation) return { success: false, error: 'REPUTATION_NOT_FOUND' };
        reputation.deeds.push(deed);
        this._triggerHook('deedAdded', { reputationId, deed });
        return { success: true };
    }

    addScandal(reputationId, scandal) {
        const reputation = this.reputations.get(reputationId);
        if (!reputation) return { success: false, error: 'REPUTATION_NOT_FOUND' };
        reputation.scandals.push(scandal);
        if (reputation.status !== 'rising') reputation.status = 'tarnished';
        this._triggerHook('scandalAdded', { reputationId, scandal });
        return { success: true };
    }

    raiseScore(reputationId, amount = 10) {
        const reputation = this.reputations.get(reputationId);
        if (!reputation) return { success: false, error: 'REPUTATION_NOT_FOUND' };
        reputation.score += amount;
        if (reputation.status !== 'tarnished') reputation.status = 'rising';
        this._triggerHook('reputationRaised', { reputationId, newScore: reputation.score });
        return { success: true };
    }

    calculateReputationValue(reputationId) {
        const reputation = this.reputations.get(reputationId);
        if (!reputation) return 0;
        return reputation.score + reputation.deeds.length * 5 - reputation.scandals.length * 10;
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
        if (this.stats.totalReputations < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxReputations += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { reputations: Array.from(this.reputations.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.reputations) this.reputations = new Map(data.reputations);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, reputationCount: this.reputations.size }; }
}
