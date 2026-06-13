/**
 * CultivationTechnique.js - 修真技法
 * V693 Iteration 16/30 Round 28 - Cultivation Technique
 */
export class CultivationTechnique {
    constructor(config = {}) {
        this.config = { maxTechniques: config.maxTechniques || 30, baseMastery: config.baseMastery || 20, ...config };
        this.techniques = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTechniques: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTechnique', (ctx) => this.getTechnique(ctx.techniqueId));
        this.registerTool('recruitTechnique', (ctx) => this.recruitTechnique(ctx));
    }

    recruitTechnique(data) {
        const id = data.id || `tech_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const technique = { techniqueId: id, masterId: data.masterId, name: data.name || 'Unnamed', type: data.type || 'sword', mastery: data.mastery !== undefined ? data.mastery : this.config.baseMastery, secrets: Array.isArray(data.secrets) ? [...data.secrets] : [], level: data.level || 1, status: data.status || 'novice', recruitedAt: Date.now() };
        this.techniques.set(id, technique);
        this.stats.totalTechniques++;
        this._triggerHook('techniqueRecruited', { techniqueId: id });
        return { success: true, technique };
    }

    getTechnique(id) { return this.techniques.get(id) ? { ...this.techniques.get(id), secrets: [...(this.techniques.get(id).secrets || [])] } : null; }
    listTechniques() { return Array.from(this.techniques.values()).map(t => ({ ...t, secrets: [...(t.secrets || [])] })); }
    listByMaster(masterId) { return Array.from(this.techniques.values()).filter(t => t.masterId === masterId).map(t => ({ ...t, secrets: [...(t.secrets || [])] })); }
    listLegendary() { return Array.from(this.techniques.values()).filter(t => t.status === 'legendary').map(t => ({ ...t, secrets: [...(t.secrets || [])] })); }

    addSecret(techniqueId, secret) {
        const technique = this.techniques.get(techniqueId);
        if (!technique) return { success: false, error: 'TECHNIQUE_NOT_FOUND' };
        technique.secrets.push(secret);
        this._triggerHook('secretAdded', { techniqueId, secret });
        return { success: true };
    }

    raiseMastery(techniqueId, amount = 5) {
        const technique = this.techniques.get(techniqueId);
        if (!technique) return { success: false, error: 'TECHNIQUE_NOT_FOUND' };
        technique.mastery += amount;
        this._triggerHook('masteryRaised', { techniqueId, newMastery: technique.mastery });
        return { success: true };
    }

    levelUpTechnique(techniqueId) {
        const technique = this.techniques.get(techniqueId);
        if (!technique) return { success: false, error: 'TECHNIQUE_NOT_FOUND' };
        technique.level++;
        this._triggerHook('techniqueLeveledUp', { techniqueId, newLevel: technique.level });
        return { success: true };
    }

    legendTechnique(techniqueId) {
        const technique = this.techniques.get(techniqueId);
        if (!technique) return { success: false, error: 'TECHNIQUE_NOT_FOUND' };
        technique.status = 'legendary';
        this._triggerHook('techniqueLegendized', { techniqueId });
        return { success: true };
    }

    calculateTechniqueValue(techniqueId) {
        const technique = this.techniques.get(techniqueId);
        if (!technique) return 0;
        return technique.level * 100 + technique.mastery * 2 + technique.secrets.length * 30;
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
        if (this.stats.totalTechniques < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTechniques += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { techniques: Array.from(this.techniques.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.techniques) this.techniques = new Map(data.techniques);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, techniqueCount: this.techniques.size }; }
}
