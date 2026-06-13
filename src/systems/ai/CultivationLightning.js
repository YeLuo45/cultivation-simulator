/**
 * CultivationLightning.js - 修真电系统
 * V809 Iteration 12/30 Round 32
 */
export class CultivationLightning {
    constructor(config = {}) {
        this.config = { maxLightnings: config.maxLightnings || 20, baseVoltage: config.baseVoltage || 20, ...config };
        this.lightnings = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalLightnings: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getLightning', (ctx) => this.getLightning(ctx.lightningId));
        this.registerTool('recruitLightning', (ctx) => this.recruitLightning(ctx));
    }

    recruitLightning(data) {
        const id = data.id || `ltn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const lightning = { lightningId: id, masterId: data.masterId || null, name: data.name || 'Anonymous', type: data.type || 'forked', voltage: data.voltage || this.config.baseVoltage, strikes: [], level: 1, status: 'novice', createdAt: Date.now() };
        this.lightnings.set(id, lightning);
        this.stats.totalLightnings++;
        this._triggerHook('lightningRecruited', { lightningId: id });
        return { success: true, lightning };
    }

    getLightning(id) { return this.lightnings.get(id) ? { ...this.lightnings.get(id) } : null; }
    listLightnings() { return Array.from(this.lightnings.values()).map(l => ({ ...l })); }
    listByMaster(masterId) { return Array.from(this.lightnings.values()).filter(l => l.masterId === masterId).map(l => ({ ...l })); }
    listLegendary() { return Array.from(this.lightnings.values()).filter(l => l.status === 'legendary').map(l => ({ ...l })); }

    addStrike(lightningId, strike) {
        const lightning = this.lightnings.get(lightningId);
        if (!lightning) return { success: false, error: 'LIGHTNING_NOT_FOUND' };
        lightning.strikes.push(strike);
        this._triggerHook('strikeAdded', { lightningId, strike });
        return { success: true };
    }

    raiseVoltage(lightningId, amount = 5) {
        const lightning = this.lightnings.get(lightningId);
        if (!lightning) return { success: false, error: 'LIGHTNING_NOT_FOUND' };
        lightning.voltage += amount;
        this._triggerHook('voltageRaised', { lightningId, newVoltage: lightning.voltage });
        return { success: true };
    }

    levelUpLightning(lightningId) {
        const lightning = this.lightnings.get(lightningId);
        if (!lightning) return { success: false, error: 'LIGHTNING_NOT_FOUND' };
        lightning.level++;
        if (lightning.level >= 5 && lightning.status === 'novice') lightning.status = 'veteran';
        this._triggerHook('lightningLeveledUp', { lightningId, newLevel: lightning.level });
        return { success: true };
    }

    legendLightning(lightningId) {
        const lightning = this.lightnings.get(lightningId);
        if (!lightning) return { success: false, error: 'LIGHTNING_NOT_FOUND' };
        lightning.status = 'legendary';
        this._triggerHook('lightningLegendized', { lightningId });
        return { success: true };
    }

    calculateLightningValue(lightningId) {
        const lightning = this.lightnings.get(lightningId);
        if (!lightning) return 0;
        return lightning.level * 100 + lightning.voltage * 2 + lightning.strikes.length * 30;
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
        if (this.stats.totalLightnings < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxLightnings += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { lightnings: Array.from(this.lightnings.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.lightnings) this.lightnings = new Map(data.lightnings);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, lightningCount: this.lightnings.size }; }
}
