/**
 * CultivationSoul.js - 道魂系统
 * V526 Iteration 8/20 Round 21 - Cultivation Soul
 */

export class CultivationSoul {
    constructor(config = {}) {
        this.config = { maxSouls: config.maxSouls || 100, baseEssence: config.baseEssence || 30, ...config };
        this.souls = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSouls: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSoul', (ctx) => this.getSoul(ctx.soulId));
        this.registerTool('birthSoul', (ctx) => this.birthSoul(ctx));
    }

    birthSoul(data) {
        const id = data.soulId || `soul_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const soul = {
            soulId: id,
            cultivatorId: data.cultivatorId,
            name: data.name || 'Unnamed Soul',
            type: data.type || 'true',
            essence: data.essence || this.config.baseEssence,
            fragments: data.fragments || [],
            level: 1,
            status: 'weak',
            createdAt: Date.now()
        };
        this.souls.set(id, soul);
        this.stats.totalSouls++;
        this._triggerHook('soulBirth', { soulId: id });
        return { success: true, soul };
    }

    getSoul(id) { return this.souls.get(id) ? { ...this.souls.get(id) } : null; }
    listSouls() { return Array.from(this.souls.values()).map(s => ({ ...s })); }
    listByCultivator(cultivatorId) { return Array.from(this.souls.values()).filter(s => s.cultivatorId === cultivatorId).map(s => ({ ...s })); }
    listEternal() { return Array.from(this.souls.values()).filter(s => s.status === 'eternal').map(s => ({ ...s })); }

    addFragment(soulId, fragment) {
        const soul = this.souls.get(soulId);
        if (!soul) return { success: false, error: 'SOUL_NOT_FOUND' };
        soul.fragments.push(fragment);
        this._triggerHook('fragmentAdded', { soulId, fragment });
        return { success: true, soul: { ...soul } };
    }

    increaseEssence(soulId, amount = 5) {
        const soul = this.souls.get(soulId);
        if (!soul) return { success: false, error: 'SOUL_NOT_FOUND' };
        soul.essence += amount;
        this._triggerHook('essenceIncreased', { soulId, newEssence: soul.essence });
        return { success: true };
    }

    levelUpSoul(soulId) {
        const soul = this.souls.get(soulId);
        if (!soul) return { success: false, error: 'SOUL_NOT_FOUND' };
        soul.level++;
        this._triggerHook('soulLeveledUp', { soulId, newLevel: soul.level });
        return { success: true };
    }

    eternizeSoul(soulId) {
        const soul = this.souls.get(soulId);
        if (!soul) return { success: false, error: 'SOUL_NOT_FOUND' };
        soul.status = 'eternal';
        this._triggerHook('soulEternalized', { soulId });
        return { success: true };
    }

    calculateSoulPower(soulId) {
        const soul = this.souls.get(soulId);
        if (!soul) return 0;
        return soul.level * 100 + soul.essence * 2 + soul.fragments.length * 30;
    }

    listByType(type) { return Array.from(this.souls.values()).filter(s => s.type === type).map(s => ({ ...s })); }

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
        if (this.stats.totalSouls < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSouls += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { souls: Array.from(this.souls.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.souls) this.souls = new Map(data.souls);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, soulCount: this.souls.size }; }
}
