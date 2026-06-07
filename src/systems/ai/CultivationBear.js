/**
 * CultivationBear.js - 修真熊
 * V719 Iteration 12/30 Round 29
 */
export class CultivationBear {
    constructor(config = {}) {
        this.config = { maxBears: config.maxBears || 20, baseStrength: config.baseStrength || 20, ...config };
        this.bears = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBears: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBear', (ctx) => this.getBear(ctx.bearId));
        this.registerTool('recruitBear', (ctx) => this.recruitBear(ctx));
    }

    recruitBear(data = {}) {
        const id = data.id || `bear_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const bear = {
            bearId: id,
            masterId: data.masterId || 'unknown',
            name: data.name || 'Unnamed Bear',
            type: data.type || 'brown',
            strength: data.strength || this.config.baseStrength,
            cubs: data.cubs || [],
            level: data.level || 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.bears.set(id, bear);
        this.stats.totalBears++;
        this._triggerHook('bearRecruited', { bearId: id });
        return { success: true, bear };
    }

    getBear(id) { return this.bears.get(id) ? { ...this.bears.get(id) } : null; }
    listBears() { return Array.from(this.bears.values()).map(b => ({ ...b })); }
    listByMaster(masterId) { return Array.from(this.bears.values()).filter(b => b.masterId === masterId).map(b => ({ ...b })); }
    listByType(type) { return Array.from(this.bears.values()).filter(b => b.type === type).map(b => ({ ...b })); }
    listLegendary() { return Array.from(this.bears.values()).filter(b => b.status === 'legendary').map(b => ({ ...b })); }

    addCub(bearId, cub) {
        const bear = this.bears.get(bearId);
        if (!bear) return { success: false, error: 'BEAR_NOT_FOUND' };
        bear.cubs.push(cub);
        this._triggerHook('cubAdded', { bearId, cub });
        return { success: true };
    }

    raiseStrength(bearId, amount = 5) {
        const bear = this.bears.get(bearId);
        if (!bear) return { success: false, error: 'BEAR_NOT_FOUND' };
        bear.strength += amount;
        this._triggerHook('strengthRaised', { bearId, newStrength: bear.strength });
        return { success: true };
    }

    levelUpBear(bearId) {
        const bear = this.bears.get(bearId);
        if (!bear) return { success: false, error: 'BEAR_NOT_FOUND' };
        bear.level++;
        this._triggerHook('bearLeveledUp', { bearId, newLevel: bear.level });
        return { success: true };
    }

    legendBear(bearId) {
        const bear = this.bears.get(bearId);
        if (!bear) return { success: false, error: 'BEAR_NOT_FOUND' };
        bear.status = 'legendary';
        this._triggerHook('bearLegendized', { bearId });
        return { success: true };
    }

    calculateBearValue(bearId) {
        const bear = this.bears.get(bearId);
        if (!bear) return 0;
        return bear.level * 100 + bear.strength * 2 + bear.cubs.length * 30;
    }

    deleteBear(bearId) {
        if (!this.bears.has(bearId)) return { success: false, error: 'BEAR_NOT_FOUND' };
        this.bears.delete(bearId);
        this._triggerHook('bearDeleted', { bearId });
        return { success: true };
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
        if (this.stats.totalBears < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBears += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { bears: Array.from(this.bears.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.bears) this.bears = new Map(data.bears);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, bearCount: this.bears.size }; }
}
