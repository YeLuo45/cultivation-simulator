/**
 * VolcanoCultivation.js - 火山修炼系统
 * V464 Iteration 11/15 Round 17
 */
export class VolcanoCultivation {
    constructor(config = {}) {
        this.config = { maxCraters: config.maxCraters || 50, baseHeat: config.baseHeat || 100, ...config };
        this.craters = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCraters: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCrater', (ctx) => this.getCrater(ctx.craterId));
        this.registerTool('enterCrater', (ctx) => this.enterCrater(ctx));
    }

    enterCrater(data) {
        const id = data.id || `vlc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const crater = { craterId: id, cultivatorId: data.cultivatorId, name: data.name || 'Unnamed Crater', depth: data.depth || 0, heat: data.heat || this.config.baseHeat, magma: data.magma || 0, minerals: data.minerals || [], status: data.status || 'dormant', enteredAt: Date.now() };
        this.craters.set(id, crater);
        this.stats.totalCraters++;
        this._triggerHook('craterEntered', { craterId: id });
        return { success: true, crater };
    }

    getCrater(id) { return this.craters.get(id) ? { ...this.craters.get(id) } : null; }
    listCraters() { return Array.from(this.craters.values()).map(c => ({ ...c })); }
    listByCultivator(cultivatorId) { return Array.from(this.craters.values()).filter(c => c.cultivatorId === cultivatorId).map(c => ({ ...c })); }
    listActive() { return Array.from(this.craters.values()).filter(c => c.status === 'active').map(c => ({ ...c })); }

    deepenCrater(craterId, amount = 10) {
        const crater = this.craters.get(craterId);
        if (!crater) return { success: false, error: 'CRATER_NOT_FOUND' };
        crater.depth += amount;
        this._triggerHook('craterDeepened', { craterId, newDepth: crater.depth });
        return { success: true };
    }

    increaseHeat(craterId, amount = 5) {
        const crater = this.craters.get(craterId);
        if (!crater) return { success: false, error: 'CRATER_NOT_FOUND' };
        crater.heat += amount;
        this._triggerHook('heatIncreased', { craterId, newHeat: crater.heat });
        return { success: true };
    }

    collectMineral(craterId, mineral) {
        const crater = this.craters.get(craterId);
        if (!crater) return { success: false, error: 'CRATER_NOT_FOUND' };
        if (mineral) crater.minerals.push(mineral);
        return { success: true };
    }

    eruptCrater(craterId) {
        const crater = this.craters.get(craterId);
        if (!crater) return { success: false, error: 'CRATER_NOT_FOUND' };
        crater.status = 'erupting';
        this._triggerHook('craterErupted', { craterId });
        return { success: true };
    }

    calculateHeatPower(craterId) {
        const crater = this.craters.get(craterId);
        if (!crater) return 0;
        return crater.heat * (1 + crater.magma / 100) + crater.minerals.length * 5;
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
        if (this.stats.totalCraters < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCraters += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { craters: Array.from(this.craters.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.craters) this.craters = new Map(data.craters);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, craterCount: this.craters.size }; }
}
