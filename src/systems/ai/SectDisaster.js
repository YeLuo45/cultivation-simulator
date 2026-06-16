/**
 * SectDisaster.js - 宗门大劫
 * V391 Iteration 7/9 Round 12
 */
export class SectDisaster {
    constructor(config = {}) {
        this.config = { maxDisasters: config.maxDisasters || 50, baseImpact: config.baseImpact || 100, ...config };
        this.disasters = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDisasters: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDisaster', (ctx) => this.getDisaster(ctx.disasterId));
        this.registerTool('triggerDisaster', (ctx) => this.triggerDisaster(ctx));
    }

    triggerDisaster(data) {
        const id = data.id || `dstr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const disaster = { disasterId: id, sectId: data.sectId, type: data.type || 'invasion', impact: data.impact || this.config.baseImpact, defense: 0, status: 'ongoing', triggeredAt: Date.now() };
        this.disasters.set(id, disaster);
        this.stats.totalDisasters++;
        this._triggerHook('disasterTriggered', { disasterId: id, sectId: data.sectId });
        return { success: true, disaster };
    }

    getDisaster(id) { return this.disasters.get(id) ? { ...this.disasters.get(id) } : null; }
    listDisasters() { return Array.from(this.disasters.values()).map(d => ({ ...d })); }
    listOngoing() { return Array.from(this.disasters.values()).filter(d => d.status === 'ongoing').map(d => ({ ...d })); }
    listBySect(sectId) { return Array.from(this.disasters.values()).filter(d => d.sectId === sectId).map(d => ({ ...d })); }
    listByType(type) { return Array.from(this.disasters.values()).filter(d => d.type === type).map(d => ({ ...d })); }

    contributeDefense(disasterId, amount) {
        const disaster = this.disasters.get(disasterId);
        if (!disaster) return { success: false, error: 'DISASTER_NOT_FOUND' };
        disaster.defense += amount;
        this._triggerHook('defenseContributed', { disasterId, amount });
        if (disaster.defense >= disaster.impact) {
            disaster.status = 'repelled';
            this._triggerHook('disasterRepelled', { disasterId });
        }
        return { success: true };
    }

    endDisaster(disasterId) {
        const disaster = this.disasters.get(disasterId);
        if (!disaster) return { success: false, error: 'DISASTER_NOT_FOUND' };
        disaster.status = 'ended';
        this._triggerHook('disasterEnded', { disasterId });
        return { success: true };
    }

    calculateDefenseRatio(disasterId) {
        const disaster = this.disasters.get(disasterId);
        if (!disaster) return null;
        return disaster.defense / disaster.impact;
    }

    countByStatus(status) { return Array.from(this.disasters.values()).filter(d => d.status === status).length; }

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
        if (this.stats.totalDisasters < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDisasters += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { disasters: Array.from(this.disasters.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.disasters) this.disasters = new Map(data.disasters);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, disasterCount: this.disasters.size }; }
}