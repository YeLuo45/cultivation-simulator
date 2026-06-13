/**
 * CultivationSymphony.js - 修真交响系统
 * V794 Iteration 27/30 Round 31
 */
export class CultivationSymphony {
    constructor(config = {}) {
        this.config = { maxSymphonies: config.maxSymphonies || 20, baseGrandeur: config.baseGrandeur || 20, ...config };
        this.symphonies = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSymphonies: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSymphony', (ctx) => this.getSymphony(ctx.symphonyId));
        this.registerTool('recruitSymphony', (ctx) => this.recruitSymphony(ctx));
    }

    recruitSymphony(data) {
        const id = data.symphonyId || `symphony_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const symphony = { symphonyId: id, masterId: data.masterId, name: data.name || 'Mystic Symphony', type: data.type || 'grand', grandeur: data.grandeur || this.config.baseGrandeur, movements: data.movements || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.symphonies.set(id, symphony);
        this.stats.totalSymphonies++;
        this._triggerHook('symphonyRecruited', { symphonyId: id });
        return { success: true, symphony };
    }

    getSymphony(id) { return this.symphonies.get(id) ? { ...this.symphonies.get(id) } : null; }
    listSymphonies() { return Array.from(this.symphonies.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.symphonies.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.symphonies.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addMovement(symphonyId, movement) {
        const symphony = this.symphonies.get(symphonyId);
        if (!symphony) return { success: false, error: 'SYMPHONY_NOT_FOUND' };
        symphony.movements.push(movement);
        this._triggerHook('movementAdded', { symphonyId, movement });
        return { success: true };
    }

    raiseGrandeur(symphonyId, amount = 5) {
        const symphony = this.symphonies.get(symphonyId);
        if (!symphony) return { success: false, error: 'SYMPHONY_NOT_FOUND' };
        symphony.grandeur += amount;
        this._triggerHook('grandeurRaised', { symphonyId, newGrandeur: symphony.grandeur });
        return { success: true };
    }

    levelUpSymphony(symphonyId) {
        const symphony = this.symphonies.get(symphonyId);
        if (!symphony) return { success: false, error: 'SYMPHONY_NOT_FOUND' };
        symphony.level++;
        return { success: true };
    }

    legendSymphony(symphonyId) {
        const symphony = this.symphonies.get(symphonyId);
        if (!symphony) return { success: false, error: 'SYMPHONY_NOT_FOUND' };
        symphony.status = 'legendary';
        this._triggerHook('symphonyLegendized', { symphonyId });
        return { success: true };
    }

    calculateSymphonyValue(symphonyId) {
        const symphony = this.symphonies.get(symphonyId);
        if (!symphony) return 0;
        return symphony.level * 100 + symphony.grandeur * 2 + symphony.movements.length * 30;
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
        if (this.stats.totalSymphonies < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSymphonies += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { symphonies: Array.from(this.symphonies.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.symphonies) this.symphonies = new Map(data.symphonies);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, symphonyCount: this.symphonies.size }; }
}
