/**
 * SpiritInfusion.js - 灵器附灵系统
 * V511 Iteration 13/20 Round 20
 */
export class SpiritInfusion {
    constructor(config = {}) {
        this.config = { maxInfusions: config.maxInfusions || 100, baseHarmony: config.baseHarmony || 20, ...config };
        this.infusions = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalInfusions: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getInfusion', (ctx) => this.getInfusion(ctx.infusionId));
        this.registerTool('beginInfusion', (ctx) => this.beginInfusion(ctx));
    }

    beginInfusion(data) {
        const id = data.id || `inf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const infusion = {
            infusionId: id,
            masterId: data.masterId || 'unknown_master',
            weaponName: data.weaponName || 'unnamed_weapon',
            spirits: data.spirits || [],
            harmony: data.harmony || this.config.baseHarmony,
            power: data.power || 0,
            status: 'in-progress',
            startedAt: Date.now()
        };
        this.infusions.set(id, infusion);
        this.stats.totalInfusions++;
        this._triggerHook('infusionBegun', { infusionId: id });
        return { success: true, infusion };
    }

    getInfusion(id) { return this.infusions.get(id) ? { ...this.infusions.get(id) } : null; }
    listInfusions() { return Array.from(this.infusions.values()).map(i => ({ ...i })); }
    listByMaster(masterId) { return Array.from(this.infusions.values()).filter(i => i.masterId === masterId).map(i => ({ ...i })); }
    listHarmonized() { return Array.from(this.infusions.values()).filter(i => i.status === 'harmonized').map(i => ({ ...i })); }

    addSpirit(infusionId, spirit) {
        const infusion = this.infusions.get(infusionId);
        if (!infusion) return { success: false, error: 'INFUSION_NOT_FOUND' };
        infusion.spirits.push(spirit);
        this._triggerHook('spiritAdded', { infusionId, spirit });
        return { success: true };
    }

    increaseHarmony(infusionId, amount = 5) {
        const infusion = this.infusions.get(infusionId);
        if (!infusion) return { success: false, error: 'INFUSION_NOT_FOUND' };
        infusion.harmony += amount;
        this._triggerHook('harmonyIncreased', { infusionId, newHarmony: infusion.harmony });
        return { success: true };
    }

    boostPower(infusionId, amount = 10) {
        const infusion = this.infusions.get(infusionId);
        if (!infusion) return { success: false, error: 'INFUSION_NOT_FOUND' };
        infusion.power += amount;
        this._triggerHook('powerBoosted', { infusionId, newPower: infusion.power });
        return { success: true };
    }

    sealInfusion(infusionId) {
        const infusion = this.infusions.get(infusionId);
        if (!infusion) return { success: false, error: 'INFUSION_NOT_FOUND' };
        infusion.status = 'sealed';
        this._triggerHook('infusionSealed', { infusionId });
        return { success: true };
    }

    calculateInfusionValue(infusionId) {
        const infusion = this.infusions.get(infusionId);
        if (!infusion) return 0;
        return infusion.harmony * 2 + infusion.power + infusion.spirits.length * 30;
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
        if (this.stats.totalInfusions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxInfusions += 40;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { infusions: Array.from(this.infusions.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.infusions) this.infusions = new Map(data.infusions);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, infusionCount: this.infusions.size }; }
}
