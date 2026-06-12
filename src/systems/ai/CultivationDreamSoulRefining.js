/**
 * CultivationDreamSoulRefining.js - 修真灵魂淬炼
 * V867 Iteration 1/30 Round 34
 */
export const SOUL_TECHNIQUES = ['soul_purification', 'soul_fission', 'soul_fusion'];
export const IMPURITY_TYPES = ['rage', 'lust', 'greed', 'envy', 'pride'];
export const PURITY_LEVELS = ['tainted', 'cleansed', 'radiant', 'transcendent', 'divine'];

export class CultivationDreamSoulRefining {
    constructor(config = {}) {
        this.config = { maxRefinements: config.maxRefinements || 100, basePurity: config.basePurity ?? 0.1, ...config };
        this.refinements = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRefined: 0, totalPurities: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRefinement', (ctx) => this.getRefinement(ctx.refinementId));
        this.registerTool('listByTechnique', (ctx) => this.listByTechnique(ctx.technique));
    }

    startRefining(dreamId, technique) {
        if (!SOUL_TECHNIQUES.includes(technique)) return { success: false, error: 'INVALID_TECHNIQUE' };
        const id = `refine_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const refinement = {
            id, dreamId, technique,
            purity: this.config.basePurity,
            impurityCount: IMPURITY_TYPES.length,
            refinementCount: 0,
            status: 'in_progress',
            startedAt: Date.now()
        };
        this.refinements.set(id, refinement);
        this.stats.totalRefined++;
        this._triggerHook('refiningStarted', { id, dreamId, technique });
        return { success: true, refinement };
    }

    getRefinement(id) { return this.refinements.get(id) ? { ...this.refinements.get(id) } : null; }
    listRefinements() { return Array.from(this.refinements.values()).map(r => ({ ...r })); }
    listByTechnique(technique) { return Array.from(this.refinements.values()).filter(r => r.technique === technique).map(r => ({ ...r })); }
    listByDream(dreamId) { return Array.from(this.refinements.values()).filter(r => r.dreamId === dreamId).map(r => ({ ...r })); }
    listCompleted() { return Array.from(this.refinements.values()).filter(r => r.status === 'completed').map(r => ({ ...r })); }

    purifySoul(refinementId, impurityType) {
        const refinement = this.refinements.get(refinementId);
        if (!refinement) return { success: false, error: 'REFINEMENT_NOT_FOUND' };
        if (!IMPURITY_TYPES.includes(impurityType)) return { success: false, error: 'INVALID_IMPURITY' };
        refinement.impurityCount = Math.max(0, refinement.impurityCount - 1);
        refinement.purity = Math.min(1, refinement.purity + 0.15);
        refinement.refinementCount++;
        this.stats.totalPurities++;
        this._triggerHook('soulPurified', { refinementId, impurityType });
        return { success: true, purity: refinement.purity, impurityCount: refinement.impurityCount };
    }

    completeRefining(refinementId) {
        const refinement = this.refinements.get(refinementId);
        if (!refinement) return { success: false, error: 'REFINEMENT_NOT_FOUND' };
        refinement.status = 'completed';
        refinement.completedAt = Date.now();
        const levelIndex = Math.min(PURITY_LEVELS.length - 1, Math.floor(refinement.purity * PURITY_LEVELS.length));
        refinement.purityLevel = PURITY_LEVELS[levelIndex];
        this._triggerHook('refiningCompleted', { refinementId });
        return { success: true, refinement };
    }

    raisePurity(refinementId, amount = 0.1) {
        const refinement = this.refinements.get(refinementId);
        if (!refinement) return { success: false, error: 'REFINEMENT_NOT_FOUND' };
        refinement.purity = Math.min(1, refinement.purity + amount);
        return { success: true, purity: refinement.purity };
    }

    getPurityLevel(purity) {
        if (typeof purity !== 'number') return PURITY_LEVELS[0];
        const idx = Math.min(PURITY_LEVELS.length - 1, Math.max(0, Math.floor(purity * PURITY_LEVELS.length)));
        return PURITY_LEVELS[idx];
    }

    deleteRefinement(refinementId) {
        if (!this.refinements.has(refinementId)) return { success: false, error: 'REFINEMENT_NOT_FOUND' };
        this.refinements.delete(refinementId);
        this._triggerHook('refinementDeleted', { refinementId });
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

    toJSON() { return { refinements: Array.from(this.refinements.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.refinements) this.refinements = new Map(data.refinements);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, refinementCount: this.refinements.size }; }
}
