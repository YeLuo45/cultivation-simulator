/**
 * CultivationTongue.js - 道舌系统
 * V524 Iteration 6/20 Round 21 - Cultivation Tongue
 */

export class CultivationTongue {
    constructor(config = {}) {
        this.config = { maxTongues: config.maxTongues || 50, baseAcuity: config.baseAcuity || 20, ...config };
        this.tongues = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTongues: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTongue', (ctx) => this.getTongue(ctx.tongueId));
        this.registerTool('openTongue', (ctx) => this.openTongue(ctx));
    }

    openTongue(data) {
        const id = data.tongueId || `tng_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const tongue = {
            tongueId: id,
            cultivatorId: data.cultivatorId,
            name: data.name || 'Unnamed Tongue',
            type: data.type || 'heavenly',
            acuity: data.acuity || this.config.baseAcuity,
            flavors: [],
            level: 1,
            status: 'open',
            createdAt: Date.now()
        };
        this.tongues.set(id, tongue);
        this.stats.totalTongues++;
        this._triggerHook('tongueOpened', { tongueId: id });
        return { success: true, tongue };
    }

    getTongue(id) { return this.tongues.get(id) ? { ...this.tongues.get(id) } : null; }
    listTongues() { return Array.from(this.tongues.values()).map(t => ({ ...t })); }
    listByCultivator(cultivatorId) { return Array.from(this.tongues.values()).filter(t => t.cultivatorId === cultivatorId).map(t => ({ ...t })); }
    listAwakened() { return Array.from(this.tongues.values()).filter(t => t.status === 'awakened').map(t => ({ ...t })); }

    addFlavor(tongueId, flavor) {
        const tongue = this.tongues.get(tongueId);
        if (!tongue) return { success: false, error: 'TONGUE_NOT_FOUND' };
        tongue.flavors.push(flavor);
        this._triggerHook('flavorAdded', { tongueId, flavor });
        return { success: true, tongue: { ...tongue } };
    }

    increaseAcuity(tongueId, amount = 5) {
        const tongue = this.tongues.get(tongueId);
        if (!tongue) return { success: false, error: 'TONGUE_NOT_FOUND' };
        tongue.acuity += amount;
        this._triggerHook('acuityIncreased', { tongueId, newAcuity: tongue.acuity });
        return { success: true };
    }

    levelUpTongue(tongueId) {
        const tongue = this.tongues.get(tongueId);
        if (!tongue) return { success: false, error: 'TONGUE_NOT_FOUND' };
        tongue.level++;
        this._triggerHook('tongueLeveledUp', { tongueId, newLevel: tongue.level });
        return { success: true };
    }

    awakenTongue(tongueId) {
        const tongue = this.tongues.get(tongueId);
        if (!tongue) return { success: false, error: 'TONGUE_NOT_FOUND' };
        tongue.status = 'awakened';
        this._triggerHook('tongueAwakened', { tongueId });
        return { success: true };
    }

    calculateTonguePower(tongueId) {
        const tongue = this.tongues.get(tongueId);
        if (!tongue) return 0;
        return tongue.level * 50 + tongue.acuity + tongue.flavors.length * 15;
    }

    listByType(type) { return Array.from(this.tongues.values()).filter(t => t.type === type).map(t => ({ ...t })); }

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
        if (this.stats.totalTongues < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTongues += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { tongues: Array.from(this.tongues.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.tongues) this.tongues = new Map(data.tongues);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, tongueCount: this.tongues.size }; }
}
