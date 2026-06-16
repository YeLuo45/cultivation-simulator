/**
 * CultivationAxeman.js - 修真斧手
 * V620 Iteration 3/30 Round 26
 */
export class CultivationAxeman {
    constructor(config = {}) {
        this.config = { maxAxemen: config.maxAxemen || 50, baseStrength: config.baseStrength || 20, ...config };
        this.axemen = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAxemen: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getAxeman', (ctx) => this.getAxeman(ctx.axemanId));
        this.registerTool('recruitAxeman', (ctx) => this.recruitAxeman(ctx));
    }

    recruitAxeman(data) {
        const id = data.axemanId || `axm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const axeman = {
            axemanId: id,
            trainerId: data.trainerId,
            name: data.name || 'Anonymous Axeman',
            type: data.type || 'double',
            strength: data.strength || this.config.baseStrength,
            axes: data.axes || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.axemen.set(id, axeman);
        this.stats.totalAxemen++;
        this._triggerHook('axemanRecruited', { axemanId: id });
        return { success: true, axeman };
    }

    getAxeman(id) { return this.axemen.get(id) ? { ...this.axemen.get(id) } : null; }
    listAxemen() { return Array.from(this.axemen.values()).map(a => ({ ...a })); }
    listByTrainer(trainerId) { return Array.from(this.axemen.values()).filter(a => a.trainerId === trainerId).map(a => ({ ...a })); }
    listLegendary() { return Array.from(this.axemen.values()).filter(a => a.status === 'legendary').map(a => ({ ...a })); }

    addAxe(axemanId, axe) {
        const axeman = this.axemen.get(axemanId);
        if (!axeman) return { success: false, error: 'AXEMAN_NOT_FOUND' };
        axeman.axes.push(axe);
        this._triggerHook('axeAdded', { axemanId, axe });
        return { success: true };
    }

    buildStrength(axemanId, amount = 5) {
        const axeman = this.axemen.get(axemanId);
        if (!axeman) return { success: false, error: 'AXEMAN_NOT_FOUND' };
        axeman.strength += amount;
        this._triggerHook('strengthBuilt', { axemanId, newStrength: axeman.strength });
        return { success: true };
    }

    levelUpAxeman(axemanId) {
        const axeman = this.axemen.get(axemanId);
        if (!axeman) return { success: false, error: 'AXEMAN_NOT_FOUND' };
        axeman.level++;
        if (axeman.level >= 5 && axeman.status === 'novice') {
            axeman.status = 'veteran';
        }
        this._triggerHook('axemanLeveledUp', { axemanId, newLevel: axeman.level });
        return { success: true };
    }

    legendAxeman(axemanId) {
        const axeman = this.axemen.get(axemanId);
        if (!axeman) return { success: false, error: 'AXEMAN_NOT_FOUND' };
        axeman.status = 'legendary';
        this._triggerHook('axemanLegendized', { axemanId });
        return { success: true };
    }

    calculateAxemanValue(axemanId) {
        const axeman = this.axemen.get(axemanId);
        if (!axeman) return 0;
        return axeman.level * 100 + axeman.strength * 2 + axeman.axes.length * 30;
    }

    listVeterans() { return Array.from(this.axemen.values()).filter(a => a.status === 'veteran').map(a => ({ ...a })); }

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
        if (this.stats.totalAxemen < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxAxemen += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { axemen: Array.from(this.axemen.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.axemen) this.axemen = new Map(data.axemen);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, axemanCount: this.axemen.size }; }
}
