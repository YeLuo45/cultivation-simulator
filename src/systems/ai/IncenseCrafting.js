/**
 * IncenseCrafting.js - 香火制作
 * V506 Iteration 8/20 Round 20
 */
export class IncenseCrafting {
    constructor(config = {}) {
        this.config = { maxIncenses: config.maxIncenses || 200, baseFragrance: config.baseFragrance || 20, ...config };
        this.incenses = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalIncenses: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getIncense', (ctx) => this.getIncense(ctx.incenseId));
        this.registerTool('craftIncense', (ctx) => this.craftIncense(ctx));
    }

    craftIncense(data) {
        const id = data.id || `inc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const incense = { incenseId: id, crafterId: data.crafterId, name: data.name || 'Sacred Incense', type: data.type || 'calming', fragrance: data.fragrance || this.config.baseFragrance, woods: data.woods || [], status: data.status || 'lit', craftedAt: Date.now() };
        this.incenses.set(id, incense);
        this.stats.totalIncenses++;
        this._triggerHook('incenseCrafted', { incenseId: id });
        return { success: true, incense };
    }

    getIncense(id) { return this.incenses.get(id) ? { ...this.incenses.get(id) } : null; }
    listIncenses() { return Array.from(this.incenses.values()).map(i => ({ ...i })); }
    listByCrafter(crafterId) { return Array.from(this.incenses.values()).filter(i => i.crafterId === crafterId).map(i => ({ ...i })); }
    listActive() { return Array.from(this.incenses.values()).filter(i => i.status === 'lit').map(i => ({ ...i })); }

    addWood(incenseId, wood) {
        const incense = this.incenses.get(incenseId);
        if (!incense) return { success: false, error: 'INCENSE_NOT_FOUND' };
        incense.woods.push(wood);
        this._triggerHook('woodAdded', { incenseId, wood });
        return { success: true };
    }

    enrichFragrance(incenseId, amount = 5) {
        const incense = this.incenses.get(incenseId);
        if (!incense) return { success: false, error: 'INCENSE_NOT_FOUND' };
        incense.fragrance += amount;
        this._triggerHook('fragranceEnriched', { incenseId, newFragrance: incense.fragrance });
        return { success: true };
    }

    lightIncense(incenseId) {
        const incense = this.incenses.get(incenseId);
        if (!incense) return { success: false, error: 'INCENSE_NOT_FOUND' };
        incense.status = 'lit';
        this._triggerHook('incenseLit', { incenseId });
        return { success: true };
    }

    extinguishIncense(incenseId) {
        const incense = this.incenses.get(incenseId);
        if (!incense) return { success: false, error: 'INCENSE_NOT_FOUND' };
        incense.status = 'extinguished';
        this._triggerHook('incenseExtinguished', { incenseId });
        return { success: true };
    }

    calculateIncenseAroma(incenseId) {
        const incense = this.incenses.get(incenseId);
        if (!incense) return 0;
        return incense.fragrance * 5 + incense.woods.length * 10;
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
        if (this.stats.totalIncenses < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxIncenses += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { incenses: Array.from(this.incenses.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.incenses) this.incenses = new Map(data.incenses);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, incenseCount: this.incenses.size }; }
}
