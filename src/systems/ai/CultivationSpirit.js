/**
 * CultivationSpirit.js - 道灵系统
 * V527 Iteration 9/20 Round 21
 */
export class CultivationSpirit {
    constructor(config = {}) {
        this.config = { maxSpirits: config.maxSpirits || 50, baseQi: config.baseQi || 30, ...config };
        this.spirits = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSpirits: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSpirit', (ctx) => this.getSpirit(ctx.spiritId));
        this.registerTool('awakenSpirit', (ctx) => this.awakenSpirit(ctx));
    }

    awakenSpirit(data) {
        const id = data.id || `spr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const spirit = { spiritId: id, cultivatorId: data.cultivatorId, name: data.name || 'Spirit', type: data.type || 'ancestral', qi: data.qi || this.config.baseQi, channels: data.channels || [], level: 1, status: 'awakened', awakenedAt: Date.now() };
        this.spirits.set(id, spirit);
        this.stats.totalSpirits++;
        this._triggerHook('spiritAwakened', { spiritId: id });
        return { success: true, spirit };
    }

    getSpirit(id) { return this.spirits.get(id) ? { ...this.spirits.get(id) } : null; }
    listSpirits() { return Array.from(this.spirits.values()).map(s => ({ ...s })); }
    listByCultivator(cultivatorId) { return Array.from(this.spirits.values()).filter(s => s.cultivatorId === cultivatorId).map(s => ({ ...s })); }
    listTranscendent() { return Array.from(this.spirits.values()).filter(s => s.status === 'transcendent').map(s => ({ ...s })); }

    addChannel(spiritId, channel) {
        const spirit = this.spirits.get(spiritId);
        if (!spirit) return { success: false, error: 'SPIRIT_NOT_FOUND' };
        if (!spirit.channels.includes(channel)) spirit.channels.push(channel);
        this._triggerHook('channelAdded', { spiritId, channel });
        return { success: true };
    }

    increaseQi(spiritId, amount = 5) {
        const spirit = this.spirits.get(spiritId);
        if (!spirit) return { success: false, error: 'SPIRIT_NOT_FOUND' };
        spirit.qi += amount;
        this._triggerHook('qiIncreased', { spiritId, newQi: spirit.qi });
        return { success: true };
    }

    levelUpSpirit(spiritId) {
        const spirit = this.spirits.get(spiritId);
        if (!spirit) return { success: false, error: 'SPIRIT_NOT_FOUND' };
        spirit.level++;
        this._triggerHook('spiritLeveledUp', { spiritId, newLevel: spirit.level });
        return { success: true };
    }

    transcendSpirit(spiritId) {
        const spirit = this.spirits.get(spiritId);
        if (!spirit) return { success: false, error: 'SPIRIT_NOT_FOUND' };
        spirit.status = 'transcendent';
        this._triggerHook('spiritTranscended', { spiritId });
        return { success: true, spirit: { ...spirit } };
    }

    calculateSpiritPower(spiritId) {
        const spirit = this.spirits.get(spiritId);
        if (!spirit) return 0;
        return spirit.level * 100 + spirit.qi * 2 + spirit.channels.length * 30;
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
        if (this.stats.totalSpirits < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSpirits += 25;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { spirits: Array.from(this.spirits.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.spirits) this.spirits = new Map(data.spirits);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, spiritCount: this.spirits.size }; }
}
