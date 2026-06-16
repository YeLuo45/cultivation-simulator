/**
 * CultivationCoal.js - 修真煤系统
 * V850 Iteration 23/30 Round 33
 */
export class CultivationCoal {
    constructor(config = {}) {
        this.config = { maxCoals: config.maxCoals || 20, baseHeat: config.baseHeat || 20, ...config };
        this.coals = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCoals: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCoal', (ctx) => this.getCoal(ctx.coalId));
        this.registerTool('recruitCoal', (ctx) => this.recruitCoal(ctx));
    }

    recruitCoal(data) {
        const id = data.id || `col_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const coal = {
            coalId: id,
            masterId: data.masterId || 'unknown_master',
            name: data.name || 'unnamed_coal',
            type: data.type || 'anthracite',
            heat: data.heat || this.config.baseHeat,
            flames: data.flames || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.coals.set(id, coal);
        this.stats.totalCoals++;
        this._triggerHook('coalRecruited', { coalId: id });
        return { success: true, coal };
    }

    getCoal(id) { return this.coals.get(id) ? { ...this.coals.get(id) } : null; }
    listCoals() { return Array.from(this.coals.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.coals.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.coals.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addFlame(coalId, flame) {
        const coal = this.coals.get(coalId);
        if (!coal) return { success: false, error: 'COAL_NOT_FOUND' };
        coal.flames.push(flame);
        if (coal.flames.length >= 5) coal.status = 'veteran';
        this._triggerHook('flameAdded', { coalId, flame });
        return { success: true };
    }

    raiseHeat(coalId, amount = 5) {
        const coal = this.coals.get(coalId);
        if (!coal) return { success: false, error: 'COAL_NOT_FOUND' };
        coal.heat += amount;
        this._triggerHook('heatRaised', { coalId, newHeat: coal.heat });
        return { success: true };
    }

    levelUpCoal(coalId) {
        const coal = this.coals.get(coalId);
        if (!coal) return { success: false, error: 'COAL_NOT_FOUND' };
        coal.level++;
        this._triggerHook('coalLeveledUp', { coalId, newLevel: coal.level });
        return { success: true };
    }

    legendCoal(coalId) {
        const coal = this.coals.get(coalId);
        if (!coal) return { success: false, error: 'COAL_NOT_FOUND' };
        coal.status = 'legendary';
        this._triggerHook('coalLegendized', { coalId });
        return { success: true };
    }

    calculateCoalValue(coalId) {
        const coal = this.coals.get(coalId);
        if (!coal) return 0;
        return coal.level * 100 + coal.heat * 2 + coal.flames.length * 30;
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
        if (this.stats.totalCoals < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCoals += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { coals: Array.from(this.coals.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.coals) this.coals = new Map(data.coals);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, coalCount: this.coals.size }; }
}
