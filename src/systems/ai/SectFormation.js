/**
 * SectFormation.js - 宗门阵法
 * V480 Iteration 12/15 Round 18
 */
export class SectFormation {
    constructor(config = {}) {
        this.config = { maxFormations: config.maxFormations || 100, baseLevel: config.baseLevel || 1, ...config };
        this.formations = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalFormations: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getFormation', (ctx) => this.getFormation(ctx.formationId));
        this.registerTool('designFormation', (ctx) => this.designFormation(ctx));
    }

    designFormation(data) {
        const id = data.id || `fmn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const formation = { formationId: id, sectId: data.sectId, name: data.name || 'Sect Formation', type: data.type || 'defense', level: data.level || this.config.baseLevel, power: data.power || 0, status: 'drafted', designedAt: Date.now() };
        this.formations.set(id, formation);
        this.stats.totalFormations++;
        this._triggerHook('formationDesigned', { formationId: id });
        return { success: true, formation };
    }

    getFormation(id) { return this.formations.get(id) ? { ...this.formations.get(id) } : null; }
    listFormations() { return Array.from(this.formations.values()).map(f => ({ ...f })); }
    listBySect(sectId) { return Array.from(this.formations.values()).filter(f => f.sectId === sectId).map(f => ({ ...f })); }
    listByType(type) { return Array.from(this.formations.values()).filter(f => f.type === type).map(f => ({ ...f })); }

    empowerFormation(formationId, amount = 5) {
        const formation = this.formations.get(formationId);
        if (!formation) return { success: false, error: 'FORMATION_NOT_FOUND' };
        formation.power += amount;
        this._triggerHook('formationEmpowered', { formationId, newPower: formation.power });
        return { success: true };
    }

    levelUpFormation(formationId) {
        const formation = this.formations.get(formationId);
        if (!formation) return { success: false, error: 'FORMATION_NOT_FOUND' };
        formation.level++;
        this._triggerHook('formationLeveled', { formationId, newLevel: formation.level });
        return { success: true };
    }

    collapseFormation(formationId) {
        const formation = this.formations.get(formationId);
        if (!formation) return { success: false, error: 'FORMATION_NOT_FOUND' };
        formation.status = 'collapsed';
        this._triggerHook('formationCollapsed', { formationId });
        return { success: true };
    }

    calculateFormationPower(formationId) {
        const formation = this.formations.get(formationId);
        if (!formation) return 0;
        return formation.level * 100 + formation.power;
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
        if (this.stats.totalFormations < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxFormations += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { formations: Array.from(this.formations.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.formations) this.formations = new Map(data.formations);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, formationCount: this.formations.size }; }
}
