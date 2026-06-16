/**
 * SoulRefiningSystem.js - 灵魂修炼
 * V368 Iteration 2/9 Round 10
 */
export class SoulRefiningSystem {
    constructor(config = {}) {
        this.config = { maxRefinements: config.maxRefinements || 100, baseExp: config.baseExp || 5, ...config };
        this.refinements = new Map();
        this.cultivators = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRefinements: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCultivator', (ctx) => this.getCultivator(ctx.cultivatorId));
        this.registerTool('startRefinement', (ctx) => this.startRefinement(ctx.cultivatorId, ctx.method));
    }

    registerCultivator(data) {
        const id = data.id || `cv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cultivator = { cultivatorId: id, name: data.name || 'Anonymous', soulExp: 0, soulLevel: 1, method: null, createdAt: Date.now() };
        this.cultivators.set(id, cultivator);
        return { success: true, cultivator };
    }

    getCultivator(id) { return this.cultivators.get(id) ? { ...this.cultivators.get(id) } : null; }
    listCultivators() { return Array.from(this.cultivators.values()).map(c => ({ ...c })); }

    startRefinement(cultivatorId, method) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        const validMethods = ['meditation', 'induction', 'tantra', 'transcendence'];
        if (!validMethods.includes(method)) return { success: false, error: 'INVALID_METHOD' };
        const id = `ref_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const refinement = { refinementId: id, cultivatorId, method, progress: 0, status: 'in_progress', startedAt: Date.now() };
        this.refinements.set(id, refinement);
        cultivator.method = method;
        this.stats.totalRefinements++;
        this._triggerHook('refinementStarted', { cultivatorId, refinementId: id });
        return { success: true, refinement };
    }

    advanceRefinement(refinementId, effort = 20) {
        const refinement = this.refinements.get(refinementId);
        if (!refinement) return { success: false, error: 'REFINEMENT_NOT_FOUND' };
        if (refinement.status !== 'in_progress') return { success: false, error: 'REFINEMENT_INACTIVE' };
        refinement.progress += effort;
        if (refinement.progress >= 100) return this.completeRefinement(refinementId);
        return { success: true, refinement: { ...refinement } };
    }

    completeRefinement(refinementId) {
        const refinement = this.refinements.get(refinementId);
        if (!refinement) return { success: false, error: 'REFINEMENT_NOT_FOUND' };
        if (refinement.status !== 'in_progress') return { success: false, error: 'REFINEMENT_INACTIVE' };
        const cultivator = this.cultivators.get(refinement.cultivatorId);
        const exp = this.config.baseExp * 2;
        cultivator.soulExp += exp;
        const newLevel = 1 + Math.floor(cultivator.soulExp / 100);
        const leveled = newLevel > cultivator.soulLevel;
        cultivator.soulLevel = newLevel;
        refinement.status = 'completed';
        refinement.expGained = exp;
        this._triggerHook('refinementCompleted', { refinementId, exp });
        if (leveled) this._triggerHook('soulLevelUp', { cultivatorId: refinement.cultivatorId, newLevel });
        return { success: true, refinement: { ...refinement }, cultivator: { ...cultivator } };
    }

    interruptRefinement(refinementId) {
        const refinement = this.refinements.get(refinementId);
        if (!refinement) return { success: false, error: 'REFINEMENT_NOT_FOUND' };
        refinement.status = 'interrupted';
        this._triggerHook('refinementInterrupted', { refinementId });
        return { success: true };
    }

    listMethods() { return ['meditation', 'induction', 'tantra', 'transcendence']; }

    getRefinement(id) { return this.refinements.get(id) ? { ...this.refinements.get(id) } : null; }
    listRefinements() { return Array.from(this.refinements.values()).map(r => ({ ...r })); }
    listByCultivator(cultivatorId) { return Array.from(this.refinements.values()).filter(r => r.cultivatorId === cultivatorId).map(r => ({ ...r })); }
    listByMethod(method) { return Array.from(this.refinements.values()).filter(r => r.method === method).map(r => ({ ...r })); }

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
        if (this.stats.totalRefinements < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseExp += 2;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { refinements: Array.from(this.refinements.entries()), cultivators: Array.from(this.cultivators.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.refinements) this.refinements = new Map(data.refinements);
        if (data.cultivators) this.cultivators = new Map(data.cultivators);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cultivatorCount: this.cultivators.size }; }
}