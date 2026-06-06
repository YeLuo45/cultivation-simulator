/**
 * MedicalCultivation.js - 医术修真
 * V455 Iteration 2/15 Round 17
 */
export class MedicalCultivation {
    constructor(config = {}) {
        this.config = { maxTreatments: config.maxTreatments || 200, baseEfficacy: config.baseEfficacy || 20, ...config };
        this.treatments = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTreatments: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTreatment', (ctx) => this.getTreatment(ctx.treatmentId));
        this.registerTool('prescribeTreatment', (ctx) => this.prescribeTreatment(ctx));
    }

    prescribeTreatment(data) {
        const id = data.id || `trt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const treatment = { treatmentId: id, healerId: data.healerId, name: data.name || 'mysterious_remedy', type: data.type || 'healing', efficacy: data.efficacy || this.config.baseEfficacy, ingredients: data.ingredients || [], status: 'prescribing', prescribedAt: Date.now() };
        this.treatments.set(id, treatment);
        this.stats.totalTreatments++;
        this._triggerHook('treatmentPrescribed', { treatmentId: id });
        return { success: true, treatment };
    }

    getTreatment(id) { return this.treatments.get(id) ? { ...this.treatments.get(id) } : null; }
    listTreatments() { return Array.from(this.treatments.values()).map(t => ({ ...t })); }
    listByHealer(healerId) { return Array.from(this.treatments.values()).filter(t => t.healerId === healerId).map(t => ({ ...t })); }
    listByType(type) { return Array.from(this.treatments.values()).filter(t => t.type === type).map(t => ({ ...t })); }

    addIngredient(treatmentId, ingredient) {
        const treatment = this.treatments.get(treatmentId);
        if (!treatment) return { success: false, error: 'TREATMENT_NOT_FOUND' };
        treatment.ingredients.push(ingredient);
        this._triggerHook('ingredientAdded', { treatmentId, ingredient });
        return { success: true, ingredientCount: treatment.ingredients.length };
    }

    refineTreatment(treatmentId, amount = 5) {
        const treatment = this.treatments.get(treatmentId);
        if (!treatment) return { success: false, error: 'TREATMENT_NOT_FOUND' };
        treatment.efficacy += amount;
        this._triggerHook('treatmentRefined', { treatmentId, newEfficacy: treatment.efficacy });
        return { success: true };
    }

    applyTreatment(treatmentId) {
        const treatment = this.treatments.get(treatmentId);
        if (!treatment) return { success: false, error: 'TREATMENT_NOT_FOUND' };
        treatment.status = 'applied';
        this._triggerHook('treatmentApplied', { treatmentId });
        return { success: true };
    }

    calculateMedicalPower(treatmentId) {
        const treatment = this.treatments.get(treatmentId);
        if (!treatment) return 0;
        return treatment.efficacy * (1 + treatment.ingredients.length / 5);
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
        if (this.stats.totalTreatments < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTreatments += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { treatments: Array.from(this.treatments.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.treatments) this.treatments = new Map(data.treatments);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, treatmentCount: this.treatments.size }; }
}
