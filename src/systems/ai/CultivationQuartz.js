/**
 * CultivationQuartz.js - 修真石英
 * V838 Iteration 11/30 Round 33
 */
export class CultivationQuartz {
    constructor(config = {}) {
        this.config = { maxQuartzes: config.maxQuartzes || 20, baseClarity: config.baseClarity || 20, ...config };
        this.quartzes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalQuartzes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getQuartz', (ctx) => this.getQuartz(ctx.quartzId));
        this.registerTool('recruitQuartz', (ctx) => this.recruitQuartz(ctx));
    }

    recruitQuartz(data) {
        const id = data.quartzId || `qtz_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const quartz = { quartzId: id, masterId: data.masterId, name: data.name || 'Unnamed Quartz', type: data.type || 'rose', clarity: data.clarity || this.config.baseClarity, crystals: data.crystals || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.quartzes.set(id, quartz);
        this.stats.totalQuartzes++;
        this._triggerHook('quartzRecruited', { quartzId: id });
        return { success: true, quartz };
    }

    getQuartz(id) { return this.quartzes.get(id) ? { ...this.quartzes.get(id) } : null; }
    listQuartzes() { return Array.from(this.quartzes.values()).map(q => ({ ...q })); }
    listByMaster(masterId) { return Array.from(this.quartzes.values()).filter(q => q.masterId === masterId).map(q => ({ ...q })); }
    listLegendary() { return Array.from(this.quartzes.values()).filter(q => q.status === 'legendary').map(q => ({ ...q })); }

    addCrystal(quartzId, crystal) {
        const quartz = this.quartzes.get(quartzId);
        if (!quartz) return { success: false, error: 'QUARTZ_NOT_FOUND' };
        quartz.crystals.push(crystal);
        this._triggerHook('crystalAdded', { quartzId, crystal, crystalCount: quartz.crystals.length });
        return { success: true };
    }

    raiseClarity(quartzId, amount = 5) {
        const quartz = this.quartzes.get(quartzId);
        if (!quartz) return { success: false, error: 'QUARTZ_NOT_FOUND' };
        quartz.clarity += amount;
        this._triggerHook('clarityRaised', { quartzId, newClarity: quartz.clarity });
        return { success: true };
    }

    levelUpQuartz(quartzId) {
        const quartz = this.quartzes.get(quartzId);
        if (!quartz) return { success: false, error: 'QUARTZ_NOT_FOUND' };
        quartz.level++;
        this._triggerHook('quartzLeveledUp', { quartzId, newLevel: quartz.level });
        return { success: true };
    }

    legendQuartz(quartzId) {
        const quartz = this.quartzes.get(quartzId);
        if (!quartz) return { success: false, error: 'QUARTZ_NOT_FOUND' };
        quartz.status = 'legendary';
        this._triggerHook('quartzLegendized', { quartzId });
        return { success: true };
    }

    calculateQuartzValue(quartzId) {
        const quartz = this.quartzes.get(quartzId);
        if (!quartz) return 0;
        return quartz.level * 100 + quartz.clarity * 2 + quartz.crystals.length * 30;
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
        if (this.stats.totalQuartzes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxQuartzes += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { quartzes: Array.from(this.quartzes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.quartzes) this.quartzes = new Map(data.quartzes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, quartzCount: this.quartzes.size }; }
}
