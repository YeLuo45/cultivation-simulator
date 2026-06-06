/**
 * CultivationMethod.js - 道法系统
 * V530 Iteration 12/20 Round 21 - Cultivation Method
 */

export class CultivationMethod {
    constructor(config = {}) {
        this.config = { maxMethods: config.maxMethods || 100, baseEfficacy: config.baseEfficacy || 20, ...config };
        this.methods = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMethods: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMethod', (ctx) => this.getMethod(ctx.methodId));
        this.registerTool('learnMethod', (ctx) => this.learnMethod(ctx));
    }

    learnMethod(data) {
        const id = data.methodId || `mth_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const method = {
            methodId: id,
            cultivatorId: data.cultivatorId,
            name: data.name || 'Unnamed Method',
            type: data.type || 'qi',
            efficacy: data.efficacy || this.config.baseEfficacy,
            mantras: data.mantras || [],
            level: 1,
            status: 'learning',
            createdAt: Date.now()
        };
        this.methods.set(id, method);
        this.stats.totalMethods++;
        this._triggerHook('methodLearned', { methodId: id });
        return { success: true, method };
    }

    getMethod(id) { return this.methods.get(id) ? { ...this.methods.get(id) } : null; }
    listMethods() { return Array.from(this.methods.values()).map(m => ({ ...m })); }
    listByCultivator(cultivatorId) { return Array.from(this.methods.values()).filter(m => m.cultivatorId === cultivatorId).map(m => ({ ...m })); }
    listMastered() { return Array.from(this.methods.values()).filter(m => m.status === 'mastered').map(m => ({ ...m })); }

    addMantra(methodId, mantra) {
        const method = this.methods.get(methodId);
        if (!method) return { success: false, error: 'METHOD_NOT_FOUND' };
        method.mantras.push(mantra);
        this._triggerHook('mantraAdded', { methodId, mantra });
        return { success: true, method: { ...method } };
    }

    increaseEfficacy(methodId, amount = 5) {
        const method = this.methods.get(methodId);
        if (!method) return { success: false, error: 'METHOD_NOT_FOUND' };
        method.efficacy += amount;
        this._triggerHook('efficacyIncreased', { methodId, newEfficacy: method.efficacy });
        return { success: true };
    }

    levelUpMethod(methodId) {
        const method = this.methods.get(methodId);
        if (!method) return { success: false, error: 'METHOD_NOT_FOUND' };
        method.level++;
        this._triggerHook('methodLeveledUp', { methodId, newLevel: method.level });
        return { success: true };
    }

    masterMethod(methodId) {
        const method = this.methods.get(methodId);
        if (!method) return { success: false, error: 'METHOD_NOT_FOUND' };
        method.status = 'mastered';
        this._triggerHook('methodMastered', { methodId });
        return { success: true };
    }

    calculateMethodPower(methodId) {
        const method = this.methods.get(methodId);
        if (!method) return 0;
        return method.level * 100 + method.efficacy * 2 + method.mantras.length * 30;
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
        if (this.stats.totalMethods < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMethods += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { methods: Array.from(this.methods.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.methods) this.methods = new Map(data.methods);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, methodCount: this.methods.size }; }
}
