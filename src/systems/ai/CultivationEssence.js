/**
 * CultivationEssence.js - 修真精元系统
 * V727 Iteration 20/30 Round 29 - Cultivation Essence
 */

export class CultivationEssence {
    constructor(config = {}) {
        this.config = { maxEssences: config.maxEssences || 20, baseDensity: config.baseDensity || 20, ...config };
        this.essences = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEssences: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getEssence', (ctx) => this.getEssence(ctx.essenceId));
        this.registerTool('recruitEssence', (ctx) => this.recruitEssence(ctx));
    }

    recruitEssence(data) {
        const id = data.essenceId || `ess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const essence = {
            essenceId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Essence',
            type: data.type || 'core',
            density: data.density || this.config.baseDensity,
            refines: data.refines || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.essences.set(id, essence);
        this.stats.totalEssences++;
        this._triggerHook('essenceRecruited', { essenceId: id });
        return { success: true, essence };
    }

    getEssence(id) { return this.essences.get(id) ? { ...this.essences.get(id) } : null; }
    listEssences() { return Array.from(this.essences.values()).map(e => ({ ...e })); }
    listByMaster(masterId) { return Array.from(this.essences.values()).filter(e => e.masterId === masterId).map(e => ({ ...e })); }
    listLegendary() { return Array.from(this.essences.values()).filter(e => e.status === 'legendary').map(e => ({ ...e })); }

    addRefine(essenceId, refine) {
        const essence = this.essences.get(essenceId);
        if (!essence) return { success: false, error: 'ESSENCE_NOT_FOUND' };
        essence.refines.push(refine);
        this._triggerHook('refineAdded', { essenceId, refine });
        return { success: true, essence: { ...essence } };
    }

    raiseDensity(essenceId, amount = 5) {
        const essence = this.essences.get(essenceId);
        if (!essence) return { success: false, error: 'ESSENCE_NOT_FOUND' };
        essence.density += amount;
        this._triggerHook('densityRaised', { essenceId, newDensity: essence.density });
        return { success: true };
    }

    levelUpEssence(essenceId) {
        const essence = this.essences.get(essenceId);
        if (!essence) return { success: false, error: 'ESSENCE_NOT_FOUND' };
        essence.level++;
        this._triggerHook('essenceLeveledUp', { essenceId, newLevel: essence.level });
        return { success: true };
    }

    legendEssence(essenceId) {
        const essence = this.essences.get(essenceId);
        if (!essence) return { success: false, error: 'ESSENCE_NOT_FOUND' };
        essence.status = 'legendary';
        this._triggerHook('essenceLegendized', { essenceId });
        return { success: true };
    }

    calculateEssenceValue(essenceId) {
        const essence = this.essences.get(essenceId);
        if (!essence) return 0;
        return essence.level * 100 + essence.density * 2 + essence.refines.length * 30;
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
        if (this.stats.totalEssences < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxEssences += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { essences: Array.from(this.essences.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.essences) this.essences = new Map(data.essences);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, essenceCount: this.essences.size }; }
}
