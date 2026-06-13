/**
 * TeaCultivation.js - 茶道系统
 * V442 Iteration 4/15 Round 16 - Tea Path
 */
export class TeaCultivation {
    constructor(config = {}) {
        this.config = { maxTeas: config.maxTeas || 200, baseAroma: config.baseAroma || 20, ...config };
        this.teas = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTeas: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTea', (ctx) => this.getTea(ctx.teaId));
        this.registerTool('brewTea', (ctx) => this.brewTea(ctx));
    }

    brewTea(data) {
        const id = data.id || `tea_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const tea = { teaId: id, cultivatorId: data.cultivatorId, name: data.name || 'Cloud Mist', type: data.type || 'green', aroma: data.aroma || this.config.baseAroma, flavor: data.flavor || 'fresh', infusions: 0, status: 'brewed', brewedAt: Date.now() };
        this.teas.set(id, tea);
        this.stats.totalTeas++;
        this._triggerHook('teaBrewed', { teaId: id });
        return { success: true, tea };
    }

    getTea(id) { return this.teas.get(id) ? { ...this.teas.get(id) } : null; }
    listTeas() { return Array.from(this.teas.values()).map(t => ({ ...t })); }
    listByType(type) { return Array.from(this.teas.values()).filter(t => t.type === type).map(t => ({ ...t })); }
    listByCultivator(cultivatorId) { return Array.from(this.teas.values()).filter(t => t.cultivatorId === cultivatorId).map(t => ({ ...t })); }

    steepTea(teaId, amount = 5) {
        const tea = this.teas.get(teaId);
        if (!tea) return { success: false, error: 'TEA_NOT_FOUND' };
        tea.infusions += amount;
        this._triggerHook('teaSteeped', { teaId, newInfusions: tea.infusions });
        return { success: true };
    }

    tasteTea(teaId) {
        const tea = this.teas.get(teaId);
        if (!tea) return { success: false, error: 'TEA_NOT_FOUND' };
        tea.status = 'sipped';
        this._triggerHook('teaTasted', { teaId });
        return { success: true };
    }

    finishTea(teaId) {
        const tea = this.teas.get(teaId);
        if (!tea) return { success: false, error: 'TEA_NOT_FOUND' };
        tea.status = 'finished';
        this._triggerHook('teaFinished', { teaId });
        return { success: true };
    }

    calculateTeaAroma(teaId) {
        const tea = this.teas.get(teaId);
        if (!tea) return 0;
        return tea.aroma * (1 + tea.infusions / 10) + tea.flavor.length;
    }

    listAromatic() { return this.listByAroma(50); }

    listByAroma(min) { return Array.from(this.teas.values()).filter(t => t.aroma >= min).map(t => ({ ...t })); }

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
        if (this.stats.totalTeas < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTeas += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { teas: Array.from(this.teas.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.teas) this.teas = new Map(data.teas);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, teaCount: this.teas.size }; }
}
